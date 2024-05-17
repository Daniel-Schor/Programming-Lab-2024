import express from 'express';
import client from './connector.js';
import queries from './queries.json' assert { type: 'json' };
const defaultDate = "2022-12-01";
const app = express();
app.use(express.static('./static'));
app.get('/revenue', async (req, res) => {
    try {
        let conditions = [req.query.date || defaultDate];
        let query;
        // if store/s is provided, only display revenue for those stores
        if (req.query.store) {
            query = queries.revenues;
            conditions.push(req.query.store.split(","));
            // else display revenue for all stores
        }
        else {
            query = queries.revenue;
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
//# sourceMappingURL=index.js.map