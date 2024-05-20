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
  
  var chartDom = document.getElementById("gauge-chart");
  var myChart = echarts.init(chartDom);
  var option;

  const gaugeData = [
    {
      value: 20,
      name: "Perfect",
      title: {
        offsetCenter: ["0%", "-30%"],
      },
      detail: {
        valueAnimation: true,
        offsetCenter: ["0%", "-20%"],
      },
    },
    {
      value: 40,
      name: "Good",
      title: {
        offsetCenter: ["0%", "0%"],
      },
      detail: {
        valueAnimation: true,
        offsetCenter: ["0%", "10%"],
      },
    },
    {
      value: 80,
      name: "Commonly",
      title: {
        offsetCenter: ["0%", "30%"],
      },
      detail: {
        valueAnimation: true,
        offsetCenter: ["0%", "40%"],
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
          formatter: "{value}%",
        },
      },
    ],
  };

  option && myChart.setOption(option);
}
