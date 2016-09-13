"use strict";

//  ADDS ALL OF THE base OBJECTS PROPERTIES TO sub
//  base: the super object
//  sub: the sub object
// function extend(base, sub) {
//     var origProto = sub.prototype;
//     sub.prototype = Object.create(base.prototype);
//     for (var key in origProto)  {
// 	    sub.prototype[key] = origProto[key];
// 	}
// 	sub.prototype.constructor = sub;

// 	Object.defineProperty(sub.prototype, 'constructor', { 
// 	    enumerable: false, 
// 	    value: sub 
// 	});
// };

function flr(num) {
	return Math.floor(num);
}
function now() {
	return Date.now();
}
function abs(num) {
	return Math.abs(num);
}

function V(x,y) {
	return new Vec(x,y);
}

function font(size) {
	return size+"px Impact, Charcoal, sans-serif"
}

function circle(ctx,x,y,r) {
	ctx.beginPath();
	ctx.arc(x,y,r,0,2*Math.PI,false);
	ctx.closePath();
}

function gradient(ctx,x1,y1,r1,x2,y2,r2,color1,color2) {
	var grd = ctx.createRadialGradient(x1,y1,r1,x2,y2,r2);
	grd.addColorStop(0,color1);
	grd.addColorStop(1,color2);
	return grd;
}





function drawBG(bg) {
	var cnv = document.createElement('canvas'),
		ctx = cnv.getContext('2d');
	cnv.width = 352;
	cnv.height = 240;

	switch(bg) {
		case "Grid":
			ctx.fillStyle = "black";
			ctx.fillRect(0,0,352,240);
			ctx.lineWidth = 0.5;
			ctx.strokeStyle = "green";
			for(var i=0; i<23; ++i)
				drawLine(ctx,i*16,0,i*16,240);
			for(var i=0; i<16; ++i)
				drawLine(ctx,0,i*16,352,i*16);
		break;
		case "Sky":
			ctx.fillStyle = gradient(ctx,200,400,200,200,300,300,"blue","cornflowerblue");
			ctx.fillRect(0,0,352,240);
			ctx.beginPath();
			ctx.moveTo(0,175);
			ctx.quadraticCurveTo(240,150,352,170);
			ctx.lineTo(352,240);
			ctx.lineTo(0,240);
			ctx.closePath();

			ctx.fillStyle = gradient(ctx,200,200,50,200,180,200,"green","darkgreen");
			ctx.fill();
			// circle(ctx)
			// ctx.fillRect(0,160,352,80);
		break;

		
	}
	return cnv;
}
function drawLine(ctx,x,y,x2,y2) {
	ctx.beginPath();
	ctx.moveTo(x,y);
	ctx.lineTo(x2,y2);
	ctx.closePath();
	ctx.stroke();
}

function DrawSpriteSheets() {
	var assets = {};
	for(var i in {"dirt":1,"guy":2}) {
		
		var cnv = document.createElement('canvas'),
			ctx = cnv.getContext('2d');

		cnv.width = 256;
		cnv.height = 128;
		ctx.fillStyle = "black";
		// ctx.fillRect(0,0,32,32);

		DrawSprite(assets,i,ctx,cnv);
		assets[i].canvas = cnv
		
	}
	return assets;
}

