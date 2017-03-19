var gameModel;

//This function will be called once the page is loaded.  It will get a new game model from the back end, and display it.
$( document ).ready(function() {

  $.getJSON("model", function( json ) {
    displayGameState( json );
    gameModel = json;
   });
});

var state = "fire";
var lastClickAcross;
var lastClickDown;

function startGame(mode) {
	if (mode == "hard") {
		
	} else if (mode == "easy") {
		
	}
	
	window.location.href = "battleship.html";
}

function setDialogBox(stringText) {
    var elem = document.getElementById("dbContent");
    elem.innerHTML = "<td> " + stringText + " </td>";
}

function gridclickEnemy(elem) {
    var id = elem.getAttribute("id");
    var splitIndex = id.indexOf("_");
    var downString = id.substring(1, splitIndex);
    var acrossString = id.substring(splitIndex + 1);

    var acrossInt = parseInt(acrossString);
    var downInt = parseInt(downString);
        console.log("ACROSS_ENEMY:");
        console.log(acrossInt);
        console.log("DOWN_ENEMY:");
        console.log(downInt);
    // Call all methods to be notified of click events.
        if(state == "fire") {
            fire(acrossInt, downInt);
            state = "fire";
        }
        else if(state == "scan") {
            scan(acrossInt, downInt);
            state = "fire";
        }
        else {
            state = "fire";
        }
}

function gridclickAlly(elem) {

        var id = elem.getAttribute("id");
        var splitIndex = id.indexOf("_");
        var downString = id.substring(0, splitIndex);
        var acrossString = id.substring(splitIndex + 1);
        var acrossInt = parseInt(acrossString);
        var downInt = parseInt(downString);
        console.log("ACROSS_ALLY:");
        console.log(acrossInt);
        console.log("DOWN_ALLY:");
        console.log(downInt);
        if(state.startsWith("placeShip1_")) {
             var name = state.substring(11);
             state = "placeShip2_" + name;
         }
         else if(state.startsWith("placeShip2_")) {
             var name = state.substring(11);
             placeShip(lastClickAcross, lastClickDown, acrossInt, downInt, name);
             state = "fire";
         }
         else {
            state = "fire";
         }
         lastClickAcross = acrossInt;
         lastClickDown = downInt;
}

function prepShipPlace(name) {
    state = "placeShip1_" + name;
}

function placeShip(click1Across, click1Down, click2Across, click2Down, name) {
    var testval1 = (click1Across - click2Across);
    var testval2 = (click1Down - click2Down);
    if(testval1 == 0 && testval2 != 0) {
        orientation = "vertical"
    }
    else if(testval2 == 0 && testval1 != 0) {
        orientation = "horizontal"
    }
    else {
        var testval3 = Math.abs(testval1/testval2);
        if(testval3 > 1) {
            orientation = "vertical";
        }
        else {
            orientation = "horizontal";
        }

    }

   // This ajax call will asynchronously call the back end, and tell it where to place the ship, then get back a game model with the ship placed, and display the new model.
   var request = $.ajax({
     url: "/placeShip/"+name+"/"+click1Across+"/"+click1Down+"/"+orientation,
     method: "post",
     data: JSON.stringify(gameModel),
     contentType: "application/json; charset=utf-8",
     dataType: "json"
   });

   //This will be called when the call is returned from the server.
   request.done(function( currModel ) {
     displayGameState(currModel);
     gameModel = currModel;
   });

   // if there is a problem, and the back end does not respond, then an alert will be shown.
   request.fail(function( jqXHR, textStatus ) {
     alert( "Request failed: " + textStatus );
   });
}

// Since scan requires initialization before clicking the board, this function exists
function initiateScan(){
    state = "scan";
}

