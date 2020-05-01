MyGame.main = (function(graphics, input) {
    'use strict';    
    
    let canvas = document.getElementById('id-canvas');
    let context = canvas.getContext('2d');
    
    let scoreDisplay = document.getElementById("currentScore")
    let startButton = document.getElementById("StartButton");
    let highScores = [0, 0, 0, 0, 0];
    let highScoreDisplay = document.getElementById("highScores");
    let timerDisplay = document.getElementById("timer");
    
    let gameSizeDisplay = document.getElementById("gameSize");
    let fiveByFiveButton = document.getElementById("5x5");
    let tenByTenButton = document.getElementById("10x10");
    let fifteenByFifteenButton = document.getElementById("15x15");
    let twentyByTwentyButton = document.getElementById("20x20");

    let gameSize = 5;

    let keyboard = input.Keyboard();

    let showPath = false;
    let showBreadcrumb = false;
    let showHint = false;

    let isInGame = true;

    let lastFrameTime = Date.now();
    let elapsedTime = 0;
    let millsecCounter = 0;
    let timer = 0;
    let maze = generateMaze(gameSize, gameSize); 

    function storeHighScores(){       
        if(playerChar.getScore() > highScores[4]){
            highScores[4] = playerChar.getScore();
        }

        for(let i = 4; i > 0; i--){
            if (highScores[i] > highScores[i - 1]){
                let temp = highScores[i];
                highScores[i] = highScores[i-1];
                highScores[i-1] = temp;
            }
        }

        highScoreDisplay.innerHTML = "1st - " + highScores[0]
                                        + "<br>2nd - " + highScores[1]
                                        + "<br>3rd - " + highScores[2]
                                        + "<br>4th - " + highScores[3]
                                        + "<br>5th - " + highScores[4]
    }


    function startGame(){
        maze = generateMaze(gameSize, gameSize);
        timer = 0;
        millsecCounter = 0;
        timerDisplay.innerHTML = "Timer: 0 seconds";
        makePlayerChar();
        isInGame = true;        
    }

    startButton.onclick = startGame;

    fiveByFiveButton.onclick = function(){
        gameSize = 5;
        gameSizeDisplay.innerHTML = "Next Game Size: " + gameSize + "x" + gameSize;
    }
    tenByTenButton.onclick = function(){
        gameSize = 10;
        gameSizeDisplay.innerHTML = "Next Game Size: " + gameSize + "x" + gameSize;
    }
    fifteenByFifteenButton.onclick = function(){
        gameSize = 15;
        gameSizeDisplay.innerHTML = "Next Game Size: " + gameSize + "x" + gameSize;
    }
    twentyByTwentyButton.onclick = function(){
        gameSize = 20;
        gameSizeDisplay.innerHTML = "Next Game Size: " + gameSize + "x" + gameSize;
    }

    
    let playerChar = graphics.Character(maze.start, gameSize, gameSize);

    keyboard.register('w', playerChar.moveNorth);
    keyboard.register('a', playerChar.moveWest);
    keyboard.register('s', playerChar.moveSouth);
    keyboard.register('d', playerChar.moveEast);

    keyboard.register('i', playerChar.moveNorth);
    keyboard.register('j', playerChar.moveWest);
    keyboard.register('k', playerChar.moveSouth);
    keyboard.register('l', playerChar.moveEast);

    function makePlayerChar(){    
        playerChar = graphics.Character(maze.start, gameSize, gameSize);
    
        keyboard.register('w', playerChar.moveNorth);
        keyboard.register('a', playerChar.moveWest);
        keyboard.register('s', playerChar.moveSouth);
        keyboard.register('d', playerChar.moveEast);

        keyboard.register('i', playerChar.moveNorth);
        keyboard.register('j', playerChar.moveWest);
        keyboard.register('k', playerChar.moveSouth);
        keyboard.register('l', playerChar.moveEast);

        keyboard.register(38, playerChar.moveNorth);
        keyboard.register(39, playerChar.moveWest);
        keyboard.register(40, playerChar.moveSouth);
        keyboard.register(41, playerChar.moveEast);

        keyboard.register('p', function (){
            showPath = !showPath;
        })
        keyboard.register('b', function (){
            showBreadcrumb = !showBreadcrumb;
        })
        keyboard.register('h', function (){
            showHint = !showHint;
        })
    }

    // copied from stack overflow
    // https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
    function randInt(bottom, top) {
        return Math.floor( Math.random() * ( top - bottom) ) + bottom;
    }

    function getTiles(sizeX, sizeY){
        let tiles = [];
        for(let row = 0; row < sizeX; row++){
            tiles.push([]);
            for (let col = 0; col < sizeY; col++){
                let role = "none";
                if (row === 0 && col === 0){
                    role = "start"
                }
                if (row === sizeX - 1 && col === sizeY - 1){
                    role = "end"
                }
                tiles[row].push(graphics.Tile(row, col, sizeX, sizeY, role));
            }
        }
        return tiles;
    }


    function isPointInFrontier(x, y, frontier){
        for (let i = 0; i < frontier.length; i++){
            if (frontier[i].x === x && frontier[i].y === y){
                return true;
            }
        }
        return false;
    }


    function addBordersToFrontier(frontier, mazeTile, baseTile, tiles){
        if(baseTile.x - 1 >= 0 && !isPointInFrontier(baseTile.x - 1, baseTile.y, frontier) && !mazeTile[baseTile.x - 1][baseTile.y]){
            frontier.push(tiles[baseTile.x - 1][baseTile.y]);
        }
        if (baseTile.x + 1 < tiles.length && !isPointInFrontier(baseTile.x + 1, baseTile.y, frontier) && !mazeTile[baseTile.x + 1][baseTile.y]){
            frontier.push(tiles[baseTile.x + 1][baseTile.y]);
        }
        if (baseTile.y + 1 < tiles.length && !isPointInFrontier(baseTile.x, baseTile.y + 1, frontier) && !mazeTile[baseTile.x][baseTile.y + 1]){
            frontier.push(tiles[baseTile.x][baseTile.y + 1]);
        }
        if(baseTile.y - 1 >= 0 && !isPointInFrontier(baseTile.x, baseTile.y - 1, frontier) && !mazeTile[baseTile.x][baseTile.y - 1]){
            frontier.push(tiles[baseTile.x][baseTile.y - 1]);
        }
    }


    function findAdjMazeTiles(isInMaze, nextTile, tiles){
        let adjTiles = [];
        let left = nextTile.x - 1;
        let right =  nextTile.x + 1;
        let up = nextTile.y - 1;
        let down = nextTile.y + 1;

        if (left >= 0 && isInMaze[left][nextTile.y]){
            adjTiles.push(tiles[left][nextTile.y])
        }
        if (right < isInMaze.length && isInMaze[right][nextTile.y]){
            adjTiles.push(tiles[right][nextTile.y])
        }
        if (up >= 0 && isInMaze[nextTile.x][up]){
            adjTiles.push(tiles[nextTile.x][up])
        }
        if (down < tiles[nextTile.x].length && isInMaze[nextTile.x][down]){
            adjTiles.push(tiles[nextTile.x][down])
        }

        return adjTiles;
    }


    function knockDownWalls(tiles){
        let firstTile = tiles[randInt(0, tiles.length)][randInt(0, tiles.length)];

        let isInMaze = [];
        for(let row = 0; row < tiles.length; row++){
            isInMaze.push([]);
            for (let col = 0; col < tiles[row].length; col++){
                isInMaze[row].push(false);
            }
        }

        isInMaze[firstTile.x][firstTile.y] = true;

        let frontier = [];
        
        addBordersToFrontier(frontier, isInMaze, firstTile, tiles);

        let nextTile = null
        let randomIndex = null
        while (frontier.length > 0){
            randomIndex = randInt(0, frontier.length);
            nextTile = frontier.splice(randomIndex, 1)[0]

            isInMaze[nextTile.x][nextTile.y] = true;

            let adjMazeTiles = findAdjMazeTiles(isInMaze, nextTile, tiles);
            let chosenMazeTile = adjMazeTiles[randInt(0, adjMazeTiles.length)];            


            if(nextTile.x === chosenMazeTile.x + 1){
                nextTile.west = chosenMazeTile;
                chosenMazeTile.east = nextTile;
            }
            else if(nextTile.x === chosenMazeTile.x - 1){
                nextTile.east = chosenMazeTile;
                chosenMazeTile.west = nextTile;
            }
            else if(nextTile.y === chosenMazeTile.y + 1){
                nextTile.north = chosenMazeTile;
                chosenMazeTile.south = nextTile;
            }
            else if(nextTile.y === chosenMazeTile.y - 1){
                nextTile.south = chosenMazeTile;
                chosenMazeTile.north = nextTile;
            }
            else{
                console.log("ERROR");
            }

            addBordersToFrontier(frontier, isInMaze, nextTile, tiles);
        }

        return tiles;
    }


    function findShortestPath(newMaze){
        let possibleSolutions = [[newMaze.start]];

        let solution = null;

        let done = false;
        while (!done){
            let newPossibleSolutions = []

            for(let i = 0; i < possibleSolutions.length; i++){
                let posSol = possibleSolutions[i];
                let lastElem = posSol[posSol.length - 1]
                lastElem.setVisited();

                if(lastElem.north !== null){
                    if (lastElem.north === newMaze.end){
                        done = true;
                        solution = posSol.concat([lastElem.north]);
                    }
                    else if (!lastElem.north.visitedByShortestPath){
                        newPossibleSolutions.push(posSol.concat([lastElem.north]))
                    }
                }
                if(lastElem.south !== null){
                    if (lastElem.south === newMaze.end){
                        done = true;
                        solution = posSol.concat([lastElem.south]);
                    }
                    else if (!lastElem.south.visitedByShortestPath){
                        newPossibleSolutions.push(posSol.concat([lastElem.south]))
                    }
                }
                if(lastElem.east !== null){
                    if (lastElem.east === newMaze.end){
                        done = true;
                        solution = posSol.concat([lastElem.east]);
                    }
                    else if (!lastElem.east.visitedByShortestPath){
                        newPossibleSolutions.push(posSol.concat([lastElem.east]))
                    }
                }
                if(lastElem.west !== null){
                    if (lastElem.west === newMaze.end){
                        done = true;
                        solution = posSol.concat([lastElem.west]);
                    }
                    else if (!lastElem.west.visitedByShortestPath){
                        newPossibleSolutions.push(posSol.concat([lastElem.west]))
                    }
                }
            }
            possibleSolutions = newPossibleSolutions;
        }

        return solution;
    }


    function markShortestPath(newMaze){
        let solutionTiles = findShortestPath(newMaze);

        //get rid of start and end
        solutionTiles.shift();
        solutionTiles.pop();
        for(let i = 0; i < solutionTiles.length; i++){
            solutionTiles[i].onShortestPath = true;
        }
    }


    function generateMaze(sizeX, sizeY){
        let newMaze = {
            tiles: [],
            start:{
                x: 0,
                y: 0
            },
            end:{
                x: sizeX - 1,
                y: sizeY - 1
            }
        };

        newMaze.tiles = getTiles(sizeX, sizeY);
        newMaze.start = newMaze.tiles[0][0];
        newMaze.end = newMaze.tiles[sizeX - 1][sizeY - 1];

        knockDownWalls(newMaze.tiles);

        markShortestPath(newMaze);
        newMaze.start.onShortestPath = true;
        newMaze.end.onShortestPath = true;

        return newMaze;
    }

    let finalScore = 0;
    let finalTime = 0;

    function gameOver(){
        console.log("GAME OVER")
        finalScore = playerChar.getScore();
        finalTime = timer + (millsecCounter/1000);
        storeHighScores();
        isInGame = false;
        keyboard.clearRegister();
    }


    function update(elapsedTime) {        
        scoreDisplay.innerHTML = "Current Score: " + playerChar.getScore();
        if (isInGame){
            millsecCounter += elapsedTime;
            if (millsecCounter > 1000){
                millsecCounter -= 1000;
                timer++;
                timerDisplay.innerHTML = "Timer: " + timer + " seconds";
            }
        }
        if(playerChar.getPos() === maze.end && isInGame){
            gameOver();
        }
    }

    function renderMaze(){
        let now = Date.now()
        for(let i = 0; i < maze.tiles.length; i++){
            for (let j = 0; j < maze.tiles[i].length; j++){
                maze.tiles[i][j].draw(showPath, showBreadcrumb, showHint);
            }
        }
        // console.log(Date.now() - now);
    }

    keyboard.register('p', function (){
        showPath = !showPath;
    })
    keyboard.register('b', function (){
        showBreadcrumb = !showBreadcrumb;
    })
    keyboard.register('h', function (){
        showHint = !showHint;
    })

    function renderGameOver(){
        graphics.drawText({text: "You Won!",
                            font: "120px Arial",
                            fillStyle: "rgb(255, 255, 255)",
                            strokeStyle: "rgb(255,255,255)",
                            position:{
                                x: 300,
                                y: 400
                            }
                        });
        graphics.drawText({text: "Final Score: " + finalScore,
                            font: "40px Arial",
                            fillStyle: "rgb(255, 255, 255)",
                            strokeStyle: "rgb(255,255,255)",
                            position:{
                                x: 450,
                                y: 550
                            }
                        });
        graphics.drawText({text: "Final Time: " + finalTime + " seconds",
                            font: "40px Arial",
                            fillStyle: "rgb(255, 255, 255)",
                            strokeStyle: "rgb(255,255,255)",
                            position:{
                                x: 350,
                                y: 610
                            }
                        });
    }


    function render() {
        graphics.clear();
        renderMaze();
        playerChar.draw();

        if (!isInGame){
            renderGameOver();
        }
    }

    function processInput(elapsedTime){
        keyboard.update(elapsedTime);
    }

    function gameLoop() {
        let now = Date.now();
        elapsedTime = now - lastFrameTime;
        lastFrameTime = now;
        processInput(elapsedTime);
        update(elapsedTime);
        render();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);

}(MyGame.graphics, MyGame.input));
