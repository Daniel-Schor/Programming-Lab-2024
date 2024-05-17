import express from 'express';
import client from './connector.js';
import queries from './queries.json' assert { type: 'json' };

const defaultDate = "2022-12-01";

const app = express();
app.use(express.static('./static'));

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

app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));