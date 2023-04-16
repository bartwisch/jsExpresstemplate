window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    const engine = new BABYLON.Engine(canvas, true);

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    let audioContextActivated = false;
    document.addEventListener('keydown', function () {
        if (!audioContextActivated) {
            audioContext.resume();
            audioContextActivated = true;
        }
    });
    document.addEventListener('click', function () {
        audioContext.resume();
    });


    function playShootSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
    
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
    
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, 100);
    }
    
    function playHitSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
    
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
    
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, 100);
    }
    
    

    const createScene = function () {
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(0, 0, 1);

        const camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, -100), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        camera.orthoTop = canvas.height / 2;
        camera.orthoBottom = -canvas.height / 2;
        camera.orthoLeft = -canvas.width / 2;
        camera.orthoRight = canvas.width / 2;

        const spaceshipMaterial = new BABYLON.StandardMaterial('spaceshipMaterial', scene);
        spaceshipMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

        const spaceship = BABYLON.MeshBuilder.CreateBox('spaceship', { width: 50, height: 30, depth: 1 }, scene);
        spaceship.position.x = -350;
        spaceship.position.z = 1;
        spaceship.material = spaceshipMaterial;

        const bullets = [];
        const enemies = [];

        const onKeyDown = function (event) {
            if (event.key === 'ArrowUp') {
                spaceship.position.y += 10;
            } else if (event.key === 'ArrowDown') {
                spaceship.position.y -= 10;
            } else if (event.key === 'ArrowLeft') {
                spaceship.position.x -= 10;
            } else if (event.key === 'ArrowRight') {
                spaceship.position.x += 10;
            } else if (event.key === ' ') {
                const bullet = BABYLON.MeshBuilder.CreateBox('bullet', { width: 10, height: 2, depth: 1 }, scene);
                bullet.position.x = spaceship.position.x + 30;
                bullet.position.y = spaceship.position.y;
                bullet.position.z = 1;
                bullet.material = spaceshipMaterial;
                bullets.push(bullet);
                playShootSound();
            }
        };
        

        scene.onKeyboardObservable.add(({ event }) => onKeyDown(event), BABYLON.KeyboardEventTypes.KEYDOWN);

        let enemySpawnCounter = 0;

        scene.registerBeforeRender(() => {
            // Sidescrolling
            camera.position.x += 1;
            spaceship.position.x += 1;

            // Update bullets
            bullets.forEach((bullet, index) => {
                bullet.position.x += 5;
                if (bullet.position.x > camera.position.x + canvas.width / 2) {
                    bullet.dispose();
                    bullets.splice(index, 1);
                }
            });

            // Update enemies
            enemies.forEach((enemy, index) => {
                enemy.position.x -= 2;
                if (enemy.position.x < camera.position.x - canvas.width / 2) {
                    enemy.dispose();
                    enemies.splice(index, 
                        1);
                    }
                    });
                            // Spawn enemies
        enemySpawnCounter++;
        if (enemySpawnCounter >= 100) {
            const enemyMaterial = new BABYLON.StandardMaterial('enemyMaterial', scene);
            enemyMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);

            const enemy = BABYLON.MeshBuilder.CreateBox('enemy', { width: 30, height: 30, depth: 1 }, scene);
            enemy.position.x = camera.position.x + canvas.width / 2;
            enemy.position.y = Math.random() * (canvas.height - 60) - (canvas.height / 2 - 30);
            enemy.position.z = 1;
            enemy.material = enemyMaterial;
            enemies.push(enemy);

            enemySpawnCounter = 0;
        }

        // Detect collisions between bullets and enemies
        bullets.forEach((bullet, bulletIndex) => {
            enemies.forEach((enemy, enemyIndex) => {
                if (Math.abs(bullet.position.x - enemy.position.x) < 20 &&
                    Math.abs(bullet.position.y - enemy.position.y) < 20) {
                    bullet.dispose();
                    bullets.splice(bulletIndex, 1);
        
                    enemy.dispose();
                    enemies.splice(enemyIndex, 1);
        
                    playHitSound();
                }
            });
        });
    });

    return scene;
};

const scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener('resize', function () {
    engine.resize();
});
});