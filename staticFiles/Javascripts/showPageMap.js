// This file is to set properties of map which we displaying on our Show Campground Page

// Check This link for basic QuickStart for mapBox api --> https://docs.mapbox.com/mapbox-gl-js/guides/install/#quickstart
mapboxgl.accessToken = mapBoxToken;
// Creating a New Map
const map = new mapboxgl.Map({
    container: 'map', // container ID (Tag in Which we want to display map should having an ID with this same name)
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');

// Create a new marker.
const marker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({offset:25}).setHTML(`<h6>${campground.title}</h6><p>${campground.location}</p>`)) // add popup to marker
    .addTo(map);