function DrawSprite(assets,name,ctx,cnv) {
	assets[name] = {
		shapes: []
	};
	var pl = art[name+"P"],
		cl = "",
		iD;
	switch(name) {
		case "guy":
			// var cl = db32
			var guy = shape("guy");
			for(X=0; X<5; X++) {
				// for(Y=0; Y<2; Y++) {
					// if(Y<1) ctx.drawImage(guy,X*24+8,8);
					// else {
						
				ctx.drawImage(guy,X*24+8,8);
				var gun = shape("gun",X),
					oS = art["gunO"][X];
					console.log(oS)
				ctx.drawImage(gun,X*24+oS[0],0+oS[1]);

				ctx.save();
				ctx.translate(24*(X+1)+X*24,0);
				ctx.scale(-1,1);
				ctx.drawImage(cnv,X*24,0,24,24,X*24,24,24,24);
				ctx.restore()

				assets[name].shapes.push({x:X*24,y:0,w:24,h:24});
				assets[name].shapes.push({x:X*24,y:24,w:24,h:24});
			}

		break;
		case "dirt":
			var W = 32;
			for(var Y=0; Y<3; Y++) {
				for(var X=0; X<3; X++) {
					iD = ctx.getImageData(X*8,Y*8,8,8);//,
						//  PALETTE
						// pl = art[name+"P"],
						//  COLOUR
						// cl = "";
					for(var y=0; y<8; y++) {
						for(var x=0; x<8; x++) {
							cl = db32[pl[art[name][y+Y*4][x+X*4]]];
							if(cl) {
								for(var i=0; i<4; i++)
									iD.data[(x+y*8)*4+i] = cl[i] || 255;
							}
						}
					}
					ctx.putImageData(iD,X*8,Y*8);
				}
			}
			//  DRAW SHAPES
			for(var i=0,iL=shapes.length; i<iL; i++) {
				var shp = shapes[i],
					pos = { x: W, y: 0, w:shp[0]*8, h:shp[1]*8 };
				
				for(var x=0; x<shp[0]; x++) {

					for(var y=0; y<shp[1]; y++) {

						var tile = {};

						if(y === 0)
							tile.y = 0
						else if(y < shp[1]-1)
							tile.y = 1
						else tile.y = 2

						if(x === 0)
							tile.x = 0
						else if(x < shp[0]-1)
							tile.x = 1
						else tile.x = 2

						// drawTile({x:x*8,y:y*8},tile)
						// ctx.drawImage(cnv,tile.x*8,tile.y*8,8,8,pos.x+W,pos.y,8,8)
						ctx.drawImage(cnv,tile.x*8,tile.y*8,8,8,
												x*8+W,y*8,8,8)
						
					}
				}
				assets[name].shapes.push(pos)
				W += shp[0]*8;
			}
			
			// function drawTile(pos,tile) {
				// ctx.drawImage(cnv,tile.x*8,tile.y*8,8,8,
								// pos.x+W,pos.y,8,8)
				
			// }
		break;
	}
};

function shape(name, i) {
	var cnv = document.createElement('canvas'),
		ctx = cnv.getContext('2d'),
		shp = art[name][i] || art[name],
		X = shp[0].length,
		Y = shp.length,
		iD = ctx.createImageData(X,Y),
		pl = art[name+"P"],
		cl;

	cnv.width = X;
	cnv.height = Y;
	// console.log(name,X,Y)

	for(var y=0; y<Y; y++) {
		for(var x=0; x<X; x++) {
			cl = db32[pl[shp[y][x]]];
			if(cl) {
				for(var i=0; i<4; i++)
					iD.data[(x+y*X)*4+i] = cl[i] || 255;
			}
		}
	}
	ctx.putImageData(iD,0,0);
	return cnv;
};

