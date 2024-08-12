import { Request, Response, NextFunction } from "express";
import responseHandler from "../utils/responseHandler";
import { api } from "../utils/env";
import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";

const adminRoutes = ["/admin"];

interface AuthenticatedRequest extends Request {
    decodedToken?: string | object;
    body: {
        isAdmin?: boolean;
    };
}

const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req?.headers?.authorization ?? null;
        if (!token) {
            return responseHandler.unauthorizedErrorHandler(res, "0", "No token received.");
        }
        const client = jwksRsa({
            jwksUri: api.jwks
        });
        const key = await client.getSigningKey(api.kid);
        const publicKey = key.getPublicKey();
        req.decodedToken = jwt.verify(token.split(' ')[1], publicKey);
        next();
    } catch (error) {
        console.log("token verification error: ", error);
        return responseHandler.unauthorizedErrorHandler(res, "0", "Unable to verify token");
    }
};

const authLocal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    req.body.isAdmin = (/true/i).test(api.isLocalAdmin as any);
    const token = req.headers.authorization ?? '';
    if (!token) {
        return responseHandler.unauthorizedErrorHandler(res, "0", "No token received.");
    }
    if (adminRoutes.includes(req.path) && !req.body.isAdmin) {
        return responseHandler.unauthorizedErrorHandler(res, "0", "You do not have access");
    }
    next();
};

export { auth, authLocal };
