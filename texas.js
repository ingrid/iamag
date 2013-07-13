jam.includeModule("RectCollision");
jam.includeModule("Animation");
jam.includeModule("Debug");

var initialize = function(){
  var game = jam.Game(640, 480, document.body);

  //jam.Debug.showBoundingBoxes = true;

  var bg = jam.Sprite(0, 0);
  bg.width = 640; bg.height = 480;
  bg.image = document.createElement("canvas");
  bg.image.width = 640;
  bg.image.height = 480;
  erase = false;
  var ctx = bg.image.getContext("2d");

  drawBackground(game);
  var player = makePlayer(game);
  var road = drawRoad(game);
  
  bg.color = "rgba(0,128,255,0.75)";

  game.add(player);
  game.add(bg);
  game.camera.follow = player;
  game.camera.bounce.x = 20;
  game.camera.bounce.y = 20;
  game.run();
}

var drawRoad = function(game, path){
  var tmp_canvas = document.createElement("canvas");
  tmp_canvas.width = 640;
  tmp_canvas.height = 5000;
  var tmp_context = tmp_canvas.getContext("2d");
  tmp_context.beginPath();
  tmp_context.moveTo(300, 0);
  tmp_context.lineWidth = 90;
  tmp_context.strokeStyle = 'grey';
  tmp_context.lineCap = 'Round';
  var delta = 0;
  var step = 200;
  var intensity = tmp_canvas.width / 2 / 2 / 2;
  var center_x = tmp_canvas.width / 2;
  var points = _.chain(_.range(20)).map(function(i) {
      var x = i % 2 ? center_x - intensity: center_x + intensity;
      var y = i * step;
      return [x, y];
  }).flatten().value();
  tmp_context.drawCurve(points);
  tmp_context.stroke();
  tmp_context.drawCurve(points);
  tmp_context.lineWidth = 5;
  tmp_context.strokeStyle = 'yellow';
  tmp_context.stroke();
  /**/
  delta = 0;

  var road = new jam.Sprite(0, 0);
  road.image = tmp_canvas;
  road.width = tmp_canvas.width;
  road.height = tmp_canvas.height;
  game.add(road);

};

var drawBackground = function(game){
  var tmp_canvas = document.createElement("canvas");
  tmp_canvas.width = 640;
  tmp_canvas.height = 5000;
  var tmp_context = tmp_canvas.getContext("2d");
  tmp_context.rect(0,0,tmp_canvas.width,tmp_canvas.height);
  tmp_context.fillStyle="tan";
  tmp_context.fill();

  var bg = new jam.Sprite(0, 0);
  bg._layer = -100;
  bg.image = tmp_canvas;
  bg.width = tmp_canvas.width;
  bg.height = tmp_canvas.height;
  game.add(bg);
};

// Generate coordinates for drawing the road.


var makePlayer = function(game){
  var d_speed = 100;
  var max_speed = 400;
  var player = jam.AnimatedSprite(320, 1000);
    player.setImage("data/car.png", 32, 51);
  


  player.anim_idle = jam.Animation.Strip([0], 32, 51, 0);
  //player.anim_run = jam.Animation.Strip([1,2,3,4,5,6], 32, 51, 9);
  player.anim_run = player.anim_idle;
  player.anim_jump = jam.Animation.Strip([32], 32, 51, 0);
  player.playAnimation(player.anim_idle);

  player.setCollisionOffsets(6, 0, 20, 31);
  player.setLayer(1);

  player.update = jam.extend(player.update, function(elapsed){

	player.velocity.x = 0;
	player.acceleration.y = 0;
	if(jam.Input.buttonDown("LEFT")){
	  player.velocity.x = -90;
	  player.playAnimation(player.anim_run);
	  player.facing = jam.Sprite.LEFT;
      if (player.velocity.y > 0){
        player.acceleration.y += 2;
      }
	}
	else if(jam.Input.buttonDown("RIGHT")){
	  player.velocity.x = 90;
	  player.playAnimation(player.anim_run);
	  player.facing = jam.Sprite.RIGHT;
      if (player.velocity.y > 0){
        player.acceleration.y += 2;
      }
	}
	else{
	  player.playAnimation(player.anim_idle);
	}

	if(jam.Input.buttonDown("A") || jam.Input.buttonDown("UP")){
      player.acceleration.y -= 100;
    } else if(jam.Input.buttonDown("S") || jam.Input.buttonDown("DOWN")){
      player.acceleration.y += 500;
    }

    if (player.velocity.y > 0){
      // Consider implementing driving in reverse later.
      player.velocity.y = 0;
    }
    if (player.velocity.x > max_speed){
      player.velocity.x = max_speed;
    }

  });
  return player;
}


window.onload = function(){
  jam.preload("data/player.png");
  jam.preload("data/car.png");
  jam.showPreloader(document.body, initialize);
};
