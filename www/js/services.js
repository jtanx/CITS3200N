var surveyIDs = {
  MTDS : 1,
  SLEEP : 2,
  EXERCISE : 3,
  MEAL : 4
};

//Service IDS
var serviceIDs = {
  MTDS : 1001,
  SLEEP : 1002,
  EXERCISE : 1003,
  MEAL : 1004
};

/**
 * All services that interact directly with the controllers.
 */
angular.module('starter.services', ['starter.localStore', 'starter.api'])
/**
 * This sets the api callbacks needed for each control that requires it.
 * This callback is called for when a result is received from the server.
 */
.run(function(api, MentalSurvey, SleepEntries, Exercises, Meals) {
  api.addServiceCallback(serviceIDs.SLEEP, SleepEntries.submitCallback);
  api.addServiceCallback(serviceIDs.EXERCISE, Exercises.submitCallback);
  api.addServiceCallback(serviceIDs.MEAL, Meals.submitCallback);
  
  api.addSyncCallback(surveyIDs.MTDS, MentalSurvey.syncCallback);
  api.addSyncCallback(surveyIDs.SLEEP, SleepEntries.syncCallback);
  api.addSyncCallback(surveyIDs.EXERCISE, Exercises.syncCallback);
  api.addSyncCallback(surveyIDs.MEAL, Meals.syncCallback);
})

