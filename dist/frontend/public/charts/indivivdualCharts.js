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
    abcAnalysis_customer_1(date);
    abcAnalysis_customer_2(date);
    abcAnalysis_pizza_1(date);
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
            title: {
                text: 'Revenue'
            },
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
    //data needed: Pizza names, Size, sales number
    fetch(`/api/PizzaSize?date=${date}&store=${store.storeID}`)
        .then((response) => response.json())
        .then((data) => {
        updateChart(myChart, option);
    })
        .catch((error) => {
        console.error("Error:", error);
    });
    var data = [
        {
            name: 'Flora',
            itemStyle: {
                color: '#da0d68'
            },
            children: [
                {
                    name: 'Black Tea',
                    value: 1,
                    itemStyle: {
                        color: '#975e6d'
                    }
                },
                {
                    name: 'Floral',
                    itemStyle: {
                        color: '#e0719c'
                    },
                    children: [
                        {
                            name: 'Chamomile',
                            value: 1,
                            itemStyle: {
                                color: '#f99e1c'
                            }
                        },
                        {
                            name: 'Rose',
                            value: 1,
                            itemStyle: {
                                color: '#ef5a78'
                            }
                        },
                        {
                            name: 'Jasmine',
                            value: 1,
                            itemStyle: {
                                color: '#f7f1bd'
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: 'Fruity',
            itemStyle: {
                color: '#da1d23'
            },
            children: [
                {
                    name: 'Berry',
                    itemStyle: {
                        color: '#dd4c51'
                    },
                    children: [
                        {
                            name: 'Blackberry',
                            value: 1,
                            itemStyle: {
                                color: '#3e0317'
                            }
                        },
                        {
                            name: 'Raspberry',
                            value: 1,
                            itemStyle: {
                                color: '#e62969'
                            }
                        },
                        {
                            name: 'Blueberry',
                            value: 1,
                            itemStyle: {
                                color: '#6569b0'
                            }
                        },
                        {
                            name: 'Strawberry',
                            value: 1,
                            itemStyle: {
                                color: '#ef2d36'
                            }
                        }
                    ]
                },
                {
                    name: 'Dried Fruit',
                    itemStyle: {
                        color: '#c94a44'
                    },
                    children: [
                        {
                            name: 'Raisin',
                            value: 1,
                            itemStyle: {
                                color: '#b53b54'
                            }
                        },
                        {
                            name: 'Prune',
                            value: 1,
                            itemStyle: {
                                color: '#a5446f'
                            }
                        }
                    ]
                },
                {
                    name: 'Other Fruit',
                    itemStyle: {
                        color: '#dd4c51'
                    },
                    children: [
                        {
                            name: 'Coconut',
                            value: 1,
                            itemStyle: {
                                color: '#f2684b'
                            }
                        },
                        {
                            name: 'Cherry',
                            value: 1,
                            itemStyle: {
                                color: '#e73451'
                            }
                        },
                        {
                            name: 'Pomegranate',
                            value: 1,
                            itemStyle: {
                                color: '#e65656'
                            }
                        },
                        {
                            name: 'Pineapple',
                            value: 1,
                            itemStyle: {
                                color: '#f89a1c'
                            }
                        },
                        {
                            name: 'Grape',
                            value: 1,
                            itemStyle: {
                                color: '#aeb92c'
                            }
                        },
                        {
                            name: 'Apple',
                            value: 1,
                            itemStyle: {
                                color: '#4eb849'
                            }
                        },
                        {
                            name: 'Peach',
                            value: 1,
                            itemStyle: {
                                color: '#f68a5c'
                            }
                        },
                        {
                            name: 'Pear',
                            value: 1,
                            itemStyle: {
                                color: '#baa635'
                            }
                        }
                    ]
                },
                {
                    name: 'Citrus Fruit',
                    itemStyle: {
                        color: '#f7a128'
                    },
                    children: [
                        {
                            name: 'Grapefruit',
                            value: 1,
                            itemStyle: {
                                color: '#f26355'
                            }
                        },
                        {
                            name: 'Orange',
                            value: 1,
                            itemStyle: {
                                color: '#e2631e'
                            }
                        },
                        {
                            name: 'Lemon',
                            value: 1,
                            itemStyle: {
                                color: '#fde404'
                            }
                        },
                        {
                            name: 'Lime',
                            value: 1,
                            itemStyle: {
                                color: '#7eb138'
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: 'Sour/\nFermented',
            itemStyle: {
                color: '#ebb40f'
            },
            children: [
                {
                    name: 'Sour',
                    itemStyle: {
                        color: '#e1c315'
                    },
                    children: [
                        {
                            name: 'Sour Aromatics',
                            value: 1,
                            itemStyle: {
                                color: '#9ea718'
                            }
                        },
                        {
                            name: 'Acetic Acid',
                            value: 1,
                            itemStyle: {
                                color: '#94a76f'
                            }
                        },
                        {
                            name: 'Butyric Acid',
                            value: 1,
                            itemStyle: {
                                color: '#d0b24f'
                            }
                        },
                        {
                            name: 'Isovaleric Acid',
                            value: 1,
                            itemStyle: {
                                color: '#8eb646'
                            }
                        },
                        {
                            name: 'Citric Acid',
                            value: 1,
                            itemStyle: {
                                color: '#faef07'
                            }
                        },
                        {
                            name: 'Malic Acid',
                            value: 1,
                            itemStyle: {
                                color: '#c1ba07'
                            }
                        }
                    ]
                },
                {
                    name: 'Alcohol/\nFremented',
                    itemStyle: {
                        color: '#b09733'
                    },
                    children: [
                        {
                            name: 'Winey',
                            value: 1,
                            itemStyle: {
                                color: '#8f1c53'
                            }
                        },
                        {
                            name: 'Whiskey',
                            value: 1,
                            itemStyle: {
                                color: '#b34039'
                            }
                        },
                        {
                            name: 'Fremented',
                            value: 1,
                            itemStyle: {
                                color: '#ba9232'
                            }
                        },
                        {
                            name: 'Overripe',
                            value: 1,
                            itemStyle: {
                                color: '#8b6439'
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: 'Green/\nVegetative',
            itemStyle: {
                color: '#187a2f'
            },
            children: [
                {
                    name: 'Olive Oil',
                    value: 1,
                    itemStyle: {
                        color: '#a2b029'
                    }
                },
                {
                    name: 'Raw',
                    value: 1,
                    itemStyle: {
                        color: '#718933'
                    }
                },
                {
                    name: 'Green/\nVegetative',
                    itemStyle: {
                        color: '#3aa255'
                    },
                    children: [
                        {
                            name: 'Under-ripe',
                            value: 1,
                            itemStyle: {
                                color: '#a2bb2b'
                            }
                        },
                        {
                            name: 'Peapod',
                            value: 1,
                            itemStyle: {
                                color: '#62aa3c'
                            }
                        },
                        {
                            name: 'Fresh',
                            value: 1,
                            itemStyle: {
                                color: '#03a653'
                            }
                        },
                        {
                            name: 'Dark Green',
                            value: 1,
                            itemStyle: {
                                color: '#038549'
                            }
                        },
                        {
                            name: 'Vegetative',
                            value: 1,
                            itemStyle: {
                                color: '#28b44b'
                            }
                        },
                        {
                            name: 'Hay-like',
                            value: 1,
                            itemStyle: {
                                color: '#a3a830'
                            }
                        },
                        {
                            name: 'Herb-like',
                            value: 1,
                            itemStyle: {
                                color: '#7ac141'
                            }
                        }
                    ]
                },
                {
                    name: 'Beany',
                    value: 1,
                    itemStyle: {
                        color: '#5e9a80'
                    }
                }
            ]
        },
        {
            name: 'Other',
            itemStyle: {
                color: '#0aa3b5'
            },
            children: [
                {
                    name: 'Papery/Musty',
                    itemStyle: {
                        color: '#9db2b7'
                    },
                    children: [
                        {
                            name: 'Stale',
                            value: 1,
                            itemStyle: {
                                color: '#8b8c90'
                            }
                        },
                        {
                            name: 'Cardboard',
                            value: 1,
                            itemStyle: {
                                color: '#beb276'
                            }
                        },
                        {
                            name: 'Papery',
                            value: 1,
                            itemStyle: {
                                color: '#fefef4'
                            }
                        },
                        {
                            name: 'Woody',
                            value: 1,
                            itemStyle: {
                                color: '#744e03'
                            }
                        },
                        {
                            name: 'Moldy/Damp',
                            value: 1,
                            itemStyle: {
                                color: '#a3a36f'
                            }
                        },
                        {
                            name: 'Musty/Dusty',
                            value: 1,
                            itemStyle: {
                                color: '#c9b583'
                            }
                        },
                        {
                            name: 'Musty/Earthy',
                            value: 1,
                            itemStyle: {
                                color: '#978847'
                            }
                        },
                        {
                            name: 'Animalic',
                            value: 1,
                            itemStyle: {
                                color: '#9d977f'
                            }
                        },
                        {
                            name: 'Meaty Brothy',
                            value: 1,
                            itemStyle: {
                                color: '#cc7b6a'
                            }
                        },
                        {
                            name: 'Phenolic',
                            value: 1,
                            itemStyle: {
                                color: '#db646a'
                            }
                        }
                    ]
                },
                {
                    name: 'Chemical',
                    itemStyle: {
                        color: '#76c0cb'
                    },
                    children: [
                        {
                            name: 'Bitter',
                            value: 1,
                            itemStyle: {
                                color: '#80a89d'
                            }
                        },
                        {
                            name: 'Salty',
                            value: 1,
                            itemStyle: {
                                color: '#def2fd'
                            }
                        },
                        {
                            name: 'Medicinal',
                            value: 1,
                            itemStyle: {
                                color: '#7a9bae'
                            }
                        },
                        {
                            name: 'Petroleum',
                            value: 1,
                            itemStyle: {
                                color: '#039fb8'
                            }
                        },
                        {
                            name: 'Skunky',
                            value: 1,
                            itemStyle: {
                                color: '#5e777b'
                            }
                        },
                        {
                            name: 'Rubber',
                            value: 1,
                            itemStyle: {
                                color: '#120c0c'
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: 'Roasted',
            itemStyle: {
                color: '#c94930'
            },
            children: [
                {
                    name: 'Pipe Tobacco',
                    value: 1,
                    itemStyle: {
                        color: '#caa465'
                    }
                },
                {
                    name: 'Tobacco',
                    value: 1,
                    itemStyle: {
                        color: '#dfbd7e'
                    }
                },
                {
                    name: 'Burnt',
                    itemStyle: {
                        color: '#be8663'
                    },
                    children: [
                        {
                            name: 'Acrid',
                            value: 1,
                            itemStyle: {
                                color: '#b9a449'
                            }
                        },
                        {
                            name: 'Ashy',
                            value: 1,
                            itemStyle: {
                                color: '#899893'
                            }
                        },
                        {
                            name: 'Smoky',
                            value: 1,
                            itemStyle: {
                                color: '#a1743b'
                            }
                        },
                        {
                            name: 'Brown, Roast',
                            value: 1,
                            itemStyle: {
                                color: '#894810'
                            }
                        }
                    ]
                },
                {
                    name: 'Cereal',
                    itemStyle: {
                        color: '#ddaf61'
                    },
                    children: [
                        {
                            name: 'Grain',
                            value: 1,
                            itemStyle: {
                                color: '#b7906f'
                            }
                        },
                        {
                            name: 'Malt',
                            value: 1,
                            itemStyle: {
                                color: '#eb9d5f'
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: 'Spices',
            itemStyle: {
                color: '#ad213e'
            },
            children: [
                {
                    name: 'Pungent',
                    value: 1,
                    itemStyle: {
                        color: '#794752'
                    }
                },
                {
                    name: 'Pepper',
                    value: 1,
                    itemStyle: {
                        color: '#cc3d41'
                    }
                },
                {
                    name: 'Brown Spice',
                    itemStyle: {
                        color: '#b14d57'
                    },
                    children: [
                        {
                            name: 'Anise',
                            value: 1,
                            itemStyle: {
                                color: '#c78936'
                            }
                        },
                        {
                            name: 'Nutmeg',
                            value: 1,
                            itemStyle: {
                                color: '#8c292c'
                            }
                        },
                        {
                            name: 'Cinnamon',
                            value: 1,
                            itemStyle: {
                                color: '#e5762e'
                            }
                        },
                        {
                            name: 'Clove',
                            value: 1,
                            itemStyle: {
                                color: '#a16c5a'
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: 'Nutty/\nCocoa',
            itemStyle: {
                color: '#a87b64'
            },
            children: [
                {
                    name: 'Nutty',
                    itemStyle: {
                        color: '#c78869'
                    },
                    children: [
                        {
                            name: 'Peanuts',
                            value: 1,
                            itemStyle: {
                                color: '#d4ad12'
                            }
                        },
                        {
                            name: 'Hazelnut',
                            value: 1,
                            itemStyle: {
                                color: '#9d5433'
                            }
                        },
                        {
                            name: 'Almond',
                            value: 1,
                            itemStyle: {
                                color: '#c89f83'
                            }
                        }
                    ]
                },
                {
                    name: 'Cocoa',
                    itemStyle: {
                        color: '#bb764c'
                    },
                    children: [
                        {
                            name: 'Chocolate',
                            value: 1,
                            itemStyle: {
                                color: '#692a19'
                            }
                        },
                        {
                            name: 'Dark Chocolate',
                            value: 1,
                            itemStyle: {
                                color: '#470604'
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: 'Sweet',
            itemStyle: {
                color: '#e65832'
            },
            children: [
                {
                    name: 'Brown Sugar',
                    itemStyle: {
                        color: '#d45a59'
                    },
                    children: [
                        {
                            name: 'Molasses',
                            value: 1,
                            itemStyle: {
                                color: '#310d0f'
                            }
                        },
                        {
                            name: 'Maple Syrup',
                            value: 1,
                            itemStyle: {
                                color: '#ae341f'
                            }
                        },
                        {
                            name: 'Caramelized',
                            value: 1,
                            itemStyle: {
                                color: '#d78823'
                            }
                        },
                        {
                            name: 'Honey',
                            value: 1,
                            itemStyle: {
                                color: '#da5c1f'
                            }
                        }
                    ]
                },
                {
                    name: 'Vanilla',
                    value: 1,
                    itemStyle: {
                        color: '#f89a80'
                    }
                },
                {
                    name: 'Vanillin',
                    value: 1,
                    itemStyle: {
                        color: '#f37674'
                    }
                },
                {
                    name: 'Overall Sweet',
                    value: 1,
                    itemStyle: {
                        color: '#e75b68'
                    }
                },
                {
                    name: 'Sweet Aromatics',
                    value: 1,
                    itemStyle: {
                        color: '#d0545f'
                    }
                }
            ]
        }
    ];
    option = {
        title: {
            text: 'WORLD COFFEE RESEARCH SENSORY LEXICON',
            subtext: 'Source: https://worldcoffeeresearch.org/work/sensory-lexicon/',
            textStyle: {
                fontSize: 14,
                align: 'center'
            },
            tooltip: { position: "top" },
            subtextStyle: {
                align: 'center'
            },
            sublink: 'https://worldcoffeeresearch.org/work/sensory-lexicon/'
        },
        series: {
            type: 'sunburst',
            data: data,
            radius: [0, '95%'],
            sort: undefined,
            emphasis: {
                focus: 'ancestor'
            },
            levels: [
                {},
                {
                    r0: '15%',
                    r: '35%',
                    itemStyle: {
                        borderWidth: 2
                    },
                    label: {
                        rotate: 'tangential'
                    }
                },
                {
                    r0: '35%',
                    r: '70%',
                    label: {
                        align: 'right'
                    }
                },
                {
                    r0: '70%',
                    r: '72%',
                    label: {
                        position: 'outside',
                        padding: 3,
                        silent: false
                    },
                    itemStyle: {
                        borderWidth: 3
                    }
                }
            ]
        }
    };
}
//TODO anzeige top 10 customer
//TODO rein hovern
function abcAnalysis_customer_1(date = "2022-12-01") {
    var store = JSON.parse(localStorage.getItem("store"));
    var dom = document.getElementById('abcAnalysis_customer_1');
    var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom);
    myChart.showLoading();
    fetch(`/api/abc-analysis-customers?date=${date}&storeID=${store.storeID}`)
        .then(response => response.json())
        .then(data => {
        console.log('Data received from server:', data);
        let analysisData = data[store.storeID];
        let cumulativePercentage = Object.values(analysisData).map(item => item.sorted_cumulative_customer_percentage_of_total);
        let customerID = Object.keys(analysisData);
        let abcCategories = Object.values(analysisData).map(item => item.abc_category);
        let totalSales = Object.values(analysisData).map(item => item.total_sale_customer);
        var option = {
            title: {
                text: 'ABC Analysis of Customers 1',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                    let index = params[0].dataIndex;
                    return `Customer ID: ${customerID[index]}<br/>Total Sales: ${totalSales[index]}<br/>Cumulative Percentage: ${(cumulativePercentage[index] * 100).toFixed(2)}%`;
                }
            },
            legend: {
                data: ['Cumulative Percentage'],
                top: '10%'
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                data: abcCategories,
                axisLabel: {
                    rotate: 45,
                    align: 'right'
                }
            },
            yAxis: {
                type: 'value',
                name: 'Cumulative Percentage',
                axisLabel: {
                    formatter: function (value) {
                        return (value * 100).toFixed(0) + '%';
                    }
                }
            },
            series: [
                {
                    name: 'Cumulative Percentage',
                    type: 'bar',
                    data: cumulativePercentage,
                    label: {
                        show: true,
                        position: 'insideBottom',
                        formatter: function (params) {
                            return (params.value * 100).toFixed(2) + '%';
                        }
                    },
                    itemStyle: {
                        color: function (params) {
                            const abcCategory = abcCategories[params.dataIndex];
                            if (abcCategory === 'A')
                                return 'green';
                            if (abcCategory === 'B')
                                return 'yellow';
                            return 'red';
                        }
                    }
                }
            ]
        };
        myChart.hideLoading();
        updateChart(myChart, option);
    });
}
function abcAnalysis_customer_2(date = "2022-12-01") {
    var store = JSON.parse(localStorage.getItem("store"));
    var dom = document.getElementById('abcAnalysis_customer_2');
    var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom);
    myChart.showLoading();
    fetch(`/api/abc-analysis-customers?date=${date}&storeID=${store.storeID}`)
        .then(response => response.json())
        .then(data => {
        console.log('Data received from server:', data);
        let analysisData = data[store.storeID];
        let totalSales = Object.values(analysisData).map(item => item.total_sale_customer);
        let abcCategories = Object.values(analysisData).map(item => item.abc_category);
        var option = {
            title: {
                text: 'ABC Analysis of Customers 2',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['Total Sales'],
                top: '10%'
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                data: abcCategories,
                axisLabel: {
                    rotate: 45,
                    align: 'right'
                }
            },
            yAxis: {
                type: 'value',
                name: 'Total Sales'
            },
            series: [
                {
                    name: 'Total Sales',
                    type: 'bar',
                    data: totalSales,
                    label: {
                        show: true,
                        position: 'insideBottom'
                    },
                    itemStyle: {
                        color: function (params) {
                            const abcCategory = abcCategories[params.dataIndex];
                            if (abcCategory === 'A')
                                return 'green';
                            if (abcCategory === 'B')
                                return 'yellow';
                            return 'red';
                        }
                    }
                }
            ]
        };
        myChart.hideLoading();
        updateChart(myChart, option);
    });
}
function abcAnalysis_pizza_1(date = "2022-12-01") {
    var store = JSON.parse(localStorage.getItem("store"));
    var dom = document.getElementById('abcAnalysis_pizza_1');
    var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom);
    myChart.showLoading();
    fetch(`/api/abc-analysis-pizza?date=${date}&storeID=${store.storeID}`)
        .then(response => response.json())
        .then(data => {
        console.log('Data received from server:', data);
        let analysisData = data[store.storeID];
        let cumulativePercentage = Object.values(analysisData).map(item => item.sorted_cumulative_product_percentage_of_total);
        let productSKUs = Object.keys(analysisData);
        let abcCategories = Object.values(analysisData).map(item => item.abc_category);
        let totalSales = Object.values(analysisData).map(item => item.total_sales_pizza);
        var option = {
            title: {
                text: 'ABC Analysis of Products',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                    let index = params[0].dataIndex;
                    return `Product SKU: ${productSKUs[index]}<br/>Total Sales: ${totalSales[index]}<br/>Cumulative Percentage: ${(cumulativePercentage[index] * 100).toFixed(2)}%`;
                }
            },
            legend: {
                data: ['Cumulative Percentage'],
                top: '10%'
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                name: 'Quantity Share in Percentage',
                nameLocation: 'middle',
                nameTextStyle: {
                    fontSize: 16,
                    padding: 20
                },
                data: abcCategories,
                axisLabel: {
                    rotate: 45,
                    align: 'right'
                }
            },
            yAxis: {
                type: 'value',
                name: 'Value Share in Percentage',
                nameLocation: 'middle',
                nameTextStyle: {
                    fontSize: 16,
                    padding: 40
                },
                axisLabel: {
                    formatter: function (value) {
                        return (value * 100).toFixed(0) + '%';
                    }
                }
            },
            series: [
                {
                    name: 'Cumulative Percentage',
                    type: 'bar',
                    data: cumulativePercentage,
                    label: {
                        show: true,
                        position: 'insideBottom',
                        formatter: function (params) {
                            return (params.value * 100).toFixed(2) + '%';
                        }
                    },
                    itemStyle: {
                        color: function (params) {
                            const abcCategory = abcCategories[params.dataIndex];
                            if (abcCategory === 'A')
                                return 'green';
                            if (abcCategory === 'B')
                                return 'yellow';
                            return 'red';
                        }
                    }
                }
            ]
        };
        myChart.hideLoading();
        myChart.setOption(option);
    })
        .catch(error => {
        console.error("Error fetching or processing data:", error);
        myChart.hideLoading();
    });
}
function pizzaIngredients(date = "2022-12-01") {
    var app = {};
    var store = JSON.parse(localStorage.getItem("store"));
    var chartDom = document.getElementById("pizzaIngredients");
    var myChart = echarts.init(chartDom);
    var option;
    fetch(`/api/ingredientUsage?date=${date}&storeID=${store.storeID}`)
        .then((response) => response.json())
        .then((data) => {
        console.log(data);
        // Parse the fetched data to create series data
        const ingredients = {};
        let minQuantity = Number.MAX_VALUE;
        let maxQuantity = Number.MIN_VALUE;
        data.forEach((item) => {
            const ingredient = item.ingredient.trim();
            const averageQuantity = parseFloat(item.average_quantity);
            // Update min and max values
            if (averageQuantity < minQuantity)
                minQuantity = averageQuantity;
            if (averageQuantity > maxQuantity)
                maxQuantity = averageQuantity;
            if (!ingredients[ingredient]) {
                ingredients[ingredient] = 0;
            }
            ingredients[ingredient] += averageQuantity;
        });
        // Normalize the values
        const normalize = (value) => (value - minQuantity) / (maxQuantity - minQuantity) * 100;
        const xAxisData = Object.keys(ingredients);
        const seriesData = xAxisData.map(ingredient => ({
            name: ingredient,
            type: 'bar',
            emphasis: { focus: 'series' },
            data: [normalize(ingredients[ingredient]).toFixed(2)] // Normalize and round to 2 decimal places
        }));
        option = {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
            },
            legend: {
                data: xAxisData,
                selected: xAxisData.reduce((acc, ingredient) => {
                    acc[ingredient] = false; // Start with all series deselected
                    return acc;
                }, {}),
                bottom: 10, // Position the legend at the bottom
                left: 'center', // Center the legend
            },
            grid: {
                top: '10%', // Adjust the top margin
                bottom: '20%', // Adjust the bottom margin for legend
                left: '10%', // Adjust the left margin
                right: '10%', // Adjust the right margin
            },
            toolbox: {
                show: true,
                orient: "vertical",
                left: "right",
                top: "center",
                feature: {
                    mark: { show: true },
                    dataView: { show: false, readOnly: false },
                    magicType: { show: false, type: ["line", "bar", "stack"] },
                    restore: { show: false },
                    saveAsImage: { show: false },
                },
            },
            xAxis: [
                {
                    type: "category",
                    axisTick: { show: false },
                    data: ["Ingredients"],
                },
            ],
            yAxis: [
                {
                    type: "value",
                    min: 0, // Ensure the Y-axis starts at 0
                    max: 100, // Normalized max value
                    interval: 10, // Set a suitable interval for the values
                    axisLabel: {
                        formatter: '{value}', // Add a unit if necessary, e.g., '{value} units'
                    }
                },
            ],
            series: seriesData,
        };
        myChart.setOption(option);
    })
        .catch((error) => console.error("Error fetching ingredient data:", error));
}
//# sourceMappingURL=indivivdualCharts.js.map