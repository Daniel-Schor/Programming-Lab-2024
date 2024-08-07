declare const currentDate = "2022-12-31";
declare const theme = "infographic";
declare const spinnerRadius = 20;
declare const lineWidth = 10;
declare const spinnerColor = "#ff4500";
declare function monthlyRevenue(): void;
declare function gaugeChart(): void;
declare function heatmap(): void;
declare function pizzaSize(): void;
declare function abcAnalysis_customer_1(): void;
declare function abcAnalysis_customer_2(): void;
declare function abcAnalysis_pizza_1(): void;
declare function abcAnalysis_pizza_2(date?: string): void;
declare function pizza_price_popularity(): void;
declare function changeDow(index?: number): void;
declare function dailyOrders(): void;
declare function pizzaIngredients(): void;
declare function fetchAverageOrdersByDayOfWeek(): Promise<void>;
declare function fetchAverageRevenueByDayOfWeek(): Promise<void>;
declare function fetchAverageCustomersByDayOfWeek(): Promise<void>;
declare function fetchAveragePizzasSoldByDayOfWeek(): Promise<void>;
