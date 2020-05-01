MyGame.graphics = (function() {
    'use strict';

    let canvas = document.getElementById('id-canvas');
    let context = canvas.getContext('2d');

    let THREE_FOURTHS_PI = Math.PI * 3 / 4
    let BOID_SIZE = 4;

    function getTrianglePoint(pos, size, pointDir) {
        let point = {
            x: pos.x + size * Math.cos(pointDir),
            y: pos.y + size * Math.sin(pointDir)
        }
        return point;
    }

    function drawTriangle(pos, size, pointDir, fillColor, borderColor){ 
        context.save();

        let pointOne = getTrianglePoint(pos, size, pointDir);
        let pointTwo = getTrianglePoint(pos, size, pointDir + THREE_FOURTHS_PI);
        let pointThree = getTrianglePoint(pos, size, pointDir - THREE_FOURTHS_PI)

        context.beginPath();
        context.fillStyle = fillColor;
        context.moveTo(pointOne.x, pointOne.y);
        context.lineTo(pointTwo.x, pointTwo.y);
        context.lineTo(pointThree.x, pointThree.y);
        context.closePath()

        
        if (borderColor){
            context.strokeStyle = borderColor;
            context.lineWidth = 2;
        }
        context.stroke();

        context.fillStyle = fillColor;
        context.fill();

        context.restore();
    }

    function drawBoid(boid){
        drawTriangle(boid.pos, 4, boid.orientation, 'rgb(0,255,0)', 'rgb(255,0,0)')
    }

    function clear() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    

    let api = {
        clear: clear,
        drawBoid: drawBoid
    };

    return api;
}());
