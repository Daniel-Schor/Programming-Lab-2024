import express from 'express';
import client from '../../Config/DatabaseConfig.js';
import QUERIES from '../../Queries/Franchise.js';
import * as dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
// TODO move to General.ts
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
router.get('/pizzaSize', async (req, res) => {
    try {
        // Extract date and storeID from query parameters or set default values
        let date = req.query.date || process.env.DEFAULT_DATE;
        let storeID = req.query.store;
        // Initialize parameters array for SQL query
        let parameters = [date];
        // Create base query to count entries by size
        let query = `
        SELECT pr."Name", pr."Size", COUNT(*) AS size_count
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
        query += ` GROUP BY pr."Size", pr."Name"`;
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
//is not used becaus vegie pizza is overall on all stores the most popular
router.get('/region-total-product', async (req, res) => {
    try {
        let query = `
        SELECT 
            S."state",S."city",PR."Name" AS PRODUCT_NAME,SUM(P."nItems") AS TOTAL_QUANTITY 
        FROM 
            PURCHASE P 
        JOIN 
            "purchaseItems" PI ON P."purchaseID" = PI."purchaseID" 
        JOIN 
            PRODUCTS PR ON PI."SKU" = PR."SKU" 
        JOIN 
            STORES S ON P."storeID" = S."storeID" 
        GROUP BY 
            S."state",S."city",PR."Name" 
        ORDER BY 
            S."state",S."city",TOTAL_QUANTITY DESC;`;
        let result = await client.query(query);
        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
router.get('/pizzaPopularity', async (req, res) => {
    try {
        // Extract date and storeID from query parameters or set default values
        let date = req.query.date || process.env.DEFAULT_DATE;
        let storeID = req.query.store;
        // Initialize parameters array for SQL query
        let parameters = [date];
        // Create base query to sum revenue by product name and date
        let query = `
        SELECT pr."Name", DATE(pk."purchaseDate") AS "purchaseDate", SUM(pr."Price") AS revenue
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
        query += ` GROUP BY DATE(pk."purchaseDate"),pr."Name"`;
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
router.get('/revenue-forecast-analysis', async (req, res) => {
    try {
        const startDate = '2020-01-01'; // You can change this if needed
        let query = `
        SELECT 
            DATE_TRUNC('month', "purchaseDate") as period, 
            SUM(total) as revenue
        FROM 
            purchase
        WHERE 
            "purchaseDate" >= $1
        GROUP BY 
            period
        ORDER BY 
            period;`;
        const parameters = [startDate];
        const result = await client.query(query, parameters);
        const formattedData = result.rows.map(row => ({
            period: row.period,
            revenue: row.revenue
        }));
        res.status(200).json({ data: formattedData });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/totalOrders', async (req, res) => {
    try {
        let date = req.query.date || process.env.DEFAULT_DATE;
        let parameter = [date];
        let query = `SELECT COUNT("purchaseID") AS total_orders
                     FROM "purchase"
                     WHERE "purchaseDate" > $1`;
        if (req.query.store) {
            query += ` AND "storeID" = $2`;
            parameter.push(req.query.store);
        }
        let result = await client.query(query, parameter);
        res.status(200).json(result.rows[0]);
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
        let query = `SELECT SUM(total) AS total_revenue
                     FROM "purchase"
                     WHERE "purchaseDate" > $1`;
        if (req.query.store) {
            query += ` AND "storeID" = $2`;
            parameter.push(req.query.store);
        }
        let result = await client.query(query, parameter);
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
router.get('/totalCustomers', async (req, res) => {
    try {
        let date = req.query.date || process.env.DEFAULT_DATE;
        let parameter = [date];
        let query = `
            SELECT COUNT(DISTINCT "customerID") AS total_customers
            FROM "purchase"
            WHERE "purchaseDate" > $1`;
        if (req.query.store) {
            query += ` AND "storeID" = $2`;
            parameter.push(req.query.store);
        }
        let result = await client.query(query, parameter);
        res.status(200).json(result.rows[0]);
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
        let query = `SELECT COUNT(*) AS "total_pizzas_sold"
                     FROM "purchaseItems"
                     JOIN "purchase" ON "purchaseItems"."purchaseID" = "purchase"."purchaseID"
                     WHERE "purchase"."purchaseDate" > $1`;
        if (req.query.store) {
            query += ` AND "purchase"."storeID" = $2`;
            parameter.push(req.query.store);
        }
        let result = await client.query(query, parameter);
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
router.get('/averageOrderCustomer', async (req, res) => {
    try {
        let date = req.query.date || process.env.DEFAULT_DATE;
        let parameter = [date];
        let query = `SELECT ROUND(AVG("order_count"), 2) AS "avg_orders_per_customer"
                     FROM (
                         SELECT "customerID", COUNT(*) AS "order_count"
                         FROM "purchase"
                         WHERE "purchaseDate" > $1`;
        if (req.query.store) {
            query += ` AND "storeID" = $2`;
            parameter.push(req.query.store);
        }
        query += ` GROUP BY "customerID"
                     ) AS "customer_orders"`;
        let result = await client.query(query, parameter);
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
router.get('/averageOrderValueCustomer', async (req, res) => {
    try {
        let date = req.query.date || process.env.DEFAULT_DATE;
        let parameter = [date];
        let query = `SELECT ROUND(AVG("total_order_value" / "order_count"), 2) AS "avg_order_value_per_order"
                     FROM (
                         SELECT "customerID", SUM("total") AS "total_order_value", COUNT(*) AS "order_count"
                         FROM "purchase"
                         WHERE "purchaseDate" > $1`;
        if (req.query.store) {
            query += ` AND "storeID" = $2`;
            parameter.push(req.query.store);
        }
        query += ` GROUP BY "customerID"
                     ) AS "customer_order_values"`;
        let result = await client.query(query, parameter);
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
router.get('/averagePizzasPerOrderCustomer', async (req, res) => {
    try {
        let date = req.query.date || process.env.DEFAULT_DATE;
        let parameter = [date];
        let query = `SELECT AVG("pizzas_per_order") AS "avg_pizzas_per_order"
                     FROM (
                         SELECT "purchase"."customerID", "purchase"."purchaseID", COUNT("purchaseItems"."SKU") AS "pizzas_per_order"
                         FROM "purchase"
                         JOIN "purchaseItems" ON "purchase"."purchaseID" = "purchaseItems"."purchaseID"
                         JOIN "products" ON "purchaseItems"."SKU" = "products"."SKU"
                         WHERE "purchase"."purchaseDate" > $1`;
        if (req.query.store) {
            query += ` AND "purchase"."storeID" = $2`;
            parameter.push(req.query.store);
        }
        query += ` GROUP BY "purchase"."customerID", "purchase"."purchaseID"
                     ) AS "pizzas_per_order_data"`;
        let result = await client.query(query, parameter);
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
router.get('/averageOrderFrequency', async (req, res) => {
    try {
        let date = req.query.date || process.env.DEFAULT_DATE;
        let parameters = [date];
        let query = `
            WITH customer_orders AS (
                SELECT
                    "customerID",
                    COUNT("purchaseID") AS total_orders,
                    MIN("purchaseDate") AS first_order_date,
                    MAX("purchaseDate") AS last_order_date
                FROM
                    "purchase"
                WHERE
                    "purchaseDate" > $1
                GROUP BY
                    "customerID"
            ),
            customer_order_frequency AS (
                SELECT
                    "customerID",
                    total_orders,
                    first_order_date,
                    last_order_date,
                    CASE
                        WHEN total_orders > 1 THEN
                            (EXTRACT(EPOCH FROM last_order_date) - EXTRACT(EPOCH FROM first_order_date)) / (86400 * (total_orders - 1))
                        ELSE NULL
                    END AS average_order_frequency_days
                FROM
                    customer_orders
            )
            SELECT
                ROUND(AVG(average_order_frequency_days), 2) AS average_order_frequency_for_avg_customer
            FROM
                customer_order_frequency
            WHERE
                average_order_frequency_days IS NOT NULL;
        `;
        if (req.query.store) {
            query += ` AND "storeID" = $2`;
            parameters.push(req.query.store);
        }
        let result = await client.query(query, parameters);
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
export default router;
//# sourceMappingURL=Franchise.js.map