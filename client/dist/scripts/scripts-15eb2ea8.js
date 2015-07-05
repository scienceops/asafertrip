!function(){"use strict";angular.module("asafertrip",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch","ngAnimate"]).config(["$routeProvider",function(e){e.otherwise({redirectTo:"/"})}])}(),function(){"use strict";angular.module("asafertrip").factory("googleServices",[function(){var e=new google.maps.Geocoder;return{getAddress:function(o,t,n){var i={latLng:n};e.geocode(i,function(e,t){t==google.maps.GeocoderStatus.OK?e[1]?o(e[1].formatted_address):alert("No results found"):alert("Geocoder failed due to: "+t)})}}}])}(),function(){"use strict";angular.module("asafertrip").factory("musicServices",["$http",function(e){return{getData:function(o){e.post("http://54.66.255.195:8080/api/aggregate",this.mapsResponse).success(function(e,t,n,i){o(e)}).error(function(e,o,t,n){})},setLocations:function(e){this.locations=e},getLocations:function(){return this.locations},setResponse:function(e){this.mapsResponse=e}}}])}(),function(){"use strict";angular.module("asafertrip").factory("audioBufferServices",[function(){function e(e,o){var n=[];return o.forEach(function(o){n.push({sampleUrl:o.sampleUrl,startTime:o.startTime,source:t(e,o.sampleUrl)})}),n}function o(e){e.forEach(function(e){window.setTimeout(function(){e.source.start()},e.startTime)})}function t(e,o){var t=new XMLHttpRequest,n=e.createBufferSource();return t.open("GET",o,!0),t.responseType="arraybuffer",t.onload=function(){var o=t.response;e.decodeAudioData(o,function(o){n.buffer=o,n.connect(e.destination)},function(e){"Error decoding the audio data"+e.err})},t.send(),n}return{playSound:function(t){var n=new(window.AudioContext||window.webkitAudioContext||window.mozAudioContext||window.oAudioContext||window.msAudioContext),i=e(n,t);o(i)}}}])}(),function(){"use strict";angular.module("asafertrip").directive("googleMaps",["googleServices","$rootScope","musicServices",function(e,o,t){return{scope:{},template:['<div class="spinner" ng-show="isLoading"></div>','<div id="maps" ng-style="mapStyle" class="google-maps"></div>'].join(""),link:function(n){var i,r,s=[];n.isLoading=!1,n.mapStyle={opacity:1};var a=new google.maps.DirectionsService,c=function(){google.maps.event.addListener(i,"click",function(o){if(!s.origin||!s.destination){var t=s.origin?"destination":"origin";l(t,o.latLng),g(),e.getAddress(function(e){m(),p(t,e)},function(){},o.latLng)}})},u=function(){if(s.origin&&s.destination){var e=s.origin.getPosition(),o=s.destination.getPosition(),n={origin:e,destination:o,travelMode:google.maps.TravelMode.DRIVING};g(),a.route(n,function(e,o){if(t.setResponse(e),o===google.maps.DirectionsStatus.OK){d(),r.setDirections(e);var n=e.routes[0].legs[0];l("origin",n.start_location),l("destination",n.end_location),m()}})}},l=function(e,o){s[e]=new google.maps.Marker({position:o,map:i,title:e,icon:{url:"images/pin-"+e+".png"}})},d=function(){s.origin.setVisible(!1),s.destination.setVisible(!1)},f=function(){var e={center:{lat:-37.8131869,lng:144.96297960000004},zoom:12},o=[{featureType:"road",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi",elementType:"labels",stylers:[{visibility:"off"}]}];r=new google.maps.DirectionsRenderer({suppressMarkers:!0}),i=new google.maps.Map(document.getElementById("maps"),e);var t=new google.maps.StyledMapType(o,{name:"Styled Map"});i.mapTypes.set("map_style",t),i.setMapTypeId("map_style"),r.setMap(i),c()},p=function(e,t){o.$broadcast("markerAdded",{marker:e,address:t}),u()},g=function(){n.$apply(function(){n.isLoading=!0,n.mapStyle.opacity=.5})},m=function(){n.$apply(function(){n.isLoading=!1,n.mapStyle.opacity=1})};n.$on("autocompleteChanged",function(e,o){l(o.marker,o.geometry.location),u()}),f()}}}])}(),function(){"use strict";angular.module("asafertrip").directive("googleAutocomplete",["$rootScope",function(e){return{scope:{marker:"@"},link:function(o,t){var n=new google.maps.places.Autocomplete(t[0]);google.maps.event.addListener(n,"place_changed",function(){var t=n.getPlace();return t.geometry?void e.$broadcast("autocompleteChanged",{marker:o.marker,geometry:t.geometry}):void window.alert("Autocomplete's returned place contains no geometry")})}}}])}(),function(){"use strict";function e(){try{window.AudioContext=window.AudioContext||window.webkitAudioContext,o=new AudioContext}catch(e){alert("Web Audio API is not supported in this browser")}}var o;window.addEventListener("load",e,!1)}(),function(){"use strict";angular.module("asafertrip").config(["$routeProvider",function(e){e.when("/",{templateUrl:"/components/direction/direction.html",controller:"DirectionController",controllerAs:"directionCtrl"}).otherwise({redirectTo:"/"})}])}(),function(){"use strict";angular.module("asafertrip").controller("DirectionController",["$scope","musicServices","$location",function(e,o,t){e.locations={},e.$on("markerAdded",function(o,t){e.$apply(function(){e.locations[t.marker]=t.address})}),e.submitLocations=function(){o.setLocations(e.locations),t.path("/music")}}])}(),function(){"use strict";angular.module("asafertrip").config(["$routeProvider",function(e){e.when("/music",{templateUrl:"/components/music/music.html",controller:"MusicController",controllerAs:"musicCtrl"})}])}(),function(){"use strict";angular.module("asafertrip").controller("MusicController",["$scope","musicServices","audioBufferServices","$timeout","$interval","$location",function(e,o,t,n,i,r){var s,a=function(){return e.locations=o.getLocations(),e.locations?void o.getData(function(o){"There was an error"==o.error?e.isNotSupported=!0:(e.isNotSupported=!1,e.musics=o,e.listen())}):void r.path("/")},c=function(o){o.forEach(function(o){n(function(){e.sentences.push(o.sentence)},o.startTime)})},u=function(){s=i(function(){e.increaseWidth+=.36,console.log(e.increaseWidth)},100)};e.listen=function(){e.isMusicFinished=!1,e.sentences=[],e.increaseWidth=0,t.playSound(e.musics),c(e.musics),u(),l()};var l=function(){n(function(){i.cancel(s),e.isMusicFinished=!0},3e4)};a()}])}();