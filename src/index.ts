import express from 'express';
import client from './connector.js';
import queries from './queries.json' assert { type: 'json' };
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const defaultDate: string = "2022-12-01";
const currentDate: string = "2022-12-31";
const tz: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
const tzDB = "America/Los_Angeles" || tz;

function getTimeframeInDays(startDate: string, endDate: string = currentDate): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffInMilliseconds = end.getTime() - start.getTime();

    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

    return diffInDays;
}

// ----------------- Functions -----------------

function revenueChange(cutOFDate: string, result: any, best: boolean = true, positveWeight: number = 1.06, negativeWeight: number = 1.19) {
    let newResult = result;

    let numberChanges: number = Object.keys(result[Object.keys(result)[0]]).length - 1;

    Object.keys(newResult).forEach(key => {
        let oldElement = cutOFDate;

        Object.keys(newResult[key]).reverse().forEach(element => {
            if (element === cutOFDate) {
                newResult[key].changeValue = 0;
            } else {
                let currentValue = ((newResult[key][element] - newResult[key][oldElement]) / newResult[key][oldElement]) * 100;
                let absValue = Math.abs(currentValue);

                if (absValue !== currentValue) {
                    currentValue = -Math.pow(absValue, negativeWeight);
                } else {
                    currentValue = Math.pow(absValue, positveWeight);
                }

                newResult[key].changeValue += currentValue;
                oldElement = element;
            }
        });

        if (newResult[key].changeValue < 0) {
            newResult[key].changeValue = -Math.pow(Math.abs(newResult[key].changeValue), negativeWeight);
        } else {
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
        const formatter = new Intl.DateTimeFormat('en-US', { 'timeZone': tz, year: 'numeric', month: '2-digit', day: '2-digit' });

        result.forEach(row => {
            const formattedDate = formatter.format(new Date(row.day));
            const [month, day, year] = formattedDate.split('/');
            row.day = `${year}-${month}-${day}`;
        });
    }

    reformatDate(result);

    let stores = {};

    if (reverse) { result.reverse(); }

    result.forEach(element => {
        if (!stores[element.storeID]) {
            stores[element.storeID] = {};
        }
        stores[element.storeID][element.day] = element.sum;
    });
    return stores;
}
// ----------------- Functions end --------------

// ----------------- App init ---------------------
const app: express.Application = express();
app.use("/static", express.static('./static/'));

app.use(cors({
    origin: 'http://localhost:3000' // replace with the origin of your client
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/company.html'));
});
app.get('/individualStore', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/individualStore.html'));
});

app.get('/mapTest', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/mapStores.html'));
});

app.get('/mapTestCustomers', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/mapCustomers.html'));
});
// ----------------- App init end ---------------------

// ----------------- Endpoints ---------------------

// ------------------ Franchise view ------------------

// 
app.get('/api/storeLocations', async (req, res) => {
    try {
        let query: string = `select "storeID", latitude as lat, longitude as lon from stores`;

        let result = await client.query(query);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

app.get('/api/totalRevenue', async (req, res) => {
    try {
        let query: string = `Select SUM(total) AS total_revenue
        From "purchase"
        WHERE "purchaseDate" > $1`;
        let date: string = req.query.date || defaultDate;
        let result = await client.query(query, [date]);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

app.get('/api/totalPizzas', async (req, res) => {
    try {
        let query: string = `Select SUM("nItems") AS total_pizza
        From "purchase"
        WHERE "purchaseDate" > $1`;
        let date: string = req.query.date || defaultDate;
        let result = await client.query(query, [date]);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

app.get('/api/totalOrders', async (req, res) => {
    try {
        let query: string = `Select COUNT("purchaseID") AS total_orders
        From "purchase"
        WHERE "purchaseDate" > $1`;
        let date: string = req.query.date || defaultDate;
        let result = await client.query(query, [date]);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

app.get('/api/averageOrderValue', async (req, res) => {
    try {
        let query: string = `Select SUM("total") / COUNT(*) AS average_order_value
        From "purchase"
        WHERE "purchaseDate" > $1`;
        let date: string = req.query.date || defaultDate;
        let result = await client.query(query, [date]);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

app.get('/api/customerLocations', async (req, res) => {
    try {
        let query: string = `select latitude as lat, longitude as lon from customers`;

        let result = await client.query(query);

        res.status(200).json(result.rows);
    }
    catch (err) {
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
 * Total revenue for each store for days between the given date and currentDate.
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
app.get('/api/total-store-revenue', async (req, res) => {
    try {
        function reformat(result, reverse) {
            let stores = {};
            if (reverse) { result.rows.reverse(); }
            result.rows.forEach(element => {
                stores[element.storeID] = element.total_revenue;
            });
            return stores;
        }

        let date: string = req.query.date || defaultDate;
        let query: string = queries.totalStoreRevenue;

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
 * Revenue for each store for days between the given date and currentDate, and calculates percentage increase in that timeframe.
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
app.get('/api/revenue', async (req, res) => {
    try {
        let date: string = req.query.date || defaultDate;
        let query: string = queries.revenue;

        let result = await client.query(query, [date]);

        result = reformatRevenueQueryResults(result.rows, JSON.parse(req.query.reverse || false));

        result = revenueChange(date, result, JSON.parse(req.query.best || true));

        if (req.query.store) {
            Object.keys(result).forEach(store => { if (!req.query.store.includes(store)) { delete result[store]; } });
        }

        if (req.query.limit) {
            let i: number = 0;
            Object.keys(result).forEach(store => { if (i >= parseInt(req.query.limit)) { delete result[store]; } i++; });
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
app.get('/api/pizzaPair', async (req, res) => {
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
            let query: string = queries.pizzaPairStore;
            result = await client.query(query, [req.query.store]);
        } else {
            let query: string = queries.pizzaPair;
            result = await client.query(query);
        }

        res.status(200).json(reformatPizzaPair(result.rows));
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

app.get('/api/quality', async (req, res) => {
    try {
        const date: string = req.query.date || defaultDate;
        const query: string = queries.quality;

        const daysPerOrder: number = 14;
        const loyalCustomerOrderCount: number = Math.ceil(getTimeframeInDays(date) / daysPerOrder);

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
 * Orders for each hour for days between the given date and currentDate, and calculates average orders per hour.
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
app.get('/api/daily-orders-analysis', async (req, res) => {
    try {
        let date: string = req.query.date || defaultDate;
        let store: string = req.query.store || "S302800";
        let dayOfWeek: string = req.query.dow || 5;

        let result = await client.query(queries.weekdayOrders, [store, dayOfWeek, date, tzDB]);
        let resultNumberDays = await client.query(queries.weekdayCount, [store, dayOfWeek, date, tzDB]);
        let resultBestPizza = await client.query(queries.weekdayBestPizza, [store, dayOfWeek, date, tzDB]);
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

//TODO echarts
//TODO sql in json
app.get('/api/pizza-price-popularity', async (req, res) => {
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
app.get('/api/Customer-Segmentation-Analysis', async (req, res) => {
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
app.get('/api/region-total-product', async (req, res) => {
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


// ----------------- Endpoints end ---------------------

app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));
