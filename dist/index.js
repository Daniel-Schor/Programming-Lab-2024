import express from 'express';
import client from './connector.js';
import queries from './queries.json' assert { type: 'json' };
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaultDate = "2022-12-01";
const currentDate = "2022-12-31";
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const tzDB = "America/Los_Angeles" || tz;
function getTimeframeInDays(startDate, endDate = currentDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMilliseconds = end.getTime() - start.getTime();
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
    return diffInDays;
}
// ----------------- Functions -----------------
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
function reformatRevenueQueryResults(result) {
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
const app = express();
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
        let query = `select "storeID", latitude as lat, longitude as lon from stores`;
        let result = await client.query(query);
        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
app.get('/api/customerLocations', async (req, res) => {
    try {
        let query = `select latitude as lat, longitude as lon from customers`;
        let result = await client.query(query);
        res.status(200).json(result.rows);
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
        let date = req.query.date || defaultDate;
        let query = queries.revenue;
        let result = await client.query(query, [date]);
        result = reformatRevenueQueryResults(result.rows);
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
            });
            return pairs;
        }
        if (req.query.store) {
            let query = queries.pizzaPairStore;
            result = await client.query(query, [req.query.store]);
        }
        else {
            let query = queries.pizzaPair;
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
        const date = req.query.date || defaultDate;
        const query = queries.quality;
        const daysPerOrder = 14;
        const loyalCustomerOrderCount = Math.ceil(getTimeframeInDays(date) / daysPerOrder);
        const result = await client.query(query, [date, loyalCustomerOrderCount]);
        let metrics = result.rows;
        const maxOrderPerCustomer = Math.max(...metrics.map(metric => metric.total_orders / metric.total_customers));
        const minOneTimePerCustomer = Math.min(...metrics.map(metric => metric.one_time_customers / metric.total_customers));
        const maxLoyalPerCustomer = Math.max(...metrics.map(metric => metric.loyal_customers / metric.total_customers));
        // Calculate and normalize customer quality scores
        const calculateCustomerQuality = (metrics, weightOrderPerCustomer = 0.4, weightOneTimeCustomer = 0.2, weightLoyalCustomer = 0.4) => {
            metrics.forEach(metric => {
                let orderPerCustomer = (metric.total_orders / metric.total_customers) / maxOrderPerCustomer;
                let oneTimePerCustomer = minOneTimePerCustomer / (metric.one_time_customers / metric.total_customers);
                let loyalPerCustomer = (metric.loyal_customers / metric.total_customers) / maxLoyalPerCustomer;
                metric.customer_quality_score = (orderPerCustomer * weightOrderPerCustomer +
                    (1 - oneTimePerCustomer) * weightOneTimeCustomer +
                    loyalPerCustomer * weightLoyalCustomer);
                metric.order = orderPerCustomer * 100;
                metric.single = (oneTimePerCustomer) * 100;
                metric.loyalty = loyalPerCustomer * 100;
            });
            // score from 0 to 100 
            const minScore = Math.min(...metrics.map(metric => metric.customer_quality_score));
            const maxScore = Math.max(...metrics.map(metric => metric.customer_quality_score));
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
        let date = req.query.date || defaultDate;
        let store = req.query.store || "S302800";
        let dayOfWeek = req.query.dow || 5;
        let result = await client.query(queries.weekdayOrders, [store, dayOfWeek, date, tzDB]);
        let resultNumberDays = await client.query(queries.weekdayCount, [store, dayOfWeek, date, tzDB]);
        let resultBestPizza = await client.query(queries.weekdayBestPizza, [store, dayOfWeek, date, tzDB]);
        let days = resultNumberDays.rows[0].count;
        function reformat(result) {
            function reformatBestPizza(result) {
                let reformattedResult = {};
                let max;
                result.rows.forEach(row => {
                    let currenNumber = parseInt(row.total_orders);
                    if (!reformattedResult[row.hour]) {
                        reformattedResult[row.hour] = [];
                        max = currenNumber;
                    }
                    if (currenNumber >= max) {
                        reformattedResult[row.hour].push(row.product);
                    }
                });
                return reformattedResult;
            }
            let bestPizzas = reformatBestPizza(resultBestPizza);
            let reformattedResult = {};
            for (let i = 0; i < 24; i++) {
                reformattedResult[i] = { total: 0, avg: 0 };
            }
            result.rows.forEach(row => {
                let totalOrders = parseInt(row.total_orders);
                reformattedResult[row.hour]['total'] = totalOrders;
                reformattedResult[row.hour]['avg'] = totalOrders / days;
                reformattedResult[row.hour]['bestPizza'] = bestPizzas[row.hour];
            });
            return reformattedResult;
        }
        res.status(200).json(reformat(result));
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
// ----------------- Endpoints end ---------------------
app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));
//# sourceMappingURL=index.js.map