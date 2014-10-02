angular.module('starter.api', ['starter.localStore'])

.factory('api', function($rootScope, $http, $localStore, $ionicLoading, authService) {
  //var url = 'http://ftracker-jtanx.rhcloud.com/api';
  //var url = 'http://cits3200n.csse.uwa.edu.au:8001';
  var url = 'http://localhost:8000/api';
  var initted = false;
  var loggedIn = false;
  var toSubmit = $localStore.getObject('api_toSubmit', '[]');
  
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
        loggedIn = true;
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
      $localStore.set("AuthToken", "");
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