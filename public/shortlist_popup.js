//https://www.instagram.com/explore/locations/236420891


//Constructor for Home object
function Home(){
    this.postal = null;
    this.city = null;
    this.lat = null;
    this.lng = null;
}

//Constructor for the Restaurant object
function Restaurant(){
    //GOOGLE
    this.googleID = null;
    this.name = null;
    this.address = null;
    this.lat = null;
    this.lng = null; 
    this.distance = null;
    this.rating = null;
    this.openNow = null;
    this.openingHours = null;
    //INSTAGRAM
    this.instaID = null;
    //FACEBOOK
    this.facebookID = null;
    this.website = null;
    this.about = null;
    this.description = null;
}


//=========================
//BASIC FUNCTIONS
//=========================

//Go to URL and parse the restaurant's name, return it. 
function parseInputtedName(){
    var uncleanName = window.location.href.split('?')[1];
    uncleanName = uncleanName.split("&")[0];
    uncleanName = uncleanName.split("=")[1];
    var parameterReg = /\+/gi; //replace all + with blank space
    return uncleanName.replace(parameterReg, " ");
}

//Go to URL and parse postal code, if nothing is there, use most recent postal code 
function parseInputtedPostal(){
    var unclean = window.location.href.split("?")[1];
    unclean = unclean.split("&")[1];
    unclean = unclean.split("=")[1];
    //Check if postal code was entered
    if(unclean !== ""){
        //Postal Code entered, clean it up, save and return
        var parameterReg = /\+/gi; //replace all + with blank space
        var postalCode = unclean.replace(parameterReg, " ");
        sessionStorage.setItem("shortlist-postal", postalCode);
        return postalCode;
    }else if(sessionStorage.postalCode && sessionStorage.getItem("shortlist-postal") !== undefined){
        //Postal code not found, but recently entered is found
        return sessionStorage.getItem("shortlist-postal");
    }else{
        //Nothing found, send back to index
        window.alert("Please enter a postal code.");
        window.location.href = "index.html";
    }
    
}

//Print the restaurant name on the HTML code 
function printRestaurantName(restaurant){
    let pageTitle = document.getElementById("restaurantName");
    pageTitle.innerHTML = restaurant.name;
}

//HTTP Get Request Ffunction
function getAPIData(url){

    //Promise for jsonData to be returned after async process
    return new Promise(function(resolve, reject){
        var request = new XMLHttpRequest();
        //url = "https://jsonplaceholder.typicode.com/posts/42"; //testing code
        var jsonData;
    
        request.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                //console.log(request.responseText);
                jsonData = JSON.parse(request.responseText);
                resolve(jsonData);
                //resolve(restaurantObject); //temporary until API works

            }
        };
        
        request.open("GET", url, true);
        request.send();
         
    });
    
}

//Get current location in Lat and Lng
function getCurrentLocation(){
    return new Promise(function(resolve, reject){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                resolve(position);
            });
        }else{
            window.alert("Geolocation is not supported by this browser.");
        }
    });
   
}


//=========================
//GOOGLE MAPS ||            API KEY: AIzaSyA8GJ9n0WqR2SXcDQUqxDBHIwbJ1bPA6YA
//=========================

//Intial Map to be Shown
function initMap(){
    var options = {
        zoom:16,
    };
    var map = new google.maps.Map(document.getElementById('map'), options);
}

