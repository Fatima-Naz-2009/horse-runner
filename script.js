const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");

const scoreEl = document.getElementById("score");

const gameEl = document.getElementById("game");
const horseEl = document.getElementById("horse");

const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreEl = document.getElementById("finalScore");

const restartBtn = document.getElementById("restartBtn");


const state = {
    started: false,

    score: 0,

    horseY: 84,
    horseVY: 0,

    gravity: -0.58,
    jumpPower: 11.2,

    isJumping: false,

    obstacles: [],

    spawnTimer: 0,
    spawnInterval: 1500,

    obstacleSpeed: 5,

    spriteFrame: 0,
    spriteTimer: 0,

    animationFrame: null,

    lastTime: 0
};


function startGame() {

    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }

    state.started = true;

    state.score = 0;

    state.horseY = 84;
    state.horseVY = 0;

    state.isJumping = false;

    state.spawnTimer = 0;
    state.spawnInterval = 1500;

    state.obstacleSpeed = 5;

    state.spriteFrame = 0;
    state.spriteTimer = 0;

    state.obstacles.forEach(obstacle => {
        obstacle.remove();
    });

    state.obstacles = [];

    scoreEl.textContent = "Score: 0";

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    setHorseFrame(0);

    horseEl.style.bottom = `${state.horseY}px`;

    state.lastTime = performance.now();

    state.animationFrame = requestAnimationFrame(gameLoop);
}


function gameLoop(timestamp) {

    if (!state.started) {
        return;
    }

    const delta = Math.min(
        timestamp - state.lastTime,
        40
    );

    state.lastTime = timestamp;


    updateHorse(delta);

    updateHorseAnimation(delta);

    updateObstacles(delta);


    state.animationFrame = requestAnimationFrame(gameLoop);
}


/* Horse jumping and gravity */

function updateHorse(delta) {

    const timeScale = delta / 16.6667;

    state.horseVY += state.gravity * timeScale;

    state.horseY += state.horseVY * timeScale;


    if (state.horseY <= 84) {

        state.horseY = 84;

        state.horseVY = 0;

        state.isJumping = false;
    }


    horseEl.style.bottom = `${state.horseY}px`;
}


/* Six-frame running animation */

function updateHorseAnimation(delta) {

    state.spriteTimer += delta;


    if (state.spriteTimer >= 90) {

        state.spriteTimer -= 90;

        state.spriteFrame++;

        if (state.spriteFrame >= 6) {
            state.spriteFrame = 0;
        }

        setHorseFrame(state.spriteFrame);
    }
}


function setHorseFrame(frame) {

    const frameWidth = 120;

    horseEl.style.backgroundPosition =
        `-${frame * frameWidth}px 0`;
}


/* Obstacles */

function updateObstacles(delta) {

    const timeScale = delta / 16.6667;


    state.spawnTimer += delta;


    if (
        state.spawnTimer >= state.spawnInterval &&
        canSpawnObstacle()
    ) {

        spawnObstacle();

        state.spawnTimer = 0;

        state.spawnInterval =
            1100 + Math.random() * 900;
    }


    const horseHitbox = getHorseHitbox();


    for (
        let i = state.obstacles.length - 1;
        i >= 0;
        i--
    ) {

        const obstacle = state.obstacles[i];

        const currentLeft =
            Number.parseFloat(obstacle.style.left);


        const newLeft =
            currentLeft -
            state.obstacleSpeed * timeScale;


        obstacle.style.left = `${newLeft}px`;


        const obstacleRect =
            obstacle.getBoundingClientRect();


        /* Remove obstacle after it leaves the screen */

        if (obstacleRect.right < 0) {

            obstacle.remove();

            state.obstacles.splice(i, 1);

            state.score++;

            scoreEl.textContent =
                `Score: ${state.score}`;

            continue;
        }


        const obstacleHitbox =
            getObstacleHitbox(obstacle);


        if (
            isColliding(
                horseHitbox,
                obstacleHitbox
            )
        ) {

            gameOver();

            return;
        }
    }
}


/* Prevent obstacles from spawning too close together */

function canSpawnObstacle() {

    if (state.obstacles.length === 0) {
        return true;
    }


    const lastObstacle =
        state.obstacles[state.obstacles.length - 1];


    const lastLeft =
        Number.parseFloat(lastObstacle.style.left);


    return lastLeft <
        gameEl.clientWidth - 300;
}


/* Create an obstacle */

function spawnObstacle() {

    const obstacle =
        document.createElement("div");


    obstacle.className = "obstacle";


    obstacle.style.left =
        `${gameEl.clientWidth}px`;


    gameEl.appendChild(obstacle);


    state.obstacles.push(obstacle);
}


/* Jump */

function jump() {

    if (!state.started) {
        return;
    }


    if (state.isJumping) {
        return;
    }


    state.horseVY =
        state.jumpPower;


    state.isJumping = true;
}


/* More accurate horse collision box */

function getHorseHitbox() {

    const rect =
        horseEl.getBoundingClientRect();


    return {

        left: rect.left + 18,

        right: rect.right - 12,

        top: rect.top + 12,

        bottom: rect.bottom - 6
    };
}


/* More accurate obstacle collision box */

function getObstacleHitbox(obstacle) {

    const rect =
        obstacle.getBoundingClientRect();


    return {

        left: rect.left + 4,

        right: rect.right - 4,

        top: rect.top + 3,

        bottom: rect.bottom
    };
}


/* Rectangle collision */

function isColliding(a, b) {

    return (

        a.left < b.right &&

        a.right > b.left &&

        a.top < b.bottom &&

        a.bottom > b.top

    );
}


/* Game over */

function gameOver() {

    state.started = false;


    if (state.animationFrame) {

        cancelAnimationFrame(
            state.animationFrame
        );

        state.animationFrame = null;
    }


    finalScoreEl.textContent =
        `Your Score: ${state.score}`;


    gameOverScreen.classList.remove("hidden");
}


/* Restart */

restartBtn.addEventListener(
    "click",
    startGame
);


/* Start */

startBtn.addEventListener(
    "click",
    startGame
);


/* Keyboard controls */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.code !== "Space" &&
            event.code !== "ArrowUp"
        ) {

            return;
        }


        event.preventDefault();


        if (!state.started) {

            startGame();

            return;
        }


        jump();
    }
);


/* Mouse / touch controls */

gameEl.addEventListener(
    "pointerdown",
    (event) => {

        if (
            event.target.closest("button")
        ) {

            return;
        }


        if (!state.started) {
            return;
        }


        jump();
    }
);