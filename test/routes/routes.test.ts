import { Request, Response } from 'express';
import axios from 'axios';
import responseHandler from '../../src/utils/responseHandler';
import { auth1 } from '../../src/controller/index'; 
import{api } from '../../src/utils/env'

jest.mock('axios');
jest.mock('../../src/utils/responseHandler');

describe('auth1', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    const mockedResponseHandler = responseHandler as jest.Mocked<typeof responseHandler>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call successHandler with the access token if the request is successful', async () => {
        const req = {} as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const mockAccessToken = 'mockAccessToken';
        mockedAxios.post.mockResolvedValue({
            data: { access_token: mockAccessToken }
        });

        await auth1(req, res);

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `https://${api.auth_domain}/oauth/token`, 
            {
                grant_type: 'client_credentials',
                client_id: api.auth_client_id,
                client_secret: api.auth_client_secret,
                audience: api.auth_audience,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        expect(mockedResponseHandler.successHandler).toHaveBeenCalledWith(
            res, 
            '1', 
            'Welcome', 
            mockAccessToken
        );
    });

    it('should return an error if the request fails', async () => {
        const req = {} as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const mockError = {
            response: {
                status: 400,
                data: 'Invalid request'
            }
        };
        mockedAxios.post.mockRejectedValue(mockError);

        await auth1(req, res);

        expect(mockedAxios.post).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request' });
    });

    it('should return a generic error if the error response does not contain status or data', async () => {
        const req = {} as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const mockError = {};
        mockedAxios.post.mockRejectedValue(mockError);

        await auth1(req, res);

        expect(mockedAxios.post).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
    });
});