//Show Map After Processing
function showMap(restaurant, home){ //pass a restaurant as parameter, use restaurant properties to create map
    //Configure map appearance on startup

    //Set coordinates of the intial map centre, restuarant and home. 
    var centerLatLng = new google.maps.LatLng( (restaurant.lat+home.lat)/2, (restaurant.lng+home.lng)/2 );
    var restaurantLatLng = new google.maps.LatLng(restaurant.lat, restaurant.lng);
    var homeLatLng = new google.maps.LatLng(home.lat, home.lng);

    var options = { 
        zoom:16,
        center:centerLatLng
    };
    //Map variable
    var map = new google.maps.Map(document.getElementById('map'), options),
    //Instantiate directions API
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer({
        map: map
    }); 

    //Show route from home to restaurant and set distance in restaurant object
    showRoute(directionsService, directionsDisplay, homeLatLng, restaurantLatLng, function(distance){
        restaurant.distance = distance;
    });
    


    //Route function
    function showRoute(directionsService, directionsDisplay, pointA, pointB, callback){
        directionsService.route({
            origin: pointA,
            destination: pointB,
            travelMode: google.maps.TravelMode.WALKING
        }, function(response, status){
            if(status == google.maps.DirectionsStatus.OK){
                directionsDisplay.setDirections(response);
            }else{
                window.alert("Direcitons failed: "+ status);
            }
        });
        
        
    }
    
    //Add restaurant marker
    // var restaurantMarker = new google.maps.Marker({
    //     position:restaurantLatLng,
    //     map:map
    // });

    // //Add info window, open On Click
    // var infoWindow = new google.maps.InfoWindow({
    //     content: '<h3>Test</h3>' //Replace this data acquired from Places API 
    // });
    // restaurantMarker.addListener('click', function(){
    //     infoWindow.open(map, restaurantMarker);
    // });

    //Add home marker
    // var homeMarker = new google.maps.Marker({
    //     position:homeLatLng,
    //     map:map
    // });
    

}

//Get Distance from point A and B async and send to callback
function calculateDistance(pointA, pointB, callback){
    var directionsService = new google.maps.DirectionsService();
    directionsService.route({
        origin: pointA,
        destination: pointB,
        travelMode: google.maps.TravelMode.WALKING
    }, function(response, status){
        if(status == google.maps.DirectionsStatus.OK){
            directionsDisplay.setDirections(response);
            callback(Math.round(directionsDisplay.getDirections().routes[directionsDisplay.getRouteIndex()].legs[0].distance.value));
        }else{
            window.alert("Directions failed: "+status);
        }
    });
}

function calculateDistancePromise(pointA, pointB){
    return new Promise(function(resolve,reject){
        var directionsService = new google.maps.DirectionsService();
        directionsService.route({
            origin: {pointA},
            destination: pointB,
            travelMode: google.maps.TravelMode.WALKING
        }, function(response, status){
            if(status == google.maps.DirectionsStatus.OK){
                directionsDisplay.setDirections(response);
                resolve(Math.round(directionsDisplay.getDirections().routes[directionsDisplay.getRouteIndex()].legs[0].distance.value));
            }else{
                window.alert("Directions failed");   
            }
        });
    });
}

//========================
//GOOGLE PLACES ||          API KEY: AIzaSyA8GJ9n0WqR2SXcDQUqxDBHIwbJ1bPA6YA
//========================

var key = "AIzaSyA8GJ9n0WqR2SXcDQUqxDBHIwbJ1bPA6YA";

//Return a URL for Google Places Place Search 
function googlePlacesURL(restaurant, home){
    var restaurantName = restaurant.name;
    var formattedName = restaurantName.replace(" ", "+");
    var address = formattedName+"+in+"+home.city;
    var url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?";
    url += "input="+address;
    url += "&inputtype=textquery";
    url += "&fields=formatted_address,name,rating,opening_hours,geometry";
    url += "&key="+key;
    //document.write(url);
    return url;
}
//Returns a URL for Google Places Text Search 
function googleTextSearchURL(restaurant, home){
    var restaurantName = restaurant.name;
    var formattedName = restaurantName.replace(" ", "+");
    var address = formattedName+"+near+"+(home.postal).substring(0,3)+"+in+"+home.city;
    var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?";
    url += "query="+address;
    url += "&key="+key;
    console.log(url);
    return url;
}

//Returns a URL for Google Places Details. Warning: This requires Place ID that must be acquired through Text Search first
function googleDetailsURL(restaurant){
    var url = "https://maps.googleapis.com/maps/api/place/details/json?";
    url += "placeid="+restaurant.googleID;
    url += "&key="+key;
    return url;
}

