MyGame.main = (function(graphics, objects) {
    'use strict';    
    
    let canvas = document.getElementById('id-canvas');
    let context = canvas.getContext('2d');

    let boid = objects.Boid(1)

    let pos = {
        x: 500,
        y: 500
    }
    
    let lastFrameTime = Date.now();
    let elapsedTime = 0;

    function update(elapsedTime) {        
        boid.update(elapsedTime)
    }

    function render() {
        graphics.clear();
        graphics.drawBoid(boid);
    }

    function gameLoop() {
        let now = Date.now();
        elapsedTime = now - lastFrameTime;
        lastFrameTime = now;
        update(elapsedTime);
        render();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);

}(MyGame.graphics, MyGame.objects));
