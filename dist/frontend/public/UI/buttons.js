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
//# sourceMappingURL=buttons.js.map