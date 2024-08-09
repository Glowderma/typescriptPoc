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
const supertest_1 = __importDefault(require("supertest"));
const axios_1 = __importDefault(require("axios"));
const index_js_1 = __importDefault(require("./index.js")); // Adjust the import path if necessary
describe('GET /auth', () => {
    it('should return an access token', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockResponse = { data: { access_token: 'mock_access_token' } };
        jest.spyOn(axios_1.default, 'post').mockResolvedValue(mockResponse);
        const response = yield (0, supertest_1.default)(index_js_1.default).get('/auth');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('access_token', 'mock_access_token');
    }));
    it('should return an error if Auth0 request fails', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.spyOn(axios_1.default, 'post').mockRejectedValue({ response: { status: 401, data: 'Unauthorized' } });
        const response = yield (0, supertest_1.default)(index_js_1.default).get('/auth');
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Unauthorized');
    }));
});
