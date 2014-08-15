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
