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
    user: 'your_database_user',
    host: 'localhost',
    database: 'your_database_name',
    password: 'your_database_password',
    port: 5432,
});
client
    .connect()
    .then(() => {
    console.log('Connected to PostgreSQL database');
})
    .catch((err) => {
    // TODO change when Database is running
    console.log('Not Connected');
    //console.error('Error connecting to PostgreSQL database', err);
});
// Database connection end
// Functions
function defaultDate() {
    // TODO hardcode date to be the last entry in the database
    let date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
}
// Functions end
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
        // TODO build correct SQL request
        let query = "SELECT * FROM revenue WHERE date >= $1 ORDER BY date DESC;";
        let dropOffDate = req.query.date || defaultDate();
        // TODO uncomment when Database is running
        let result = null; //await client.query(query, dropOffDate);
        // sample data in JSON format
        let sampleData = [
            {
                id: 0,
                date: dropOffDate,
                revenue: 500,
                description: "drop-off date"
            },
            {
                id: 1,
                date: "2023-04-01",
                revenue: 1000
            },
            {
                id: 2,
                date: "2023-04-02",
                revenue: 1500
            }
        ];
        res.status(200).json(result || sampleData);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));
//# sourceMappingURL=index.js.map