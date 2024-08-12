"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../src/middlewares/auth");
const responseHandler_1 = __importDefault(require("../../src/utils/responseHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
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
        it('should return unauthorized error if no token received', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                headers: { authorization: '' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            yield (0, auth_1.auth)(req, res, next);
            expect(responseHandler_1.default.unauthorizedErrorHandler).toHaveBeenCalledWith(res, '0', 'No token received.');
            expect(next).not.toHaveBeenCalled();
        }));
        it('should return unauthorized error if token verification fails', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                headers: { authorization: 'Bearer invalidtoken' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            jsonwebtoken_1.default.verify.mockImplementationOnce(() => {
                throw new Error('Invalid token');
            });
            yield (0, auth_1.auth)(req, res, next);
            expect(responseHandler_1.default.unauthorizedErrorHandler).toHaveBeenCalledWith(res, '0', 'Unable to verify token');
            expect(next).not.toHaveBeenCalled();
        }));
        it('should call next if token is valid', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                headers: { authorization: 'Bearer validtoken' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            jsonwebtoken_1.default.verify.mockImplementationOnce(() => ({ userId: '123' }));
            yield (0, auth_1.auth)(req, res, next);
            expect(next).toHaveBeenCalled();
        }));
    });
    describe('authLocal', () => {
        it('should return unauthorized error if no token received', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                headers: { authorization: '' },
                body: {}
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            yield (0, auth_1.authLocal)(req, res, next);
            expect(responseHandler_1.default.unauthorizedErrorHandler).toHaveBeenCalledWith(res, '0', 'No token received.');
            expect(next).not.toHaveBeenCalled();
        }));
        it('should call next if token is present', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                headers: { authorization: 'Bearer token' },
                body: {}
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            yield (0, auth_1.authLocal)(req, res, next);
            expect(next).toHaveBeenCalled();
        }));
    });
    describe('verifyAdminRoutes', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it('should call next if route is not admin route', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                path: '/some-non-admin-route',
                headers: { authorization: 'Bearer token' },
                body: {}
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            yield (0, auth_1.verifyAdminRoutes)(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(req.body.isAdmin).toBe(false);
        }));
        it('should return unauthorized error if admin route and token verification fails', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                path: '/api/csv',
                headers: { authorization: 'Bearer invalidtoken' },
                body: {}
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            axios_1.default.get.mockRejectedValueOnce(new Error('Invalid token'));
            yield (0, auth_1.verifyAdminRoutes)(req, res, next);
            expect(responseHandler_1.default.unauthorizedErrorHandler).toHaveBeenCalledWith(res, '0', 'Unable to verify token or admin status');
            expect(next).not.toHaveBeenCalled();
        }));
        it('should call next if admin route and token is valid', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                path: '/api/csv',
                headers: { authorization: 'Bearer validtoken' },
                body: {}
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            axios_1.default.get.mockResolvedValueOnce({ data: { userId: '123', isAdmin: true } });
            yield (0, auth_1.verifyAdminRoutes)(req, res, next);
            expect(next).toHaveBeenCalled();
        }));
    });
});
