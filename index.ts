
import express, { Request, Response } from 'express';
const app = express();


import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors'
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import winston from 'winston';
import cron from 'node-cron';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import Joi from 'joi';
import path from 'path';
import fs from 'fs'
import { createObjectCsvWriter } from 'csv-writer';
dotenv.config();

const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 2, // limit each IP to 100 requests per windowMs
  message: 'Too many login attempts from this IP, please try again later.',
});
app.use('/validate', limiter);

const pool = new Pool({
  connectionString: process.env.DB_URL
});

cron.schedule('* * * * *', () => {
  console.log('Running a task every minute');
});
// Example route using Joi for validation
app.post('/validate', (req: Request, res: Response) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  res.send('Validation successful');
});
//running postgreas
const checkConnectionAndCreateTable = async () => {
  try {
    // Check connection
    const client = await pool.connect();
    logger.info('Connected to the database successfully.');

    // Create table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE
      );
    `;

    await client.query(createTableQuery);
    logger.info('Table created successfully or already exists.');

    client.release();
  } catch (err) {
    console.error('Error connecting to the database or creating table:', err);

  };
}

checkConnectionAndCreateTable();

//logger

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});


app.use(express.json());

//Auth0 configuration
const auth0Domain = process.env.AUTH0_DOMAIN!;

// Endpoint to get access token using client credentials flow
app.get('/auth', async (req: Request, res: Response) => {
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
    res.json({ access_token });
  } catch (error: any) {
    
      
      res.status(error.response.status).json({ error: error.response.data });
    
  }
});

app.post('/csv', async (req: Request, res: Response) => {
  try {
    const csvWriter = createObjectCsvWriter({
      path: path.resolve(__dirname, 'data.csv'),  // Resolving the path to the CSV file
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
    console.log('CSV file written successfully.');

    res.status(200).json({ message: 'CSV file written successfully.' });
  } catch (error: any) {
    console.error('Error writing CSV file:', error.message);
    res.status(500).json({ error: 'Error writing CSV file' });
  }
});
// Example route using axios and JWT
app.get('/protected', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const client = jwksRsa({
      jwksUri: "https://clouce.us.auth0.com/.well-known/jwks.json",
    });
    console.log(client, "yyyyyyyy")

    const key = await client.getSigningKey("JvByYHoKWNqL_Bu8VMpa2");
    const publicKey = key.getPublicKey();

    const decodedToken = jwt.verify(token, publicKey);

    const response = await axios.get('https://clouce.us.auth0.com/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("res", response)
    res.json({ data: response.data, user: decodedToken });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
})
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
})

export default app;
