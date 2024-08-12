import { Request, Response, NextFunction } from 'express';
import { auth, authLocal, verifyAdminRoutes } from '../../src/middlewares/auth';
import responseHandler from '../../src/utils/responseHandler';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import axios from 'axios';

jest.mock('jsonwebtoken');
jest.mock('jwks-rsa', () => () => ({
    getSigningKey: jest.fn().mockResolvedValue({
        getPublicKey: jest.fn().mockReturnValue('publicKey'),
    }),
}));
jest.mock('axios');
jest.mock('../../src/utils/responseHandler', () => ({
    unauthorizedErrorHandler: jest.fn(),
}));

describe('Middleware Functions', () => {
    describe('auth', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return unauthorized error if no token received', async () => {
            const req = {
                headers: { authorization: '' }
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            await auth(req, res, next);

            expect(responseHandler.unauthorizedErrorHandler).toHaveBeenCalledWith(res, '0', 'No token received.');
            expect(next).not.toHaveBeenCalled();
        });

        it('should return unauthorized error if token verification fails', async () => {
            const req = {
                headers: { authorization: 'Bearer invalidtoken' }
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            jwt.verify.mockImplementationOnce(() => {
                throw new Error('Invalid token');
            });

            await auth(req, res, next);

            expect(responseHandler.unauthorizedErrorHandler).toHaveBeenCalledWith(res, '0', 'Unable to verify token');
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next if token is valid', async () => {
            const req = {
                headers: { authorization: 'Bearer validtoken' }
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            jwt.verify.mockImplementationOnce(() => ({ userId: '123' }));

            await auth(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('authLocal', () => {
        it('should return unauthorized error if no token received', async () => {
            const req = {
                headers: { authorization: '' },
                body: {}
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            await authLocal(req, res, next);

            expect(responseHandler.unauthorizedErrorHandler).toHaveBeenCalledWith(res, '0', 'No token received.');
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next if token is present', async () => {
            const req = {
                headers: { authorization: 'Bearer token' },
                body: {}
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            await authLocal(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('verifyAdminRoutes', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should call next if route is not admin route', async () => {
            const req = {
                path: '/some-non-admin-route',
                headers: { authorization: 'Bearer token' },
                body: {}
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            await verifyAdminRoutes(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.body.isAdmin).toBe(false);
        });

        it('should return unauthorized error if admin route and token verification fails', async () => {
            const req = {
                path: '/api/csv',
                headers: { authorization: 'Bearer invalidtoken' },
                body: {}
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            axios.get.mockRejectedValueOnce(new Error('Invalid token'));

            await verifyAdminRoutes(req, res, next);

            expect(responseHandler.unauthorizedErrorHandler).toHaveBeenCalledWith(res, '0', 'Unable to verify token or admin status');
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next if admin route and token is valid', async () => {
            const req = {
                path: '/api/csv',
                headers: { authorization: 'Bearer validtoken' },
                body: {}
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            axios.get.mockResolvedValueOnce({ data: { userId: '123', isAdmin: true } });

            await verifyAdminRoutes(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });
});
