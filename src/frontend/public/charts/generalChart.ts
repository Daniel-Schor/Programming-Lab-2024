/*function updateTotalRevenue(data) {
    const order = Math.round(data[0].total_revenue);
    document.getElementById("totalRevenue").innerHTML = `<p>${order}</p>`;
  }
  
  function updateTotalPizzas(data) {
    const order = Math.round(data[0].total_pizza);
    document.getElementById("totalPizzas").innerHTML = `<p>${order}</p>`;
  }
  
  function updateTotalOrders(data) {
    const order = Math.round(data[0].total_orders);
    document.getElementById("totalOrders").innerHTML = `<p>${order}</p>`;
  }
  
  function updateAverageOrderValue(data) {
    const order = Math.round(data[0].average_order_value);
    document.getElementById("averageOrderValue").innerHTML = `<p>${order}</p>`;
  }
  
  function updatePizzasPerOrder(data) {
    const order = parseFloat(data[0].pizzas_order).toFixed(2);
    document.getElementById("pizzasPerOrder").innerHTML = `<p>${order}</p>`;
  }
  
  function statsOverview(date = "2022-12-01") {
    const apiEndpoints = [
      `/api/totalRevenue?date=${date}`,
      `/api/totalPizzas?date=${date}`,
      `/api/totalOrders?date=${date}`,
      `/api/averageOrderValue?date=${date}`,
      `/api/pizzasPerOrder?date=${date}`
    ];
  
    const fetchPromises = apiEndpoints.map(endpoint => fetch(endpoint).then(response => response.json()));
  
    Promise.all(fetchPromises)
      .then(dataArray => {
        updateTotalRevenue(dataArray[0]);
        updateTotalPizzas(dataArray[1]);
        updateTotalOrders(dataArray[2]);
        updateAverageOrderValue(dataArray[3]);
        updatePizzasPerOrder(dataArray[4]);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
  }*/
 
async function pizzaPopularity(date = "2022-12-01") {
  var chartDom = document.getElementById("pizzaPopularity");
  var myChart = echarts.init(chartDom, theme);
  var option;

  try {
    const response = await fetch(`/api/pizzaPopularity?date=${date}`);
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
          symbolSize: 20,
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
      title: {
        text: 'Bump Chart (Ranking)'
      },
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
        left: 30,
        right: 110,
        bottom: 30,
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
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