//Returns a URL for Google Geocoder API
function googleGeocoderURL(obj){
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+obj.lat+"+"+obj.lng;
    return url;
}

//Parse postal code from returned geocoder object after searching by lat/lng
function parsePostalCode(geocoderObj){  
    //the last element in address_components will always be the postal code
    var lastIndex = geocoderObj[0].address_components.length-1;
    return geocoderObj[0].address_components[lastIndex].long_name;
}




//============================
//FACEBOOK API
//============================

//Get Facebook API Token


//Returns URL for Facebook Places Search HTTP Request
function fbPlaceSearchURL(restaurant){
    var distance = 500;
    var url = "https://graph.facebook.com/search?type=place&fields=about,description,website&q="+restaurant.name+"&center="+restaurant.lat+","+restaurant.lng+"&distance="+distance;
    return url;
}



//=========================
//INSTAGRAM API
//=========================

//Returns Instagram Token from Local Storage or default token if not found
function getInstaToken(){
    console.log(this.sessionStorage.getItem("instaToken"));
    return this.sessionStorage.getItem("instaToken");
}

//Returns URL for Instagram Location Search Endpoint 
function instaLocSearchURL(restaurant){
    var token = getInstaToken();
    var distance = 100;
    var url = "https://api.instagram.com/v1/locations/search?lat="+restaurant.lat+"&lng="+restaurant.lng+"&distance="+distance+"&access_token="+token;

    //!!Once working, this should be updated to use Facebook Places ID instead Lat/Lng
    //var url = "https://api.instagram.com/v1/locations/search?facebook_places_id="+restaurant.facebookID+"&distance="+distance+"&access_token="+token; 
    
    console.log(url);
    return url;   
}

//Returns URL for Instagram Location Recent Media Endpoint
function instaMediaURL(restaurant){
    var token = getInstaToken();
    //https://api.instagram.com/v1/locations/{location-id}/media/recent?access_token=ACCESS-TOKEN
    var url = "https://api.instagram.com/v1/locations/"+restaurant.instaID+"/media/recent?access_token="+token;
    return url;
}

function exploreURL(restaurant){
    var url = "https://www.instagram.com/explore/locations/"+restaurant.instaID;
    return url;
}

//Find closest match for location from a returned Location Search Endpoint JSON compared to LatLng returned from google
function findMatchingEntry(obj, restaurant){
    var reference = restaurant.name;
    
    var mostSimilar = 0; //Keep track of highest found Levensthein similarity
    var similarIndex; //Keep track of which index the most similar name is found at

    //Iterate through every location in the instagram object, return the entry that is the closest match
    for(var index = 0; index < obj["data"].length; index++){
        var entryName = obj["data"][index]["name"];
        var similarity = calcSim(reference, entryName);
        if(similarity > mostSimilar){
            mostSimilar = similarity;
            similarIndex = index;
        }
        //Check if we just found an almost perfect match and we can end the search early
        if(similarity >= 0.9){
            break;
        }
    }
    console.log(obj["data"][similarIndex]);
    return obj["data"][similarIndex];

}

//Levenshtein Distance Algorithms 
function calcSim(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
    return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}
function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
        costs[j] = j;
        else {
        if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
        }
        }
    }
    if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}




//Create Instagram IFrame
function generateInstaFrame(divID, src){
    var iframe = document.createElement("iframe");
    iframe.setAttribute("src", src);
    iframe.setAttribute("id", "instaFrame");

    div = document.getElementById(divID);
    div.appendChild(iframe);
    document.getElementById("instaFrame").scrollTo(1000,1000);
}

//GETTER FUNCTIONS for Instagram Places Search Endpoint Object Entry
//Location ID
function parseInstaID(matchingEntry){
    return matchingEntry["id"];
}


//=============================================================================
//CLIENT SIDE COMPATIBLE GAPI functions AIzaSyDslra1_8bA4Yx6ay2o3hGN_W_Klu1Y-n8 	
//=============================================================================

