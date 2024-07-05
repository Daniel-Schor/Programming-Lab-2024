"use strict";
// TODO use env variables instead
/*
import * as dotenv from 'dotenv';

dotenv.config();
*/
// TODO use .env variables instead
const theme = '#ccc';
const defaultDate = "2022-12-01";
const currentDate = "2022-12-31";
// TODO move to Helper dir
const colorsToExclude = [
    "#0000FF", "#0000EE", "#0000CD", "#0000BB", "#0000AA",
    "#000099", "#000088", "#000077", "#3d85c6", "#16537e"
];
// TODO move to Helper dir
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
function updateCharts(date) {
    statOverview(date);
}
// TODO move to generalCharts.ts
function updateChart(chart, option) {
    if (option && typeof option === "object") {
        chart.setOption(option, true);
    }
}
function setActiveButton(buttonId) {
    document.getElementById("bestButton").classList.remove("active");
    document.getElementById("worstButton").classList.remove("active");
    document.getElementById("customButton").classList.remove("active");
    document.getElementById("Last-Year").classList.remove("active");
    document.getElementById("Last-Quarter").classList.remove("active");
    document.getElementById("Last-Month").classList.remove("active");
    document.getElementById("customDate").classList.remove("active");
    document.getElementById(buttonId).classList.add("active");
}
let best;
let custom;
let curColors;
let firstClick = true;
function bestButton() {
    best = true;
    custom = false;
    firstClick = false;
    revenueChart(best).then(colors => {
        curColors = colors;
        revenueBarChart(curColors);
    });
    setActiveButton("bestButton");
}
function worstButton() {
    best = false;
    custom = false;
    firstClick = false;
    revenueChart(best).then(colors => {
        curColors = colors;
        revenueBarChart(curColors);
    });
    setActiveButton("worstButton");
}
async function customButton() {
    custom = true;
    firstClick = false;
    setActiveButton("customButton");
    while (custom) {
        try {
            const colors = await revenueBarChart(curColors, custom);
            const filteredColors = Object.fromEntries(Object.entries(colors).filter(([key, value]) => value !== undefined));
            await revenueChart(best, [], filteredColors);
        }
        catch (error) {
            console.error("Error in customButton loop:", error);
            custom = false;
        }
    }
}
// TODO move to generalCharts.ts
function revenueChart(best = true, storeIDs = [], storeColors = {}, date = "2022-12-01") {
    return new Promise((resolve, reject) => {
        var days = [];
        let lineInfos = [];
        let req = `/api/revenue?reverse=true&best=${best}&date=${date}`;
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
                    smooth: true
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
            updateChart(myChart, option);
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
function revenueBarChart(storeIDsColors = {}, custom = false, date = "2022-12-01") {
    return new Promise((resolve, reject) => {
        var chartDom = document.getElementById('revenueBar');
        var myChart = echarts.init(chartDom, theme);
        // Standard bar color
        const standardColors = ["#4A4A4A", "#FF7043", "#FFA500", "#001AFF", "#FFB347"];
        const standardColor = standardColors[1];
        let req = `/api/total-store-revenue?date=${date}`;
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
                                color: storeIDsColors[Object.keys(data)[index]] || standardColor
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
                    // TODO: peter check
                    //updateChart(myChart, option);
                    resolve(storeIDsColors);
                });
            }
        })
            .catch((error) => {
            console.error("Error fetching data:", error);
        });
    });
}
function addMarkers(stores) {
    stores.forEach((store) => {
        const marker = L.marker([store.lat, store.lon]).addTo(map);
        marker.bindPopup(`<b>Store ID:</b> ${store.storeID}<br><b>Latitude:</b> ${store.lat}<br><b>Longitude:</b> ${store.lon}`);
        // Show popup on hover
        marker.on("mouseover", function () {
            this.openPopup();
        });
        marker.on("mouseout", function () {
            this.closePopup();
        });
        // Redirect on click
        marker.on("click", () => {
            window.location.href = `/individualStore?storeID=${store.storeID}`;
            localStorage.setItem("store", JSON.stringify(store)); // Store the store variable
        });
    });
}
function storeLocationMap() {
    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '',
    }).addTo(map);
    // Function to add markers to the map
    // Fetch the data and add markers
    fetch("/api/storeLocations")
        .then((response) => response.json())
        .then((stores) => {
        //console.log(stores); // Log the data for debugging
        addMarkers(stores); // Add markers to the map
    })
        .catch((error) => console.error("Error fetching data:", error));
}
//# sourceMappingURL=charts.js.map