// ============== Adding Base Variables ==============
var status = "undefined";

var player1choice = "";
var player1nextChoice = false;

var player2choice = "";
var player2nextChoice = false;

var messageBoard = [];
var messageUser = [];
var messageText = [];

var p1numGames = 0;
var p2numGames = 0;

var p1wins = 0;
var p2wins = 0;

var p1loses = 0;
var p2loses = 0;


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
      setStatistics( snapshot );
      
      database.ref("/game/player1").onDisconnect().update({
        ID: "",
        set: false,
        choice: "",
        nextChoice: false,
        wins: 0,
        loses: 0,
        numGames: 0,
      });
    }
    else if (snapshot.val().player2.set === false) {
      status = "player2";
      database.ref("/game/player2/set").set(true);
      setStatistics( snapshot );

      database.ref("/game/player2").onDisconnect().update({
        ID: "",
        set: false,
        choice: "",
        nextChoice: false,
        wins: 0,
        loses: 0,
        numGames: 0,
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

  if ((snapshot.val().player1.nextChoice) && (snapshot.val().player2.nextChoice)) {
    console.log("this is running");

    player1nextChoice = snapshot.val().player1.nextChoice;
    player1choice = snapshot.val().player1.choice;
  
    player2nextChoice = snapshot.val().player2.nextChoice;
    player2choice = snapshot.val().player2.choice;

    runGame();
  };
});

// ============== Referencing the Messages to the database ==============

database.ref("/message-board").on("value", function(snapshot){

  if (snapshot.val()) {
    messageUser = snapshot.val()[0];
    messageText = snapshot.val()[1];

    messageBoard = [ messageUser, messageText ];
   
    // messages = $.map(snapshot.val(), function(value, index){
    //   return[value];
    // });
  
    writeMessageBoard( messageBoard );  

  }
});

// ============== List of Functions ==============

function setStatistics( snapshot ) {
  p1numGames = parseInt(snapshot.val().player1.numGames);
  p2numGames = parseInt(snapshot.val().player2.numGames);

  p1wins = parseInt(snapshot.val().player1.wins);
  p2wins = parseInt(snapshot.val().player2.wins);

  p1loses = parseInt(snapshot.val().player1.loses);
  p2loses = parseInt(snapshot.val().player2.loses);

}

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
      inputMessage("Server", "Player 1 Wins!");

    }
    else if ( ((player2choice === "rock") && (player1choice === "scissors")) || ((player2choice === "paper") && (player1choice === "rock")) || ((player2choice === "scissors") && (player1choice === "paper")) ) {
      console.log("player2 wins");
      inputMessage("Server", "Player 2 Wins!");

    }
    else if (player1choice === player2choice) {
      console.log("it's a tie!");
      inputMessage("Server", "Oh My! It's a Tie!");

    };

    printImage( player1choice, player2choice );

    database.ref("/game/player1/nextChoice").set(false);
    database.ref("/game/player2/nextChoice").set(false);

    database.ref("/game/player1/choice").set("");
    database.ref("/game/player2/choice").set("");
  };
};

// function player1Wins () {
//   database.ref("/game/player1/wins").set(p1wins++);
//   database.ref("/game/player1/numGames").set(p1numGames++);

//   database.ref("/game/player2/loses").set(p2loses++);
//   database.ref("/game/player2/numGames").set(p2numGames++);

//   printStatistics();
// }

// function player2Wins () {
//   database.ref("/game/player2/wins").set(p2wins++);
//   database.ref("/game/player2/numGames").set(p2numGames++);

//   database.ref("/game/player1/loses").set(p1loses++);
//   database.ref("/game/player1/numGames").set(p1numGames++);

//   printStatistics();
// }

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

// function printStatistics () {
//   $("#player-1-statistics").empty();
//   $("#player-2-statistics").empty();

//   $("#player-1-statistics").append("<p id= 'player-1-wins'>Player 1 Wins : " + p1wins + "</p>");
//   $("#player-1-statistics").append("<p id= 'player-1-loses'>Player 1 Loses : " + p1loses + "</p>");
//   $("#player-1-statistics").append("<p id= 'player-1-games'>Player 1 Games : " + p1numGames + "</p>");

//   $("#player-2-statistics").append("<p id= 'player-2-wins'>Player 2 Wins : " + p2wins + "</p>");
//   $("#player-2-statistics").append("<p id= 'player-2-wins'>Player 2 Loses : " + p2loses + "</p>");
//   $("#player-2-statistics").append("<p id= 'player-2-wins'>Player 2 Games : " + p2numGames + "</p>");

// }

function inputMessage ( user, message ) {

  if (user === "Server") {
    messageUser.push(user);
    messageText.push(message)
  }
  else {
    messageUser.push(status);
    messageText.push( $("#user-message").val() );
  }

    messageBoard = [ messageUser, messageText ];

    database.ref("/message-board/").set(messageBoard);
}

function writeMessageBoard ( messageBoard ) {
  $("#message-board").empty();

  if (messageBoard[0].length > 8) {
    for (var i = (messageBoard[0].length - 8); i < messageBoard[0].length; i++) {
      $("#message-board").append("<p id= 'message-board-text' class= 'text-left'>" + messageBoard[0][i] + " : " + messageBoard[1][i] + "</p>");
    };
  }
  else {
    for (var j = (8 - messageBoard[0].length); j < 8; j++) {
      $("#message-board").append("<p id= 'message-board-text' class= 'text-left'> </p>");
    }
    for (var i = 0; i < messageBoard[0].length; i++) {
      $("#message-board").append("<p id= 'message-board-text' class= 'text-left'>" + messageBoard[0][i] + " : " + messageBoard[1][i] + "</p>");
    };
  };

}
// Appending the html based on user status.

