mapboxgl.accessToken = mapBoxToken;

// This code is taken from examples provided  mapbox documentation  Link --: https://docs.mapbox.com/mapbox-gl-js/example/cluster/
// In this example earthquakes database was used to show on map
// That database had a features key in which whole data was included So to overcome that we included data like that only check index.js file
// Further in earthquakes database in features database was stored in two keys 
// 1. geometry :"geometry": { "type": "Point", "coordinates": [ -151.5129, 63.1016, 0.0 ] } 
// -- This is same as we have defined in our data base so theres no problem
// 2. properties : "properties": { "id": "ak16994521", "mag": 2.3, "time": 1507425650893, "felt": null, "tsunami": 0 }
// Here in this all data which we need when we click on single data is stored
// So we dont have any property field in our database. We can change how to access data which we want to show on click 
// But just to make it easy we will define a virtual property of campground named as properties 

const map = new mapboxgl.Map({
        
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [77.4126,23.2599],
    zoom: 4
});

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');

map.on('load', () => {
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('campgrounds', {
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({     // This is to set properties of cluster circles 
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [   // In this color is set to change according to point_count(How many campgrounds in that cluster)
                'step',
                ['get', 'point_count'],
                '#51bbd6',      // This is for below 5
                5,
                '#f1f075',      // between 5-10
                10,
                '#f28cb1'       // After 10
            ],
            'circle-radius': [  // In this radius of circle is set to change according to point_count
                'step',
                ['get', 'point_count'],
                12,         // This is size below 5
                5,
                16,         // This is size between 5-10
                10,
                20          // This is size after 10
            ]
        }
    });

    map.addLayer({       // This is to set properties of text in that cluster circles. text here is just number of campgrounds in that cluster 
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({      // this is to set properties of unclustered point which refers to a single campground
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {                        // These all are properties of circle which represents unclustered point or a single campground
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {        // This is an eventListner for click on a clustered circle
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.

    map.on('click', 'unclustered-point', (e) => {   // this is an eventListener for click on a unclustered point
        // On clicking unclustered point we are getting some info which was defined under property key of earthquakes database
        // Earthquake Database Link-- https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson
        const coordinates = e.features[0].geometry.coordinates.slice();
        const {popUpHtml}=e.features[0].properties
        // const mag = e.features[0].properties.mag;
        // const tsunami =
        //     e.features[0].properties.tsunami === 1 ? 'yes' : 'no';

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
                popUpHtml
            )
            .addTo(map);
    });

    map.on('mouseenter', 'clusters', () => {        
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
         map.getCanvas().style.cursor = '';
    });
});
