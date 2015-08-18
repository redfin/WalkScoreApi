var map;

function getRoute() {
  var url = "http://localhost:3001/api/route/6fffc9e7af7a9a444b12fd2ae2685281ab42bc1e";
  var deferred = Q.defer();
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function() {
    deferred.resolve(JSON.parse(this.responseText));
  });
  xhr.open("get", url, true);
  xhr.send();
  return deferred.promise;
}

function linestringToCoordinates(linestring) {
  return linestring
    .replace(/LINESTRING\(/i, '')
    .replace(/\)/i, '')
    .split(',')
    .map(function(coord) {
      var parts = coord.split(' ');
      return { lat: parseFloat(parts[1]), lng: parseFloat(parts[0]) };
    });
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 47.61, lng: -122.34 },
    zoom: 14
  });

  getRoute().then(function(payload) {
    var routeCoords = linestringToCoordinates(payload.geometry_wkt);
    var route = new google.maps.Polyline({
        path: routeCoords,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2
      });
    route.setMap(map);
  });
}
