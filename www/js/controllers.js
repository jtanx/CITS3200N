angular.module('starter.controllers', [])

.controller('loginDisplay', function($scope, $ionicModal) {
  $ionicModal.fromTemplateUrl('templates/login.html', function(modal) {
    $scope.loginModal = modal;
  },
  {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  });
  
  $scope.$on('$destroy', function() {
    $scope.loginModal.remove();
  });
})

.controller('loginCtrl', function($scope, $location, api) {
  $scope.username = "";
  $scope.password = "";
  $scope.message = "";
  
  $scope.$on('event:auth-forbidden', function(e, rejection) {
    $scope.loginModal.show();
  });
  
  $scope.$on('event:auth-loginRequired', function(e, rejection) {
    $scope.loginModal.show();
  });
 
  $scope.$on('event:auth-loginConfirmed', function() {
     $scope.username = "";
     $scope.password = "";
     $scope.loginModal.hide();
  });
  
  $scope.$on('event:auth-login-failed', function(e, status) {
    var error = "Login failed.";
    if (status == 401 || status == 403 || status == 400) {
      error = "Invalid Username or Password.";
    }
    $scope.message = error;
  });
 
  $scope.$on('event:auth-logout-complete', function() {
    $state.go('app.home', {}, {reload: true, inherit: false});
  });
  
  $scope.login = function () {
    var credentials = {
      username: this.username,
      password: this.password
    };
    api.login(credentials);
  }
})

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

.controller('ExAddCtrl', function($scope, $stateParams, Exercises, Save) {
  $scope.submit = function(type, start, end, distance, exertion) {
		var todaydate = new Date();
		var startdate = new Date(todaydate.getFullYear(), todaydate.getMonth(), todaydate.getDate(), start.substring(0,2), start.substring(3,5),0);
		var enddate = new Date(todaydate.getFullYear(), todaydate.getMonth(), todaydate.getDate(), end.substring(0,2), end.substring(3,5),0);
		Exercises.add(type, startdate, enddate, distance, exertion);
		$scope.unsave = Save.unsave();
	};
	$scope.types = Exercises.types();
})

.controller('ExerciseCtrl', function($scope, $stateParams, Exercises, Save) {
  $scope.exercise = Exercises.get($stateParams.exId);
  $scope.typechosen = $scope.exercise.type;
  
  var starthours = $scope.exercise.start.getHours();
	var startminutes = $scope.exercise.start.getMinutes();

	if (starthours<10) starthours = "0" + starthours;
	if (startminutes<10) startminutes = "0" + startminutes;
  
  $scope.start = starthours + ":" + startminutes;
  
  var endhours = $scope.exercise.end.getHours();
	var endminutes = $scope.exercise.end.getMinutes();

	if (endhours<10) endhours = "0" + endhours;
	if (endminutes<10) endminutes = "0" + endminutes;
  
  $scope.end = endhours + ":" + endminutes;
  
  $scope.distance = $scope.exercise.distance;
  $scope.exertion = $scope.exercise.exertion;
  $scope.submit = function(type, start, end, distance, exertion) {
		var todaydate = $scope.exercise.date;
		var startdate = new Date(todaydate.getFullYear(), todaydate.getMonth(), todaydate.getDate(), start.substring(0,2), start.substring(3,5),0);
		var enddate = new Date(todaydate.getFullYear(), todaydate.getMonth(), todaydate.getDate(), end.substring(0,2), end.substring(3,5),0);
		Exercises.edit($stateParams.exId, type, startdate, enddate, distance, exertion);
		Save.unsave();
	};
  $scope.remove = function(id) {
		Exercises.remove(id);
		Save.unsave();
	};
  
  $scope.types = Exercises.types();
  
})

.controller('SchedEditCtrl', function($scope, $stateParams, Days) {
  $scope.entry = Days.getex($stateParams.entryId);
  $scope.remove = function(id) {
		Days.remove(id);
	};
	$scope.edit = function(type, time) {
		Days.edit($stateParams.entryId, type, time);
	}
  $scope.types = Days.types();
  $scope.newtype = $scope.entry.name;
  $scope.newtime = $scope.entry.time;
  $scope.firsttype = $scope.types[0];
})

