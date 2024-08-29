import Q5 from "q5";
import OSC from "osc-js";

// OSC setup
let osc = new OSC();

osc.on("open", () => {
  console.log("Listening on port 8080");
});

osc.on("/udp2ws", (message) => {
  console.log(message.args);
  controlPaddles(message.args);
});

osc.open();

// Q5 setup
let q = new Q5();
new Canvas();

let font = loadFont("fonts/DotGothic16-Regular.ttf");
textFont(font);

let logo = loadImage("kinterface-logo.png");

let stage = 0;
let pause = 0;

// create wall
let wall = createSprite(canvas.hw, canvas.hh, canvas.w, canvas.h, "s");
wall.shape = "chain";
wall.color = 0;

// create goals
let goalLeft = new Sprite(0, canvas.hh, 10, canvas.h, "s");
let goalRight = new Sprite(canvas.w, canvas.hh, 10, canvas.h, "s");
goalLeft.color = goalRight.color = "white";

// create scores
let scoreLeft = 0;
let scoreRight = 0;

// create ball
let ball = new Sprite(canvas.hw, canvas.hh, 20, "d");
ball.color = "white";
ball.bounciness = 0.8;
ball.friction = 1;
ball.direction = random([-180, -20, 20, 180]);

let resetBall = () => {
  ball.x = canvas.hw;
  ball.y = canvas.hh;
  ball.direction = random([-175, -20, -10, 10, 20, 175]);
};

// create paddles
let paddleWidth = 40;
let paddleHeight = 160;
let paddleA = new Sprite(200, canvas.hh, paddleWidth, 40, "k");
paddleA.color = "red";
let paddleB = new Sprite(400, canvas.hh, paddleWidth, paddleHeight, "k");
paddleB.color = "blue";
let paddleC = new Sprite(canvas.w - 400, canvas.hh, paddleWidth, paddleHeight * 2, "k");
paddleC.color = "yellow";
let paddleD = new Sprite(canvas.w - 200, canvas.hh, paddleWidth, paddleHeight, "k");
paddleD.color = "green";

let controlPaddles = (args) => {
  if (stage !== 1 || args.length !== 4) return;

  // paddle A = 腹筋ローラー (0 or 1)
  if (args[0] === 1 && paddleA.height <= canvas.h) {
    paddleA.height += 5;
  } else if (args[0] === 0 && paddleA.height > 40) {
    paddleA.height -= 10;
  }

  // paddle B = バランスボール (0-127)
  paddleB.y = map(args[1], 0, 127, paddleB.height / 2, canvas.h - paddleB.height / 2);

  // paddle C = 反復横跳び (0-3)
  if (args[2] === 1 && paddleC.y - paddleC.height / 2 > 0) {
    paddleC.move(15, "up", 1);
  } else if (args[2] === 0 && paddleC.y + paddleC.height / 2 < canvas.h) {
    paddleC.move(15, "down", 1);
  }

  // paddle D = ダムベル (0-127)
  let buffer = [];
  let sensorVal = args[3];
  buffer.push(sensorVal);
  if (buffer.length > 5) {
    buffer.shift();
  }
  let avgSensorVal = buffer.reduce((sum, value) => sum + value, 0) / buffer.length;
  paddleD.y = map(avgSensorVal, 0, 127, paddleD.height / 2, canvas.h - paddleD.height / 2);
};

let startTitle = "Press space to start game";
let endTitle = "";

q.draw = () => {
  clear();
  background(0);

  if (stage === 0) {
    q.loadGame();
  } else if (stage === 1) {
    q.startGame();
  } else {
    q.endGame();
  }

  // hide sprites when not in-game
  let visible = stage === 1;
  wall.visible = visible;
  goalLeft.visible = visible;
  goalRight.visible = visible;
  ball.visible = visible;
  paddleA.visible = visible;
  paddleB.visible = visible;
  paddleC.visible = visible;
  paddleD.visible = visible;
};

q.loadGame = () => {
  imageMode(CENTER);
  image(logo, canvas.hw, canvas.hh);
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(startTitle, canvas.hw, canvas.hh + logo.height / 2 + 100);

  // reset score
  scoreLeft = scoreRight = 0;
  resetBall();
  paddleA.y = paddleB.y = paddleC.y = paddleD.y = canvas.hh;

  if (kb.presses(" ")) {
    stage = 1;
  }
};

q.startGame = () => {
  fill(255);
  textSize(40);
  text(scoreLeft, canvas.w / 4, 100);
  text(scoreRight, (canvas.w / 4) * 3, 100);

  if (pause > 0) {
    pause--;
    return;
  }

  ball.speed = 10;

  if (ball.collides(goalLeft)) {
    scoreRight++;

    pause = 120;
    ball.speed = 0;
    resetBall();
  } else if (ball.collides(goalRight)) {
    scoreLeft++;

    pause = 120;
    ball.speed = 0;
    resetBall();
  }

  if (kb.presses("r")) {
    resetBall();
  }

  if (scoreLeft === 3 || scoreRight === 3) {
    stage = 2;
  }
};

q.endGame = () => {
  ball.speed = 0;
  pause = 0;

  if (scoreLeft === 3) {
    endTitle = "Game Over. Team A (腹筋ローラー & バランスボール) wins.";
  } else if (scoreRight === 3) {
    endTitle = "Game Over. Team B (反復横跳び & ダムベル) wins.";
  }

  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(endTitle, canvas.hw, canvas.hh);

  if (kb.presses(" ")) {
    stage = 0;
  }
};
