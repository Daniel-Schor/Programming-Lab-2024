
// TODO use .env variables instead
const defaultDate = "2022-12-01";
const currentDate = "2022-12-31";
const theme = 'infographic';




function updateCharts(date) {

  gaugeChart(date);
  //statOverview(date);
  pizzaSize(date);
  heatmap(date);
  //pizzaIngredients(date);
  abcAnalysis_customer_1(date);
  abcAnalysis_customer_2(date);
  abcAnalysis_pizza_1(date);
  pizza_price_popularity(date);
}
// TODO move to generalCharts.ts
function updateChart(chart, option) {

  if (option && typeof option === "object") {
    chart.setOption(option, true);
  }
}

// TODO move to generalCharts.ts
function monthlyRevenue(date = defaultDate) {
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
        yAxis: { type: "value" },
        series: [{ data: revenue, type: "line", smooth: true }],
      };
      myChart.hideLoading();
      updateChart(myChart, option);
    });
}

function gaugeChart(date = defaultDate) {
  var store = JSON.parse(localStorage.getItem("store"));
  var dom = document.getElementById("quality");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);

  //document.getElementById("Store-quality").innerHTML = `Store: ${store.storeID} Quality`;

  fetch(`/api/quality?date=${date}&store=${store.storeID}`)
    .then((response) => response.json())
    .then((data) => {

      var gaugeData = [
        {
          value: Math.round(data[0].overall), name:
            "Overall"
          , title: { offsetCenter: ["0%", "-30%"] }, detail: { valueAnimation: true, offsetCenter: ["0%", "-30%"] }
        },
        {
          value: Math.round(data[0].loyalty), name:
            "Loyalty"
          , title: { offsetCenter: ["0%", "-10%"] }, detail: { valueAnimation: true, offsetCenter: ["0%", "-10%"] }
        },
        {
          value: Math.round(data[0].order), name:
            "Orders"
          , title: { offsetCenter: ["0%", "10%"] }, detail: { valueAnimation: true, offsetCenter: ["0%", "10%"] }
        },
        {
          value: Math.round(data[0].single), name:
            "one-time"
          , title: { offsetCenter: ["0%", "30%"] }, detail: { valueAnimation: true, offsetCenter: ["0%", "30%"] }
        },
      ];

      var option = {
        tooltip: {
          trigger: "item",
          formatter: function (params) {
            switch (params.name) {
              case "Overall":
                return `
                ${params.marker} 
                Overall<br/>
                Score compared to <br/>
                other stores: ${params.value}
                `;
              case "Loyalty":
                return `
                ${params.marker} 
                Loyalty<br/>
                Loyal customers per<br/>
                all customers<br/>
                compared to best store: 
                ${params.value}%
                `;
              case "Orders":
                return `
                ${params.marker} 
                Orders<br/>
                Orders per customer<br/>
                compared to best store: 
                ${params.value}%
                `;
              case "one-time":
                return `
                ${params.marker} 
                One-Time<br/>
                Customers who ordered once<br/>
                compared to all customers<br/>
                compared to best store: 
                ${params.value}%
                `;
            }
          }
        },
        series: [{
          type: "gauge",
          center: ['50%', '47%'],
          radius: "85%",
          startAngle: 90,
          endAngle: -270,
          pointer: { show: false },
          progress: { show: true, overlap: false, roundCap: true, clip: false, itemStyle: { borderWidth: 1, borderColor: "#464646" } },
          axisLine: { lineStyle: { width: 40 } },
          splitLine: { show: false, distance: 0, length: 10 },
          axisTick: { show: false },
          axisLabel: { show: false, distance: 50 },
          data: gaugeData,
          title: { fontSize: 0 },
          detail: { width: 50, height: 14, fontSize: 14, color: "inherit", borderColor: "inherit", borderRadius: 20, borderWidth: 1, formatter: "{value}" }
        }],
      };

      updateChart(myChart, option);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function heatmap(date = defaultDate) {
  var store = JSON.parse(localStorage.getItem("store"));
  var dom = document.getElementById("Heatmap");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);
  var option;
  let newData: any[] = [];

  fetch(`/api/pizzaPairs?date=${date}&store=${store.storeID}`)
    .then((response) => response.json())
    .then((querieResult) => {
      const pizzas: string[] = Object.keys(querieResult);
      let min: number = querieResult[pizzas[0]][pizzas[1]];
      let max: number = 0;

      pizzas.forEach((item) => {
        Object.keys(querieResult[item]).forEach((item2) => {
          let a: number = pizzas.indexOf(item2);
          let b: number = pizzas.indexOf(item);
          let c: number = querieResult[item][item2];
          if (c < min) {
            min = c;
          } else if (c > max) {
            max = c;
          }
          newData.push([a, b, c]);
        });
      });
      //----


      option = {
        tooltip: { position: "top" },
        grid: { height: "50%", top: "10%", bottom: "10%"},
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
  var dom = document.getElementById("PizzaSize");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);

  //data needed: Pizza names, Size, sales number
  fetch(`/api/pizzaSize?date=${date}&store=${store.storeID}`)
    .then((response) => response.json())
    .then((querieResult) => {
      var pizzaData = {};
      querieResult.forEach((pizza) => {
        if (!pizzaData[pizza.Name]) {
          pizzaData[pizza.Name] = { name: pizza.Name, children: [] };
        }
        pizzaData[pizza.Name].children.push({
          name: pizza.Size,
          value: parseInt(pizza.size_count),
        });
      });

      var data = Object.values(pizzaData);

      var option = {
       /* title: {
          text: "Pizza Sales Data",
          subtext: `Date: ${date}`,
          textStyle: {
            fontSize: 14,
            align: "center",
          },*/

          subtextStyle: {
            align: "center",
          },
        },
        tooltip: { position: "top" },
        series: {
          type: "sunburst",
          data: data,
          radius: [0, "95%"],
          sort: undefined,
          emphasis: {
            focus: "ancestor",
          },
          levels: [
            {},
            {
              r0: "15%",
              r: "35%",
              itemStyle: {
                borderWidth: 2,
              },
              label: {
                rotate: "tangential",
              },
            },
            {
              r0: "35%",
              r: "70%",
              label: {
                align: "right",
              },
            },
            {
              r0: "70%",
              r: "72%",
              label: {
                position: "outside",
                padding: 3,
                silent: false,
              },
              itemStyle: {
                borderWidth: 3,
              },
            },
          ],
        },
      };
      updateChart(myChart, option);
    });
}

function abcAnalysis_customer_1(date = "2022-12-01") {
  var store = JSON.parse(localStorage.getItem("store"));
  var dom = document.getElementById("abcAnalysis_customer_1");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom);

  myChart.showLoading();

  fetch(`/api/abc-analysis-customers?date=${date}&storeID=${store.storeID}`)
    .then((response) => response.json())
    .then((data) => {
      const analysisData = data[store.storeID];
      let cumulativePercentage = Object.values(analysisData).map(
        (item) => item.sorted_cumulative_customer_percentage_of_total
      );
      let customerID = Object.keys(analysisData);
      let abcCategories = Object.values(analysisData).map(
        (item) => item.abc_category
      );
      let totalSales = Object.values(analysisData).map(
        (item) => item.total_sale_customer
      );

      function updateChart() {
        var option = {
          /*title: {
            text: "sorted by cumulative customer percentage of total revenue",
            left: "center",
          },*/
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
            formatter: function (params) {
              let index = params[0].dataIndex;
              return `Green good, red bad.<br/>A customer good, C customer bad.<br/>ABC Category: ${abcCategories[index]
                }<br/>Customer ID: ${customerID[index]}<br/>Total Revenue: ${totalSales[index]
                }<br/>Cumulative Percentage: ${(
                  cumulativePercentage[index] * 100
                ).toFixed(2)}%`;
            },
          },
          xAxis: {
            type: "category",
            name: "Volume Share in Percent",
            nameLocation: "middle",
            data: abcCategories,
            axisLabel: {
              show: false,
            },
          },
          yAxis: {
            type: "value",
            name: "Value Share in Percent",
            axisLabel: {
              formatter: function (value) {
                return (value * 100).toFixed(0) + "%";
              },
            },
          },
          series: [
            {
              name: "Cumulative Percentage",
              type: "bar",
              data: cumulativePercentage,
              label: {
                show: false,
                position: "insideBottom",
                formatter: function (params) {
                  return (params.value * 100).toFixed(2) + "%";
                },
              },
              itemStyle: {
                color: function (params) {
                  const abcCategory = abcCategories[params.dataIndex];
                  if (abcCategory === "A") return "green";
                  if (abcCategory === "B") return "yellow";
                  return "red";
                },
              },
            },
          ],
        };

        myChart.hideLoading();
        myChart.setOption(option);
      }

      // Initialize the chart with all data
      updateChart();

      // Add event listener for the search input
      const searchInput = document.getElementById("customerSearch");
      searchInput.addEventListener("input", function () {
        const searchQuery = searchInput.value.toLowerCase();
        const filteredData = Object.keys(analysisData).reduce(
          (acc, key) => {
            if (key.toLowerCase().includes(searchQuery)) {
              acc.cumulativePercentage.push(
                analysisData[key].sorted_cumulative_customer_percentage_of_total
              );
              acc.customerID.push(key);
              acc.abcCategories.push(analysisData[key].abc_category);
              acc.totalSales.push(analysisData[key].total_sale_customer);
            }
            return acc;
          },
          { cumulativePercentage: [], customerID: [], abcCategories: [], totalSales: [] }
        );

        cumulativePercentage = filteredData.cumulativePercentage;
        customerID = filteredData.customerID;
        abcCategories = filteredData.abcCategories;
        totalSales = filteredData.totalSales;

        updateChart();
      });
    })
    .catch((error) => {
      myChart.hideLoading();
      console.error("Error fetching or processing data:", error);
    });
}

