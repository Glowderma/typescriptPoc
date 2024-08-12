import * as dotenv from 'dotenv';
dotenv.config();
interface ApiConfig {
    nodeEnv: string;
    port: number;
    isLocalAdmin: boolean;
    kid: string;
    jwks: string;
    auth_domain:string;
    auth_client_id:string;
    auth_client_secret:string;
    auth_audience:string;
}

interface DbConfig {
    host: string | undefined;
    database: string | undefined;
    password: string | undefined;
    user: string | undefined;
    dbport: string | undefined;
    ssl?: {
        rejectUnauthorized: boolean;
        ca: string | undefined;
    };
}

// Helper function to convert environment variables to numbers
const parseNumber = (value: string | undefined, defaultValue: number): number => {
    const parsed = parseInt(value ?? '', 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

const api: ApiConfig = {
    nodeEnv: process.env.NODE_ENV || "local",
    port: parseNumber(process.env.PORT, 3000), // Convert PORT to number
    isLocalAdmin: process.env.IS_LOCAL_ADMIN === 'true', // Convert to boolean
    kid: process.env.KID || "JvByYHoKWNqL_Bu8VMpa2",
    jwks: process.env.JWKS_URI || "https://clouce.us.auth0.com/.well-known/jwks.json",
    auth_domain:process.env.AUTH0_DOMAIN|| 'dev-cgzvaazjknmag3js.us.auth0.com',
    auth_client_id:process.env.AUTH0_CLIENT_ID||'12nXvgjhh02OYhNezTbUVb7VpGiTRTHT',
    auth_client_secret:process.env.AUTH0_CLIENT_SECRET|| 'v9nifYeI28XYL-LA8XysMSSS5vwj-7JYDrkKMdaztSuuVp3EzfaQP0RTwUJIYlnB',
    auth_audience:process.env.AUTH0_AUDIENCE|| 'https://dev-cgzvaazjknmag3js.us.auth0.com/api/v2/'
};

let db: DbConfig = {
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    user: process.env.PGUSER,
    dbport: process.env.PGPORT,// Convert PGPORT to number, allow undefined
};
if (api.nodeEnv !== "local") {
    db = {
        ...db,
        ssl: {
            rejectUnauthorized: false,
            ca: process.env.CA_CERT,
        },
    };
}

export { api, db };
