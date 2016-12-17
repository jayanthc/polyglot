(function() {
    var app = angular
        .module("plmi", ["ngRoute", "firebase"])
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


    function NewEntryController($scope, $firebaseObject, $firebaseArray) {
        $("#pSaveStatus").html("Loading...");

        // make input+datalist behave like select, based on
        // http://stackoverflow.com/a/37479774/542901
        $("input#pLang").on("click", function() {
            $(this).val("");
            $scope.lang = "";
            $scope.innerHTML = "";
        });
        $("input#pID").on("click", function() {
            $(this).val("");
            $scope.id = "";
            $scope.innerHTML = "";
        });

        var l10nRef = firebase.database().ref("/polyglot/l10n/").orderByKey();
        l10nRef.on("value", function(snapshot) {
            if (snapshot.val()) {
                $scope.langOptions = Object.keys(snapshot.val());
            }
            $("#pSaveStatus").html("Languages loaded.");
        });
        var idRef = firebase.database().ref("/polyglot/id/").orderByKey();
        idRef.on("value", function(snapshot) {
            if (snapshot.val()) {
                $scope.idOptions = Object.keys(snapshot.val());
            }
            $("#pSaveStatus").html("IDs loaded.");
        });
        $scope.showInnerHTML = function() {
            // read innerHTML
            if ($scope.lang && $scope.id) {
                console.log($scope.lang);
                console.log("/polyglot/l10n/" + $scope.lang + "/" + $scope.id);
                var l10nEntryRef = firebase.database().ref("/polyglot/l10n/" + $scope.lang + "/" + $scope.id);
                var l10nEntry = $firebaseObject(l10nEntryRef).$loaded().then(function(entry) {
                    $scope.innerHTML = entry.innerHTML;
                });
            } else {
                console.log("here");
                $scope.innerHTML = "";
            }
        };
        $scope.saveEntry = function() {
            console.group("Saving entry");
            var l10nEntryRef = firebase.database().ref("/polyglot/l10n/" + $scope.lang + "/" + $scope.id);
            var l10nEntry = $firebaseObject(l10nEntryRef).$loaded().then(function(entry) {
                console.log("Saving entry...");
                entry.innerHTML = $scope.innerHTML;
                entry.$save().then(function(ref) {
                    console.log("lang saved");
                    console.log("saving id /polyglot/id/" + $scope.id + "...");
                    var idEntryRef = firebase.database().ref("/polyglot/id/" + $scope.id);
                    var idEntry = $firebaseObject(idEntryRef).$loaded().then(function(entry) {
                        console.log("saving id...");
                        entry[$scope.lang] = true;
                        entry.$save().then(function(ref) {
                            console.log("id saved");
                            $("#pSaveStatus").html("Entry added.");
                        }).catch(function(error) {
                            // TODO: remove l10nEntry/take appropriate action
                            // to resolve tainted state
                            console.error("Error saving ID: " + error);
                            $("#pSaveStatus").html(error);
                        });
                    });
                }).catch(function(error) {
                    console.error("Error saving language: " + error);
                    $("#pSaveStatus").html(error);
                });
            });
            console.groupEnd();
        };
    }

})();

