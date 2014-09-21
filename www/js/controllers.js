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
	$scope.types = Days.types();
	
})

.controller('ExAddCtrl', function($scope, $stateParams, Exercises) {
  $scope.add = function(type, start, end, exertion) {
		Exercises.add(type, start, end, exertion);
	};
  $scope.types = Exercises.types();
})

.controller('ExerciseCtrl', function($scope, $stateParams, Exercises) {
  $scope.exercise = Exercises.get($stateParams.exId);
  $scope.remove = function(id) {
		Exercises.remove(id);
	};
  
  $scope.types = Exercises.types();
})

.controller('SchedEditCtrl', function($scope, $stateParams, Days) {
  $scope.entry = Days.getex($stateParams.entryId);
  $scope.remove = function(id) {
		Days.remove(id);
	};
  $scope.types = Days.types();
  $scope.firsttype = $scope.types[0];
})

.controller('mentaltestCtrl', function($scope, Questions, Answers) {
  $scope.questions = Questions.all();
  $scope.options = Answers.options();
  $scope.answer = function(question, option) {
    $scope.$broadcast('slideBox.nextSlide');
	Answers.answer(question, option);
  };
  $scope.submit = function() {
	Answers.submit();
  };
})

.controller('statsCtrl', function($scope) {
})

.controller('diaryCtrl', function($scope, Meals, SleepEntries, Exercises) {
  //http://stackoverflow.com/questions/3552461/how-to-format-javascript-date
  $scope.today = new Date().toISOString().slice(0, 10);
  $scope.types = Meals.types();
  $scope.meals = Meals.today(new Date());
  $scope.sleep = SleepEntries.get(new Date());
  $scope.diff = SleepEntries.diff(new Date());
  $scope.exercises = Exercises.all();
})

.controller('MealDetailCtrl', function($scope, $stateParams, Meals) {
  $scope.meal = Meals.get(new Date($stateParams.date), $stateParams.type);
})

.controller('SleepDetailCtrl', function($scope, $stateParams, SleepEntries) {
  $scope.sleep = SleepEntries.get(new Date($stateParams.date));
})