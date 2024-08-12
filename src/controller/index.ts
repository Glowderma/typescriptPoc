import { Request, Response } from 'express';
import responseHandler from '../utils/responseHandler';

export const auth = async (req: Request, res: Response): Promise<void> => {
    try {
        const response = await axios.post(`https://${auth0Domain}/oauth/token`, {
          grant_type: 'client_credentials',
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: process.env.AUTH0_AUDIENCE
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        const { access_token } = response.data;
        responseHandler.successHandler(access_token, "1", "Welcome", null);
        res.json({ access_token });
      } catch (error: any) {
        
          
          res.status(error.response.status).json({ error: error.response.data });
        
      }
    responseHandler.successHandler(res, "1", "Welcome", null);
};
