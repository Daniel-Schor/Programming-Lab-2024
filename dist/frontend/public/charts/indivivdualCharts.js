"use strict";
// TODO use .env variables instead
const defaultDate = "2022-12-01";
const currentDate = "2022-12-31";
const theme = '#ccc';
function updateCharts(date) {
    monthlyRevenue(date);
    gaugeChart(date);
    statOverview(date);
    pizzaSize(date);
    heatmap(date);
    pizzaIngredients(date);
}
// TODO move to generalCharts.ts
// TODO move to generalCharts.ts
function updateChart(chart, option) {
    if (option && typeof option === "object") {
        chart.setOption(option, true);
    }
}
// TODO move to generalCharts.ts
function monthlyRevenue(date = "2022-12-01") {
    var store = JSON.parse(localStorage.getItem("store"));
    var dom = document.getElementById("Store-revenue");
    var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);
    myChart.showLoading();
    fetch(`/api/revenue?reverse=true&date=${date}&store=${store.storeID}`)
        .then((response) => response.json())
        .then((data) => {
        let revenue = data[store.storeID];
        delete revenue.changeValue;
        revenue = Object.values(revenue);
        let days = data[store.storeID];
        delete days.changeValue;
        days = Object.keys(days);
        var option = {
            xAxis: { type: "category", data: days },
            tooltip: { trigger: "axis" },
            legend: { data: [store.storeID] },
            toolbox: { feature: { saveAsImage: {} } },
            yAxis: { type: "value" },
            series: [{ data: revenue, type: "line", smooth: true }],
        };
        myChart.hideLoading();
        updateChart(myChart, option);
    });
}
function gaugeChart(date = "2022-12-01") {
    var store = JSON.parse(localStorage.getItem("store"));
    var dom = document.getElementById("quality");
    var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);
    //document.getElementById("Store-quality").innerHTML = `Store: ${store.storeID} Quality`;
    fetch(`/api/quality?date=${date}&store=${store.storeID}`)
        .then((response) => response.json())
        .then((data) => {
        var gaugeData = [
            { value: Math.round(data[0].overall), name: "Overall", title: { offsetCenter: ["0%", "-60%"] }, detail: { valueAnimation: true, offsetCenter: ["0%", "-50%"] } },
            { value: Math.round(data[0].loyalty), name: "Loyalty", title: { offsetCenter: ["0%", "-40%"] }, detail: { valueAnimation: true, offsetCenter: ["0%", "-30%"] } },
            { value: Math.round(data[0].order), name: "Orders", title: { offsetCenter: ["0%", "-20%"] }, detail: { valueAnimation: true, offsetCenter: ["0%", "-10%"] } },
            { value: Math.round(data[0].single), name: "Single", title: { offsetCenter: ["0%", "00%"] }, detail: { valueAnimation: true, offsetCenter: ["0%", "10%"] } },
        ];
        var option = {
            series: [{
                    type: "gauge",
                    startAngle: 90,
                    endAngle: -270,
                    pointer: { show: false },
                    progress: { show: true, overlap: false, roundCap: true, clip: false, itemStyle: { borderWidth: 1, borderColor: "#464646" } },
                    axisLine: { lineStyle: { width: 40 } },
                    splitLine: { show: false, distance: 0, length: 10 },
                    axisTick: { show: false },
                    axisLabel: { show: false, distance: 50 },
                    data: gaugeData,
                    title: { fontSize: 14 },
                    detail: { width: 50, height: 14, fontSize: 14, color: "inherit", borderColor: "inherit", borderRadius: 20, borderWidth: 1, formatter: "{value}" }
                }],
        };
        updateChart(myChart, option);
    })
        .catch((error) => {
        console.error("Error:", error);
    });
}
function heatmap(date = "2022-12-01") {
    var store = JSON.parse(localStorage.getItem("store"));
    var dom = document.getElementById("Heatmap");
    var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);
    var option;
    let newData = [];
    fetch(`/api/pizzaPairs?date=${date}&store=${store.storeID}`)
        .then((response) => response.json())
        .then((querieResult) => {
        const pizzas = Object.keys(querieResult);
        let min = querieResult[pizzas[0]][pizzas[1]];
        let max = 0;
        pizzas.forEach((item) => {
            Object.keys(querieResult[item]).forEach((item2) => {
                let a = pizzas.indexOf(item2);
                let b = pizzas.indexOf(item);
                let c = querieResult[item][item2];
                if (c < min) {
                    min = c;
                }
                else if (c > max) {
                    max = c;
                }
                newData.push([a, b, c]);
            });
        });
        //----
        option = {
            tooltip: { position: "top" },
            grid: { height: "50%", top: "10%" },
            xAxis: { type: "category", data: pizzas, splitArea: { show: true } },
            yAxis: { type: "category", data: pizzas, splitArea: { show: true } },
            visualMap: { min: min, max: max, calculable: true, orient: "horizontal", left: "center", bottom: "15%" },
            series: [{
                    name: "Combination with",
                    type: "heatmap",
                    data: newData,
                    label: { show: true },
                    emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.5)" } },
                }],
        };
        updateChart(myChart, option);
    });
}
function pizzaSize(date = "2022-12-01") {
    //SELECT p.purchaseID, pr.Name, pr.SizeFROM purchaseItems piJOIN products pr ON pi.SKU = pr.SKUJOIN purchase p ON pi.purchaseID = p.purchaseID;
    var store = JSON.parse(localStorage.getItem("store"));
    var dom = document.getElementById('PizzaSize');
    var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);
    fetch(`/api/PizzaSize?date=${date}&store=${store.storeID}`)
        .then((response) => response.json())
        .then((data) => {
        var option = {
            tooltip: { trigger: 'item' },
            legend: { top: '5%', left: 'center' },
            series: [{
                    name: data.map((item) => ({ value: item.size_count })),
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                    label: { show: false, position: 'center' },
                    emphasis: { label: { show: true, fontSize: 40, fontWeight: 'bold' } },
                    labelLine: { show: false },
                    data: data.map((item) => ({ value: item.size_count, name: item.Size }))
                }]
        };
        updateChart(myChart, option);
    })
        .catch((error) => {
        console.error("Error:", error);
    });
}
// TODO move to generalCharts.ts
// TODO split
function abc(date = "2022-12-01") {
    var app = {};
    var chartDom = document.getElementById('abc');
    var myChart = echarts.init(chartDom);
    var option;
    const posList = [
        'left',
        'right',
        'top',
        'bottom',
        'inside',
        'insideTop',
        'insideLeft',
        'insideRight',
        'insideBottom',
        'insideTopLeft',
        'insideTopRight',
        'insideBottomLeft',
        'insideBottomRight'
    ];
    app.configParameters = {
        rotate: {
            min: -90,
            max: 90
        },
        align: {
            options: {
                left: 'left',
                center: 'center',
                right: 'right'
            }
        },
        verticalAlign: {
            options: {
                top: 'top',
                middle: 'middle',
                bottom: 'bottom'
            }
        },
        position: {
            options: posList.reduce(function (map, pos) {
                map[pos] = pos;
                return map;
            }, {})
        },
        distance: {
            min: 0,
            max: 100
        }
    };
    app.config = {
        rotate: 90,
        align: 'left',
        verticalAlign: 'middle',
        position: 'insideBottom',
        distance: 15,
        onChange: function () {
            const labelOption = {
                rotate: app.config.rotate,
                align: app.config.align,
                verticalAlign: app.config
                    .verticalAlign,
                position: app.config.position,
                distance: app.config.distance
            };
            myChart.setOption({
                series: [
                    {
                        label: labelOption
                    },
                    {
                        label: labelOption
                    },
                    {
                        label: labelOption
                    },
                    {
                        label: labelOption
                    }
                ]
            });
        }
    };
    const labelOption = {
        show: true,
        position: app.config.position,
        distance: app.config.distance,
        align: app.config.align,
        verticalAlign: app.config.verticalAlign,
        rotate: app.config.rotate,
        formatter: '{c}  {name|{a}}',
        fontSize: 16,
        rich: {
            name: {}
        }
    };
    option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        //kann anscheinend leer bleiben
        legend: {
            data: []
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            feature: {
                mark: { show: true },
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar', 'stack'] },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        },
        xAxis: [
            {
                type: 'category',
                data: ['A', 'B', 'C'],
                axisLabel: {
                    formatter: function (value, index) {
                        return ['A', 'B', 'C'][index];
                    }
                }
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                name: 'C000015',
                type: 'bar',
                barGap: 0,
                label: labelOption,
                emphasis: {
                    focus: 'series'
                },
                data: ['A', 'B', 'C'].map(category => category === 'A' ? 390 : null)
            },
            {
                name: 'C000125',
                type: 'bar',
                label: labelOption,
                emphasis: {
                    focus: 'series'
                },
                data: ['A', 'B', 'C'].map(category => category === 'B' ? 290 : null)
            },
            {
                name: 'C000172',
                type: 'bar',
                label: labelOption,
                emphasis: {
                    focus: 'series'
                },
                data: ['A', 'B', 'C'].map(category => category === 'C' ? 190 : null)
            },
            {
                name: 'C000179',
                type: 'bar',
                label: labelOption,
                emphasis: {
                    focus: 'series'
                },
                data: ['A', 'B', 'C'].map(category => category === 'C' ? 40 : null)
            }
        ]
    };
    option && myChart.setOption(option);
}
function pizzaIngredients(date = "2022-12-01") {
    var app = {};
    var store = JSON.parse(localStorage.getItem("store"));
    var chartDom = document.getElementById('pizzaIngredients');
    var myChart = echarts.init(chartDom);
    var option;
    fetch(`/api/ingredientUsage?date=${date}&storeID=${store.storeID}`)
        .then((response) => response.json())
        .then((data) => {
        console.log(data);
        app.configParameters = {
            rotate: {
                min: -90,
                max: 90
            },
            align: {
                options: {
                    left: 'left',
                    center: 'center',
                    right: 'right'
                }
            },
            verticalAlign: {
                options: {
                    top: 'top',
                    middle: 'middle',
                    bottom: 'bottom'
                }
            },
            distance: {
                min: 0,
                max: 2
            }
        };
        option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['Ham', 'Bacon', 'Basil', 'Cheese']
            },
            toolbox: {
                show: true,
                orient: 'vertical',
                left: 'right',
                top: 'center',
                feature: {
                    mark: { show: true },
                    dataView: { show: false, readOnly: false },
                    magicType: { show: false, type: ['line', 'bar', 'stack'] },
                    restore: { show: false },
                    saveAsImage: { show: false }
                }
            },
            xAxis: [
                {
                    type: 'category',
                    axisTick: { show: false },
                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', `Sun`]
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: 'Ham',
                    type: 'bar',
                    barGap: 0,
                    emphasis: {
                        focus: 'series'
                    },
                    data: [1.67, 1.53, 1.89, 1.62, 1.92, 1.63, 1.97]
                },
                {
                    name: 'Bacon',
                    type: 'bar',
                    emphasis: {
                        focus: 'series'
                    },
                    data: [1.3, 1.56, 1.78, 1.45, 1.10, 1.43, 0.89]
                },
                {
                    name: 'Basil',
                    type: 'bar',
                    emphasis: {
                        focus: 'series'
                    },
                    data: [1.3, 1.56, 1.78, 1.45, 1.10, 1.43, 1.37]
                },
                {
                    name: 'Cheese',
                    type: 'bar',
                    emphasis: {
                        focus: 'series'
                    },
                    data: [1.3, 1.56, 1.78, 1.45, 1.10, 1.43, 1.05]
                }
            ]
        };
        updateChart(myChart, option);
    });
}
//# sourceMappingURL=indivivdualCharts.js.map