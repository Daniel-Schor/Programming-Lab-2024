const defaultDate = "2022-12-01";
const currentDate = "2022-12-31";

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
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom);

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
        series: [{ data: revenue, type: "line" }],
      };

      updateChart(myChart, option);
    });
}

function gaugeChart(date = "2022-12-01") {
  var store = JSON.parse(localStorage.getItem("store"));
  var dom = document.getElementById("container");
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom);

  document.getElementById("Store-quality").innerHTML = `Store: ${store.storeID} Quality`;

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
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom);
  var option;

  const days = [
    "Veggie Pizza", "Sicilian Pizza", "Pepperoni Pizza", "Oxtail Pizza", "Meat Lover's Pizza",
    "Margherita Pizza", "Hawaiian Pizza", "Buffalo Chicken Pizza", "BBQ Chicken Pizza"
  ];

  const data = [
    [0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0],
    [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4],
    [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0],
    [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9],
    [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2],
    [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0],
    [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5],
    [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0],
    [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13],
    [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1],
    [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 1], [4, 4, 100], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2],
    [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8],
    [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0],
    [5, 5, 0], [5, 6, 1], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5],
    [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0],
    [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0],
    [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0],
    [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]
  ]
    .map(function (item) {
      return [item[1], item[0], item[2] || '-'];
    });

  option = {
    tooltip: { position: "top" },
    grid: { height: "50%", top: "10%" },
    xAxis: { type: "category", data: days, splitArea: { show: true } },
    yAxis: { type: "category", data: days, splitArea: { show: true } },
    visualMap: { min: 0, max: 10, calculable: true, orient: "horizontal", left: "center", bottom: "15%" },
    series: [{
      name: "Combination with",
      type: "heatmap",
      data: data,
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.5)" } },
    }],
  };

  if (option && typeof option === "object") {
    myChart.setOption(option);
  }

  window.addEventListener("resize", myChart.resize);
}

function pizzaSize(date = "2022-12-01") {
 //SELECT p.purchaseID, pr.Name, pr.SizeFROM purchaseItems piJOIN products pr ON pi.SKU = pr.SKUJOIN purchase p ON pi.purchaseID = p.purchaseID;

  var dom = document.getElementById('PizzaSize');
  var myChart = echarts.getInstanceByDom(dom) || echarts.init(dom);

  var option = {
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center' },
    series: [{
      name: 'Pizza Size Sales',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 40, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: [
        { value: 1048, name: 'Small' },
        { value: 735, name: 'Medium' },
        { value: 580, name: 'Large' }
      ]
    }]
  };

  if (option && typeof option === 'object') {
    myChart.setOption(option);
  }

  window.addEventListener('resize', myChart.resize);
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