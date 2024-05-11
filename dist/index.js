import express from 'express';
import client from './connector.js';
import queries from './queries.json' assert { type: 'json' };
const defaultDate = "2022-12-01";
const app = express();
app.use(express.static('./static'));
// Endpoints -----------------------------------------------------
// Beispiel
app.get('/bsp', async (req, res) => {
    try {
        let bsp = [
            {
                id: "1",
                description: 'Aufbau SQL-Request',
            },
            {
                id: "1a",
                description: 'Mit query-Parameter aus req.query als filter',
            },
            {
                id: "1b",
                description: 'Standard filter wenn kein query-Parameter vorhanden',
            },
            {
                id: "2",
                description: 'SQL-Request an DB senden',
            },
            {
                id: "3",
                description: 'Resultat in JSON-Format umwandeln',
            },
            {
                id: "4",
                description: 'Resultat an Frontend senden',
            }
        ];
        res.status(200).json(bsp);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
// Revenue
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
//# sourceMappingURL=index.js.map