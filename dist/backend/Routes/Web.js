import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../src/frontend/views/franchise.html'));
});
router.get('/store', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../src/frontend/views/store.html'));
});
export default router;
//# sourceMappingURL=Web.js.map