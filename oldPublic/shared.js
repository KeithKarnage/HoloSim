"use strict";

// Set up the Client update loop.

var unitSize = 8;
function Game(options) {
	var self = this;
	this.init(options);

	//  MAIN LOOP YA!
	var simulationTimestep = 1000 / 60,
	    frameDelta = 0,
	    lastFrameTimeMs = 0,
	    fps = 60,
	    lastFpsUpdate = 0,
	    framesThisSecond = 0,
	    numUpdateSteps = 0,
	    minFrameDelay = 0,
	    running = false,
	    started = false,
	    panic = false,

	    requestAnimationFrame = !server ? window.requestAnimationFrame : (function() {
	        var lastTimestamp = Date.now(),
	            now,
	            timeout;
	        return function(callback) {
	            now = Date.now();
	            timeout = Math.max(0, simulationTimestep - (now - lastTimestamp));
	            lastTimestamp = now + timeout;
	            return setTimeout(function() {
	                callback(now + timeout);
	            }, timeout);
	        };
	    })(),

	    cancelAnimationFrame = !server ? window.cancelAnimationFrame : clearTimeout,

	    NOOP = function() {},

	    begin = NOOP,
	    update = NOOP,
	    draw = NOOP,
	    end = NOOP,
	    rafHandle;

	var MainLoop = {

	    // getSimulationTimestep: function() {
	    //     return simulationTimestep;
	    // },
	    // setSimulationTimestep: function(timestep) {
	    //     simulationTimestep = timestep;
	    //     return this;
	    // },
	    // getFPS: function() {
	    //     return fps;
	    // },
	    // getMaxAllowedFPS: function() {
	    //     return 1000 / minFrameDelay;
	    // },
	    // setMaxAllowedFPS: function(fps) {
	    //     if (typeof fps === 'undefined') {
	    //         fps = Infinity;
	    //     }
	    //     if (fps === 0) {
	    //         this.stop();
	    //     }
	    //     else {
	    //         // Dividing by Infinity returns zero.
	    //         minFrameDelay = 1000 / fps;
	    //     }
	    //     return this;
	    // },
	    // resetFrameDelta: function() {
	    //     var oldFrameDelta = frameDelta;
	    //     frameDelta = 0;
	    //     return oldFrameDelta;
	    // },
	    setBegin: function(fun) {
	        begin = fun || begin;
	        return this;
	    },
	    setUpdate: function(fun) {
	        update = fun || update;
	        return this;
	    },
	    setDraw: function(fun) {
	        draw = fun || draw;
	        return this;
	    },
	    setEnd: function(fun) {
	        end = fun || end;
	        return this;
	    },
	    start: function() {
	        if (!started) {
	            started = true;
	            rafHandle = requestAnimationFrame(function(timestamp) {
	                draw(self,1);
	                running = true;
	                lastFrameTimeMs = timestamp;
	                lastFpsUpdate = timestamp;
	                framesThisSecond = 0;
	                rafHandle = requestAnimationFrame(animate);
	            });
	        }
	        return this;
	    },
	    stop: function() {
	        running = false;
	        started = false;
	        cancelAnimationFrame(rafHandle);
	        return this;
	    },
	    isRunning: function() {
	        return running;
	    },
	};
	this.mainLoop = MainLoop;

	function animate(timestamp) {
	    
	    rafHandle = requestAnimationFrame(animate);
	    if (timestamp < lastFrameTimeMs + minFrameDelay) {
	        return;
	    }
	    frameDelta += timestamp - lastFrameTimeMs;
	    lastFrameTimeMs = timestamp;
	    //  BEGIN
	    begin(self, timestamp, frameDelta);
	    if (timestamp > lastFpsUpdate + 1000) {
	        fps = 0.25 * framesThisSecond + 0.75 * fps;

	        lastFpsUpdate = timestamp;
	        framesThisSecond = 0;
	    }
	    framesThisSecond++;

	    numUpdateSteps = 0;
	    while (frameDelta >= simulationTimestep) {
	    	//  UPDATE
	        update(self, simulationTimestep);
	        frameDelta -= simulationTimestep;

	        if (++numUpdateSteps >= 240) {
	            panic = true;
	            break;
	        }
	    }
	    //  DRAW
	    draw(self, frameDelta / simulationTimestep);
	    //  END
	    end(self, fps, panic);

	    panic = false;
	}

	MainLoop.setBegin(this.begin);
	MainLoop.setUpdate(this.update);
	if(!server)
		MainLoop.setDraw(this.render);
	MainLoop.setEnd(this.end);

	MainLoop.start();
}

