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
const currentDate = "2022-12-30";
function getTimeframeInDays(startDate, endDate = '2022-12-31') {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMilliseconds = end.getTime() - start.getTime();
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
    return diffInDays;
}
function reformatDate(result) {
    result.rows.forEach(row => {
        row.day = row.day.toISOString().split('T')[0];
    });
}
const app = express();
app.use("/static", express.static('./static/'));
app.use(cors({
    origin: 'http://localhost:3000' // replace with the origin of your client
}));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/home.html'));
});
// TODO change format to: 
// storeID:
//          day: revenue
//          day: revenue
//          percentageIncrease: value
//          and so on
// Should be done in querie or in the code?
function topChangeRevenuePercentageIDs(cutOFDate, result, best = true) {
    const specificDates = [cutOFDate, currentDate];
    // Filter the rows to include only specific dates
    let removedDays = result.rows.filter(row => specificDates.includes(row.day));
    // Initialize the dictionary
    let daySum = {};
    // Populate the dictionary
    removedDays.forEach(element => {
        if (!daySum[element.storeID]) {
            daySum[element.storeID] = {};
        }
        daySum[element.storeID][element.day] = element.sum;
    });
    // Calculate percentage increases
    Object.keys(daySum).forEach(key => {
        daySum[key].percentageIncrease = ((daySum[key][currentDate] - daySum[key][cutOFDate]) / daySum[key][cutOFDate]) * 100;
    });
    // Extract the percentage increases and sort them
    let sortedPercentageIncreases = Object.keys(daySum)
        .map(key => ({
        storeID: key,
        percentageIncrease: daySum[key].percentageIncrease
    }))
        .sort((a, b) => b.percentageIncrease - a.percentageIncrease);
    if (!best) {
        sortedPercentageIncreases = sortedPercentageIncreases.reverse();
    }
    // Get the top 5 percentage increases
    let top5PercentageIncreases = sortedPercentageIncreases.slice(0, 5);
    // Construct a new object with the top 5 stores
    let top5DaySum = {};
    top5PercentageIncreases.forEach(item => {
        top5DaySum[item.storeID] = daySum[item.storeID];
    });
    return Object.keys(top5DaySum);
}
app.get('/revenue2', async (req, res) => {
    try {
        let conditions = [req.query.date || defaultDate];
        let query;
        if (req.query.store) {
            query = queries.revenue;
            conditions.push(req.query.store.split(","));
            req.query.best = undefined;
        }
        else {
            query = queries.revenue2;
        }
        let result = await client.query(query, conditions);
        reformatDate(result);
        if (req.query.best) {
            let topChangedIDs = topChangeRevenuePercentageIDs(conditions[0], result, JSON.parse(req.query.best));
            result.rows = result.rows.filter(row => topChangedIDs.includes(row.storeID));
        }
        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});
// Get specified stores
app.get('/revenue', async (req, res) => {
    try {
        let query = queries.revenue;
        let cutOfDate = req.query.date || defaultDate;
        let store = req.query.store || "";
        let stores = store.split(",");
        let result = await client.query(query, [cutOfDate, stores]);
        reformatDate(result);
        res.status(200).json(result.rows);
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
app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));
//# sourceMappingURL=index.js.map