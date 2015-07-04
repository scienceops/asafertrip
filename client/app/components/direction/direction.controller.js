(function () {
    'use strict';

	angular.module('asafertrip')
		.controller('DirectionController', ['$scope', function ($scope) {
			$scope.locations = {};

			$scope.$on('markerAdded', function (event, data) {
				$scope.$apply(function () {
					$scope.locations[data.marker] = data.address;
				});
			});
		}]);
})();