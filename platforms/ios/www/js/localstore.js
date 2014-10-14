angular.module('starter.localStore', [])

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