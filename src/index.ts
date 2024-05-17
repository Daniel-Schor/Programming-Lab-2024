import express from 'express';
import client from './connector.js';
import queries from './queries.json' assert { type: 'json' };
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const defaultDate = "2022-12-01";

const app: express = express();
app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000' // replace with the origin of your client
  }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/test.html'));
});

// Get specified stores
app.get('/revenue', async (req, res) => {
    try {
        let query: string = queries.revenue;

        let cutOfDate: string = req.query.date || defaultDate;
        let store: string = req.query.store || "";
        let stores: string[] = store.split(",");

        let result = await client.query(query, [cutOfDate, stores]);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

// XXX NOT NEEDED
// Get all stores or specified stores
app.get('/revenue2', async (req, res) => {
    try {
        let conditions: string[] = [req.query.date || defaultDate];
        let query: string;

        if (req.query.store) {
            query = queries.revenue;
            conditions.push(req.query.store.split(","));
        } else {
            query = queries.revenue2;
        }

        let result = await client.query(query, conditions);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

// Customer quality
app.get('/quality', async (req, res) => {
    try {
        // - Compare order count to customer count
        //   - (Problem: some customers could order a lot)
        // - Get one-time customers
        // - Get customers who have ordered more than x times
        // 
        // Make score based on these (or more) factors, compare to other stores and make a percantage compared to best score

        /*let query: string = queries.quality;

        let result = await client.query(query);

        res.status(200).json(result.rows);*/

        res.status(200).json([{ "score": 12345, "percentage": 70, "avgOrderPerCustomer": 3, "oneTimeCustomer": 12, "loyalCustomer": 30 }]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));