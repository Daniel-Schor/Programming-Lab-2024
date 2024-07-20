import app from './Config/serverConfig.js';
import * as dotenv from 'dotenv';

dotenv.config();

app.listen(process.env.PORT || 3000, () => console.log(`App available on http://localhost:${process.env.PORT ? process.env.PORT : 3000}`));
