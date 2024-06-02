const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 320;
canvas.height = 480;

const birdImg = new Image();
birdImg.src = 'birddd.png'; 

const bird = {
    x: 50,
    y: 150,
    width: 30,
    height: 20,
    gravity: 0.4,
    lift: -7,
    velocity: 0
};

const pipes = [];
const pipeWidth = 20;
const pipeGap = 150;
const pipeFrequency = 90;
let frameCount = 0;
let score = 0;
let gameOver = false;
let pipeSpeed = 2;

function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y);
}

function drawPipes() {
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    });
}

function createPipe() {
    const top = Math.random() * (canvas.height / 2);
    const bottom = top + pipeGap;
    pipes.push({ x: canvas.width, top: top, bottom: bottom });
}

function movePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
    });

    function increasePipeSpeed() {
        pipeSpeed += 0.0001; 
    }
    setInterval(increasePipeSpeed, 5000); 

    if (pipes.length && pipes[0].x < -pipeWidth) {
        pipes.shift();
        score++;
    }
}

function checkCollision() {
    pipes.forEach(pipe => {
        if (bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)) {
            gameOver = true;
            sendScoreToBot(score); 
        }
    });

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver = true;
        sendScoreToBot(score); 
    }
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Consolas';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawSpeed() { 
    ctx.fillStyle = 'black';
    ctx.font = '20px Consolas';
    ctx.fillText(`Speed: ${pipeSpeed.toFixed(2)}`, 10, 60); 
}

function sendScoreToBot(score) {
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('chat_id');

    fetch('http://<ngrok_url>/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score: score, chat_id: chatId })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}




function update() {
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '50px Consolas';
        ctx.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2);
        return;
    }

    frameCount++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBird();

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (frameCount % pipeFrequency === 0) {
        createPipe();
    }

    movePipes();
    drawPipes();
    checkCollision();
    drawScore();
    drawSpeed(); 
    requestAnimationFrame(update);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        bird.velocity = bird.lift;
    }
});

update();
