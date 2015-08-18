var map;

function getTravelTimePolygon() {
  var url = "http://localhost:3000/api/travel/2025%201st%20Avenue%20Suite%20500,%20Seattle,%20WA%2098121";
  var deferred = Q.defer();
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function() {
    deferred.resolve(JSON.parse(this.responseText));
  });
  xhr.open("get", url, true);
  xhr.send();
  return deferred.promise;
}

function convertCoordinates(walkscoreCoords) {
  return walkscoreCoords[0][0]
    .map(function(coord) {
      console.log(coord);
      return { lat: parseFloat(coord[1]), lng: parseFloat(coord[0]) };
    });
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 47.61, lng: -122.34 },
    zoom: 13
  });

  getTravelTimePolygon().then(function(payload) {
    var polyCoords = convertCoordinates(payload.response.geometry.coordinates);
    var polygon = new google.maps.Polyline({
        path: polyCoords,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2
      });
    polygon.setMap(map);
  });
}
