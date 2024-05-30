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

};
export default QUERIES;