document.addEventListener("DOMContentLoaded", function () {
  const addPassiveEventListener = (type) => {
    document.addEventListener(type, (event) => { }, { passive: true });
  };
  function sideBar() {
    fetch("/api/Stores")
      .then((response) => response.json())
      .then((data) => {
        // Group stores by city
        var groupedStores = data.reduce((acc, store) => {
          if (!acc[store.city]) {
            acc[store.city] = [];
          }
          acc[store.city].push(store);
          return acc;
        }, {});
        return groupedStores;
      })
      .then((groupedStores) => {
        var sidebar = document.querySelector("#sidebar");

        // Clear existing sidebar content
        sidebar.innerHTML = "";

        // Loop through each city in groupedStores
        for (var city in groupedStores) {
          if (groupedStores.hasOwnProperty(city)) {
            // Create a button for the city
            var cityDiv = document.createElement("div");
            cityDiv.classList.add("city-section");
            if (groupedStores[city].length === 1) {
              var cityLink = document.createElement("button");
              let storeID = groupedStores[city][0].storeID;
              cityLink.textContent = city + " - " + storeID;
              cityLink.classList.add("city-button");
              cityLink.onclick = function () {
                window.location.href = `/store`;
                localStorage.setItem('store', JSON.stringify({ "storeID": storeID }));
              };
              cityDiv.appendChild(cityLink);
            } else {
              var cityButton = document.createElement("button");
              cityButton.textContent = city;
              cityButton.classList.add("city-button");
              cityButton.onclick = function () {
                this.nextElementSibling.classList.toggle("show");
              };
              cityDiv.appendChild(cityButton);
            }
            // Create a list for the stores in the city
            var cityUl = document.createElement("ul");
            cityUl.classList.add("store-list", "hidden");

            groupedStores[city].forEach(function (store) {
              var storeLi = document.createElement("li");
              var a = document.createElement("a");
              a.href = `/store`;
              localStorage.setItem('store', JSON.stringify({ "storeID": store.storeID }));
              a.textContent = store.storeID;
              storeLi.appendChild(a);
              cityUl.appendChild(storeLi);
            });

            cityDiv.appendChild(cityUl);
            sidebar.appendChild(cityDiv);

          }
        }
        let testdiv = document.createElement("h1");
        //testdiv.textContent = "End of content";
        testdiv.classList.add("spacer");
        sidebar.appendChild(testdiv);
      })
      .catch((error) => {
        console.error("Error fetching stores:", error);
      });
  }
  addPassiveEventListener('wheel');
  addPassiveEventListener('mousewheel');
  addPassiveEventListener('touchstart');
  addPassiveEventListener('touchmove');
  // Call the sideBar function to populate the sidebar
  sideBar();
});

function subtractMonths(date, months) {
  let newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - months);

  if (newDate.getDate() !== new Date(date).getDate()) {
    newDate.setDate(0);
  }
  return newDate.toISOString().split("T")[0];
}

