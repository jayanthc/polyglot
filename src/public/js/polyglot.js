/*
 * polyglot.js
 * Simple i18n-first CMS
 *
 * Created by Jayanth Chennamangalam
 */


// set the active language
function setLang(lang) {
    // change the active language in the Firebase database
    console.log("Setting active language to " + lang);

    var db = firebase.database();
    db.ref("/active").set({ lang: lang });
    copyRecord(db.ref("/l10n/" + lang), db.ref("/active/l10n"));
}


// based on https://gist.github.com/katowulf/6099042
function copyRecord(fromRef, toRef) {
     fromRef.once("value", function(snapshot)  {
          toRef.set(snapshot.val(), function(error) {
               if (error && typeof(console) !== "undefined" && console.error) {
                   console.error(error);
               }
          });
     });
}


// get the active language
function getLang() {
    firebase.database().ref("/active/lang").once("value").then(function(snapshot) {
        return snapshot.val();
    });
}


// define the internationalized DOM element
class I18nText extends HTMLElement {
	constructor() {
        super();

        // get a reference to the database service
        this.db = firebase.database();
    }

    connectedCallback() {
        // get the innerHTML from the Firebase database, based on the tag id
        var langRef = this.db.ref("/active/l10n").orderByKey().equalTo(this.id);
        var obj = this;
        langRef.on("value", function(snapshot) {
            console.log(snapshot.val());
            // kludgy fix to TypeError caused during record copy
            if (snapshot.val()) {
                obj.innerHTML = snapshot.val()[obj.id].innerHTML;
            }
        });
    }
}
window.customElements.define("i18n-text", I18nText);

