(function () {
	'use strict';

	angular.module('asafertrip')
		.directive('googleMaps', ['googleServices', '$rootScope', 'musicServices', function (googleServices, $rootScope, musicServices) {
			return {
				scope: {},
				template: [
					'<div class="spinner" ng-show="isLoading"><i class="fa fa-spin fa-spinner"></i></div>',
					'<div id="maps" ng-style="mapStyle" class="google-maps"></div>'].join(''),
				link: function (scope) {
					var map, directionsDisplay;
					var markers = [];
					scope.isLoading = false;
					scope.mapStyle = { opacity: 1 };
					var directionsService = new google.maps.DirectionsService();

					var addListeners = function () {
						google.maps.event.addListener(map, 'click', function (event) {
							if (!markers.origin || !markers.destination) {
								var marker = !markers.origin? 'origin' : 'destination';
								createMarker(marker, event.latLng);

								mapLoading();

								googleServices.getAddress(function (address) {
										mapLoaded();
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

							mapLoading();
							directionsService.route(request, function (response, status) {
							musicServices.setResponse(response);

								if (status === google.maps.DirectionsStatus.OK) {
									hideMarkers();

									directionsDisplay.setDirections(response);

									var leg = response.routes[ 0 ].legs[ 0 ];
									createMarker( 'origin', leg.start_location);
									createMarker( 'destination', leg.end_location);

									mapLoaded();
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
							zoom: 12
						};

						var styles = [
                           {
                              featureType: "road",
                              elementType: "labels",
                              stylers: [
                                { visibility: "off" }
                              ]
                            }
                          ];

						directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
						map = new google.maps.Map(document.getElementById('maps'), mapOptions);


 						var styledMap = new google.maps.StyledMapType(styles, {name: "Styled Map"});
						map.mapTypes.set('map_style', styledMap);
                        map.setMapTypeId('map_style');

						directionsDisplay.setMap(map);

						addListeners();
					};

					var updateInput = function (marker, address) {
						$rootScope.$broadcast('markerAdded', {marker: marker, address: address});

						calcRoute();
					};

					var mapLoading = function () {
						scope.$apply(function () {
							scope.isLoading = true;
							scope.mapStyle.opacity = 0.5;
						});

					};

					var mapLoaded = function () {
						scope.$apply(function () {
							scope.isLoading = false;
							scope.mapStyle.opacity = 1;
							console.log('no longer loading');
						});
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