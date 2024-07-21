import pkg from 'pg';
import * as dotenv from 'dotenv';
const { Client } = pkg;
dotenv.config();
const DB_PORT = process.env.DB_PORT || 5432;
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'pizza',
    password: 'admin',
    port: DB_PORT,
});
client
    .connect()
    .then(() => {
    console.log('Connected to PostgreSQL database on port:', DB_PORT);
})
    .catch((err) => {
    console.error('Error connecting to PostgreSQL database', err);
});
export default client;
//# sourceMappingURL=DatabaseConfig.js.map