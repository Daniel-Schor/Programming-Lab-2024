"use strict";
// TODO use env variables instead
/*
import * as dotenv from 'dotenv';

dotenv.config();
*/
var choosenDate;
const theme = 'dark';
const colorsToExclude = [
    "#0000FF", "#0000EE", "#0000CD", "#0000BB", "#0000AA",
    "#000099", "#000088", "#000077", "#3d85c6", "#16537e"
];
function randomColor() {
    let color;
    do {
        color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        color = color.toUpperCase();
        color = color.padEnd(7, '0');
    } while (colorsToExclude.includes(color));
    colorsToExclude.push(color);
    return color;
}
function statsOverview() {
    // Abrufen der storeID aus dem localStorage
    var store = JSON.parse(localStorage.getItem("store"));
    var date = "2022-01-01"; // Beispiel-Datum für die Abfragen
    // Definieren der API-Endpunkte
    const apiEndpoints = [
        `/api/totalRevenue?date=${date}`,
        `/api/totalPizzas?date=${date}`,
        `/api/totalOrders?date=${date}`,
        `/api/averageOrderValue?date=${date}`,
        `/api/pizzasPerOrder?date=${date}`
    ];
    // Erstellen eines Arrays von Fetch-Promises
    const fetchPromises = apiEndpoints.map(endpoint => fetch(endpoint).then(response => response.json()));
    // Verwenden von Promise.all, um auf alle Fetch-Anfragen zu warten
    return Promise.all(fetchPromises)
        .then(dataArray => {
        // Kombinieren der Daten von den APIs
        const [totalRevenueData, totalPizzasData, totalOrdersData, averageOrderValueData, pizzasPerOrderData] = dataArray;
        var order = Math.round(totalRevenueData[0].total_revenue);
        var order_1 = Math.round(totalPizzasData[0].total_pizza);
        var order_2 = Math.round(totalOrdersData[0].total_orders);
        var order_3 = Math.round(averageOrderValueData[0].average_order_value);
        var order_4 = parseFloat(pizzasPerOrderData[0].pizzas_order).toFixed(2);
        // Ausgabe der Daten in der Konsole
        console.log("Total Revenue Data:", order);
        console.log("Total Pizzas Data:", order_1);
        console.log("Total Orders Data:", order_2);
        console.log("Average Order Value Data:", order_3);
        console.log("Pizzas Per Order Data:", order_4);
        document.getElementById("statsOverview").innerHTML = `
        <div class="stat-item">
          <h3>Total Revenue</h3>
          <p>${order}</p>
        </div>
        <div class="stat-item">
          <h3>Total Pizzas</h3>
          <p>${order_1}</p>
        </div>
        <div class="stat-item">
          <h3>Total Orders</h3>
          <p>${order_2}</p>
        </div>
        <div class="stat-item">
          <h3>Average Order Value</h3>
          <p>${order_3}</p>
        </div>
        <div class="stat-item">
          <h3>Average Pizzas per Order</h3>
          <p>${order_4}</p>
        </div>
      `;
    })
        .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
    });
}
function timeButtons() {
    document.getElementById("Last-Year").addEventListener("click", function () {
        console.log(choosenDate);
    });
    document.getElementById("Last-Month").addEventListener("click", function () {
        console.log(choosenDate);
    });
    document
        .getElementById("Last-Quarter")
        .addEventListener("click", function () {
        console.log(choosenDate);
    });
}
function customDate() {
    document.getElementById('customDate').addEventListener('click', function () {
        document.getElementById('customDateForm').style.display = 'block';
    });
    const endDate = '2022-12-01';
    document.getElementById('dateForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const startDate = document.getElementById('startDate').value;
        choosenDate = startDate;
        console.log(choosenDate);
    });
}
function revenueChart(best = true, storeIDs = [], storeColors = {}) {
    return new Promise((resolve, reject) => {
        var days = [];
        let lineInfos = [];
        let req = `/api/revenue?reverse=true&best=${best}`;
        if (Object.keys(storeColors).length != 0) {
            req += "&store=" + Object.keys(storeColors).join(",");
        }
        else if (storeIDs.length != 0) {
            req += "&store=" + storeIDs.join(",");
        }
        else {
            req += "&limit=5";
        }
        fetch(req)
            .then((response) => response.json())
            .then((data) => {
            let orderedStoreIDs = [];
            days = Object.keys(data[Object.keys(data)[0]]);
            days.pop("changeValue");
            Object.keys(data).forEach((storeID, index) => {
                delete data[storeID]["changeValue"];
                orderedStoreIDs.push(storeID);
                if (storeColors[storeID] == undefined) {
                    storeColors[storeID] = randomColor();
                }
                lineInfos.push({
                    name: storeID,
                    type: "line",
                    emphasis: {
                        focus: "series",
                    },
                    itemStyle: {
                        color: storeColors[storeID],
                    },
                    data: Object.values(data[storeID]),
                });
            });
            var dom = document.getElementById("revenue");
            var myChart = echarts.init(dom, theme, {
                renderer: "canvas",
                useDirtyRect: false,
            });
            var option = {
                tooltip: {
                    trigger: "axis",
                },
                legend: {
                    data: orderedStoreIDs,
                },
                toolbox: {
                    feature: {
                        saveAsImage: {},
                    },
                },
                grid: {
                    left: "3%",
                    right: "1%",
                    bottom: "3%",
                    containLabel: true,
                },
                xAxis: [
                    {
                        type: "category",
                        boundaryGap: false,
                        data: days,
                    },
                ],
                yAxis: [
                    {
                        type: "value",
                    },
                ],
                series: lineInfos,
            };
            if (storeIDs.length != 0 || Object.keys(storeColors).length != 0) {
                myChart.clear();
            }
            if (option && typeof option === "object") {
                myChart.setOption(option);
            }
            myChart.on('click', (params) => {
                window.location.href = `/individualStore?storeID=${params.seriesName}`;
                localStorage.setItem('store', JSON.stringify({ "storeID": params.seriesName })); // Store the store variable
            });
            window.addEventListener("resize", myChart.resize);
            resolve(storeColors);
        })
            .catch((error) => {
            console.error("Error fetching data:", error);
            reject(error);
        });
    });
}
function revenueBarChart(storeIDsColors = {}, custom = false) {
    return new Promise((resolve, reject) => {
        var chartDom = document.getElementById('revenueBar');
        var myChart = echarts.init(chartDom, theme);
        let req = `/api/total-store-revenue`;
        fetch(req)
            .then((response) => response.json())
            .then((data) => {
            var option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'value'
                    }
                ],
                yAxis: [
                    {
                        type: 'category',
                        data: Object.keys(data),
                        axisTick: {
                            alignWithLabel: true
                        }
                    }
                ],
                series: [
                    {
                        name: 'Total Revenue',
                        type: 'bar',
                        barWidth: '60%',
                        data: Object.values(data).map((value, index) => ({
                            value: value,
                            itemStyle: {
                                color: storeIDsColors[Object.keys(data)[index]]
                            }
                        }))
                    }
                ]
            };
            option && myChart.setOption(option);
            if (!custom) {
                myChart.off('click');
                myChart.on('click', (params) => {
                    window.location.href = `/individualStore?storeID=${params.name}`;
                    localStorage.setItem('store', JSON.stringify({ "storeID": params.name })); // Store the store variable
                });
            }
            else {
                myChart.off('click');
                myChart.on('click', (params) => {
                    if (storeIDsColors[params.name] == undefined) {
                        storeIDsColors[params.name] = randomColor();
                    }
                    else {
                        storeIDsColors[params.name] = undefined;
                    }
                    option = {
                        series: [
                            {
                                name: 'Total Revenue',
                                type: 'bar',
                                barWidth: '60%',
                                data: Object.values(data).map((value, index) => ({
                                    value: value,
                                    itemStyle: {
                                        color: storeIDsColors[Object.keys(data)[index]]
                                    }
                                }))
                            }
                        ]
                    };
                    option && myChart.setOption(option);
                    resolve(storeIDsColors);
                });
            }
        })
            .catch((error) => {
            console.error("Error fetching data:", error);
        });
    });
}
//# sourceMappingURL=charts.js.map