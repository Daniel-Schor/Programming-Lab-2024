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
  