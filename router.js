'use strict'

let router = require('koa-router')();
let globalKeys = require('./keys.js');
let Q = require('Q');
let https = require('https');
let http = require('http');

function getJsonBody(callback) {
  return function(response) {
    let body = '';

    response.on('data', function(data) {
      body += data;
    });

    response.on('end', function() {
      let payload = JSON.parse(body);
      callback(payload);
    });
  }
}

// Walk Score api *requires* a latitude and longitude.  We'll use Google's Geocoding
// Api (https://developers.google.com/maps/documentation/geocoding/intro).
function getLocationFromGoogle(address) {
  let deferred = Q.defer();
  let url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + globalKeys.googleApiKey;

  https.get(url, getJsonBody(function(payload) {
    let location = payload.results[0].geometry.location;
    deferred.resolve(location);
  }));

  return deferred.promise;
}

function getWalkScore(address, location) {
  let deferred = Q.defer();
  let url = 'http://api.walkscore.com/score?format=json&address=' + address + '&lat=' +
    location.lat + '&lon=' + location.lng + '&wsapikey=' + globalKeys.walkScoreApiKey;

  http.get(url, deferred.resolve);

  return deferred.promise;
}

function getStops(location) {
  let deferred = Q.defer();
  let url = 'http://transit.walkscore.com/transit/search/stops/?format=json&lat=' +
    location.lat + '&lon=' + location.lng + '&wsapikey=' + globalKeys.walkScoreApiKey;

    http.get(url, deferred.resolve);

    return deferred.promise;
}

function getStop(id) {
  let deferred = Q.defer();
  let url = 'http://transit.walkscore.com/transit/stop/' + id + '?format=json&wsapikey=' + globalKeys.walkScoreApiKey;

  http.get(url, deferred.resolve);

  return deferred.promise;
}

function getRoute(id) {
  let deferred = Q.defer();
  let url = 'http://transit.walkscore.com/transit/route/' + id + '?format=json&wsapikey=' + globalKeys.walkScoreApiKey;

  http.get(url, deferred.resolve);

  return deferred.promise;
}

function getTravelTimePolygon(origin) {
  let deferred = Q.defer();
  let url = 'http://api2.walkscore.com/api/v1/traveltime_polygon/json?wsapikey=' + globalKeys.walkScoreApiKey
    + '&origin=' + origin.lat + '%2C' + origin.lng + '&mode=bike&time=20';

  http.get(url, deferred.resolve);

  return deferred.promise;
}

// Example usage:
// curl localhost:3001/api/walk/2025%201st%20Avenue%20Suite%20500,%20Seattle,%20WA%2098121 | json-prettify | less
router.get('/api/walk/:address', function *(next) {
  // For example, an address might be '2025 1st Avenue Suite 500, Seattle, WA 98121'
  let address = this.params.address;
  let location = yield getLocationFromGoogle(address);
  let walkScore = yield getWalkScore(address, location);

  this.body = walkScore;
});

// Example usage:
// curl localhost:3001/api/stops/2025%201st%20Avenue%20Suite%20500,%20Seattle,%20WA%2098121 > stops.out
router.get('/api/stops/:address', function *(next) {
  let address = this.params.address;
  let location = yield getLocationFromGoogle(address);
  let stops = yield getStops(location);

  this.body = stops;
});

// Example usage:
// curl localhost:3001/api/route/6fffc9e7af7a9a444b12fd2ae2685281ab42bc1e
router.get('/api/route/:id', function *(next) {
  let id = this.params.id;
  let route = yield getRoute(id);

  this.body = route;
});

// Example usage:
// curl localhost:3001/api/stop/fb1522a4c2ba6265619b2e7054a9f4c74ea11479
router.get('/api/stop/:id', function *(next) {
  let id = this.params.id;
  let stop = yield getStop(id);

  this.body = stop;
});

// Example usage:
// curl localhost:3001/api/travel/2025%201st%20Avenue%20Suite%20500,%20Seattle,%20WA%2098121
router.get('/api/travel/:address', function *(next) {
  let address = this.params.address;
  let origin = yield getLocationFromGoogle(address);
  let polygon = yield getTravelTimePolygon(origin);

  this.body = polygon;
})

router.redirect('/', 'index.html');

module.exports = router;
