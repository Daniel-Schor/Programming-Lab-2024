"use strict";
// TODO use env variables instead
/* MAIN STORE SITE
import * as dotenv from 'dotenv';

dotenv.config();
*/
// TODO use .env variables instead
const theme = '#ccc';
let defaultDate = "2022-12-01";
const currentDate = "2022-12-31";
let best = false;
let custom = false;
let curColors = false;
let firstClick = true;
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
    // TODO wrong parameter 
    defaultDate = date;
    if (firstClick || best) {
        bestButton(date, curColors);
    }
    else if (custom) {
        customButton(date, true);
    }
    else {
        worstButton(date, curColors);
    }
    //pizzaPopularity(date);
}
// TODO move to generalCharts.ts
function updateChart(chart, option) {
    if (option && typeof option === "object") {
        chart.setOption(option, true);
    }
}
function bestButton(date = defaultDate, colors = {}) {
    if (best) {
        return;
    }
    best = true;
    custom = false;
    firstClick = false;
    revenueChart(best, [], colors, date).then(colors => {
        curColors = colors;
        revenueBarChart(curColors, false, date);
    });
    setActiveButton("bestButton");
}
function worstButton(date = defaultDate, colors = {}) {
    if (!best && !custom) {
        return;
    }
    best = false;
    custom = false;
    firstClick = false;
    revenueChart(best, [], colors, date).then(colors => {
        curColors = colors;
        revenueBarChart(curColors, false, date);
    });
    setActiveButton("worstButton");
}
async function customButton(date = defaultDate, update = false) {
    defaultDate = date;
    best = false;
    custom = true;
    firstClick = false;
    setActiveButton("customButton");
    while (custom) {
        try {
            let colors = curColors || {};
            if (update) {
                await revenueChart(best, [], colors, date);
                await revenueBarChart(colors, custom, date);
            }
            else {
                colors = await revenueBarChart(curColors, custom, date);
                const filteredColors = Object.fromEntries(Object.entries(colors).filter(([key, value]) => value !== undefined));
                if (Object.keys(filteredColors).length === 0) {
                    bestButton(date);
                    break;
                }
                await revenueChart(best, [], filteredColors, date);
            }
        }
        catch (error) {
            console.error("Error in customButton loop:", error);
            custom = false;
        }
    }
}
// TODO move to generalCharts.ts
function revenueChart(best = true, storeIDs = [], storeColors = {}, date = defaultDate) {
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
                grid: {
                    left: '1%',
                    right: '5%',
                    bottom: '1%',
                    top: '4%',
                    containLabel: true
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
                window.location.href = `/store?storeID=${params.seriesName}`;
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
function revenueBarChart(storeIDsColors = {}, custom = false, date = defaultDate) {
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
                    left: '1%',
                    right: '4%',
                    bottom: '1%',
                    top: '1%',
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
                    window.location.href = `/store?storeID=${params.name}`;
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
            window.location.href = `/store?storeID=${store.storeID}`;
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
async function pizzaPopularity(date = defaultDate) {
    var chartDom = document.getElementById("pizzaPopularity");
    var myChart = echarts.init(chartDom, theme);
    var option;
    try {
        const response = await fetch(`/api/pizzaPopularity?date=${date}`);
        const data = await response.json();
        const processedData = processData(data);
        const names = Array.from(new Set(processedData.map(item => item.Name)));
        const dates = Array.from(new Set(processedData.map(item => item.purchaseDate)));
        const generateRankingData = () => {
            const rankingMap = new Map();
            dates.forEach(date => {
                const itemsForDate = processedData.filter(item => item.purchaseDate === date);
                itemsForDate.sort((a, b) => b.revenue - a.revenue);
                itemsForDate.forEach((item, index) => {
                    if (!rankingMap.has(item.Name)) {
                        rankingMap.set(item.Name, []);
                    }
                    rankingMap.get(item.Name).push({ rank: index + 1, revenue: item.revenue });
                });
            });
            return rankingMap;
        };
        const generateSeriesList = () => {
            const seriesList = [];
            const rankingMap = generateRankingData();
            rankingMap.forEach((data, name) => {
                const series = {
                    name,
                    symbolSize: 20,
                    type: 'line',
                    smooth: true,
                    emphasis: {
                        focus: 'series'
                    },
                    endLabel: {
                        show: true,
                        formatter: '{a}',
                        distance: 20
                    },
                    lineStyle: {
                        width: 4
                    },
                    data: data.map(item => item.rank), // Use rank for y-axis
                    revenueData: data.map(item => item.revenue) // Store revenue data separately
                };
                seriesList.push(series);
            });
            return seriesList;
        };
        const seriesList = generateSeriesList();
        option = {
            title: {
                text: 'Bump Chart (Ranking)'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line'
                },
                formatter: params => {
                    const item = params[0];
                    const series = seriesList.find(series => series.name === item.seriesName);
                    const revenue = series.revenueData[item.dataIndex];
                    return `${item.marker}${item.seriesName}: ${revenue.toFixed(2)}`;
                }
            },
            grid: {
                left: 30,
                right: 110,
                bottom: 30,
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                splitLine: {
                    show: true
                },
                axisLabel: {
                    margin: 30,
                    fontSize: 16
                },
                boundaryGap: false,
                data: dates
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    margin: 30,
                    fontSize: 16,
                    formatter: '#{value}'
                },
                inverse: true,
                interval: 1,
                min: 1,
                max: names.length
            },
            series: seriesList
        };
        option && myChart.setOption(option);
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}
function processData(data) {
    return data.map(item => ({
        Name: item.Name,
        purchaseDate: new Date(item.purchaseDate).toISOString().split("T")[0], // Format date to YYYY-MM-DD
        revenue: parseFloat(item.revenue) // Convert revenue to a number
    }));
}
function setActiveButton(buttonId) {
    document.getElementById("bestButton").classList.remove("active");
    document.getElementById("worstButton").classList.remove("active");
    document.getElementById("customButton").classList.remove("active");
    document.getElementById(buttonId).classList.add("active");
}
//# sourceMappingURL=charts.js.map