/* Initializing The Map */
var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
     center: {lat: 51.506713, lng:  -0.129587},
     zoom: 12
    });
}
$(document).ready(function(){
  initMap();
});

/* Define Markers Array That Holds All The Markers */
var markers = [];

// Define Location Class and its methods.
var Location = function(lat, lng, locationName) {
    this.lat = lat;
    this.lng = lng;
    this.locationName = locationName;
}
/* Marker Drop Method: Usefull to make 
all markers drop down when the user opens the page */
Location.prototype.dropMarker = function () {
    var self = this;
    var marker = new google.maps.Marker({
        position: {
          lat: this.lat,  
          lng:  this.lng  
        }, 
        animation: google.maps.Animation.DROP
    });
    markers.push(marker);
    marker.setMap(map);
    marker.addListener('click', function() {
        self.bounceMarker();
    });
};
/* - Boncing the location's marker when it gets clicked.
   - Showing InfoBox.
*/
Location.prototype.bounceMarker = function () {
    for(i=0; i<markers.length; i++){
        if (this.lat == markers[i].position.lat() && 
            this.lng == markers[i].position.lng().toFixed(6)) {
            markers[i].setAnimation(google.maps.Animation.BOUNCE);
            /* Info Window */
            /* Showing The Info Window When Closed */
            if ( markers[i].infowindow ) {
                if( markers[i].infowindow.opened == false ) {
                    markers[i].infowindow.open(map, markers[i]);
                    markers[i].infowindow.opened = true;
                }
            } else {
                markers[i].infowindow = this.locationInfo();
                markers[i].infowindow.open(map, markers[i]);
                markers[i].infowindow.opened = true;
            }     
        } else {
            // Stop Animation Of All other markers
            markers[i].setAnimation(google.maps.Animation.Null);
            if (markers[i].infowindow) {
                markers[i].infowindow.close();
                markers[i].infowindow.opened = false;
            }
        }
    }
    return;
};
Location.prototype.locationInfo = function () {
    var content = '<h3>'+ this.locationName +'</h3>';
        content += '<h5>Coordinates: <small>'+ this.lat + ',' + this.lng +'</small></h5>';
        content += '<div class="location_image"><center><img src="https://maps.googleapis.com/maps/api/streetview?size=300x200&location='+ this.lat +',' + this.lng+'&heading=151.78&pitch=-0.76&key=AIzaSyBunq9dcqHV6OajhhVts3YOl21GRkG4TH8"></center></div>'
        
    // NY Times AJAX request
   
        var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json?q="+ this.locationName;
        url += '&' + $.param({
        'api-key': "70e67e6a09e34cb2992a051b3ebcea74"
    });
    $.ajax({
        url: url,
        method: 'GET',
        }).done(function(result) {
            received_data = "<h5 class='mt-3'>Related NY Times Articles:</h5><ul>";
            for (i = 0; i<=2; i++){
                received_data += "<a href='" + result.response.docs[i].web_url + "'>";
                received_data += "<li>" + result.response.docs[i].headline.main + "</li>";
                received_data += "</a>"
            }
            received_data += "</ul>";
            infowindow.setContent(infowindow.content + received_data);

    }).fail(function(err) {
        throw err;
    });

    var infowindow = new google.maps.InfoWindow({
        content: content
    });
    return infowindow;
};
// End of Location Class */

// Define Location Objects 
var BigBen = new Location(51.500910, -0.124658, 'Big Ben');
var ImperialWaveMuseum = new Location(51.497310, -0.108988, 'Imperial Wave Museum');
var TheBritishMuseum = new Location(51.521029, -0.127184, 'The British Museum');
var NaturalHistoryMuseum = new Location(51.498272, -0.176794, 'Natural History Museum');
var HydePark = new Location(51.507248, -0.165979, 'Hyde Park');
var TheShard = new Location(51.505859, -0.087015, 'The Shard');
var TowerBridge = new Location(51.505783, -0.075342, 'Tower Bridge');


/* Knockout ViewModel */
var ViewModelMap = function() {
    self = this;
    self.Query = ko.observable('');
    // Add All Locations To An Observable Array 
    self.allLocations = ko.observableArray([BigBen, ImperialWaveMuseum, TheBritishMuseum, NaturalHistoryMuseum,
                       HydePark, TheShard, TowerBridge]);
    
    // Droping Markers On The Map
    $(document).ready(function(){
    self.allLocations().forEach(function(location) {
       location.dropMarker();
    });
    });

    /* Search Method */
    self.searchResults = ko.computed(function(q) {
        var q = self.Query();
        return self.allLocations().filter(function(element) {
          return element.locationName.toLowerCase().indexOf(q) >= 0;
        });
        
    });
}

ko.applyBindings(new ViewModelMap);
