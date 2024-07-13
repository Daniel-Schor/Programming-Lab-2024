"use strict";
// TODO use env variables instead
/* MAIN STORE SITE
import * as dotenv from 'dotenv';

dotenv.config();
*/
// TODO use .env variables instead
const theme = '#ccc';
const currentDate = "2022-12-31";
let best = false;
let custom = false;
let curColors = false;
let firstClick = true;
// TODO move to Helper dir
let colorsToExclude = ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9'];
let excludedColors = new Set();
function randomColor() {
    // If all colors have been used, reset the excludedColors set
    if (excludedColors.size === colorsToExclude.length) {
        excludedColors.clear();
    }
    let color;
    do {
        // Randomly pick a color from colorsToExclude array
        color = colorsToExclude[Math.floor(Math.random() * colorsToExclude.length)];
    } while (excludedColors.has(color)); // Ensure the color hasn't been used before
    excludedColors.add(color); // Add color to excludedColors set
    return color;
}
function updateCharts(date) {
    // TODO wrong parameter 
    if (date) {
        localStorage.setItem('date', JSON.stringify(date));
    }
    if (firstClick || best) {
        bestButton(curColors);
    }
    else if (custom) {
        customButton(true);
    }
    else {
        worstButton(curColors);
    }
    pizzaPopularity();
}
// TODO move to generalCharts.ts
function updateChart(chart, option) {
    if (option && typeof option === "object") {
        chart.setOption(option, true);
    }
}
function bestButton(colors = {}) {
    let date = JSON.parse(localStorage.getItem("date"));
    if (best && !date) {
        return;
    }
    best = true;
    custom = false;
    firstClick = false;
    revenueChart(best, colors).then(colors => {
        curColors = colors;
        revenueBarChart(curColors, false);
    });
    setActiveButton("bestButton");
    storeLocationMap();
    revenueForecast();
}
function worstButton(colors = {}) {
    let date = JSON.parse(localStorage.getItem("date"));
    if (!best && !custom && !date) {
        return;
    }
    best = false;
    custom = false;
    firstClick = false;
    revenueChart(best, colors).then(colors => {
        curColors = colors;
        revenueBarChart(curColors, false);
    });
    setActiveButton("worstButton");
    storeLocationMap();
    revenueForecast();
}
async function customButton(update = false) {
    let date = JSON.parse(localStorage.getItem("date"));
    if (custom && !date) {
        return;
    }
    best = false;
    custom = true;
    firstClick = false;
    setActiveButton("customButton");
    while (custom) {
        try {
            let colors = curColors || {};
            if (update) {
                storeLocationMap();
                await revenueChart(best, colors);
            }
            colors = await revenueBarChart(curColors, custom);
            curColors = Object.fromEntries(Object.entries(colors).filter(([key, value]) => value !== undefined));
            if (Object.keys(curColors).length === 0) {
                bestButton();
                break;
            }
            if (!update) {
                storeLocationMap();
                await revenueChart(best, curColors);
            }
        }
        catch (error) {
            console.error("Error in customButton loop:", error);
            custom = false;
        }
    }
}
// TODO move to generalCharts.ts
function revenueChart(best = true, storeColors = {}) {
    let date = JSON.parse(localStorage.getItem("date"));
    return new Promise((resolve, reject) => {
        var days = [];
        let lineInfos = [];
        var dom = document.getElementById("revenue");
        var myChart = echarts.init(dom, theme, {
            renderer: "canvas",
            useDirtyRect: false,
        });
        let req = `/api/revenue?reverse=true&best=${best}&date=${date}`;
        if (Object.keys(storeColors).length != 0) {
            req += "&store=" + Object.keys(storeColors).join(",");
        }
        else {
            req += "&limit=5";
        }
        myChart.showLoading();
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
                    symbolSize: 0,
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
            var option = {
                tooltip: {
                    trigger: "axis",
                },
                legend: {
                    bottom: '30',
                    data: Object.keys(storeColors),
                    textStyle: {
                        color: 'white',
                        fontWeight: 'bold'
                    },
                    inactiveColor: '#b3b3b3'
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
            if (Object.keys(storeColors).length != 0) {
                myChart.clear();
            }
            updateChart(myChart, option);
            myChart.on('click', (params) => {
                window.location.href = `/store`;
                localStorage.setItem('store', JSON.stringify({ "storeID": params.seriesName })); // Store the store variable
            });
            window.addEventListener("resize", myChart.resize);
            myChart.hideLoading();
            resolve(storeColors);
        })
            .catch((error) => {
            console.error("Error fetching data:", error);
            reject(error);
        });
    });
}
function revenueBarChart(storeIDsColors = {}, custom = false) {
    let date = JSON.parse(localStorage.getItem("date"));
    return new Promise((resolve, reject) => {
        var chartDom = document.getElementById('revenueBar');
        var myChart = echarts.init(chartDom, theme);
        // Standard bar color
        const standardColor = '#ff4500';
        myChart.showLoading();
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
                    window.location.href = `/store`;
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
            myChart.hideLoading();
        })
            .catch((error) => {
            console.error("Error fetching data:", error);
        });
    });
}
function addMarkers(stores) {
    markersLayer.clearLayers();
    function createColoredMarkerIcon(color) {
        const svgIcon = `
      <svg width="32" height="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
        <path d="M16 0C10.477 0 6 4.477 6 10c0 8 10 20 10 20s10-12 10-20c0-5.523-4.477-10-10-10zm0 15a5 5 0 110-10 5 5 0 010 10z" fill="${color}" stroke="black" stroke-width="2"/>
      </svg>
    `;
        return L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
            iconSize: [32, 48],
            iconAnchor: [16, 48],
            popupAnchor: [0, -48]
        });
    }
    stores.forEach((store) => {
        if (curColors[store.storeID] == undefined) {
            return;
        }
        const marker = L.marker([store.lat, store.lon], { icon: createColoredMarkerIcon(curColors[store.storeID] || "#ff4500") }).addTo(markersLayer);
        /*marker.bindPopup(
          `<b>Store ID:</b> ${store.storeID}<br>`
        );
    
        // Show popup on hover
        marker.on("mouseover", function () {
          this.openPopup();
        });
    
        marker.on("mouseout", function () {
          this.closePopup();
        });*/
        // Redirect on click
        marker.on("click", () => {
            window.location.href = `/store`;
            localStorage.setItem("store", JSON.stringify(store)); // Store the store variable
        });
    });
}
function revenueForecast() {
    async function fetchRevenueForecast(date, dow) {
        const response = await fetch(`/api/revenue-forecast-analysis?date=${date}&dow=${dow}&store=all`);
        const data = await response.json();
        return data;
    }
    async function generateRevenueForecast() {
        let dow = JSON.parse(localStorage.getItem("dow"));
        let date = JSON.parse(localStorage.getItem("date"));
        var dom = document.getElementById("revenueForecast");
        var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);
        myChart.showLoading();
        const revenueData = await fetchRevenueForecast(date, dow);
        const hours = revenueData.map(entry => entry.hour);
        const avgValues = revenueData.map(entry => entry.avg);
        const lastValue = avgValues[avgValues.length - 1];
        const growthRate = 1.05;
        const forecastValues = [];
        for (let i = 1; i <= 12; i++) {
            forecastValues.push(lastValue * Math.pow(growthRate, i));
        }
        const allHours = [...hours, ...Array.from({ length: 12 }, (_, i) => `Forecast ${i + 1}`)];
        const avgValuesWithForecast = [...avgValues, ...forecastValues];
        var option = {
            title: {
                text: 'Revenue Forecast',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['Average Revenue', 'Forecast'],
                left: 'right'
            },
            grid: {
                top: '11%',
            }
        };
    }
}
function storeLocationMap() {
    // Add OpenStreetMap tile layer
    try {
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '',
            className: 'map-tiles'
        }).addTo(map);
    }
    catch (error) {
        console.error("IGNORE (does not affect functionality) Error adding OpenStreetMap tile layer:", error);
    }
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
async function pizzaPopularity() {
    var chartDom = document.getElementById("pizzaPopularity");
    var myChart = echarts.init(chartDom, theme);
    let date = JSON.parse(localStorage.getItem("date"));
    myChart.showLoading();
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
                    symbolSize: 0,
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
                left: '0%',
                right: '16%',
                bottom: '0%',
                top: '6%',
                containLabel: true
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
        myChart.hideLoading();
        option && myChart.setOption(option);
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}
function processData(data) {
    const totalEntries = data.length;
    // Determine desiredEntriesPerPizza based on totalEntries
    let desiredEntriesPerPizza;
    if (totalEntries < 260) {
        desiredEntriesPerPizza = 15;
    }
    else if (totalEntries > 270 && totalEntries <= 800) {
        desiredEntriesPerPizza = 30;
    }
    else {
        // Handle cases where totalEntries exceeds 800 (if needed)
        desiredEntriesPerPizza = 30; // Default to 30 for cases > 800
    }
    // Create a map to store filtered data for each pizza type
    const filteredDataMap = new Map();
    // Process each entry and group by pizza type
    data.forEach(item => {
        const pizzaName = item.Name;
        if (!filteredDataMap.has(pizzaName)) {
            filteredDataMap.set(pizzaName, []);
        }
        filteredDataMap.get(pizzaName).push(item);
    });
    // Filter each pizza type to retain only the desired number of entries
    const processedData = [];
    filteredDataMap.forEach((entries, pizzaName) => {
        const filteredEntries = entries.slice(0, desiredEntriesPerPizza);
        processedData.push(...filteredEntries);
    });
    return processedData.map(item => ({
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