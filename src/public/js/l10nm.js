(function() {
    var app = angular
        .module("plmi", ["ngRoute", "firebase"])
        .config(ApplicationConfig)
        .controller("AuthCtrl", AuthenticationController)
        .controller("DefLangCtrl", DefLangController)
        .controller("NewEntryCtrl", NewEntryController);

    // config

    function ApplicationConfig($routeProvider) {
        $routeProvider
            .when("/",
                  {
                      templateUrl: "polyglot.html",
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

    app.directive("defLang", function() {
        return {
            restrict: "E",
            templateUrl: "def-lang.html",
            controller: "DefLangCtrl as ctrl",
            controllerAs: "deflang"
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


    function DefLangController($scope, $firebaseObject, $timeout) {
        // used many times
        var db = firebase.database();

        // load default language in the default language selector
        var defLangRef = db.ref("/polyglot/defLang");
        defLangRef.on("value", function(snapshot) {
            $scope.defLang = snapshot.val();
            console.log("loaded deflang: " + $scope.defLang);

            var l10nRef = db.ref("/polyglot/l10n/");
            l10nRef.on("value", function(snapshot) {
                $timeout(function() { // needed to update the select drop-down menu
                    if (snapshot.val()) {
                        $scope.options = Object.keys(snapshot.val());
                        console.log("langs loaded");
                        $("#pSaveStatus").html("Languages loaded.");
                    }
                });
            });
        });

        $scope.changeDefLang = function() {
            var dbRef = db.ref("/polyglot");
            $firebaseObject(dbRef).$loaded().then(function(db) {
                db.defLang = $scope.defLang;
                db.$save().then(function(ref) {
                    console.log("saving deflang");
                }).catch(function(error) {
                    console.error("Error saving default language.");
                });
            });
        };
    }


    function NewEntryController($scope, $firebaseObject, $firebaseArray) {
        $("#pSaveStatus").html("Loading...");

        // used many times
        var db = firebase.database();

        var l10nRef = db.ref("/polyglot/l10n/").orderByKey();
        l10nRef.on("value", function(snapshot) {
            if (snapshot.val()) {
                $scope.langOptions = Object.keys(snapshot.val());
                console.log("langs loaded");
            }
            $("#pSaveStatus").html("Languages loaded.");
        });
        var idRef = db.ref("/polyglot/id/").orderByKey();
        idRef.on("value", function(snapshot) {
            if (snapshot.val()) {
                $scope.idOptions = Object.keys(snapshot.val());
            }
            $("#pSaveStatus").html("IDs loaded.");
        });

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

        $scope.showInnerHTML = function() {
            // read innerHTML
            if ($scope.lang && $scope.id) {
                console.log($scope.lang);
                console.log("/polyglot/l10n/" + $scope.lang + "/" + $scope.id);
                var l10nEntryRef = db.ref("/polyglot/l10n/" + $scope.lang + "/" + $scope.id);
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
            var l10nEntryRef = db.ref("/polyglot/l10n/" + $scope.lang + "/" + $scope.id);
            var l10nEntry = $firebaseObject(l10nEntryRef).$loaded().then(function(entry) {
                console.log("Saving entry...");
                entry.innerHTML = $scope.innerHTML;
                entry.$save().then(function(ref) {
                    console.log("lang saved");
                    console.log("saving id /polyglot/id/" + $scope.id + "...");
                    var idEntryRef = db.ref("/polyglot/id/" + $scope.id);
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

