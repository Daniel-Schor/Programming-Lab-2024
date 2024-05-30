import cors from 'cors';
import express from 'express';
import webRoute from '../Routes/Web.js';
import franchiseRoute from '../Routes/API/Franchise.js';
import storeRoute from '../Routes/API/Store.js';
const app = express();
app.use("/static", express.static('./static/'));
app.use(cors({
    origin: 'http://localhost:3000' // replace with the origin of your client
}));
app.use('/', webRoute);
app.use('/api/', franchiseRoute);
app.use('/api/', storeRoute);
export default app;
//# sourceMappingURL=serverConfig.js.map