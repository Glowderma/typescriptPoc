import { Pool } from "pg";
import { db } from "./env";

let connectionPool: Pool | null = null;

const getDbConnectionPool = (): Pool => {
    if (!connectionPool) {
        connectionPool = new Pool(db);
    }
    return connectionPool;
};

export {
    getDbConnectionPool
};
