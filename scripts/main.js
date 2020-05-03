MyGame.main = (function(graphics, objects) {
    'use strict';    
    
    let canvas = document.getElementById('id-canvas');

    const NUM_BOIDS = 1;

    let boids = [];


    let pos = {
        x: 500,
        y: 500
    }
    
    let lastFrameTime = Date.now();
    let elapsedTime = 0;

    function update(elapsedTime) {
        for (let boid of boids){
            boid.update(elapsedTime, boids)
        }
    }

    function render() {
        graphics.clear();
        for (let boid of boids){
            graphics.drawBoid(boid);
        }
    }

    function gameLoop() {
        let now = Date.now();
        elapsedTime = now - lastFrameTime;
        lastFrameTime = now;
        update(elapsedTime);
        render();

        requestAnimationFrame(gameLoop);
    }

    function populateBoids(){
        for(let i = 0; i < NUM_BOIDS; i++){
            boids.push(new objects.Boid(i));
        }
    }

    function start() {
        populateBoids();

        requestAnimationFrame(gameLoop);
    }

    start();

}(MyGame.graphics, MyGame.objects));
