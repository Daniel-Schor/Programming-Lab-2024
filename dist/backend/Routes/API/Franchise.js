import express from 'express';
import client from '../../Config/DatabaseConfig.js';
import QUERIES from '../../Queries/Franchise.js';
import * as dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
router.get('/storeLocations', async (req, res) => {
    try {
        let query = `select "storeID", latitude as lat, longitude as lon from stores`;
        let result = await client.query(query);
        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
router.get('/totalRevenue', async (req, res) => {
    try {
        let date = req.query.date || process.env.DEFAULT_DATE;
        let parameter = [date];
        let query = `Select SUM(total) AS total_revenue
        From "purchase"
        WHERE "purchaseDate" > $1`;
        if (req.query.store) {
            query += ` AND "storeID" = $2`;
            parameter.push(req.query.store);
        }
        let result = await client.query(query, parameter);
        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
router.get('/totalPizzas', async (req, res) => {
    try {
        let date = req.query.date || process.env.DEFAULT_DATE;
        let parameter = [date];
        let query = `Select SUM("nItems") AS total_pizza
        From "purchase"
        WHERE "purchaseDate" > $1`;
        if (req.query.store) {
            query += ` AND "storeID" = $2`;
            parameter.push(req.query.store);
        }
        let result = await client.query(query, parameter);
        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
router.get('/totalOrders', async (req, res) => {
    try {
        let date = req.query.date || process.env.DEFAULT_DATE;
        let parameter = [date];
        let query = `Select COUNT("purchaseID") AS total_orders
        From "purchase"
        WHERE "purchaseDate" > $1`;
        if (req.query.store) {
            query += ` AND "storeID" = $2`;
            parameter.push(req.query.store);
        }
        let result = await client.query(query, parameter);
        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
router.get('/averageOrderValue', async (req, res) => {
    try {
        let date = req.query.date || process.env.DEFAULT_DATE;
        let parameter = [date];
        let query = `Select SUM("total") / COUNT(*) AS average_order_value
        From "purchase"
        WHERE "purchaseDate" > $1`;
        if (req.query.store) {
            console.log(req.query.store);
            query += ` AND "storeID" = $2`;
            parameter.push(req.query.store);
        }
        let result = await client.query(query, parameter);
        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
router.get('/pizzasPerOrder', async (req, res) => {
    try {
        let date = req.query.date || process.env.DEFAULT_DATE;
        let parameter = [date];
        let query = `SELECT SUM("nItems") * 1.0 / COUNT("purchaseID") AS pizzas_order
        FROM "purchase"
        WHERE "purchaseDate" > $1`;
        if (req.query.store) {
            query += ` AND "storeID" = $2`;
            parameter.push(req.query.store);
        }
        let result = await client.query(query, parameter);
        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
router.get('/pizzaSize', async (req, res) => {
    try {
        // Extract date and storeID from query parameters or set default values
        let date = req.query.date || process.env.DEFAULT_DATE;
        let storeID = req.query.store;
        // Initialize parameters array for SQL query
        let parameters = [date];
        // Create base query to count entries by size
        let query = `
        SELECT pr."Size", COUNT(*) AS size_count
        FROM "purchaseItems" pi
        JOIN products pr ON pi."SKU" = pr."SKU"
        JOIN purchase pk ON pi."purchaseID" = pk."purchaseID"
        WHERE DATE(pk."purchaseDate") > $1
        `;
        // Add storeID condition if it is provided in the query parameters
        if (storeID) {
            query += ` AND pk."storeID" = $2`;
            parameters.push(storeID);
        }
        query += ` GROUP BY pr."Size"`;
        let result = await client.query(query, parameters);
        console.log(result.rows);
        res.status(200).json(result.rows);
    }
    catch (err) {
        // Handle any errors that occur during the query execution
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
/**
 * Total Store Revenue Endpoint
 * ----
 * Query Options:
 * <ul>
 *     <li>date: cutOfDate (default 2022-12-01)</li>
 * </ul>
 * ----
 * Example: http://localhost:3000/api/total-store-revenue
 * ----
 * Returns:
 * Total revenue for each store for days between the given date and process.env.CURRENT_DATE.
 * ----
 * Response Format:
 * <pre>
 * {
 *     storeID: {
 *         date: revenue,
 *         'changeValue': float
 *     }
 * }
 * </pre>
 */
router.get('/total-store-revenue', async (req, res) => {
    try {
        function reformat(result, reverse) {
            let stores = {};
            if (reverse) {
                result.rows.reverse();
            }
            result.rows.forEach(element => {
                stores[element.storeID] = element.total_revenue;
            });
            return stores;
        }
        let date = req.query.date || process.env.DEFAULT_DATE;
        let query = QUERIES.TOTAL_STORE_REVNUE;
        let result = await client.query(query, [date]);
        res.status(200).json(reformat(result, JSON.parse(req.query.reverse || true)));
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
/**
 * Revenue Endpoint
 * ----
 * Query Options:
 * <ul>
 *     <li>date: cutOfDate (default 2022-12-01)</li>
 *     <li>best: true/false (default true)</li>
 *     <li>limit: max number of stores to return (default undefined)</li>
 *     <li>store: comma-separated list of storeIDs to return (default all)</li>
 * </ul>
 * ----
 * Example: http://localhost:3000/api/revenue?date=2022-12-01&best=true&store=S486166,S263879,S449313,S799887,S147185,S505400&limit=3
 * ----
 * Returns:
 * Revenue for each store for days between the given date and process.env.CURRENT_DATE, and calculates percentage increase in that timeframe.
 * ----
 * Response Format:
 * <pre>
 * {
 *     storeID: {
 *         date: revenue,
 *         'changeValue': float
 *     }
 * }
 * </pre>
 */
router.get('/revenue', async (req, res) => {
    function revenueChange(cutOFDate, result, best = true, positveWeight = 1.06, negativeWeight = 1.19) {
        let newResult = result;
        let numberChanges = Object.keys(result[Object.keys(result)[0]]).length - 1;
        Object.keys(newResult).forEach(key => {
            let oldElement = cutOFDate;
            Object.keys(newResult[key]).reverse().forEach(element => {
                if (element === cutOFDate) {
                    newResult[key].changeValue = 0;
                }
                else {
                    let currentValue = ((newResult[key][element] - newResult[key][oldElement]) / newResult[key][oldElement]) * 100;
                    let absValue = Math.abs(currentValue);
                    if (absValue !== currentValue) {
                        currentValue = -Math.pow(absValue, negativeWeight);
                    }
                    else {
                        currentValue = Math.pow(absValue, positveWeight);
                    }
                    newResult[key].changeValue += currentValue;
                    oldElement = element;
                }
            });
            if (newResult[key].changeValue < 0) {
                newResult[key].changeValue = -Math.pow(Math.abs(newResult[key].changeValue), negativeWeight);
            }
            else {
                newResult[key].changeValue = Math.pow(newResult[key].changeValue, positveWeight);
            }
            newResult[key].changeValue /= numberChanges;
        });
        // Extract the percentage increases and sort them
        let sortedPercentageIncreases = Object.keys(newResult)
            .map(key => ({
            storeID: key,
            changeValue: newResult[key].changeValue
        }))
            .sort((a, b) => b.changeValue - a.changeValue);
        if (!best) {
            sortedPercentageIncreases = sortedPercentageIncreases.reverse();
        }
        let sortedResult = {};
        sortedPercentageIncreases.forEach(item => {
            sortedResult[item.storeID] = newResult[item.storeID];
        });
        return sortedResult;
    }
    function reformatRevenueQueryResults(result, reverse = false) {
        function reformatDate(result) {
            const formatter = new Intl.DateTimeFormat('en-US', { 'timeZone': TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
            result.forEach(row => {
                const formattedDate = formatter.format(new Date(row.day));
                const [month, day, year] = formattedDate.split('/');
                row.day = `${year}-${month}-${day}`;
            });
        }
        reformatDate(result);
        let stores = {};
        if (reverse) {
            result.reverse();
        }
        result.forEach(element => {
            if (!stores[element.storeID]) {
                stores[element.storeID] = {};
            }
            stores[element.storeID][element.day] = element.sum;
        });
        return stores;
    }
    try {
        let date = req.query.date || process.env.DEFAULT_DATE;
        let query = QUERIES.REVENUE;
        let result = await client.query(query, [date]);
        result = reformatRevenueQueryResults(result.rows, JSON.parse(req.query.reverse || false));
        result = revenueChange(date, result, JSON.parse(req.query.best || true));
        if (req.query.store) {
            Object.keys(result).forEach(store => { if (!req.query.store.includes(store)) {
                delete result[store];
            } });
        }
        if (req.query.limit) {
            let i = 0;
            Object.keys(result).forEach(store => { if (i >= parseInt(req.query.limit)) {
                delete result[store];
            } i++; });
        }
        // OUTDATED
        if (req.query.keys) {
            result = Object.keys(result);
        }
        // ---------
        res.status(200).json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
export default router;
//# sourceMappingURL=Franchise.js.map