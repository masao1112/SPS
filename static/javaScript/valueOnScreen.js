var userInput1 = document.getElementById("myMoistureSlider");
var valueOnScreen1 = document.getElementById("myMoistureThreshold");
if (localStorage.getItem("moistureValue")) {
        userInput1.value = localStorage.getItem("moistureValue");
        valueOnScreen1.innerHTML = `<h4>Moisture Threshold ${userInput1.value}</h4>`;
    }
//Function on input
userInput1.addEventListener("input", () => {
    localStorage.setItem("moistureValue", userInput1.value);
    valueOnScreen1.innerHTML = `<h4>Moisture Threshold ${userInput1.value}</h4>`;
    //console.log(JSON.stringify({"user input": userInput1.value}));
});

var userInput2 = document.getElementById("myLightSlider");
var valueOnScreen2 = document.getElementById("myLightThreshold");
if (localStorage.getItem("lightValue")) {
        userInput2.value = localStorage.getItem("lightValue");
        valueOnScreen2.innerHTML = `<h4>Light Threshold ${userInput2.value}</h4>`;
    }
//Function on input
userInput2.addEventListener("input", () => {
  localStorage.setItem("lightValue", userInput2.value);
    valueOnScreen2.innerHTML = `<h4>Light Threshold ${userInput2.value}</h4>`;
    //console.log(JSON.stringify({"user input": userInput2.value}));
});      
