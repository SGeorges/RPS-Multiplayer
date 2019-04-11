// ============== Adding Base Variables ==============
var status = "undefined";

var player1choice = "";
var player1nextChoice = false;

var player2choice = "";
var player2nextChoice = false;

var messages = [];


// ============== Linking the database ==============

var config = {
    apiKey: "AIzaSyCaY--LApxd6F-4u54n-vGfHnHIShnA4uM",
    authDomain: "rps-multiplayer-6027a.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-6027a.firebaseio.com",
    projectId: "rps-multiplayer-6027a",
    storageBucket: "rps-multiplayer-6027a.appspot.com",
    messagingSenderId: "211422717758"
  };
    
firebase.initializeApp(config);
  
// Create a variable to reference the database.
var database = firebase.database();

// ============== Adding a connection to the database ==============
var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");

connectedRef.on("value", function(snap){
  if (snap.val()) {
    var con = connectionsRef.push(true);

    con.onDisconnect().remove();
    console.log(con.path.n[1]);
  };
});

// ============== Referencing the Game to the database ==============
// Identifying whether the users status.

database.ref("/game").on("value", function(snapshot){

  if (status === "undefined") {
    if (snapshot.val().player1.set === false) {
      status = "player1";
      database.ref("/game/player1/set").set(true);
      
      database.ref("/game/player1").onDisconnect().update({
        ID: "",
        set: false,
        choice: "",
        nextChoice: false,
      });
    }
    else if (snapshot.val().player2.set === false) {
      status = "player2";
      database.ref("/game/player2/set").set(true);

      database.ref("/game/player2").onDisconnect().update({
        ID: "",
        set: false,
        choice: "",
        nextChoice: false,
      });
    }
    else {
      status = "Spectator";
    };

    if (status === "player1") {
      $("#player-2-buttons").empty();
    }
    else if (status === "player2") {
      $("#player-1-buttons").empty();
    }
    else {
      $("#player-1-buttons").empty();
      $("#player-2-buttons").empty();
    };
    
  };

  player1choice = snapshot.val().player1.choice;
  player1nextChoice = snapshot.val().player1.nextChoice;
  
  player2choice = snapshot.val().player2.choice;
  player2nextChoice = snapshot.val().player2.nextChoice;

  if ((player1nextChoice) && (player2nextChoice)) {
    runGame();

  };
});

// ============== Referencing the Messages to the database ==============

database.ref("/message-board").on("value", function(snapshot){
  messages = $.map(snapshot.val(), function(value, index){
    return[value];
  });

  writeMessageBoard( messages );
});

// ============== List of Functions ==============

function player1select( value ) {
  event.preventDefault();

  console.log("player1 selected : "+ value);

  database.ref("/game/player1/choice").set(value);
  database.ref("/game/player1/nextChoice").set(true);

};

function player2select( value ) {
  event.preventDefault();

  console.log("player2 selected : "+ value);

  database.ref("/game/player2/choice").set(value);
  database.ref("/game/player2/nextChoice").set(true);

};


function runGame() {

  if ((player1nextChoice) && (player2nextChoice)) {
    if ( ((player1choice === "rock") && (player2choice === "scissors")) || ((player1choice === "paper") && (player2choice === "rock")) || ((player1choice === "scissors") && (player2choice === "paper")) ) {
      console.log("player1 wins");
    }
    else if ( ((player2choice === "rock") && (player1choice === "scissors")) || ((player2choice === "paper") && (player1choice === "rock")) || ((player2choice === "scissors") && (player1choice === "paper")) ) {
      console.log("player2 wins");
    }
    else if (player1choice === player2choice) {
      console.log("it's a tie!");
    };

    printImage( player1choice, player2choice );

    database.ref("/game/player1/choice").set("");
    database.ref("/game/player1/nextChoice").set(false);
  
    database.ref("/game/player2/choice").set("");
    database.ref("/game/player2/nextChoice").set(false);
  };
};

function printImage ( choice1, choice2) {

  if (choice1 === "rock") {
    $("#player-1-image").attr("src", "assets/images/rock.png");
  }
  else if (choice1 === "paper") {
    $("#player-1-image").attr("src", "assets/images/paper.jpg");
  }
  else if (choice1 === "scissors") {
    $("#player-1-image").attr("src", "assets/images/scissors.png");
  };

  if (choice2 === "rock") {
    $("#player-2-image").attr("src", "assets/images/rock.png");
  }
  else if (choice2 === "paper") {
    $("#player-2-image").attr("src", "assets/images/paper.jpg");
  }
  else if (choice2 === "scissors") {
    $("#player-2-image").attr("src", "assets/images/scissors.png");
  };
};

function inputMessage () {
  database.ref("/message-board").push($("#user-message").val());
}

function writeMessageBoard ( messages ) {
  $("#message-board").empty();

  for (var i = 0; i < messages.length; i++) {
    $("#message-board").append("<p id= 'message-board-text' class= 'text-left'>" + messages[i] + "</p>");
  }
}
// Appending the html based on user status.

