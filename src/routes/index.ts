import express, { Router } from 'express';
import { auth1 } from "../controller/index";

const indexRouter: Router = express.Router();
console.log("77")
indexRouter.get('/auth1', auth1);

export default indexRouter;
