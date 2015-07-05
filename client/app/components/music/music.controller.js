(function () {
    'use strict';

	angular.module('asafertrip')
		.controller('MusicController', ['$scope', 'musicServices', 'audioBufferServices', '$timeout', '$interval', '$location',
			function ($scope, musicServices, audioBufferServices, $timeout, $interval, $location) {

			var progress;
            var init = function()  {

				$scope.locations = musicServices.getLocations();

				if (!$scope.locations) {
					$location.path('/');
					return
				}

				musicServices.getData(function (data) {
					if (data.error == "There was an error") {
                      $scope.isNotSupported = true;
					}
					else{
						$scope.isNotSupported = false;
						$scope.musics= data;
                    	$scope.listen();
					}
				});
            };

            var sequenceSentences = function (sources) {
				 sources.forEach(function (sourceWrapper) {
					$timeout(function () {
						$scope.sentences.push(sourceWrapper.sentence);
					}, sourceWrapper.startTime);
				 });
			 };

			var increaseProgressBar = function(){
                progress = $interval(function () {
					$scope.increaseWidth += 0.36;
					console.log($scope.increaseWidth);
                }, 100);
            };

			$scope.listen = function () {
				$scope.isMusicFinished = false;
				$scope.sentences = [];
				$scope.increaseWidth = 0;
				audioBufferServices.playSound($scope.musics);
				sequenceSentences($scope.musics);

				increaseProgressBar();
				myStopFunction();
			};

			var myStopFunction = function(){
				$timeout(function(){
					$interval.cancel(progress);
					$scope.isMusicFinished = true;
				}, 30000);
			};



			init();

		}]);
})();