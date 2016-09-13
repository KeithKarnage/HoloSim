// "use strict";

// (function () {

//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  UTILS


// "use strict";

//  ADDS ALL OF THE base OBJECTS PROPERTIES TO sub
//  base: the super object
//  sub: the sub object
// function extend(base, sub) {
//     var origProto = sub.prototype;
//     sub.prototype = Object.create(base.prototype);
//     for (var key in origProto)  {
//      sub.prototype[key] = origProto[key];
//  }
//  sub.prototype.constructor = sub;

//  Object.defineProperty(sub.prototype, 'constructor', { 
//      enumerable: false, 
//      value: sub 
//  });
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
            ctx.fillStyle = "rgb(20,20,20)";
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
        case "Night":
            ctx.fillStyle = gradient(ctx,200,400,200,200,300,300,"purple","blue");
            ctx.fillRect(0,0,352,240);
            ctx.beginPath();
            ctx.moveTo(0,170);
            ctx.quadraticCurveTo(200,140,352,175);
            ctx.lineTo(352,240);
            ctx.lineTo(0,240);
            ctx.closePath();

            ctx.fillStyle = gradient(ctx,200,200,50,200,180,200,"darkgreen","rgb(10,70,10)");
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
    for(var i in {"dirt":1,"guy":2,"grid":3}) {
        
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
        case "grid":
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
    0: [1,1,1],  //  BLACK
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
    gridP: {
        1: 0,
        2: 9
    },
    grid: [
        [   ,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,  ],
        [  2,1,1,1,2,1,1,1, 2,1,1,1,2,1,1,2 ],
        [  2,1,1,1,2,1,1,1, 2,1,1,1,2,1,1,2 ],
        [  2,1,1,1,2,1,1,1, 2,1,1,1,2,1,1,2 ],
        [  2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2 ],
        [  2,1,1,1,2,1,1,1, 2,1,1,1,2,1,1,2 ],
        [  2,1,1,1,2,1,1,1, 2,1,1,1,2,1,1,2 ],
        [  2,1,1,1,2,1,1,1, 2,1,1,1,2,1,1,2 ],

        [  2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2 ],
        [  2,1,1,1,2,1,1,1, 2,1,1,1,2,1,1,2 ],
        [  2,1,1,1,2,1,1,1, 2,1,1,1,2,1,1,2 ],
        [  2,1,1,1,2,1,1,1, 2,1,1,1,2,1,1,2 ],
        [  2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2 ],
        [  2,1,1,1,2,1,1,1, 2,1,1,1,2,1,1,2 ],
        [  2,1,1,1,2,1,1,1, 2,1,1,1,2,1,1,2 ],
        [   ,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,  ],

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
    level1: [
        { shp: 5, x: 10, y: 6, style: "dirt" },  
        { shp: 2, x: 8, y: 13, style: "dirt" },  
        { shp: 4, x: 10, y: 20, style: "dirt" },  
        { shp: 5, x: 6, y: 27, style: "dirt" },  
        { shp: 6, x: 0, y: 20, style: "dirt" },  
        { shp: 7, x: 20, y: 0, dm: true, style: "dirt" },  
        { shp: 5, x: 19, y: 28, dm: true, style: "dirt" },  
        { shp: 5, x: 19, y: 18, dm: true, style: "dirt" },  
        { shp: 2, x: 0, y: 9, style: "dirt" },  
        

    ],
    level2: [
        { shp: 5, x: 10, y: 6, style: "dirt" },  //  PLAYER STARTS ON
        // { shp: 4, x: 16, y: 2, style: "dirt" },  //  TO THE RIGHT OF THAT
        // { shp: 4, x: 6, y: 4, style: "dirt" },  //  TO THE LEFT OF THAT

        { shp: 5, x: 6, y: 13, style: "dirt" },  //  NEXT LEVEL DOWN
        // { shp: 5, x: 12, y: 12, style: "dirt" },  //  NEXT LEVEL DOWN
        // { shp: 1, x: 18, y: 14, style: "dirt" },  //  NEXT LEVEL DOWN

        { shp: 6, x: 21, y: 20, dm: true, style: "dirt" },  //  SPINE DOWN THE CENTRE


        { shp: 5, x: 10, y: 27, style: "dirt" },  //  BOTTOM FLOOR


        { shp: 6, x: 0, y: 8, style: "dirt" },  //  WALLS
        // { shp: 6, x: 0, y: 14, style: "dirt" },  //  WALLS
        { shp: 7, x: 0, y: 24, style: "dirt" },  //  WALLS

        { shp: 2, x: 9, y: 20, style: "dirt" },  //  LONELY ISLAND
    ]
}

    






//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  JSFXR


var server = typeof window !== "object";
/**
 * SfxrParams
 *
 * Copyright 2010 Thomas Vian
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Thomas Vian
 */
/** @constructor */
if(!server) {
  function SfxrParams() {
    //--------------------------------------------------------------------------
    //
    //  Settings String Methods
    //
    //--------------------------------------------------------------------------

    /**
     * Parses a settings array into the parameters
     * @param array Array of the settings values, where elements 0 - 23 are
     *                a: waveType
     *                b: attackTime
     *                c: sustainTime
     *                d: sustainPunch
     *                e: decayTime
     *                f: startFrequency
     *                g: minFrequency
     *                h: slide
     *                i: deltaSlide
     *                j: vibratoDepth
     *                k: vibratoSpeed
     *                l: changeAmount
     *                m: changeSpeed
     *                n: squareDuty
     *                o: dutySweep
     *                p: repeatSpeed
     *                q: phaserOffset
     *                r: phaserSweep
     *                s: lpFilterCutoff
     *                t: lpFilterCutoffSweep
     *                u: lpFilterResonance
     *                v: hpFilterCutoff
     *                w: hpFilterCutoffSweep
     *                x: masterVolume
     * @return If the string successfully parsed
     */
    this.setSettings = function(values)
    {
      for ( var i = 0; i < 24; i++ )
      {
        this[String.fromCharCode( 97 + i )] = values[i] || 0;
      }

      // I moved this here from the reset(true) function
      if (this['c'] < .01) {
        this['c'] = .01;
      }

      var totalTime = this['b'] + this['c'] + this['e'];
      if (totalTime < .18) {
        var multiplier = .18 / totalTime;
        this['b']  *= multiplier;
        this['c'] *= multiplier;
        this['e']   *= multiplier;
      }
    }
  }

  /**
   * SfxrSynth
   *
   * Copyright 2010 Thomas Vian
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * @author Thomas Vian
   */
  /** @constructor */
  function SfxrSynth() {
    // All variables are kept alive through function closures

    //--------------------------------------------------------------------------
    //
    //  Sound Parameters
    //
    //--------------------------------------------------------------------------

    this._params = new SfxrParams();  // Params instance

    //--------------------------------------------------------------------------
    //
    //  Synth Variables
    //
    //--------------------------------------------------------------------------

    var _envelopeLength0, // Length of the attack stage
        _envelopeLength1, // Length of the sustain stage
        _envelopeLength2, // Length of the decay stage

        _period,          // Period of the wave
        _maxPeriod,       // Maximum period before sound stops (from minFrequency)

        _slide,           // Note slide
        _deltaSlide,      // Change in slide

        _changeAmount,    // Amount to change the note by
        _changeTime,      // Counter for the note change
        _changeLimit,     // Once the time reaches this limit, the note changes

        _squareDuty,      // Offset of center switching point in the square wave
        _dutySweep;       // Amount to change the duty by

    //--------------------------------------------------------------------------
    //
    //  Synth Methods
    //
    //--------------------------------------------------------------------------

    /**
     * Resets the runing variables from the params
     * Used once at the start (total reset) and for the repeat effect (partial reset)
     */
    this.reset = function() {
      // Shorter reference
      var p = this._params;

      _period       = 100 / (p['f'] * p['f'] + .001);
      _maxPeriod    = 100 / (p['g']   * p['g']   + .001);

      _slide        = 1 - p['h'] * p['h'] * p['h'] * .01;
      _deltaSlide   = -p['i'] * p['i'] * p['i'] * .000001;

      if (!p['a']) {
        _squareDuty = .5 - p['n'] / 2;
        _dutySweep  = -p['o'] * .00005;
      }

      _changeAmount =  1 + p['l'] * p['l'] * (p['l'] > 0 ? -.9 : 10);
      _changeTime   = 0;
      _changeLimit  = p['m'] == 1 ? 0 : (1 - p['m']) * (1 - p['m']) * 20000 + 32;
    }

    // I split the reset() function into two functions for better readability
    this.totalReset = function() {
      this.reset();

      // Shorter reference
      var p = this._params;

      // Calculating the length is all that remained here, everything else moved somewhere
      _envelopeLength0 = p['b']  * p['b']  * 100000;
      _envelopeLength1 = p['c'] * p['c'] * 100000;
      _envelopeLength2 = p['e']   * p['e']   * 100000 + 12;
      // Full length of the volume envelop (and therefore sound)
      // Make sure the length can be divided by 3 so we will not need the padding "==" after base64 encode
      return ((_envelopeLength0 + _envelopeLength1 + _envelopeLength2) / 3 | 0) * 3;
    }

    /**
     * Writes the wave to the supplied buffer ByteArray
     * @param buffer A ByteArray to write the wave to
     * @return If the wave is finished
     */
    this.synthWave = function(buffer, length) {
      // Shorter reference
      var p = this._params;

      // If the filters are active
      var _filters = p['s'] != 1 || p['v'],
          // Cutoff multiplier which adjusts the amount the wave position can move
          _hpFilterCutoff = p['v'] * p['v'] * .1,
          // Speed of the high-pass cutoff multiplier
          _hpFilterDeltaCutoff = 1 + p['w'] * .0003,
          // Cutoff multiplier which adjusts the amount the wave position can move
          _lpFilterCutoff = p['s'] * p['s'] * p['s'] * .1,
          // Speed of the low-pass cutoff multiplier
          _lpFilterDeltaCutoff = 1 + p['t'] * .0001,
          // If the low pass filter is active
          _lpFilterOn = p['s'] != 1,
          // masterVolume * masterVolume (for quick calculations)
          _masterVolume = p['x'] * p['x'],
          // Minimum frequency before stopping
          _minFreqency = p['g'],
          // If the phaser is active
          _phaser = p['q'] || p['r'],
          // Change in phase offset
          _phaserDeltaOffset = p['r'] * p['r'] * p['r'] * .2,
          // Phase offset for phaser effect
          _phaserOffset = p['q'] * p['q'] * (p['q'] < 0 ? -1020 : 1020),
          // Once the time reaches this limit, some of the    iables are reset
          _repeatLimit = p['p'] ? ((1 - p['p']) * (1 - p['p']) * 20000 | 0) + 32 : 0,
          // The punch factor (louder at begining of sustain)
          _sustainPunch = p['d'],
          // Amount to change the period of the wave by at the peak of the vibrato wave
          _vibratoAmplitude = p['j'] / 2,
          // Speed at which the vibrato phase moves
          _vibratoSpeed = p['k'] * p['k'] * .01,
          // The type of wave to generate
          _waveType = p['a'];

      var _envelopeLength      = _envelopeLength0,     // Length of the current envelope stage
          _envelopeOverLength0 = 1 / _envelopeLength0, // (for quick calculations)
          _envelopeOverLength1 = 1 / _envelopeLength1, // (for quick calculations)
          _envelopeOverLength2 = 1 / _envelopeLength2; // (for quick calculations)

      // Damping muliplier which restricts how fast the wave position can move
      var _lpFilterDamping = 5 / (1 + p['u'] * p['u'] * 20) * (.01 + _lpFilterCutoff);
      if (_lpFilterDamping > .8) {
        _lpFilterDamping = .8;
      }
      _lpFilterDamping = 1 - _lpFilterDamping;

      var _finished = false,     // If the sound has finished
          _envelopeStage    = 0, // Current stage of the envelope (attack, sustain, decay, end)
          _envelopeTime     = 0, // Current time through current enelope stage
          _envelopeVolume   = 0, // Current volume of the envelope
          _hpFilterPos      = 0, // Adjusted wave position after high-pass filter
          _lpFilterDeltaPos = 0, // Change in low-pass wave position, as allowed by the cutoff and damping
          _lpFilterOldPos,       // Previous low-pass wave position
          _lpFilterPos      = 0, // Adjusted wave position after low-pass filter
          _periodTemp,           // Period modified by vibrato
          _phase            = 0, // Phase through the wave
          _phaserInt,            // Integer phaser offset, for bit maths
          _phaserPos        = 0, // Position through the phaser buffer
          _pos,                  // Phase expresed as a Number from 0-1, used for fast sin approx
          _repeatTime       = 0, // Counter for the repeats
          _sample,               // Sub-sample calculated 8 times per actual sample, averaged out to get the super sample
          _superSample,          // Actual sample writen to the wave
          _vibratoPhase     = 0; // Phase through the vibrato sine wave

      // Buffer of wave values used to create the out of phase second wave
      var _phaserBuffer = new Array(1024),
          // Buffer of random values used to generate noise
          _noiseBuffer  = new Array(32);
      for (var i = _phaserBuffer.length; i--; ) {
        _phaserBuffer[i] = 0;
      }
      for (var i = _noiseBuffer.length; i--; ) {
        _noiseBuffer[i] = Math.random() * 2 - 1;
      }

      for (var i = 0; i < length; i++) {
        if (_finished) {
          return i;
        }

        // Repeats every _repeatLimit times, partially resetting the sound parameters
        if (_repeatLimit) {
          if (++_repeatTime >= _repeatLimit) {
            _repeatTime = 0;
            this.reset();
          }
        }

        // If _changeLimit is reached, shifts the pitch
        if (_changeLimit) {
          if (++_changeTime >= _changeLimit) {
            _changeLimit = 0;
            _period *= _changeAmount;
          }
        }

        // Acccelerate and apply slide
        _slide += _deltaSlide;
        _period *= _slide;

        // Checks for frequency getting too low, and stops the sound if a minFrequency was set
        if (_period > _maxPeriod) {
          _period = _maxPeriod;
          if (_minFreqency > 0) {
            _finished = true;
          }
        }

        _periodTemp = _period;

        // Applies the vibrato effect
        if (_vibratoAmplitude > 0) {
          _vibratoPhase += _vibratoSpeed;
          _periodTemp *= 1 + Math.sin(_vibratoPhase) * _vibratoAmplitude;
        }

        _periodTemp |= 0;
        if (_periodTemp < 8) {
          _periodTemp = 8;
        }

        // Sweeps the square duty
        if (!_waveType) {
          _squareDuty += _dutySweep;
          if (_squareDuty < 0) {
            _squareDuty = 0;
          } else if (_squareDuty > .5) {
            _squareDuty = .5;
          }
        }

        // Moves through the different stages of the volume envelope
        if (++_envelopeTime > _envelopeLength) {
          _envelopeTime = 0;

          switch (++_envelopeStage)  {
            case 1:
              _envelopeLength = _envelopeLength1;
              break;
            case 2:
              _envelopeLength = _envelopeLength2;
          }
        }

        // Sets the volume based on the position in the envelope
        switch (_envelopeStage) {
          case 0:
            _envelopeVolume = _envelopeTime * _envelopeOverLength0;
            break;
          case 1:
            _envelopeVolume = 1 + (1 - _envelopeTime * _envelopeOverLength1) * 2 * _sustainPunch;
            break;
          case 2:
            _envelopeVolume = 1 - _envelopeTime * _envelopeOverLength2;
            break;
          case 3:
            _envelopeVolume = 0;
            _finished = true;
        }

        // Moves the phaser offset
        if (_phaser) {
          _phaserOffset += _phaserDeltaOffset;
          _phaserInt = _phaserOffset | 0;
          if (_phaserInt < 0) {
            _phaserInt = -_phaserInt;
          } else if (_phaserInt > 1023) {
            _phaserInt = 1023;
          }
        }

        // Moves the high-pass filter cutoff
        if (_filters && _hpFilterDeltaCutoff) {
          _hpFilterCutoff *= _hpFilterDeltaCutoff;
          if (_hpFilterCutoff < .00001) {
            _hpFilterCutoff = .00001;
          } else if (_hpFilterCutoff > .1) {
            _hpFilterCutoff = .1;
          }
        }

        _superSample = 0;
        for (var j = 8; j--; ) {
          // Cycles through the period
          _phase++;
          if (_phase >= _periodTemp) {
            _phase %= _periodTemp;

            // Generates new random noise for this period
            if (_waveType == 3) {
              for (var n = _noiseBuffer.length; n--; ) {
                _noiseBuffer[n] = Math.random() * 2 - 1;
              }
            }
          }

          // Gets the sample from the oscillator
          switch (_waveType) {
            case 0: // Square wave
              _sample = ((_phase / _periodTemp) < _squareDuty) ? .5 : -.5;
              break;
            case 1: // Saw wave
              _sample = 1 - _phase / _periodTemp * 2;
              break;
            case 2: // Sine wave (fast and accurate approx)
              _pos = _phase / _periodTemp;
              _pos = (_pos > .5 ? _pos - 1 : _pos) * 6.28318531;
              _sample = 1.27323954 * _pos + .405284735 * _pos * _pos * (_pos < 0 ? 1 : -1);
              _sample = .225 * ((_sample < 0 ? -1 : 1) * _sample * _sample  - _sample) + _sample;
              break;
            case 3: // Noise
              _sample = _noiseBuffer[Math.abs(_phase * 32 / _periodTemp | 0)];
          }

          // Applies the low and high pass filters
          if (_filters) {
            _lpFilterOldPos = _lpFilterPos;
            _lpFilterCutoff *= _lpFilterDeltaCutoff;
            if (_lpFilterCutoff < 0) {
              _lpFilterCutoff = 0;
            } else if (_lpFilterCutoff > .1) {
              _lpFilterCutoff = .1;
            }

            if (_lpFilterOn) {
              _lpFilterDeltaPos += (_sample - _lpFilterPos) * _lpFilterCutoff;
              _lpFilterDeltaPos *= _lpFilterDamping;
            } else {
              _lpFilterPos = _sample;
              _lpFilterDeltaPos = 0;
            }

            _lpFilterPos += _lpFilterDeltaPos;

            _hpFilterPos += _lpFilterPos - _lpFilterOldPos;
            _hpFilterPos *= 1 - _hpFilterCutoff;
            _sample = _hpFilterPos;
          }

          // Applies the phaser effect
          if (_phaser) {
            _phaserBuffer[_phaserPos % 1024] = _sample;
            _sample += _phaserBuffer[(_phaserPos - _phaserInt + 1024) % 1024];
            _phaserPos++;
          }

          _superSample += _sample;
        }

        // Averages out the super samples and applies volumes
        _superSample *= .125 * _envelopeVolume * _masterVolume;

        // Clipping if too loud
        buffer[i] = _superSample >= 1 ? 32767 : _superSample <= -1 ? -32768 : _superSample * 32767 | 0;
      }

      return length;
    }
  }

  // Adapted from http://codebase.es/riffwave/
  var synth = new SfxrSynth();
  // Export for the Closure Compiler
  window['jsfxr'] = function(settings) {
    // Initialize SfxrParams
    synth._params.setSettings(settings);
    // Synthesize Wave
    var envelopeFullLength = synth.totalReset();
    var data = new Uint8Array(((envelopeFullLength + 1) / 2 | 0) * 4 + 44);
    var used = synth.synthWave(new Uint16Array(data.buffer, 44), envelopeFullLength) * 2;
    var dv = new Uint32Array(data.buffer, 0, 44);
    // Initialize header
    dv[0] = 0x46464952; // "RIFF"
    dv[1] = used + 36;  // put total size here
    dv[2] = 0x45564157; // "WAVE"
    dv[3] = 0x20746D66; // "fmt "
    dv[4] = 0x00000010; // size of the following
    dv[5] = 0x00010001; // Mono: 1 channel, PCM format
    dv[6] = 0x0000AC44; // 44,100 samples per second
    dv[7] = 0x00015888; // byte rate: two bytes per sample
    dv[8] = 0x00100002; // 16 bits per sample, aligned on every two bytes
    dv[9] = 0x61746164; // "data"
    dv[10] = used;      // put number of samples here

    return data.buffer;
  }


  /**
   * Sound module
   */
  var Sfx = (function () {

      var //container, //Mute switch
          context, //AudioContext
          master, //Master volme
          buffers = {}, //BufferSources
          muted = true; //mute switch

      /**
       * Create BufferSource
       * @param {string} name
       * @param {array} config
       */
      function createSource(name, config) {
          var data = jsfxr(config);
          context.decodeAudioData(data, function (buffer) {
              buffers[name] = buffer;
          });
      }

      return {

          /**
           * Init module
           */
          init: function () {
              // container = $("#sfx");
              context = new AudioContext();
              master = context.createGain();
              master.connect(context.destination);

                // createSource("gameOver", [0,,0.0323,0.0366,0.4116,0.1884,0.0741,0.3168,0.0047,0.0749,,0.0122,0.0382,0.2674,0.0288,0.5185,-0.0236,-0.0263,1,-0.0465,0.0594,0.0227,0.0573,0.5]);              

              createSource("kill", [3,,0.2,0.65,0.41,0.13,0.039,0.21,-0.026,,0.04,0.74,0.78,,0.02,0.64,0.22,-0.18,0.98,0.05,,0.025,-0.034,0.5]);
              createSource("died", [3,,0.22,0.62,0.48,0.16,,0.21,,,,0.73,0.81,,,0.68,0.22,-0.19,1,,,,,0.5]);
              createSource("hurt", [0,0.05,0.09,0.02,0.17,0.33,,-0.35,-0.02,0.014,0.005,-0.003,0.04,0.3,-0.01,,0.04,,1,,,0.2,-0.01,0.5]);              
              createSource("hit", [1,,0.08,,0.2,0.7,,-0.58,,,,0.04,,,,,,,1,,,0.15,,0.5]);

              createSource("jump",[0,,0.25,,0.23,0.3,,0.21,,,,,,0.04,,,,,0.79,,,,,0.5]);
              createSource("fire",[1,,0.27,0.13,0.11,0.93,0.24,-0.4,-0.05,0.05,0.07,-0.003,0.03,0.7,-0.18,0.01,0.015,-0.08,1,-0.07,0.03,0.07,0.09,0.5]);

              Sfx.mute();
          },

          /**
           * Play sound
           * @param {string} name
           * @param {number} volume
           * @param {boolean} loop
           * @return {AudioSource}
           */
          play: function (name, volume, loop) {
            // console.log("playing sound:",name)
              var source = null,
                  gain;
              if (name in buffers) {
                  gain = context.createGain();
                  gain.gain.value = volume || 1;
                  gain.connect(master);
                  source = context.createBufferSource();
                  source.loop = loop || false;
                  source.buffer = buffers[name];
                  source.connect(gain);
                  source.start(0);
              }
              return source;
          },

          /**
           * Switch mute
           */
          mute: function () {
              muted = !muted;
              console.log("muted = ",muted)
              master.gain.value = muted ? 0 : 2;
              // attr(container, "class", muted ? "off" : "");

          }
      };

  })();



  window.onload = function () {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      if (window.AudioContext) {
          Sfx.init();
      }
      // Sfx.mute();
      // setTimeout(function() {
      //   Sfx.play("win",2,false);  
      // },100);
      
      console.log(Sfx);
      
  }



}



//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  CLASSES


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
    
    octDir: function() {
        var vec = this.clone().normalize(),
            ang = Math.atan2(vec.y,vec.x)* (180/Math.PI),
            out = [0,0,0,0];

        return Math.round(ang/45);
    }
};



