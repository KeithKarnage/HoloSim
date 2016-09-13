"use strict";function findOpponent(a){for(var b=0;b<users.length;b++)a!==users[b]&&new Match(a,users[b])}function removeUser(a){return users.splice(users.indexOf(a),1)}function Match(a,b){for(var c=[a,b],d=[],e=0,f=c.length;e<f;e++)d.push(c[e].socket.id.substr(2));this.game=new Game({server:!0,players:c}),games.push(this.game),a.match=this,b.match=this,usersInGames.push(removeUser(a)),usersInGames.push(removeUser(b));for(var e=0,f=c.length;e<f;e++)c[e].socket.emit("start",{players:d})}function User(a){this.socket=a,this.match=null}var users=[],games=[],usersInGames=[];setInterval(function(){for(var a=[],b=0,c=games.length;b<c;b++)0===Object.keys(games[b].players).length&&a.push(games[b]);if(a.length)for(var b=0,c=a.length;b<c;b++)console.log("splicing game"),games.splice(b,1);console.log(games.length)},1e3),module.exports=function(a){var b=new User(a);users.push(b),findOpponent(b),a.on("disconnect",function(){console.log("Disconnected: "+a.id),null!==b.match&&b.match.game.disconnect(a.id.substr(2)),removeUser(b)}),console.log("Connected: "+a.id)};



// "use strict";

// /**
//  * User sessions
//  * @param {array} users
//  */
// var users = [],
// 	games = [],
// 	usersInGames = [];

// /**
//  * Find opponent for a user
//  * @param {User} user
//  */
// function findOpponent(user) {


// 	for (var i = 0; i < users.length; i++) {
// 		if (user !== users[i]) {
// 			new Match(user, users[i]);
// 		}
// 	}
// }

// /**
//  * Remove user session
//  * @param {User} user
//  */
// function removeUser(user) {
// 	// if(users.indexOf(users) !== -1)
// 	return users.splice(users.indexOf(user), 1);
// }

// /**
//  * Match class
//  * @param {User} user1
//  * @param {User} user2
//  */
// function Match(user1, user2) {

// 	// this.user1 = user1;
// 	// this.user2 = user2;
// 	var players = [user1,user2],
// 		playerIDs = [];
// 	for(var i=0,iL=players.length; i<iL; i++)
// 		playerIDs.push(players[i].socket.id.substr(2))
// 	this.game = new Game({
// 		server: true,
// 		players: players
// 	});
// 	games.push(this.game);
// 	user1.match = this;
// 	user2.match = this;
// 	usersInGames.push(removeUser(user1));
// 	usersInGames.push(removeUser(user2));

// 	for(var i=0,iL=players.length; i<iL; i++)
// 		players[i].socket.emit("start",{players:playerIDs});

// }

// function User(socket) {
// 	this.socket = socket;
// 	this.match = null;

// 	// this.opponent = null;
// 	// this.guess = GUESS_NO;
// }

// //  GET RID OF ANY DEAD GAMES EVERY TEN SECONDS
// setInterval(function() {
// 	var deadGames = [];
// 	for(var i=0,iL=games.length; i<iL; i++) {
// 		if(Object.keys(games[i].players).length === 0)
// 			deadGames.push(games[i])
// 	}
// 	if(deadGames.length) {
// 		for(var i=0,iL=deadGames.length; i<iL; i++) {
// 			console.log("splicing game")
// 			games.splice(i,1);
// 		}
// 	}
// 	console.log(games.length);
// },1000);

// module.exports = function (socket) {
// 	var user = new User(socket);
// 	users.push(user);
// 	// console.log(users.length);
// 	findOpponent(user);

	 
// 	socket.on("disconnect", function () {
// 		console.log("Disconnected: " + socket.id);
// 		//  IF THE DISCONNECTED USER WAS IN A MATCH
// 		//  TELL THE SERVER GAME THAT THIS PLAYER HAS DISCONNECTED
// 		if(user.match !== null)
// 			user.match.game.disconnect(socket.id.substr(2));
// 		removeUser(user);

// 	});

// 	console.log("Connected: " + socket.id);
// };