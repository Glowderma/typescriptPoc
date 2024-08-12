import express from 'express';
import {
    
    addCsv,addData
    
} from "../controller/api.controller";
const assetRouter = express.Router();

assetRouter.post('/csv', addCsv);
assetRouter.post('/add', addData);



export default assetRouter;
