$('#renter-text').addClass('purple-text');

function initMap() {
    // Initialization of map at Chicago
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: 41.878669, lng: -87.632294 }
    });
    var infoWindow = new google.maps.InfoWindow({ map: map });




    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('<div class=text-google>Current Location</div>');
            map.setCenter(pos);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    }

    // var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

    $.get('/api/locations', function(data) {
        // Create all markers for rentals
        var allMarkers = data;
        var infowindow = new google.maps.InfoWindow();
        var marker, i;

        for (i = 0; i < allMarkers.length; i++) {
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(allMarkers[i].latitude, allMarkers[i].longitude),
                map: map,
                icon: 'img/gapps_parking.png'
            });

            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    var content = "<div class=text-google>Address: " + allMarkers[i].address + "<br>" +
                        "City: " + allMarkers[i].city + "<br>" +
                        "Rate: $" + allMarkers[i].price + "/hr<br>" +
                        "<button class=property data-id=" + allMarkers[i].id + ">Click for availability</button></div>";

                    infowindow.setContent(content);
                    infowindow.open(map, marker);
                };
            })(marker, i));
        }
    });
}



$(document.body).on('click', '.property', function() {
    var route = "/renter/property/" + $(this).attr("data-id");
    $.get(route, function() {

    });
});