//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  SHARED


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
                //  self.players[i].socket.emit("state",state);
            }
            setInterval(sendServerState,1000/20);

        } else {        //  SET UP THE CLIENT'S GAME
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
            this.bgB2 = drawBG("Night");
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
                    var lvl = self.level[data.id];
                    lvl.type = data.type;
                    lvl.style = data.style;
                    lvl.img = self.assets[lvl.style].canvas;
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

                        //  if(absAngle > 90)
                        //      self.keyLeft = true;
                        //  else self.keyRight = true;
                        // //  UP AND DOWN
                        // } else if(absAngle > 67.5 && absAngle < 112.5) {

                        //  if(self.stickAngle > 0)
                        //      self.keyDown = true;
                        //  else self.keyUp = true;
                        // //  DIAGONALS
                        // } else {
                        //   if(self.stickAngle > 0) {
                        //      self.keyDown = true;
                        //      if(absAngle < 90)                           
                        //          self.keyRight = true;
                        //      else self.keyLeft = true;
                        //   } else {
                        //      self.keyUp = true;
                        //      if(absAngle < 90)
                        //          self.keyRight = true;
                        //      else self.keyLeft = true;

                        //   }
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
        if(!server)
            self.bgB2 = drawBG(["Sky","Night","Grid"][flr(Math.random()*3)]);
        self.bgCh = true;

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
        var rn = flr(Math.random()*2)+1,
            lv = levels.level1//levels["level"+rn];
        console.log(levels["level"+rn],rn)
        for(var i=0,iL=lv.length; i<iL; i++) {
            var lP = lv[i],
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
        //  this.portals.push({ x: i, y: 0, to: { x: i, y: this.gh-1 } })
        //  this.portals.push({ x: i, y: this.gh-1, to: { x: i, y: 0 } })
        // }
        // for(var i=0,iL=this.gh; i<iL; i++) {
        //  this.portals.push({ x: 0, y: i, to: { x: this.gw-1, y: i } })
        //  this.portals.push({ x: this.gw-1, y: i, to: { x: 0, y: i } })
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
            //  startAt: self.startAt
            // })
        }
    },

    glitchLevel: function() {
        if(server || this.singlePlayer) {

            if(Date.now() > this.lastGlitch + 6000) {
                this.lastGlitch = Date.now();
                // 
                var lvl = this.level[flr(Math.random()*this.level.length)];

                lvl.type = ["Hidey","Broken","Actor"][flr(Math.random()*3)];
                lvl.style = ["grid","dirt"][flr(Math.random()*2)];
                lvl.img = this.assets[lvl.style].canvas;

                if(server) {
                    // console.log(this.players)
                    for(var i in this.players){

                        // console.log(i)
                        this.players[i].socket.emit("levelGlitch",{id:lvl.id, type:lvl.type, style: lvl.style});
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
    //  var pl = this.player,
    //      px = flr(pl.x/8),
    //      py = flr(pl.y/8),
    //      sx = flr(source.x/8),
    //      sy = flr(source.y/8);
    //  if(px < 0) px = 0;
    //  if(py < 0) py = 0;
    //  if(sx < 0) sx = 0;
    //  if(sy < 0) sy = 0;
    //  var opts = {diagonal: true, portals: this.portals},
    //      graph = new Graph(this.grid,opts),
    //      start = graph.grid[sy][sx],
    //      end = graph.grid[py][px];
    //  if(!end.isWall())
    //      return astar.search(graph,start,end,opts);
    //  else return [];
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
            // console.log("dead enemies", this.deadEnemies)
            var hS = localStorage["HoloSimHighScore"];
            if(!hS || this.deadEnemies > hS)
                localStorage["HoloSimHighScore"] = this.deadEnemies;
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
        if(!server && game.bgCh)
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
                    game.draw.fillText("High score: " + localStorage["HoloSimHighScore"],75,150);
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
                game.draw.fillStyle = "rgba(0,0,0,0.1)";
                game.draw.fill();
                circle(game.draw,game.touches[game.tStk.id].x,game.touches[game.tStk.id].y,64);
                game.draw.fill();
            }


            game.draw.fillStyle = "rgba(0,0,0,0.2)";
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
        //  return;

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
            fillStyle: "orange"
        });
        blt.parent = options.parent;
        // console.log(options.vel)
        blt.vel = V().copy(options.vel)//.add(blt.parent.vel);
        blt.fT = options.fT;
        blt.id = options.id;
        blt.render = function(draw) {
            circle(draw,this.x,this.y,this.w/2);
            draw.fillStyle = "yellow";
            draw.fill();
        }
        
        this.bullets[options.parent.id][options.id] = blt;
    },

    constrainToScreen: function(actor) {
        if((actor.x < 0 || actor.x + actor.w > this.w)
        || (actor.y < 0 || actor.y + actor.h > this.h)) {
            // switch(actor.type) {
            //  case "Bullet":
            //  case "Player":
            //  case "Enemy":
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
        // this.bgC.fillStyle = "cornflowerblue";
        // console.log("changing bacg")
        for(var i=0; i<5; i++) {
            var x = this.bgI % 26,
                y = flr(this.bgI/26);

            // this.bgC.fillRect(x*16,y*16,16,16);
            this.bgC.drawImage(this.bgB2,x*16,y*16,16,16,x*16,y*16,16,16)
            this.bgI++;
        }
        if(this.bgI === 26 * 15) {
            this.bgCh = false;
            this.bgI = 0;
        }
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
            this.alpha = 0.2;
        else {
            // if(this.type === "Player")
                // this.fillStyle = "purple";
            // else this.fillStyle = "orange";
            this.alpha = 1;
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
            //  this.path = this.game.getPath(this);
            //  this.pathTime = now();
            // }
            // if(this.path.length > 1) {
            //  //  THE LOCATION WE WANT TO MOVE TO (2ND NODE IN PATH)
            //  this.moveVec.copy(this.path[1]).scl(8);
            //  //  SET OUR VELOCITY TO THAT POSITION MINUS OUR POSITION, SCALED TO THE TIMESTEP
            //  this.vel.copy(this.moveVec).sub(this.pos).scl(1/timestep).scl(0.8);
            //  //  IF THE DISTANCE FROM US TO 
            //  if(this.pos.dis(this.moveVec) > 100) 
            //      this.vel.inv();
                
                
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
                    var self = this;
                    setTimeout(function() {
                        self.visible = false;
                    },2000);
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
            //  ADD TIME * ACCELERATION TO HORIZONTAL VELOCITY
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
        if(response.otherShape.type === "Hidey")
            return;

        // switch(response.otherShape.type) {
            // case "Spikes":
            //  SPIKES DO DAMAGE
                
            //     if(!this.damaged) {
            //         // console.log(this.damaged)
            //         this.game.knockBack.copy(response.self).sub(response.otherShape)
            //         if(server || this.game.singlePlayer)
            //             this.takeDamage(1,this.game.knockBack);
            //         if(server) {
            //             for(var i in this.game.players) {
            //                 this.game.players[i].socket.emit("hit",{
            //                     hurt: this.id,
            //                     knockBack: {
            //                         x: this.game.knockBack.x,
            //                         y: this.game.knockBack.y
            //                     }
            //                 })
            //             }
            //         }   
            //     }
                
                
            // break;
            // case "Hidey":
            //  SPIKES DO DAMAGE
                // this.game.knockBack.copy(response.self).sub(response.otherShape)
                // this.takeDamage(1,this.game.knockBack);
                // return;
            // break;

        // }
        
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

                    //  if((ep[1] && vx > 0)
                    //  || (ep[3] && vx < 0)) {
                    //      if(yOver < 4) {
                    //          response.x = 0;
                    //          response.y = -yOver;
                    //      }
                    //  }

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












//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --//  --  --  --  --
//  CLIENT

    if(!server) {

        var socket = null, //Socket.IO client
            connected = false,
            game = null, 
            buttons; //Button elements

        var canvas = document.createElement('canvas'),
            draw = canvas.getContext('2d'),
            //  BACKGROUND BUFFER
            bgB = document.createElement('canvas'),
            bgC = bgB.getContext('2d'),

            assets = DrawSpriteSheets();






        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = "fixed";
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.zIndex = -1;
        bgB.width = 352;
        bgB.height = 240;

        draw.imageSmoothingEnabled = false;
        
        // canvas.style.margin = "0px";

        var h = canvas.height,
            w = canvas.width,
            hs = h/240,
            ws = w/352,
            scl = hs < ws ? hs : ws;

        var tH = 240 * scl,
            tW = 352 * scl,
            off = new Vec((w - tW)/2,(h - tH)/2);
        // drawBG(bgC,"Grid");
        draw.save();
        draw.translate(off.x,off.y);
        draw.scale(scl,scl);
        draw.drawImage(drawBG("Grid"),0,0);


        // draw.save();
        // draw.scale(2,2);
        // draw.drawImage(assets.grid.canvas,0,0);
        // draw.restore();
        
        draw.restore();





            
        //////
        
        document.body.appendChild(canvas);


        /**
         * Binde Socket.IO and button events
         */
        function bind() {

            socket.on("start", function (data) {
                console.log(data);
                loadGame(data.players);
            });

            socket.on("connect", function () {
                // disableButtons();
                // setMessage("Waiting for opponent...");
                connected = true;


                console.log("Connected!",socket.id);
            });

            socket.on("gameEnded", function () {
                connected = false;
                game = null;
                // console.log("Connection lost!", game);
            });

            socket.on("error", function () {
                // disableButtons();
                // setMessage("Connection error!");
                console.log("Connection error!");
            });
        }

        function loadGame(players) {
            game = new Game({
                server: false,
                canvas: canvas,
                draw: draw,
                assets: assets,
                socket: socket,
                players: players,
                bgB: bgB,
                bgC: bgC,
                off: off,
                scl: scl
            })
        }

        /**
         * Client module init
         */
        function init() {
            // console.log(io)
            buttons = document.getElementsByTagName("button");

            //  FUNCTIONS TO BIND TO BUTTONS
            var callbacks = [
                //  SINGLE PLAYER
                function() {
                    console.log("single player")
                    socket = null;
                    loadGame([{id:1}]);
                },
                //  MULTIPLAYER
                function() {
                    if(online && !connected) {
                        socket = io({ upgrade: false, transports: ["websocket"] });
                        bind();
                    }
                }
            ];

            //  BIND CALLBACKS TO BUTTONS
            for (var i=0; i < buttons.length; i++) {
                (function (button, callback) {
                    button.addEventListener("click", callback, false);
                })(buttons[i],callbacks[i])
            }
        }

        window.addEventListener("load", init, false);
    }

// })();
