// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCookies', 'http-auth-interceptor', 'starter.controllers', 'starter.services'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

//Uses moment.js to parse dates from the user.
//http://cameronspear.com/blog/how-cool-are-formatters-and-parsers/
.directive('timeField', [function () {
  return {
    require: 'ngModel',
    link: function (scope, elem, attrs, ngModel) {      
      var toView = function (val) {
        if (typeof val !== "undefined")
          return val.format("HH:mm");
        return val;
      };
      
      var toModel = function (val) {
        var ret = moment(val, "HH:mm");
        ngModel.$setValidity('timeField', ret.isValid());
        return ret;
      };
      
      ngModel.$formatters.unshift(toView);
      ngModel.$parsers.unshift(toModel);
    }
  };
}])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html",
      controller: 'loginDisplay'
    })

    //The settings tab
    .state('tab.settings', {
      url: '/settings',
      views: {
        'tab-settings': {
          templateUrl: 'templates/tab-settings.html',
          controller: 'settingsCtrl'
        }
      }
    })

    //The diary tab
	 .state('tab.diary', {
      url: '/diary',
      views: {
        'tab-diary': {
          templateUrl: 'templates/tab-diary.html',
          controller: 'diaryCtrl'
        }
      }
    })
    
    //The sleep details view
    .state('tab.sleep-detail',  {
      url: '/diary/sleep/add',
      views: {
        'tab-diary' : {
          templateUrl: 'templates/sleep-detail.html',
          controller: 'SleepDetailCtrl'
        }
      }
    })
	
  //The sleep editing view
	.state('tab.sleep-edit',  {
      url: '/diary/sleep/edit',
      views: {
        'tab-diary' : {
          templateUrl: 'templates/sleep-edit.html',
          controller: 'SleepEditCtrl'
        }
      }
    })
	
  //The exercise add view
	.state('tab.exercise-add',  {
      url: '/diary/exercise/add',
      views: {
        'tab-diary' : {
          templateUrl: 'templates/exercise-add.html',
          controller: 'ExAddCtrl'
        }
      }
    })
	
  //The exercise edit view
	.state('tab.exercise-edit',  {
      url: '/diary/exercise/:exId',
      views: {
        'tab-diary' : {
          templateUrl: 'templates/exercise-edit.html',
          controller: 'ExerciseCtrl'
        }
      }
    })
	
  //The meal entry addition view
	.state('tab.meal-detail',  {
      url: '/diary/meal/add/:type',
      views: {
        'tab-diary' : {
          templateUrl: 'templates/meal-detail.html',
          controller: 'MealDetailCtrl'
        }
      }
    })
	
  //The meal entry editing view
	.state('tab.meal-edit',  {
      url: '/diary/meal/edit/:type',
      views: {
        'tab-diary' : {
          templateUrl: 'templates/meal-edit.html',
          controller: 'MealEditCtrl'
        }
      }
    })
	
  //The schedule tab
  .state('tab.schedule', {
      url: '/schedule',
      views: {
        'tab-schedule': {
          templateUrl: 'templates/tab-schedule.html',
          controller: 'scheduleCtrl'
        }
      }
    })
  //The schedule add view for a particular day  
  .state('tab.day-add', {
      url: '/schedule/:dayId',
      views: {
        'tab-schedule': {
          templateUrl: 'templates/day-add.html',
          controller: 'DayAddCtrl'
        }
      }
    })
  //The schedule edit view for a particular day
	.state('tab.shed-edit', {
      url: '/schedule/edit/:entryId',
      views: {
        'tab-schedule': {
          templateUrl: 'templates/sched-edit.html',
          controller: 'SchedEditCtrl'
        }
      }
    })

  //The stats tab
	.state('tab.stats', {
      url: '/stats',
      views: {
        'tab-stats': {
          templateUrl: 'templates/tab-stats.html',
          controller: 'statsCtrl'
        }
      }
    })
	
  //The mental test tab
  .state('tab.mentaltest', {
      url: '/mentaltest',
      views: {
        'tab-mentaltest': {
          templateUrl: 'templates/tab-mentaltest.html',
          controller: 'mentaltestCtrl'
        }
      }
    });

  // If none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/diary');

});

