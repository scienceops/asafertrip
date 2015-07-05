(function () {
    'use strict';

	angular.module('asafertrip')
		.factory('musicServices', ['$http', function ($http) {

			return {
				getData: function(successHandler) {
                	$http.post('http://54.66.255.195:8080/api/aggregate', this.mapsResponse)
                		.success(function(data, status, headers, config) {
                        	successHandler(data);
                        })
                        .error(function(data, status, headers, config) {
//                        	console.log("error");
                        });
				  },
				setLocations: function (locations) {
					this.locations = locations;
				},
				getLocations: function () {
					return this.locations;
				},
				setResponse: function (response) {
                    this.mapsResponse = response;
                },
			}
		}]);
})();