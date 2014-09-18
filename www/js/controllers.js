angular.module('starter.controllers', [])

.controller('goalsCtrl', function($scope) {
})

.controller('scheduleCtrl', function($scope, Days) {
  $scope.days = Days.all();
})

.controller('DayAddCtrl', function($scope, $stateParams, Days) {
  $scope.day = Days.get($stateParams.dayId);
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

	
