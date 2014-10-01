angular.module('starter.services', [])

/** Local storage (persistent). For storing anything necessary.
 *  Basis: http://learn.ionicframework.com/formulas/localstorage/
 *  With modification to parse ISO8601 dates.
 */
.factory('$localStore', ['$window', function($window) {
  //Reviver, currently for ISO8601 dates in Zulu time
  var reviver = function(k, v) {
    if (typeof v === "string" && v.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.?\d*Z$/g)) {
      return moment(v);
    }
    return v;
  };
  
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      //Used instead of JSON.stringify to remove angular-internal values.
      $window.localStorage[key] = angular.toJson(value);
    },
    getObject: function(key, defaultStrValue, customReviver) {
      var rev = reviver;
      
      //Hook in a custom reviver, if provided.
      if (typeof customReviver === "function") {
        rev = function(k, v) {
          ret = reviver(k, v);
          return customReviver(k, ret);
        }
      }
      
      if (typeof defaultStrValue !== "undefined") {
        return JSON.parse($window.localStorage[key] || defaultStrValue, rev);
      }
      return JSON.parse($window.localStorage[key] || '{}', rev);
    }
  }
}])

.factory('api', function($rootScope, $http, $localStore, $ionicLoading, authService) {
  //var url = 'http://ftracker-jtanx.rhcloud.com/api';
  var url = 'http://192.168.0.145:8000/api';
  var initted = false;
  var token;
  var loggedIn = false;
  var toSubmit = $localStore.getObject('api_toSubmit', '[]');
  
  var serviceIds = {
    EXERCISE_SERVICE_ID : 1001,
  };
  //This is set in the .run function 
  var serviceCallbacks = {};
  
  var submittedDispatch = function(serviceID, cbParams) {
    if (serviceID in serviceCallbacks) {
      serviceCallbacks[serviceID](cbParams);
    }
  }
  
  return {
    loggedIn: function() {
      return loggedIn;
    },
    isInitted: function() {
      return initted;
    },
    
    getServiceIDs : function () {
      return serviceIds;
    },
    
    addServiceCallback: function(serviceID, callback) {
      serviceCallbacks[serviceID] = callback;
    },
    
    havePendingSubmissions: function () {
      return toSubmit.length > 0;
    },
    
    initialise: function() {
      //$ionicLoading.show({template : '<i class="icon ion-loading-c" style="font-size: 40px;"></i>'});
      
      var token = $localStore.get("AuthToken", "");
      if (token.length > 0) {
        $http.defaults.headers.common.Authorization = "Token " + token;
      }
      
      /*
      $http.get(url + '/surveys/').success(function (data) {
        initted = true;
        $ionicLoading.hide();
      }).error(function(data, status, headers, config) {
        console.log(status, headers);
        $ionicLoading.show({template : 'Failed to contact the server.'});
        $ionicLoading.hide();
      });
      */
      initted = true;
      //$ionicLoading.hide();
    },
    
    login: function(credentials) {
      $http.post(url + '-token-auth/', credentials).success(function (data, status, headers, config) {
        $http.defaults.headers.common.Authorization = "Token " + data.token;
        $localStore.set("AuthToken", data.token);
        loggedIn = true;
        //http://www.kdmooreconsulting.com/blogs/authentication-with-ionic-and-angular-js-in-a-cordovaphonegap-mobile-web-application/
        // Need to inform the http-auth-interceptor that
        // the user has logged in successfully.  To do this, we pass in a function that
        // will configure the request headers with the authorization token so
        // previously failed requests(aka with status == 401) will be resent with the
        // authorization token placed in the header
        authService.loginConfirmed(data, function(config) {  // Step 2 & 3
          config.headers.Authorization = "Token " + data.token;
          return config;
        });
      })
      .error(function (data, status, headers, config) {
        $rootScope.$broadcast('event:auth-login-failed', status);
      });
    },
    
    logout: function() {
      delete $http.defaults.headers.common.Authorization;
      $rootScope.$broadcast('event:auth-logout-complete');
      loggedIn = false;
    },
    
    loginCancelled: function() {
      authService.loginCancelled();
    },
    
    /** 
     * Submission to the server is asynchronous.
     * When it actually gets submitted, a return notification to the service is
     * needed.
     */
    storeSurvey: function(surveyId, serviceID, cbParams, created, responses) {
      var entry = {
        survey : surveyId,
        created : created, 
        responses : JSON.stringify(responses)
      };
      
      toSubmit.push({action : "add", serviceID : serviceID, cbParams : (cbParams || {}), entry : entry});
      $localStore.setObject('api_toSubmit', toSubmit);
      console.log(toSubmit);
    },
    
    /**
     * Submits ALL pending surveys to the server, if they haven't been sent yet.
     */
    submitPending: function() {
      $ionicLoading.show({template : '<i class="icon ion-loading-c" style="font-size: 40px;"></i>'});
      
      var f = function submitter() {
        if (toSubmit.length > 0) {
          var elem = toSubmit[0];
          var entry = elem.entry;
          var method = $http.post;
          if (elem.action === 'update') {
            method = $http.put;
          } else if (elem.action === 'delete') {
            method = $http.delete;
          }
          
          
          method(url + '/survey/', entry).success(function(data, status, headers, config) {
            toSubmit.shift();
            //console.log('succ', elem);
            //console.log(data.id);
            //Add the action taken
            elem.cbParams.action = elem.action;
            elem.cbParams.remoteId = data.id;
            
            //Call the callback now that we have a response from the server
            submittedDispatch(elem.serviceID, elem.cbParams);
            submitter();
          }).error(function(data, status, headers, config) {
            alert(url, status);
            if (status == 0) {
              $ionicLoading.show({template : "The server is offline. Please try syncing again later.", duration: 1000});
            } else if (status == 400) {
              $ionicLoading.show({template : "An error occurred.", duration: 1000});
              
              toSubmit.shift(); //Drop the crap data?
              console.log("Error", data);
            } else {
              $ionicLoading.hide();
            }
            
            $localStore.setObject('api_toSubmit', toSubmit);
          });
        } else {
          $localStore.setObject('api_toSubmit', toSubmit);
          $ionicLoading.hide();
        }
      };
      
      f();
    },
    
    getStats: function() {
      $http.get(url + "/surveys/");
    }
  };
})

