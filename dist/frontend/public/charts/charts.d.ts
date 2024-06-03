declare var choosenDate: any;
declare const theme = "#ccc";
declare const colorsToExclude: string[];
declare function randomColor(): string;
declare function timeButtons(): void;
declare function revenueChart(best?: boolean, storeIDs?: never[], storeColors?: {}): Promise<unknown>;
declare function revenueBarChart(storeIDsColors?: {}, custom?: boolean): Promise<unknown>;
declare function addMarkers(stores: any): void;
declare function storeLocationMap(): void;
