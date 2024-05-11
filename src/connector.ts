import pkg from 'pg';
const { Client } = pkg;


const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'pizza',
    password: 'admin',
    port: 5432,
});

client
	.connect()
	.then(() => {
		console.log('Connected to PostgreSQL database');
	})
	.catch((err) => {
		console.error('Error connecting to PostgreSQL database', err);
	});

export default client;
