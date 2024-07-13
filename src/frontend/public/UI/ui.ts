
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

function calcDayDiff(date1, date2) {
  let timeDiff = Math.abs(Math.ceil(new Date(date1) - new Date(date2)) / (1000 * 3600 * 24)));
  return timeDiff;
}

function ytd() {
  setActiveTimeButton("Last-Year");
  let fromButton = document.getElementById('FROM');
  let periodButton = document.getElementById('PERIOD');

  let startDate = subtractMonths(currentDate, 12);

  localStorage.setItem('date', JSON.stringify(startDate));

  updateCharts(startDate);
  fromButton.textContent = "FROM: " + startDate;
  periodButton.textContent = `PERIOD: ${calcDayDiff(startDate, currentDate)} days`;
}

function qtd() {
  setActiveTimeButton("Last-Quarter");
  let fromButton = document.getElementById('FROM');
  let periodButton = document.getElementById('PERIOD');

  let startDate = subtractMonths(currentDate, 3);

  localStorage.setItem('date', JSON.stringify(startDate));

  updateCharts(startDate);

  fromButton.textContent = "FROM: " + startDate;
  periodButton.textContent = `PERIOD: ${calcDayDiff(startDate, currentDate)} days`;
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
  periodButton.textContent = `PERIOD: ${calcDayDiff(startDate, currentDate)} days`;
}

function visibilityCoustomDate() {
  // Activate custom date button
  setActiveTimeButton("customDate");

  // Get DOM elements
  const datePicker = document.getElementById('datePicker');
  const fromButton = document.getElementById('FROM');
  const periodButton = document.getElementById('PERIOD');

  // Set date picker value from localStorage
  datePicker.value = JSON.parse(localStorage.getItem("date"));

  // Display and style date picker
  datePicker.style.display = 'block';
  datePicker.focus();

  function acceptInput() {
    let pickedDate = new Date(datePicker.value);
    let formattedDate;
    let minDate = new Date("2020-01-01");
    if (pickedDate < minDate) {
      pickedDate = minDate;
    } else if (pickedDate > new Date(currentDate)) {
      pickedDate = new Date(new Date(currentDate).getTime() - (7 * 24 * 60 * 60 * 1000))
    }

    // Format picked date
    formattedDate = pickedDate.toISOString().split("T")[0];

    // Update button texts
    fromButton.textContent = "FROM: " + formattedDate;
    periodButton.textContent = `PERIOD: ${calcDayDiff(formattedDate, currentDate)} days`;

    // Hide date picker
    datePicker.style.display = 'none';

    updateCharts(formattedDate);
  }
  // Add change event listener
  datePicker.addEventListener('blur', function () {
    acceptInput();
  });
  datePicker.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      acceptInput();
    }
  });
}






// Function to fetch total orders
async function fetchTotalOrders(date: string, storeID?: string) {
  const response = await fetch(`/api/totalOrders?date=${date}${storeID ? `&store=${storeID}` : ''}`);
  const data = await response.json();
  document.getElementById('totalOrders').innerText = data.total_orders;
}

// Function to fetch total revenue
async function fetchTotalRevenue(date: string, storeID?: string) {
  const response = await fetch(`/api/totalRevenue?date=${date}${storeID ? `&store=${storeID}` : ''}`);
  const data = await response.json();
  document.getElementById('totalRevenue').innerText = data.total_revenue;
}

// Function to fetch total customers
async function fetchTotalCustomers() {
  const response = await fetch(`/api/totalCustomers`);
  const data = await response.json();
  document.getElementById('totalCustomers').innerText = data.total_customers;
}

// Function to fetch total pizzas sold
async function fetchTotalPizzasSold(date: string, storeID?: string) {
  const response = await fetch(`/api/totalPizzas?date=${date}${storeID ? `&store=${storeID}` : ''}`);
  const data = await response.json();
  document.getElementById('totalPizzasSold').innerText = data.total_pizzas_sold;
}

// Function to fetch average orders per customer
async function fetchAverageOrderCustomer(date: string, storeID?: string) {
  const response = await fetch(`/api/averageOrderCustomer?date=${date}${storeID ? `&store=${storeID}` : ''}`);
  const data = await response.json();
  document.getElementById('avgOrdersPerCustomer').innerText = data.avg_orders_per_customer;
}

// Function to fetch average order value per customer
async function fetchAverageOrderValueCustomer(date: string, storeID?: string) {
  const response = await fetch(`/api/averageOrderValueCustomer?date=${date}${storeID ? `&store=${storeID}` : ''}`);
  const data = await response.json();
  document.getElementById('avgOrderValuePerCustomer').innerText = data.avg_order_value_per_order;
}

// Function to fetch average pizzas per order per customer
async function fetchAveragePizzasPerOrderCustomer(date: string, storeID?: string) {
  const response = await fetch(`/api/averagePizzasPerOrderCustomer?date=${date}${storeID ? `&store=${storeID}` : ''}`);
  const data = await response.json();
  document.getElementById('avgPizzasPerOrder').innerText = data.avg_pizzas_per_order;
}

// Function to fetch order frequency per customer
async function fetchOrderFrequencyCustomer(date: string, storeID?: string) {
  const response = await fetch(`/api/averageOrderFrequency?date=${date}${storeID ? `&store=${storeID}` : ''}`);
  const data = await response.json();
  document.getElementById('orderFrequency').innerText = data.avg_order_frequency_in_days;
}

// Call functions on page load
document.addEventListener('DOMContentLoaded', function () {
  const date = '2022-12-01'; // Example date, adjust as necessary
  fetchTotalOrders(date);
  fetchTotalRevenue(date);
  fetchTotalCustomers();
  fetchTotalPizzasSold(date);
  fetchAverageOrderCustomer(date);
  fetchAverageOrderValueCustomer(date);
  fetchAveragePizzasPerOrderCustomer(date);
  fetchOrderFrequencyCustomer(date);
});


function setActiveTimeButton(buttonId) {
  document.getElementById("Last-Year").classList.remove("active");
  document.getElementById("Last-Quarter").classList.remove("active");
  document.getElementById("Last-Month").classList.remove("active");
  document.getElementById("customDate").classList.remove("active");

  document.getElementById(buttonId).classList.add("active");
}
