declare var choosenDate: any;
declare const colorsToExclude: string[];
declare function randomColor(): string;
declare function timeButtons(): void;
declare function revenueChart(best?: boolean, storeIDs?: never[], storeColors?: {}): Promise<unknown>;
declare function revenueBarChart(storeIDsColors?: {}, custom?: boolean): Promise<unknown>;
