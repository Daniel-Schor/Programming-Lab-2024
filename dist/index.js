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
function getTimeframeInDays(startDate, endDate = currentDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMilliseconds = end.getTime() - start.getTime();
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
    return diffInDays;
}
// ----------------- Functions -----------------
function revenuePercentageChange(cutOFDate, result, best = true) {
    let newResult = result;
    Object.keys(newResult).forEach(key => {
        newResult[key].percentageIncrease = ((newResult[key][currentDate] - newResult[key][cutOFDate]) / newResult[key][cutOFDate]) * 100;
    });
    // Extract the percentage increases and sort them
    let sortedPercentageIncreases = Object.keys(newResult)
        .map(key => ({
        storeID: key,
        percentageIncrease: newResult[key].percentageIncrease
    }))
        .sort((a, b) => b.percentageIncrease - a.percentageIncrease);
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
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
    res.sendFile(path.join(__dirname, '../html/home.html'));
});
// ----------------- App init end ---------------------
// ----------------- Endpoints ---------------------
// Revenue endpoint
// ----
// Query options:
// date: cutOfDate (default 2022-12-01)
// best: true/false (default true)
// limit: max number of stores to return (default undefined)
// store: comma separated list of storeIDs to return (default all)
// ----
// example: http://localhost:3000/revenue?date=2022-12-01&best=true&store=S486166,S263879,S449313,S799887,S147185,S505400&limit=3
// ----
// Returns revenue for each store for days between given date and currentDate and calculates percentage increase in that timeframe
// provides data in this format:
// {storeID: {date: revenue, 'percentageIncrease': float}}
// ----
app.get('/revenue', async (req, res) => {
    try {
        let date = req.query.date || defaultDate;
        let query = queries.revenue;
        let result = await client.query(query, [date]);
        result = reformatRevenueQueryResults(result.rows);
        result = revenuePercentageChange(date, result, JSON.parse(req.query.best || true));
        if (req.query.store) {
            req.query.store.split(",");
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
        res.status(200).json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
// Customer quality
// Retuns following metrics for each store:
// orders per customer compared to best store
// one time customers per customers compared to best store
// loyal customers per customers compared to best store
// overall customer quality score 0-100 
//    worst store 0, best store 100
//http://localhost:3000/quality?store=S013343
app.get('/quality', async (req, res) => {
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
            // ---------- score from 0 to 100 ---------------
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
            // ------------------------------------------------
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
// ----------------- Endpoints end ---------------------
app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));
//# sourceMappingURL=index.js.map