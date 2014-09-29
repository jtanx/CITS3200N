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
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key, defaultStrValue) {
      if (typeof defaultStrValue !== "undefined") {
        return JSON.parse($window.localStorage[key] || defaultStrValue, reviver);
      }
      return JSON.parse($window.localStorage[key] || '{}', reviver);
    }
  }
}])

.factory('api', function($rootScope, $http, authService) {
  var url = 'http://localhost:8000/api';
  var initted = false;
  var token;
  
  return {
    isInitted: function() {
      return initted;
    },
    login: function(credentials) {
      $http.post(url + '-token-auth/', credentials).success(function (data, status, headers, config) {
        $http.defaults.headers.common.Authorization = "Token " + data.token;
        
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
    },
    
    loginCancelled: function() {
      authService.loginCancelled();
    },
    
    submitSurvey: function(surveyId, responses) {
      
    },
    
    submitSleep: function(details) {
    
    },
    
    
    getStats: function() {
      $http.get(url + "/surveys/");
    }
  };
})

/**
 * A simple example service that returns some data.
 */
.factory('Days', function() {

  var days = [
    { id: 0, name: 'Sunday'}, { id: 1, name: 'Monday'}, { id: 2, name: 'Tuesday'},{ id: 3, name: 'Wednsday'}, 
	{ id: 4, name: 'Thursday'}, { id: 5, name: 'Friday'}, { id: 6, name: 'Saturday'},
  ];
  
  var types = [ 
	{name:'Run'} , {name:'Cycle'} , {name:'Swim'}
  ];
  
  var entries = [];
  
  var idcount = -1;

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
	},
	allentries: function() {
      return entries;
    },
	add: function(text, newday, time) {
		idcount++;
      entries.push({id: idcount, name: text, day: newday, 
						time: time});
    },
	remove: function(id) {
		entries.splice(this.indexOf(id), 1);
    }
  }
})

.factory('Exercises', function() {

  var exercises = [];
  
  var types = [ 
	'Run', 'Cycle', 'Swim'
  ];
  
  var idcount = -1;

  return {
	types: function() {
      return types;
    },
    all: function() {
      return exercises;
    },
	get: function(exId) {
      // Simple index lookup
      return exercises[this.indexOf(exId)];
    },
	add: function(type, start, end, distance, exertion) {
		idcount++;
      exercises.push({id: idcount, date: moment(), type: type, 
			start : start, end : end, distance : distance, exertion : exertion});
    },
	edit: function(id, type, start, end, distance, exertion) {
      exercises[this.indexOf(id)] = ({id: id, date: exercises[this.indexOf(id)].date, type: type, 
			start : start, end : end, distance : distance, exertion : exertion});
    },
	indexOf: function(exerciseId) {
		for(var i = 0; i < exercises.length; i++){
		if(exercises[i].id == exerciseId)
			return i;
	  }
	},
	remove: function(id) {
		exercises.splice(this.indexOf(id), 1);
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

.factory('Save', function() {
  
	var saved = true;
  
  return {
	save: function() {
		saved = true;
	},
	unsave: function() {
		saved = false;
	},
	status: function() {
		return saved;
	}
  }
})

.factory('Meals', function() {
  
	var meals = [];
  
  var types = [
	{name: 'Breakfast'}, {name: 'Lunch'}, {name: 'Dinner'}, {name: 'Other'}
  ];

  return {
	add: function(type, text) {
		meals.push({date: moment(), type: type, text: text});
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
	}
  }
})

.factory('SleepEntries', function() {
  //Some fake data
  var entries = [];
  
  return {
    all: function() {
      return entries;
    },
    add: function(startdate, enddate, quality){
		entries.push({date:moment(), start:startdate, end:enddate, quality:quality});
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
        return entries[i].end.diff(entries[i].start, 'hours')
			}
		}
		return 0;
	},
	edit: function(startdate, enddate, quality){
	entries[entries.length-1] = {date:entries[entries.length-1].date, start:startdate, end:enddate, quality:quality};
	},
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

.factory('Answers', function($localStore) {
  var options = [
    { id: 1, name: 'Not at all'}, { id: 2, name: 'A little'}, 
	{ id: 3, name: 'Moderately'}, { id: 4, name: 'Quite a lot'}, 
	{ id: 5, name: 'Extremely'}
  ];

  var entries = $localStore.getObject('mentalResponses', '[]');
  
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
    console.log(entries);
		for(var i = 0; i < entries.length; i++){
			if(d.isSame(entries[i].created, 'day')) {
				return true;
			}
		}
		return false;
	}
  }
})

.factory('Settings', function() {
    
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
	}
    };
});