function abcAnalysis_customer_2(date = "2022-12-01") {
  var store = JSON.parse(localStorage.getItem("store"));
  var dom = document.getElementById("abcAnalysis_customer_2");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom);

  myChart.showLoading();

  fetch(`/api/abc-analysis-customers?date=${date}&storeID=${store.storeID}`)
    .then((response) => response.json())
    .then((data) => {
      let analysisData = data[store.storeID];
      let customerID = Object.keys(analysisData);
      let totalSales = Object.values(analysisData).map(
        (item) => item.total_sale_customer
      );
      let abcCategories = Object.values(analysisData).map(
        (item) => item.abc_category
      );

      function updateChart() {
        var option = {
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
            formatter: function (params) {
              let index = params[0].dataIndex;
              return `Green good, red bad.<br/>A customer good, C customer bad.<br/>ABC Category: ${abcCategories[index]
                }<br/>Customer ID: ${customerID[index]}<br/>Total Revenue: ${totalSales[index]
                }`;
            },
          },
          xAxis: {
            type: "category",
            data: abcCategories,
            axisLabel: {
              show: false,
            },
          },
          yAxis: {
            type: "value",
            name: "Total Revenue",
          },
          series: [
            {
              name: "Total Revenue",
              type: "bar",
              data: totalSales,
              label: {
                show: false,
                position: "insideBottom",
              },
              itemStyle: {
                color: function (params) {
                  const abcCategory = abcCategories[params.dataIndex];
                  if (abcCategory === "A") return "green";
                  if (abcCategory === "B") return "yellow";
                  return "red";
                },
              },
            },
          ],
        };

        myChart.hideLoading();
        myChart.setOption(option);
      }

      // Initialize the chart with all data
      updateChart();

      // Add event listener for the search input
      const searchInput = document.getElementById("customerSearch");
      searchInput.addEventListener("input", function () {
        const searchQuery = searchInput.value.toLowerCase();
        const filteredData = Object.keys(analysisData).reduce(
          (acc, key) => {
            if (key.toLowerCase().includes(searchQuery)) {
              acc.customerID.push(key);
              acc.totalSales.push(analysisData[key].total_sale_customer);
              acc.abcCategories.push(analysisData[key].abc_category);
            }
            return acc;
          },
          { customerID: [], totalSales: [], abcCategories: [] }
        );

        customerID = filteredData.customerID;
        totalSales = filteredData.totalSales;
        abcCategories = filteredData.abcCategories;

        updateChart();
      });
    })
    .catch((error) => {
      myChart.hideLoading();
      console.error("Error fetching or processing data:", error);
    });
}


