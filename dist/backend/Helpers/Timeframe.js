function getTimeframeInDays(startDate, endDate = process.env.CURRENT_DATE) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMilliseconds = end.getTime() - start.getTime();
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
    return diffInDays;
}
export { getTimeframeInDays };
//# sourceMappingURL=Timeframe.js.map