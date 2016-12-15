(function() {
    var app = angular
        .module("plmi", ["ngRoute", "firebase", "languages"])
        .config(ApplicationConfig)
        .controller("AuthCtrl", AuthenticationController)
        .controller("NewEntryCtrl", NewEntryController);

    // config

    function ApplicationConfig($routeProvider) {
        $routeProvider
            .when("/",
                    {
                        templateUrl: "plmi.html",
                        controller: NewEntryController
                    })
            .otherwise({ redirectTo: "/" });
    }

    // directives

    app.directive("authBar", function() {
        return {
            restrict: "E",
            templateUrl: "auth-bar.html",
            controller: "AuthCtrl as ctrl",
            controllerAs: "login"
        };
    });

    app.directive("newEntry", function() {
        return {
            restrict: "E",
            templateUrl: "new-entry.html",
            controller: "NewEntryCtrl as ctrl",
            controllerAs: "newentry"
        };
    });

    // factories

    app.factory("Auth", ["$firebaseAuth",
        function($firebaseAuth) {
            return $firebaseAuth();
        }
    ]);

    // controllers

    function AuthenticationController($scope, Auth) {
        $scope.auth = Auth;

        // sign the user in
        $scope.signIn = function() {
            $scope.firebaseUser = null;
            $scope.error = null;

            $scope.auth.$signInWithRedirect("google").then(function() {
                // never called because of page redirect
            }).catch(function(error) {
               console.error("Authentication failed:", error);
            });
        };

        // sign the user out
        $scope.signOut = function() {
            $scope.auth.$signOut();
        };

        // set user on authentication state change
        $scope.auth.$onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser) {
                $scope.firebaseUser = firebaseUser;
            } else {
                $scope.firebaseUser = null;
            }
        });
    }


    function NewEntryController($scope, $firebaseObject, $firebaseArray, langs) {
        $scope.options = langs;
        $scope.saveEntry = function() {
            var l10nEntryRef = firebase.database().ref("/l10n/" + $scope.lang + "/" + $scope.id);
            var l10nEntry = $firebaseObject(l10nEntryRef).$loaded().then(function(entry) {
                entry.innerHTML = $scope.innerHTML;
                entry.$save().then(function(ref) {
                    $("#pSubmissionStatus").html("Entry added.");
                }).catch(function(error) {
                    $("#pSubmissionStatus").html(error);
                });
            });
        };
    }

})();

/*$(document).ready(function() {
    var user = null;

    $("#loginButton").click(function() {
        $("#pSubmissionStatus").html("Logging in...");
        var form = $("#loginForm");
        if (form[0].checkValidity()) {
            signIn();
        } else {
            $("#pSubmissionStatus").html("Could not log in!");
        }
        return false;
    });

    $("#saveLang").click(function() {
        $("#pSubmissionStatus").html("Processing lang...");
        var form = $("#newLangForm");
        if (form[0].checkValidity()) {
            createNewLang($("#lang").val());
        } else {
            $("#pSubmissionStatus").html("Invalid input!");
        }
        return false;
    });

    $("#save").click(function() {
        $("#pSubmissionStatus").html("Processing...");
        var form = $("#newEntryForm");
        if (form[0].checkValidity()) {
            createNewEntry($("#id").val(),
                           $("#innerHTML").val());
        } else {
            $("#pSubmissionStatus").html("Invalid input!");
        }
        return false;
    });

    function signIn() {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function(result) {
          if (result.credential) {
            console.log("blah");
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
          }
          // The signed-in user info.
          user = result.user;
        }).catch(function(error) {
            console.log("err!!!!");
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
        });
        firebase.auth().onAuthStateChanged(function(firebaseUser) {
            console.log("Logged in.")
            $("#pSubmissionStatus").html("Logged in.");
        });
    }

    function createNewLang(lang) {
        // Get a key for the new entry
        //var newKey = firebase.database().ref().push().key;
        var langRef = firebase.database().ref("/langs/");
        langRef.child(lang).set(true).then(function() {
            $("#pSubmissionStatus").html("Added language.");
        }).catch(function(error){
            $("#pSubmissionStatus").html("Error!");
        });

    }

    function createNewEntry(id, innerHTML, source, sourceURL) {
        // Get a key for the new entry
        var newKey = firebase.database().ref().push().key;

        // Write the new entry data into the list
        var updates = {};
        updates["/" + newKey] = {
            "id": id,
            "innerHTML": innerHTML
        };

        firebase.database().ref().update(updates, function(error) {
            if (error) {
                $("#pSubmissionStatus").html("Error!");
            } else {
                $("#pSubmissionStatus").html("Done.");
            }
        });

    }
});*/
