import request from "supertest";
import app from "../../src/app.js";
import expect from "expect";
import * as authMiddleware from "../../src/middlewares/auth.js";
const validToken = 'valid token';

jest.mock("../../src/utils/db.connection", () => {
    const mockQueryResult = {
        rows: [{ id: 1 }],
    };

    return {
        getDbConnectionPool: jest.fn(() => ({
            query: jest.fn().mockResolvedValueOnce(mockQueryResult),
        })),
    };
});
jest.mock("../../src/middlewares/auth.js");

describe("routes", () => {
    afterEach(async () => {
        jest.clearAllMocks();
    });
    test("Testing base path, which should respond with status 200", async () => {
        authMiddleware.authLocal.mockImplementation((req, res, next) => {
            next();
        });
        const response = await request(app).get("/").set('Authorization', validToken);
        expect(response.status).toEqual(200);
    });
});