/**
 * This sets the callbacks needed for each control that requires it.
 */
.run(function(api, Exercises) {
  var ids = api.getServiceIDs();
  api.addServiceCallback(ids.EXERCISE_SERVICE_ID, Exercises.submitCallback);
})

/**
 * A simple example service that returns some data.
 */
.factory('Days', function($localStore) {

  var days = [
    { id: 0, name: 'Sunday'}, { id: 1, name: 'Monday'}, { id: 2, name: 'Tuesday'},{ id: 3, name: 'Wednesday'}, 
	{ id: 4, name: 'Thursday'}, { id: 5, name: 'Friday'}, { id: 6, name: 'Saturday'},
  ];
  
  var types = [ 
	'Run', 'Cycle', 'Swim'
  ];
  
  var entries = $localStore.getObject('schedEntries', '[]');
	var idcount = $localStore.getObject('schedId', -1);
  return {
	types: function() {
      return types;
    },
    all: function() {
      return days;
    },
    get: function(dayId) {
      // Simple index lookup
      return days[dayId];
    },
	getex: function(entryId) {
      return entries[this.indexOf(entryId)];
	},
	indexOf: function(entryindex) {
		for(var i = 0; i < entries.length; i++){
		if(entries[i].id == entryindex)
			return i;
		}
	  return -1;
	},
	edit: function (id, type, time) {
		var index = this.indexOf(id);
		entries[index] = {id: id, name: type, day: entries[index].day, 
						time: time};
		$localStore.setObject('schedEntries', entries);
	},
	allentries: function() {
      return entries;
    },
	add: function(text, newday, time) {
		idcount++;
		$localStore.setObject('schedId', idcount);
      entries.push({id: idcount, name: text, day: newday, 
						time: time});
		$localStore.setObject('schedEntries', entries);
		//console.log(entries);
    },
	remove: function(id) {
		entries.splice(this.indexOf(id), 1);
		$localStore.setObject('schedEntries', entries);
    }
  }
})

