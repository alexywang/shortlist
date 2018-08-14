function getURL(){
    return "https://maps.googleapis.com/maps/api/geocode/json?latlng=43.8478925+-79.48156089999999";
}

function postRequest(url){
    return new Promise(function(resolve, reject){
        var xhr = new XMLHttpRequest();
        var jsonData;
        var endpoint = "https://us-central1-shortlist-1531330061369.cloudfunctions.net/httpRequest";
        
        xhr.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                jsonData = JSON.parse(xhr.responseText);
                resolve(jsonData);
            }
        }

        xhr.open("POST", endpoint, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({
            url: url    
        }));

    });        
}

function gapiTextSearch(restaurant){
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:5,lng:5},
        zoom: 15
    });
    var request = {
        query: restaurant.name + " in Toronto"
    }

    return new Promise(function (resolve, reject){
        console.log("hello");
        var service = new google.maps.places.PlacesService(map);
        service.textSearch(request, function(result, status){
            console.log("hello");
            if(status == google.maps.places.PlacesService.OK){
                console.log(result);
                resolve(result);
            }
        });
        
    });
}


window.onload = function(){
    var restaurant = {
        name: "Saving Grace"
    }

    gapiTextSearch(restaurant).then(function(resolved){
        console.log("hello");
        console.log(resolved);
    });

}