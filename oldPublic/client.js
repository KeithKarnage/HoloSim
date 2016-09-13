"use strict";

(function () {

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
    // // console.log(assets)
    // draw.drawImage(assets.guy.canvas,0,0);
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

})();
