import * as echarts from 'echarts';
var myChart = echarts.init(document.getElementById("main"));
//get data from api
fetch("/revenue?date=2022-12-31&store=S062214,S013343,S216043")
    .then((response) => response.json())
    .then((data) => {
    const storeIDs = [];
    const days = [];
    const sums = [];
    // Splitting the data into separate arrays
    data.forEach((item) => {
        storeIDs.push(item.storeID);
        days.push(item.day);
        sums.push(item.sum);
    });
    // Logging the results to the console
    console.log("Store IDs:", storeIDs);
    console.log("Days:", days);
    console.log("Sums:", sums);
    let option = {
        tooltip: {},
        legend: {
            data: ["sales"],
        },
        xAxis: {
            //api data
            data: storeIDs,
        },
        yAxis: {},
        series: [
            {
                name: "sales",
                type: "bar",
                //api data
                data: sums,
            },
        ],
    };
    // Display the chart using the configuration items and data just specified.
    myChart.setOption(option);
})
    .catch((error) => {
    console.error("Error fetching the data:", error);
});
//# sourceMappingURL=charts.js.map