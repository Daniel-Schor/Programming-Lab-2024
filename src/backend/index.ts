import app from './Config/serverConfig.js';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.WEB_PORT || 3000;

app.listen(PORT, () => console.log(`App available on http://localhost:${PORT}`));
