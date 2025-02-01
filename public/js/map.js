// Reverse Coordinates (Ensure GeoJSON [lon, lat] becomes Leaflet [lat, lon])
let reverseCoordinates = [coordinates[1], coordinates[0]];

// Initialize the map
var map = L.map('map').setView(reverseCoordinates, 13); // Starting position [lat, lon]

// Add OpenStreetMap tiles (No token needed)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

console.log("Reversed Coordinates:", reverseCoordinates);
console.log(address);

// Add a marker
var marker = L.marker(reverseCoordinates).addTo(map);
marker.bindPopup(`<h3>${address}</h3><p>Exact location provided after booking</p>`).openPopup();


var circle = L.circle(reverseCoordinates, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 600
}).addTo(map);


