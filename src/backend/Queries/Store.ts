const QUERIES = {
    QUALITY: `SELECT 
                    "storeID", 
                    COUNT(DISTINCT "customerID") AS total_customers, 
                    SUM("order_count") AS total_orders, 
                    COUNT(DISTINCT CASE WHEN order_count = 1 THEN "customerID" END) AS one_time_customers, 
                    COUNT(DISTINCT CASE WHEN order_count > $2 THEN "customerID" END) AS loyal_customers 
                FROM (SELECT 
                        "storeID", 
                        "customerID", 
                        COUNT("purchaseID") AS order_count 
                    FROM purchase 
                    WHERE "purchaseDate" > $1 GROUP BY "storeID", "customerID") AS customer_orders 
                GROUP BY "storeID";`,
    weekdayOrders: `SELECT 
                        EXTRACT(HOUR FROM "purchaseDate" AT TIME ZONE $4) AS hour, 
                        COUNT(*) AS total_orders 
                    FROM purchase 
                    WHERE "storeID" = $1 AND EXTRACT(DOW FROM "purchaseDate" AT TIME ZONE $4) = $2 and "purchaseDate" > $3 
                    GROUP BY hour 
                    ORDER BY hour;`,
    weekdayCount: `SELECT COUNT(distinct "purchaseDate"::DATE) 
                    FROM purchase 
                    WHERE "storeID" = $1 AND EXTRACT(DOW FROM "purchaseDate" AT TIME ZONE $4) = $2 and "purchaseDate" > $3`,
    weekdayBestPizza: `SELECT 
                            EXTRACT(HOUR FROM p."purchaseDate" AT TIME ZONE $4) AS hour, 
                            CONCAT(pr."Size", ' ', pr."Name") AS product, COUNT(*) AS total_orders 
                        FROM purchase p 
                        JOIN "purchaseItems" pi ON p."purchaseID" = pi."purchaseID" 
                        JOIN products pr ON pi."SKU" = pr."SKU" 
                        WHERE p."storeID" = $1  AND EXTRACT(DOW FROM p."purchaseDate" AT TIME ZONE $4) = $2 AND p."purchaseDate" > $3 
                        GROUP BY hour, pr."Name", pr."Size" 
                        ORDER BY hour, total_orders DESC;`,
        pizzaPair: `WITH PizzaPairs AS 
                        (SELECT p1."Name" AS Pizza1, p2."Name" AS Pizza2, COUNT(*) AS PairCount 
                    FROM (SELECT pi.*, p."Name" 
                        FROM "purchaseItems" pi 
                        LEFT JOIN "products" p ON pi."SKU" = p."SKU") AS p1 
                    JOIN (SELECT pi.*, p."Name" FROM "purchaseItems" pi 
                        LEFT JOIN "products" p ON pi."SKU" = p."SKU") AS p2 ON p1."purchaseID" = p2."purchaseID" 
                    WHERE p1."Name" != p2."Name" GROUP BY p1."Name", p2."Name") 
                SELECT Pizza1, Pizza2, PairCount 
                FROM PizzaPairs 
                ORDER BY pizza1 DESC;`,
    pizzaPairStore: `WITH PizzaPairs AS 
                        (SELECT p1."Name" AS Pizza1, p2."Name" AS Pizza2, COUNT(*) AS PairCount 
                        FROM (SELECT pi.*, p."Name" 
                            FROM "purchaseItems" pi 
                            LEFT JOIN "products" p ON pi."SKU" = p."SKU" 
                            LEFT JOIN "purchase" pu ON pi."purchaseID" = pu."purchaseID" WHERE "storeID" = $1) AS p1 
                        JOIN (SELECT pi.*, p."Name" 
                            FROM "purchaseItems" pi 
                            LEFT JOIN "products" p ON pi."SKU" = p."SKU" 
                            LEFT JOIN "purchase" pu ON pi."purchaseID" = pu."purchaseID"
                            WHERE "storeID" = $1) AS p2 ON p1."purchaseID" = p2."purchaseID" 
                        WHERE p1."Name" != p2."Name" GROUP BY p1."Name", p2."Name") 
                    SELECT Pizza1, Pizza2, PairCount 
                    FROM PizzaPairs 
                    ORDER BY pizza1 DESC;`,
};
pizzaIngredients: `WITH ingredients_split AS (
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
            AND EXTRACT(DOW FROM purchase."purchaseDate" AT TIME ZONE $4) = $2
            AND purchase."purchaseDate" > $3
    )
    SELECT
        ingredient,
        EXTRACT(DOW FROM purchaseDate AT TIME ZONE $4) AS day_of_week,
        AVG("nItems") AS average_quantity
    FROM
        ingredients_split
    GROUP BY
     ingredient,
        EXTRACT(DOW FROM purchaseDate AT TIME ZONE $4)
    ORDER BY
        ingredient,
        EXTRACT(DOW FROM purchaseDate AT TIME ZONE $4);`

export default QUERIES;