function abcAnalysis_pizza_1(date = "2022-12-01") {
  var store = JSON.parse(localStorage.getItem("store"));
  var dom = document.getElementById("abcAnalysis_pizza_1");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom);

  myChart.showLoading();

  fetch(`/api/abc-analysis-pizza?date=${date}&storeID=${store.storeID}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data[store.storeID]) {
        throw new Error('No data found for the given storeID and date');
      }

      const analysisData = data[store.storeID];
      const cumulativePercentage = Object.values(analysisData).map(
        (item) => item.sorted_cumulative_product_percentage_of_total
      );
      const productSKUs = Object.keys(analysisData);
      const abcCategories = Object.values(analysisData).map(
        (item) => item.abc_category
      );
      const totalSales = Object.values(analysisData).map(
        (item) => item.total_sales_pizza
      );
      const sizes = Object.values(analysisData).map(
        (item) => item.size
      );
      const names = Object.values(analysisData).map(
        (item) => item.name
      );
      const sizesArray = [...new Set(sizes)]; // Get unique sizes for the legend

      const option = {
        /*title: {
          text: "ABC by Cumulative Percentage",
        },*/
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: function (params) {
            const index = params[0].dataIndex;
            return `
              Product Name: ${names[index]}<br/>
              Product SKU: ${productSKUs[index]}<br/>
              Total Revenue: ${totalSales[index]}<br/>
              Cumulative Percentage: ${(cumulativePercentage[index] * 100).toFixed(2)}%<br/>
              ABC Category: ${abcCategories[index]}<br/>
              Size: ${sizes[index]}
            `;
          },
        },
        legend: {
          type: "scroll",
          orient: "horizontal",
          bottom: 10,
          data: sizesArray,
          selected: sizesArray.reduce((acc, size) => {
            acc[size] = true;
            return acc;
          }, {}),
          itemStyle: {
            borderColor: 'transparent',  // Remove border color
            color: 'transparent'  // Remove fill color
          },
        },
        xAxis: {
          type: "category",
          name: "Volume Share in Percent",
          nameLocation: "middle",
          data: productSKUs,
          axisLabel: {
            show: false,
          },
        },
        yAxis: {
          type: "value",
          name: "Value Share in Percentage",
          axisLabel: {
            formatter: function (value) {
              return (value * 100).toFixed(0) + "%";
            },
          },
        },
        series: sizesArray.map(size => ({
          name: size,
          type: "bar",
          data: productSKUs.map((sku, index) => sizes[index] === size ? cumulativePercentage[index] : 0),
          label: {
            show: false,
            position: "insideBottom",
            formatter: function (params) {
              return (params.value * 100).toFixed(2) + "%";
            },
          },
          itemStyle: {
            color: function (params) {
              const abcCategory = abcCategories[params.dataIndex];
              if (abcCategory === "A") return "green";
              if (abcCategory === "B") return "yellow";
              return "red";
            },
          },
        })),
      };

      myChart.hideLoading();
      myChart.setOption(option);


      myChart.hideLoading();
      myChart.setOption(option);
    })
    .catch((error) => {
      console.error("Error fetching or processing data:", error);
      myChart.hideLoading();
    });
}

function abcAnalysis_pizza_2(date = "2022-12-01") {
  var store = JSON.parse(localStorage.getItem("store"));
  var dom = document.getElementById("abcAnalysis_pizza_2");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom);

  myChart.showLoading();

  fetch(`/api/abc-analysis-pizza?date=${date}&storeID=${store.storeID}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data[store.storeID]) {
        throw new Error('No data found for the given storeID and date');
      }

      const analysisData = data[store.storeID];
      const cumulativePercentage = Object.values(analysisData).map(
        (item) => item.sorted_cumulative_product_percentage_of_total
      );
      const productSKUs = Object.keys(analysisData);
      const abcCategories = Object.values(analysisData).map(
        (item) => item.abc_category
      );
      const totalSales = Object.values(analysisData).map(
        (item) => item.total_sales_pizza
      );
      const sizes = Object.values(analysisData).map(
        (item) => item.size
      );
      const names = Object.values(analysisData).map(
        (item) => item.name
      );
      const sizesArray = [...new Set(sizes)]; // Get unique sizes for the legend

      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: function (params) {
            const index = params[0].dataIndex;
            return `
              Product Name: ${names[index]}<br/>
              Product SKU: ${productSKUs[index]}<br/>
              Total Revenue: ${totalSales[index]}<br/>
              Cumulative Percentage: ${(cumulativePercentage[index] * 100).toFixed(2)}%<br/>
              ABC Category: ${abcCategories[index]}<br/>
              Size: ${sizes[index]}
            `;
          },
        },
        legend: {
          type: "scroll",
          orient: "horizontal",
          bottom: 10,
          data: sizesArray,
          selected: sizesArray.reduce((acc, size) => {
            acc[size] = true;
            return acc;
          }, {}),
          itemStyle: {
            borderColor: 'transparent',  // Remove border color
            color: 'transparent'  // Remove fill color
          },
        },
        xAxis: {
          type: "category",
          name: "Pizza SKU",
          nameLocation: "middle",
          data: productSKUs,
          axisLabel: {
            show: false,
          },
        },
        yAxis: {
          type: "value",
          name: "Total Revenue",
          axisLabel: {
            formatter: function (value) {
              return (value * 100).toFixed(0) + "%";
            },
          },
        },
        series: sizesArray.map(size => ({
          name: size,
          type: "bar",
          data: productSKUs.map((sku, index) => sizes[index] === size ? totalSales[index] : 0),
          label: {
            show: false,
            position: "insideBottom",
            formatter: function (params) {
              return (params.value * 100).toFixed(2) + "%";
            },
          },
          itemStyle: {
            color: function (params) {
              const abcCategory = abcCategories[params.dataIndex];
              if (abcCategory === "A") return "green";
              if (abcCategory === "B") return "yellow";
              return "red";
            },
          },
        })),
      };

      myChart.hideLoading();
      myChart.setOption(option);


      myChart.hideLoading();
      myChart.setOption(option);
    })
    .catch((error) => {
      console.error("Error fetching or processing data:", error);
      myChart.hideLoading();
    });
}

