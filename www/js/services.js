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
