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
// TODO check duplicate endpoint 
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

        res.status(200).json(reformatPizzaPair(result.rows));
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

// TODO check duplicate endpoint 
router.get('/pizzaPairs', async (req, res) => {
    try {
        // Extract date and storeID from query parameters
        let date: string = req.query.date || process.env.DEFAULT_DATE;
        let storeID: string = req.query.store;
        let parameter = [date, storeID];

        // Initialize parameters array for SQL query


        // Create query to count pairs of pizzas purchased together with storeID filter
        const query = `
        WITH PizzaPairs AS (
            SELECT p1."Name" AS Pizza1, p2."Name" AS Pizza2, COUNT(*) AS PairCount
            FROM (
                SELECT pi.*, p."Name"
                FROM "purchaseItems" pi
                LEFT JOIN "products" p ON pi."SKU" = p."SKU"
                LEFT JOIN "purchase" pu ON pi."purchaseID" = pu."purchaseID"
                WHERE DATE(pu."purchaseDate") > $1 AND pu."storeID" = $2
            ) AS p1
            JOIN (
                SELECT pi.*, p."Name"
                FROM "purchaseItems" pi
                LEFT JOIN "products" p ON pi."SKU" = p."SKU"
                LEFT JOIN "purchase" pu ON pi."purchaseID" = pu."purchaseID"
                WHERE DATE(pu."purchaseDate") > $1 AND pu."storeID" = $2
            ) AS p2 ON p1."purchaseID" = p2."purchaseID"
            WHERE p1."Name" != p2."Name"
            GROUP BY p1."Name", p2."Name"
        )
        SELECT Pizza1, Pizza2, PairCount
        FROM PizzaPairs
        ORDER BY Pizza1 DESC;
        `;

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
        // Execute the query
        let result = await client.query(query, parameter);

        // Log and return the result
        console.log(result.rows);
        res.status(200).json(reformatPizzaPair(result.rows));
    } catch (err) {
        // Handle any errors that occur during the query execution
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

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

//TODO echarts Yannis
//TODO parse sql statement into queries file yannis
//TODO outsource sql ; check location (is Store.ts right place?)
router.get('/pizza-price-popularity', async (req, res) => {
    try {
        const storeID = req.query.storeID;
        const date = req.query.date;

        if (!storeID || !date) {
            return res.status(400).send('StoreID is required');
        }

        console.log(`Received storeID: ${storeID}`);
        console.log(`Received date: ${date}`);

        let query: string = `
        SELECT 
            pr."Name" AS pizza_name, pr."Size" AS pizza_size, pr."Price" AS pizza_price, 
            COUNT(pi."purchaseID") AS total_sales 
        FROM
            products pr 
        JOIN 
            "purchaseItems" pi ON pr."SKU" = pi."SKU" 
        JOIN 
            purchase p ON pi."purchaseID" = p."purchaseID"
        WHERE
            p."storeID" = $1 AND p."purchaseDate" > $2
        GROUP BY pr."Name", pr."Size", pr."Price" 
        ORDER BY total_sales DESC;`;

        const parameters = [storeID, date];

        const result = await client.query(query, parameters);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

router.get('/Stores', async (req, res) => {
    try {
        let query: string = `SELECT "storeID", "city" FROM stores`;
        let result = await client.query(query);

        res.status(200).json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

router.get('/ingredientUsage', async (req, res) => {
    try {
        // Extract storeID and date from query parameters
        const storeID = req.query.storeID;
        const date = req.query.date;

        // Validate the presence of storeID and date
        if (!storeID || !date) {
            return res.status(400).send('storeID and date parameters are required');
        }

        // SQL query with the provided logic
        const query = `
            WITH ingredients_split AS (
                SELECT
                    purchase."storeID",
                    purchase."purchaseDate",
                    purchase."nItems",
                    unnest(string_to_array(products."Ingredients", ',')) AS ingredient
                FROM
                    purchase
                JOIN
                    "purchaseItems" ON purchase."purchaseID" = "purchaseItems"."purchaseID"
                JOIN
                    products ON "purchaseItems"."SKU" = products."SKU"
                WHERE
                    purchase."storeID" = $1
                    AND purchase."purchaseDate" > $2
            )
            SELECT
                ingredient,
                AVG("nItems") AS average_quantity
            FROM
                ingredients_split
            GROUP BY
                ingredient
            ORDER BY
                ingredient;
        `;

        // Parameters for the query
        const parameters = [storeID, date];

        // Execute the query
        const result = await client.query(query, parameters);

        // Send the result as JSON
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Sorry, out of order');
    }
});

//TODO parse sql statement into queries file yannis
router.get('/abc-analysis-customers', async (req, res) => {
    try {
        const storeID = req.query.storeID;
        const date = req.query.date;

        if (!storeID || !date) {
            return res.status(400).send('StoreID is required');
        }

        console.log(`Received storeID: ${storeID}`);
        console.log(`Received date: ${date}`);

        const query = `
WITH total_sales_per_customer AS (
    SELECT
        c."customerID",
        SUM(p.total) AS total_sale_customer
    FROM
        public.customers c
    JOIN
        public.purchase p ON c."customerID" = p."customerID"
    JOIN 
        public.stores s ON p."storeID" = s."storeID"
    WHERE
        p."storeID" = $1 AND p."purchaseDate" > $2
    GROUP BY
        c."customerID"
    ORDER BY
        total_sale_customer DESC
),
percentage_sales_customer AS (
    SELECT
        "customerID",
        total_sale_customer,
        SUM(total_sale_customer) OVER () AS total_sum_sales,
        (total_sale_customer / SUM(total_sale_customer) OVER ()) AS customer_percentage_of_total
    FROM
        total_sales_per_customer
),
cumulative_sales_customer AS (
    SELECT
        "customerID",
        total_sale_customer,
        total_sum_sales,
        customer_percentage_of_total,
        SUM(customer_percentage_of_total) OVER (ORDER BY total_sale_customer DESC) AS sorted_cumulative_customer_percentage_of_total
    FROM
        percentage_sales_customer
),
abc_analysis AS (
    SELECT
        "customerID",
        total_sale_customer,
        total_sum_sales,
        customer_percentage_of_total,
        sorted_cumulative_customer_percentage_of_total,
        CASE
            WHEN sorted_cumulative_customer_percentage_of_total <= 0.8 THEN 'A'
            WHEN sorted_cumulative_customer_percentage_of_total <= 0.95 THEN 'B'
            ELSE 'C'
        END AS abc_category
    FROM
        cumulative_sales_customer
)
SELECT
    "customerID",
    total_sale_customer,
    total_sum_sales,
    customer_percentage_of_total,
    sorted_cumulative_customer_percentage_of_total,
    abc_category
FROM
    abc_analysis
ORDER BY
    total_sale_customer DESC;
      `;

        const parameters = [storeID, date];

        const result = await client.query(query, parameters);

        const formattedData = {};
        result.rows.forEach(row => {
            formattedData[row.customerID] = {
                total_sale_customer: row.total_sale_customer,
                total_sum_sales: row.total_sum_sales,
                customer_percentage_of_total: row.customer_percentage_of_total,
                sorted_cumulative_customer_percentage_of_total: row.sorted_cumulative_customer_percentage_of_total,
                abc_category: row.abc_category,
                customerID: row.customerID
            };
        });

        res.status(200).json({ [storeID]: formattedData });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

//TODO echarts yannis
//TODO änder sql statement wie bei customers
//TODO parse sql statement into queries file yannis
router.get('/abc-analysis-pizza', async (req, res) => {
    try {
        const storeID = req.query.storeID;
        const date = req.query.date;

        if (!storeID || !date) {
            return res.status(400).send('StoreID is required');
        }

        console.log(`Received storeID: ${storeID}`);
        console.log(`Received date: ${date}`);

        const query = `
  WITH
	TOTAL_SALES_PER_PRODUCT AS (
		SELECT
			P."SKU",
			SUM(PCH.TOTAL) AS TOTAL_SALES_PIZZA
		FROM
			PUBLIC.PRODUCTS P
			JOIN PUBLIC."purchaseItems" PI ON P."SKU" = PI."SKU"
			JOIN PUBLIC.PURCHASE PCH ON PI."purchaseID" = PCH."purchaseID"
			JOIN PUBLIC.STORES S ON PCH."storeID" = S."storeID"
		WHERE
			PCH."storeID" = 'S688745'
			AND PCH."purchaseDate" > '2022-12-01'
		GROUP BY
			P."SKU"
		ORDER BY
			TOTAL_SALES_PIZZA DESC
	),
	PERCENTAGE_SALES_PRODUCT AS (
		SELECT
			"SKU",
			TOTAL_SALES_PIZZA,
			SUM(TOTAL_SALES_PIZZA) OVER () AS TOTAL_SUM_SALES,
			(
				TOTAL_SALES_PIZZA / SUM(TOTAL_SALES_PIZZA) OVER ()
			) AS PRODUCT_PERCENTAGE_OF_TOTAL
		FROM
			TOTAL_SALES_PER_PRODUCT
	),
	CUMULATIVE_SALES_PRODUCT AS (
		SELECT
			"SKU",
			TOTAL_SALES_PIZZA,
			TOTAL_SUM_SALES,
			PRODUCT_PERCENTAGE_OF_TOTAL,
			SUM(PRODUCT_PERCENTAGE_OF_TOTAL) OVER (
				ORDER BY
					TOTAL_SALES_PIZZA DESC
			) AS SORTED_CUMULATIVE_PRODUCT_PERCENTAGE_OF_TOTAL
		FROM
			PERCENTAGE_SALES_PRODUCT
	),
	ABC_ANALYSIS AS (
		SELECT
			"SKU",
			TOTAL_SALES_PIZZA,
			TOTAL_SUM_SALES,
			PRODUCT_PERCENTAGE_OF_TOTAL,
			SORTED_CUMULATIVE_PRODUCT_PERCENTAGE_OF_TOTAL,
			CASE
				WHEN SORTED_CUMULATIVE_PRODUCT_PERCENTAGE_OF_TOTAL <= 0.8 THEN 'A'
				WHEN SORTED_CUMULATIVE_PRODUCT_PERCENTAGE_OF_TOTAL <= 0.95 THEN 'B'
				ELSE 'C'
			END AS ABC_CATEGORY
		FROM
			CUMULATIVE_SALES_PRODUCT
	)
SELECT
	"SKU",
	TOTAL_SALES_PIZZA,
	TOTAL_SUM_SALES,
	PRODUCT_PERCENTAGE_OF_TOTAL,
	SORTED_CUMULATIVE_PRODUCT_PERCENTAGE_OF_TOTAL AS CUMULATIVE_PERCENTAGE,
	ABC_CATEGORY
FROM
	ABC_ANALYSIS
ORDER BY
	TOTAL_SALES_PIZZA DESC;
      `;

        const parameters = [storeID, date];

        const result = await client.query(query, parameters);

        const formattedData = {};
        result.rows.forEach(row => {
            formattedData[row.SKU] = {
                total_sales_pizza: row.total_sales_pizza,
                total_sum_sales: row.total_sum_sales,
                product_percentage_of_total: row.product_percentage_of_total,
                cumulative_percentage: row.cumulative_percentage,
                abc_category: row.abc_category
            };
        });

        res.status(200).json({ [storeID]: formattedData });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
