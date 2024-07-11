
// TODO use .env variables instead
const defaultDate = "2022-12-01";
const currentDate = "2022-12-31";
const theme = 'infographic';




function updateCharts(date) {
  pizzaPopularity(date);
  gaugeChart(date);
  //statOverview(date);
  pizzaSize(date);
  heatmap(date);
  //pizzaIngredients(date);
  //abcAnalysis_customer_1(date);
  
  //abcAnalysis_pizza_1(date);
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
        grid: { height: "50%", top: "10%", bottom: "10%", right: "5%", left: "5%"},
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
      // Remove "Pizza" from the pizza name
      var pizzaName = pizza.Name.replace(/ Pizza$/, "");

      if (!pizzaData[pizzaName]) {
        pizzaData[pizzaName] = { name: pizzaName, children: [] };
      }
      pizzaData[pizzaName].children.push({
        name: pizza.Size,
        value: parseInt(pizza.size_count),
      });
<<<<<<< HEAD
=======

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
>>>>>>> 81cf8dcff4c11e1b6cf95f397f362f77d211e87f
    });

    var data = Object.values(pizzaData);

    var option = {
      title: {
        text: "Pizza Sales Data",
        subtext: `Date: ${date}`,
        textStyle: {
          fontSize: 14,
          align: "center",
        },
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
async function pizzaPopularity(date = defaultDate) {
  var chartDom = document.getElementById("pizzaPopularity");
  var myChart = echarts.init(chartDom, theme);
  var option;
  var store = JSON.parse(localStorage.getItem("store"));

  try {
    const response = await fetch(`/api/pizzaPopularity?date=${date}&storeID=${store.storeID}`);
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

    option && myChart.setOption(option);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function processData(data) {
  const totalEntries = data.length;

  // Determine desiredEntriesPerPizza based on totalEntries
  let desiredEntriesPerPizza;
  if (totalEntries < 260) {
    desiredEntriesPerPizza = 15;
  } else if (totalEntries > 270 && totalEntries <= 800) {
    desiredEntriesPerPizza = 30;
  } else {
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

function dailyOrders(date = "2022-12-01", dow = 1) {
  var store = JSON.parse(localStorage.getItem("store"));
  var dom = document.getElementById("dailyOrders");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);

  fetch(`/api/daily-orders-analysis?date=${date}&dow=${dow}&storeID=${store.storeID}`)
    .then((response) => response.json())
    .then((data) => {
      let avgValues = Object.keys(data).map(hour => data[hour].avg);
      var option = {
        title: {
          text: "Average Orders per Hour",
        },
        xAxis: {
          type: "category",
          data: Object.keys(data),
        },
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            let index = params[0].dataIndex;
            let bestPizzas = data[index].bestPizza ? data[index].bestPizza.join('<br/>') : 'N/A';
            return `Hour: ${index}<br/>Average Orders: ${data[index].avg}<br/>bestPizza:<br/>${bestPizzas}`;
          },
        },
        legend: {
          data: ["Average Orders"],
        },
        toolbox: {
          feature: { saveAsImage: {} },
        },
        yAxis: {
          type: "value",
          name: "Average Orders",
        },
        series: [
          {
            data: avgValues,
            type: "line",
            smooth: true,
            name: "Average Orders",
          },
        ],
      };

      myChart.setOption(option);
    })
    .catch((error) => {
      console.error("Error fetching daily orders data:", error);
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
      const normalize = (value) =>
        ((value - minQuantity) / (maxQuantity - minQuantity)) * 100;

      const xAxisData = Object.keys(ingredients);
      const seriesData = xAxisData.map(ingredient => normalize(ingredients[ingredient]).toFixed(2));

      option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        grid: {
          top: "10%", // Adjust the top margin
          bottom: "10%", // Adjust the bottom margin
          left: "10%", // Adjust the left margin
          right: "10%", // Adjust the right margin
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
            data: xAxisData, // Directly set all ingredients on the X-axis
          },
        ],
        yAxis: [
          {
            type: "value",
            min: 0, // Ensure the Y-axis starts at 0
            max: 100, // Normalized max value
            interval: 10, // Set a suitable interval for the values
            axisLabel: {
              formatter: "{value}", // Add a unit if necessary, e.g., '{value} units'
            },
          },
        ],
        series: [
          {
            name: 'Ingredients',
            type: 'bar',
            data: seriesData, // Set the normalized data for each ingredient
            emphasis: { focus: 'series' },
          }
        ]
      };

      myChart.setOption(option);
    })
    .catch((error) => console.error("Error fetching ingredient data:", error));
}