.factory('Exercises', function($localStore, api) {
  var EXERCISE_SURVEY_ID = 3; //The server ID for this survey
  var EXERCISE_SERVICE_ID = 1001; //The local ID
  var exercises = $localStore.getObject('exercises', '[]');
  var types = [ 
	'Run', 'Cycle', 'Swim'
  ];
  var idcount = $localStore.getObject('exId', -1);
  
  //This is defined here, as this.indexOf may not work if the function is called from a callback.
  var indexOf = function(exerciseId) {
		for(var i = 0; i < exercises.length; i++){
		if(exercises[i].id == exerciseId)
			return i;
	  }
    return -1;
	};
  
  return {
	types: function() {
      return types;
    },
    all: function() {
      return exercises;
    },
	get: function(exId) {
      // Simple index lookup
      return exercises[indexOf(exId)];
    },
    
    submitCallback : function(cbParams) {
      console.log('SUBMITCALLBACK');
      console.log(cbParams);
      if (cbParams.action == 'add') {
        console.log(this);
        var cEnt = indexOf(cbParams.localId);
        if (cEnt >= 0) {
          exercises[cEnt].remoteId = cbParams.remoteId;
          console.log(exercises[cEnt].remoteId);
          console.log(exercises[cEnt])
          $localStore.setObject('exercises', exercises);
        }
      }
    },
	add: function(ex) {
		$localStore.setObject('exId', ++idcount);
    ex.id = idcount;
    ex.date = moment();
    exercises.push(ex);
    
    //surveyId, cbParams, created, responses
    api.storeSurvey(
      EXERCISE_SURVEY_ID, EXERCISE_SERVICE_ID, {localId : idcount}, 
      ex.date, [
      {number : 1, entry : ex.type},
      {number : 2, entry : ex.end.diff(ex.start, 'h')}, 
      {number : 3, entry : ex.distance},
      {number : 4, entry : ex.exertion}
    ]);
    api.submitPending();
		$localStore.setObject('exercises', exercises);
    },
	edit: function(id, ex) {
    ex.id = id;
    exercises[indexOf(id)] = ex;
		$localStore.setObject('exercises', exercises);
    },
	indexOf: indexOf,
	remove: function(id) {
		exercises.splice(indexOf(id), 1);
		$localStore.setObject('exercises', exercises);
    },
  }
})

.factory('List', function() {

  var things = [
    { name: 'Sunday' , day: 'Sunday'}, {name: 'Monday' , day: 'Tuesday'}
  ];

  return {
    all: function() {
      return things;
    },
	add: function(text) {
      things.push({name: text, day: 'Sunday'});
    }
	
  }
})

.factory('Save', function($localStore) {


  return {
	save: function() {
		$localStore.setObject('saved', true);
	},
	unsave: function() {
		$localStore.setObject('saved', false);
	},
	status: function() {
		return $localStore.getObject('saved', true);
	}
  }
})

.factory('Meals', function($localStore) {
  
  var meals = $localStore.getObject('meals', '[]');
  var types = [
	{name: 'Breakfast'}, {name: 'Lunch'}, {name: 'Dinner'}, {name: 'Other'}
  ];

  return {
	add: function(type, text) {
		meals.push({date: moment(), type: type, text: text});
		$localStore.setObject('meals', meals);
	},
	types: function() {
		return types;
	},
	get: function(type) {
		for(var i = meals.length-1;i>-1;i--){
			if(meals[i].type == type){return meals[i];}
		}
	},
	edit: function(type, text){
		this.get(type).text = text;
		$localStore.setObject('meals', meals);
	},
	today: function() {
		var todaymeals = [];
		var today = moment();
		for(var i = 0; i<meals.length;i++){
			if(meals[i].date.isSame(today, 'day')){
				todaymeals.push(meals[i]);
			};
		}
		return todaymeals;
	},
	remove: function(type) {
		for(var i = meals.length-1;i>-1;i--){
			if(meals[i].type == type){meals.splice(i,1)}
		}
		$localStore.setObject('meals', meals);
	}
  }
})

