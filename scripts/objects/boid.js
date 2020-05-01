const MAX_SPEED = 200; //pixels per second

let canvas = document.getElementById('id-canvas');

function randInt(bottom, top) {
    return Math.floor( Math.random() * ( top - bottom) ) + bottom;
}

function getPos(){
    return {x: randInt(0, canvas.width), y: randInt(0, canvas.height)};
}

function getOrientation() {
    return Math.random() * 2 * Math.PI;
}

MyGame.objects.Boid = function(boidId){
    let pos = getPos();
    let orientation = getOrientation();
    let speed = 100;
    let maxSpeed = MAX_SPEED; 

    let specs = {
        pos: pos,
        orientation: orientation,
        speed: speed,
        maxSpeed: maxSpeed
    }

    function update(elapsedTime){
        let timeInSeconds = elapsedTime / 1000;
        console.log()
        specs.pos.x += specs.speed * Math.cos(specs.orientation) * timeInSeconds;
        specs.pos.y += specs.speed * Math.sin(specs.orientation) * timeInSeconds;
    }

    let api = {
        get pos() { return specs.pos; },
        get orientation() { return specs.orientation; },
        update: update
    };

    return api;
}