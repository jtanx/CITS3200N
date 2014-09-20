angular.module('starter.controllers', [])

.controller('goalsCtrl', function($scope, List) {
	$scope.things = List.all();
	$scope.addTo = function(text) {
		List.add(text);
	};
	
})

.controller('scheduleCtrl', function($scope, Days) {
  $scope.days = Days.all();
  $scope.entries = Days.allentries();
	
})

.controller('DayAddCtrl', function($scope, $stateParams, Days) {
  $scope.day = Days.get($stateParams.dayId);
  $scope.addTo = function(text, newday, time) {
		Days.add(text, newday, time);
	};
})

.controller('SchedEditCtrl', function($scope, $stateParams, Days) {
  $scope.entry = Days.getex($stateParams.entryId);
  $scope.text = $scope.entry.name;
  $scope.time = $scope.entry.time;
  $scope.edit = function(id, text, time) {
		Days.edit(id, text, time);
	};
	$scope.remove = function(id) {
		Days.remove(id);
	};
})

.controller('mentaltestCtrl', function($scope, Questions, Answers) {
  $scope.questions = Questions.all();
  
  $scope.answers = Answers.all();
  
  $scope.next = function() {
    $scope.$broadcast('slideBox.nextSlide');
  };
})

.controller('statsCtrl', function($scope) {
})

.controller('diaryCtrl', function($scope, Meals) {
  //http://stackoverflow.com/questions/3552461/how-to-format-javascript-date
  $scope.today = new Date().toISOString().slice(0, 10);
  $scope.types = Meals.types();
  $scope.meals = Meals.all();
})

.controller('MealDetailCtrl', function($scope, $stateParams, Meals) {
  $scope.meal = Meals.get(new Date($stateParams.date), $stateParams.type);
})

.controller('SleepDetailCtrl', function($scope, $stateParams, SleepEntries) {
  $scope.sleep = SleepEntries.get(new Date($stateParams.date));
})