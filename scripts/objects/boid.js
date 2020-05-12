let canvas = document.getElementById('id-canvas');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const MAX_TURN_RATE = Math.PI  // radians per second
const VISUAL_RANGE = WIDTH / 10;
const DIST_FROM_WALL = 200;
const TEST_TURN_RATE = Math.PI / 90;

function randInt(bottom, top) {
    return Math.floor( Math.random() * ( top - bottom) ) + bottom;
}

function getPos(){
    return {x: 800, y: 500}
    // return {x: randInt(DIST_FROM_WALL, WIDTH - DIST_FROM_WALL), y: randInt(DIST_FROM_WALL, HEIGHT - DIST_FROM_WALL)};
}

function getOrientation() {
    // return Math.random() * 2 * Math.PI;
    return 0.
}

const WALLS = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
    NO_CLOSE_WALL: 'no_close_wall'
}

function notCloseEnough(distance){
    return distance > DIST_FROM_WALL;
}

function bindToLimit(val, limit){
    let absLimit = Math.abs(limit)
    let retVal = Math.min(val, absLimit);
    retVal = Math.max(retVal, -1 * absLimit);
    return retVal;
}

function bindRadian(val){
    let retVal = val
    if (val > 2 * Math.PI){
        retVal += diff;
    }
    else if(val < 0){
        retVal += 2 * Math.PI;
    }
    return retVal
}

MyGame.objects.Boid = function(boidId){
    let pos = getPos();
    let orientation = getOrientation();
    let speed = 100;

    let specs = {
        pos: pos,
        orientation: orientation,
        speed: speed,
    }

    console.log("Turn: " +turnAwayFromDir(0))

    function findClosestWall(){
        let distFromLeft = specs.pos.x;
        let distFromRight = WIDTH - specs.pos.x;
        let distFromTop = specs.pos.y;
        let distFromBottom = HEIGHT - specs.pos.y;

        if (notCloseEnough(distFromLeft) && notCloseEnough(distFromRight) && notCloseEnough(distFromTop) && notCloseEnough(distFromBottom)){
            return WALLS.NO_CLOSE_WALL;
        }

        if(distFromRight < distFromLeft){
            if(distFromTop < distFromBottom){
                if (distFromRight < distFromTop){
                    return WALLS.RIGHT;
                }
                else {
                    return WALLS.TOP;
                }
            }
            else {
                if (distFromRight < distFromBottom){
                    return WALLS.RIGHT;
                }
                else {
                    return WALLS.BOTTOM;
                }
            }
        }
        else {            
            if(distFromTop < distFromBottom){
                if (distFromTop < distFromLeft){
                    return WALLS.TOP;
                }
                else{
                    return WALLS.LEFT
                }
            }
            else {
                if (distFromBottom < distFromLeft){
                    return WALLS.BOTTOM;
                }
                else{
                    return WALLS.LEFT;
                }
            }
        }
    }

    function anglesAreClose(angleOne, angleTwo, margin){
        return Math.abs(angleOne - angleTwo) > margin || Math.abs((angleOne - 2 * Math.PI) - angleTwo) > margin;
    }


    function turnAwayFromDir(dir){  
        let turnLeftDir = specs.orientation;
        let turnRightDir = specs.orientation; 
        while (true){
            turnLeftDir -= TEST_TURN_RATE;
            turnRightDir += TEST_TURN_RATE;
            turnLeftDir = bindRadian(turnLeftDir)
            turnRightDir = bindRadian(turnLeftDir)
            if (anglesAreClose(turnRightDir, dir, TEST_TURN_RATE)){
                console.log("turnRightDir: " + turnRightDir)
                console.log("turnLeftDir: " + turnLeftDir)
                console.log()
                return Math.PI / 2;
            }
            else if(anglesAreClose(turnLeftDir, dir, TEST_TURN_RATE)){
                return -1 * Math.PI / 2;
            }
        }
    }

    function avoidWalls(){
        switch(findClosestWall()){
            case WALLS.TOP:
                console.log("TOP");
                return turnAwayFromDir(3 * Math.PI / 2);
            case WALLS.BOTTOM:
                console.log("BOTTOM");
                return turnAwayFromDir(Math.PI / 2);
            case WALLS.LEFT:
                console.log("LEFT");
                return turnAwayFromDir(Math.PI);
            case WALLS.RIGHT:
                console.log("RIGHT");
                return turnAwayFromDir(0);
            case WALLS.NO_CLOSE_WALL:
                return 0;
        }
    }
    
    function setOrientation(timeInSeconds, boids){
        let turn = 0;
    
        turn += avoidWalls();

        turn = bindToLimit(turn, MAX_TURN_RATE * timeInSeconds);
        
        specs.orientation += turn;
        specs.orientation = bindRadian(specs.orientation)
    }

    function move(timeInSeconds){
        specs.pos.x += specs.speed * Math.cos(specs.orientation) * timeInSeconds;
        specs.pos.y += specs.speed * Math.sin(specs.orientation) * timeInSeconds;
    }

    function update(elapsedTime, boids){
        let timeInSeconds = elapsedTime / 1000;
        setOrientation(timeInSeconds, boids)
        move(timeInSeconds)
    }

    let api = {
        get pos() { return specs.pos; },
        get orientation() { return specs.orientation; },
        update: update
    };

    return api;
}