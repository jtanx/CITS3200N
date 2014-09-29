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

.controller('loginCtrl', function($scope, $state, api) {
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
    var start = moment(start, "HH:mm");
    var end = moment(end, "HH:mm");
		Exercises.add(type, start, end, distance, exertion);
		$scope.unsave = Save.unsave();
	};
	$scope.types = Exercises.types();
})

.controller('ExerciseCtrl', function($scope, $state, $stateParams, Exercises, Save) {
  $scope.exercise = Exercises.get($stateParams.exId);
  $scope.typechosen = $scope.exercise.type;
  
  $scope.start = $scope.exercise.start;
  $scope.end = $scope.exercise.end;
  
  $scope.distance = $scope.exercise.distance;
  $scope.exertion = $scope.exercise.exertion;
  $scope.submit = function(type, start, end, distance, exertion) {
    console.log('submit', start, end);
    var start = moment(start, 'HH:mm');
    var end = moment(end, 'HH:mm');
		Exercises.edit($stateParams.exId, type, start, end, distance, exertion);
		Save.unsave();
	};
  $scope.remove = function(id) {
		Exercises.remove(id);
		Save.unsave();
		$state.go('tab.diary');
	};
  
  $scope.types = Exercises.types();
  
})

.controller('SchedEditCtrl', function($scope, $state, $stateParams, Days) {
  $scope.entry = Days.getex($stateParams.entryId);
  $scope.types = Days.types();
  if($scope.entry != null){
  $scope.newtype = $scope.entry.name;
  $scope.newtime = $scope.entry.time;
  }
  $scope.remove = function(id) {
		Days.remove(id);
		$state.go('tab.schedule');
	};
	$scope.edit = function(type, time) {
		Days.edit($stateParams.entryId, type, time);
		$state.go('tab.schedule');
	}
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
	if(Answers.answered() == Questions.all().length){
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
  $scope.todaytext = moment().format('ll');
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

.controller('MealEditCtrl', function($scope, $state, $stateParams, Meals, Save) {
  $scope.text = Meals.get($stateParams.type).text;
  $scope.type = $stateParams.type;
  $scope.submit = function(text){
		Meals.edit($stateParams.type, text);
		Save.unsave();
		$state.go('tab.diary');
		$location.path('#/tab/diary');
  };
})

.controller('SleepDetailCtrl', function($scope, $stateParams, SleepEntries, Save) {
	$scope.submit = function(start,end,quality){
    if (end.isBefore(start)) {
      end.add(1, 'd');
    }
    SleepEntries.add(start, end, quality);
    
		//if(startdate < enddate){
		//		SleepEntries.add(startdate, enddate, quality);
		//} else {$scope.timeerror = true;}
		Save.unsave();
	};
})

.controller('SleepEditCtrl', function($scope, $rootScope, $stateParams, SleepEntries, Save) {
	$scope.entry = SleepEntries.get();
	
  $scope.start = $scope.entry.start;
  $scope.end = $scope.entry.end;
	
	$scope.quality = $scope.entry.quality;
	$scope.submit = function(start,end,quality){
    if (end.isBefore(start)) {
      end.add(1, 'd');
    }
    SleepEntries.edit(start, end, quality);
		//if(startdate < enddate){
		//		SleepEntries.edit(startdate, enddate, quality);
		//} else {$scope.timeerror = true;}
		Save.unsave();
	};
})