var db32 = {
	3: [102,57,49],  //  DARK BROWN
	4: [143,86,59],  //  LIGHT BROWN
	9: [153,229,80],  //  BRIGHT GREEN
	10: [106,190,48], //  LIGHT GREEN
	12: [75,105,47],  //  DARK GREEN
	14: [50,60,57],  //  DARKER GREY
	16: [48,96,130],  //  DARK BLUE
	18: [99,155,255],  //  LIGHT BLUE
	19: [95,205,228],  //  LIGHTER BLUE
	20: [203,219,252],  //  LIGHTEST BLUE
	23: [132,126,135],  //  LIGHTER GREY
	25: [89,86,82],  //  DARK GREY

},
art = {
	dirtP: {
		1: 10,
		2: 12,
		3: 3,
		4: 4,
	},
	dirt: [
		[   ,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,  ],
		[  1,2,1,2,1,1,2,1, 2,1,1,2,1,2,2,1 ],
		[   ,3,3,3,3,3,3,3, 3,3,3,3,3,3,3,  ],
		[   ,3,3,4,3,3,3,3, 3,3,3,3,3,3,3,  ],
		[   ,3,3,3,3,3,3,3, 3,4,3,3,3,3,3,  ],
		[   ,3,3,3,3,4,3,3, 3,3,3,3,3,3,3,  ],
		[   ,3,4,3,3,3,3,3, 3,3,3,3,3,4,3,  ],
		[   ,3,3,3,3,3,3,3, 3,3,3,4,3,3,3,  ],

		[   ,3,3,3,3,3,3,3, 3,3,3,3,3,3,3,  ],
		[   ,3,3,3,3,3,4,3, 3,4,3,3,3,3,3,  ],
		[   ,3,3,3,3,3,3,3, 3,3,3,3,3,4,3,  ],
		[   ,3,3,3,3,4,3,3, 3,3,3,3,3,3,3,  ],
		[   ,3,3,4,3,3,3,3, 3,3,3,3,4,3,3,  ],
		[   , ,3,3,3,3,3,3, 3,3,4,3,3,3, ,  ],
		[   , , ,3,3,3,3,3, 3,3,3,3,3, , ,  ],
		[   , , , , , , , ,  , , , , , , ,  ],
	],
	guyP: {
		1:14,
		2:25,
		3:18,
		4:19,
		5:20
	},
	guy: [
		[  ,2,2,2,2,0 ],
		[ 3,4,5,5,4,2 ],
		[ 3,4,4,5,5,2 ],
		[ 3,4,4,4,4,2 ],
		[ 3,4,4,4,2,1 ],
		[  ,1,1,1,1,  ],
		[  ,2,2,2,2,2 ],
		[  ,2,2,2,2,2 ],

		[  ,2,2,2,2,2 ],
		[  ,2,2,2,2,2 ],
		[  ,2,2,2,2,2 ],
		[  ,1,2,1,1,2 ],
		[  ,1,1, ,1,1 ],
		[  ,1,1, ,1,1 ],
		[  , ,1, , ,1 ],
		[  , ,2, , ,2 ],
	],
	gunO: [
		[9,5],
		[5,7],
		[3,13],
		[4,13],
		[10,15]
	],
	gunP: {
		1:16,
		2:12,
		3:23,
		4:9
	},
	gun: [
		[
			[  ,2,4 ],
			[ 1,3,3 ],
			[ 1,3,3 ],
			[ 1,3,3 ],
			[ 1,3,3 ],
			[ 1,3,3 ],
			[ 1,3,3 ],
			[ 1,3,3 ],
		],

		[
			[  ,4, , , , , ],
			[ 2,3,3, , , , ],
			[ 1,3,3,3, , , ],
			[  ,1,3,3,3, , ],
			[  , ,1,3,3,3, ],
			[  , , ,1,3,3,3],
			[  , , , ,1,3,3],
		],
		
		[
			[ 4,3,3,3,3,3,3,3 ],
			[ 2,3,3,3,3,3,3,3 ],
			[  ,1,1,1,1,1,1,1 ]
		],

		[
			[  , , , , ,3,3],
			[  , , , ,3,3,3],
			[  , , ,3,3,3,1],
			[  , ,3,3,3,1, ],
			[  ,3,3,3,1, , ],
			[ 4,3,3,1, , , ],
			[  ,2,1, , , , ],
		],

		[
			[ 3,3,1 ],
			[ 3,3,1 ],
			[ 3,3,1 ],
			[ 3,3,1 ],
			[ 3,3,1 ],
			[ 3,3,1 ],
			[ 3,3,1 ],
			[ 4,2,  ],
		],

	]
},
shapes = [
	[2,2], //  0
	[3,2], //  1
	[4,2], //  2
	[2,3], //  3
	[2,4], //  4
	[6,2], //  5
	[2,6], //  6
	[4,6]
],
levels = {
	level2: [
		{ shp: 5, x: 10, y: 6, style: "dirt" },  //  PLAYER STARTS ON
		{ shp: 4, x: 16, y: 2, style: "dirt" },  //  TO THE RIGHT OF THAT
		{ shp: 4, x: 6, y: 4, style: "dirt" },  //  TO THE LEFT OF THAT

		{ shp: 5, x: 6, y: 13, style: "dirt" },  //  NEXT LEVEL DOWN
		{ shp: 5, x: 12, y: 12, style: "dirt" },  //  NEXT LEVEL DOWN
		{ shp: 1, x: 18, y: 14, style: "dirt" },  //  NEXT LEVEL DOWN

		{ shp: 6, x: 21, y: 20, dm: true, style: "dirt" },  //  SPINE DOWN THE CENTRE
		// { shp: 3, x: 21, y: 24, dm: true, style: "dirt" },  //  SPINE DOWN THE CENTRE

		{ shp: 5, x: 10, y: 27, style: "dirt" },  //  BOTTOM FLOOR
		// { shp: 5, x: 4, y: 28, style: "dirt" },  //  BOTTOM FLOOR

		{ shp: 6, x: 0, y: 8, style: "dirt" },  //  WALLS
		{ shp: 6, x: 0, y: 14, style: "dirt" },  //  WALLS
		{ shp: 7, x: 0, y: 24, style: "dirt" },  //  WALLS

		{ shp: 2, x: 9, y: 20, style: "dirt" },  //  LONELY ISLAND
	]
}

	




