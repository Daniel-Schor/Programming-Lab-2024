const QUERIES = {
    REVENUE: `SELECT "storeID", "purchaseDate"::DATE AS day, SUM("total") AS sum 
                FROM purchase 
                WHERE "purchaseDate" >= $1 
                GROUP BY "storeID", day 
                ORDER BY day DESC;`,
    TOTAL_STORE_REVNUE: `SELECT "storeID", SUM(total) as total_revenue 
                        FROM purchase 
                        WHERE "purchaseDate" > $1 
                        GROUP BY "storeID" 
                        ORDER BY total_revenue DESC`
    ALL_ORDERS: `SELECT * FROM purchase;`
    WHOLE_REVENUE: `SELECT SUM(total) AS total_revenue FROM purchase;`
    ALL_CUSTOMER: `SELECT COUNT(*) AS total_customers FROM customers;`
    ALL_PIZZAS_SOLD: `SELECT COUNT(*) AS total_pizzas_sold 
                     FROM purchaseItems 
                     JOIN products ON purchaseItems.SKU = products.SKU 
                     WHERE products.Category = 'Pizza'`
    AVERAGE_ORDER_CUSTOMER: `SELECT AVG(order_count) AS avg_orders_per_customer
                            FROM (
                                SELECT customerID, COUNT(*) AS order_count
                                FROM purchase
                                GROUP BY customerID
                            ) AS customer_orders`
    AVERAGE_ORDER_VALUE_CUSTOMER: `SELECT AVG(total_order_value) AS avg_order_value_per_customer
                                  FROM (
                                    SELECT customerID, SUM(total) AS total_order_value
                                    FROM purchase
                                    GROUP BY customerID
                                  ) AS customer_order_values`
    AVERAGE_PIZZAS_PER_ORDER_CUSTOMER: `SELECT AVG(pizzas_per_order) AS avg_pizzas_per_order
                                       FROM (
                                            SELECT purchase.customerID, purchase.purchaseID, COUNT(purchaseItems.SKU) AS pizzas_per_order
                                            FROM purchase
                                            JOIN purchaseItems ON purchase.purchaseID = purchaseItems.purchaseID
                                            JOIN products ON purchaseItems.SKU = products.SKU
                                            WHERE products.Category = 'Pizza'
                                            GROUP BY purchase.customerID, purchase.purchaseID
                                       ) AS pizzas_per_order_data`
    ORDER_FREQUENCY_CUSTOMER: `SELECT AVG(order_frequency) AS avg_order_frequency_in_days
                                FROM (
                                SELECT customerID, 
                                    COUNT(purchaseID) AS total_orders, 
                                    DATEDIFF(MAX(purchaseDate), MIN(purchaseDate)) AS customer_period, 
                                    COUNT(purchaseID) / DATEDIFF(MAX(purchaseDate), MIN(purchaseDate)) AS order_frequency
                                FROM purchase
                                GROUP BY customerID
                                ) AS customer_order_frequencies`
    

};
export default QUERIES; 