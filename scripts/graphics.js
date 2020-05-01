MyGame.graphics = (function() {
    'use strict';

    let canvas = document.getElementById('id-canvas');
    let context = canvas.getContext('2d');

    let HINT_COLOR = "rgba(255, 255, 255, 0.5)";
    let BREADCRUMB_COLOR = 'rgb(222, 184, 135)';
    let HINT_BORDER_COLOR = "rgba(0,0,0,0)";


    let tileImage = new Image();
    tileImage.isReady = false;
    tileImage.onload = function() {
        this.isReady = true;
    };
    tileImage.src = './assets/floor.png';

    
    let charImage = new Image();
    charImage.isReady = false;
    charImage.onload = function(){
        this.isReady = true;
    };
    charImage.src = './assets/character.png'

    function clear() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawCircle(centerX, centerY, radius, color, borderColor){ 
        context.save();

        if (borderColor){
            context.strokeStyle = borderColor;
            context.lineWidth = 10;
        }
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
        context.stroke();

        context.restore();
    }


    function drawBreadcrumb(centerX, centerY, circleRadius){        
        drawCircle(centerX, centerY, circleRadius, BREADCRUMB_COLOR);
    }

    function Tile(x, y, numTilesX, numTilesY, role){
        let tileSizeX = canvas.width / numTilesX;
        let tileSizeY = canvas.height / numTilesY;


        let nextToChar = false;
        let onShortestPath = false;
        let visitedByShortestPath = false;

        let circleColor = null;
        
        let circleRadius = tileSizeX / 8;
        if (role === 'start'){
            circleRadius = tileSizeX / 4;
            circleColor = 'rgb(255, 0, 0)';
        }
        else if (role === 'end'){
            circleRadius = tileSizeX / 4;
            circleColor = 'rgb(0, 255, 0)';
        }

        let leftCoord = x * tileSizeX;
        let topCoord = y * tileSizeY;
        let rightCoord = (x + 1) * tileSizeX;
        let bottomCoord = (y + 1) * tileSizeY;

        let centerX = (leftCoord + rightCoord) / 2;
        let centerY = (topCoord + bottomCoord) / 2;

        let north = null;
        let south = null;
        let east = null;
        let west = null;
        
        function draw(showPath, showBreadcrumb, showHint){
            if (tileImage.isReady){
                context.drawImage(tileImage, 
                                    leftCoord, topCoord,
                                    tileSizeX, tileSizeY);
            }
            if (role === 'breadcrumb' && showBreadcrumb){
                drawBreadcrumb(centerX, centerY, tileSizeX / 8);
            }

            if(role === 'start' || role === 'end'){
                drawCircle(centerX, centerY, circleRadius, circleColor);
            }

            if (showPath && this.onShortestPath && role !== 'end' && role !== 'start'){     
                drawCircle(centerX, centerY, tileSizeX / 4, HINT_COLOR, HINT_BORDER_COLOR);
            }

            if (this.nextToChar && this.onShortestPath && showHint){
                //TODO: Write show hint 
                drawCircle(centerX, centerY, tileSizeX / 4, HINT_COLOR, HINT_BORDER_COLOR);
            }

            context.save();
            context.strokeStyle = "rgba(0, 0, 0, 1)";
            context.lineWidth = 3;
            context.beginPath();

            if (this.north === null) {
                context.moveTo(leftCoord, topCoord);
                context.lineTo(rightCoord, topCoord);
            }
            if (this.south === null){
                context.moveTo(leftCoord, bottomCoord);
                context.lineTo(rightCoord, bottomCoord);
            }
            if (this.west === null){
                context.moveTo(leftCoord, topCoord);
                context.lineTo(leftCoord, bottomCoord);
            }
            if (this.east === null){
                context.moveTo(rightCoord, topCoord);
                context.lineTo(rightCoord, bottomCoord);
            }
            
            context.stroke();
            context.restore();
        }

        function getRole(){
            return role;
        }

        function getVisitedByShortestPath(){
            return visitedByShortestPath
        }

        function setVisited(){
            this.visitedByShortestPath = true;
        }

        function setBreadcrumb(){
            if (role === 'start' || role === 'end') return;
            role = "breadcrumb";
        }

        return {
            draw: draw,
            set north(newNorth){
                this.north = newNorth;
            },
            set south(newSouth){
                this.south = newSouth;
            },
            set east(newEast){
                this.east = newEast;
            },
            set west(newWest){
                this.west = newWest;
            },
            setBreadcrumb: setBreadcrumb,
            north: north,
            south: south,
            east: east,
            west: west,
            x: x,
            y: y,
            getRole: getRole,
            set onShortestPath(newOnShortestPath){
                this.onShortestPath = newOnShortestPath;
            },
            onShortestPath: onShortestPath,
            set nextToChar(newNextToChar){
                this.nextToChar = newNextToChar;
            },
            nextToChar: nextToChar,
            getVisitedByShortestPath: getVisitedByShortestPath,
            setVisited: setVisited
        }
    }


    function setNeighborsToVal(pos, val){
        if (pos.north !== null){
            pos.north.nextToChar = val;
        }
        if (pos.south !== null){
            pos.south.nextToChar = val;
        }
        if (pos.east !== null){
            pos.east.nextToChar = val;
        }
        if (pos.west !== null){
            pos.west.nextToChar = val;
        }
    }

    function Character(startTile, numTilesX, numTilesY){
        let pos = startTile;

        let score = 0;
        
        let tileSizeX = canvas.width / numTilesX;
        let tileSizeY = canvas.height / numTilesY;

        let leftCoord = pos.x * tileSizeX;
        let topCoord = pos.y * tileSizeY;
        let rightCoord = (pos.x + 1) * tileSizeX;
        let bottomCoord = (pos.y + 1) * tileSizeY;

        setNeighborsToVal(pos, true);

        function draw(){
            if (charImage.isReady){
                context.drawImage(charImage,
                                    leftCoord, topCoord,
                                    tileSizeX, tileSizeY);
            }
        }

        function moveNorth(){
            if (pos.north !== null){
                if (pos.north.onShortestPath){
                    pos.north.onShortestPath = false;
                    pos.onShortestPath = false;

                    if (pos.north.getRole() !== 'breadcrumb'){
                        score += 5;
                    }
                }
                else{
                    pos.onShortestPath = true;
                    if (pos.north.getRole() !== 'breadcrumb'){
                        score -= 2;
                    }
                }

                setNeighborsToVal(pos, false);

                pos.setBreadcrumb();
                pos = pos.north;
                leftCoord = pos.x * tileSizeX;
                topCoord = pos.y * tileSizeY;
                setNeighborsToVal(pos, true);                
            }
            console.log(score);
        }

        function moveSouth(){
            if (pos.south !== null){
                if (pos.south.onShortestPath){
                    pos.south.onShortestPath = false;
                    pos.onShortestPath = false;

                    if (pos.south.getRole() !== 'breadcrumb'){
                        score += 5;
                    }
                }
                else{
                    pos.onShortestPath = true;
                    if (pos.south.getRole() !== 'breadcrumb'){
                        score -= 2;
                    }
                }

                setNeighborsToVal(pos, false);

                pos.setBreadcrumb();
                pos = pos.south;
                leftCoord = pos.x * tileSizeX;
                topCoord = pos.y * tileSizeY;
                setNeighborsToVal(pos, true);
            }
            console.log(score);
        }

        function moveWest(){
            if (pos.west !== null){
                if (pos.west.onShortestPath){
                    pos.west.onShortestPath = false;
                    pos.onShortestPath = false;

                    if (pos.west.getRole() !== 'breadcrumb'){
                        score += 5;
                    }
                }
                else{
                    pos.onShortestPath = true;
                    if (pos.west.getRole() !== 'breadcrumb'){
                        score -= 2;
                    }
                }

                setNeighborsToVal(pos, false);

                pos.setBreadcrumb();
                pos = pos.west;
                leftCoord = pos.x * tileSizeX;
                topCoord = pos.y * tileSizeY;
                setNeighborsToVal(pos, true);
            }
            console.log(score);
        }

        function moveEast(){
            if (pos.east !== null){
                if (pos.east.onShortestPath){
                    pos.east.onShortestPath = false;
                    pos.onShortestPath = false;

                    if (pos.east.getRole() !== 'breadcrumb'){
                        score += 5;
                    }
                }
                else{
                    pos.onShortestPath = true;
                    if (pos.east.getRole() !== 'breadcrumb'){
                        score -= 2;
                    }
                }

                setNeighborsToVal(pos, false);

                pos.setBreadcrumb();
                pos = pos.east;
                leftCoord = pos.x * tileSizeX;
                topCoord = pos.y * tileSizeY;
                setNeighborsToVal(pos, true);
            }
            console.log(score);
        }

        function getScore(){
            return score;
        }

        function getPos(){
            return pos;
        }

        return {
            draw: draw,
            getPos: getPos,
            moveNorth: moveNorth,
            moveSouth: moveSouth,
            moveEast: moveEast,
            moveWest: moveWest,
            getScore: getScore
        }
    }

    function drawText(spec) {
        context.save();

        context.font = spec.font;
        context.fillStyle = spec.fillStyle;
        context.strokeStyle = spec.strokeStyle;
        context.textBaseline = 'top';

        context.fillText(spec.text, spec.position.x, spec.position.y);
        context.strokeText(spec.text, spec.position.x, spec.position.y);

        context.restore();
    }

    let api = {
        clear: clear,
        Tile: Tile, 
        Character: Character,
        drawText: drawText
    };

    return api;
}());
