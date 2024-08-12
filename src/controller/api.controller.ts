import { Request, Response } from 'express';
import { createObjectCsvWriter } from 'csv-writer'
import responseHandler from '../utils/responseHandler';
import {userSchema} from '../schema/schema'
import { addRecord} from '../service/index';
import path from 'path';
import fs from 'fs'
const responseMessages = {
  CsvCreated : "CSV file written successfully.",
  CsvError:"Error writing CSV file",
  serverError:"Failing at server"
};
export const addCsv = async (req: Request, res: Response): Promise<void> => {
    try {
        const csvWriter = createObjectCsvWriter({
          path: path.resolve(__dirname, '../../../data.csv'),  // Resolving the path to the CSV file
          header: [
            { id: 'name', title: 'Name' },
            { id: 'age', title: 'Age' },
            { id: 'city', title: 'City' }
          ]
        });
    
        // Sample data to be written to the CSV file
        const data = [
          { name: 'John Doe', age: 30, city: 'New York' },
          { name: 'Jane Smith', age: 25, city: 'Los Angeles' },
          { name: 'Sam Johnson', age: 40, city: 'Chicago' }
        ];
    
        // Check if file already exists
        if (fs.existsSync(path.resolve(__dirname, 'data.csv'))) {
          fs.unlinkSync(path.resolve(__dirname, 'data.csv')); // Remove existing file
        }
    
       await csvWriter.writeRecords(data);
          return responseHandler.successHandler(res, "200", responseMessages.CsvCreated);
      } catch (error: any) {
        console.error('Error writing CSV file:', error.message);
        return responseHandler.successHandler(res, "500", responseMessages.CsvError);
      }
};

export const addData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body as { name: string; email: any };
    console.log(req.body,"bbbbbbbbbbbb1")
    const { error } = userSchema.validate(req.body);
    console.log(error,"---------------")
    if (error) {
      return responseHandler.clientErrorHandler(res, "0", `Validation error: ${error.details[0].message}`);
  }
    const db_res = await addRecord({ name, email });
    return responseHandler.successHandler(res, "1", "Added goal successfully", db_res.rows);
  
    
  } catch (error: any) {
    console.error("Catch block error in /addOrganizationGoal API:", error);

    if (error?.detail && /^(?=.*goal)(?=.*already)(?=.*exists.)/i.test(error.detail)) {
      responseMessages.serverError = "Duplicate goal received.";
    }

    return responseHandler.serverErrorHandler(res, "0", responseMessages.serverError);
  }
};