import pkg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();
const { Client } = pkg;
// Environment variables with defaults
const DB_PORT = Number(process.env.DB_PORT) || 5432;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'admin';
const DB_NAME = process.env.DB_NAME || 'pizza';
const client = new Client({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
});
client
    .connect()
    .then(() => {
    console.log(`✅ Connected to PostgreSQL at ${DB_HOST}:${DB_PORT}`);
})
    .catch((err) => {
    console.error('❌ Error connecting to PostgreSQL database', err);
});
export default client;
//# sourceMappingURL=DatabaseConfig.js.map