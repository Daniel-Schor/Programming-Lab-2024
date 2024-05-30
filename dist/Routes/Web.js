import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
router.get('/mapTestCustomers', (req, res) => {
    res.sendFile(path.join(__dirname, '../../html/mapCustomers.html'));
});
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../html/company.html'));
});
router.get('/individualStore', (req, res) => {
    res.sendFile(path.join(__dirname, '../../html/individualStore.html'));
});
router.get('/mapTest', (req, res) => {
    res.sendFile(path.join(__dirname, '../../html/mapStores.html'));
});
export default router;
//# sourceMappingURL=Web.js.map