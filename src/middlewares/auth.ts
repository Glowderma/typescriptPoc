import { Request, Response, NextFunction } from "express";
import responseHandler from "../utils/responseHandler";

import { api } from "../utils/env";
import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import axios from "axios";

const adminRoutes: string[] = [
    "/api/csv"
    
];

const audUrl: string[] = ["https://clouce.us.auth0.com/userinfo"];



const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization ?? null;
        if (!token) {
            return responseHandler.unauthorizedErrorHandler(res, "0", "No token received.");
        }

        const client = jwksRsa({
            jwksUri: api.jwks
        });
        const key = await client.getSigningKey(api.kid);
        const publicKey = key.getPublicKey();

        req = jwt.verify(token.split(' ')[1], publicKey) as any;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return responseHandler.unauthorizedErrorHandler(res, "0", "Unable to verify token");
    }
};

const authLocal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.body.isAdmin = api.isLocalAdmin;
    const token = req.headers.authorization;
    if (!token) {
        return responseHandler.unauthorizedErrorHandler(res, "0", "No token received.");
    }
    
    next();
};

const verifyAdminRoutes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (adminRoutes.includes(req.path)) {
        try {
            const userInfoUri = audUrl[0];
            
            await axios.get(userInfoUri, {
                headers: { "Authorization": req.headers.authorization || "" }
            });

            
                next();
            
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Admin verification or Token error:`, error);
            return responseHandler.unauthorizedErrorHandler(res, "0", "Unable to verify token or admin status");
        }
    } else {
        req.body.isAdmin = false;
        next();
    }
};

export { auth, authLocal, verifyAdminRoutes };
