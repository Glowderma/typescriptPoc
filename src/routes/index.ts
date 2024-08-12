import express, { Router } from 'express';
import { auth } from "../controller/index";

const indexRouter: Router = express.Router();

indexRouter.get('/auth', auth);

export default indexRouter;
