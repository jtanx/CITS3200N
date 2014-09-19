angular.module('starter.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Days', function() {

  var days = [
    { id: 0, name: 'Sunday'}, { id: 1, name: 'Monday'}, { id: 2, name: 'Tuesday'},{ id: 3, name: 'Wednsday'}, 
	{ id: 4, name: 'Thursday'}, { id: 5, name: 'Friday'}, { id: 6, name: 'Saturday'},
  ];
  
  var entries = [
    { id: 0, name: 'run' , day: 'Sunday'}, {id: 1, name: 'run' , day: 'Tuesday'}
  ];
  
  var idcount = 1;

  return {
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
	add: function(text, newday) {
		idcount++;
      entries.push({id: idcount, name: text, day: newday});
    },
	remove: function(id) {
		entries.splice(id, 1);
		for(var i = id+1; i<entries.length ; i++)
		{
			entries[i].id = i-1;
		}
		idcount--;
    },
	edit: function(id, text) {
		var day = entries[id].day;
      entries[id] = {id: id, name: text, day: day}
    }
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


.factory('SleepEntries', function() {
  //Some fake data
  var entries = [
    {date : new Date(2014,9,16), hours : 4, quality : 2},
    {date : new Date(), hours : 1, quality : 0, start : new Date(), end : new Date()} //This entry will always be present
  ];
  
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
  var answers = [
    { id: 1, name: 'Not at all'}, { id: 2, name: 'A little'}, 
	{ id: 3, name: 'Moderately'}, { id: 4, name: 'Quite a lot'}, 
	{ id: 5, name: 'Extremely'}
  ];

  return {
    all: function() {
      return answers;
    }
  }
})

.factory('MTDSSurvey', function() {
    var surveyItems = [
        "Miserable", "Unhappy", "Bitter", "Downhearted", "Depressed",
        "Energetic", "Lively", "Active", "Alert", "Muscle soreness",
        "Heavy arms or legs", "Stiff or sore joints", "It was difficult to fall asleep",
        "Your sleep was restless", "Insomnia", "Stressed", "Like you could not cope",
        "Difficulties piling up", "Nervous", "Tired", "Sleepy", "Worn-out"
    ];
    
    return {
        all: function() {
            return surveyItems;
        },
        newSurvey: function() {
            var ret = [];
            surveyItems.forEach(function(entry, index) {
                ret.push({id: index, value: 0, text: entry});
            });
            return ret;
        }
    };
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
