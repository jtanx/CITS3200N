angular.module('starter.api', ['starter.localStore'])

.factory('api', function($rootScope, $http, $localStore, $ionicLoading, $filter, $q, authService) {
  //var url = 'http://ftracker-jtanx.rhcloud.com/api';
  //var url = 'http://cits3200n.csse.uwa.edu.au:8001/api';
  var url = 'http://localhost:8000/api';
  var initted = false;
  var initStatus = $q.defer();
  var loggedIn = false;
  var toSubmit = $localStore.getObject('api_toSubmit', '[]');
  
  //Callbacks are set in a services.js .run function 
  var serviceCallbacks = {};
  var submittedDispatch = function(serviceID, cbParams) {
    if (serviceID in serviceCallbacks) {
      serviceCallbacks[serviceID](cbParams);
    }
  }
  //For each survey, there can be one callback function registered.
  var syncCallbacks = {};
  
  /**
   * Retrieves all data stored on the server and calls the registered
   * sync functions for all services to update the locally stored data.
   */
  var syncFromServer = function () {
      //$ionicLoading.show({template : '<i class="icon ion-loading-c" style="font-size: 40px;"></i>'});
      
      return $http.get(url + '/survey/').success(
        function (data, status, headers, config) {
          console.log(data);
          for (var surveyID in syncCallbacks) {
            var filtered = $filter('filter')(data, {survey : surveyID});
            if (filtered) {
              syncCallbacks[surveyID](filtered);
            }
          }
          
          $rootScope.$broadcast('event:api-synced', status);
          //$ionicLoading.hide();
        }
      ).error(
        function (data, status, headers, config) {
          //WHAT NOW?
          console.log("Sync failed");
          if (status == 0) {
            $ionicLoading.show({template : "The server is offline. Please try syncing again later.", duration: 1000});
          } else if (status == 403) {
            //FORBIDDEN/NOT LOGGED IN
          } else {
            $ionicLoading.show({template : "Could not sync with the server. Please try again later.", duration: 1000});
          }
          //$ionicLoading.hide();
        }
      ).finally(function() {
          // Stop any ion-refresher from spinning
          $rootScope.$broadcast('scroll.refreshComplete');
        }
      );
    };
    
    /**
     * Submits all pending surveys to the server.
     * @return A promise. On success, all pending surveys will have been
     *         submitted, otherwise on error, there may still be some surveys
     *         that are pending submission.
     */
    var submitPending = function() {
      var deferred = $q.defer();
      //$ionicLoading.show({template : '<i class="icon ion-loading-c" style="font-size: 40px;"></i>'});
      
      var subber = function submitter() {
        if (toSubmit.length > 0) {
          var ent = toSubmit[0];
          var method, sub, iurl;
          
          if (ent.action == 'add') {
            iurl = "/survey/";
            method = $http.post;
            sub = {
              survey : ent.survey_id,
              created : ent.created,
              responses : angular.toJson(ent.responses)
            };
          } else if (ent.action == 'update') {
            iurl = "/survey/" + ent.remote_id.toString() + "/";
            method = $http.put;
            sub = {
              survey : ent.survey_id,
              created : ent.created,
              responses : angular.toJson(ent.responses)
            };
          } else if (ent.action == 'delete') {
            iurl = "/survey/" + ent.remote_id.toString() + "/";
            method = $http.delete;
            sub = {};
          }
          
          method(url + iurl, sub).success(
            function(data, status, headers, config) {
              //Remove from the submission queue.
              toSubmit.shift();
              //Add in the action taken and the remote id of the object, if applicable.
              if (typeof ent.cb_params === "undefined") {
                ent.cb_params = {};
              }
              ent.cb_params.action = ent.action;
              ent.cb_params.object_id = ent.object_id;
              if (ent.action === 'add' || ent.action === 'update') {
                ent.cb_params.remote_id = data.id;
              }
              
              //Call the callback now that we have a response from the server
              submittedDispatch(ent.service_id, ent.cb_params);
              //Recursively call until the queue is empty.
              submitter();
          }).error(
            function(data, status, headers, config) {
              if (status == 0) { //Likely offline
                $ionicLoading.show({template : "The server is offline. Please try syncing again later.", duration: 1000});
                deferred.reject("The server is offline.");
              } else if (status == 400) { //Invalid submission to server.
                $ionicLoading.show({template : "An error occurred.", duration: 1000});
                
                console.log("Error", data);
                toSubmit.shift(); //Drop the crap data?
                submitter(); //Soldier on?
                //deferred.reject("An error occurred (the submission was rejected");
              } else { //Likely they need to login
                deferred.reject();
                $ionicLoading.hide();
              }
              
              $localStore.setObject('api_toSubmit', toSubmit);
          });
        } else {
          $localStore.setObject('api_toSubmit', toSubmit);
          //$ionicLoading.hide();
          deferred.resolve("Submission completed.")
        }
      };
      
      subber();
      return deferred.promise;
    };
    
    var syncAll = function() {
      submitPending().then(syncFromServer);
    };
  
  return {
    loggedIn: function() {
      return loggedIn;
    },
    onInitted: function() {
      return initStatus.promise;
    },
    
    addServiceCallback: function(serviceID, callback) {
      serviceCallbacks[serviceID] = callback;
    },
    
    addSyncCallback: function(surveyID, callback) {
      syncCallbacks[surveyID] = callback;
    },
    
    hasPendingSubmissions: function () {
      return toSubmit.length > 0;
    },
    
    submitPending : submitPending,
    syncFromServer: syncFromServer,
    syncAll: syncAll,
    
    initialise: function() {
      if (!initted) {
        var token = $localStore.get("AuthToken", "");
        if (token.length > 0) {
          $http.defaults.headers.common.Authorization = "Token " + token;
          loggedIn = true;
        }
        
        initted = true;
        submitPending().then(syncFromServer().then(function () {
          $rootScope.$broadcast('event:api-initialised');
        })).finally(function () {
          initStatus.resolve("We are initted");
        });
      }
    },
    
    //Basis:
    //http://www.kdmooreconsulting.com/blogs/authentication-with-ionic-and-angular-js-in-a-cordovaphonegap-mobile-web-application/
    login: function(credentials) {
      //Clear any stale token, if present
      delete $http.defaults.headers.common.Authorization;
      $localStore.set("AuthToken", "");
      loggedIn = false;
      
      var syncAll = this.syncAll;
      $http.post(url + '-token-auth/', credentials).success(
        function (data, status, headers, config) {
          $http.defaults.headers.common.Authorization = "Token " + data.token;
          $localStore.set("AuthToken", data.token);
          loggedIn = true;
          
          //Inform auth service that we have succeeded
          authService.loginConfirmed(data, function(config) {
            config.headers.Authorization = "Token " + data.token;
            return config;
          });

          syncAll();
      })
      .error(function (data, status, headers, config) {
        $rootScope.$broadcast('event:auth-login-failed', status);
      });
    },
    
    logout: function() {
      delete $http.defaults.headers.common.Authorization;
      $localStore.set("AuthToken", "");
      loggedIn = false;
      $rootScope.$broadcast('event:auth-logout-complete');
    },
    
    loginCancelled: function() {
      authService.loginCancelled();
    },
    
    /**
     * Submission to the server is asynchronous.
     * When it actually gets submitted, a return notification to the service is
     * needed.
      params = {
        survey_id : The server side ID of the survey to be submitted,
        service_id : The local ID of the submitting service,
        object_id : The unique local ID of the submitted response 
        created : When the response was created.
        responses : A list of responses, in [{number : q, entry : "d"}, ...]
                    format, where q is the question number, and entry is the
                    response to that question (must be a string).
        cb_params : Any custom callback paramters to be passed to the registered
                    callback function when a response to a submission is received
                    from the server.
      }
    */
    storeSurvey: function(params) {
      params.action = 'add';
      toSubmit.push(params);
      $localStore.setObject('api_toSubmit', toSubmit);
    },
    
    editSurvey : function (params) {
      params.action = 'update';
      var updated = false;
      for (var i = 0; i < toSubmit.length; i++) {
        var ent = toSubmit[i];
        if (ent.survey_id === params.survey_id && ent.object_id === params.object_id) {
          console.log("Replacing entry", i, "in submission queue", ent, params);
          ent.created = params.created;
          ent.responses = params.responses;
          ent.service_id = params.service_id;
          ent.cb_params = params.cb_params;
          updated = true;
        }
      }
      
      if (!updated && ('remote_id' in params)) {
        toSubmit.push(params);
      }
      $localStore.setObject('api_toSubmit', toSubmit);
    },
    
    /**
     * Mostly the same as for storeSurvey, where applicable. Also has remote_id,
     * if it is already known that it exists on the server.
     */
    deleteSurvey : function (params) {
      params.action = 'delete';
      for (var i = 0; i < toSubmit.length; i++) {
        var ent = toSubmit[i];
        if (ent.survey_id === params.survey_id && ent.object_id === params.object_id) {
          toSubmit.splice(i--, 1);
        }
      }
      
      if ('remote_id' in params) {
        toSubmit.push(params);
      }
      
      $localStore.setObject('api_toSubmit', toSubmit);
    },
    
    getStats: function(continuation) {
      return $http.get(url + "/info/").success(function (data, status, headers, config) {
        continuation({run : data.weekly_run, cycle : data.weekly_cycle, swim : data.weekly_swim});
      });
    }
  };
})