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
  $scope.submit = function(text, newday, time) {
		Days.add(text, newday, time);
	};
	$scope.types = Days.types();

	
})

.controller('ExAddCtrl', function($scope, $stateParams, Exercises) {
  $scope.submit = function(type, start, end, distance, exertion) {
		var todaydate = new Date();
		var startdate = new Date(todaydate.getFullYear(), todaydate.getMonth(), todaydate.getDate(), start.substring(0,2), start.substring(3,5),0);
		var enddate = new Date(todaydate.getFullYear(), todaydate.getMonth(), todaydate.getDate(), end.substring(0,2), end.substring(3,5),0);
		Exercises.add(type, startdate, enddate, distance, exertion);
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
  $scope.testanswers = Answers.all();
  $scope.submit = function() {
	Answers.submit();
  };
  $scope.completed = Answers.completed();
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