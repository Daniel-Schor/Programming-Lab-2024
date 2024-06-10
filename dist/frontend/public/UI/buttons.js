"use strict";
function sideBar() {
    var stores = [];
    fetch("/api/Stores")
        .then((response) => response.json())
        .then((data) => {
        stores = data;
    })
        .then(() => {
        var ul = document.querySelector("header nav ul");
        stores.forEach(function (store) {
            // Create a new <li> element
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href = `/individualStore?store=${store.storeID}`;
            localStorage.setItem('store', JSON.stringify({ "storeID": store.storeID }));
            a.textContent = store.storeID;
            li.appendChild(a);
            ul.appendChild(li);
        });
    });
}
function statOverview(date = "2022-12-01") {
    // Abrufen der storeID aus dem localStorage
    var store = JSON.parse(localStorage.getItem("store"));
    console.log(store);
    // Definieren der API-Endpunkte
    const apiEndpoints = store
        ? [
            `/api/totalRevenue?date=${date}&store=${store.storeID}`,
            `/api/totalPizzas?date=${date}&store=${store.storeID}`,
            `/api/totalOrders?date=${date}&store=${store.storeID}`,
            `/api/averageOrderValue?date=${date}&store=${store.storeID}`,
            `/api/pizzasPerOrder?date=${date}&store=${store.storeID}`
        ]
        : [
            `/api/totalRevenue?date=${date}`,
            `/api/totalPizzas?date=${date}`,
            `/api/totalOrders?date=${date}`,
            `/api/averageOrderValue?date=${date}`,
            `/api/pizzasPerOrder?date=${date}`
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
//# sourceMappingURL=buttons.js.map