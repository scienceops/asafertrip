(function () {
    'use strict';

	angular.module('asafertrip')
		.factory('googleServices', [function () {
			var	geocoder = new google.maps.Geocoder();

			return {

				getAddress: function (successHandler, errorHandler, latLng) {
					//?latlng=40.714224,-73.961452&key=API_KEY'
					var params = {
						'latLng': latLng
					};

					geocoder.geocode(params, function(results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							if (results[1]) {
								successHandler(results[1].formatted_address);
							} else {
								alert('No results found');
							}
						} else {
							alert('Geocoder failed due to: ' + status);
						}
					});
				}
			}
		}]);
})();