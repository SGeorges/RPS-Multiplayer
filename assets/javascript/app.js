// ============== Adding Base Variables ==============

var status = "undefined";

var player1choice = "";
var player1nextChoice = false;

var player2choice = "";
var player2nextChoice = false;

var messageBoard = [];
var messageUser = [];
var messageText = [];

// Array containing a players entire stats. 
// [0] = wins [1] = loses [2] = ties
var p1Stats = [];
var p2Stats = [];

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
      status = "Player 1";
      database.ref("/game/player1/set").set(true);
      setStatistics( snapshot );
      
      database.ref("/game/player1").onDisconnect().update({
        ID: "",
        set: false,
        choice: "",
        nextChoice: false,
        stats: [ 0, 0, 0 ],
      });
    }
    else if (snapshot.val().player2.set === false) {
      status = "Player 2";
      database.ref("/game/player2/set").set(true);
      setStatistics( snapshot );

      database.ref("/game/player2").onDisconnect().update({
        ID: "",
        set: false,
        choice: "",
        nextChoice: false,
        stats: [ 0, 0, 0],
      });
    }
    else {
      status = "Spectator";
    };

    if (status === "Player 1") {
      $("#player-2-buttons").empty();
    }
    else if (status === "Player 2") {
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

// ============== Referencing the Stats to the database ==============

database.ref("/game/player1/stats").on("value", function(snapshot){
  p1Stats = snapshot.val();
});

database.ref("/game/player2/stats").on("value", function(snapshot){
  p2Stats = snapshot.val();
});


// ============== List of Functions ==============

function setStatistics( snapshot ) {
  p1Stats = snapshot.val().player1.stats;
  p2Stats = snapshot.val().player2.stats;

  console.log( p1Stats );
  console.log( p2Stats );
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

      p1Stats[0] = p1Stats[0] + 1;
      p2Stats[1] = p2Stats[1] + 1;

    }
    else if ( ((player2choice === "rock") && (player1choice === "scissors")) || ((player2choice === "paper") && (player1choice === "rock")) || ((player2choice === "scissors") && (player1choice === "paper")) ) {
      console.log("player2 wins");
      inputMessage("Server", "Player 2 Wins!");

      p1Stats[1] = p1Stats[1] + 1;
      p2Stats[0] = p2Stats[0] + 1;

    }
    else if (player1choice === player2choice) {
      console.log("it's a tie!");
      inputMessage("Server", "Oh My! It's a Tie!");

      p1Stats[2] = p1Stats[2] + 1;
      p2Stats[2] = p2Stats[2] + 1;

    };

    printImage( player1choice, player2choice );
    printStats();

    database.ref("/game/player1/nextChoice").set(false);
    database.ref("/game/player2/nextChoice").set(false);

    database.ref("/game/player1/choice").set("");
    database.ref("/game/player2/choice").set("");

    database.ref("/game/player1/stats").set(p1Stats);
    database.ref("/game/player2/stats").set(p2Stats);
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

function printStats () {
  $("#player-1-statistics").empty();
  $("#player-2-statistics").empty();

  $("#player-1-statistics").append("<p id= 'player-stats-text'>Player 1 Wins : " + p1Stats[0] + "</p>");
  $("#player-1-statistics").append("<p id= 'player-stats-text'>Player 1 Loses : " + p1Stats[1] + "</p>");
  $("#player-1-statistics").append("<p id= 'player-stats-text'>Player 1 Ties : " + p1Stats[2] + "</p>");

  $("#player-2-statistics").append("<p id= 'player-stats-text'>Player 2 Wins : " + p2Stats[0] + "</p>");
  $("#player-2-statistics").append("<p id= 'player-stats-text'>Player 2 Loses : " + p2Stats[1] + "</p>");
  $("#player-2-statistics").append("<p id= 'player-stats-text'>Player 2 Ties : " + p2Stats[2] + "</p>");
};

function inputMessage ( user, message ) {

  if (user === "Server") {
    messageUser.push(user);
    messageText.push(message)
  }
  else {
    messageUser.push(status);
    messageText.push( $("#user-message").val() );

    $("#user-message").val("");
  }

    messageBoard = [ messageUser, messageText ];

    database.ref("/message-board/").set(messageBoard);
}

function writeMessageBoard ( messageBoard ) {
  $("#message-board").empty();

  if (messageBoard[0].length > 8) {
    for (var i = (messageBoard[0].length - 8); i < messageBoard[0].length; i++) {
      if (messageBoard[0][i] === "Server") {
        $("#message-board").append("<p id= 'message-board-text' class= 'text-left text-success'>" + messageBoard[0][i] + " : " + messageBoard[1][i] + "</p>");
      }
      else if (messageBoard[0][i] === status) {
        $("#message-board").append("<p id= 'message-board-text' class= 'text-left text-primary'>" + messageBoard[0][i] + " : " + messageBoard[1][i] + "</p>");
      }
      else {
        $("#message-board").append("<p id= 'message-board-text' class= 'text-left'>" + messageBoard[0][i] + " : " + messageBoard[1][i] + "</p>");
      }
    };
  }
  else {
    for (var i = 0; i < messageBoard[0].length; i++) {
      if (messageBoard[0][i] === "Server") {
        $("#message-board").append("<p id= 'message-board-text' class= 'text-left text-success'>" + messageBoard[0][i] + " : " + messageBoard[1][i] + "</p>");
      }
      else if (messageBoard[0][i] === status) {
        $("#message-board").append("<p id= 'message-board-text' class= 'text-left text-primary'>" + messageBoard[0][i] + " : " + messageBoard[1][i] + "</p>");
      }
      else {
        $("#message-board").append("<p id= 'message-board-text' class= 'text-left'>" + messageBoard[0][i] + " : " + messageBoard[1][i] + "</p>");
      }
    };
  };

}
// Appending the html based on user status.