.controller('mentaltestCtrl', function($scope, $ionicSlideBoxDelegate, Questions, Answers) {
	$scope.completed = Answers.completed();
	$scope.questions = Questions.all();
	$scope.options = Answers.options();
	$scope.answer = function(question, option) {
		Answers.answer(question, option);
		$ionicSlideBoxDelegate.update();
		$ionicSlideBoxDelegate.next();
	};
  $scope.testanswers = Answers.all();
  $scope.submit = function() {
	if(Answers.answered() == 22){
	Answers.submit();
	$scope.completed = Answers.completed();
	}
  };
  
})

.controller('statsCtrl', function($scope, api) {
  api.getStats();
})

.controller('settingsCtrl', function($scope, Settings) {
  $scope.signedin = false;
  $scope.firstname = Settings.firstname();
  $scope.lastname = Settings.lastname();
  $scope.signin = function(first, last) {
		Settings.edit(first, last);
		$scope.firstname = Settings.firstname();
		$scope.lastname = Settings.lastname();
		$scope.signedin = true;
  };
  $scope.signout = function() {
		$scope.signedin = false;
  };
})

.controller('diaryCtrl', function($scope, Meals, SleepEntries, Exercises, Save) {
  //http://stackoverflow.com/questions/3552461/how-to-format-javascript-date
  $scope.today = new Date().toISOString().slice(0, 10);
  $scope.todaytext = Date().slice(0, 10);
  $scope.diff = SleepEntries.diff();
  $scope.types = Meals.types();
  $scope.meals = Meals.today();
  $scope.exercises = Exercises.all();
  $scope.saved = Save.status();
  $scope.save = function() {
		Save.save();
		$scope.saved = Save.status();
  };
  $scope.sleepadded = SleepEntries.added();
  $scope.added = function(type){
		for(var i = 0; i<$scope.meals.length;i++){
			if ($scope.meals[i].type == type){return true;}
		}
		return false;
  };
})

.controller('MealDetailCtrl', function($scope, $stateParams, Meals, Save) {
  $scope.type = $stateParams.type;
  $scope.submit = function(text){
		Meals.add($stateParams.type, text);
		Save.unsave();
  };
})

.controller('MealEditCtrl', function($scope, $location, $stateParams, Meals, Save) {
  $scope.text = Meals.get($stateParams.type).text;
  $scope.type = $stateParams.type;
  $scope.submit = function(text){
		Meals.edit($stateParams.type, text);
		Save.unsave();
		$location.path('#/tab/diary');
  };
})

.controller('SleepDetailCtrl', function($scope, $stateParams, SleepEntries, Save) {
	$scope.submit = function(start,end,quality){
		var todaydate = new Date();
		var date = todaydate.getDate();
		if(start.substring(0,2) >= 12){date--;}
		var startdate = new Date(todaydate.getFullYear(), todaydate.getMonth(), date, start.substring(0,2), start.substring(3,5),0);
		var enddate = new Date(todaydate.getFullYear(), todaydate.getMonth(), todaydate.getDate(), end.substring(0,2), end.substring(3,5),0);
		if(startdate < enddate){
				SleepEntries.add(startdate, enddate, quality);
		} else {$scope.timeerror = true;}
		Save.unsave();
	};
})

.controller('SleepEditCtrl', function($scope, $rootScope, $stateParams, SleepEntries, Save) {
	$scope.entry = SleepEntries.get();
	
	var starthours = $scope.entry.start.getHours();
	var startminutes = $scope.entry.start.getMinutes();

	if (starthours<10) starthours = "0" + starthours;
	if (startminutes<10) startminutes = "0" + startminutes;
  
  $scope.start = starthours + ":" + startminutes;
  
  var endhours = $scope.entry.end.getHours();
	var endminutes = $scope.entry.end.getMinutes();

	if (endhours<10) endhours = "0" + endhours;
	if (endminutes<10) endminutes = "0" + endminutes;
  
  $scope.end = endhours + ":" + endminutes;
	
	$scope.quality = $scope.entry.quality;
	$scope.submit = function(start,end,quality){
		var todaydate = new Date();
		var date = todaydate.getDate();
		if(start.substring(0,2) >= 12){date--;}
		var startdate = new Date(todaydate.getFullYear(), todaydate.getMonth(), date, start.substring(0,2), start.substring(3,5),0);
		var enddate = new Date(todaydate.getFullYear(), todaydate.getMonth(), todaydate.getDate(), end.substring(0,2), end.substring(3,5),0);
		if(startdate < enddate){
				SleepEntries.edit(startdate, enddate, quality);
		} else {$scope.timeerror = true;}
		Save.unsave();
	};
})


