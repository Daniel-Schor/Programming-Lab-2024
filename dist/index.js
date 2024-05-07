// Endpoints liefern Daten im .json format und keine .html-Dateien
// Verschiedene objekte im Frontend greifen per .js auf die Endpoints zu und verarbeiten die Daten 
//      -> somit wird jeweils nur der Inhalt der Objekte geladen und nicht die ganze Seite (Single Page Application)
// function to get date from 30 days ago ago in format yyyy-mm-dd
import express from 'express';
import pkg from 'pg';
const { Client } = pkg;
// TODO export everything that has nothing to do with Endpoints to separate file
// Database connection
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'pizza',
    password: 'admin',
    port: 5432,
});
const defaultDate = "2022-12-01";
client
    .connect()
    .then(() => {
    console.log('Connected to PostgreSQL database');
})
    .catch((err) => {
    console.error('Error connecting to PostgreSQL database', err);
});
// Database connection end
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
        let query = `
                    SELECT "storeID", "purchaseDate"::DATE AS day, SUM("total") AS sum
                    FROM purchase 
                    WHERE \"purchaseDate\" >= $1 
                    GROUP BY "storeID", day
                    ORDER BY day DESC
                    `;
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