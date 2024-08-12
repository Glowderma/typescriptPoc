import { auth, authLocal } from '../../src/middlewares/auth';
import responseHandler from '../../src/utils/responseHandler';
import jwt from 'jsonwebtoken';
jest.mock('jsonwebtoken');
jest.mock('jwks-rsa', () => () => ({
    getSigningKey: jest.fn().mockResolvedValue({
        getPublicKey: jest.fn().mockReturnValue('publicKey'),
    }),
}));

jest.mock('../../src/utils/responseHandler', () => ({
    unauthorizedErrorHandler: jest.fn(),
}));

describe('Middleware Functions', () => {
    describe('authLocal', () => {
        it('should return unauthorized error if no token received', async () => {
            const req = { headers: { authorization: '' }, body: {} };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            await authLocal(req, res, next);

            expect(responseHandler.unauthorizedErrorHandler).toHaveBeenCalledWith(res, 0, 'No token received.');
            expect(next).not.toHaveBeenCalled();
        });

        it('should allow access if user is not admin and not accessing admin route', async () => {
            const req = { path: '/', headers: { authorization: 'Bearer token' }, body: { isAdmin: false } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            await authLocal(req, res, next);

            expect(next).toHaveBeenCalled();
        });

    });

    describe('auth', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return unauthorized error if no token received', async () => {
            const req = { headers: { authorization: '' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            await auth(req, res, next);

            expect(responseHandler.unauthorizedErrorHandler).toHaveBeenCalledWith(res, 0, 'No token received.');
            expect(next).not.toHaveBeenCalled();
        });

        it('should return unauthorized error if token is invalid', async () => {
            const req = { headers: { authorization: 'Bearer invalidtoken' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            jwt.verify.mockImplementationOnce(() => {
                throw new Error('Invalid token');
            });

            await auth(req, res, next);

            expect(responseHandler.unauthorizedErrorHandler).toHaveBeenCalledWith(res, 0, 'Unable to verify token');
            expect(next).not.toHaveBeenCalled();
        });

        it('should allow access if token is valid', async () => {
            const req = { headers: { authorization: 'Bearer validtoken' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();
            jwt.verify.mockImplementationOnce(() => ({ userId: '123' }));
            await auth(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