//Text Search with a restaurant name and home location
function gapiTextSearch(restaurant, home){
    return new Promise(function(resolve, reject){
        //Initialize service
        var map = new google.maps.Map(document.getElementById("map"));
        var service = new google.maps.places.PlacesService(map);
        //Set search query
        var location = new google.maps.LatLng(home.lat, home.lng);
        var request = {
            query: restaurant.name,
            location: location
        };
        //Make search and resolve the result
        service.textSearch(request, function(result, status){
            console.log(request.query);
            if(status === google.maps.places.PlacesServiceStatus.OK){
                resolve(result);
            }else{
                //Reject
            }
        });
    });
}

//Geocode with a place lat/lng
function gapiGeocode(place){
    return new Promise(function(resolve, reject){
        //Initialize Service    
        var service = new google.maps.Geocoder();
        //Set geocoding parameters
        var request = {
            location: {lat:place.lat, lng:place.lng}
        };
        //Geocode and resolve the result
        service.geocode(request, function(result, status){
            console.log("location: "+JSON.stringify(request.location));
            if(status == "OK"){
                resolve(result);
            }else{
                //Reject
            }
        });
    });
}

//Google Details Search with place ID
function gapiDetails(restaurant){
    return new Promise(function(resolve, reject){
        //Initialize Service
        var map = new google.maps.Map(document.getElementById("map"));
        var service = new google.maps.places.PlacesService(map);
        //Set search query
        var request = {
            placeId: restaurant.googleID
        };
        //Search and resolve result
        service.getDetails(request, function(result, status){
            if(status == google.maps.places.PlacesServiceStatus.OK){
                resolve(result);
            }
        });
    });
}

//PARSERS:
//(1) after gapiTextSearch resolves
//Name
function parseRestaurantName(googleObject){
    return googleObject[0]["name"];
}
//Address
function parseRestaurantAddress(googleObject){
    return googleObject[0]["formatted_address"];
}
//Latitude
function parseRestaurantLat(googleObject){
    return googleObject[0]["geometry"]["location"].lat();
}
//Longitude
function parseRestaurantLng(googleObject){
    return googleObject[0]["geometry"]["location"].lng();
}
//Rating
function parseRestaurantRating(googleObject){
    return googleObject[0]["rating"];
}
//Places ID
function parseGoogleID(googleObject){
    return googleObject[0]["place_id"];
}


//(2) after gapiDetails resolves
//Restaurant Hours
function parseRestaurantHours(googleObject){
    return googleObject["opening_hours"]["weekday_text"];
}

//Restaurant Info
function printRestaurantInfo (restaurant, divID){
    var div = document.getElementById(divID);
    var walkingpersec = 1.4;
    var drivingpersec = 16.67;
    div.innerHTML += "Distance: "+Math.round(restaurant.distance/100)/10+" km "+"("+Math.ceil(restaurant.distance/walkingpersec/60)+" minute walk, "+Math.ceil(restaurant.distance/drivingpersec/60)+" mintute drive) <br>";
    div.innerHTML += "Rating: "+restaurant.rating+"<br>";
    div.innerHTML += "Address: "+restaurant.address+"<br>";

    if(restaurant.openNow){
        div.innerHTML += restaurant.name+" is open now. <br>";
    }else{
        div.innerHTML += restaurant.name+" is closed now.<br>";
    }

    //Match system day integer with corresponding index given by google
    var d = new Date();
    var day = d.getDay() - 1;
    if(day == -1){
        day = 7;
    }

    div.innerHTML += "Opening Hours for "+restaurant.openingHours[day]+"<br>";

}

//Open Now Boolean
function parseOpenNow(googleObject){
    return googleObject["opening_hours"]["open_now"];
}


//==============
//ERROR HANDLING
//==============
function disableApiDivs(message){
    //Disable all display divs
    var mapDiv = document.getElementById("map-container");
    var instaDiv = document.getElementById("instaImages");
    mapDiv.style.opacity = "0";
    instaDiv.style.opacity = "0";
        
    //Show error in the top API container
    var apiContainer = document.getElementById("api-container");
    apiContainer.innerHTML = message;
    apiContainer.style.fontSize = "20";
}