Game.prototype = {
	init: function(options) {
		//  A REFERENCE TO THE GAME FOR NESTED FUNCTIONS BELOW
		var self = this;
		
		//  THE GAME TIME
		this.gameStartTime = Date.now();
		this.startAt = Date.now() + 3000;
		this.pause = true;
		this.netLatency = 100;

		this.w = 352;
		this.h = 240;
		this.gw = this.w/8;
		this.gh = this.h/8;

		this.assets = options.assets;
		// this.scl = 1;

		
	    // this.offY = (h - tH)/2;
	    // this.offX = (w - tW)/2;

		//  ALL PLAYERS IN THE GAME
		this.players = {};
		this.playerCount = 2;
		this.deadPlayers = 0;
		this.winner = null;
		this.matchEnded = false;
		this.gameEnded = false;
		this.bullets = {};

		//  CACHED COLLISION VARIABLE
		this.response = V(0,0);
		this.knockBack = V(0,0);


		//  THE CLIENT'S PLAYER
		this.player = null;
		//  CREATE EACH PLAYER
		for(var i=0,iL=options.players.length; i<iL; i++) {

			var player = newPlayer({
				game: this,
				// x: playerPositions[i].x*8,
				// y: playerPositions[i].y,
				w: 8,
				h: 16,
				type: "Player",
				style: "guy",
				fillStyle: "purple",
				shp: 0
			})
			
			//  THE SERVER ASSIGNS EACH PLAYERS SOCKET TO IT
			//  AND EACH PLAYER GETS ITS PLAYER IDS FROM THEIR SOCKET
			if(server) {
				player.socket = options.players[i].socket;
				player.id = player.socket.id.substr(2);
			}
			//  CLIENTS ASSIGN IDS FROM OPTIONS
			else {
				player.id = options.players[i];
				//  IN SINGLE PLAYER, THE FIRST PLAYER IS THE CLIENT'S PLAYER
				if(options.socket === null) {
					if(i === 0)
						this.player = player;
				//  IN ONLINE MULTIPLAYER, THE PLAYER WITH THE ID THAT MATCHES THE SOCKET IS THE CLIENT'S PLAYER
				} else if(player.id === options.socket.id)
					this.player = player;
			}
			
			//  ADD EACH PLAYER TO this.players{}
			this.players[player.id] = player;

			//  SET UP this.bullets
			this.bullets[player.id] = {};
		}

		if(server) {
		//  SET UP THE SERVER'S GAME

			for(var i in this.players) {
				var player = this.players[i];

				//  DIRECT INCOMING INPUT FROM EACH CLIENT TO PROPER PLAYER'S pInp ARRAY
				player.socket.on('input', function(input) {
					// console.log("input recieved")
					self.serverReceiveInput(self, input)
				});
			}

			//  SET UP INTERVAL TO SEND SERVER STATE TO EACH PLAYER 20 TIMES A SECOND
			var sendServerState = function() {
				//  THE OBJECT WE WILL SEND TO EACH PLAYER
				var state = {
					// time: Date.now() - self.gameStartTime,
					time: self.gameTime(),
					bullets: {}
				};
				//  ADD EACH PLAYER'S STATE TO THE STATE OBJECT
				for(var i in self.players) {
					//  THE PLAYER WE ARE WORKING ON
					var player = self.players[i],
					//  THAT PLAYERS ARRAY OF BULLETS
						bArray = self.bullets[player.id],
					//  THE BULLETS WE ARE GOING TO ADD TO THE SERVER STATE
						bullets = {};

					state[player.socket.id.substr(2)] = {
						x: player.pos.x,
						y: player.pos.y,
						pos: { x:player.pos.x, y:player.pos.y },
						fV: { x:player.fV.x, y:player.fV.y },
						vel: { x:player.vel.x, y:player.vel.y },
						lastInput: player.lastInput,
						connected: player.connected
					}
					//  FOR EACH BULLET IN THIS PLAYERS BULLET ARRAY
					for(var j in bArray) {
						var blt = bArray[j];
						bullets[blt.id] = {
							pos: {
								x:blt.pos.x,
								y:blt.pos.y
							},
							vel: {
								x:blt.vel.x,
								y:blt.vel.y
							},
							//  BULLET FIRING TIME
							fT: blt.fT,
						};
					}
					state.bullets[player.id] = bullets;

					//  DELETE THE PLAYER ON THE SERVER
					if(player.connected === false)
						delete self.players[player.id];
				}
				for(var i in self.players)
					self.players[i].socket.emit("state",state);
				// for(var i in self.players)
				// 	self.players[i].socket.emit("state",state);
			}
			setInterval(sendServerState,1000/20);

		} else {		//  SET UP THE CLIENT'S GAME
			//  IF WE'RE ON MOBILE
		    //  IF WE ARE NOT ON A MOBILE DEVICE THIS WILL REMAIN FALSE
		    window.mobile = false;
		    //  CHECK TO SEE IF window.orientation EXISTS.
		    //  IF IT DOES, THIS IS A MOBILE DEVICE
		    if(typeof window.orientation !== 'undefined'){
		        //  SET MOBILE FLAG TO TRUE
		        mobile = true;
		        //  SCROLL TO THE TOP OF THE SCREEN TO REMOVE THE ADDRESS BAR ON A MOBILE DEVICE
		        window.top.scrollTo(0,1);
		    }
		    this.off = options.off;
		    this.scl = options.scl;
		    


			//  MOVE BUTTONS AND TITLE OFF SCREEN
			this.cover = document.getElementById("cover");
			console.log(this.cover)
			this.cover.style.position = "fixed";
			this.cover.style.left = (10* this.w * this.scl) + "px";

			//  BACKGROUND BUFFER
			this.bgB = options.bgB; //document.createElement('canvas');
			this.bgC = options.bgC; //this.bgB.getContext('2d');
			// console.log(this.bgC)
			this.bgB.width = 352;
			this.bgB.height = 240;
			// this.bgC.fillStyle = "black"
			// this.bgC.fillRect(0,0,352,240);
			this.bgT = 0;
			this.bgI = 0;
			this.bgCh = true;
			this.bgB2 = drawBG("Sky");
			// this.changeBackground();


			this.socket = options.socket;
			this.canvas = options.canvas;
			this.draw = options.draw;
			this.resetKeys = function() {
				self.keyRight = false;
				self.keyLeft = false;
				self.keyUp = false;
				self.keyDown = false;
				// self.keyC = false;
				// self.keyV = false;
			}
			this.resetKeys();
			this.inputSeq = 0;

			this.explosions = [];
			for(var i=0; i<10; i++)
				this.explosions.push(newExplosion(this));
			this.activeExplosions = [];

			if(this.socket !== null) {

				this.serverUpdates = [];
				this.serverTime = 0;
				this.updateTime = 0;

				this.socket.on("state", function(state) {
					self.serverUpdates.push(state);
					self.serverTime = state.time;
					self.updateTime = Date.now();
					// console.log(state.bullets)
				});
				this.socket.on("ready",function(data) {
					self.startAt = data.startAt;
					// console.log(self.matchEnded)
				})
				this.socket.on("hit",function(hit) {
					// self.hits.push(hit.pos);
					var xp = self.explosions.pop();
					if(xp) {
						xp.explode({
						x: hit.x,
						y: hit.y
					})};
					if(hit.hurt) {
						self.knockBack.copy(hit.knockBack);
						self.players[hit.hurt].takeDamage(1,self.knockBack);
					}
					if(hit.damaged) {
						self.level[hit.damaged].hit(hit.time);

					}

					// console.log(hit)
				});
				this.socket.on("levelGlitch",function(data) {
					self.level[data.id].type = data.type;
					// console.log(data.id,data.type)
				});
				this.socket.on("matchEnd",function(data) {
					self.pause = true;
					self.matchEnded = true;
					if(data.winner !== null) {
						self.winner = data.winner;
						self.players[self.winner].wins++;
					}
					if(data.gameEnded) {
						self.gameEnded = true;
						setTimeout(function() {
							console.log("disconneced")
							self.disconnect();
							location.reload();
						},5000);
					} else {
						setTimeout(function() {
							self.loadLevel();
						},2000);
					}
				});


				this.upV = V();
				this.inV = V();
				this.disV = V();
			} else this.singlePlayer = true;
			// console.log(self.socket.id,self.player.id);

			// When the player presses the right or left arrow keys, set the corresponding
			// flag in the Client.
			var keyHandler = function(e) {
			  e = e || window.event;
			  e.preventDefault();
			  // console.log(e.keyCode)
			  if (e.keyCode == 39) {
			    self.keyRight = (e.type == "keydown");
			  } else if (e.keyCode == 37) {
			    self.keyLeft = (e.type == "keydown");
			  } else if(e.keyCode == 38) {
			  	self.keyUp = (e.type == "keydown");
			  } else if(e.keyCode == 40) {
			  	self.keyDown = (e.type == "keydown");
			  } else if(e.keyCode == 32) {
			  	self.keySpace = (e.type == "keydown");
			  } else if(e.keyCode == 67) {
			  	self.keyC = (e.type == "keydown");
			  } else if(e.keyCode == 86) {
			  	self.keyV = (e.type == "keydown");
			  }
			}
			document.body.onkeydown = keyHandler;
			document.body.onkeyup = keyHandler;

			this.touches = {};
			this.tStk = V();
			this.tStk.id = 0;
			this.stkV = V();
			// this.stickAngle = 0;
			this.fBtn = V((this.canvas.width) * 0.7,(this.canvas.height) * 0.9);
			this.fBtn.id = 0;
			this.jBtn = V((this.canvas.width) * 0.83,(this.canvas.height) * 0.7);
			this.jBtn.id = 0;

			var touchHandler = function(e) {
				e.preventDefault()
				self.touches = {};
				self.resetKeys()
				for(var i=0,iL=e.touches.length; i<iL; i++) {
					var touch = e.touches[i];
					self.touches[touch.identifier] = {
						x: touch.clientX,
						y: touch.clientY,
						id: touch.identifier
					};
				}

				//  IF THE THUMBSTICK IS CURRENTLY IN USE
				if(self.tStk.id !== 0) {
					var touch = self.touches[self.tStk.id];
					//  IF THE TOUCH THAT IS CURRENTLY CONTROLLING THE THUMBSTICK ISN'T IN self.touches
					//  SET THE self.tStk.id TO 0 SO IT CAN BE RE-ASSIGNED
					if(!touch)
						self.tStk.id = 0;
					//  IF THE TOUCH STILL EXISTS, USE IT'S CURRENT POSITION MINUS THE ORIGINAL POSITION TO GET IT'S ANGLE
					else {
						self.stkV.copy(touch).sub(self.tStk);
						// self.stickAngle = (Math.atan2(self.stkV.y,self.stkV.x)* (180/Math.PI));
						// var absAngle = Math.abs(self.stickAngle);
						var dir = self.stkV.octDir();
						// console.log(dir)

						switch(dir) {
							case 0:
								self.keyRight = true;
							break;

							case 1:
								self.keyRight = true;
							// break;

							case 2:
								self.keyDown = true;
							break;

							case 3:
								self.keyDown = true;
							// break;

							case 4:
							case -4:
								self.keyLeft = true;
							break;

							case -3:
								self.keyLeft = true;
							// break;

							case -2:
								self.keyUp = true;
							break;

							case -1:
								self.keyUp = true;
								self.keyRight = true;
							break;

							
						}

						//  LEFT OR RIGHT
						// if(absAngle < 22.5 || absAngle > 157.5) {

						// 	if(absAngle > 90)
						// 		self.keyLeft = true;
						// 	else self.keyRight = true;
						// //  UP AND DOWN
						// } else if(absAngle > 67.5 && absAngle < 112.5) {

						// 	if(self.stickAngle > 0)
						// 		self.keyDown = true;
						// 	else self.keyUp = true;
						// //  DIAGONALS
						// } else {
						// 	 if(self.stickAngle > 0) {
						// 	 	self.keyDown = true;
						// 	 	if(absAngle < 90)					 		
						// 	 		self.keyRight = true;
						// 	 	else self.keyLeft = true;
						// 	 } else {
						// 	 	self.keyUp = true;
						// 	 	if(absAngle < 90)
						// 	 		self.keyRight = true;
						// 	 	else self.keyLeft = true;

						// 	 }
						// }
					}
				}

				if(self.fBtn.id !== 0) {
					var touch = self.touches[self.fBtn.id];
					if(!touch) {
						self.fBtn.id = 0;
						self.keyV = false;
					}
				}

				if(self.jBtn.id !== 0) {
					var touch = self.touches[self.jBtn.id];
					if(!touch) {
						self.jBtn.id = 0;
						self.keyC = false;
					}
				}

				//  ITERATE THROUGH TOUCHES
				for(var i in self.touches) {
					var touch = self.touches[i];

					//  IF THE THUMB STICK ISN'T IN USE, ASSIGN THE FIRST TOUCH ON THE LEFT SIDE OF THE SCREEN TO IT
					if(self.tStk.id === 0
					&& touch.x < self.canvas.width/2) {
						self.tStk.id = touch.id;
						self.tStk.copy(touch);
						// this.stkV.copy(touch);
					}
					if(self.fBtn.id === 0
					&& self.fBtn.dis(touch) < 64) {
						self.fBtn.id = touch.id;
						self.keyV = true;
					}
					if(self.jBtn.id === 0
					&& self.jBtn.dis(touch) < 64) {
						self.jBtn.id = touch.id;
						self.keyC = true;
					}
				}
			}

			document.body.ontouchstart = touchHandler;
			document.body.ontouchmove = touchHandler;
			document.body.ontouchend = touchHandler;
		}

		this.loadLevel();

	},

	loadLevel: function() {
		var self = this;

		//  COUNT DOWN UNTIL START
		this.startAt = Date.now() + 3000;

		//  RESET MATCH VARIABLES
		this.matchEnded = false;
		this.deadPlayers = 0;
		this.winner = null;
		this.pause = true;

		//  REPOSITION PLAYERS
		var playerPositions = [
			{ x: 10, y: 4 },
			{ x: 33, y: 4 }
		]
		var count = 0;
		for(var i in this.players) {
			var ply = this.players[i];
			ply.dead = false;
			ply.x = playerPositions[count].x * 8;
			ply.y = playerPositions[count++].y * 8;
			ply.vel.clear();
			ply.health = 5;
		}
		
		//  GRAPH THAT WILL BE USED IN PATHFINDING
		this.grid = [];
		for(var y=0; y<this.h/8; y++) {
			this.grid.push([]);
			for(var x=0; x<this.w/8; x++)
				this.grid[y].push(1);
		}
		// this.graph = new Graph(this.grid, {diagonal: true, portals: []})
		this.level = [];
		this.lastGlitch = Date.now();
		//  CLEAR LEVEL
		//  x DONT GO GREATER THAN 19 WITH w AT 2
		//  DON'T HAVE TWO PLATFORMS LEVEL SO YOU CAN WALK OFF ONE ONTO ANOTHER
		//  CAUSES A COLLISION BUT THAT THERE ISN'T ROOM TO DEAL WITH

		for(var i=0,iL=levels.level2.length; i<iL; i++) {
			var lP = levels.level2[i],
				shp = shapes[lP.shp];
				// console.log(shp);
			this.level.push(this.newLevelPiece({
				game: self, x:lP.x, y:lP.y, w:shp[0], h:shp[1], type: lP.type, fillStyle: lP.fillStyle, shp: lP.shp, style: lP.style
			}))
			//  dm MEANS DON'T MIRROR
			if(!lP.dm) {
				this.level.push(this.newLevelPiece({
					game: self, x:(self.w/8)-lP.x-shp[0], y:lP.y, w:shp[0], h:shp[1], type: lP.type, fillStyle: lP.fillStyle, shp: lP.shp, style: lP.style
				}))
			}
		}

		
		// this.portals = [];
		// for(var i=0,iL=this.gw; i<iL; i++) {
		// 	this.portals.push({ x: i, y: 0, to: { x: i, y: this.gh-1 } })
		// 	this.portals.push({ x: i, y: this.gh-1, to: { x: i, y: 0 } })
		// }
		// for(var i=0,iL=this.gh; i<iL; i++) {
		// 	this.portals.push({ x: 0, y: i, to: { x: this.gw-1, y: i } })
		// 	this.portals.push({ x: this.gw-1, y: i, to: { x: 0, y: i } })
		// }
		
		this.enemies = [
			// newPlayer({game: self, x:4, y:4, w: 6, h: 6, type:"Enemy", fillStyle: "orange"})
		]
		this.deadEnemies = 0;
		this.spawnTime = Date.now();
		this.enemiesToSpawn = 0;
		this.difficulty = 1;


		// return path;
		// console.log(th);

		for(var i=0,iL=this.level.length; i<iL; i++) {
			//  ASSIGN IDS TO EACH LEVEL PIECE
			this.level[i].id = i;
			//  FILL MOVEMENT GRAPH HERE
		}


		//  LOCATIONS OF BULLET HITS
		this.hits = [];
		//  CACHED HIT VARIABLE
		this.hit = V();

		if(server) {
			for(var i in this.players) {
				this.players[i].socket.emit("ready",{
					startAt: this.startAt
				})
			};
			// this.emitToPlayers("ready",{
			// 	startAt: self.startAt
			// })
		}
	},

	glitchLevel: function() {
		if(server || this.singlePlayer) {

			if(Date.now() > this.lastGlitch + 3000) {
				this.lastGlitch = Date.now();
				// 
				var lvl = this.level[flr(Math.random()*this.level.length)];

				lvl.type = ["Hidey","Broken","Actor"][flr(Math.random()*3)];

				if(server) {
					// console.log(this.players)
					for(var i in this.players){

						// console.log(i)
						this.players[i].socket.emit("levelGlitch",{id:lvl.id, type:lvl.type});
					}
				}

			}	
		}
		
	},

	spawnEnemies: function() {
		// this.enemiesToSpawn = this.deadEnemies + 1;
		// this.deadEnemies = 0;
		if(this.enemies.length < this.enemiesToSpawn) {

			if(Date.now() > this.spawnTime + 5000) {//3,10
				this.enemies.push(newPlayer({game: this, x:32*8, y:[2,10,17,24][flr(Math.random()*4)]*8, w: 8, h: 16, type:"Enemy", style:"guy", shp:0, fillStyle: "orange"}));
				this.spawnTime = Date.now();
			}
		} else this.spawningEnemies = false;
		// console.log(this.enemies.length)

	},

	// getPath: function(source) {
	// 	var pl = this.player,
	// 		px = flr(pl.x/8),
	// 		py = flr(pl.y/8),
	// 		sx = flr(source.x/8),
	// 		sy = flr(source.y/8);
	// 	if(px < 0) px = 0;
	// 	if(py < 0) py = 0;
	// 	if(sx < 0) sx = 0;
	// 	if(sy < 0) sy = 0;
	// 	var opts = {diagonal: true, portals: this.portals},
	// 		graph = new Graph(this.grid,opts),
	// 		start = graph.grid[sy][sx],
	// 		end = graph.grid[py][px];
	// 	if(!end.isWall())
	// 		return astar.search(graph,start,end,opts);
	// 	else return [];
	// },


	newLevelPiece: function(options) {
		for(var y=0; y<options.h; y++) {
			for(var x=0; x<options.w; x++)
				this.grid[options.y+y][options.x+x] = 0;
		}
		options.x *= 8;
		options.y *= 8;
		options.w *= 8;
		options.h *= 8;
		var np = new Actor(options);

		// np.shp = options.shp;
// console.log(np.shp)

		// np.style = options.style;
		// console.log(np.game.assets[np.style].shapes[np.shp])
		// console.log(np.game.assets[np.style])

		

		// np.visCountDown = 0;
		np.visLength = 2000;
		np.visTime = 0;

		

		np.update = function(timestep) {
			switch(this.type) {
				case "Broken":
					if(!this.visible) {
						if(Date.now() > this.visTime)
							this.visible = true;
					}
					this.rL.x = this.x + flr(Math.random() * 2) - 1;
				case "Actor":
					this.alpha = 1;
				break;
				case "Hidey":
					if(flr(this.game.gameTime()/10000)%2 === 0)
						this.alpha = Math.random()/10 + 0.6;
					this.rL.y = this.y + flr(Math.random() * 2) - 1;
				break;

			
			}
		};

		var render = np.render;
		np.render = function(draw) {
			render(draw,this);
		};

		np.hit = function(time) {
			if(this.type === "Broken"
			&& this.visible) {
				this.visTime = time || Date.now() + this.visLength;
				this.visible = false;
			}
		};

		return np;
	},

	gameTime: function() {
		return Date.now() - this.gameStartTime;
	},

	matchOver: function() {
		//  PAUSE THE MATCH, IT IS OVER
		this.pause = true;

		if(this.singlePlayer) {
			this.matchEnded = true;
			this.gameEnded = true;
			console.log("dead enemies", this.deadEnemies)
			var self = this;
			setTimeout(function() {
				self.disconnect();
				location.reload();
			},5000)
			return;

		}

		//  SET WINNER TO NULL
		this.winner = null;
		//  CHECK IF ANY PLAYER IS NOT DEAD, THAT PLAYER IS THE WINNER
		for(var i in this.players) {
			var ply = this.players[i];
			if(!ply.dead) {
				this.winner = ply.id;
				//  ADD WIN TO THE PLAYERS PROFILE
				ply.wins++;
				//  END GAME IF PLAYER HAS ENOUGH WINS
				if(ply.wins === 3)
					this.gameEnded = true;;
			}
		}

		for(var i in this.players) {
			var ply = this.players[i];
			ply.socket.emit("matchEnd",{ 
				winner: this.winner,
				gameEnded: this.gameEnded
			});
			//  IF THE GAME IS OVER
			if(this.gameEnded) {
				ply.socket.emit("gameEnded");
				delete this.players[i];
			}
		}
		
		if(!this.gameEnded) {
			var self = this;
			setTimeout(function() {
				self.loadLevel();
			},2000);
		}
	},

	begin: function(game, timestamp, frameDelta) {
		if(server) {
			//  CHECK IF GAME IS OVER

			if(!game.matchEnded
			&& game.deadPlayers >= game.playerCount-1) {
				console.log("gameEnding")

				game.matchOver();
				game.matchEnded = true;
			}


			game.serverProcessInput();

			//  CALL .begin() ON ALL PLAYERS

			for(var i in game.players)
				game.players[i].begin();
		}
		else {//  CLIENT
			//  CALL .begin() ON CLIENT'S PLAYER
			game.player.begin();

			if(!game.singlePlayer) {

				//  PROCESS SERVER UPDATES
				//  UPDATES CLIENT'S PLAYER AND REAPPLY'S ANY UNSIMULATED INPUT
				game.syncClientsPlayer();
				//  UPDATES THE OTHER PLAYERS WITH A DELAY TO SMOOTH OUT THEIR MOVEMENT
				game.syncNetworkPlayers();
			}

			//  PROCESS INPUT AND SEND IT TO THE SERVER
			game.clientProcessInput(timestamp);
		}
	},

	update: function(game, timestep) {
		// if(game.matchEnded)
		if(game.bgCh)
			game.changeBackground();
		//  UPDATE LEVEL PIECES
		for(var i=0,iL=game.level.length; i<iL; i++)
			game.level[i].update(timestep);

		if(!game.pause) {
			for(var i=0,iL=game.enemies.length; i<iL; i++) {
				var enm = game.enemies[i];
				// console.log(enm.id)
				enm.update(timestep);
				for(var j=0,jL=game.level.length; j<jL; j++) {
					var lvl = game.level[j];
					if(lvl.visible
					&& enm.collidesWith(lvl,game.response))
						enm.respondToCollision(game.response);
				}
			}
		}

		if(game.singlePlayer 
		&& game.deadEnemies === game.enemiesToSpawn) {
			console.log(game.deadEnemies,game.enemies.length)
			// game.enemies = [];
			game.enemiesToSpawn += game.difficulty++;
			// game.deadEnemies = 0;
			game.spawningEnemies = true;
		}
		if(game.spawningEnemies)
			game.spawnEnemies();

		game.glitchLevel();
		
		
		if(server) {
			//  
			updateBullets();
			//  THE SERVER UPDATES ALL THE PLAYERS
			for(var i in game.players) {
				var player = game.players[i];
				//  UPDATE ALL PLAYERS
				player.update(timestep);

				//  ALL PLAYERS COLLIDE WITH LEVEL PARTS
				for(var j=0,jL=game.level.length; j<jL; j++) {
					game.level[j].update(timestep);
					if(game.level[j].visible
					&& player.collidesWith(game.level[j],game.response))
						player.respondToCollision(game.response);
				}

				
			}
		//  THE CLIENTS ONLY UPDATE THEIR OWN PLAYER
		} else {
			//  I'M NOT SURE IF THE CLIENT SHOULD BE DELETING BULLETS IN ONLINE PLAY
			//  THEY MAY BE RE ADDED DURING THE NEXT SERVER UPDATE.  MAY HAVE TO TEST THAT
			//  MIGHT DOUBLE HIT PEOPLE...
			updateBullets();
			var ply = game.player;
			//  UPDATE ALL PLAYERS
			ply.update(timestep);
			

			//  ONLY CLIENT PLAYER COLLIDES WITH BOX
			for(var i=0,iL=game.level.length; i<iL; i++) {
				game.level[i].update(timestep);
				if(game.level[i].visible
				&& ply.collidesWith(game.level[i],game.response))
					ply.respondToCollision(game.response);
			}

			for(var i=0,iL=game.activeExplosions.length; i<iL; i++) {
				var exp = game.activeExplosions[i];
				if(exp) exp.update(timestep);
			}

			
		}

		function updateBullets() {
			//  FOR EACH PLAYER
			for(var i in game.bullets) {
				//  FOR EACH PLAYER'S BULLETS
				for(var j in game.bullets[i]) {
					var bullet = game.bullets[i][j];
					if(bullet) {
						//  REMOVE BULLET IF IT IS OLD
						if(Date.now() > bullet.fT + 500)
							delete game.bullets[i][j];
						//  OTHERWISE UPDATE IT
						else {

							bullet.update(timestep);
							for(var k=0,kL=game.level.length; k<kL; k++) {
								if(game.level[k].visible
								&& game.level[k].type !== "Hidey"
								&& bullet.collidesWith(game.level[k],game.response)) {
									game.bulletHit(game.response);
									delete game.bullets[i][j];
									continue;
								}
							}
							for(var k=0,kL=game.enemies.length; k<kL; k++) {
								var enm = game.enemies[k];
								if(enm.dead
								|| enm.id === bullet.parent.id)
									continue;
								if(bullet.collidesWith(enm,game.response)) {
									game.bulletHit(game.response);
									delete game.bullets[i][j];
									continue;
								}
							}
							for(var k in game.players) {
								var ply = game.players[k];
								
								//  IF THIS PLAYER IS DEAD, OR PARENT OF THE BULLET (YOU CAN'T HIT YOURSELF)
								if(ply.dead
								|| ply.id === bullet.parent.id)
									continue;

								//  CHECK FOR COLLISION WITH PLAYER
								if(bullet.collidesWith(ply,game.response)) {
									game.bulletHit(game.response);
									// console.log("hit player",bullet.pos.clone().sub(game.response));
									delete game.bullets[i][j];
									continue;
								}
							}
						}
					}
				}
			}
		}
	},

	bulletHit: function(hit) {
		if(server || this.singlePlayer) {
			
			// this.hit.copy(hit).add(hit.self.pos);
			//  THE LOCATION OF THE BULLET WHEN IT HIT
			// console.log(hit.self)
			this.hit.copy(hit.self.centre());

			//  BUILD A HIT MESSAGE TO SEND TO ALL PLAYERS
			var oS = hit.otherShape,
				msg = {
					x: this.hit.x,
					y: this.hit.y
				};

			if(!oS.damaged) {
				switch(oS.type) {
					case "Player":
						// console.log(oS.centre(),hit.self.centre())
						this.knockBack.copy(oS.centre()).sub(hit.self.centre());
						this.players[oS.id].takeDamage(1,this.knockBack)

						msg.hurt = oS.id;
						msg.knockBack = {
							x: this.knockBack.x,
							y: this.knockBack.y
						}
					break;
					case "Broken":
						oS.hit();
						// oS.visible = false;
						// oS.visCountDown = oS.visTime;
						msg.damaged = oS.id;
						msg.time = oS.visTime;
					break;
					case "Enemy":
						oS.takeDamage(1,this.knockBack);
					break;
					// case "Hidey"
				}

				//  SERVER EMITS THE HIT MESSAGE TO ALL PLAYERS
				if(server) {
					for(var i in this.players) 
						this.players[i].socket.emit("hit",msg);
				}

				//  PLACE EXPLOSIONS FOR SINGLE PLAYER
				if(this.singlePlayer) {
					this.explosions.pop().explode({
						x: this.hit.x,
						y: this.hit.y
					})
					// console.log(this.hit.x,this.hit.y)
				}
			}
				
				//  IF A PLAYER WAS HIT, IT TAKES DAMAGE (ON THE SERVER OR SINGLE PLAYER)
			
		}
	},

	render: function(game, intPer) {
		if(!game.bgCh)
			game.draw.clearRect(0,0,game.canvas.width,game.canvas.height);

		game.draw.save();
		game.draw.translate(game.off.x,game.off.y);
		game.draw.scale(game.scl,game.scl);
		//  DRAW BACKGROUND
		// game.draw.fillStyle = "blue";
		game.draw.beginPath();
		game.draw.rect(0,0,game.w,game.h);
		game.draw.closePath();
		game.draw.clip();
		game.draw.drawImage(game.bgB,0,0);
	    // game.draw.fill();			
		
		

		//  RENDER PLAYERS
		for(var i in game.players) {
			var ply = game.players[i];
			ply.render(game.draw);
			if(ply === game.player) {
				circle(game.draw,ply.x+4,ply.y-4, 2);
				game.draw.fillStyle = "orange";
				game.draw.fill();
			}
			for(var j in game.bullets[i]) {
				if(game.bullets[i][j])
					game.bullets[i][j].render(game.draw);
			}
		}
		//  RENDER ENEMIES
		for(var i=0,iL=game.enemies.length; i<iL; i++) {
			var enm = game.enemies[i];
			enm.render(game.draw);
			// var path = enm.path;
			for(var j in game.bullets[enm.id]) {
				if(game.bullets[enm.id][j])
					game.bullets[enm.id][j].render(game.draw);
			}
		}

		//  RENDER LEVEL
		for(var i=0,iL=game.level.length; i<iL; i++)
			game.level[i].render(game.draw);

		//  RENDER EXPLOSIONS
		for(var i=0,iL=game.activeExplosions.length; i<iL; i++) {
			var exp = game.activeExplosions[i];
			exp.render(game.draw);
		}

		for(var i=0; i<game.player.health; i++) {
			circle(game.draw,16*(i+1),8,4);
			game.draw.fillStyle = "orange";
			game.draw.fill();
			game.draw.fillStyle = "black";
			if(!game.singlePlayer)
				game.draw.fillText("Player: "+ game.player.id.substr(0,6),96,12)
		}

		if(game.pause) {

			game.draw.fillStyle = "black";

			if(Date.now() < game.startAt) {
				game.draw.font = font(30);
				game.draw.fillText("Starting in: " + (game.startAt - Date.now())/1000,80,100);
			}
			
			if(game.matchEnded && !game.gameEnded) {
				game.draw.font = font(50);
				game.draw.fillText("Match Ended",50,50);
				var count = 0;
				game.draw.font = "18px arial";
				for(var i in game.players) {
					game.draw.fillText(game.players[i].id.substr(0,6)+": "+game.players[i].wins,10,100 + 20*count++);
				}
			} 
			if(game.gameEnded) {
				game.draw.font = font(50);
				game.draw.fillText("Game Over",50,50);
				game.draw.font = "18px arial";
				if(game.singlePlayer) {
					//  WRITE STUFF HERE
					game.draw.fillText("You killed " + game.deadEnemies + " enemies!",75,100);
				} else {
					
					var count = 0;
					for(var i in game.players) {
						if(i === game.winner)
							game.draw.fillText("WINNER",100,100 + 20*count);
						game.draw.fillText(game.players[i].id.substr(0,6)+": "+game.players[i].wins,10,100 + 20*count++);
					}
				}
			}
		}

		
		game.draw.restore();
		

		if(mobile) {
			if(game.tStk.id !== 0) {
				circle(game.draw,game.tStk.x,game.tStk.y,64);
				game.draw.fillStyle = "rgba(100,100,100,0.3)";
				game.draw.fill();
				circle(game.draw,game.touches[game.tStk.id].x,game.touches[game.tStk.id].y,64);
				game.draw.fill();
			}


			game.draw.fillStyle = "rgba(100,100,100,0.5)";
			circle(game.draw,game.fBtn.x,game.fBtn.y,64);
			game.draw.fill();
			circle(game.draw,game.jBtn.x,game.jBtn.y,64);
			game.draw.fill();
		}

		


		
	},

	end: function(game, fps, panic) {
		for(var i in game.players)
			game.players[i].end();
	},

	disconnect: function(user) {
		//  ON THE SERVER JUST SET THAT CHARACTER'S connected TO FALSE
		//  IT WILL REMOVE ITSELF FROM EVERYONE'S GAME
		if(server) {
			if(this.players[user])
				this.players[user].connected = false;
		//  ON A CLIENT STOP THE GAME ENTIRELY
		} else {
			this.mainLoop.stop();
			this.draw.clearRect(0,0,this.canvas.width,this.canvas.height);
			this.cover.style.left = "0px";
		}
	},

	//  IF THERE ARE ANY STORED SERVER STATES
	//  SET THE CLIENT'S PLAYER TO THE LOCATION KNOWN ON THE SERVER
	//  THEN REAPPLY ANY INPUT THE SERVER HASN'T SIMULATED
	syncClientsPlayer: function() {
		//  CYCLE THROUGH EACH THE SERVER UPDATE
		for(var i=0,iL=this.serverUpdates.length; i<iL; i++) {
			//  UPDATE
			var upd = this.serverUpdates[i],
			//  PLAYER UPDATE
				pUp = upd[this.socket.id]

			//  WE ONLY NEED TO CHECK EACH UPDATE ONCE
			//  THE syncNetworkPlayers FUNCTION DELETES OLD ONES
			if(!upd || upd.checked) continue;
			//  MARK AS CHECKED SO WE DON'T CHECK IT AGAIN
			upd.checked = true;

			//  THE LAST INPUT CHECKED THAT WE WILL SIMULATE ANY NEW INPUT SINCE
			this.player.lastInput = pUp.lastInput;

			//  INDEX
			var j = 0;

			//  AS LONG AS THE CLIENT'S PLAYER HAS PENDING INPUT
			while(j<this.player.pInp.length) {
				var input = this.player.pInp[j],
					dis = 0;

				//  IF THE INPUT HAS ALREADY BEEN SIMULATED ON THE SERVER
				if(input.inputSeq <= this.player.lastInput) {
					if(input.inputSeq === this.player.lastInput) {

						//  USE CACHED VARIABLES TO SAVE GARBAGE
						//  UPDATE VECTOR
						this.upV.copy(pUp);
						//  INPUT VECTOR
						this.inV.copy(input.pos);
						//  DISTANCE BETWEEN THEM
						dis = this.upV.dis(this.inV);
						//  IF IT IS LARGE, SNAP TO POSISITION}
						if(dis > 2) 
							this.player.pos.copy(this.upV);
						//  IF SMALL, EASE IT OVER
						else if(dis > 0.01)
							this.player.pos.add(this.upV.sub(this.inV).scl(0.1));
						//  UPDATE THE VELOCITY
						this.player.vel.copy(pUp.vel);
					}
					//  REMOVE IT FROM THE ARRAY AND DON'T INCREMENT THE INDEX
					this.player.pInp.splice(0,1);
				} else {
					//  IF THE INPUT HASN'T BEEN SIMULATED ON THE SERVER, REAPPLY IT
					this.player.applyInput(input,true);
					//  INCREMENT INDEX
					j++;
				}
			}

			//  ALSO SYNC BULLETS, SINCE WE HAVE THE MOST RECENT UPDATE CACHED
			this.syncBullets(upd.bullets);
		}
	},

	//  SET PLAYERS CONTROLLED BY OTHER PEOPLE ON THE NETWORK
	//  TO THE SERVER POSITION FROM 100ms AGO TO SMOOTH OUT LAG
	syncNetworkPlayers: function() {
		// if(!this.serverUpdates.length)
			// return;

		var time = this.serverTime + (Date.now() - this.updateTime) - this.netLatency,
			lastState = null,
			nextState = null,
			player = null,
			//  INTERPOLATION PERCENTAGE
			intPer = 0,
			trim = -1;

		for(var i=0,iL=this.serverUpdates.length-1; i<iL; i++) {

			var lastState = this.serverUpdates[i],
				nextState = this.serverUpdates[i+1];

			if(this.serverTime - lastState.time > 10000) {
				trim = i;
				continue;
			}

			if(time >= lastState.time && time < nextState.time)
				break;
		}
		if(lastState && nextState) {

			//  WHERE WE ARE BETWEEN FRAMES
			intPer = (time - lastState.time) / (nextState.time - lastState.time);

			for(var i in this.players) {
				player = this.players[i];
				
				//  AS LONG AS EVERYTHING EXISTS
				if(!player 
				|| player.id === this.player.id
				|| nextState[player.id] === undefined
				|| lastState[player.id] === undefined)
					continue;

				//  IF THIS PLAYER HAS DISCONNECTED, REMOVE HIM
				if(lastState[player.id].connected === false
				|| nextState[player.id].connected === false) {
					delete this.players[player.id];
					continue;
				}

				//  REUSE CACHED VARIABLES
				this.inV.copy(lastState[player.id]);
				this.upV.copy(nextState[player.id]);
				this.disV.copy(this.upV).sub(this.inV);

				//  IF IT CROSSED THE EDGES OF THE SCREEN
				if(this.inV.dis(this.upV) > 64)
					player.pos.copy(this.upV).sub(this.disV.scl(1/intPer));
				//  NORMAL CASE
				else player.pos.copy(this.inV).add(this.disV.scl(intPer))

				// console.log(lastState[player.id].fV)
				player.fV.copy(lastState[player.id].fV);
				player.aimWeapon();



			}
		}
		if(trim >= 0)
			this.serverUpdates.splice(0,trim+1);		
	},

	clientProcessInput: function(timestamp) {
		// Compute delta time since last update.
		var player = this.player,
			now_ts = Date.now(),
			last_ts = this.last_ts || now_ts,
			dt_sec = (now_ts - last_ts) / 1000.0;
		this.last_ts = now_ts;

		if(this.pause) {
			if(!this.matchEnded
			&& Date.now() > this.startAt)
				this.pause = false;
			// console.log(this.pause)

			return;
		}

		if(player.dead)
			return;

		
		
		



		// Package player's input.
		var input = {
			pos: player.pos,
			vel: player.vel
		};

		if(this.keyRight)
			input.xAxis = dt_sec;
		if(this.keyLeft)
			input.xAxis = -dt_sec;
		if(this.keyUp)
			input.yAxis = -dt_sec;
		if(this.keyDown)
			input.yAxis = dt_sec;
		if(this.keySpace)
			input.space = true;
		if(this.keyC)
			input.c = dt_sec;
		if(this.keyV)
			input.v = dt_sec;
		
		//  SENDING A MESSAGE EVERY FRAME MAKES RESIMULATING GRAVITY MUCH EASIER
		//  AND DOESN'T SEEM TO SLOW ANYTHING DOWN

		// if(!this.keyRight
		// && !this.keyLeft
		// && !this.keyUp
		// && !this.keyDown)
		// // Nothing interesting happened.
		// 	return;

		// Send the input to the server.
		input.inputSeq = this.inputSeq++;
		input.playerID = player.id;
		input.time = now_ts;


		if(!this.singlePlayer) {
			this.socket.emit("input",input);
			// Save this input for later reconciliation.
			this.player.pInp.push(input);
		}
		// Do client-side prediction.
		this.player.applyInput(input);
	},

	serverReceiveInput: function(game,input) {
		//  STORE ANY INCOMING INPUT ON THE PLAYER IT IS FOR
		if(game.players[input.playerID])
			game.players[input.playerID].pInp.push(input);
		// console.log(game.players[input.playerID].x)
	},

	serverProcessInput: function() {
		// for(var h=0,hL=this.players.length; h<hL; h++) {
			// var player = this.players[h];

		//  FOR EACH PLAYER
		for(var h in this.players) {
			var player = this.players[h];

			//  FOR EACH PENDING INPUT
			for(var i=0,iL=player.pInp.length; i<iL; i++) {
				var input = player.pInp[i];

				//  APPLY THE INPUT
				player.applyInput(input);
				//  SET IT AS THE LAST SEQUENCED INPUT
				player.lastInput = input.inputSeq;
			}
			//  WHEN ALL DONE, CLEAR THE INPUT ARRAY
			player.pInp = [];
		}
	},

	syncBullets: function(bullets) {
		//  bullets IS AN OBJECT WITH AN OBJECT OF BULLETS FOR EACH PLAYER
		//  FOR EACH PLAYER
		for(var i in bullets) {
			//  ONLY SYNC NETWORK PLAYERS BULLETS
			if(i !== this.player.id) {

				//  FOR EACH BULLET IN THE GIVEN bullets OBJECT
				for(var j in bullets[i]) {
					var blt = bullets[i][j];
					//  IF IT DOESN'T EXIST IN this.bullets, THEN ADD IT
					if(!this.bullets[i][j]) {
						this.addBullet({
							x: blt.pos.x,
							y: blt.pos.y,
							vel: blt.vel,
							fT: blt.fT,
							id: j,
							parent: this.players[i]
						});
					}
				}
			}
		}
	},

	addBullet: function(options) {
		var self = this;
		var blt = new Actor({
			game: self,
			x: options.x,
			y: options.y,
			w: 4,
			h: 4,
			type: "Bullet",
			fillStyle: "black"
		});
		blt.parent = options.parent;
		// console.log(options.vel)
		blt.vel = V().copy(options.vel)//.add(blt.parent.vel);
		blt.fT = options.fT;
		blt.id = options.id;
		
		this.bullets[options.parent.id][options.id] = blt;
	},

	constrainToScreen: function(actor) {
		if((actor.x < 0 || actor.x + actor.w > this.w)
		|| (actor.y < 0 || actor.y + actor.h > this.h)) {
			// switch(actor.type) {
			// 	case "Bullet":
			// 	case "Player":
			// 	case "Enemy":
					if(actor.centreX() < 0)
						actor.x += this.w;
					else if(actor.centreX() > this.w)
						actor.x -= this.w;

					if(actor.centreY() < 0)
						actor.y += this.h;
					else if(actor.centreY() > this.h)
						actor.y -= this.h;
				// break;
			// }
		}
	},
	changeBackground: function() {
		this.bgC.fillStyle = "cornflowerblue";
		for(var i=0; i<5; i++) {
			var x = this.bgI % 26,
				y = flr(this.bgI/26);

			// this.bgC.fillRect(x*16,y*16,16,16);
			this.bgC.drawImage(this.bgB2,x*16,y*16,16,16,x*16,y*16,16,16)
			this.bgI++;
		}
		if(this.bgI === 26 * 15)
			this.bgCh = false;
	},
	
};



