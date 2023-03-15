document.cookie = "cookieName=cookieValue; SameSite=Strict";

// Load a map using the Bing API
let map;

function GetMap(){

    let apiKey = localStorage.getItem('bingApiKey');

    if (apiKey) {
        map = new Microsoft.Maps.Map('#map', {
            credentials: apiKey
        });
    } else {
        
        apiKey = prompt("Please enter your Bing Maps API key:");

        if (apiKey) {
            map = new Microsoft.Maps.Map('#map', {
                credentials: apiKey
            });
        } else {
            document.getElementById("api-key-overlay").style.display = "block";
        }
    }

    //console.log("hello world");
}

// Define an array to store all properties
let propertyList = [];

// Import and Export Data References
const importDataButton = document.getElementById("import-data-button");
const importDataOverlay = document.getElementById("import-data-overlay");
const exportDataOverlay = document.getElementById("export-data-overlay");
const exportCodeBox = exportDataOverlay.querySelector(".export-code-box");
const exportCopyButton = exportDataOverlay.querySelector("#export-copy-data-button");

// Display map when Bing Maps JavaScript is loaded
function loadMapScenario() {
    // if propertyList is empty, pass
    if (propertyList.length === 0) {
        return;
    } else {
        for (const element of propertyList) {

            let color = "";
            if (element.usage === "rental") {
                color = "red";
            } else if (element.usage === "lessor") {
                color = "purple";
            } else if (element.usage === "lessee") {
                color = "blue";
            } else if (element.usage === "personal") {
                color = "green";
            }

            let pushpin = new Microsoft.Maps.Pushpin(
                new Microsoft.Maps.Location(element.lat, element.long), 
                {
                    title: element.address,
                    color: color
                }
            );
            
            // show an infobox when pushbutton clicked, hide the infobox when pushpin clicked again
            Microsoft.Maps.Events.addHandler(pushpin, 'click', function(e) {
                let overlay = document.getElementById("property-info-overlay");

                document.getElementById("info-address").innerHTML = "Address: " + element.address;
                document.getElementById("info-num-units").innerHTML = "Number of Units: " + element.num_units.toString();
                document.getElementById("info-price").innerHTML = "Purchase Price: " + element.price.toString();
                document.getElementById("info-currency").innerHTML = "Currency: " + element.currency;
                document.getElementById("info-date-acquired").innerHTML = "Date Acquired: " + element.date_acquired;

                if (overlay.style.display === "block") {
                    overlay.style.display = "none";
                } else {
                    overlay.style.display = "block";
                }
            });

            map.entities.push(pushpin);
        }
    }
}

// Define the function to add a new property
function addProperty() {
    // Get form input values
    let address = document.getElementById("address");
    let lat = document.getElementById("lat");
    let long = document.getElementById("long");
    let date_acquired = document.getElementById("acquired-date");
    let usage = document.getElementById("property-type");
    let num_units = document.getElementById("unit-count");
    let price = document.getElementById("purchase-price");
    let currency = document.getElementById("currency");


    console.log("address: ", address.value);
    console.log("lat: ", lat.value);
    console.log("long: ", long.value);
    console.log("date_acquired: ", date_acquired.value);
    console.log("usage: ", usage.value);
    console.log("num_units: ", num_units.value);
    console.log("price: ", price.value);
    console.log("currency: ", currency.value);

    // Ensure that all required form inputs are present
    if ( !address.value || !lat.value || !long.value || !date_acquired.value || !usage.value || !num_units.value || !price.value || !currency.value ) {
        console.error("Unable to add property: one or more required form inputs is missing");
        return;
    }

    // Create new property object
    let newProperty = {
        address: address.value,
        lat: lat.value,
        long: long.value,
        date_acquired: date_acquired.value,
        usage: usage.value,
        num_units: num_units.value,
        price: price.value,
        currency: currency.value
    };

    // Add the new property to the property list
    propertyList.push(newProperty);
    
    // Clear form inputs
    document.getElementById("add-property-form").reset();

    // Hide "Add Property" overlay
    document.getElementById("add-property").style.display = "none";

    // Reload the map
    loadMapScenario();
}

// hide the export data overlay
document.getElementById("export-data-overlay").style.display = "none";

// Add event listener to the Add Property button
let addPropertyButton = document.getElementById("add-property-button");
addPropertyButton.addEventListener("click", function() {

// Show the add property overlay
let addPropertyOverlay = document.getElementById("add-property");
    addPropertyOverlay.style.display = "block";
});

// Add event listener to the form submit button
let form = document.getElementById("add-property-form");
    form.addEventListener("submit", function(event) {
    event.preventDefault();
    addProperty();
});

// Add an event listener to the export data button
document.getElementById("export-button").addEventListener("click", () => {

    // Populate the code box with your data
    let dataArray = [];
    for (const element of propertyList) {
        dataArray.push(element);
    }
    let dataToExport = JSON.stringify(dataArray);
    console.log(dataToExport);
    document.getElementById("data-to-export").textContent = dataToExport;

    // Show the export data overlay
    exportDataOverlay.style.display = "block";

});

// Add an event listener to the copy button
exportCopyButton.addEventListener("click", () => {
    // Copy the contents of the code box to the user's clipboard
    const codeBoxContents = exportCodeBox.querySelector("code").textContent;
    navigator.clipboard.writeText(codeBoxContents);
    // hide the export data overlay
    exportDataOverlay.style.display = "none";
    // send a notification that data was copied to clipboard
    alert("Press 'OK' to copy data to clipboard.\nHave a nice day :)");
});

// Add event listener to import data menu item
document.getElementById("import-button").addEventListener("click", function () {
    // Show the import data overlay
    importDataOverlay.style.display = "block";
});

// Add event listener to import data button
importDataButton.addEventListener("click", function () {
    // Get the text area
    const importDataTextarea = document.getElementById("import-data-textarea");

    // Parse the JSON data
    try {
        const jsonData = JSON.parse(importDataTextarea.value);
        console.log("Parsed JSON Data...");
        // Append the data to the property list
        for (const element of jsonData) {
            
            let property = {
                address: element.address,
                lat: element.lat,
                long: element.long,
                date_acquired: element.date_acquired,
                usage: element.usage,
                num_units: element.num_units,
                price: element.price,
                currency: element.currency
            };

            propertyList.push(property);
        }
    } catch (e) {
        console.error(e);
    }

    // Reload the map
    loadMapScenario();

    // Hide the overlay
    importDataOverlay.style.display = "none";
});

// if reset api key button is clicked, then remove apikey from storage, and refresh the page
document.getElementById("reset-api-key").addEventListener("click", function () {
    localStorage.removeItem("apiKey");
    location.reload();
});