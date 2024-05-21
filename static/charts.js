function testbarchart() {
  var myChart = echarts.init(document.getElementById("test"));
  //get data from api
  fetch("/revenue?date=2022-12-31&store=S062214,S013343,S216043")
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
  fetch("quality?store=S013343")
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
function revenueChart() {
  var storeS062214 = [];
  var storeS013343 = [];
  var storeS216043 = [];
  var days = [];

  fetch("/revenue?store=S062214,S013343,S216043")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((item) => {
        switch (item.storeID) {
          case "S062214":
            storeS062214.push(Number(item.sum));
            break;
          case "S013343":
            var date = new Date(item.day);
            days.push(date.getDate());
            storeS013343.push(Number(item.sum));
            break;
          case "S216043":
            storeS216043.push(Number(item.sum));
            break;
        }
      });
      storeS062214.reverse();
      storeS013343.reverse();
      storeS216043.reverse();
      days.reverse();
      console.log("Data for S062214:", storeS062214);
      console.log("Data for S013343:", storeS013343);
      console.log("Data for S216043:", storeS216043);
      console.log("Days:", days);

      var dom = document.getElementById("revenue");
      var myChart = echarts.init(dom, null, {
        renderer: "canvas",
        useDirtyRect: false,
      });
      var app = {};

      var option;

      option = {
        title: {
          text: "Revenue Chart",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985",
            },
          },
        },
        legend: {
          data: ["storeS062214", "storeS013343", "storeS216043"],
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        grid: {
          left: "3%",
          right: "4%",
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
        series: [
          {
            name: "storeS062214",
            type: "line",
            stack: "Total",
            areaStyle: {},
            emphasis: {
              focus: "series",
            },
            data: storeS062214,
          },
          {
            name: "storeS013343",
            type: "line",
            stack: "Total",
            areaStyle: {},
            emphasis: {
              focus: "series",
            },
            data: storeS013343,
          },
          {
            name: "storeS216043",
            type: "line",
            stack: "Total",
            areaStyle: {},
            emphasis: {
              focus: "series",
            },
            data: storeS216043,
          },
        ],
      };

      if (option && typeof option === "object") {
        myChart.setOption(option);
      }

      window.addEventListener("resize", myChart.resize);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
