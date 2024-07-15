function calculatePeriod(startDate, endDate) {
    let diffTime = Math.abs(endDate - startDate);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
function calculatePeriodMs(startDate, endDate) {
    let diffTime = Math.abs(endDate - startDate);
    return diffTime;
}
export { calculatePeriod, calculatePeriodMs };
//# sourceMappingURL=DayDiff.js.map