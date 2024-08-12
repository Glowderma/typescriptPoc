import { Response } from 'express';

interface ApiResponse {
    statusId: string;
    message: string;
    resbody: any;
}

export default {
    successHandler: async (
        res: Response,
        statusId: string = "1",
        message: string = "Operation successful",
        data: any = null
    ): Promise<void> => {
        const response: ApiResponse = {
            statusId,
            message,
            resbody: data,
        };
        res.status(200).json(response);
    },

    clientErrorHandler: async (
        res: Response,
        statusId: string = "0",
        message: string = "Operation failed"
    ): Promise<void> => {
        const response: ApiResponse = {
            statusId,
            message,
            resbody: null,
        };
        res.status(400).json(response);
    },

    serverErrorHandler: async (
        res: Response,
        statusId: string = "0",
        message: string = "Something went wrong.."
    ): Promise<void> => {
        const response: ApiResponse = {
            statusId,
            message,
            resbody: null,
        };
        res.status(500).json(response);
    },

    unauthorizedErrorHandler: async (
        res: Response,
        statusId: string = "0",
        message: string = "invalid token"
    ): Promise<void> => {
        const response: ApiResponse = {
            statusId,
            message,
            resbody: null,
        };
        res.status(401).json(response);
    },
};
