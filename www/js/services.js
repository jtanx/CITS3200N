angular.module('starter.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [
    { id: 0, name: 'Scruff McGruff', ph: '0412345678' },
    { id: 1, name: 'G.I. Joe', ph: '0818288880' },
    { id: 2, name: 'Miss Frizzle', ph: '0322134414' },
    { id: 3, name: 'Ash Ketchum', ph: '0414554332' }
  ];

  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
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
