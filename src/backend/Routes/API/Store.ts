import express from 'express';
import client from '../../Config/DatabaseConfig.js';
import QUERIES from '../../Queries/Store.js';
import { getTimeframeInDays } from '../../Helpers/Timeframe.js';

const router = express.Router();

/**
 * pizza Pair endpoint
 * ----
 * Query Options:
 * <ul>
 *     <li>store: storeID (default all)</li>
 * </ul>
 * ----
 * Example: http://localhost:3000/api/pizzaPair?store=S147185
 * ----
 * Returns:
 * Pizza pairs
 * ----
 * Response Format:
 * <pre>
 * {
 *     pizza1: {
 *         pzza2: int,
 *     }
 * }
 * </pre>
 */
router.get('/pizzaPair', async (req, res) => {
    try {
        let result;

        function reformatPizzaPair(result) {
            let pairs = {};

            result.forEach(element => {
                if (!pairs[element.pizza1]) {
                    pairs[element.pizza1] = {};
                }
                pairs[element.pizza1][element.pizza2] = parseInt(element.paircount);
            }
            );

            return pairs;
        }

        if (req.query.store) {
            let query: string = QUERIES.pizzaPairStore;
            result = await client.query(query, [req.query.store]);
        } else {
            let query: string = QUERIES.pizzaPair;
            result = await client.query(query);
        }

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

// ------------------ Store view ------------------

/**
 * Customer Quality Endpoint
 * ----
 * Returns the following metrics for each store:
 * <ul>
 *     <li>Orders per customer compared to the best store</li>
 *     <li>One-time customers per customers compared to the best store</li>
 *     <li>Loyal customers per customers compared to the best store</li>
 *     <li>Overall customer quality score (0-100), where the worst store is 0 and the best store is 100</li>
 * </ul>
 * ----
 * Example: http://localhost:3000/api/quality?store=S013343
 * ----
 * Response Format:
 * <pre>
 * {
 *     storeID: {
 *         'ordersPerCustomer': float,
 *         'oneTimeCustomersPerCustomer': float,
 *         'loyalCustomersPerCustomer': float,
 *         'overallCustomerQualityScore': int
 *     }
 * }
 * </pre>
 */

router.get('/quality', async (req, res) => {
    try {
        const date: string = req.query.date || process.env.DEFAULT_DATE;
        const query: string = QUERIES.QUALITY;

        const loyalty_frequency: number = 14;
        const loyalCustomerOrderCount: number = Math.ceil(getTimeframeInDays(date) / loyalty_frequency);

        const result = await client.query(query, [date, loyalCustomerOrderCount]);
        let metrics = result.rows;

        const maxOrderPerCustomer: number = Math.max(...metrics.map(metric => metric.total_orders / metric.total_customers));
        const minOneTimePerCustomer: number = Math.min(...metrics.map(metric => metric.one_time_customers / metric.total_customers));
        const maxLoyalPerCustomer: number = Math.max(...metrics.map(metric => metric.loyal_customers / metric.total_customers));

        // Calculate and normalize customer quality scores
        const calculateCustomerQuality = (metrics: any[], weightOrderPerCustomer: number = 0.4, weightOneTimeCustomer: number = 0.2, weightLoyalCustomer: number = 0.4) => {
            metrics.forEach(metric => {
                let orderPerCustomer: number = (metric.total_orders / metric.total_customers) / maxOrderPerCustomer;
                let oneTimePerCustomer: number = minOneTimePerCustomer / (metric.one_time_customers / metric.total_customers);
                let loyalPerCustomer: number = (metric.loyal_customers / metric.total_customers) / maxLoyalPerCustomer;

                metric.customer_quality_score = (
                    orderPerCustomer * weightOrderPerCustomer +
                    (1 - oneTimePerCustomer) * weightOneTimeCustomer +
                    loyalPerCustomer * weightLoyalCustomer
                );

                metric.order = orderPerCustomer * 100;
                metric.single = (oneTimePerCustomer) * 100;
                metric.loyalty = loyalPerCustomer * 100;

            });

            // score from 0 to 100 
            const minScore: number = Math.min(...metrics.map(metric => metric.customer_quality_score));
            const maxScore: number = Math.max(...metrics.map(metric => metric.customer_quality_score));

            metrics.forEach(metric => {
                metric.overall = ((metric.customer_quality_score - minScore) / (maxScore - minScore)) * 100;
                delete metric.total_customers;
                delete metric.total_orders;
                delete metric.one_time_customers;
                delete metric.loyal_customers;
                delete metric.customer_quality_score;
            });

            return metrics;
        };

        let scoredMetrics = calculateCustomerQuality(metrics);

        if (req.query.store) {
            scoredMetrics = scoredMetrics.filter(metric => metric.storeID === req.query.store);
        }

        res.status(200).json(scoredMetrics);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

/**
 * Daily Orders Analysis Endpoint
 * ----
 * Query Options:
 * <ul>
 *     <li>date: cutOfDate (default 2022-12-01)</li>
 *     <li>dow: day of week (0=Monday, 6=Saturday, 7=Sunday) (default 1)</li>
 *     <li>store: storeID of the specified store (default S302800)</li>
 * </ul>
 * ----
 * Example: http://localhost:3000/api/daily-orders-analysis?date=2021-01-01&dow=2&store=S486166
 * ----
 * Returns:
 * Orders for each hour for days between the given date and process.env.CURRENT_DATE, and calculates average orders per hour.
 * ----
 * Response Format:
 * <pre>
 * {
 *     hour: {
 *         'total': int,
 *         'avg': float,
 *         'bestPizza': [string]
 *     }
 * }
 * </pre>
 */
router.get('/daily-orders-analysis', async (req, res) => {
    try {
        let date: string = req.query.date || process.env.DEFAULT_DATE;
        let store: string = req.query.store || "S302800";
        let dayOfWeek: string = req.query.dow || 5;

        let result = await client.query(QUERIES.weekdayOrders, [store, dayOfWeek, date, process.env.DB_TIMEZONE]);
        let resultNumberDays = await client.query(QUERIES.weekdayCount, [store, dayOfWeek, date, process.env.DB_TIMEZONE]);
        let resultBestPizza = await client.query(QUERIES.weekdayBestPizza, [store, dayOfWeek, date, process.env.DB_TIMEZONE]);
        let days: number = resultNumberDays.rows[0].count;

        function reformat(result) {
            function reformatBestPizza(result) {
                let reformattedResult = {};
                let max;

                result.rows.forEach(row => {
                    let currenNumber = parseInt(row.total_orders)
                    if (!reformattedResult[row.hour]) {
                        reformattedResult[row.hour] = [];
                        max = currenNumber
                    }
                    if (currenNumber >= max) {
                        reformattedResult[row.hour].push(row.product);
                    }
                });

                return reformattedResult
            }

            let bestPizzas = reformatBestPizza(resultBestPizza);
            let reformattedResult = {};

            for (let i = 0; i < 24; i++) {
                reformattedResult[i] = { total: 0, avg: 0 };
            }

            result.rows.forEach(row => {
                let totalOrders: number = parseInt(row.total_orders)
                reformattedResult[row.hour]['total'] = totalOrders;
                reformattedResult[row.hour]['avg'] = totalOrders / days;
                reformattedResult[row.hour]['bestPizza'] = bestPizzas[row.hour];
            });

            return reformattedResult
        }

        res.status(200).json(reformat(result));
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});


//TODO check location of endpoint --------------------------------------------------



//TODO echarts
//TODO sql in json
router.get('/region-total-product', async (req, res) => {
    try {
        let query: string = `SELECT S."state",S."city",PR."Name" AS PRODUCT_NAME,SUM(P."nItems") AS TOTAL_QUANTITY FROM PURCHASE P JOIN "purchaseItems" PI ON P."purchaseID" = PI."purchaseID" JOIN PRODUCTS PR ON PI."SKU" = PR."SKU" JOIN STORES S ON P."storeID" = S."storeID" GROUP BY S."state",S."city",PR."Name" ORDER BY S."state",S."city",TOTAL_QUANTITY DESC;`;
        let result = await client.query(query);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

//TODO echarts
//TODO sql in json
router.get('/pizza-price-popularity', async (req, res) => {
    try {
        let query: string = `SELECT pr."Name" AS pizza_name, pr."Size" AS pizza_size, pr."Price" AS pizza_price, COUNT(pi."purchaseID") AS total_sales FROM products pr JOIN "purchaseItems" pi ON pr."SKU" = pi."SKU" JOIN purchase p ON pi."purchaseID" = p."purchaseID" GROUP BY pr."Name", pr."Size", pr."Price" ORDER BY total_sales DESC;`;

        let result = await client.query(query);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});


//TODO echarts
//TODO sql in json
router.get('/Customer-Segmentation-Analysis', async (req, res) => {
    try {
        let query: string = `SELECT C."customerID",AVG(P."total") AS AVG_SPENT_PER_PURCHASE,COUNT(P."purchaseID") AS TOTAL_PURCHASES,MAX(P."purchaseDate") - MIN(P."purchaseDate") AS CUSTOMER_LIFETIME,C."latitude",C."longitude" FROM "customers" C JOIN PURCHASE P ON C."customerID" = P."customerID" GROUP BY C."customerID";`;
        let result = await client.query(query);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

//TODO echarts
//TODO sql in json
router.get('/Customer-Lifetime-Value', async (req, res) => {
    try {
        let query: string = `SELECT C."customerID",AVG(P."total") AS avg_spent_per_purchase,COUNT(P."purchaseID") AS total_purchases,SUM(P."total") AS total_spent,(SUM(P."total") / COUNT(P."purchaseID")) * COUNT(P."purchaseID") AS clv FROM customers C JOIN purchase P ON C."customerID" = P."customerID" GROUP BY C."customerID";`;
        let result = await client.query(query);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

export default router;