/**
 * A service for the scheduler.
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
    indexOf: indexOf,
    
    submitCallback : function(cbParams) {
      console.log('SUBMITCALLBACK');
      console.log(cbParams);
      if (cbParams.action == 'add') {
        console.log(this);
        var cEnt = indexOf(cbParams.object_id);
        console.log(cbParams.object_id, cEnt);
        if (cEnt >= 0) {
          exercises[cEnt].remote_id = cbParams.remote_id;
          console.log(exercises[cEnt].remote_id);
          console.log(exercises[cEnt])
          $localStore.setObject('exercises', exercises);
        }
      }
    },
    
    syncCallback : function (remoteList) {
      var nEnts = [];
      var nId = 0;
      
      for (var i = 0; i < remoteList.length; i++) {
        var rEnt = remoteList[i];
        if (rEnt.responses && rEnt.responses.length == 5) {
          //NB This assumes that responses are ordered by number.
          var ent = {
            remote_id : rEnt.id,
            id : nId++,
            date : moment(rEnt.created),
            type : rEnt.responses[0].entry,
            start : moment(rEnt.responses[1].entry),
            end : moment(rEnt.responses[2].entry),
            distance : parseInt(rEnt.responses[3].entry),
            exertion : parseInt(rEnt.responses[4].entry),
          };
          
          nEnts.push(ent);
        }
      }

      exercises = nEnts;
      idcount = nId;
      $localStore.setObject('exId', nId);
      $localStore.setObject('exercises', nEnts);
    },
    
    add: function(ex) {
      $localStore.setObject('exId', ++idcount);
      ex.id = idcount;
      ex.date = moment();
      exercises.push(ex);
      $localStore.setObject('exercises', exercises);
      
      var sub = {
        survey_id : surveyIDs.EXERCISE,
        service_id : serviceIDs.EXERCISE,
        object_id : ex.id,
        created : ex.date,
        responses : [
          {number : 1, entry : ex.type},
          {number : 2, entry : ex.start},
          {number : 3, entry : ex.end}, 
          {number : 4, entry : ex.distance},
          {number : 5, entry : ex.exertion}
        ]      
      };
      
      api.storeSurvey(sub);
      api.submitPending();
    },
    edit: function(id, ex) {
      ex.id = parseInt(id, 10); //May be a string
      exercises[indexOf(id)] = ex;
      $localStore.setObject('exercises', exercises);
      
      var sub = {
        survey_id : surveyIDs.EXERCISE,
        service_id : serviceIDs.EXERCISE,
        object_id : ex.id,
        created : ex.date,
        responses : [
          {number : 1, entry : ex.type},
          {number : 2, entry : ex.start},
          {number : 3, entry : ex.end}, 
          {number : 4, entry : ex.distance},
          {number : 5, entry : ex.exertion}
        ]      
      };
      
      if ('remote_id' in ex) {
        sub.remote_id = ex.remote_id;
      }
      
      api.editSurvey(sub);
      api.submitPending();
    },
    remove: function(id) {
      var ent = exercises.splice(indexOf(id), 1)[0];
      $localStore.setObject('exercises', exercises);
      
      var sub = {
        survey_id : surveyIDs.EXERCISE,
        service_id : serviceIDs.EXERCISE,
        object_id : parseInt(id, 10)
      };
      
      if ('remote_id' in ent) {
        sub.remote_id = ent.remote_id;
      }
      api.deleteSurvey(sub);
      api.submitPending();
    },
  }
})

.factory('Meals', function($localStore, api) {
  var meals = $localStore.getObject('meals', '{}');
  var types = [
    'Breakfast', 'Lunch', 'Dinner', 'Other'
  ];
  
  var id = function(date, type) {
    return date.format("DD-MM-YYYY") + "-" + type;
  };

  return {
  submitCallback : function(cbParams) {
    console.log('MEALCALLBACK');
      console.log(cbParams);
      if (cbParams.action == 'add') {
        if (cbParams.object_id in meals) {
          meals[cbParams.object_id].remote_id = cbParams.remote_id;
          $localStore.setObject('meals', meals);
        }
      }
  },
  syncCallback : function (remoteList) {
    var nEnts = {};
    for (var i = 0; i < remoteList.length; i++) {
      var rEnt = remoteList[i];
      if (rEnt.responses && rEnt.responses.length == 2) {
        //NB This assumes that responses are ordered by number.
        var ent = {
          remote_id : rEnt.id,
          date : moment(rEnt.created),
          type : rEnt.responses[0].entry,
          text : rEnt.responses[1].entry
        };
        
        nEnts[id(ent.date, ent.type)] = ent;
      }
    }
    
    meals = nEnts;
    $localStore.setObject('meals', meals);
  },
  
  add: function(type, text) {
    var ent = {
      date : moment(),
      type : type,
      text : text
    };
    
    var entId = id(ent.date, ent.type);
    meals[entId] = ent;
    $localStore.setObject('meals', meals);
    
    var sub = {
      survey_id : surveyIDs.MEAL,
      service_id : serviceIDs.MEAL,
      object_id : entId, //Unique by day and type
      created : ent.date,
      responses : [
        {number : 1, entry : ent.type}, 
        {number : 2, entry : ent.text}
      ]     
    };
    
    api.storeSurvey(sub);
    api.submitPending();
  },
	types: function() {
		return types;
	},
	get: function(type) {
    var entId = id(moment(), type);
    if (entId in meals) {
      return meals[entId];
    }
	},
	edit: function(type, text){
    var ent = this.get(type);
		ent.text = text;
		$localStore.setObject('meals', meals);
    
    var sub = {
      survey_id : surveyIDs.MEAL,
      service_id : serviceIDs.MEAL,
      object_id : id(moment(), ent.type), //Unique by day and type
      created : ent.date,
      responses : [
        {number : 1, entry : ent.type},
        {number : 2, entry : ent.text}, 
      ]     
    };
    
    if ('remote_id' in ent) {
      sub.remote_id = ent.remote_id;
    }
    
    api.editSurvey(sub);
    api.submitPending();
	},
	today: function() {
		var todaymeals = [];
		var today = moment();
    for (var i = 0; i < types.length; i++) {
      var entId = id(today, types[i]);
      if (entId in meals) {
        todaymeals.push(meals[entId]);
      }
    }
		return todaymeals;
	},
	remove: function(type) {
    var entId = id(moment(), type);
    if (entId in meals) {
      var ent = meals[entId];
      delete meals[entId];
      $localStore.setObject('meals', meals);
      
      var sub = {
        survey_id : surveyIDs.MEAL,
        service_id : serviceIDs.MEAL,
        object_id : entId
      };
      
      if ('remote_id' in ent) {
        sub.remote_id = ent.remote_id;
      }
      api.deleteSurvey(sub);
      api.submitPending();
    }
	}
  }
})

.factory('SleepEntries', function($localStore, api) {
  var entries = $localStore.getObject('sleepEntries', '{}');
  var id = function(date) {
    return date.format("DD-MM-YYYY");
  };
  
  return {
    all: function() { //Currently unused
      var entlist = []
      for (var k in entries) {
        entlist.push(entries[k]);
      }
      return entlist;
    },
    id : id,
    
    submitCallback : function (cbParams) {
      console.log('SLEEPCALLBACK');
      console.log(cbParams);
      if (cbParams.action == 'add') {
        if (cbParams.object_id in entries) {
          entries[cbParams.object_id].remote_id = cbParams.remote_id;
          $localStore.setObject('sleepEntries', entries);
        }
      }
    },
    
    syncCallback : function (remoteList) {
      var nEnts = {};
      for (var i = 0; i < remoteList.length; i++) {
        var rEnt = remoteList[i];
        if (rEnt.responses && rEnt.responses.length == 3) {
          //NB This assumes that responses are ordered by number.
          var ent = {
            remote_id : rEnt.id,
            date : moment(rEnt.created),
            start : moment(rEnt.responses[0].entry),
            end : moment(rEnt.responses[1].entry),
            quality : rEnt.responses[2].entry
          };
          
          nEnts[id(ent.date)] = ent;
        }
      }
      
      entries = nEnts;
      $localStore.setObject('sleepEntries', entries);
      console.log(entries);
    },
    
    add: function(startdate, enddate, quality){
      var ent = {
        date : moment(),
        start : startdate,
        end : enddate,
        quality : quality
      };
      entries[id(ent.date)] = ent;
      $localStore.setObject('sleepEntries', entries);
      
      var sub = {
        survey_id : surveyIDs.SLEEP,
        service_id : serviceIDs.SLEEP,
        object_id : id(ent.date), //Unique by day
        created : ent.date,
        responses : [
          {number : 1, entry : ent.start},
          {number : 2, entry : ent.end},
          {number : 3, entry : ent.quality}, 
        ]      
      };
      
      api.storeSurvey(sub);
      api.submitPending();
    },
	added: function(){
    return id(moment()) in entries;
	},
	get: function(){
		return entries[id(moment())];
	},
	diff: function(){
    var today = id(moment());
    
    if (today in entries) {
      var ent = entries[today];
      //Get the time period in hours, rounded to 1 decimal place.
      return Math.round(ent.end.diff(ent.start, 'seconds') / 360) / 10;
    }
		return 0;
	},
  edit: function(startdate, enddate, quality){
    var today = id(moment());
    var ent = entries[today];
    ent.start   = startdate;
    ent.end     = enddate;
    ent.quality = quality;
    $localStore.setObject('sleepEntries', entries);
    
    var sub = {
        survey_id : surveyIDs.SLEEP,
        service_id : serviceIDs.SLEEP,
        object_id : id(ent.date), //Unique by day
        created : ent.date,
        responses : [
          {number : 1, entry : ent.start},
          {number : 2, entry : ent.end},
          {number : 3, entry : ent.quality}, 
        ]      
    };
    
    if ('remote_id' in ent) {
      sub.remote_id = ent.remote_id;
    }
    
    api.editSurvey(sub);
    api.submitPending();
  },
	remove: function(){
    var today = id(moment());
		var ent = entries[today];
    delete entries[today];
		$localStore.setObject('sleepEntries', entries);
    
    var sub = {
        survey_id : surveyIDs.SLEEP,
        service_id : serviceIDs.SLEEP,
        object_id : today
    };
      
    if ('remote_id' in ent) {
      sub.remote_id = ent.remote_id;
    }
    api.deleteSurvey(sub);
    api.submitPending();
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

.factory('MentalSurvey', function($localStore, api) {
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
  
  syncCallback : function (remoteList) {
    var nEnts = [];
      for (var i = 0; i < remoteList.length; i++) { 
        nEnts.push(moment(remoteList[i].created));
      }

      entries = nEnts;
      $localStore.setObject('mentalResponses', nEnts);
    },
  
	submit: function () {
    var date = moment();
    var responses = [];
    
    //Build the response list
    for (var i = 0; i < answers.length; i++) {
      responses.push({number : i + 1, entry : answers[i].toString()})
    }
    
    //Add to the entry list
		entries.push(date);
    $localStore.setObject('mentalResponses', entries);
    
    //Push to server when available
    var sub = {
        survey_id : surveyIDs.MTDS,
        service_id : serviceIDs.MTDS,
        created : date,
        responses : responses
    };
    
    //surveyId, serviceID, cbParams, created, responses
    api.storeSurvey(sub);
    api.submitPending();
    
    //Clear the responses for the next survey
    answers = []; 
	},
	completed: function () {
		var d = moment();
    //console.log(entries);
		for(var i = 0; i < entries.length; i++){
			if(d.isSame(entries[i], 'day')) {
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
	
	var pics = [
		'Stats', 'Settings', 'Schedule- Filled', 'Mental Test', 'Login', 'Edit exercise', 
		'Diary', 'Diary- Updated', 'Diary- Refresh', 'Add exercise'
  ];
	
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
	reset: function(){
		$window.localStorage.clear();
	},
	pics: function(){
		return pics;
	}
    };
});
