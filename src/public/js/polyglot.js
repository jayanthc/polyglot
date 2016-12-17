/*
 * polyglot.js
 * Simple i18n-first CMS
 *
 * Created by Jayanth Chennamangalam
 */


// global variable to store list of all i18n-text elements
var i18nTexts = [];


// set the active language
function setLang(lang) {
    console.log("Setting active language to " + lang);

    // set a cookie
    document.cookie = "lang=" + lang;

    i18nTexts.forEach(function(i18nText) {
        i18nText.reRender(lang);
    });
}


// define the internationalized DOM element
class I18nText extends HTMLElement {
	constructor() {
        super();

        // get a reference to the database service
        this.db = firebase.database();

        // read the default language from the database
        var defLangRef = this.db.ref("/polyglot/defaultLang");
        var obj = this;
        defLangRef.on("value", function(snapshot) {
            console.log("def lang = " + snapshot.val());
            obj.defaultLang = snapshot.val();
        });

        // set the active language
        if (document.cookie) {
            // from https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
            this.activeLang = document.cookie.replace(/(?:(?:^|.*;\s*)lang\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        } else {
            this.activeLang = this.defaultLang;
        }

        i18nTexts.push(this);
    }

    connectedCallback() {
        // get the innerHTML from the Firebase database, based on the tag id
        var langRef = this.db.ref("/polyglot/l10n/" + this.activeLang).orderByKey().equalTo(this.id);
        var obj = this;
        langRef.on("value", function(snapshot) {
            console.log(snapshot.val());
            console.log("prev: " + obj.innerHTML);
            if (snapshot.val()) {
                obj.innerHTML = snapshot.val()[obj.id].innerHTML;
            } else {
                // innerHTML not provided, falling back to default language
                var langRef = obj.db.ref("/polyglot/l10n/" + obj.defaultLang).orderByKey().equalTo(obj.id);
                langRef.on("value", function(snapshot) {
                    console.log("x: " + snapshot.val());
                    console.log("x: prev: " + obj.innerHTML);
                    if (snapshot.val()) {
                        obj.innerHTML = snapshot.val()[obj.id].innerHTML;
                    } else {
                        console.error("Fallback innerHTML not provided!");
                    }
                });
            }
        });
    }

    reRender(lang) {
        this.activeLang = lang;
        this.connectedCallback();
    }
}
window.customElements.define("i18n-text", I18nText);

