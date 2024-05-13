import express from 'express';
import client from './connector.js';
import queries from './queries.json' assert { type: 'json' };

const defaultDate = "2022-12-01";

const app = express();
app.use(express.static('./static'));

app.get('/revenue', async (req, res) => {
    try {
        // ">=" or ">" and how bout timezones?
        let query = queries.revenue;
        let dropOffDate = req.query.date || defaultDate;

        let result = await client.query(query, [dropOffDate]);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));