function newExplosion(game) {
	var xp = new Actor({game:game});
	xp.game = game;
	xp.type = "Explosion"
	xp.visible = false;
	xp.fillStyle = "white";
	xp.explode = function(options) {
		this.x = options.x  - 10;
		this.y = options.y - 10;
		this.w = 2;
		this.h = 2;
		this.alpha = 1;
		this.visible = true;
		game.activeExplosions.push(this);
	};
	xp.update = function(timestep) {
		this.alpha *= 0.9;
		this.x -= this.w * 0.05;
		this.y -= this.h * 0.05;
		this.w *= 1.1;
		this.h *= 1.1;

		// console.log(this.alpha,this.w,this.h)


		// console.log(this.w,this,h,this.alpha)

		if(this.alpha < 0.1) {
			game.activeExplosions.splice(game.activeExplosions.indexOf(this),1);
			game.explosions.push(this);
		}
	};
	return xp;
}

var npID = 2;
function newPlayer(options) {
	var np = new Actor(options);
	np.speed = 300;
	np.accel = 3;
	//  PLAYERS MAX VELOCITY IS DIFFERENT THAN STANDARD ACTORS
	// np.mV = 4;
	//  PLAYERS GRAVITY IS DIFFERENT THAN STANDARD ACTORS
	np.gravity = 0.01;
	np.moveVec = V(0.3,0);

	switch(np.type){
		case "Player":
			// np.gravity = 0.01;
			//  FIRING INTERVAL, TIME BETWEEN BULLETS
			np.fI = 300;
			// np.health = 5;

		break;
		case "Enemy":
			
			np.id = npID++;
			np.game.bullets[np.id] = {};

			//  FIRING INTERVAL, TIME BETWEEN BULLETS
			np.fI = 600;
			np.health = options.health || 1;

			// np.pathTime = 0;
		break;
	}

	//  GROUNDING
	np.grounded = false;
	//  JUMP POWER
	np.jP = 40;
	//  JUMP TIME, HOW LONG YOU CAN JUMP FOR
	np.jT = 0.12;
	//  JUMP TIMER, HOW LONG YOU HAVE LEFT IN YOUR JUMP
	np.jTr = np.jT;
	
	np.pInp = [];
	np.lastInput = -1;
	np.flipped = false;
	np.flip = false;

	np.fired = false;
	//  FIRING TIME, WHAT TIME YOU FIRED AT
	np.fT = 0;
	
	//  FIRING VECTOR, THE ANGLE YOU FIRE AT
	np.fV = V();
	//  FIRING SPEED, HALF THE HORIZONTAL OR VERTICAL SPEED OF YOUR SHOT
	np.fS = 12;

	np.tempVec = V();

	//  USED TO REMOVE DISCONNECTED PLAYERS FROM ONLINE MULTIPLAYER
	np.connected = true;

	np.damaged = false;

	np.wins = 0;
	np.dead = false;

	//  CACHE SUPER update FUNCTION
	var upd = np.update;
	//  REASSIGN update FUNCTION FOR PLAYER OBJECTS
	np.update = function(timestep) {
		//  CALL CACHED SUPER update FUNCTION
		upd(timestep, this);
		if(this.type === "Player") {
			// console.log(this)
			// console.log(this.fV.octDir());
		}
		// this.fV.sub(this.pos).normalize().scl(this.fS);

		//  TURN OFF DAMAGED
		if(this.damaged && Date.now() > this.damaged)
			this.damaged = false;

		if(this.damaged)
			this.fillStyle = "white";
		else {
			if(this.type === "Player")
				this.fillStyle = "purple";
			else this.fillStyle = "orange";
		}

		//  RESET fired STATUS IF NECESSARY
		//  THIS MAYBE SHOULD GO IN THE end FUNCTION
		if(this.fired && Date.now() > this.fT + this.fI)
			this.fired = false;

		if(this.type === "Enemy"
		&& !this.dead) {
			if(this.vel.y > 3 && !this.flip) {
				this.flip = true;
				this.vel.x *= Math.random() > 0.5 ? -1 : 1;
			}
			if(this.vel.y < 0.3)
				this.flip = false;
			// console.log(Math.abs(this.vel.y) < 0.3);
			// if(Math.abs(this.vel.y) > 0.3) {
				// this.moveVec.y = 0;
				
				// if(Math.random() > 0.5) {
					// this.moveVec.x *= -1;
					// console.log(this.moveVec)
				// }
			// }

			this.vel.x += this.moveVec.x  * (1/timestep);

			
			// console.log(this.id)
			// if(this.dead) return;
			// if(now() > this.pathTime + 100) {
			// 	this.path = this.game.getPath(this);
			// 	this.pathTime = now();
			// }
			// if(this.path.length > 1) {
			// 	//  THE LOCATION WE WANT TO MOVE TO (2ND NODE IN PATH)
			// 	this.moveVec.copy(this.path[1]).scl(8);
			// 	//  SET OUR VELOCITY TO THAT POSITION MINUS OUR POSITION, SCALED TO THE TIMESTEP
			// 	this.vel.copy(this.moveVec).sub(this.pos).scl(1/timestep).scl(0.8);
			// 	//  IF THE DISTANCE FROM US TO 
			// 	if(this.pos.dis(this.moveVec) > 100) 
			// 		this.vel.inv();
				
				
			// }
			// if(this.path.length < 6) {
			if(this.pos.dis(this.game.player) < 100) {
				this.fV.copy(this.game.player.pos);
				//  TARGET POSITION MINUS YOUR POSITION = YOUR FIRING VECTOR
				this.tempVec.copy(this.game.player.pos).sub(this.pos);
				//  SWITCH FIRING DIRECTION IF THE FIRING VECTOR IS ACROSS THE EDGE OF THE MAP
				if(this.tempVec.mag() > 100) {
					//  IF EITER AXIS IS OVER 50 PIXELS, IT IS ACROSS THE EDGE OF THE MAP
					//  MOVE THE FIRING VECTOR UP/DOWN AND LEFT/RIGHT, DEPENDING ON THE (+/-) SIGN OF THE DISTANCE
					if(Math.abs(this.tempVec.x) > 50)
						this.tempVec.x > 0 ? this.fV.x -= this.game.w : this.fV.x += this.game.w;
					if(Math.abs(this.tempVec.y) > 50)
						this.tempVec.y > 0 ? this.fV.y -= this.game.h : this.fV.y += this.game.h;
				}
				//  THE ADJUSTED FIRING VECTOR, MINUS YOUR POSITION
				//  NORMALIZED TO STRIP DISTANCE, AND JUST KEEP DIRECTION
				//  SCALED TO THE FIRING SPEED OF THE ENEMY
				this.fV.sub(this.pos).normalize().scl(this.fS);
				np.fireBullet({});
			}

		}

		if(!server) {
			this.aimWeapon();
		}



	};
	np.aimWeapon = function() {
		this.rL.copy(this.pos).sub({x:8,y:8});
		var shps = this.game.assets[this.style].shapes;
		switch(this.fV.octDir()) {
			case 0:
				this.shp = shps[5];
			break;
			case 1:
				this.shp = shps[7];
			break;
			case 2:
				this.shp = this.flipped ? shps[8] : shps[9];
			break;
			case 3:
				this.shp = shps[6];
			break;
			case 4:
			case -4:
				this.shp = shps[4];
			break;
			case -3:
				this.shp = shps[2];
			break;
			case -2:
				this.shp = this.flipped ? shps[0] : shps[1];
			break;
			case -1:
				this.shp = shps[3];
			break;

				
		}
	},

	np.fireBullet = function(input) {
		// input = input || {};
		if(!this.fired) {
			this.game.addBullet({
					x: this.x+4,
					y: this.y+4,
					vel: this.fV,
					fT: Date.now(),
					id: input.inputSeq || 0,
					parent: this
				});
				this.fT = Date.now();
				this.fired = true;
			};
		}

	np.takeDamage = function(dmg,dir) {
		if(!server) {
			if(this === this.game.player)
				Sfx.play("hurt",0.5,false);
			else Sfx.play("hit",0.5,false);
		}
		if(this.dead) return;
		this.health -= dmg;

		if(this.health <= 0) {
			this.dead = true;
			switch(this.type) {
				case "Player":
					if(!server) {
						if(this === this.game.player)
							Sfx.play("died",0.5,false);
						else Sfx.play("kill",0.4,false);
					}
						
						console.log("you dead");
					
					this.game.deadPlayers++;
					if(this.game.singlePlayer)
						this.game.matchOver();
				break;
				case "Enemy":
					// Sfx.play("hit",1,false)
					if(!server) Sfx.play("kill",0.4,false);
					this.game.explosions.pop().explode({
						x: this.pos.x,
						y: this.pos.y
					})
					this.vel.clear();
					this.gravity = 0.01;
					this.game.deadEnemies++;
				break;
			}
			
		}
		//  KNOCKBACK FROM DIRECTION OF ATTACK

		this.vel.add(dir.normalize().scl(5));

		this.damaged = Date.now() + 100;

	};

	np.applyInput = function(input,reconciling) {
		// console.log(input)
		if(input.c
		&& this.jTr > 0) {
			
			//  IF THERE IS LESS TIME LEFT IN THE JUMP THAN IN THE INPUT,
			//  ONLY JUMP FOR THE APPROPRIATE AMOUNT OF TIME
			var up = input.c < this.jTr ? input.c : this.jTr;
			this.vel.y -= up * this.jP;
			
			if(!reconciling
			&& !server
			&& this.jTr === this.jT)
				Sfx.play("jump",0.5,false)
			this.jTr -= input.c;
			
			// console.log(this.jTr,up,this.jP,this.vel.y)
		}

		
		//  IF PRESSING LEFT OR RIGHT
		if(input.xAxis) {
			//  ADD TIME * ACCELERATION	TO HORIZONTAL VELOCITY
			this.vel.x += input.xAxis * this.accel;

			//  IF YOU ARE PRESSING THE OPPOSITE DIRECTION OF MOVEMENT,
			//  WE NEED TO APPLY FRICTION, SO SLOWING DOWN HAPPENS PROPERLY
			if((this.vel.x < 0 && input.xAxis > 0)
			|| (this.vel.x > 0 && input.xAxis < 0))
				this.vel.x *= 0.95;

			//  FLIP THE CHARACTER DEPENDING ON WHICH WAY THEY ARE PRESSING
			if(input.xAxis < 0)
				this.flipped = true;
			else this.flipped = false;
		//  IF NOT PRESSING MOVE
		} else {
			//  APPLY FRICTION WHEN ON THE GROUND
			if(this.grounded)
				this.vel.x *= 0.95;
		}



		

		//  FIRE WEAPON
		if(!this.fired) {
			this.fV.clear();
			
			//  AIMING DIAGONALLY
			if(input.xAxis && input.yAxis) {
				this.fV.x += input.xAxis > 0 ? this.fS : -this.fS;
				this.fV.y += input.yAxis > 0 ? this.fS : -this.fS;

			//  AIMING UP OR SIDEWAYS
			} else {
				if(input.xAxis)
					this.fV.x += input.xAxis > 0 ? this.fS*2 : -this.fS*2;
				else if(input.yAxis)
					this.fV.y += input.yAxis > 0 ? this.fS*2 : -this.fS*2;
				else this.fV.x += this.flipped ? -this.fS*2 : this.fS*2;

			}

			// console.log(this.fV)
			if(input.v) {
				this.fireBullet(input);

				if(Sfx)
					Sfx.play("fire",0.2,false)
			}
		}

		


		if(reconciling)
			this.applyMovement();
	};

	np.respondToCollision = function(response) {
		switch(response.otherShape.type) {
			case "Spikes":
			//  SPIKES DO DAMAGE
				
				if(!this.damaged) {
					// console.log(this.damaged)
					this.game.knockBack.copy(response.self).sub(response.otherShape)
					if(server || this.game.singlePlayer)
						this.takeDamage(1,this.game.knockBack);
					if(server) {
						for(var i in this.game.players) {
							this.game.players[i].socket.emit("hit",{
								hurt: this.id,
								knockBack: {
									x: this.game.knockBack.x,
									y: this.game.knockBack.y
								}
							})
						}
					}	
				}
				
				
			break;
			case "Hidey":
			//  SPIKES DO DAMAGE
				// this.game.knockBack.copy(response.self).sub(response.otherShape)
				// this.takeDamage(1,this.game.knockBack);
				return;
			break;

		}
		
		switch(response.collisionSide) {
			case "top":
				//  WHEN TOUCHING THE TOP OF ANOTHER OBJECT (WITH YOUR FEET) YOU CAN JUMP AGAIN
				//  RESET JUMP TIMER TO JUMP TIME
				this.grounded = true;
				this.jTr = this.jT;
				// if(Math.abs(this.vel.x) < 0.5)
					// this.moveVec.x = Math.random() > 0.5 ? -1 : 1;
			case "bottom":
				this.vel.y = 0;
			break;
			case "left":
				if(this.vel.x > 0)
					this.vel.x = 0;
				this.moveVec.x = -1;
			break;
			case "right":
				if(this.vel.x < 0)
					this.vel.x = 0;
				this.moveVec.x = 1;
			break;
		}
		

		



		//  MOVE THIS OBJECT OUT OF THE OTHER SHAPE
		this.pos.add(response);

		this.game.constrainToScreen(this);
	};
	return np;
}

