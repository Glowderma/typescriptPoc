//import express from 'express';
// import indexRouter from './routes/index.js';
// import {auth, authLocal, verifyAdminRoutes} from "./middlewares/auth.js";
// //import cors from "cors";
// import {api} from "./utils/env.js";
// import assetRouter from "./routes/asset.routes.js";
// import rateLimit from 'express-rate-limit';


//const app = express();
//app.disable("x-powered-by");

// const corsOptions = {
//     origin: ['https://p360-staging-web-xrmnq.ondigitalocean.app', 'https://p360-prod-web-pwye6.ondigitalocean.app', 'https://p360.clouce.com']
// };
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// const rateLimiterUsingThirdParty = rateLimit({
//     windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
//     max: 10000,
//     message: 'You have exceeded the 10000 requests in 24 hrs limit!', 
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// app.use(rateLimiterUsingThirdParty);

// if(api.nodeEnv !== "local" && api.nodeEnv !== "test") {
//     app.use(auth);
//    // app.use(verifyAdminRoutes);
// } else {
//     app.use(authLocal);
// }

// app.use('/', indexRouter);
// app.use('/assets', assetRouter);

// app.all('*', function (req, res) {
//     res.status(404).json({
//         statusId : "0",
//         message : req.method + " to " + req.url + " does not exist",
//         resbody : null
//     });
// });


// export default app;


import express, { Request, Response } from "express";
const app = express();
import indexRouter from './routes/index';
import {auth, authLocal} from "./middlewares/auth";
import {api} from "./utils/env";
//import assetRouter from "./routes/asset.routes";
import rateLimit from 'express-rate-limit';
//import dotenv from "dotenv";
//import axios from "axios";

import cors from "cors";
//import { Pool } from "pg";
//import winston from "winston";
//import cron from "node-cron";
//import jwt from "jsonwebtoken";
//import jwksRsa from "jwks-rsa";
//import Joi from "joi";
//import path from "path";
//import fs from "fs";
//import { createObjectCsvWriter } from "csv-writer";
//dotenv.config();

//const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: false }));


const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 2, // limit each IP to 100 requests per windowMs
  message: "Too many login attempts from this IP, please try again later.",
});
app.use(limiter);
if(api.nodeEnv !== "local" && api.nodeEnv !== "test") {
    app.use(auth);
   // app.use(verifyAdminRoutes);
} else {
    app.use(authLocal);
}

app.use('/', indexRouter);
//app.use('/assets', assetRouter);

app.all('*', function (req, res) {
    res.status(404).json({
        statusId : "0",
        message : req.method + " to " + req.url + " does not exist",
        resbody : null
    });
});


export default app;