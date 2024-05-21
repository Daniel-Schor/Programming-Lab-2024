const currentDate = "2022-12-30";
export function topChangeRevenuePercentageIDs(cutOFDate, result, best = true) {
    const specificDates = [cutOFDate, currentDate];
    // Filter the rows to include only specific dates
    let removedDays = result.rows.filter(row => specificDates.includes(row.day));
    // Initialize the dictionary
    let daySum = {};
    // Populate the dictionary
    removedDays.forEach(element => {
        if (!daySum[element.storeID]) {
            daySum[element.storeID] = {};
        }
        daySum[element.storeID][element.day] = element.sum;
    });
    // Calculate percentage increases
    Object.keys(daySum).forEach(key => {
        daySum[key].percentageIncrease = ((daySum[key][currentDate] - daySum[key][cutOFDate]) / daySum[key][cutOFDate]) * 100;
    });
    // Extract the percentage increases and sort them
    let sortedPercentageIncreases = Object.keys(daySum)
        .map(key => ({
        storeID: key,
        percentageIncrease: daySum[key].percentageIncrease
    }))
        .sort((a, b) => b.percentageIncrease - a.percentageIncrease);
    if (!best) {
        sortedPercentageIncreases = sortedPercentageIncreases.reverse();
    }
    // Get the top 5 percentage increases
    let top5PercentageIncreases = sortedPercentageIncreases.slice(0, 5);
    // Construct a new object with the top 5 stores
    let top5DaySum = {};
    top5PercentageIncreases.forEach(item => {
        top5DaySum[item.storeID] = daySum[item.storeID];
    });
    return Object.keys(top5DaySum);
}
//# sourceMappingURL=functions.js.map