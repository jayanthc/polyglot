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
//class I18nText extends HTMLSpanElement {
	constructor() {
        super();

        // set the default active language
        //this.activeLang = "en-us";
        this.activeLang = "zh-Hans";

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
        var langRef = firebase.database().ref('/l10n/' + this.activeLang).orderByChild("id").equalTo(this.id);
        var obj = this;
        //langRef.on("value", function(snapshot) {
        langRef.on("value", function(snapshot) {
            console.log(snapshot.val());
            console.log(snapshot.val().pop().id);
            console.log(snapshot.val().pop().innerHTML);
            obj.innerHTML = snapshot.val().pop().innerHTML;
        });
    }
}
window.customElements.define("i18n-text", I18nText);
//window.customElements.define("i18n-text", I18nText, {extends: "span"});

