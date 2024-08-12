import { Pool, QueryResult } from 'pg'; // Assuming you're using 'pg' for database connection
import { getDbConnectionPool } from "../utils/db.connection";
import queries from "../utils/querries";

interface AddRecordParams {
    name: string;
    email: string;
}

export const addRecord = async function ({ name, email }: AddRecordParams): Promise<QueryResult<any>> {
    return new Promise((resolve, reject) => {
        const pool: Pool = getDbConnectionPool();
        pool.query(queries.addRecord, [name, email])
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
