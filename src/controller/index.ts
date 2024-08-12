import { Request, Response } from 'express';
import responseHandler from '../utils/responseHandler';
import { api } from '../utils/env';
import axios from 'axios';
console.log("api",api)
export const auth1 = async (req: Request, res: Response): Promise<void> => {
    console.log("123")
    try {
        console.log("1234")
        const response = await axios.post(`https://${api.auth_domain}/oauth/token`, {
            grant_type: 'client_credentials',
            client_id: api.auth_client_id,
            client_secret: api.auth_client_secret,
            audience: api.auth_audience,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
       console.log(response)
        const { access_token } = response.data;
        responseHandler.successHandler(res, "1", "Welcome", access_token);
    } catch (error: any) {
        const status = error.response?.status || 500;
        const message = error.response?.data || 'Something went wrong';
        res.status(status).json({ error: message });
    }
};