function Actor(options) {
	// GenObj.call(this,options);
	options = options || {};
	this.pos = V(options.x,options.y);
	this.w = options.w || 0;
	this.h = options.h || 0;

	this.game = options.game;
	this.type = options.type || "Actor";

	// 
	var shp = options.shp;
		
	if(!server && shp >= 0) {
		// console.log(this.type,shp)
		
		this.style = options.style;
		var asset = this.game.assets[this.style];
		this.shp = asset.shapes[shp];
		this.img = asset.canvas;
		// console.log(this.img)
	}

	//  RENDER LOCATION
	this.rL = V();

	// x, y, w, h DONE IN GenObj
	//  VELOCITY
	this.vel = V();
	//  MAX VELOCITY IN ANY DIRECTION
	this.mV = 4;
	//  NO GRAVITY BY DEFAULT, SET IN FACTORY FUNCTION
	this.gravity = 0;

	this.grounded = false;

	this.visible = true;
	this.alpha = 1;
	this.fillStyle = options.fillStyle || "green";
	Object.defineProperties(this,{
		x: {
			get: function() {
				return this.pos.x;// + this.xOff;
			},
			set: function(x) {
				this.pos.x = x;// + this.xOff;
			}
		},
		y: {
			get: function() {
				return this.pos.y;// + this.yOff;
			},
			set: function(y) {
				this.pos.y = y;// + this.yOff;
			}
		}
	});

	
}

