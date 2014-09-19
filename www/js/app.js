// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

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
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.goals', {
      url: '/goals',
      views: {
        'tab-goals': {
          templateUrl: 'templates/tab-goals.html',
          controller: 'goalsCtrl'
        }
      }
    })

	 .state('tab.diary', {
      url: '/diary',
      views: {
        'tab-diary': {
          templateUrl: 'templates/tab-diary.html',
          controller: 'diaryCtrl'
        }
      }
    })
    
    .state('tab.sleep-detail',  {
      url: '/diary/sleep/:date',
      views: {
        'tab-diary' : {
          templateUrl: 'templates/sleep-detail.html',
          controller: 'SleepDetailCtrl'
        }
      }
    })
	
    .state('tab.schedule', {
      url: '/schedule',
      views: {
        'tab-schedule': {
          templateUrl: 'templates/tab-schedule.html',
          controller: 'scheduleCtrl'
        }
      }
    })
    .state('tab.day-add', {
      url: '/schedule/:dayId',
      views: {
        'tab-schedule': {
          templateUrl: 'templates/day-add.html',
          controller: 'DayAddCtrl'
        }
      }
    })
	.state('tab.shed-edit', {
      url: '/schedule/edit/:entryId',
      views: {
        'tab-schedule': {
          templateUrl: 'templates/sched-edit.html',
          controller: 'SchedEditCtrl'
        }
      }
    })

   
	.state('tab.stats', {
      url: '/stats',
      views: {
        'tab-stats': {
          templateUrl: 'templates/tab-stats.html',
          controller: 'statsCtrl'
        }
      }
    })
	
    .state('tab.mentaltest', {
      url: '/mentaltest',
      views: {
        'tab-mentaltest': {
          templateUrl: 'templates/tab-mentaltest.html',
          controller: 'mentaltestCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/goals');

});

