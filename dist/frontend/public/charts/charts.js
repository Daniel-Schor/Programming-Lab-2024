"use strict";
/* MAIN STORE SITE
import * as dotenv from 'dotenv';

dotenv.config();
*/
// TO DO use .env variables instead
const theme = '#ccc';
const currentDate = "2022-12-31";
const spinnerRadius = 20;
const lineWidth = 10;
const spinnerColor = '#ff4500';
let best = false;
let custom = false;
let curColors = false;
let firstClick = true;
let colorPalette = ['#660000', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', /*'#a65628',*/ '#f781bf', '#999999', 'white'];
let colorsToExclude = new Set();
function getNextColor() {
    while (true) {
        for (let i = 0; i < colorPalette.length; i++) {
            if (!colorsToExclude.has(colorPalette[i])) {
                colorsToExclude.add(colorPalette[i]);
                return colorPalette[i];
            }
        }
        colorsToExclude.clear();
    }
}
function updateCharts(date) {
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
    if (JSON.parse(localStorage.getItem("barChartTogglePressed"))) {
        return;
    }
    pizzaPopularity();
    fetchTotalOrders();
    fetchTotalRevenue();
    fetchTotalCustomers();
    fetchTotalPizzasSold();
    fetchAverageOrderCustomer();
    fetchAverageOrderValueCustomer();
    fetchAveragePizzasPerOrderCustomer();
    fetchAverageOrderFrequency();
    pizzaPopularity();
}
// TO DO move to generalCharts.ts
function updateChart(chart, option) {
    if (option && typeof option === "object") {
        chart.setOption(option, true);
    }
}
function bestButton(colors = {}) {
    /*let date = JSON.parse(localStorage.getItem("date"));
    if (best && !date) {
      return;
    }*/
    best = true;
    custom = false;
    firstClick = false;
    revenueChart(best, colors).then(colors => {
        curColors = colors;
        revenueBarChart(curColors, false);
    });
    colorsToExclude.clear();
    setActiveButton("bestButton");
    storeLocationMap();
    revenueForecast();
}
function worstButton(colors = {}) {
    /*let date = JSON.parse(localStorage.getItem("date"));
    if (!best && !custom && !date) {
      return;
    }*/
    best = false;
    custom = false;
    firstClick = false;
    revenueChart(best, colors).then(colors => {
        curColors = colors;
        revenueBarChart(curColors, false);
    });
    colorsToExclude.clear();
    setActiveButton("worstButton");
    storeLocationMap();
    revenueForecast();
}
async function customButton(update = false) {
    colorsToExclude = new Set(Object.values(curColors));
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
            colorsToExclude = new Set(Object.values(curColors));
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
        if (!JSON.parse(localStorage.getItem("barChartTogglePressed"))) {
            myChart.showLoading({
                color: spinnerColor,
                text: '',
                maskColor: 'rgba(255, 255, 255, 0)',
                zlevel: 1000,
                spinnerRadius: spinnerRadius,
                lineWidth: lineWidth,
            });
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
                    storeColors[storeID] = getNextColor();
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
                textStyle: {
                    color: "white"
                },
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
                        // FIXME make it work and add name
                        /*formatter: function (value) {
                          console.log(value);
                          return value / 1000 + 'k';
                        }*/
                    },
                ],
                yAxis: [
                    {
                        type: "value",
                    },
                ],
                series: lineInfos,
            };
            if (Object.keys(storeColors).length != 0 && !JSON.parse(localStorage.getItem("barChartTogglePressed"))) {
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
function setToggleBarChartButton() {
    if (JSON.parse(localStorage.getItem("barChartToggle"))) {
        document.getElementById('toggleBarChart').innerHTML = `
    <i class="fa-solid fa-chart-bar"></i>`;
    }
    else {
        document.getElementById('toggleBarChart').innerHTML = `
    <i class="fa-solid fa-chart-bar"></i>&nbsp;&nbsp;&nbsp;<i class="fa-solid fa-chart-bar"></i>`;
    }
}
function toggleBarChart() {
    if (JSON.parse(localStorage.getItem("barChartToggle"))) {
        localStorage.setItem("barChartToggle", JSON.stringify(false));
    }
    else {
        localStorage.setItem("barChartToggle", JSON.stringify(true));
    }
    setToggleBarChartButton();
    localStorage.setItem("barChartTogglePressed", JSON.stringify(true));
    updateCharts();
}
function revenueBarChart(storeIDsColors = {}, custom = false) {
    let date = JSON.parse(localStorage.getItem("date"));
    return new Promise((resolve, reject) => {
        var chartDom = document.getElementById('revenueBar');
        var myChart = echarts.init(chartDom, theme);
        // Standard bar color
        const standardColor = '#ff4500';
        myChart.showLoading({
            color: spinnerColor,
            text: '',
            maskColor: 'rgba(255, 255, 255, 0)',
            zlevel: 1000,
            spinnerRadius: spinnerRadius,
            lineWidth: lineWidth,
        });
        let req = `/api/total-store-revenue?date=${date}`;
        fetch(req)
            .then((response) => response.json())
            .then((data) => {
            let barChartToggle = JSON.parse(localStorage.getItem("barChartToggle")) || false;
            let option = {};
            if (JSON.parse(localStorage.getItem("barChartTogglePressed"))) {
                myChart.clear();
                localStorage.setItem("barChartTogglePressed", JSON.stringify(false));
            }
            const storeNames = Object.keys(data);
            const storeRevenues = Object.values(data);
            // Split the store names and revenues into two halves
            const middleIndex = Math.ceil(storeNames.length / 2);
            const storeNamesLeft = storeNames.slice(0, middleIndex);
            const storeNamesRight = storeNames.slice(middleIndex);
            const storeRevenuesLeft = storeRevenues.slice(0, middleIndex);
            const storeRevenuesRight = storeRevenues.slice(middleIndex);
            if (barChartToggle) {
                option = {
                    textStyle: {
                        color: "white"
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        },
                        formatter: function (params) {
                            let store = params[0];
                            return `${store.marker} ${store.name}</br>Revenue: ${store.value}$`;
                        }
                    },
                    grid: [
                        { left: '1%', right: '50%', bottom: '6%', top: '1%', containLabel: true },
                        { left: '51%', right: '2%', bottom: '6%', top: '1%', containLabel: true }
                    ],
                    xAxis: [
                        {
                            type: 'value', gridIndex: 0, axisLabel: {
                                formatter: function (value) {
                                    return value / 1000 + 'k';
                                }
                            },
                            name: 'Revenue',
                            nameLocation: 'middle', // Position name in the middle of the y-axis
                            nameTextStyle: {
                                padding: [10, 0, 0, 426], // Adjust the padding to customize position,
                            },
                        },
                        {
                            type: 'value', gridIndex: 1, axisLabel: {
                                formatter: function (value) {
                                    return value / 1000 + 'k';
                                }
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'category',
                            gridIndex: 0,
                            data: storeNamesLeft,
                            axisTick: { alignWithLabel: true },
                            axisLabel: {
                                fontSize: 12,
                            }
                        },
                        {
                            type: 'category',
                            gridIndex: 1,
                            data: storeNamesRight,
                            axisTick: { alignWithLabel: true },
                            axisLabel: {
                                fontSize: 12,
                            }
                        }
                    ],
                    series: [
                        {
                            name: 'Total Revenue',
                            type: 'bar',
                            xAxisIndex: 0,
                            yAxisIndex: 0,
                            barWidth: '60%',
                            data: storeRevenuesLeft.map((value, index) => ({
                                value: value,
                                itemStyle: {
                                    color: storeIDsColors[storeNamesLeft[index]] || standardColor
                                }
                            }))
                        },
                        {
                            name: 'Total Revenue',
                            type: 'bar',
                            xAxisIndex: 1,
                            yAxisIndex: 1,
                            barWidth: '60%',
                            data: storeRevenuesRight.map((value, index) => ({
                                value: value,
                                itemStyle: {
                                    color: storeIDsColors[storeNamesRight[index]] || standardColor
                                }
                            }))
                        }
                    ]
                };
            }
            else {
                option = {
                    textStyle: {
                        color: "white"
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        },
                        formatter: function (params) {
                            let store = params[0];
                            return `${store.marker} ${store.name}</br>Revenue: ${store.value}$`;
                        }
                    },
                    grid: {
                        left: '1%',
                        right: '2%',
                        bottom: '6%',
                        top: '1%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'value',
                            axisLabel: {
                                formatter: function (value) {
                                    return value / 1000 + 'k';
                                }
                            },
                            name: 'Revenue',
                            nameLocation: 'middle', // Position name in the middle of the y-axis
                            nameTextStyle: {
                                padding: [10, 0, 0, 0], // Adjust the padding to customize position,
                            },
                        },
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
            }
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
                        if (Object.keys(storeIDsColors).length === colorPalette.length) {
                            option.tooltip.formatter = function (params) {
                                let store = params[0];
                                let output = `${store.marker} ${store.name}</br>Revenue: ${store.value}$`;
                                if (!Object.keys(curColors).includes(store.name)) {
                                    output = `
                    <div style="
                      color: black; 
                      font-size: 20px;
                      font-weight: 'bold';
                      margin: 0px;
                      padding: 0px;">
                        LIMIT REACHED
                    </div>
                    </br>` + output;
                                }
                                return output;
                            };
                            updateChart(myChart, option);
                            return;
                        }
                        storeIDsColors[params.name] = getNextColor();
                    }
                    else {
                        storeIDsColors[params.name] = undefined;
                    }
                    if (barChartToggle) {
                        option = {
                            series: [
                                {
                                    name: 'Total Revenue',
                                    type: 'bar',
                                    xAxisIndex: 0,
                                    yAxisIndex: 0,
                                    barWidth: '60%',
                                    data: storeRevenuesLeft.map((value, index) => ({
                                        value: value,
                                        itemStyle: {
                                            color: storeIDsColors[storeNamesLeft[index]]
                                        }
                                    }))
                                },
                                {
                                    name: 'Total Revenue',
                                    type: 'bar',
                                    xAxisIndex: 1,
                                    yAxisIndex: 1,
                                    barWidth: '60%',
                                    data: storeRevenuesRight.map((value, index) => ({
                                        value: value,
                                        itemStyle: {
                                            color: storeIDsColors[storeNamesRight[index]]
                                        }
                                    }))
                                }
                            ]
                        };
                    }
                    else {
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
                    }
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
/*function revenueForecast() {
  const currentYear = new Date().getFullYear().toString();
  let startDate = `${currentYear}-01-01`;
  let date = JSON.parse(localStorage.getItem("date")) || currentDate;
  
  var dom = document.getElementById("revenueForecast");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);

  if (!JSON.parse(localStorage.getItem("barChartTogglePressed"))) {
    myChart.showLoading({
      color: spinnerColor,
      text: '',
      maskColor: 'rgba(255, 255, 255, 0)',
      zlevel: 1000,
      spinnerRadius: spinnerRadius,
      lineWidth: lineWidth,
    });
  }

  fetch(`/api/revenue-forecast-analysis?date=${startDate}`)
    .then((response) => response.json())
    .then((responseData) => {
      let data = responseData.data;
      let periods = data.map(item => new Date(item.period).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short"
      }));
      let revenues = data.map(item => parseFloat(item.revenue));

      var option = {
        textStyle: {
          color: "white"
        },
        grid: {
          top: '11%',
          bottom: '7%',
          left: '6%',
          right: '6%'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: periods,
          name: "Period",
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '30%'],
          name: "Revenue ($)",
        },
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            let index = params[0].dataIndex;
            return `Period: ${periods[index]}<br/>Revenue: ${revenues[index].toFixed(2)} $`;
          },
        },
        visualMap: {
          type: 'piecewise',
          show: false,
          dimension: 0,
          seriesIndex: 0,
          pieces: [
            {
              gt: 5,
              lt: 9,
              color: 'rgba(0, 0, 180, 0.4)'
            }
          ]
        },
        series: [
          {
            type: 'line',
            smooth: 0.6,
            symbol: 'none',
            lineStyle: {
              color: '#5470C6',
              width: 5
            },
            markLine: {
              symbol: ['none', 'none'],
              label: { show: false },
              data: [{ xAxis: 5 }]
            },
            areaStyle: {},
            data: revenues
          }
        ]
      };

      myChart.hideLoading();
      myChart.setOption(option);
    })
    .catch((error) => {
      console.error("Error fetching revenue forecast data:", error);
    });
}*/
/*function revenueForecast() {
  const currentYear = new Date().getFullYear().toString();
  let startDate = `${currentYear}-01-01`;

  var dom = document.getElementById("revenueForecast");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);

  if (!JSON.parse(localStorage.getItem("barChartTogglePressed"))) {
    myChart.showLoading({
      color: spinnerColor,
      text: '',
      maskColor: 'rgba(255, 255, 255, 0)',
      zlevel: 1000,
      spinnerRadius: spinnerRadius,
      lineWidth: lineWidth,
    });
  }

  fetch(`/api/revenue-forecast-analysis?date=${date}`)
    .then((response) => response.json())
    .then((responseData) => {
      let data = responseData.data;
      let periods = data.map(item => new Date(item.period).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short"
      }));
      let revenues = data.map(item => parseFloat(item.revenue));

      var option = {
        textStyle: {
          color: "white"
        },
        grid: {
          top: '11%',
          bottom: '7%',
          left: '6%',
          right: '6%'
        },
        xAxis: {
          type: "category",
          data: periods,
          name: "Period",
        },
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            let index = params[0].dataIndex;
            return `Period: ${periods[index]}<br/>Revenue: ${revenues[index].toFixed(2)} $`;
          },
        },
        yAxis: {
          type: "value",
          name: "Revenue ($)",
        },
        series: [
          {
            data: revenues,
            type: "line",
            smooth: true,
            name: "Revenue",
            symbolSize: 0
          },
        ],
      };

      myChart.hideLoading();
      myChart.setOption(option);
    })
    .catch((error) => {
      console.error("Error fetching revenue forecast data:", error);
    });
}*/
function revenueForecast() {
    let date = JSON.parse(localStorage.getItem("date"));
    var dom = document.getElementById("revenueForecast");
    var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);
    if (!JSON.parse(localStorage.getItem("barChartTogglePressed"))) {
        myChart.showLoading({
            color: spinnerColor,
            text: '',
            maskColor: 'rgba(255, 255, 255, 0)',
            zlevel: 1000,
            spinnerRadius: spinnerRadius,
            lineWidth: lineWidth,
        });
    }
    fetch(`/api/revenue-forecast-analysis?date=${date}`)
        .then((response) => response.json())
        .then((responseData) => {
        let data = responseData.data;
        let periods = data.map(item => new Date(item.period).toLocaleDateString("de-DE", {
            year: "numeric",
            month: "short"
        }));
        let revenues = data.map(item => parseFloat(item.revenue));
        var option = {
            textStyle: {
                color: "white"
            },
            grid: {
                top: '11%',
                bottom: '7%',
                left: '12%',
                right: '12%'
            },
            xAxis: {
                type: "category",
                data: periods,
                name: "Period",
            },
            tooltip: {
                trigger: "axis",
                formatter: function (params) {
                    let index = params[0].dataIndex;
                    return `Period: ${periods[index]}<br/>Revenue: ${revenues[index].toFixed(2)} €`;
                },
            },
            yAxis: {
                type: "value",
                name: "Revenue (€)",
            },
            series: [
                {
                    data: revenues,
                    type: "line",
                    smooth: true,
                    name: "Revenue",
                    symbolSize: 0
                },
            ],
        };
        myChart.hideLoading();
        myChart.setOption(option);
    })
        .catch((error) => {
        console.error("Error fetching revenue forecast data:", error);
    });
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
        addMarkers(stores); // Add markers to the map
    })
        .catch((error) => console.error("Error fetching data:", error));
}
async function pizzaPopularity() {
    var chartDom = document.getElementById("pizzaPopularity");
    var myChart = echarts.init(chartDom, theme);
    let date = JSON.parse(localStorage.getItem("date"));
    myChart.showLoading({
        color: spinnerColor,
        text: '',
        maskColor: 'rgba(255, 255, 255, 0)',
        zlevel: 1000,
        spinnerRadius: spinnerRadius,
        lineWidth: lineWidth,
    });
    var option;
    try {
        const response = await fetch(`/api/pizzaPopularity?date=${date}`);
        const data = await response.json();
        data.map((item) => { item.Name = item.Name.replace(/ Pizza$/, ""); return item; });
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
            textStyle: {
                color: "white"
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line'
                },
                position: function (point, params, dom, rect, size) {
                    return [point[0], point[1] - size.contentSize[1] - 10];
                },
                formatter: params => {
                    let param = params[0];
                    let result = "Date: " + param.name + '</br>';
                    for (let i = 0; i < params.length; i++) {
                        for (let j = 0; j < params.length; j++) {
                            if (params[j].value === i + 1) {
                                param = params[j];
                                break;
                            }
                        }
                        let series = seriesList.find(series => series.name === param.seriesName);
                        let revenue = series.revenueData[param.dataIndex];
                        result += `
            ${param.data}
            ${param.marker}
            ${param.seriesName} Pizza - Revenue: 
            ${revenue.toFixed(2)}$</br>`;
                    }
                    return result;
                }
            },
            grid: {
                left: '1%',
                right: '13%',
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
    const useWeeklyData = totalEntries > 280; // Aggregate weekly if entries are above 270, else daily
    // Determine desiredEntriesPerPizza based on totalEntries
    let desiredEntriesPerPizza = totalEntries < 290 ? 15 : 30; // Simplified the previous conditions
    const aggregatedDataMap = new Map();
    // Process each entry for aggregation
    data.forEach(item => {
        const pizzaName = item.Name;
        const date = new Date(item.purchaseDate);
        const aggregationKey = useWeeklyData ? `Week ${getWeekNumber(date)}, ${date.getFullYear()}` : date.toISOString().split("T")[0];
        if (!aggregatedDataMap.has(pizzaName)) {
            aggregatedDataMap.set(pizzaName, new Map());
        }
        if (!aggregatedDataMap.get(pizzaName).has(aggregationKey)) {
            aggregatedDataMap.get(pizzaName).set(aggregationKey, {
                revenue: 0,
                count: 0,
                earliestDate: date
            });
        }
        let entry = aggregatedDataMap.get(pizzaName).get(aggregationKey);
        entry.revenue += parseFloat(item.revenue);
        entry.count++;
        if (date < entry.earliestDate) {
            entry.earliestDate = date; // Update to the earliest date in the aggregation period
        }
    });
    // Create a final processed data array
    const processedData = [];
    aggregatedDataMap.forEach((datesMap, pizzaName) => {
        datesMap.forEach((info, key) => {
            processedData.push({
                Name: pizzaName,
                purchaseDate: info.earliestDate.toISOString().split("T")[0], // Always use the specific date format
                revenue: info.revenue / info.count
            });
        });
    });
    return processedData.sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate)); // Sort by date
}
// Helper function to calculate week number
function getWeekNumber(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return Math.ceil(day / 7);
}
function setActiveButton(buttonId) {
    document.getElementById("bestButton").classList.remove("active");
    document.getElementById("worstButton").classList.remove("active");
    document.getElementById("customButton").classList.remove("active");
    document.getElementById(buttonId).classList.add("active");
}
//# sourceMappingURL=charts.js.map