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
