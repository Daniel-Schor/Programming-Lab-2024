"use strict";
function sideBar() {
    var stores = [];
    fetch("")
        .then((response) => response.json())
        .then((data) => {
        stores = data[stores.storeID];
        console.log(stores);
    });
    stores.forEach(function (store) {
        // Create a new <li> element
        var li = document.createElement('li');
        // Create a new <a> element
        var a = document.createElement('a');
        a.href = item.url;
        a.textContent = item.name;
        // Append the <a> element to the <li> element
        li.appendChild(a);
        // Append the <li> element to the <ul> element
        ul.appendChild(li);
    });
}
//# sourceMappingURL=buttons.js.map