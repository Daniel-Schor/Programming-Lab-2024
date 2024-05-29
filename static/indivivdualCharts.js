

function dashboard() {
  //http://localhost:3000/revenue?store=S486166
  var store = JSON.parse(localStorage.getItem("store")); // Retrieve the store variable
  fetch(`/api/revenue?store=${store.storeID}`)
    .then((response) => response.json())
    .then((data) => {
      //CODE HERE
    });
}

function backButton() {
  document.getElementById("redirectButton").addEventListener("click", function () {
    window.location.href = "http://localhost:3000/";
  });
}

function timeButtons() {
  document.getElementById("Last-Year").addEventListener("click", function () {
    finaldate.setFullYear(finaldate.getFullYear() - 1);
    choosenDate = finaldate.toISOString().split("T")[0];
    console.log(choosenDate);
    monthlyRevenue(choosenDate); // Call monthlyRevenue after date change
    gaugeChart(choosenDate);
  });

  document.getElementById("Last-Month").addEventListener("click", function () {
    finaldate = new Date(finaldate); 
    finaldate.setMonth(finaldate.getMonth() - 1);
    choosenDate = finaldate.toISOString().split("T")[0]; 
    console.log(choosenDate);
    monthlyRevenue(choosenDate);// Call monthlyRevenue after date change
    gaugeChart(choosenDate);
  });

  document.getElementById("Last-Quarter").addEventListener("click", function () {
    finaldate = new Date(finaldate); 
    finaldate.setMonth(finaldate.getMonth() - 3);
    choosenDate = finaldate.toISOString().split("T")[0]; 
    console.log(choosenDate);
    monthlyRevenue(choosenDate); 
    gaugeChart(choosenDate);
  });
}

function customDate() {
  document.getElementById('customDate').addEventListener('click', function() {
    document.getElementById('customDateForm').style.display = 'block';
  });

  document.getElementById('dateForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const startDate = document.getElementById('startDate').value;
    choosenDate = startDate;
    console.log(choosenDate);
    monthlyRevenue(choosenDate); 
  });
}

var finaldate = new Date("2022-12-01");
var choosenDate = "2022-12-01"; // Default date

function monthlyRevenue(date = "2022-12-01") {
  var store = JSON.parse(localStorage.getItem("store")); 
  var days = [];
  var revenue = [];
  var dom = document.getElementById("Store-revenue");
  var myChart = echarts.init(dom, null, {
    renderer: "canvas",
    useDirtyRect: false,
  });
  myChart.clear();
  fetch(`/api/revenue?reverse=true&date=${date}&store=${store.storeID}`)
    .then((response) => response.json())
    .then((data) => {
      revenue = data[store.storeID];
      delete revenue.changeValue;
      revenue = Object.values(revenue);

      days = data[store.storeID];
      delete days.changeValue;
      days = Object.keys(days);

      console.log("Days:", days);

      var option = {
        xAxis: {
          type: "category",
          data: days,
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["storeS062214"],
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: revenue,
            type: "line",
          },
        ],
      };
      if (option && typeof option === "object") {
        myChart.setOption(option);
      }

      window.addEventListener("resize", myChart.resize);
    });
}

function gaugeChart(date = "2022-12-01") {
  var store = JSON.parse(localStorage.getItem("store")); // Retrieve the store variable

  // Now you can use the store variable to change the text

  var dom = document.getElementById("container");
  var myChart = echarts.init(dom, null, {
    renderer: "canvas",
    useDirtyRect: false,
  });
  var app = {};
  document.getElementById(
    "Store-quality"
  ).innerHTML = `Store: ${store.storeID} Quality`;
  myChart.clear();
  var option;
  fetch(`/api/quality?date=${date}&store=${store.storeID}`)
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

      if (option && typeof option === "object") {
        myChart.setOption(option);
      }

      window.addEventListener("resize", myChart.resize);
    }) // This is where the missing parenthesis should be
    .catch((error) => {
      console.error("Error:", error);
    });
}
function heatmap(date = "2022-12-01") {
  var dom = document.getElementById("Heatmap");
  var myChart = echarts.init(dom, null, {
    renderer: "canvas",
    useDirtyRect: false,
  });
  var app = {};
  //date=${date}&store=${store.storeID}
  var option;

  // prettier-ignore

  // prettier-ignore
  const days = [
    "Veggie Pizza",
    "Sicilian Pizza",
    "Pepperoni Pizza",
    "Oxtail Pizza",
    "Meat Lover's Pizza",
    "Margherita Pizza",
    "Hawaiian Pizza",
    "Buffalo Chicken Pizza",
    "BBQ Chicken Pizza"
  ];
  // prettier-ignore
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
    tooltip: {
      position: "top",
    },
    grid: {
      height: "50%",
      top: "10%",
    },
    xAxis: {
      type: "category",
      data: days,
      splitArea: {
        show: true,
      },
    },
    yAxis: {
      type: "category",
      data: days,
      splitArea: {
        show: true,
      },
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "15%",
    },
    series: [
      {
        name: "Combination with",
        type: "heatmap",
        data: data,
        label: {
          show: true,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  if (option && typeof option === "object") {
    myChart.setOption(option);
  }

  window.addEventListener("resize", myChart.resize);
}
function pizzaSize(date = "2022-12-01"){
  
  var dom = document.getElementById('PizzaSize');
  var myChart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false
  });
  var app = {};
  
  var option;

  option = {
tooltip: {
  trigger: 'item'
},
legend: {
  top: '5%',
  left: 'center'
},
series: [
  {
    name: 'Pizza Size Sales',
    type: 'pie',
    radius: ['40%', '70%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 10,
      borderColor: '#fff',
      borderWidth: 2
    },
    label: {
      show: false,
      position: 'center'
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 40,
        fontWeight: 'bold'
      }
    },
    labelLine: {
      show: false
    },
    data: [
      { value: 1048, name: 'Small' },
      { value: 735, name: 'Medium' },
      { value: 580, name: 'Large' }
    ]
  }
]
};

  if (option && typeof option === 'object') {
    myChart.setOption(option);
  }

  window.addEventListener('resize', myChart.resize);

}