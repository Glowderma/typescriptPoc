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
const axios_1 = __importDefault(require("axios"));
const responseHandler_1 = __importDefault(require("../../src/utils/responseHandler"));
const index_1 = require("../../src/controller/index");
const env_1 = require("../../src/utils/env");
jest.mock('axios');
jest.mock('../../src/utils/responseHandler');
describe('auth1', () => {
    const mockedAxios = axios_1.default;
    const mockedResponseHandler = responseHandler_1.default;
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should call successHandler with the access token if the request is successful', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockAccessToken = 'mockAccessToken';
        mockedAxios.post.mockResolvedValue({
            data: { access_token: mockAccessToken }
        });
        yield (0, index_1.auth1)(req, res);
        expect(mockedAxios.post).toHaveBeenCalledWith(`https://${env_1.api.auth_domain}/oauth/token`, {
            grant_type: 'client_credentials',
            client_id: env_1.api.auth_client_id,
            client_secret: env_1.api.auth_client_secret,
            audience: env_1.api.auth_audience,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        expect(mockedResponseHandler.successHandler).toHaveBeenCalledWith(res, '1', 'Welcome', mockAccessToken);
    }));
    it('should return an error if the request fails', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockError = {
            response: {
                status: 400,
                data: 'Invalid request'
            }
        };
        mockedAxios.post.mockRejectedValue(mockError);
        yield (0, index_1.auth1)(req, res);
        expect(mockedAxios.post).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request' });
    }));
    it('should return a generic error if the error response does not contain status or data', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockError = {};
        mockedAxios.post.mockRejectedValue(mockError);
        yield (0, index_1.auth1)(req, res);
        expect(mockedAxios.post).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
    }));
});