//==========================================================
//MAIN METHOD
//==========================================================

window.onload = function(){
    //Initialize Restaurant and Home Objects
    var restaurant = new Restaurant();
    var home = new Home();

    //Set home (Temporary Hardcode)
    home.lat = 43.6534;
    home.lng = -79.384293;
    home.city = "Toronto";
    home.postal = "L4C 8P5";

    //Get initially inputted restaurant name
    try{
        restaurant.name = parseInputtedName();
        if(restaurant.name === ""){
            throw e;
        }
    }catch(e){
        disableApiDivs("Enter a restaurant above.");
    }

    gapiGeocode(home).then(function(resolved){
        console.log("Geocode:");
        console.log(resolved);
    });

    gapiTextSearch(restaurant, home).then(function(resolved){
        console.log("Text: ");
        console.log(resolved);
    });


    //Promise: Get Home Lat Lng with built-in HTML geocoder. CHAIN COUNT: 6
    getCurrentLocation().then(function(position){
        console.log(position);
        //Set Home LatLng
        home.lat = position.coords.latitude;
        home.lng = position.coords.longitude;
        //Return Promise: Get Home Postal Code Using Google Maps API Geocoder
        return gapiGeocode(home);
    }).then(function(geocoderObj){
        //Set Home Postal Code
        home.postal = parsePostalCode(geocoderObj);
        console.log(home.postal);
        //Promise: HTTP REquest to Google Places Text Search
        return gapiTextSearch(restaurant, home);
    }).then(function(searchObj){
        console.log("yus");
        //Set values of Restaurant Object with resolved 
        restaurant.address = parseRestaurantAddress(searchObj);
        restaurant.lat = parseRestaurantLat(searchObj);
        restaurant.lng = parseRestaurantLng(searchObj);
        restaurant.rating = parseRestaurantRating(searchObj);
        restaurant.googleID = parseGoogleID(searchObj);
        //restaurant.openNow = parseOpenNow(searchObj);
        restaurant.name = parseRestaurantName(searchObj);
        printRestaurantName(restaurant);
        //Return Promise #2: HTTP Request to Google Places Detail
        return gapiDetails(restaurant);
    }).then(function(detailsObj){
        //Set more values of Restaurant Object with detailsObj
        console.log(detailsObj);
        restaurant.openNow = parseOpenNow(detailsObj);
        restaurant.openingHours = parseRestaurantHours(detailsObj);
        
        console.log(home);
        console.log(restaurant);
        //Use data from restaurant and home objects to draw the map
        showMap(restaurant, home);
        
        //Return Promise #3: Directions Service
        return new Promise(function(resolve, reject){
            calculateDistance(new google.maps.LatLng(home.lat, home.lng), new google.maps.LatLng(restaurant.lat, restaurant.lng), function(dist){
                resolve(dist);
            });
        });
    }).then(function(dist){
        //Set distance value with returned dist
        restaurant.distance = dist;
        
        //Return Promise #4: AJAX Req to Instagram Location Search Endpoint
        return new Promise(function(resolve, reject){
            $.ajax({
                url: instaLocSearchURL(restaurant),
                type: "GET",
                crossDomain: true,
                dataType: "jsonp",
                success: function(locSearchObj){
                    resolve(locSearchObj);
                }
            });
        });
    }).then(function(locSearchObj){
        //Set Instagram ID with resolved locSearchObj
        console.log(locSearchObj);

        //If the user is not authenticated on instagram, display error and guide to authentication
        try{
            restaurant.instaID = parseInstaID(findMatchingEntry(locSearchObj, restaurant));
        }catch(instaAuthErr){
            disableApiDivs("Please <a href = ./index.html>log-in</a> to instagram");
        }

        //Create Instagram IFrame, if the user doesn't have 
        generateInstaFrame("instaImages", exploreURL(restaurant));
        //Print restaurant info using restaurant object in restaurant-info div below Instagram and Maps.
        printRestaurantInfo(restaurant, "restaurant-info");
    });

};
