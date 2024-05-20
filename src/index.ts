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

function getTimeframeInDays(startDate: string, endDate: string = '2022-12-31'): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffInMilliseconds = end.getTime() - start.getTime();

    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

    return diffInDays;
}

const app: express = express();
app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000' // replace with the origin of your client
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/test.html'));
});

// Get specified stores
app.get('/revenue', async (req, res) => {
    try {
        let query: string = queries.revenue;

        let cutOfDate: string = req.query.date || defaultDate;
        let store: string = req.query.store || "";
        let stores: string[] = store.split(",");

        let result = await client.query(query, [cutOfDate, stores]);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

// XXX NOT NEEDED
// Get all stores or specified stores
app.get('/revenue2', async (req, res) => {
    try {
        let conditions: string[] = [req.query.date || defaultDate];
        let query: string;

        if (req.query.store) {
            query = queries.revenue;
            conditions.push(req.query.store.split(","));
        } else {
            query = queries.revenue2;
        }

        let result = await client.query(query, conditions);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

// Customer quality
app.get('/quality', async (req, res) => {
    try {
        const date: string = req.query.date || defaultDate;
        const query: string = queries.quality;

        const daysPerOrder: number = 14;
        const loyalCustomerOrderCount: number = Math.ceil(getTimeframeInDays(date) / daysPerOrder);

        const result = await client.query(query, [date, loyalCustomerOrderCount]);
        let metrics = result.rows;

        // Potential Problem: takes values from different stores -> comparison might be unfair 
        // Solution: Don't use percentage in visualization. Use normalized score instead
        const maxOrderPerCustomer: number = Math.max(...metrics.map(metric => metric.total_orders / metric.total_customers));
        const minOneTimePerCustomer: number = Math.min(...metrics.map(metric => metric.one_time_customers / metric.total_customers));
        const maxLoyalPerCustomer: number = Math.max(...metrics.map(metric => metric.loyal_customers / metric.total_customers));

        // Calculate and normalize customer quality scores
        const calculateCustomerQuality = (metrics: any[], weightOrderPerCustomer = 0.4, weightOneTimeCustomer = 0.2, weightLoyalCustomer = 0.4) => {
            metrics.forEach(metric => {
                let orderPerCustomer = (metric.total_orders / metric.total_customers) / maxOrderPerCustomer;
                let oneTimePerCustomer = minOneTimePerCustomer / (metric.one_time_customers / metric.total_customers);
                let loyalPerCustomer = (metric.loyal_customers / metric.total_customers) / maxLoyalPerCustomer;

                metric.customer_quality_score = (
                    orderPerCustomer * weightOrderPerCustomer +
                    (1 - oneTimePerCustomer) * weightOneTimeCustomer +
                    loyalPerCustomer * weightLoyalCustomer
                );
            });

            // ---------- score from 0 to 100 ---------------
            const minScore = Math.min(...metrics.map(metric => metric.customer_quality_score));
            const maxScore = Math.max(...metrics.map(metric => metric.customer_quality_score));

            metrics.forEach(metric => {
                metric.normalized_score = ((metric.customer_quality_score - minScore) / (maxScore - minScore)) * 100;
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
