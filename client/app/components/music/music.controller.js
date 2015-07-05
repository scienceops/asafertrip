(function () {
    'use strict';

	angular.module('asafertrip')
		.controller('MusicController', ['$scope', 'musicServices', 'audioBufferServices', '$timeout', '$interval',
			function ($scope, musicServices, audioBufferServices, $timeout, $interval) {

			var progress;
            var init = function()  {
            	$scope.sentences = [];
        		$scope.locations = {};
				musicServices.getData(function (data) {
					$scope.musics= data;
					 audioBufferServices.playSound($scope.musics);
                     sequenceSentences($scope.musics);
				});
				$scope.increaseWidth = 0;
				$scope.locations = musicServices.getLocations();

				increaseProgressBar();
				myStopFunction();
            };

            var sequenceSentences = function (sources) {
				 sources.forEach(function (sourceWrapper) {
					$timeout(function () {
						$scope.sentences.push(sourceWrapper.sentence);
					}, sourceWrapper.startTime);
				 });
			 }

			var increaseProgressBar = function(){
                progress = $interval(function () {
					$scope.increaseWidth += 0.36;
                }, 100);
            };

			var myStopFunction = function(){
				$timeout(function(){
					clearInterval(progress);
				}, 30000);
			};

			init();

		}]);
})();