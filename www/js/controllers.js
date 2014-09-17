angular.module('starter.controllers', [])

.controller('goalsCtrl', function($scope) {
})

.controller('scheduleCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('mentaltestCtrl', function($scope, Questions) {
  $scope.questions = Questions.all();
})

.controller('statsCtrl', function($scope) {
})

.controller('diaryCtrl', function($scope) {
})
/*
.controller('mentaltestCtrl', function($scope, MTDSSurvey) {
  $scope.surveyOne = MTDSSurvey.newSurvey();
  $scope.descriptors = ["Not at all", "A little", "Moderately", 
                        "Quite a bit", "Extremely"];*/
  /*$scope.colours = ["inherit", "#F29727", "#E05723", "#FF5144", "#E34570"];*/
/*});*/

	