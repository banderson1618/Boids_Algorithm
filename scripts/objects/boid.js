let canvas = document.getElementById('id-canvas');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const MAX_TURN_RATE = Math.PI  // radians per second
const VISUAL_RANGE = WIDTH / 10;
const DIST_FROM_WALL = 50;

function randInt(bottom, top) {
    return Math.floor( Math.random() * ( top - bottom) ) + bottom;
}

function getPos(){
    return {x: 900, y: 500}//{x: randInt(0, WIDTH), y: randInt(0, HEIGHT)};
}

function getOrientation() {
    return -0.5;// Math.random() * 2 * Math.PI;
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

MyGame.objects.Boid = function(boidId){
    let pos = getPos();
    let orientation = getOrientation();
    let speed = 50;

    let specs = {
        pos: pos,
        orientation: orientation,
        speed: speed,
    }

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

    function turnAwayFromDir(dir){
        if (specs.orientation - dir > 0){
            return Math.PI / 2;
        }
        else{
            return -1 * Math.PI / 2;
        }
    }

    function avoidWalls(){
        switch(findClosestWall()){
            case WALLS.TOP:
                console.log("TOP");
                return turnAwayFromDir(Math.PI / 2);
            case WALLS.BOTTOM:
                console.log("BOTTOM");
                return turnAwayFromDir(3 * Math.PI / 2);
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

    function bindToLimit(val, limit){
        let retVal = Math.min(val, Math.abs(limit));
        retVal = Math.max(val, -1 * Math.abs(limit));
        return retVal;
    }
    
    function setOrientation(timeInSeconds, boids){
        let turn = 0;
    
        turn += avoidWalls();

        turn = bindToLimit(turn, MAX_TURN_RATE * timeInSeconds);
        if (turn !== 0){
            console.log(MAX_TURN_RATE * timeInSeconds)
            console.log(turn);
        }
        
        specs.orientation += turn;
        if (specs.orientation > 2 * Math.PI){
            specs.orientation -= 2 * Math.PI;
        }
        else if(specs.orientation < 0){
            specs.orientation += 2 * Math.PI;
        }
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