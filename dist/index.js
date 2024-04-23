import express from 'express';
import { readFile } from 'fs/promises';
const app = express();
app.use(express.static('./static'));
app.get('/', async (req, res) => {
    try {
        res.status(200).send(await readFile('html/home.html', 'utf-8'));
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));
//# sourceMappingURL=index.js.map