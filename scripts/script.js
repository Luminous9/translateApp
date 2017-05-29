// Initialize Firebase
var config = {
    apiKey: "AIzaSyC28C8voabod4r92jytDIqvfHJ-6c6djyU",
    authDomain: "translate-app-1e3aa.firebaseapp.com",
    databaseURL: "https://translate-app-1e3aa.firebaseio.com",
    projectId: "translate-app-1e3aa",
    storageBucket: "translate-app-1e3aa.appspot.com",
    messagingSenderId: "685368851502"
};
firebase.initializeApp(config);
const lyricsRef = firebase.database().ref("Lyrics");

// Setting up app
let translateApp = {};

translateApp.apiKey = "cc3ea41b434a49438830ae706cd2dc98";
translateApp.accessToken = "";
translateApp.currentText = "";
translateApp.songTitle = "";
translateApp.lyrics = [];
const re = /^([ A-z0-9.,;:!?'"()\[\]$%/\n-]+)$/;

let mainView = $(".main");
let lyricsView = $(".lyrics-game");
let translateView = $(".translate");
let currentView = mainView;

translateApp.init = function () {
    lyricsRef.once("value", function (snapshot) {
        let data = snapshot.val();
        for (var song in data) {
            translateApp.lyrics.push(song);
        }
    });
    translateApp.getToken();

    $(".lyrics-view-button").on("click", function () {
        translateApp.getNewLyrics();
        currentView.toggleClass("hidden");
        lyricsView.toggleClass("hidden");
        currentView = lyricsView;
    });
    $(".translate-view-button").on("click", function () {
        currentView.toggleClass("hidden");
        translateView.toggleClass("hidden");
        currentView = translateView;
    });
    $(".main-view-button").on("click", function () {
        currentView.toggleClass("hidden");
        mainView.toggleClass("hidden");
        currentView = mainView;
    });
    $(".newGame").on("click", function () {
        translateApp.getNewLyrics();
    });

    $("#guessSong button").on("click", function (e) {
        e.preventDefault();
        let userGuess = $("#guessSong input").val();
        if (userGuess.toLowerCase() === translateApp.songTitle.toLowerCase()) {
            $(".message").html("");
            $(".message").html("<p class='correct'>Correct!</p>");
        } else {
            $(".message").html("");
            $(".message").html("<p class='wrong'>Try Again!</p>");
        }
    });

    // var form = $("#translate");
    // var userText = $("#translate textarea");
    // form.on("submit", function (e) {
    //     e.preventDefault();
    //     if (translateApp.validate(userText.val())) {
    //         translateApp.translate();
    //     }
    // });
};

translateApp.getToken = function () {
    $.ajax({
        url: `https://api.cognitive.microsoft.com/sts/v1.0/issueToken?Subscription-Key=${translateApp.apiKey}`,
        type: "POST"
    }).done(function (token) {
        translateApp.accessToken = token;
        setTimeout(translateApp.getToken, 540000);
        $("#translate button").prop("disabled", false);
    }).fail(function (error) {
        console.log(error);
        setTimeout(translateApp.getToken, 2000);
        $("#translate button").prop("disabled", true);
    });
};

translateApp.getNewLyrics = function () {
    translateApp.songTitle = translateApp.lyrics[translateApp.randNum(translateApp.lyrics.length)];
    firebase.database().ref("Lyrics/" + translateApp.songTitle).once("value").then(function (snapshot) {
        let song = snapshot.val();
        let verseNumber = translateApp.randNum(song.length) + 1;
        translateApp.currentText = song[verseNumber];
        translateApp.translate();
    });
};

translateApp.randNum = function (max) {
    return Math.floor(Math.random() * max);
};

translateApp.validate = function (text) {
    let valid = false;
    if (text.length > 200) {
        // output message saying text is too long
        console.log("too long");
    } else if (text.length === 0) {
        // output message saying text is too short
        console.log("too short");
    } else if (text === translateApp.currentText) {
        // output message saying please enter new text
        console.log("new text please");
    } else if (re.exec(text) === null) {
        // output message saying please enter only letters, numbers, and punctuation
        console.log("invalid character(s)");
    } else {
        translateApp.currentText = text;
        valid = true;
    }
    return valid;
};

translateApp.translateHelper = function (lang, output) {
    if (lang.length > 0) {
        $.ajax({
            url: "https://api.microsofttranslator.com/V2/Http.svc/Translate",
            type: "GET",
            data: {
                appid: "Bearer " + translateApp.accessToken,
                to: lang.pop(),
                text: translateApp.currentText
            }
        }).done(function (newText) {
            var s = new XMLSerializer();
            let xmlRegex = /<[^>]*>/g;
            translateApp.currentText = s.serializeToString(newText);
            translateApp.currentText = translateApp.currentText.replace(xmlRegex, "");
            console.log(translateApp.currentText);
            translateApp.translateHelper(lang, output);
        }).fail(function (error) {
            console.log(error);
        });
    } else {
        if (output === "lyrics") {
            $(".lyrics").html(`<p>${translateApp.currentText}</p>`);
        } else if (output === "text") {
            // $(".lyrics").html(`<p>${translateApp.currentText}</p>`);
        }
    }
};

translateApp.translate = function () {
    let languages = ["en", "fi", "zh"];
    translateApp.translateHelper(languages, "lyrics");
};

// Start app
$(function () {
    translateApp.init();
});

// Languages to do: chinese, arabic, german, korean, finnish, hungarian