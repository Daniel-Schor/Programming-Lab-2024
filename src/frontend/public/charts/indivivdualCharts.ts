
// TODO use .env variables instead
const defaultDate = "2022-12-01";
const currentDate = "2022-12-31";
const theme = '#ccc';

// TODO move to generalCharts.ts
function backButton() {
  document.getElementById("redirectButton").addEventListener("click", function () {
    window.location.href = "http://localhost:3000/";
  });
}

// TODO move to Helpers dir
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
  heatmap(date);
}

// TODO move to generalCharts.ts
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
      
      updateChart(myChart, option);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// TODO move to generalCharts.ts
// TODO split
function statsOverview(date = "2022-12-01") {
  // Abrufen der storeID aus dem localStorage
  var store = JSON.parse(localStorage.getItem("store"));
  

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
  function abc() {
    var app: any = {};
type EChartsOption = echarts.EChartsOption;

var chartDom = document.getElementById('abc')!;
var myChart = echarts.init(chartDom);
var option: EChartsOption;

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
] as const;

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
    }, {} as Record<string, string>)
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
    const labelOption: BarLabelOption = {
      rotate: app.config.rotate as BarLabelOption['rotate'],
      align: app.config.align as BarLabelOption['align'],
      verticalAlign: app.config
        .verticalAlign as BarLabelOption['verticalAlign'],
      position: app.config.position as BarLabelOption['position'],
      distance: app.config.distance as BarLabelOption['distance']
    };
    myChart.setOption<echarts.EChartsOption>({
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

type BarLabelOption = NonNullable<echarts.BarSeriesOption['label']>;

const labelOption: BarLabelOption = {
  show: true,
  position: app.config.position as BarLabelOption['position'],
  distance: app.config.distance as BarLabelOption['distance'],
  align: app.config.align as BarLabelOption['align'],
  verticalAlign: app.config.verticalAlign as BarLabelOption['verticalAlign'],
  rotate: app.config.rotate as BarLabelOption['rotate'],
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
  legend: {
    data: ['Forest', 'Steppe', 'Desert', 'Wetland']
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
      axisTick: { show: false },
      data: ['A', 'B', 'X', '2015', '2016']
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: 'Forest',
      type: 'bar',
      barGap: 0,
      label: labelOption,
      emphasis: {
        focus: 'series'
      },
      data: [0, 332, 301, 334, 390]
    },
    {
      name: 'Steppe',
      type: 'bar',
      label: labelOption,
      emphasis: {
        focus: 'series'
      },
      data: [220, 182, 191, 234, 290]
    },
    {
      name: 'Desert',
      type: 'bar',
      label: labelOption,
      emphasis: {
        focus: 'series'
      },
      data: [150, 232, 201, 154, 190]
    },
    {
      name: 'Wetland',
      type: 'bar',
      label: labelOption,
      emphasis: {
        focus: 'series'
      },
      data: [98, 77, 101, 99, 40]
    }
  ]
};

option && myChart.setOption(option);
}