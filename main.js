/*
a canvas will be the display area to show the base.
There will be a grid drawn onto the canvas to denote separate tiles to build on.
Each tile will be a section of the base.

Each tile can be:
    wall
    floor
    nothing

Base creator functionality:
    set tile to something
    set tile to nothing
    expand grid
    shrink grid

Future functionality:
    zoom
    Options menu


*/

window.onload = function () {

    document.getElementById("expandButt").addEventListener("click", expandGrid);
    document.getElementById("shrinkButt").addEventListener("click", shrinkGrid);
    document.getElementById("centerButt").addEventListener("click", centerViewArea);
    document.getElementById("dragButt").addEventListener("click", dragAction);
    document.getElementById("changeTileButt").addEventListener("click", changeTileAction);
    document.getElementById("zoomAreaSelect").addEventListener("change", zoomGrid);


    //get canvas and context
    var canvas = document.getElementById("gameCanvas");
    var context = canvas.getContext("2d");

    // Timing and fromes per second
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;

    var dragPos = {
        movingArea: 0, // Keeps the state of the current operation. i.e. not moving, moving
        startX: 0, // Start X position mouse down
        startY: 0, // Start Y position mouse down
        endX: 0, // End X position mouse up
        endY: 0 // End Y position mouse up
    }

    var mouseAction = "Drag";
    /*
    This is used for an options menu in the canvas.
    var optionMenu = {
        buttonPos: {
            x: 795,
            y: 23,
            height: 23,
            width: 80
        }
    };*/

    var level = {
        x: 250, // X position
        y: 113, // Y position
        columns: 8, // number of tile columns
        rows: 8, // number of tile rows
        tileWidth: 40, // visual width of a tile
        tileHeight: 40, // visual height of a tile
        zoomLevel: 1,
        tiles: [] // two-dimensional tile array
    };

    var tileColours = [
        "#FF8080",
        "#90FF90",
        "#8080FF"
    ];

    //Initialise the game
    function init() {
        //Add mouse events
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mouseout", onMouseOut);

        //initialise the two-dimensional tile array
        for (var i=0; i<level.columns; i++) {
            level.tiles[i] = [];
            for(var j=0; j<level.rows; j++) {
                // define a tile type
                level.tiles[i][j] = {type: 0};
            }
        }

        centerGridOnCanvas();

        //Enter main loop
        main(0);
    }

    //Main Loop
    function main(tframe) {
        //Request animation frames
        window.requestAnimationFrame(main);

        //Update fps stuff
        update(tframe);
        //Render the game.
        render();
    }

    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;

        //Update the fps counter
        updateFps(dt);
    }

    function updateFps(dt) {
        if (fpstime > 0.25) {
            //Calculate fps
            fps = Math.round(framecount / fpstime);

            //Reset time and framecount
            fpstime = 0;
            framecount = 0;
        }

        //Increase time and framecount
        fpstime += dt;
        framecount++;
    }

    function render() {
        drawFrame();
        //setLevelPos();
        drawTiles();
        drawGrid();
    }

    function setLevelPos() {
        
    }

    function drawTiles() {
        var canvasTopLeft = canvasCenterWidth();
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {
                //get the tile from level.tiles.
                var tile = level.tiles[i][j];
                var xPos = level.x + (getTileDimension(level.tileWidth, level.zoomLevel) * i);
                var yPos = level.y + (getTileDimension(level.tileHeight, level.zoomLevel) * j);

                context.fillStyle = tileColours[tile.type];
                context.fillRect(xPos, yPos, getTileDimension(level.tileWidth, level.zoomLevel), getTileDimension(level.tileHeight, level.zoomLevel));
            }
        }
    }

    function getTileDimension(tileDimension, zoomLevel) {
        return tileDimension * zoomLevel;
    }

    function drawGrid() {
        /*
        This is to make draw a line around the outside of the grid
        context.fillStyle = "#ffffff";
        context.strokeRect( level.x, level.y, level.x + (level.columns * level.tileWidth), level.y + (level.rows * level.tileHeight));*/
        var canvasTopLeft = canvasCenterWidth();
        // Columns are X
        for (var i=0; i<level.columns; i++) {
            context.fillStyle = "#ffffff";
            context.strokeRect( 
                level.x + (i * getTileDimension(level.tileWidth, level.zoomLevel)),
                level.y, 
                getTileDimension(level.tileWidth, level.zoomLevel), 
                level.rows * getTileDimension(level.tileHeight, level.zoomLevel)
            );
        }

        // Rows are Y
        for (var j=0; j<level.rows; j++) {
            context.fillStyle = "#ffffff";
            context.strokeRect( 
                level.x, 
                level.y + (j * getTileDimension(level.tileHeight, level.zoomLevel)), 
                level.columns * getTileDimension(level.tileWidth, level.zoomLevel),
                getTileDimension(level.tileHeight, level.zoomLevel)
            );
        }
        
    }

    function drawFrame() {
        // Draw background and a border
        context.fillStyle = "#d0d0d0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#e8eaec";
        context.fillRect(1,1,canvas.width-2, canvas.height-2);

        // Draw header
        context.fillStyle = "#303030";
        context.fillRect(0,0,canvas.width, 65);

        // Draw title
        context.fillStyle = "#ffffff";
        context.font = "24px Verdana";
        context.fillText("Base Creator", 10, 30);

        //Display fps
        context.fillStyle = "#ffffff";
        context.font = "12px Verdana";
        context.fillText("FPS: " + fps, 13, 50);

        /*
        This is used for an options menu in the canvas.
        //Draw options button
        context.fillStyle = "#ffffff";
        context.fillRect(optionMenu.buttonPos.x, optionMenu.buttonPos.y, optionMenu.buttonPos.width, optionMenu.buttonPos.height);
        context.fillStyle = "#000000 ";
        context.font = "18px Verdana";
        context.fillText("Options", 800, 40);*/
    }

    //Mouse event handlers
    function onMouseMove(e) {
        var mousePos = getMousePos(canvas, e);
        
        if (mouseAction === "Drag") {
            if (dragPos.movingArea === 1) {
                dragPos.endX = mousePos.x;
                dragPos.endY = mousePos.y;
                level.x = level.x - (dragPos.startX - dragPos.endX);
                level.y = level.y - (dragPos.startY - dragPos.endY);

                dragPos.startX = mousePos.x;
                dragPos.startY = mousePos.y;
                return;
            }
        }
        if (dragPos.movingArea === 1) {
            changeTile(mousePos);
        }
    }

    function onMouseDown(e) {
        dragPos.movingArea = 1;
        var mousePos = getMousePos(canvas, e);
        dragPos.startX = mousePos.x;
        dragPos.startY = mousePos.y;
    }

    function onMouseUp(e) {
        var mousePos = getMousePos(canvas, e);
        if (mouseAction === "Drag") {
            if (dragPos.movingArea === 1) {
                //dragPos.movingArea = 0;
            }
        }

        if (mouseAction === "Change") {
            changeTile(mousePos);
        }

        dragPos.movingArea = 0;
    }
    function onMouseOut(e) {}

    function changeTile(mousePos) {
        var tileCoords = getTileCoords(mousePos.x, mousePos.y);
        if (tileCoords == null) {
            //This is for an options menu in canvas.
            //handleMenuInteraction(mousePos.x, mousePos.y);
            return;
        }

        var originalTileCoords = getTileCoords(dragPos.startX, dragPos.startY);
        if (tileCoords.x != originalTileCoords.x || tileCoords.y != originalTileCoords.y) {
            //return;
        }

        var currentTileType = level.tiles[tileCoords.x][tileCoords.y].type;
        //var newTileType = (currentTileType + 1) % 3;
        var selectedTileType = document.getElementById("tileTypeSelect");
        
        var newTileType = selectedTileType.options[selectedTileType.selectedIndex].value; 

        //level.tiles[tileCoords.x][tileCoords.y].type = newTileType;
        updateTileType(tileCoords.x, tileCoords.y, newTileType);
    }

    function getTileType(X, tileY) {

    }

    /*
    This is for an options menu in canvas.
    function handleMenuInteraction(x, y) {
        var x1 = optionMenu.buttonPos.x;
        var x2 = optionMenu.buttonPos.x + optionMenu.buttonPos.width;
        var y1 = optionMenu.buttonPos.y;
        var y2 = optionMenu.buttonPos.y + optionMenu.buttonPos.height;
        if (x >= x1 && x <= x2) {
            if (y >= y1 && y <= y2) {
                console.log("Option button pressed.");
            }
        }
    }*/

    // Get Mouse position
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left) * canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top) * canvas.height)
        };
    }

    function getTileCoords(x, y) {
        var x1 = level.x;
        var x2 = level.x + (level.columns * getTileDimension(level.tileWidth, level.zoomLevel));
        var y1 = level.y;
        var y2 = level.y + (level.rows * getTileDimension(level.tileWidth, level.zoomLevel));
        if (x >= x1 && x <= x2) {
            if (y >= y1 && y <= y2) {
                var currentTileX = Math.floor((x - level.x) / getTileDimension(level.tileWidth, level.zoomLevel));
                var currentTileY = Math.floor((y - level.y) / getTileDimension(level.tileHeight, level.zoomLevel));
                //Handle when the user clicks on the perimeter line of the grid
                // mainly on the right and bottom.
                if (currentTileX >= level.columns) {
                    currentTileX--;
                }
                if (currentTileY >= level.rows) {
                    currentTileY--;
                }

                return {
                    x: currentTileX,
                    y: currentTileY
                };
            }
        }
        return null; // When the click is outside the grid
    }

    function updateTileType(columnTile, columnRow, newType) {
        level.tiles[columnTile][columnRow].type = newType;
    }

    function expandGrid() {
        //Adding new tiles to outside of grid.
        // Add column to both ends.
        
        level.tiles.unshift(createNewColumn());
        level.columns++;
        level.tiles.push(createNewColumn());
        level.columns++;
        // add one tile to each row
        for (var i=0; i<level.columns; i++) {
            level.tiles[i].unshift(createNewTile());
            level.tiles[i].push(createNewTile());
        }
        level.rows++;
        level.rows++;
    }

    function createNewTile() {
        var newTile = {type: 0};
        return newTile;
    }
    function createNewColumn() {
        var newColumn = [];
        for (var i = 0; i < level.columns; i++) {
            newColumn[i] = {type: 0};
        }
        return newColumn;
    }

    function shrinkGrid() {
        if (level.columns > 2 && level.rows > 2) {
            // Remove columns at either ends
            level.tiles.pop();
            level.columns--;
            level.tiles.shift();
            level.columns--;
            // Remove one tile from each row
            for (var i=0; i<level.columns; i++) {
                level.tiles[i].shift();
                level.tiles[i].pop();
            }
            level.rows--;
            level.rows--;
        }
    }

    function canvasCenterWidth() {
        var centerW = canvas.width / 2;
        var centerH = canvas.height /2;
        var halfColumns = level.columns / 2;
        var halfRows = level.rows / 2;
        // from the center, go half number of tiles to each side.
        var topLeftX = centerW - (halfColumns * getTileDimension(level.tileWidth, level.zoomLevel));
        var topLeftY = centerH - (halfRows * getTileDimension(level.tileHeight, level.zoomLevel));
        return { x: topLeftX, y: topLeftY};
    }

    function zoomGrid() {
        //get new size of the grid
        var selectedNum = this.selectedIndex;
        var newSize = this.options[selectedNum].value;
        var zoomLevel = 1;
        //apply size to grid
        switch(newSize) {
            case "50":
                zoomLevel = 0.5;
                break;
            case "100":
                zoomLevel = 1;
                break;
            case "150":
                zoomLevel = 1.5;
                break;
        }
        level.zoomLevel = zoomLevel;
        //profit
    }

    function centerViewArea() {
        centerGridOnCanvas();
    }
    function dragAction() {
        mouseAction = "Drag";
        document.getElementById("dragButt").classList.add("selectedButt");
        document.getElementById("changeTileButt").classList.remove("selectedButt");
    }
    function changeTileAction() {
        mouseAction = "Change";
        document.getElementById("dragButt").classList.remove("selectedButt");
        document.getElementById("changeTileButt").classList.add("selectedButt");
    }
    
    function centerGridOnCanvas() {
        var canvasTopLeft = canvasCenterWidth();
        level.x = canvasTopLeft.x;
        level.y = canvasTopLeft.y;
    }

    // call init to start the game
    init();

};