function pizza_price_popularity(date = "2022-12-01") {
  var store = JSON.parse(localStorage.getItem("store"));
  var dom = document.getElementById("pizza_price_popularity");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom);

  myChart.showLoading();

  fetch(`/api/pizza-price-popularity?date=${date}&storeID=${store.storeID}`)
    .then((response) => response.json())
    .then((data) => {
      let analysisData = data[store.storeID];
      let series = [];
      let sizes = new Set();

      Object.keys(analysisData).forEach((pizzaKey) => {
        if (Array.isArray(analysisData[pizzaKey])) {
          analysisData[pizzaKey].forEach((item) => {
            sizes.add(item.pizza_size);
            series.push({
              name: `${item.pizza_size} (${pizzaKey})`, // Use pizza size and name as series name
              type: "scatter",
              symbolSize: 20,
              data: [[item.total_sales, item.pizza_price, pizzaKey]], // Swapped total sales and pizza price
              emphasis: {
                focus: "series",
              },
            });
          });
        }
      });

      let sizesArray = Array.from(sizes);

      var option = {
        tooltip: {
          trigger: "item",
          formatter: function (params) {
            return `Pizza: ${params.value[2]}<br/>Total Sales: ${params.value[0]}<br/>Price: ${params.value[1]}`;
          },
        },
        legend: {
          type: "scroll",
          orient: "horizontal",
          bottom: 10,
          data: sizesArray, // Add only distinct sizes to legend
        },
        xAxis: {
          type: "value",
          name: "Total Sales",
        },
        yAxis: {
          type: "value",
          name: "Pizza Price",
        },
        series: sizesArray.map((size) => ({
          name: size,
          type: "scatter",
          symbolSize: 20,
          data: series
            .filter((serie) => serie.name.startsWith(size))
            .flatMap((serie) => serie.data),
          emphasis: {
            focus: "series",
          },
        })),
      };

      myChart.hideLoading();
      updateChart(myChart, option);
    });
}

function pizzaIngredients(date = defaultDate) {
  var app = {};
  var store = JSON.parse(localStorage.getItem("store"));
  var chartDom = document.getElementById("pizzaIngredients");
  var myChart = echarts.init(chartDom);
  var option;

  fetch(`/api/ingredientUsage?date=${date}&storeID=${store.storeID}`)
    .then((response) => response.json())
    .then((data) => {


      // Parse the fetched data to create series data
      const ingredients = {};
      let minQuantity = Number.MAX_VALUE;
      let maxQuantity = Number.MIN_VALUE;

      data.forEach((item) => {
        const ingredient = item.ingredient.trim();
        const averageQuantity = parseFloat(item.average_quantity);

        // Update min and max values
        if (averageQuantity < minQuantity) minQuantity = averageQuantity;
        if (averageQuantity > maxQuantity) maxQuantity = averageQuantity;

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