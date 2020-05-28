let canvas = document.getElementById('id-canvas');

const FULL_RADIAN = Math.PI * 2
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const MAX_TURN_RATE = 2 * Math.PI // radians per second
const VISUAL_RANGE = WIDTH / 10;
const DIST_FROM_WALL = 50;
const TEST_TURN_RATE = Math.PI / 90;

function randInt(bottom, top) {
    return Math.floor( Math.random() * ( top - bottom) ) + bottom;
}

function getPos(){
    return {x: randInt(DIST_FROM_WALL, WIDTH - DIST_FROM_WALL), y: randInt(DIST_FROM_WALL, HEIGHT - DIST_FROM_WALL)};
}

function getOrientation() {
    return Math.random() * 2 * Math.PI;
}

const WALLS = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
    NO_CLOSE_WALL: 'no_close_wall'
}

function closeEnough(distance){
    return distance < DIST_FROM_WALL;
}

function bindToLimit(val, limit){
    let absLimit = Math.abs(limit)
    let retVal = Math.min(val, absLimit);
    retVal = Math.max(retVal, -1 * absLimit);
    return retVal;
}

function bindRadian(val){
    let retVal = val
    if (val > FULL_RADIAN){
        retVal -= FULL_RADIAN;
    }
    else if(val < 0){
        retVal += FULL_RADIAN;
    }
    return retVal
}

MyGame.objects.Boid = function(boidId){
    let pos = getPos();
    let orientation = getOrientation();
    let speed = 200;

    let specs = {
        pos: pos,
        orientation: orientation,
        speed: speed,
    }

    function anglesAreClose(angleOne, angleTwo, margin){
        return Math.abs(angleOne - angleTwo) < margin || Math.abs((angleOne - 2 * Math.PI) - angleTwo) < margin;
    }


    function turnAwayFromDir(dir){  
        let dirMagnitude = 0;
        let leftDir = dir;
        let rightDir = dir;
        while (true){
            dirMagnitude += TEST_TURN_RATE;
            leftDir = specs.orientation - dirMagnitude;
            rightDir = specs.orientation + dirMagnitude;
            if (anglesAreClose(bindRadian(leftDir), dir, TEST_TURN_RATE)){
                return Math.PI / 2;
            }
            else if(anglesAreClose(bindRadian(rightDir), dir, TEST_TURN_RATE)){
                return -Math.PI / 2;
            }
        }
    }

    function avoidWalls(){
        let distFromLeft = specs.pos.x;
        let distFromRight = WIDTH - specs.pos.x;
        let distFromTop = specs.pos.y;
        let distFromBottom = HEIGHT - specs.pos.y;
        if(closeEnough(distFromLeft)){
            if(closeEnough(distFromTop)){
                return turnAwayFromDir(FULL_RADIAN * 5 / 8)
            }
            else if (closeEnough(distFromBottom)){
                return turnAwayFromDir(FULL_RADIAN * 3 / 8)            
            }
            else{
                return turnAwayFromDir(FULL_RADIAN / 2)
            }
        }
        else if(closeEnough(distFromRight)){
            if(closeEnough(distFromTop)){
                return turnAwayFromDir(FULL_RADIAN * 7 / 8)
            }
            else if (closeEnough(distFromBottom)){
                return turnAwayFromDir(FULL_RADIAN / 8)            
            }
            else{
                return turnAwayFromDir(0)
            }
        }
        else if(closeEnough(distFromTop)){
            return turnAwayFromDir(FULL_RADIAN * 3 / 4)
        }
        else if(closeEnough(distFromBottom)){
            return turnAwayFromDir(FULL_RADIAN / 4)
        }
        else {
            return 0;
        }
    }
    
    function setOrientation(timeInSeconds, boids){
        let turn = 0;

        let turnFromWallsVal = avoidWalls();
    
        if (turnFromWallsVal !== 0){
            turn = turnFromWallsVal;
        }
        else {
        }

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