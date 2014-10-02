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
    $state.go('tab.settings', {}, {reload: true, inherit: false});
  });
  
  $scope.login = function () {
    var credentials = {
      username: this.username,
      password: this.password
    };
    api.login(credentials);
  }
})

.controller('scheduleCtrl', function($scope, Days) {
  $scope.days = Days.all();
  $scope.entries = Days.allentries();
	
})

.controller('DayAddCtrl', function($scope, $state, $stateParams, Days) {
  $scope.day = Days.get($stateParams.dayId);
  $scope.submit = function(text, newday, time) {
		Days.add(text, newday, time);
		$state.go('tab.schedule');
	};
	$scope.types = Days.types();
})

.controller('ExAddCtrl', function($scope, $state, $stateParams, Exercises, Save) {
  $scope.exercise = {};
  $scope.isTimeValid = function() {
    var ex = $scope.exercise;
    return ex.start.isValid() && ex.end.isValid() && ex.end.isAfter(ex.start);
  };
  
  $scope.submit = function() {
		Exercises.add($scope.exercise);
		$scope.unsave = Save.unsave();
		$state.go('tab.diary');
	};
	$scope.types = Exercises.types();
	
})

.controller('ExerciseCtrl', function($scope, $state, $stateParams, Exercises, Save) {
  $scope.exercise = angular.copy(Exercises.get($stateParams.exId));

  
  $scope.isTimeValid = function() {
    var ex = $scope.exercise;
    return ex.start.isValid() && ex.end.isValid() && ex.end.isAfter(ex.start);
  };
  
  $scope.submit = function() {
		Exercises.edit($stateParams.exId, $scope.exercise);
		Save.unsave();
	$state.go('tab.diary');
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
  $scope.newtype = $scope.entry.name;
  $scope.newtime = $scope.entry.time;
  $scope.remove = function(id) {
		Days.remove(id);
		$state.go('tab.schedule');
	};
	$scope.submit = function(type, time) {
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
	$scope.press = function() {
		api.getStats();
  };
	
})

.controller('settingsCtrl', function($scope, Settings, api) {
  $scope.help = false;
  $scope.signedin = api.loggedIn();
  
  $scope.$on('event:auth-loginConfirmed', function() {
    $scope.signedin = api.loggedIn();
  });
  
  $scope.signin = function() {
		$scope.loginModal.show();
  };
  $scope.signout = function() {
    api.logout();
		$scope.signedin = api.loggedIn();
  };
  $scope.helpme = function() {
		$scope.help = true;
  };
  $scope.restore = function() {
		Settings.restore();
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

.controller('MealDetailCtrl', function($scope, $state, $stateParams, Meals, Save) {
  $scope.type = $stateParams.type;
  $scope.submit = function(text){
		Meals.add($stateParams.type, text);
		Save.unsave();
		$state.go('tab.diary');
  };
})

.controller('MealEditCtrl', function($scope, $state, $stateParams, Meals, Save) {
  $scope.text = Meals.get($stateParams.type).text;
  $scope.type = $stateParams.type;
  $scope.submit = function(text){
		Meals.edit($stateParams.type, text);
		Save.unsave();
		$state.go('tab.diary');
  };
  $scope.remove = function(){
		Meals.remove($stateParams.type);
		Save.unsave();
		$state.go('tab.diary');
  };
})

.controller('SleepDetailCtrl', function($scope, $state, $stateParams, SleepEntries, Save) {
	$scope.submit = function(start,end,quality){
    if (end.isBefore(start)) {
      end.add(1, 'd');
    }
    SleepEntries.add(start, end, quality);
    
		//if(startdate < enddate){
		//		SleepEntries.add(startdate, enddate, quality);
		//} else {$scope.timeerror = true;}
		Save.unsave();
		$state.go('tab.diary');
	};
})

.controller('SleepEditCtrl', function($scope, $state, $stateParams, SleepEntries, Save) {
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
		$state.go('tab.diary');
	};
	$scope.remove = function(){
		SleepEntries.remove();
		Save.unsave();
		$state.go('tab.diary');
    };
})


