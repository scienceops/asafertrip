(function () {
	'use strict';

	angular.module('asafertrip')
		.directive('googleMaps', ['googleServices', '$rootScope', function (googleServices, $rootScope) {
			return {
				scope: {},
				template: '<div id="maps" class="google-maps"></div>',
				link: function (scope) {
					var map, directionsDisplay;
					var markers = [];
					var directionsService = new google.maps.DirectionsService();

					var addListeners = function () {
						google.maps.event.addListener(map, 'click', function (event) {
							if (!markers.origin || !markers.destination) {
								var marker = !markers.origin? 'origin' : 'destination';
								createMarker(marker, event.latLng);

								googleServices.getAddress(function (address) {
										updateInput(marker, address);
									},
									function () {

									},
									event.latLng);
							}
						});
					};

					var calcRoute = function () {
						if (markers.origin && markers.destination) {
							var start = markers.origin.getPosition();
							var end = markers.destination.getPosition();
							var request = {
								origin: start,
								destination: end,
								travelMode: google.maps.TravelMode.DRIVING
							};
							directionsService.route(request, function (response, status) {
								if (status === google.maps.DirectionsStatus.OK) {
									hideMarkers();
									directionsDisplay.setDirections(response);

									var leg = response.routes[ 0 ].legs[ 0 ];
									createMarker( 'origin', leg.start_location);
									createMarker( 'destination', leg.end_location);
								}
							});
						}

					};


					var createMarker = function (marker, location) {
						markers[marker] = new google.maps.Marker({
							position: location,
							map: map,
							title: marker,
							icon: {url: 'images/pin-' + marker + '.png' }
						});

					};

					var hideMarkers = function () {
						markers.origin.setVisible(false);
						markers.destination.setVisible(false);
					};

					var init = function () {

						var mapOptions = {
							center: {
								lat: -37.813186900000000000,
								lng: 144.962979600000040000
							},
							zoom: 8
						};

						directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
						map = new google.maps.Map(document.getElementById('maps'), mapOptions);
						directionsDisplay.setMap(map);

						addListeners();
					};

					var updateInput = function (marker, address) {
						$rootScope.$broadcast('markerAdded', {marker: marker, address: address});

						calcRoute();
					};

					scope.$on('autocompleteChanged', function (event, data) {

						createMarker(data.marker, data.geometry.location);

						calcRoute();
					});


					init();
				}
			}
		}]);
})();