.factory('SleepEntries', function($localStore) {
  //Some fake data
  var entries = $localStore.getObject('sleepEntries', '[]');
  return {
    all: function() {
      return entries;
    },
    add: function(startdate, enddate, quality){
		entries.push({date:moment(), start:startdate, end:enddate, quality:quality});
		$localStore.setObject('sleepEntries', entries);
	},
	added: function(){
		for(var i = 0; i<entries.length;i++){
			if(entries[i].date.isSame(moment(), 'day')){return true;}
		}
		return false;
	},
	get: function(){
		return entries[entries.length-1];
	},
	diff: function(){
    var today = moment();
		for(var i = 0; i<entries.length;i++){
			if(entries[i].date.isSame(today, 'day')){
        return Math.round(entries[i].end.diff(entries[i].start, 'seconds') / 360) / 10
			}
		}
		return 0;
	},
	edit: function(startdate, enddate, quality){
	entries[entries.length-1] = {date:entries[entries.length-1].date, start:startdate, end:enddate, quality:quality};
	$localStore.setObject('sleepEntries', entries);
	},
	remove: function(){
		entries.splice(entries.length-1,1);
		$localStore.setObject('sleepEntries', entries);
	}
  }
})


.factory('Questions', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var questions = [
    { id: 1, name: 'Miserable'}, { id: 2, name: 'Unhappy'}, { id: 3, name: 'Bitter'}, { id: 4, name: 'Downhearted'}, 
	{ id: 5, name: 'Depressed'}, { id: 6, name: 'Energetic'}, { id: 7, name: 'Lively'}, { id: 8, name: 'Active'}, 
	{ id: 9, name: 'Alert'}, { id: 10, name: 'Muscle soreness'}, { id: 11, name: 'Heavy arms or legs'}, 
	{ id: 12, name: 'Stiff or sore joints'}, { id: 13, name: 'It was difficult to fall asleep'}, 
	{ id: 14, name: 'Your sleep was restless'}, { id: 15, name: 'Insomnia'}, { id: 16, name: 'Stressed'}, 
	{ id: 17, name: 'Like you could not cope'}, { id: 18, name: 'Difficulties piling up'}, { id: 19, name: 'Nervous'}, 
	{ id: 20, name: 'Tired'}, { id: 21, name: 'Sleepy'}, { id: 22, name: 'Worn-out'}    
  ];

  return {
    all: function() {
      return questions;
    },
    get: function(questionId) {
      // Simple index lookup
      return questions[questionId];
    }
  }
})

.factory('Answers', function($localStore, api) {
  var options = [
    { id: 1, name: 'Not at all'}, { id: 2, name: 'A little'}, 
	{ id: 3, name: 'Moderately'}, { id: 4, name: 'Quite a lot'}, 
	{ id: 5, name: 'Extremely'}
  ];

  var entries = [];//$localStore.getObject('mentalResponses', '[]');
  
  var answers = [];
  
  return {
    all: function() {
		return answers;
    },
    options: function() {
		return options;
    },
	answer: function(question, option) {
		answers[question-1] = option;
	},
	answered: function () {
		var count = 0;
		for(var answer in answers){
			count++
		};
		return count
	},
	submit: function () {
    var responses = []
    
    //Build the response list
    for (var i = 0; i < answers.length; i++) {
      responses.push({number : i + 1, entry : answers[i].toString()})
    }
    
    //surveyId, serviceID, cbParams, created, responses
    api.storeSurvey(1, -1, null, moment(), responses);
    api.submitPending();
    
    //The entry for today
    var entry = {
      created : moment(),
      responses : responses
    }
    //Add to the entry list
		entries.push(entry);
    
    //Todo: Push to the server...
    $localStore.setObject('mentalResponses', entries);
    //Clear the responses for the next survey
    answers = []; 
	},
	completed: function () {
		var d = moment();
    //console.log(entries);
		for(var i = 0; i < entries.length; i++){
			if(d.isSame(entries[i].created, 'day')) {
				return true;
			}
		}
		return false;
	}
  }
})

.factory('Settings', function($localStore, $window) {
    
	var firstname = '';
	var lastname = '';
	
    return {
      firstname: function() {
		var tempfirst = firstname;
        return tempfirst;
      },
      lastname: function() {
        var templast = lastname;
        return templast;
	},
	edit: function(first, last) {
        firstname = first;
		lastname = last;
	},
	restore: function(){
		$window.localStorage.clear();
	}
    };
});
