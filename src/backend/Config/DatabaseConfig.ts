import pkg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();
const { Client } = pkg;

// Environment variables with defaults
const DB_PORT = Number(process.env.DB_PORT) || 5432;
const DB_HOST = process.env.DB_HOST; // || 'localhost';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'admin';
const DB_NAME = process.env.DB_NAME || 'pizza';

let client;

while (true) {
  try {
    client = new Client({
      user: DB_USER,
      host: DB_HOST,
      database: DB_NAME,
      password: DB_PASSWORD,
      port: DB_PORT,
    });

    await client.connect();
    console.log(`✅ Connected to PostgreSQL at ${DB_HOST}:${DB_PORT}`);
    break; // Exit the loop on successful connection

  } catch (err) {
    console.error(`❌ DB connection failed. Retrying in 3s... (${err.code})`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

export default client;
