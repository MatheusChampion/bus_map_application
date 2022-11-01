(function(){

     //create map in leaflet and tie it to the div called 'theMap'
     

     var map = L.map('theMap').setView([44.650627, -63.597140], 14);
     
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
         
    // Creating variable to store data in the future
    let marker = {};


    //calling function 
    fetchingBus();
    fetchingWeather();

    //Button open/close
    //Reference https://www.youtube.com/watch?v=MBaw_6cPmAw
    const openButton = document.querySelectorAll('[data-open-target]')
    const closeButton = document.querySelectorAll('[data-close-button]')
    const overlay = document.getElementById('overlay')

    openButton.forEach(button => {
        button.addEventListener('click', () => {
            const info = document.querySelector(button.dataset.openTarget)
            openInfo(info)
        })
    })

    overlay.addEventListener('click', () => {
        const info = document.querySelectorAll('.info.active')
        info.forEach(info => {
            closeInfo(info)
        })
    })

    closeButton.forEach(button => {
        button.addEventListener('click', () => {
            const info = button.closest('.info')
            closeInfo(info)
        })
    })

    function openInfo(info){
        if (info == null) return 
        info.classList.add('active')
        overlay.classList.add('active')
    }
    
    function closeInfo(info){
        if (info == null) return 
        info.classList.remove('active')
        overlay.classList.remove('active')
    }


    //Function to fetch weather 
    function fetchingWeather(){
        //Fetching
        fetch(`http://api.weatherapi.com/v1/current.json?key=4379da7527a646c994d02851221104&q=Halifax&aqi=no`)
        .then(response => response.json())
        .then(json => {
            console.log(json)
            generateWeather(json);
        })

        setTimeout(fetchingWeather, 300000);
    }

    //Function for Weather
    function generateWeather(data){
        const theDiv = document.querySelector('#weather')
        //Create button 
        let weatherButton = document.getElementById("theButtonImg")
        weatherButton.src = data.current.condition.icon;
        let weatherText = document.getElementById("weatherTxt")
        weatherText.innerText = data.current.condition.text
        
        //Infor displayed
        document.getElementById("city").innerText = data.location.name;
        document.getElementById('temp').innerText = data.current.temp_c;
        document.getElementById('status-img').src = data.current.condition.icon;
        document.getElementById('status-weather').innerText = data.current.condition.text;
        document.getElementById('wind').innerText = data.current.wind_kph;
        document.getElementById('wind-direction').innerText = data.current.wind_dir;
        document.getElementById('feelslike').innerText = data.current.feelslike_c;

        }

    //Funtion to fetch and retrive data
    function fetchingBus() {
         //Fetching from API
        fetch(`https://hrmbusapi.herokuapp.com`)
        .then(response => response.json())
        .then(json => {
            
            // Transforme in GeoJSON format data
            let buses = json.entity
            .map(json => {
                return {
                    "type": "Feature",
                    "properties": {
                        "vehicleId": json.id,
                        "route" : json.vehicle.trip.routeId,
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates" : [json.vehicle.position.longitude, json.vehicle.position.latitude]
                    }
                }
            })
            
            //Make a collection Features with the data
            let featureCollectionBus = {
                "type": "FeatureCollection",
                "features": buses
            }
            
            // Custom Icon
            let busIcon = L.icon({
                iconUrl: "images/bus-1.png",
                iconSize: [35,32]
            });

            //Bring the data for geoJSON format in Leafletjs
            L.geoJSON(featureCollectionBus, {
                // Pointing the buses location
                pointToLayer: (feature, coordinates) => {


                    // retrieving the unique bus number and saving as id
                    let id = feature.properties.vehicleId;


                    //reference https://stackoverflow.com/questions/48900378/how-to-update-leaflet-markers-for-every-5-seconds

                    //verifying if the bus already exist on the map
                    if (marker[id]) {
                        // update location and route according to new data retrive if the bus already exist
                        marker[id].setLatLng(coordinates).setPopupContent(`Bus: ${feature.properties.vehicleId} on route ${feature.properties.route}.`)
                        return marker[id];
                    } else {
                        //If the bus does not exist, create it and pin it location on the map
                        marker[id] = L.marker(coordinates, {icon: busIcon})
                        .bindPopup(`Bus: ${feature.properties.vehicleId} on route ${feature.properties.route}.`);
                        return marker[id];
                    }   
                }
            }).addTo(map)
        })

        //creating a self-invvoking function that will call itself every 7 seconds after successfull retrieving of the data
        setTimeout(fetchingBus, 7000);
        
    }

    

})()
