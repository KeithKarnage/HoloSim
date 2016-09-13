"use strict";

function Vec(x,y) {
	this.x = x || 0;
	this.y = y || 0;

	return this;
}
Vec.prototype = {
	add: function(vec) {
		this.x += vec.x;
		this.y += vec.y;
		return this;
	},
	sub: function(vec) {
		this.x -= vec.x;
		this.y -= vec.y;
		return this;
	},
	mag: function() {
		return Math.abs(Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2)));
	},
	dis: function(vec) {
		return Math.sqrt(Math.pow(vec.x - this.x, 2) + Math.pow(vec.y - this.y, 2));
	},
	scl: function(x) {
		this.x *= x;
		this.y *= x;
		return this;
	},
	inv: function() {
		this.x *= -1;
		this.y *= -1;
		return this;
	},
	copy: function(vec) {
		this.x = vec.x;
		this.y = vec.y;
		return this;
	},
	clone: function() {
		return new Vec(this.x,this.y);
	},
	clear: function(vec) {
		this.x = 0;
		this.y = 0;
		return this;
	},
	normalize: function() {
		var m = this.mag();
		if(m != 0) {
			this.x /= m;
			this.y /= m;
		}
		return this;
	},
	// ang: function(vec) {
	// 	// var an = new Vec().copy()
	// 	var a = this.clone().sub(vec);
	// 	return Math.atan2(a.y,a.x)* (180/Math.PI);
	// },
	octDir: function() {
		var vec = this.clone().normalize(),
			ang = Math.atan2(vec.y,vec.x)* (180/Math.PI),
			out = [0,0,0,0];

		// switch(ang) {
		// 	case 0:		out[2] = 1;				break;
		// 	case 45:	out = [0,0,1,1];		break;
		// 	case 90:	out[3] = 1;				break;
		// 	case 135:	out = [1,0,0,1];		break;
		// 	case 180:	out[0] = 1;				break;
		// 	case -135:	out = [1,1,0,0];		break;
		// 	case -90:	out[1] = 1;				break;
		// 	case -45:	out = [0,1,1,0];		break;
		// }
		// return out;
		return Math.round(ang/45);
	}
};

// function GenObj(options) {
// 	options = options || {};
// 	this.pos = new Vec(options.x,options.y);
// 	this.w = options.w || 0;
// 	this.h = options.h || 0;

// 	Object.defineProperties(this,{
// 		x: {
// 			get: function() {
// 				return this.pos.x;// + this.xOff;
// 			},
// 			set: function(x) {
// 				this.pos.x = x;// + this.xOff;
// 			}
// 		},
// 		y: {
// 			get: function() {
// 				return this.pos.y;// + this.yOff;
// 			},
// 			set: function(y) {
// 				this.pos.y = y;// + this.yOff;
// 			}
// 		}
// 	});
// };
// GenObj.prototype = {
// 	update: function() {
// 		// console.log("update")
// 	},
// 	halfWidth: function() { return this.w/2; },
// 	halfHeight: function() { return this.h/2; },
// 	centreX: function() { return this.x + this.halfWidth(); },
// 	centreY: function() { return this.y + this.halfHeight(); },
// 	centre: function() {
// 		return new Vec(
// 			this.x + this.halfWidth(),
// 			this.y + this.halfHeight()
// 		)
// 	},
// //  AXIS ALIGNED BOUNDING BOX COLLISION
// 	collidesWith: function(otherShape, response) {
// 		if(otherShape) {
// 			// console.log(this,otherShape)
// 			if(this.collisionObject)
// 				response.clear();
		
// 			response.x = 0;
// 			response.y = 0;
// 			response.self = this;
// 			response.otherShape = otherShape;
// 		// console.log(response)
// 			var col,xOver,yOver,
// 				vx = this.centreX() - otherShape.centreX(),
// 				vy = this.centreY() - otherShape.centreY(),
// 				halfWidths = this.halfWidth() + otherShape.halfWidth(),
// 				halfHeights = this.halfHeight() + otherShape.halfHeight();


// 			if(Math.abs(vx) < halfWidths) {
// 				if(Math.abs(vy) < halfHeights) {
// 					var ep = otherShape.edgeProfile || [true,true,true,true];

// 					//  XY OVER LAPS
// 					xOver = halfWidths - Math.abs(vx);
// 					yOver = halfHeights - Math.abs(vy);
					
// 					//  USE THE SMALLER OF THE TWO OVERLAPS AS MINIMUM TRANSLATION VECTOR
// 					if(xOver > yOver) {
// 						//  Y IS SMLLER
// 						//  MTV POINTS DOWN
// 						if(vy > 0) {
// 							response.collisionSide = "bottom";
// 							//  IF otherShape'S BOTTOM EDGE IS ACTIVE
// 							if(ep[2]) 
// 								response.y = yOver;
// 						}
// 						//  MTV POINTS UP
// 						else {
// 							response.collisionSide = "top";
// 							//  IF otherShape'S TOP EDGE IS ACTIVE
// 							if(ep[0]) {
// 								response.y = -yOver;
// 								//  THIS IS this'S BOTTOM, SO WE ARE GROUNDED AND CAN JUMP
// 								// this.grounded = true;
// 							}
// 						}
// 					} else {
// 						//  X IS SMALLER
// 						//  MTV POINTS RIGHT
// 						if(vx > 0) {
// 							response.collisionSide = "right";
// 							//  IF otherShape'S RIGHT EDGE IS ACTIVE
// 							if(ep[1])
// 								response.x = xOver;
// 						}
// 						//  MTV POINTS LEFT
// 						else {
// 							response.collisionSide = "left";
// 							//  IF otherShape'S LEFT EDGE IS ACTIVE
// 							if(ep[3])
// 								response.x = -xOver;
// 						}
// 					}

// 					//  PRIORITIZE LEDGES
// 					//  AND IT WANTS TO PUSH US UP
// 					// if(ep[0]
// 					// && this.vel.y >= 0
// 					// && yOver < 4
// 					// && vy < 0
// 					// && ((controls.keys.left.keyDown || controls.keys.right.keyDown)
// 					// || (mobile && (controls.gui.buttons.left.pressed || controls.gui.buttons.right.pressed)))) {

// 					// 	if((ep[1] && vx > 0)
// 					// 	|| (ep[3] && vx < 0)) {
// 					// 		if(yOver < 4) {
// 					// 			response.x = 0;
// 					// 			response.y = -yOver;
// 					// 		}
// 					// 	}

// 					// }
// 					// console.log(otherShape.edgeProfile)
// 					// console.log(response)
// 					return response;
					
// 				}
// 			}	
// 		}
		
// 		return false;
// 	},

// };