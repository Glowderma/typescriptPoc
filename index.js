"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const pg_1 = require("pg");
const winston_1 = __importDefault(require("winston"));
const node_cron_1 = __importDefault(require("node-cron"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const joi_1 = __importDefault(require("joi"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const csv_writer_1 = require("csv-writer");
dotenv_1.default.config();
const port = process.env.PORT;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minutes
    max: 2, // limit each IP to 100 requests per windowMs
    message: 'Too many login attempts from this IP, please try again later.',
});
app.use('/validate', limiter);
const pool = new pg_1.Pool({
    connectionString: process.env.DB_URL
});
node_cron_1.default.schedule('* * * * *', () => {
    console.log('Running a task every minute');
});
// Example route using Joi for validation
app.post('/validate', (req, res) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().min(3).required(),
        email: joi_1.default.string().email().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    res.send('Validation successful');
});
//running postgreas
const checkConnectionAndCreateTable = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check connection
        const client = yield pool.connect();
        logger.info('Connected to the database successfully.');
        // Create table if it doesn't exist
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE
      );
    `;
        yield client.query(createTableQuery);
        logger.info('Table created successfully or already exists.');
        client.release();
    }
    catch (err) {
        console.error('Error connecting to the database or creating table:', err);
    }
    ;
});
checkConnectionAndCreateTable();
//logger
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.json(),
    transports: [
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: 'combined.log' }),
    ],
});
app.use(express_1.default.json());
//Auth0 configuration
const auth0Domain = process.env.AUTH0_DOMAIN;
// Endpoint to get access token using client credentials flow
app.get('/auth', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post(`https://${auth0Domain}/oauth/token`, {
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
    }
    catch (error) {
        res.status(error.response.status).json({ error: error.response.data });
    }
}));
app.post('/csv', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: path_1.default.resolve(__dirname, 'data.csv'), // Resolving the path to the CSV file
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
        if (fs_1.default.existsSync(path_1.default.resolve(__dirname, 'data.csv'))) {
            fs_1.default.unlinkSync(path_1.default.resolve(__dirname, 'data.csv')); // Remove existing file
        }
        yield csvWriter.writeRecords(data);
        console.log('CSV file written successfully.');
        res.status(200).json({ message: 'CSV file written successfully.' });
    }
    catch (error) {
        console.error('Error writing CSV file:', error.message);
        res.status(500).json({ error: 'Error writing CSV file' });
    }
}));
// Example route using axios and JWT
app.get('/protected', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const client = (0, jwks_rsa_1.default)({
            jwksUri: "https://clouce.us.auth0.com/.well-known/jwks.json",
        });
        console.log(client, "yyyyyyyy");
        const key = yield client.getSigningKey("JvByYHoKWNqL_Bu8VMpa2");
        const publicKey = key.getPublicKey();
        const decodedToken = jsonwebtoken_1.default.verify(token, publicKey);
        const response = yield axios_1.default.get('https://clouce.us.auth0.com/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log("res", response);
        res.json({ data: response.data, user: decodedToken });
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
}));
app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
});
exports.default = app;
