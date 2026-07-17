let canvas = document.getElementById('canvas');
let score = document.getElementById('scoreCount');
let record = document.getElementById('recordCount');
let gameOverMenu = document.querySelector('.gameOver');
let ctx = canvas.getContext('2d'); //webgl
let img = new Image;
img.onload = spin;
img.src = './tree-stump.png';

class Stump {
    constructor({
        radius,
        rotate = 0,
        speed = 0.02,
        xPosition = canvas.width / 2,
        yPosition = (canvas.height / 2) -50
    }) {
        this.radius = radius;
        this.rotate = rotate;
        this.speed = speed;
        this.xPosition = xPosition;
        this.yPosition = yPosition;
    }
}

class Arrow {
    constructor(){
        this.x = canvas.width / 2;
        this.y = canvas.height;
        this.speed = 5;////////////////////////////////////////////////////
        this.stuck = false;
        this.isMoving = false;
        this.angleOffset = 0;
    }
    draw(){
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y - 80);
        ctx.strokeStyle = "black"; //may change themes later idk
        ctx.lineWidth = 4;
        ctx.stroke();
    }
}

let stump = new Stump({radius: 100});
let arrows = [];
let gameMode = 'start'
let animationId;
arrows[0] = {
    make: new Arrow()
}

function movement(shape) {
    shape.rotate += shape.speed;
}
function newArrow(){
    arrows.push({ make: new Arrow() });
}

function spin(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (gameMode == 'start') {
        shoot();
        movement(stump);
    };

    ctx.save();
    ctx.translate(stump.xPosition, stump.yPosition);
    ctx.rotate(stump.rotate);
    ctx.translate(-stump.xPosition, -stump.yPosition);;
    
    ctx.beginPath();
    ctx.arc(stump.xPosition, stump.yPosition, stump.radius, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(img, stump.xPosition - stump.radius, stump.yPosition - stump.radius, stump.radius * 2, stump.radius * 2);

    ctx.restore();
    for (let i = 0; i < arrows.length; i++) {
        let arrow = arrows[i].make;
        
        if (arrow.stuck) {
            // 1. Compute rotated attachment point
            let angle = arrow.angleOffset + stump.rotate;

            // The arrow’s base sits slightly outside the stump
            let offset = 2;
            let attachX = stump.xPosition + Math.cos(angle) * (stump.radius + offset);
            let attachY = stump.yPosition + Math.sin(angle) * (stump.radius + offset);

            // 2. Draw arrow pointing in the same direction it was shot (upward)
            let arrowLength = 80;
            let dirX = Math.cos(angle) * arrowLength;
            let dirY = Math.sin(angle) * arrowLength;        // points upward


            ctx.beginPath();
            ctx.moveTo(attachX, attachY);
            ctx.lineTo(attachX + dirX, attachY + dirY);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        else{
            arrow.draw();
        }
    }

    ctx.beginPath();
    ctx.arc(400, 200, 100, 0, Math.PI * 2);
    ctx.strokeStyle = "#693c07";
    ctx.lineWidth = 5;
    ctx.stroke();
    
    animationId = window.requestAnimationFrame(spin);
}

//window.requestAnimationFrame(spin);

document.addEventListener("keydown", () => {
    if (gameMode == 'start'){
        let arrow = arrows[arrows.length-1].make;
        if (!arrow.stuck) {
            arrow.isMoving = true;
        }
    }
    if (gameMode == 'gameOver') {
        restartGame();
    }
});

function normalizeAngle(a) {
    a = a % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    return a;
}

function shoot(){
    let arrow = arrows[arrows.length - 1].make;

    if(!arrow.stuck && arrow.isMoving){
        arrow.y -= arrow.speed;
    }

    let xdifference = arrow.x - stump.xPosition;
    let ydifference = (arrow.y - 80) - stump.yPosition;
    let distance = Math.sqrt(xdifference*xdifference + ydifference*ydifference);

    if (distance < stump.radius && !arrow.stuck){
        let hitAngle = normalizeAngle(Math.atan2(ydifference, xdifference)- stump.rotate);

        for(let i = 0; i < arrows.length - 1; i++){
            let other = arrows[i].make;
            if (other.stuck){
                let diff = Math.abs(hitAngle- other.angleOffset);
                diff = Math.min(diff, Math.PI * 2 - diff);
                let threshold = 0.05;//rads

                if (diff < threshold) {
                    gameOver()
                    // handle collision (game over, fail animation, etc.)
                    return;
                }
            }
        }
        
        arrow.stuck = true;
        arrow.isMoving = false;
        arrow.angleOffset = normalizeAngle(hitAngle);
        stump.speed += 0.0002;
        
        updateScore();
        newArrow();
    }
}

function restartGame() {
    gameOverMenu.style.display = "none";

    arrows = [];
    arrows.push({ make: new Arrow() });

    stump.rotate = 0;
    stump.speed = 0.02;
    score.innerHTML = 0;
    
    gameMode = "start";
    spin();
}

function gameOver(){
    gameMode = 'gameOver';
    gameOverMenu.style.display = 'block';
    cancelAnimationFrame(animationId)
}
let newRecord = 0;////////////////////////////////////
function updateScore(){
    let current = arrows.length;
    score.innerHTML = current;
    if (current > newRecord){
        newRecord = current;
        record.innerHTML = newRecord;
    }
}

spin()

