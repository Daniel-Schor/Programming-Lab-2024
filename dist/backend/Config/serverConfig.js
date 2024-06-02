import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import webRoute from '../Routes/Web.js';
import franchiseRoute from '../Routes/API/Franchise.js';
import storeRoute from '../Routes/API/Store.js';
// This is a workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
//app.use("/static", express.static(path.join(__dirname, '../../../src/frontend/public')));
// TODO try migrating to dist and typescript in frontend
app.use("/static", express.static(path.join(__dirname, '../../../dist/frontend/public/')));
app.use(cors({
    origin: 'http://localhost:3000' // replace with the origin of your client
}));
app.use('/', webRoute);
app.use('/api/', franchiseRoute);
app.use('/api/', storeRoute);
export default app;
//# sourceMappingURL=serverConfig.js.map