Actor.prototype = {
	
	begin: function() {
		
	},
	update: function(timestep, self) {
		var self = self || this;
		
		
		//  GRAVITY
		self.vel.y += timestep * self.gravity;

		self.applyMovement();
		self.game.constrainToScreen(self);
		// self.constrainToScreen();
		self.grounded = false;
	},
	applyMovement: function() {
		//  FRICTION IS APPLIED DURING INPUT, WHICH DOESN'T HAPPEN WHEN THE GAME ENDS,
		//  SO YOUR CHARACTER WILL SLIDE UNTIL THEY HIT SOMETHING.
		if(this.game.gameEnded)
			this.vel.x *= 0.95;

		this.pos.add(this.vel);
		if(this.vel.x > this.mV*0.67)
			this.vel.x = this.mV*0.67;
		if(this.vel.x < -this.mV*0.67)
			this.vel.x = -this.mV*0.67
		if(this.vel.y > this.mV)
			this.vel.y = this.mV;
		if(this.vel.y < -this.mV)
			this.vel.y = -this.mV
	},
	render: function(draw,self) {
		var self = self || this,
			rL = self.rL || {};

		draw.save();
		if(self.alpha !== 1)
			draw.globalAlpha = self.alpha;
		// var x = x || self.x;
		// var y = y || self.y;
		if(self.visible) {
			if(self.shp !== undefined) {
				// var asset = self.game.assets[self.style],
					// shp = asset.shapes[self.shp];
					// x = shp.x,
					// y = shp.y;
					// if(self.type === "Player") 
						// console.log(self.img)
				// draw.drawImage(asset.canvas,shp.x,shp.y,self.w,self.h,self.x,self.y,self.w,self.h);
				draw.drawImage(self.img,
								self.shp.x, self.shp.y, self.shp.w, self.shp.h,
								rL.x || self.x, rL.y || self.y, self.shp.w, self.shp.h)
			// } else 

			} else {
				
				draw.fillStyle = self.fillStyle;
				draw.fillRect(rL.x || self.x,rL.y || self.y,self.w,self.h);
				
			}
		}
		draw.restore();
	},
	end: function() {

	},
	halfWidth: function() { return this.w/2; },
	halfHeight: function() { return this.h/2; },
	centreX: function() { return this.x + this.halfWidth(); },
	centreY: function() { return this.y + this.halfHeight(); },
	centre: function() {
		return V(
			this.x + this.halfWidth(),
			this.y + this.halfHeight()
		)
	},
//  AXIS ALIGNED BOUNDING BOX COLLISION
	collidesWith: function(otherShape, response) {
		if(otherShape) {
			// console.log(this,otherShape)
			if(this.collisionObject)
				response.clear();
		
			response.x = 0;
			response.y = 0;
			response.self = this;
			response.otherShape = otherShape;
		// console.log(response)
			var col,xOver,yOver,
				vx = this.centreX() - otherShape.centreX(),
				vy = this.centreY() - otherShape.centreY(),
				halfWidths = this.halfWidth() + otherShape.halfWidth(),
				halfHeights = this.halfHeight() + otherShape.halfHeight();


			if(Math.abs(vx) < halfWidths) {
				if(Math.abs(vy) < halfHeights) {
					// var ep = otherShape.edgeProfile || [true,true,true,true];

					//  XY OVER LAPS
					xOver = halfWidths - Math.abs(vx);
					yOver = halfHeights - Math.abs(vy);
					
					//  USE THE SMALLER OF THE TWO OVERLAPS AS MINIMUM TRANSLATION VECTOR
					if(xOver > yOver) {
						//  Y IS SMLLER
						//  MTV POINTS DOWN
						if(vy > 0) {
							response.collisionSide = "bottom";
							//  IF otherShape'S BOTTOM EDGE IS ACTIVE
							// if(ep[2]) 
								response.y = yOver;
						}
						//  MTV POINTS UP
						else {
							response.collisionSide = "top";
							//  IF otherShape'S TOP EDGE IS ACTIVE
							// if(ep[0]) {
								response.y = -yOver;
								//  THIS IS this'S BOTTOM, SO WE ARE GROUNDED AND CAN JUMP
								// this.grounded = true;
							// }
						}
					} else {
						//  X IS SMALLER
						//  MTV POINTS RIGHT
						if(vx > 0) {
							response.collisionSide = "right";
							//  IF otherShape'S RIGHT EDGE IS ACTIVE
							// if(ep[1])
								response.x = xOver;
						}
						//  MTV POINTS LEFT
						else {
							response.collisionSide = "left";
							//  IF otherShape'S LEFT EDGE IS ACTIVE
							// if(ep[3])
								response.x = -xOver;
						}
					}

					//  PRIORITIZE LEDGES
					//  AND IT WANTS TO PUSH US UP
					// if(ep[0]
					// && this.vel.y >= 0
					// && yOver < 4
					// && vy < 0
					// && ((controls.keys.left.keyDown || controls.keys.right.keyDown)
					// || (mobile && (controls.gui.buttons.left.pressed || controls.gui.buttons.right.pressed)))) {

					// 	if((ep[1] && vx > 0)
					// 	|| (ep[3] && vx < 0)) {
					// 		if(yOver < 4) {
					// 			response.x = 0;
					// 			response.y = -yOver;
					// 		}
					// 	}

					// }
					// console.log(otherShape.edgeProfile)
					// console.log(response)
					return response;
					
				}
			}	
		}
		
		return false;
	},
};
// extend(GenObj,Actor);







