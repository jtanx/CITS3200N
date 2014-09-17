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
  //http://stackoverflow.com/questions/3552461/how-to-format-javascript-date
  $scope.today = new Date().toISOString().slice(0, 10);
})

.controller('SleepDetailCtrl', function($scope, $stateParams, SleepEntries) {
  $scope.sleep = SleepEntries.get(new Date($stateParams.date));
})
/*
.controller('mentaltestCtrl', function($scope, MTDSSurvey) {
  $scope.surveyOne = MTDSSurvey.newSurvey();
  $scope.descriptors = ["Not at all", "A little", "Moderately", 
                        "Quite a bit", "Extremely"];*/
  /*$scope.colours = ["inherit", "#F29727", "#E05723", "#FF5144", "#E34570"];*/
/*});*/

	
