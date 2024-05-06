import express from 'express';
import { readFile } from 'fs/promises';


const app = express();
app.use(express.static('./static'));

// Endpoints liefern Daten im .json format und keine .html-Dateien
// Verschiedene objekte im Frontend greifen per .js auf die Endpoints zu und verarbeiten die Daten 
//      -> somit wird jeweils nur der Inhalt der Objekte geladen und nicht die ganze Seite (Single Page Application)


app.get('/', async (req, res) => {
    try {
        res.status(200).send(await readFile('html/home.html', 'utf-8'));
    } catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

// Beispiel
app.get('/revenue', async (req, res) => {
    try {
        // 1. Aufbau SQL-Request
        //    a. Mit query-Parameter aus req.query als filter
        //    b. Standard filter wenn kein query-Parameter vorhanden
        //    c. 
        // 2. SQL-Request an DB senden
        // 3. Resultat in JSON-Format umwandeln
        // 4. Resultat an Frontend senden

        res.status(200).send(await readFile('html/home.html', 'utf-8'));
    } catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});


app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));
