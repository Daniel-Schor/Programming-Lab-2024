declare const theme = "#ccc";
declare const defaultDate = "2022-12-01";
declare const currentDate = "2022-12-31";
declare const colorsToExclude: string[];
declare function randomColor(): string;
declare function revenueChart(best?: boolean, storeIDs?: never[], storeColors?: {}, date?: string): Promise<unknown>;
declare function revenueBarChart(storeIDsColors?: {}, custom?: boolean, date?: string): Promise<unknown>;
declare function addMarkers(stores: any): void;
declare function storeLocationMap(): void;
