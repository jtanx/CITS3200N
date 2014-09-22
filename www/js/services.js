angular.module('starter.services', [])

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
      // Simple index lookup
      return entries[entryId];
	  
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
		entries.splice(id, 1);
		for(var i = id; id < entries.length; i++){
			entries[i].id = i;
		}
		idcount--;
    }
  }
})

.factory('Exercises', function() {

  var exercises = [
  ];
  
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
      return exercises[exId];
    },
	add: function(type, start, end, distance, exertion) {
		idcount++;
      exercises.push({id: idcount, date: new Date(), type: type, 
			start : start, end : end, distance : distance, exertion : exertion});
			console.log(exercises[idcount]);
    },
	remove: function(id) {
		exercises.splice(id, 1);
		for(var i = id; i < exercises.length; i++){
			exercises[i].id = i;
		}
		idcount--;
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


.factory('Meals', function() {
  
	var meals = [];
  
  var types = [
	{name: 'Breakfast'}, {name: 'Lunch'}, {name: 'Dinner'}, {name: 'Other'}
  ];

  return {
	today: function(day) {
	var todaymeals = [];
      for (var i = 0; i < meals.length; i++) {
        if (meals[i].date.getDate() == day.getDate())
          todaymeals.push(meals[i]);
      }
	  return todaymeals;
	},
	types: function() {
		return types;
	},
	get: function(day, type) {
      for (var i = 0; i < meals.length; i++) {
        if (meals[i].date.getDate() == day.getDate() && meals[i].type == type)
          return meals[i];
        console.log("No entry found for this date.");
      }
	  meals.push({date: new Date(), type: type, text: ''});
	  return meals[meals.length-1];
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
    get: function(day) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].date.getDate() == day.getDate())
          return entries[i];
        console.log("No entry found for this date.");
      }
	  entries.push({date : new Date(), quality : '', start : new Date(2014,9,20,0,0,0,0), end : new Date(2014,9,20,0,0,0,0)});
    },
	diff: function(day) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].date.getDate() == day.getDate()){
			return Math.floor((entries[i].end - entries[i].start) / 1800000) / 2;
		}
        console.log("No entry found for this date.");
      }
	  return entries.length;
	  
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

.factory('Answers', function() {
  var options = [
    { id: 1, name: 'Not at all'}, { id: 2, name: 'A little'}, 
	{ id: 3, name: 'Moderately'}, { id: 4, name: 'Quite a lot'}, 
	{ id: 5, name: 'Extremely'}
  ];

  var days = [];
  
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
	submit: function () {
		if(answers.length == 22) {
		days.push(new Date());
		console.log(answers);
		}
	},
	completed: function () {
		var d = new Date();
		for(var i = 0; i < days.length; i++){
			if(d.getDate() == days[i].getDate() ) {
				return true;
			}
		}
		return false;
	}
  }
})

.factory('SurveyOne', function() {
    var surveyItems = [
        { id: 0, value: 0, text: "Item 1"},
        { id: 1, value: 0, text: "Item 2"},
        { id: 2, value: 0, text: "Item 3"},
        { id: 3, value: 0, text: "Item 4"}
    ];
    
    return {
      all: function() {
        return surveyItems;
      },
      get: function(itemId) {
        return surveyItems[itemId];
      }
    };
});
