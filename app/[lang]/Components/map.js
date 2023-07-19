'use client'
// Nextjs
import Image from 'next/image';
// React
import React, { useRef, useEffect, useState } from 'react';
// Mapbox
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxLanguage from '@mapbox/mapbox-gl-language';

mapboxgl.accessToken = 'pk.eyJ1IjoiZGV2amRlZWQiLCJhIjoiY2xpczBneWh6MTIydDNlazlmNmJ3M2twMiJ9.JXeq6EXsQdcleRgNzB76Lw';

// Helper Libraries 
import ReactDOMServer from 'react-dom/server';
import moment from 'moment/moment';
import { Timestamp } from 'firebase/firestore';
import { createRoot } from 'react-dom/client';
import { useAuth } from '../utils/Authenticator';


const Map = ({ Listings, lng, lat, setLat, setLng }) => {

    const user = useAuth();

    const mapContainer = useRef(null);
    const map = useRef(null);
    // const [lng, setLng] = useState(35.90719);
    // const [lat, setLat] = useState(31.97182);
    const [zoom, setZoom] = useState(11.5);
    const [mapIsLoaded, setMapIsLoaded] = useState(false);

    // Cluster Colors
    // '#07364B', // HOVER color
    // '#0097A7' // Normal color
    // '#102C3A' // HOVER HOVER color
    // Text
    // #263238 Header
    // Divider
    // #E3EFF1 

    console.log('appClient state responce (map):', Listings)

    let approvedListings = [...Listings.features].filter((feature) => feature.properties.status == 'approved').map((listing) => listing);
    let finalListings = {...Listings}

    finalListings.features = approvedListings;

    console.log(finalListings)

    // Used for intitializing map 
    useEffect(() => {
        if (map.current) return; // initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom: zoom,
            hash: true,
            // cooperativeGestures: true

            // bounds:[]
        });

        const language = new MapboxLanguage({
            defaultLanguage: 'en'
        });
        mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js');

        map.current.addControl(language);
        // Zoom Button
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            // Add a new source from our GeoJSON data and
            // set the 'cluster' option to true. GL-JS will
            // add the point_count property to your source data.
            map.current.addSource('listings', {
                type: 'geojson',
                data: finalListings,
                cluster: true,
                clusterMaxZoom: 14, // Max zoom to cluster points on
                clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
            });
            setMapIsLoaded(true)

            // Function to get coordinates on move
            function getCoordinates() {
                var center = map.current.getCenter();
                var latitude = center.lat;
                var longitude = center.lng;
                setLat(latitude);
                setLng(longitude);
            }
            map.current.on('move', getCoordinates);


            // gets locations
            // map.current.on('move', (e) => {
            //     console.log('A move event occurred.', e);
            //     var latitude = e.lngLat.lat;
            //     var longitude = e.lngLat.lng;
            //     setLat(latitude);
            //     setLng(longitude);
            // });

            // Setting up Clusters - Color scale styling based on size of Cluseters
            map.current.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'listings',
                filter: ['has', 'point_count'],
                paint: {
                    // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                    // with three steps to implement three types of circles:
                    //   * Blue, 20px circles when point count is less than 100
                    //   * Yellow, 30px circles when point count is between 100 and 750
                    //   * Pink, 40px circles when point count is greater than or equal to 750
                    // [
                    //   'step',
                    //   ['get', 'point_count'],
                    //   '#51bbd6',
                    //   100,
                    //   '#f1f075',
                    //   750,
                    //   '#f28cb1'
                    // ],
                    'circle-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#07364B', // Replace with the desired hover halo color
                        '#0097A7' // Replace with the default halo color
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20,
                        100,
                        30,
                        750,
                        40
                    ]
                }
            });
            // Adds hover effect on Cluster
            let clusterState = null;
            map.current.on('mouseenter', 'clusters', function (e) {
                console.log(e)
                clusterState = e.features[0].properties.cluster_id;
                map.current.getCanvas().style.cursor = 'pointer';
                map.current.setFeatureState(
                    { source: 'listings', id: clusterState },
                    { hover: true }
                );
            });
            // Removes hover effect on Cluster 
            map.current.on('mouseleave', 'clusters', function () {
                map.current.getCanvas().style.cursor = '';
                map.current.setFeatureState(
                    { source: 'listings', id: clusterState },
                    { hover: false }
                );
                clusterState = null
            });
            // Add Cluster Count to Clusters Circles 
            map.current.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'listings',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': ['get', 'point_count_abbreviated'],
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12,
                },
                paint: {
                    'text-color': 'white'
                }
            });
            // Unclustrered; Single Listing Styling
            map.current.addLayer({
                id: 'unclustered-point',
                type: 'symbol',
                source: 'listings',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'text-color': 'white'
                },
                layout: {
                    'text-field': ['get', 'price'],
                    // 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 25,
                    'text-offset': [0, 0.6], // Adjust the offset as needed
                    'text-anchor': 'bottom',
                    // 'text-line-height':'5',
                    'text-allow-overlap': true
                },
            });

            // objects for caching and keeping track of HTML marker objects (for performance)
            const markers = {};
            let markersOnScreen = {};


            function updateMarkers() {

                const newMarkers = {};
                const features = map.current.querySourceFeatures('listings');
                // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
                // and add it to the map if it's not there already
                for (const feature of features) {

                    const coords = feature.geometry.coordinates;
                    const props = feature.properties;

                    if (props.cluster) continue;

                    const id = props.id;
                    let marker = markers[id];

                    if (!marker) {

                        const el = document.createElement('div');
                        const root = createRoot(el)

                        const JSXListingMarker = () => {
                            return (
                                <div className={`flex bg-[#07364B] hover:bg-[#0097A7] px-4 group z-10 border-x-[3px]`} >
                                    <p className={`text-white m-auto text-sm `} > {props.price} </p>
                                    <div className={` group-hover:border-t-[#0097A7]  border-t-[#07364B]  border-transparent w-0 h-0 absolute top-[99%] left-[50%] border-t-[9px] border-x-[8px] border-b-[0px] translate-x-[-50%]`}></div>
                                </div>
                            )
                        }

                        root.render(JSXListingMarker())

                        marker = markers[id] = new mapboxgl.Marker({
                            element: el
                        }).setLngLat(coords);
                    }

                    newMarkers[id] = marker;

                    if (!markersOnScreen[id]) marker.addTo(map.current);

                }

                // for every marker we've added previously, remove those that are no longer visible
                for (const id in markersOnScreen) {
                    if (!newMarkers[id]) markersOnScreen[id].remove();
                }

                markersOnScreen = newMarkers;

            }

            // after the GeoJSON data is loaded, update markers on the screen on every frame
            map.current.on('render', () => {
                if (!map.current.isSourceLoaded('listings')) return;
                updateMarkers();
            });


            let state = null

            // Adds hover effect to single listing
            map.current.on('mouseenter', 'unclustered-point', function (e) {
                state = e.features[0].properties.id;
                map.current.getCanvas().style.cursor = 'pointer';
                map.current.setFeatureState(
                    { source: 'listings', id: state },
                    { hover: true }
                );
            });
            // Removes hover effect on single listing 
            map.current.on('mouseleave', 'unclustered-point', function () {
                map.current.getCanvas().style.cursor = '';
                map.current.setFeatureState(
                    { source: 'listings', id: state },
                    { hover: false }
                );
                state = null
            });

            // Highlights Area
            // Adds Area Coordinates to Outline Data 
            // map.current.addSource('Amman', {
            //     'type': 'geojson',
            //     'data': {
            //         'type': 'Feature',
            //         'geometry': {
            //             'type': 'Polygon',
            //             // These coordinates outline Amman. 31.856/36.13
            //             'coordinates': [
            //                 ammanCoordinates
            //             ]
            //         }
            //     }
            // })
            // // Add a new layer to visualize the polygon.
            // map.current.addLayer({
            //     'id': 'Amman',
            //     'type': 'fill',
            //     'source': 'Amman', // reference the data source
            //     'layout': {},
            //     'paint': {
            //         'fill-color': '#A9D7DC', // #0080ff blue color fill OPTION 2 #A9D7DC Light Blue 
            //         'fill-opacity': 0.5
            //     }
            // });
            // // Add a black outline around the polygon.
            // map.current.addLayer({
            //     'id': 'outline',
            //     'type': 'line',
            //     'source': 'Amman',
            //     'layout': {},
            //     'paint': {
            //         'line-color': '#000',
            //         'line-width': 3
            //     }
            // });

            // /////////////////////////////////
            // inspect a cluster on click
            map.current.on('click', 'clusters', (e) => {
                const features = map.current.queryRenderedFeatures(e.point, {
                    layers: ['clusters']
                });
                const clusterId = features[0].properties.cluster_id;
                map.current.getSource('listings').getClusterExpansionZoom(
                    clusterId,
                    (err, zoom) => {
                        if (err) return;

                        map.current.easeTo({
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
            map.current.on('click', 'unclustered-point', (e) => {
                console.log(e.features[0])

                const rent = e.features[0].properties.rent;
                const coordinates = e.features[0].geometry.coordinates.slice();
                const price = e.features[0].properties.price;
                const area = e.features[0].properties.area;
                const numberOfBedrooms = e.features[0].properties.bedrooms;

                const numberOfBathrooms = e.features[0].properties.bathrooms;
                const parking = e.features[0].properties.parking
                const agent = e.features[0].properties.agent;
                const agentName = e.features[0].properties.agentName;


                const address = e.features[0].properties.streetName + '-' + e.features[0].properties.buildingNumber;
                const timeStamp = JSON.parse(e.features[0].properties.timeStamp);

                const timeObj = new Timestamp(timeStamp.seconds, timeStamp.nanoseconds);
                const when = moment(timeObj.toDate()).fromNow();

                const coverImage = JSON.parse(e.features[0].properties.urls)[0]


                const JSXTooltip = () => {

                    return (
                        <a className={`outline-none`} target="_blank" href={`/listing/${e.features[0].properties.id}`} rel="noopener noreferrer">

                            <div className={`w-full grid shadow-md shadow-slate-500 rounded-[10px]`}>

                                <span className={`flex p-2`}>
                                    <Image
                                        priority
                                        alt={coverImage}
                                        src={coverImage}
                                        width="0"
                                        height="0"
                                        sizes="100vw"
                                        className="w-full h-full m-2 rounded select-none max-h-[100px] max-w-[150px]"

                                    // width={220}
                                    // height={160}
                                    // className={`m-2 rounded select-none max-h-[120px] max-w-[220px] w-auto h-auto`}
                                    />
                                    <span className={`grid ml-2 self-center flex-1`}>

                                        <span className={`flex self-center `}>
                                            <p className={`text-[#263238] text-base font-[600] font-['Montserrat',sans-serif] my-auto  mr-auto`}>
                                                {price}
                                            </p>
                                            <p className={`text-[#707070] text-xs my-auto ml-auto mr-2`}>
                                                {when}
                                            </p>
                                        </span>

                                        <span className={`flex py-1 self-center `}>
                                            <p className={`text-[#707070] text-xs font-['Montserrat',sans-serif] inline`}>
                                                {address}
                                            </p>
                                        </span>

                                        <span className={`flex py-1 self-center `}>
                                            <p className={`text-[#707070] text-xs inline font-['Montserrat',sans-serif] mr-auto `}>
                                                {numberOfBedrooms}BD | {numberOfBathrooms}BA | {parking ? 1 : 0} Parking

                                            </p>
                                            <p className={`text-[#707070] text-xs inline font-[600] mr-auto ml-2`}>
                                                {area} m2
                                            </p>
                                        </span>

                                        {
                                            <span className={`flex py-1 self-center `}>
                                                <p className={`text-[#707070] text-xs inline font-['Montserrat',sans-serif] mr-auto `}>
                                                    Realtor: {agent ? agentName : 'N/A'}
                                                </p>
                                            </span>
                                        }

                                    </span>

                                </span>

                                <span className={`bg-[#F8F8F8] flex p-2 `}>

                                    <span className={`flex mx-auto`}>
                                        <p className={`text-[#0097A7] font-['Montserrat',sans-serif] `}>
                                            {address}
                                        </p>
                                        <p className={`text-[grey] font-['Montserrat',sans-serif] ml-2`}>
                                            {`1 For ${rent ? 'Rent' : 'Sale'}`}
                                        </p>
                                    </span>

                                </span>

                            </div>
                        </a>
                    )
                }

                let htmlString = ReactDOMServer.renderToString(JSXTooltip())

                // Ensure that if the map is zoomed out such that
                // multiple copies of the feature are visible, the
                // popup appears over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(
                        htmlString
                    )
                    .addTo(map.current);
            });

        });

        // Displays buildings in 3D
        map.current.on('style.load', () => {
            // Insert the layer beneath any symbol layer.
            const layers = map.current.getStyle().layers;
            const labelLayerId = layers.find(
                (layer) => layer.type === 'symbol' && layer.layout['text-field']
            ).id;

            // The 'building' layer in the Mapbox Streets
            // vector tileset contains building height data
            // from OpenStreetMap.
            map.current.addLayer(
                {
                    'id': 'add-3d-buildings',
                    'source': 'composite',
                    'source-layer': 'building',
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 15,
                    'paint': {
                        'fill-extrusion-color': '#aaa',

                        // Use an 'interpolate' expression to
                        // add a smooth transition effect to
                        // the buildings as the user zooms in.
                        'fill-extrusion-height': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            15.05,
                            ['get', 'height']
                        ],
                        'fill-extrusion-base': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            15.05,
                            ['get', 'min_height']
                        ],
                        'fill-extrusion-opacity': 0.6
                    }
                },
                labelLayerId
            );
        });

        // Clean up on unmount
        return () => map.current.remove();

    }, []);

    // Used for Updating map
    useEffect(() => {
        if (!mapIsLoaded) {
            console.log('NO MAP INSTINTIATED')
            return;
        }
        console.log('Updating map with new data')
        if (map.current.isSourceLoaded('listings')) {
            map.current.getSource("listings").setData(finalListings);
        }
    }, [Listings, mapIsLoaded])

    return (
        <div ref={mapContainer} className={`map-container row-start-2 row-end-3 col-start-1 col-end-8 min-h-[85vh]`} />
    )
}

export default Map;
