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

        // set the default language
        if (document.cookie) {
            // from https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
            this.activeLang = document.cookie.replace(/(?:(?:^|.*;\s*)lang\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        } else {
            this.activeLang = "English";
        }

        i18nTexts.push(this);
    }

    connectedCallback() {
        // get the innerHTML from the Firebase database, based on the tag id
        var langRef = this.db.ref("/l10n/" + this.activeLang).orderByKey().equalTo(this.id);
        var obj = this;
        langRef.on("value", function(snapshot) {
            console.log(snapshot.val());
            obj.innerHTML = snapshot.val()[obj.id].innerHTML;
        });
    }

    reRender(lang) {
        this.activeLang = lang;
        this.connectedCallback();
    }
}
window.customElements.define("i18n-text", I18nText);

