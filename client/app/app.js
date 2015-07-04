(function () {
	'use strict';

	/**
	 * @ngdoc overview
	 * @name gabtSkeletonApp
	 * @description
	 * # gabtSkeletonApp
	 *
	 * Main module of the application.
	 */
	angular
		.module('asafertrip', [
			'ngAnimate',
			'ngCookies',
			'ngResource',
			'ngRoute',
			'ngSanitize',
			'ngTouch',
			'ngAnimate'
		])
		.config(['$routeProvider', function ($routeProvider) {
			$routeProvider
				.otherwise({
					redirectTo: '/'
				});
		}]);

})();
