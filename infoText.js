let infoTextOpen = false;

$("#infoButton").click(() => {
    if (infoTextOpen) {
        infoTextOpen = false;
        $("#infoText").fadeOut("linear");
        $("#statusText1, #statusText2, #hintButton1, #restartButton").fadeIn("linear");
        $("#game1, #game2").animate({ opacity: 1 }, "linear");
    } else {
        infoTextOpen = true;
        $("#infoText").fadeIn("linear");
        $("#statusText1, #statusText2, #hintButton1, #restartButton").fadeOut("linear");
        $("#game1, #game2").animate({ opacity: 0.01 }, "linear");
    }
});