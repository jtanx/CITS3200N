angular.module('starter.controllers', [])

//Controllers for the app

//The login display uses the ionic modal css; the login display appears over the user's main view temporarily.
.controller('loginDisplay', function($scope, $ionicModal) {
  $ionicModal.fromTemplateUrl('templates/login.html', function(modal) {
    $scope.loginModal = modal;
  },
  {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  });
  
  //Modal is reset when the user is done with it
  $scope.$on('$destroy', function() {
    $scope.loginModal.remove();
  });
})

//Controls the login display; username and password fields are initialised as empty
.controller('loginCtrl', function($scope, $state, api) {
  $scope.username = "";
  $scope.password = "";
  $scope.message = "";
  
  api.initialise();
  
  $scope.$on('event:auth-forbidden', function(e, rejection) {
    $scope.loginModal.show();
  });
  
  $scope.$on('event:auth-loginRequired', function(e, rejection) {
    $scope.loginModal.show();
  });
 
  $scope.close = function() {
     $scope.username = "";
     $scope.password = "";
     $scope.loginModal.hide();
  };
 
  //If credentials entered are correct, the login display is hidden
  $scope.$on('event:auth-loginConfirmed', function() {
     $scope.username = "";
     $scope.password = "";
     $scope.loginModal.hide();
  });
  
  //If username or password are incorrect, error message displayed
  $scope.$on('event:auth-login-failed', function(e, status) {
    var error = "Login failed.";
    if (status == 401 || status == 403 || status == 400) {
      error = "Invalid Username or Password.";
    }
    $scope.message = error;
  });
 
  //if the user logs out, the settings page is reloaded with the 'sign in' button instead of the 'sign out' button
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

//fetches the array of week day names and their respective entries from the schedule service
.controller('scheduleCtrl', function($scope, Days) {
  $scope.days = Days.all();
  $scope.entries = Days.allentries();
	
})

//this is the controller for adding exercises to the schedule
.controller('DayAddCtrl', function($scope, $state, $stateParams, Days) {
  $scope.day = Days.get($stateParams.dayId);
  $scope.submit = function(text, newday, time) {
		Days.add(text, newday, time);
		$state.go('tab.schedule');
	};
	$scope.types = Days.types();
})

//this controller makes sure that the added exercise entries are valid
.controller('ExAddCtrl', function($scope, $state, $stateParams, Exercises) {
  $scope.exercise = {};
  //the times entered must be valid, and the end time must be after the start time
  $scope.isTimeValid = function() {
    var ex = $scope.exercise;
    return ex.start.isValid() && ex.end.isValid() && ex.end.isAfter(ex.start);
  };
  
  //the save state of the exercise is changed when an exercise is added
  $scope.submit = function() {
		Exercises.add($scope.exercise);
		$state.go('tab.diary');
	};
	$scope.types = Exercises.types();
	
})

//controls the exercise tab
.controller('ExerciseCtrl', function($scope, $state, $stateParams, Exercises, api) {
  var setParameters = function() {
    $scope.exercise = angular.copy(Exercises.get($stateParams.exId));
    console.log($scope.exercise);
	//Invalid exercise/exercise no longer exists; return to the main diary page
    if (!$scope.exercise) {
      $state.go('tab.diary');
    }
  }
  
  //when the diary is synced with the server, parameters are reset
  setParameters();
  $scope.$on('event:api-synced', function() {
    setParameters();
  });
  
  $scope.sync = api.syncAll;
  
  //checks if the exercise times entered are valid
  $scope.isTimeValid = function() {
    var ex = $scope.exercise;
    return ex.start.isValid() && ex.end.isValid() && ex.end.isAfter(ex.start);
  };
  
  //when an exercise is edited, the save state is updated
  $scope.submit = function() {
		Exercises.edit($stateParams.exId, $scope.exercise);
	$state.go('tab.diary');
	};
  //when an exercise is removed, the save state is updated
  $scope.remove = function(id) {
		Exercises.remove(id);
		$state.go('tab.diary');
	};
  
  $scope.types = Exercises.types();
  
})

//when the schedule is edited, the old parameters are replaced with the new
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

//the mental survey controller
.controller('mentaltestCtrl', function($scope, $ionicSlideBoxDelegate, $ionicScrollDelegate, Questions, MentalSurvey) {
  var setParameters = function () {
    $scope.completed = MentalSurvey.completed();
  };
  
  setParameters();
  //Re-set the parameters when we sync
  $scope.$on('event:api-synced', setParameters);

  
  //fetches the mtds questions from the mental survey service
  $scope.questions = Questions.all();
  $scope.options = MentalSurvey.options();
  $scope.answer = function(question, option) {
    MentalSurvey.answer(question, option);
    $ionicSlideBoxDelegate.update();
    $ionicSlideBoxDelegate.next();
  };
  $scope.testanswers = MentalSurvey.all();
  //the mental survey can only be submitted after all the questions have been answered
  $scope.submit = function() {
    if(MentalSurvey.answered() == Questions.all().length){
      MentalSurvey.submit();
      //Scroll to the top. Otherwise sometimes the notice is missed.
      $ionicScrollDelegate.scrollTop();
      $scope.completed = MentalSurvey.completed();
    }
  };
})

//statistics controller
.controller('statsCtrl', function($scope, api) {
	$scope.press = function() {
		api.getStats();
  };
	
})

.controller('settingsCtrl', function($scope, $ionicModal, $window, $ionicPopup, Settings, api) {
  var setParameters = function() {
    $scope.signedin = api.loggedIn();
  };
  
  setParameters();
  $scope.$on('event:api-initialised', setParameters);
  $scope.$on('event:auth-logout-complete', setParameters);
  $scope.$on('event:auth-loginConfirmed', setParameters);
  
  
  $scope.help = false;
  //the sync button syncs all entered information to the server
  $scope.sync = api.syncAll;
  
  //when the signin button is clicked, the login display appears
  $scope.signin = function() {
		$scope.loginModal.show();
  };
  $scope.signout = function() {
    api.logout();
    api.logout();
  };
  
  
  
  $ionicModal.fromTemplateUrl('templates/help.html', function(modal) {
    $scope.helpModal = modal;
  },
  {
    scope: $scope,
    animation: 'slide-in-up'
  });
  $scope.helpme = function() {
		$scope.helpModal.show();
  };
  $scope.close = function() {
		$scope.helpModal.hide();
  };
  
  $scope.$on('doubletap', function() {
    $scope.helpModal.hide();
  });
  
  $scope.reset = function() {
    $ionicPopup.confirm({
      title: 'Confirm full reset',
      template: 'Are you sure you want to perform a full reset?'
    }).then(function(res) {
      if (res) {
        Settings.reset();
        $window.location.reload(true)
      }
    });
  };
  
  //Modal is reset when the user is done with it
  $scope.$on('$destroy', function() {
    $scope.helpModal.remove();
  });
})

//this controller fetches the previously entered diary entries, displays them underneath their respective week day names
.controller('diaryCtrl', function($scope, Meals, SleepEntries, Exercises, api) {
  var setParameters = function() {
    $scope.todaytext = moment().format('ll');
    $scope.diff = SleepEntries.diff();
    $scope.types = Meals.types();
    $scope.meals = Meals.today();
    $scope.exercises = Exercises.all();
    $scope.sleepadded = SleepEntries.added();
  }
  
  $scope.sync = api.syncAll;
  
  setParameters();
  //the parameters are reset after syncing
  $scope.$on('event:api-synced', function() {
    setParameters();
  });
  
  //the save button saves all new information entered into the diary
  
  $scope.added = function(type){
		for(var i = 0; i<$scope.meals.length;i++){
			if ($scope.meals[i].type == type){return true;}
		}
		return false;
  };
})

//when a new meal is entered, the save status of the diary is updated
.controller('MealDetailCtrl', function($scope, $state, $stateParams, Meals) {
  $scope.type = $stateParams.type;
  $scope.submit = function(text){
		Meals.add($stateParams.type, text);
		$state.go('tab.diary');
  };
})

//when a meal is edited, the save status of the diary is updated
.controller('MealEditCtrl', function($scope, $state, $stateParams, Meals) {
  $scope.text = Meals.get($stateParams.type).text;
  $scope.type = $stateParams.type;
  $scope.submit = function(text){
		Meals.edit($stateParams.type, text);
		$state.go('tab.diary');
  };
  $scope.remove = function(){
		Meals.remove($stateParams.type);
		$state.go('tab.diary');
  };
})

.controller('SleepDetailCtrl', function($scope, $state, $stateParams, SleepEntries) {
	$scope.submit = function(start,end,quality){
    if (end.isBefore(start)) {
      end.add(1, 'd');
    }
    SleepEntries.add(start.subtract(1, 'd'), end.subtract(1, 'd'), quality);
    
		//if(startdate < enddate){
		//		SleepEntries.add(startdate, enddate, quality);
		//} else {$scope.timeerror = true;}
		$state.go('tab.diary');
	};
})

.controller('SleepEditCtrl', function($scope, $state, $stateParams, SleepEntries) {
	$scope.entry = SleepEntries.get();
  $scope.start = $scope.entry.start;
  $scope.end = $scope.entry.end;
	
	$scope.quality = $scope.entry.quality;
	$scope.submit = function(start,end,quality){
    start = moment($scope.entry.date).startOf('day')
              .set('hour', start.hour())
              .set('minute', start.minute());
    end = moment($scope.entry.date).startOf('day')
            .set('hour', end.hour())
            .set('minute', end.minute());
		if (end.isBefore(start)) {
			end.add(1, 'd');
		}
		SleepEntries.edit(start.subtract(1, 'd'), end.subtract(1, 'd'), quality);
		//if(startdate < enddate){
		//		SleepEntries.edit(startdate, enddate, quality);
		//} else {$scope.timeerror = true;}
		$state.go('tab.diary');
	};
	$scope.remove = function(){
		SleepEntries.remove();
		$state.go('tab.diary');
    };
})