// Copied the fire() code and changed to work with scan requests
function scan(acrossInt, downInt){
   var request = $.ajax({
     url: "/scan/"+acrossInt+"/"+downInt,
     method: "post",
     data: JSON.stringify(gameModel),
     contentType: "application/json; charset=utf-8",
     dataType: "json"
   });

   request.done(function( currModel ) {
     displayGameState(currModel);
     gameModel = currModel;

     if(gameModel.scanResult){
        setDialogBox("Found a ship in the vicinity of " + acrossInt + "_" + downInt + "!");
        document.getElementById("e" + downInt + '_' + acrossInt).innerHTML = '<img src="sprites/Scan.png" alt="" border=0 height=64 width=64>';
     }
     else
        setDialogBox("No ship detected in vicinity of scan.");

   });

   request.fail(function( jqXHR, textStatus ) {
     alert( "Request failed: " + textStatus );
   });
}
//Similar to placeShip, but instead it will fire at a location the user selects.
function fire(acrossInt, downInt){
   var request = $.ajax({
     url: "/fire/"+acrossInt+"/"+downInt,
     method: "post",
     data: JSON.stringify(gameModel),
     contentType: "application/json; charset=utf-8",
     dataType: "json"
   });

   request.done(function( currModel ) {
     displayGameState(currModel);
     gameModel = currModel;

   });

   request.fail(function( jqXHR, textStatus ) {
     alert( "Request failed: " + textStatus );
   });

}

//This function will display the game model.  It displays the ships on the users board, and then shows where there have been hits and misses on both boards.
function displayGameState(gameModel){
console.log(gameModel);
setDialogBox("click to fire!, press buttons to place ships!");
for(var j = 1; j < 11; j++) {
    for(var v = 1; v < 11; v++) {
        document.getElementById("e" + j + '_' + v ).innerHTML = '<img src="sprites/Water.png" alt="" border=0 height=64 width=64>';
        document.getElementById(j + '_' + v ).innerHTML = '<img src="sprites/WaterSmall.png" alt="" border=0 height=24 width=24>';
    }
}

displayShip(gameModel.aircraftCarrier);
displayShip(gameModel.battleship);
displayShip(gameModel.clipper);
displayShip(gameModel.dinghy);
displayShip(gameModel.submarine);

for (var i = 0; i < gameModel.computerMisses.length; i++) {
   document.getElementById("e" + gameModel.computerMisses[i].Down + '_' + gameModel.computerMisses[i].Across ).innerHTML = '<img src="sprites/Miss.png" alt="" border=0 height=64 width=64>';
}
for (var i = 0; i < gameModel.computerHits.length; i++) {
   document.getElementById("e" + gameModel.computerHits[i].Down + '_' + gameModel.computerHits[i].Across ).innerHTML = '<img src="sprites/Hit.png" alt="" border=0 height=64 width=64>';
}

for (var i = 0; i < gameModel.playerMisses.length; i++) {
   document.getElementById(gameModel.playerMisses[i].Down + '_' + gameModel.playerMisses[i].Across ).innerHTML = '<img src="sprites/MissSmall.png" alt="" border=0 height=24 width=24>';
}
for (var i = 0; i < gameModel.playerHits.length; i++) {
   document.getElementById(gameModel.playerHits[i].Down + '_' + gameModel.playerHits[i].Across ).innerHTML = '<img src="sprites/HitSmall.png" alt="" border=0 height=24 width=24>';
}



}


//This function will display a ship given a ship object in JSON
function displayShip(ship){
 startCoordAcross = ship.start.Across;
 startCoordDown = ship.start.Down;
 endCoordAcross = ship.end.Across;
 endCoordDown = ship.end.Down;
 if(startCoordDown > 10 || startCoordDown < 0 || startCoordDown > 10 || startCoordDown < 0 || endCoordAcross > 10 || endCoordAcross < 0 || endCoordDown > 10 || endCoordDown < 0) {
    setDialogBox("failed to place ship.");
    return;
 }
 if(startCoordAcross > 0){
    if(startCoordAcross == endCoordAcross){
        for (i = startCoordDown; i <= endCoordDown; i++) {
            document.getElementById(i+'_'+startCoordAcross).innerHTML = '<img src="sprites/ShipSmall.png" alt="" border=0 height=24 width=24>';
        }
    } else {
        for (i = startCoordAcross; i <= endCoordAcross; i++) {
            document.getElementById(startCoordDown+'_'+i).innerHTML = '<img src="sprites/ShipSmall.png" alt="" border=0 height=24 width=24>';
        }
    }
 }
}