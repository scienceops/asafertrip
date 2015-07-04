(function () {
    'use strict';

	angular.module('asafertrip')
		.controller('DirectionController', ['$scope', 'musicServices', '$location',
			function ($scope, musicServices, $location) {
			$scope.locations = {};

			$scope.$on('markerAdded', function (event, data) {
				$scope.$apply(function () {
					$scope.locations[data.marker] = data.address;
				});
			});

			$scope.submitLocations = function () {
				musicServices.setLocations($scope.locations);
				$location.path('/music');
			}
		}]);
})();