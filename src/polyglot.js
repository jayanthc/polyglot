/*
 * polyglot.js
 * Simple i18n-first CMS
 *
 * Created by Jayanth Chennamangalam
 */


// set the default language
//function setLang(lang) {
    // change the active language in the Firebase database
//}

// define the internationalized DOM element
class I18nText extends HTMLElement {
	constructor() {
        super();

        // set the default active language
        //this.activeLang = "English";
        this.activeLang = "Chinese (Simplified)";

        // get a reference to the database service
        this.database = firebase.database();
        // get the active language
        var obj = this;
        firebase.database().ref("/active").once("value").then(function(snapshot) {
            console.log(snapshot.val().lang);
            obj.activeLang = snapshot.val().lang;
        });
    }

    connectedCallback() {
        console.log(this.id);
        console.log(this.activeLang);
        // get the innerHTML from the Firebase database, based on the tag id
        var langRef = firebase.database().ref('/l10n/' + this.activeLang).orderByKey().equalTo(this.id);
        var obj = this;
        langRef.on("value", function(snapshot) {
            console.log(snapshot.val());
            console.log(snapshot.val()[obj.id].innerHTML);
            obj.innerHTML = snapshot.val()[obj.id].innerHTML;
        });
    }
}
window.customElements.define("i18n-text", I18nText);

