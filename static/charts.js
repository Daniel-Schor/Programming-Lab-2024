var finaldate = new Date("2022-12-01");

var choosenDate;

const colorsToExclude = [
  "#0000FF", "#0000EE", "#0000CD", "#0000BB", "#0000AA",
  "#000099", "#000088", "#000077", "#000066", "#000055",
  "#000044", "#000033", "#000022", "#000011", "#000000"
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
      var order_4 = (pizzasPerOrderData[0].pizzas_order / 1.0).toFixed(2);
      // Ausgabe der Daten in der Konsole
      console.log("Total Revenue Data:", order);
      console.log("Total Pizzas Data:", order_1);
      console.log("Total Orders Data:", order_2);
      console.log("Average Order Value Data:", order_3);
      console.log("Pizzas Per Order Data:", order_4);
      document.getElementById("statsOverview").innerHTML = `Total Revenue: ${order}` +
        `Total Pizzas: ${order_1}` +
        `Total Orders: ${order_2}` +
        `Average Order Value: ${order_3}` +
        `Average Pizzas per Order: ${order_4}`;

      // Hier könnten zusätzliche Verarbeitungen der Daten erfolgen

      // Rückgabe eines Signals, dass die Daten verarbeitet wurden
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      // Rückgabe eines Fehlers, falls ein Problem beim Abrufen der Daten auftritt
      throw error;
    });
}
function timeButtons() {
  document.getElementById("Last-Year").addEventListener("click", function () {
    finaldate.setFullYear(finaldate.getFullYear() - 1);
    choosenDate = finaldate.toISOString().split("T")[0]; // Convert back to string
    console.log(choosenDate);
  });

  document.getElementById("Last-Month").addEventListener("click", function () {
    finaldate = new Date(finaldate); // Convert back to Date object
    finaldate.setMonth(finaldate.getMonth() - 1);
    choosenDate = finaldate.toISOString().split("T")[0]; // Convert back to string
    console.log(choosenDate);
  });

  document
    .getElementById("Last-Quarter")
    .addEventListener("click", function () {
      finaldate = new Date(finaldate); // Convert back to Date object
      finaldate.setMonth(finaldate.getMonth() - 3);
      choosenDate = finaldate.toISOString().split("T")[0]; // Convert back to string
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
function testbarchart() {
  var myChart = echarts.init(document.getElementById("test"));
  //get data from api
  fetch("/api/revenue?date=2022-12-31&store=S062214,S013343,S216043")
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
      return myChart;
    })
    .catch((error) => {
      console.error("Error fetching the data:", error);
    });
}
function gaugeChart() {

  var dom = document.getElementById("container");
  var myChart = echarts.init(dom, null, {
    renderer: "canvas",
    useDirtyRect: false,
  });
  var app = {};
  document.getElementById("Store-quality").innerHTML = "Store: S013343 Quality";

  var option;
  fetch("/api/quality?store=S013343")
    .then((response) => response.json())
    .then((data) => {
      var storeID = data.storeID;
      var order = Math.round(data[0].order);
      var single = Math.round(data[0].single);
      var loyalty = Math.round(data[0].loyalty);
      var overall = Math.round(data[0].overall);

      console.log("data:", data);
      console.log("Order:", order);
      console.log("Single:", single);
      console.log("Loyalty:", loyalty);
      console.log("Overall:", overall);

      const gaugeData = [
        {
          value: overall,
          name: "Overall",
          title: {
            offsetCenter: ["0%", "-60%"],
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ["0%", "-50%"],
          },
        },
        {
          value: loyalty,
          name: "Loyalty",
          title: {
            offsetCenter: ["0%", "-40%"],
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ["0%", "-30%"],
          },
        },
        {
          value: order,
          name: "Orders",
          title: {
            offsetCenter: ["0%", "-20%"],
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ["0%", "-10%"],
          },
        },
        {
          value: single,
          name: "Single",
          title: {
            offsetCenter: ["0%", "00%"],
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ["0%", "10%"],
          },
        },
      ];

      option = {
        series: [
          {
            type: "gauge",
            startAngle: 90,
            endAngle: -270,
            pointer: {
              show: false,
            },
            progress: {
              show: true,
              overlap: false,
              roundCap: true,
              clip: false,
              itemStyle: {
                borderWidth: 1,
                borderColor: "#464646",
              },
            },
            axisLine: {
              lineStyle: {
                width: 40,
              },
            },
            splitLine: {
              show: false,
              distance: 0,
              length: 10,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              show: false,
              distance: 50,
            },
            data: gaugeData,
            title: {
              fontSize: 14,
            },
            detail: {
              width: 50,
              height: 14,
              fontSize: 14,
              color: "inherit",
              borderColor: "inherit",
              borderRadius: 20,
              borderWidth: 1,
              formatter: "{value}",
            },
          },
        ],
      };

      myChart.setOption(option);

      window.addEventListener("resize", myChart.resize);
    }) // This is where the missing parenthesis should be
    .catch((error) => {
      console.error("Error:", error);
    });
}

function revenueChart(best = true, storeIDs = [], storeColors = {}) {
  return new Promise((resolve, reject) => {
    var days = [];
    let lineInfos = [];

    let req = `/api/revenue?reverse=true&best=${best}`;
    if (Object.keys(storeColors).length != 0) {
      req += "&store=" + Object.keys(storeColors).join(",");
    } else if (storeIDs.length != 0) {
      req += "&store=" + storeIDs.join(",");
    } else {
      req += "&limit=5";
    }

    fetch(req)
      .then((response) => response.json())
      .then((data) => {

        // TODO check this
        orderedStoreIDs = [];
        Object.keys(data).forEach((storeID, index) => {
          delete data[storeID]["changeValue"];
          orderedStoreIDs.push(storeID);
          if (storeColors[storeID] == undefined) {
            storeColors[storeID] = randomColor();
          }

          lineInfos.push(
            {
              name: storeID,
              type: "line",
              stack: "Total",
              emphasis: {
                focus: "series",
              },
              itemStyle: {
                color: storeColors[storeID],
              },
              data: Object.values(data[storeID]),
            });
        });
        days = Object.keys(data[Object.keys(data)[0]]);

        var dom = document.getElementById("revenue");
        var myChart = echarts.init(dom, null, {
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
            right: "0%",
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
    var myChart = echarts.init(chartDom);

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
          myChart.on('click', (params) => {
            //if (params.componentType === 'series') {
            window.location.href = `/individualStore?storeID=${params.name}`;
            localStorage.setItem('store', JSON.stringify({ "storeID": params.name })); // Store the store variable
            //}
          });
        } else {
          myChart.off('click');
          myChart.on('click', (params) => {
            if (storeIDsColors[params.name] == undefined) {
              storeIDsColors[params.name] = randomColor();
            } else {
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
            //window.location.href = `/test?storeID=${params.name}`;
            //localStorage.setItem('store', JSON.stringify({ "storeID": params.name })); // Store the store variable
            //}
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  });
}