function calculatePeriod(startDate, endDate) {
  let diffTime = Math.abs(endDate - startDate);
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function backButton() {
  document
    .getElementById("redirectButton")
    .addEventListener("click", function () {
      localStorage.clear();
      window.location.href = "http://localhost:3000/";
    });
}

function ytd() {
  setActiveTimeButton("Last-Year");
  let fromButton = document.getElementById('FROM');
  let periodButton = document.getElementById('PERIOD');

  let startDate = subtractMonths(currentDate, 12);

  localStorage.setItem('date', JSON.stringify(startDate));

  updateCharts(startDate);
  fromButton.textContent = "FROM: " + startDate;
  periodButton.textContent = "PERIOD: 365 days";
}

function qtd() {
  setActiveTimeButton("Last-Quarter");
  let fromButton = document.getElementById('FROM');
  let periodButton = document.getElementById('PERIOD');

  let startDate = subtractMonths(currentDate, 3);

  localStorage.setItem('date', JSON.stringify(startDate));

  updateCharts(startDate);

  fromButton.textContent = "FROM: " + startDate;
  periodButton.textContent = "PERIOD: 90 days";
}

function mtd(update = true) {
  setActiveTimeButton("Last-Month");
  let fromButton = document.getElementById('FROM');
  let periodButton = document.getElementById('PERIOD');

  let startDate = subtractMonths(currentDate, 1);
  localStorage.setItem('date', JSON.stringify(startDate));
  if (update) {
    updateCharts(startDate);
  }
  fromButton.textContent = "FROM: " + startDate;
  periodButton.textContent = "PERIOD: 30 days";
}

function visibilityCoustomDate() {
  setActiveTimeButton("customDate");
  const customDateButton = document.getElementById('customDate');
  const datePicker = document.getElementById('datePicker');
  let isDatePickerInitialized = false;

  customDateButton.addEventListener('click', function () {
    if (!isDatePickerInitialized) {
      datePicker.value = '2022-12-01'; // Set the initial date only once
      isDatePickerInitialized = true;
    }
    datePicker.style.display = 'block';
    datePicker.style.color = 'black'; // Ensure the text color is black
    datePicker.focus();
  });

  datePicker.addEventListener('change', function () {
    const date = datePicker.value;
    updateCharts(date);
    datePicker.style.display = 'none'; // Hide the date picker after date is chosen
  });
}





function getTotalRevenue(date, storeID) {
  const endpoint = storeID ? `/api/totalRevenue?date=${date}&store=${storeID}` : `/api/totalRevenue?date=${date}`;
  return fetch(endpoint).then((response) => response.json());
}

function getTotalPizzas(date, storeID) {
  const endpoint = storeID ? `/api/totalPizzas?date=${date}&store=${storeID}` : `/api/totalPizzas?date=${date}`;
  return fetch(endpoint).then((response) => response.json());
}

function getTotalOrders(date, storeID) {
  const endpoint = storeID ? `/api/totalOrders?date=${date}&store=${storeID}` : `/api/totalOrders?date=${date}`;
  return fetch(endpoint).then((response) => response.json());
}

function getAverageOrderValue(date, storeID) {
  const endpoint = storeID ? `/api/averageOrderValue?date=${date}&store=${storeID}` : `/api/averageOrderValue?date=${date}`;
  return fetch(endpoint).then((response) => response.json());
}

function getPizzasPerOrder(date, storeID) {
  const endpoint = storeID ? `/api/pizzasPerOrder?date=${date}&store=${storeID}` : `/api/pizzasPerOrder?date=${date}`;
  return fetch(endpoint).then((response) => response.json());
}

function statOverview() {
  const store = JSON.parse(localStorage.getItem("store"));
  let date = JSON.parse(localStorage.getItem("date"));

  const storeID = store ? store.storeID : null;
  //anpassen fuer main seite 
  // Erstellen eines Arrays von Fetch-Promises
  const fetchPromises = [
    getTotalRevenue(date, storeID),
    getTotalPizzas(date, storeID),
    getTotalOrders(date, storeID),
    getAverageOrderValue(date, storeID),
    getPizzasPerOrder(date, storeID),
  ];
  // Verwenden von Promise.all, um auf alle Fetch-Anfragen zu warten
  return Promise.all(fetchPromises)
    .then((dataArray) => {
      // Kombinieren der Daten von den APIs
      const [
        totalRevenueData,
        totalPizzasData,
        totalOrdersData,
        averageOrderValueData,
        pizzasPerOrderData,
      ] = dataArray;
      var order = Math.round(totalRevenueData[0].total_revenue);
      var order_1 = Math.round(totalPizzasData[0].total_pizza);
      var order_2 = Math.round(totalOrdersData[0].total_orders);
      var order_3 = Math.round(averageOrderValueData[0].average_order_value);
      var order_4 = parseFloat(pizzasPerOrderData[0].pizzas_order).toFixed(2);
      document.getElementById("sSales").innerHTML = order_1;
      document.getElementById("sRevenue").innerHTML = order;
      document.getElementById("sCustomers").innerHTML = order;
      document.getElementById("oValue").innerHTML = order_3;

    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

function setActiveTimeButton(buttonId) {
  document.getElementById("Last-Year").classList.remove("active");
  document.getElementById("Last-Quarter").classList.remove("active");
  document.getElementById("Last-Month").classList.remove("active");
  document.getElementById("customDate").classList.remove("active");
  
  document.getElementById(buttonId).classList.add("active");
}
