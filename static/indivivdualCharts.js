function ordernumber() {
  //http://localhost:3000/revenue?store=S486166
}

function monthlyRevenue() {
  var store = JSON.parse(localStorage.getItem("store")); // Retrieve the store variable
  //http://localhost:3000/revenue?store=S486166
  var days = [];
  var revenue = [];
  var dom = document.getElementById("Store-revenue");
  var myChart = echarts.init(dom, null, {
    renderer: "canvas",
    useDirtyRect: false,
  });
  fetch(`/revenue?store=${store.storeID}`)
    .then((response) => response.json())
    .then((data) => {
      revenue = Object.values(data[`${store.storeID}`]);
      days = Object.keys(data[`${store.storeID}`]);
      days.pop();

      revenue.reverse();
      days.reverse();

      console.log("Days:", days);

      option = {
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

function gaugeChart() {
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

  var option;
  fetch(`quality?store=${store.storeID}`)
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
