(function () {
    'use strict';

	angular.module('asafertrip')
		.directive('googleAutocomplete',['$rootScope', function ($rootScope) {
			return {
				scope: {
					marker: '@'
				},
				link: function (scope, elem) {

					var autocomplete = new google.maps.places.Autocomplete(elem[0]);

					google.maps.event.addListener(autocomplete, 'place_changed', function() {
						var place = autocomplete.getPlace();

						if (!place.geometry) {
							window.alert("Autocomplete's returned place contains no geometry");
							return;
						}

						$rootScope.$broadcast('autocompleteChanged', {marker: scope.marker, geometry: place.geometry} );

					});
				}
			}
		}]);

})();