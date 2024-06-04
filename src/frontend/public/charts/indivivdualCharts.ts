const defaultDate = "2022-12-01";
const currentDate = "2022-12-31";
const theme = '#ccc';

function backButton() {
  document.getElementById("redirectButton").addEventListener("click", function () {
    window.location.href = "http://localhost:3000/";
  });
}

function subtractMonths(date, months) {
  let newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - months);

  if (newDate.getDate() !== new Date(date).getDate()) {
    newDate.setDate(0);
  }

  return newDate.toISOString().split("T")[0];
}

function updateCharts(date) {
  monthlyRevenue(date);
  gaugeChart(date);
  statsOverview(date);
  pizzaSize(date);
}

function customDate() {
  document.getElementById('customDate').addEventListener('click', function () {
    document.getElementById('customDateForm').style.display = 'block';
  });

  document.getElementById('dateForm').addEventListener('submit', function (event) {
    event.preventDefault();
    let date = document.getElementById('startDate').value;
    updateCharts(date);
  });
}

function updateChart(chart, option) {
  if (option && typeof option === "object") {
    chart.setOption(option, true);
  }
}

function monthlyRevenue(date = "2022-12-01") {
  var store = JSON.parse(localStorage.getItem("store"));
  var dom = document.getElementById("Store-revenue");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);

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
  var dom = document.getElementById("Heatmap");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom, theme);
  var option;
  let newData: any[] = [];


  fetch(`/api/pizzaPair?date=${date}&store=S490972`)
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

      if (option && typeof option === "object") {
        myChart.setOption(option);
      }

      window.addEventListener("resize", myChart.resize);
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
      let pizzaSize = [];
      let pizzaCount = [];




      var option = {
        tooltip: { trigger: 'item' },
        legend: { top: '5%', left: 'center' },
        series: [{
          name: data.map((item: { Size: string }) => ({ value: item.size_count })),
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 40, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: data.map((item: { Size: string, size_count: string }) => ({ value: item.size_count, name: item.Size }))
        }]
      };
      console.log(data);

      updateChart(myChart, option);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function statsOverview(date = "2022-12-01") {
  // Abrufen der storeID aus dem localStorage
  var store = JSON.parse(localStorage.getItem("store"));
  // Beispiel-Datum für die Abfragen

  // Definieren der API-Endpunkte
  const apiEndpoints = [
    `/api/totalRevenue?date=${date}&store=${store.storeID}`,
    `/api/totalPizzas?date=${date}&store=${store.storeID}`,
    `/api/totalOrders?date=${date}&store=${store.storeID}`,
    `/api/averageOrderValue?date=${date}&store=${store.storeID}`,
    `/api/pizzasPerOrder?date=${date}&store=${store.storeID}`
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
      console.log("Revenue Data:", order);
      console.log("Pizzas Data:", order_1);
      console.log("Orders Data:", order_2);
      console.log("Order Value Data:", order_3);
      console.log("Pizzas Per Order Data:", order_4);

      document.getElementById("statsOverview").innerHTML = `
        <div class="stat-item">
          <h3>Revenue</h3>
          <p>${order}</p>
        </div>
        <div class="stat-item">
          <h3>Pizzas</h3>
          <p>${order_1}</p>
        </div>
        <div class="stat-item">
          <h3>Orders</h3>
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