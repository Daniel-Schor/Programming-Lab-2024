import cors from 'cors';
import express from 'express';

const app: express.Application = express();
app.use("/static", express.static('./static/'));

app.use(cors({
    origin: 'http://localhost:3000' // replace with the origin of your client
}));

export default app;
