"use strict";
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
            // Sort the keys (cities) of groupedStores
            var sortedCities = Object.keys(groupedStores).sort();
            // Loop through each sorted city in groupedStores
            sortedCities.forEach((city) => {
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
                    }
                    else {
                        var cityButton = document.createElement("button");
                        let currentButton = city;
                        cityButton.innerHTML = `<div class="city-button-content"><a style='font-size: 14px;'>${currentButton}</a> <i class="fa-solid fa-angle-left"></i></div>`;
                        cityButton.classList.add("city-button");
                        cityButton.onclick = function (params) {
                            let condition = !this.nextElementSibling.classList.contains("show");
                            if (condition) {
                                this.innerHTML = `<div class="city-button-content"><a style='font-size: 14px;'>${currentButton}</a> <i class="fa-solid fa-angle-down"></i></div>`;
                            }
                            else {
                                this.innerHTML = `<div class="city-button-content"><a style='font-size: 14px;'>${currentButton}</a> <i class="fa-solid fa-angle-left"></i></div>`;
                            }
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
                        a.onclick = function () {
                            localStorage.setItem('store', JSON.stringify({ "storeID": store.storeID }));
                            window.location.href = `/store`;
                        };
                        a.textContent = store.storeID;
                        storeLi.appendChild(a);
                        cityUl.appendChild(storeLi);
                    });
                    cityDiv.appendChild(cityUl);
                    sidebar.appendChild(cityDiv);
                }
            });
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
    let timeDiff = Math.abs(Math.ceil(new Date(date1) - new Date(date2)) / (1000 * 3600 * 24));
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
        }
        else if (pickedDate > new Date(currentDate)) {
            pickedDate = new Date(new Date(currentDate).getTime() - (7 * 24 * 60 * 60 * 1000));
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
async function fetchTotalOrders(dow) {
    let date = JSON.parse(localStorage.getItem("date"));
    let storeID = JSON.parse(localStorage.getItem("store"));
    storeID = storeID ? storeID.storeID : null;
    let response = await fetch(`/api/totalOrders?date=${date}${storeID ? `&store=${storeID}` : ''}${dow ? `&dow=${dow}` : ''}`);
    let data = await response.json();
    document.getElementById('totalOrders').innerText = data["period"].total_orders;
    if (data["percentageChange"] === "0.00") {
        return;
    }
    if (data["percentageChange"] > 0) {
        document.getElementById('totalOrdersChange').style.color = 'green';
        document.getElementById('totalOrdersChange').innerText = "+" + data["percentageChange"] + '%';
    }
    else {
        document.getElementById('totalOrdersChange').style.color = 'red';
        document.getElementById('totalOrdersChange').innerText = data["percentageChange"] + '%';
    }
}
// Function to fetch total revenue
async function fetchTotalRevenue(dow) {
    let date = JSON.parse(localStorage.getItem("date"));
    let storeID = JSON.parse(localStorage.getItem("store"));
    storeID = storeID ? storeID.storeID : null;
    const response = await fetch(`/api/totalRevenue?date=${date}${storeID ? `&store=${storeID}` : ''}${dow ? `&dow=${dow}` : ''}`);
    const data = await response.json();
    document.getElementById('totalRevenue').innerText = data["period"].total_revenue + "$";
    if (data["percentageChange"] === "0.00") {
        return;
    }
    if (data["percentageChange"] > 0) {
        document.getElementById('totalRevenueChange').style.color = 'green';
        document.getElementById('totalRevenueChange').innerText = "+" + data["percentageChange"] + '%';
    }
    else {
        document.getElementById('totalRevenueChange').style.color = 'red';
        document.getElementById('totalRevenueChange').innerText = data["percentageChange"] + '%';
    }
}
// Function to fetch total customers
async function fetchTotalCustomers(dow) {
    let date = JSON.parse(localStorage.getItem("date"));
    let storeID = JSON.parse(localStorage.getItem("store"));
    storeID = storeID ? storeID.storeID : null;
    const response = await fetch(`/api/totalCustomers?date=${date}${storeID ? `&store=${storeID}` : ''}${dow ? `&dow=${dow}` : ''}`);
    const data = await response.json();
    document.getElementById('totalCustomers').innerText = data["period"].total_customers;
    if (data["percentageChange"] === "0.00") {
        return;
    }
    if (data["percentageChange"] > 0) {
        document.getElementById('totalCustomersChange').style.color = 'green';
        document.getElementById('totalCustomersChange').innerText = "+" + data["percentageChange"] + '%';
    }
    else {
        document.getElementById('totalCustomersChange').style.color = 'red';
        document.getElementById('totalCustomersChange').innerText = data["percentageChange"] + '%';
    }
}
// Function to fetch total pizzas sold
async function fetchTotalPizzasSold(dow) {
    let date = JSON.parse(localStorage.getItem("date"));
    let storeID = JSON.parse(localStorage.getItem("store"));
    storeID = storeID ? storeID.storeID : null;
    const response = await fetch(`/api/totalPizzas?date=${date}${storeID ? `&store=${storeID}` : ''}${dow ? `&dow=${dow}` : ''}`);
    const data = await response.json();
    document.getElementById('totalPizzasSold').innerText = data["period"].total_pizzas_sold;
    if (data["percentageChange"] === "0.00") {
        return;
    }
    if (data["percentageChange"] > 0) {
        document.getElementById('totalPizzasSoldChange').style.color = 'green';
        document.getElementById('totalPizzasSoldChange').innerText = "+" + data["percentageChange"] + '%';
    }
    else {
        document.getElementById('totalPizzasSoldChange').style.color = 'red';
        document.getElementById('totalPizzasSoldChange').innerText = data["percentageChange"] + '%';
    }
}
// Function to fetch average orders per customer
async function fetchAverageOrderCustomer(dow) {
    let date = JSON.parse(localStorage.getItem("date"));
    let storeID = JSON.parse(localStorage.getItem("store"));
    storeID = storeID ? storeID.storeID : null;
    const response = await fetch(`/api/averageOrderCustomer?date=${date}${storeID ? `&store=${storeID}` : ''}${dow ? `&dow=${dow}` : ''}`);
    const data = await response.json();
    document.getElementById('avgOrdersPerCustomer').innerText = data["period"].avg_orders_per_customer;
    if (data["percentageChange"] === "0.00") {
        return;
    }
    if (data["percentageChange"] > 0) {
        document.getElementById('avgOrdersPerCustomerChange').style.color = 'green';
        document.getElementById('avgOrdersPerCustomerChange').innerText = "+" + data["percentageChange"] + '%';
    }
    else {
        document.getElementById('avgOrdersPerCustomerChange').style.color = 'red';
        document.getElementById('avgOrdersPerCustomerChange').innerText = data["percentageChange"] + '%';
    }
}
// Function to fetch average order value per customer
async function fetchAverageOrderValueCustomer(dow) {
    let date = JSON.parse(localStorage.getItem("date"));
    let storeID = JSON.parse(localStorage.getItem("store"));
    storeID = storeID ? storeID.storeID : null;
    const response = await fetch(`/api/averageOrderValueCustomer?date=${date}${storeID ? `&store=${storeID}` : ''}${dow ? `&dow=${dow}` : ''}`);
    const data = await response.json();
    document.getElementById('avgOrderValuePerCustomer').innerText = data["period"].avg_order_value_per_order + "$";
    if (data["percentageChange"] === "0.00") {
        return;
    }
    if (data["percentageChange"] > 0) {
        document.getElementById('avgOrderValuePerCustomerChange').style.color = 'green';
        document.getElementById('avgOrderValuePerCustomerChange').innerText = "+" + data["percentageChange"] + '%';
    }
    else {
        document.getElementById('avgOrderValuePerCustomerChange').style.color = 'red';
        document.getElementById('avgOrderValuePerCustomerChange').innerText = data["percentageChange"] + '%';
    }
}
// Function to fetch average pizzas per order per customer
async function fetchAveragePizzasPerOrderCustomer(dow) {
    let date = JSON.parse(localStorage.getItem("date"));
    let storeID = JSON.parse(localStorage.getItem("store"));
    storeID = storeID ? storeID.storeID : null;
    const response = await fetch(`/api/averagePizzasPerOrderCustomer?date=${date}${storeID ? `&store=${storeID}` : ''}${dow ? `&dow=${dow}` : ''}`);
    const data = await response.json();
    document.getElementById('avgPizzasPerOrder').innerText = parseFloat(data["period"].avg_pizzas_per_order).toFixed(2);
    if (data["percentageChange"] === "0.00") {
        return;
    }
    if (data["percentageChange"] > 0) {
        document.getElementById('avgPizzasPerOrderChange').style.color = 'green';
    }
    else {
        document.getElementById('avgPizzasPerOrderChange').style.color = 'red';
    }
    document.getElementById('avgPizzasPerOrderChange').innerText = data["percentageChange"] + '%';
}
// Function to fetch order frequency per customer
async function fetchAverageOrderFrequency(dow) {
    let date = JSON.parse(localStorage.getItem("date"));
    let storeID = JSON.parse(localStorage.getItem("store"));
    storeID = storeID ? storeID.storeID : null;
    const response = await fetch(`/api/averageOrderFrequency?date=${date}${storeID ? `&store=${storeID}` : ''}${dow ? `&dow=${dow}` : ''}`);
    const data = await response.json();
    document.getElementById('orderFrequency').innerText = parseFloat(data["period"].average_order_frequency).toFixed(2);
    if (data["percentageChange"] > 0) {
        document.getElementById('orderFrequencyChange').style.color = 'red';
    }
    else {
        document.getElementById('orderFrequencyChange').style.color = 'green';
    }
    document.getElementById('orderFrequencyChange').innerText = data["percentageChange"] + '%';
}
// Call functions on page load
document.addEventListener('DOMContentLoaded', function () {
    const date = '2022-12-01';
    if (!localStorage.getItem('date')) {
        localStorage.setItem('date', JSON.stringify(date));
    }
    fetchTotalOrders();
    fetchTotalRevenue();
    fetchTotalCustomers();
    fetchTotalPizzasSold();
    fetchAverageOrderCustomer();
    fetchAverageOrderValueCustomer();
    fetchAveragePizzasPerOrderCustomer();
    fetchAverageOrderFrequency();
});
function setActiveTimeButton(buttonId) {
    document.getElementById("Last-Year").classList.remove("active");
    document.getElementById("Last-Quarter").classList.remove("active");
    document.getElementById("Last-Month").classList.remove("active");
    document.getElementById("customDate").classList.remove("active");
    document.getElementById(buttonId).classList.add("active");
}
async function fetchAverageOrdersByDayOfWeek() {
    let date = JSON.parse(localStorage.getItem("date"));
    let store = JSON.parse(localStorage.getItem("store"));
    let storeID = store ? store.storeID : null;
    let response = await fetch(`/api/averageOrdersByDayOfWeek?date=${date}${storeID ? `&store=${storeID}` : ''}${dow ? `&dow=${dow}` : ''}`);
    let data = await response.json();
    document.getElementById('totalOrders').innerText = data.avg_orders;
}
async function fetchAverageRevenueByDayOfWeek() {
    let date = JSON.parse(localStorage.getItem("date"));
    let store = JSON.parse(localStorage.getItem("store"));
    let storeID = store ? store.storeID : null;
    const response = await fetch(`/api/averageRevenueByDayOfWeek?date=${date}${storeID ? `&store=${storeID}` : ''}${dow ? `&dow=${dow}` : ''}`);
    const data = await response.json();
    document.getElementById('totalRevenue').innerText = data.avg_revenue + "$";
}
async function fetchAverageCustomersByDayOfWeek() {
    let date = JSON.parse(localStorage.getItem("date"));
    let store = JSON.parse(localStorage.getItem("store"));
    let storeID = store ? store.storeID : null;
    const response = await fetch(`/api/averageCustomersByDayOfWeek?date=${date}${storeID ? `&store=${storeID}` : ''}${dow ? `&dow=${dow}` : ''}`);
    const data = await response.json();
    document.getElementById('totalCustomers').innerText = data.avg_customers;
}
async function fetchAveragePizzasSoldByDayOfWeek() {
    let date = JSON.parse(localStorage.getItem("date"));
    let store = JSON.parse(localStorage.getItem("store"));
    let storeID = store ? store.storeID : null;
    const response = await fetch(`/api/averagePizzasSoldByDayOfWeek?date=${date}${storeID ? `&store=${storeID}` : ''}${dow ? `&dow=${dow}` : ''}`);
    const data = await response.json();
    document.getElementById('totalPizzasSold').innerText = data.avg_pizzas_sold;
}
//# sourceMappingURL=ui.js.map