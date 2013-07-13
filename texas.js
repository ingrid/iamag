jam.includeModule("RectCollision");
jam.includeModule("Animation");
jam.includeModule("Debug");

window.onload = function(){
  jam.preload("data/player.png");
  jam.showPreloader(document.body, initialize);
}

initialize = function(){
  var game = jam.Game(640, 480, document.body);

  //jam.Debug.showBoundingBoxes = true;

  var bg = jam.Sprite(0, 0);
  bg.width = 640; bg.height = 480;
  bg.image = document.createElement("canvas");
  bg.image.width = 640;
  bg.image.height = 480;
  erase = false;
  var ctx = bg.image.getContext("2d");

  var player = makePlayer(game);
  var path = generate_path(1000);
  var road = drawRoad(game, path);
  bg.color = "rgba(0,128,255,0.75)";

  game.add(player);
  game.add(bg);
  game.camera.follow = player;
  game.run();
}

var drawRoad = function(game, path){
  var tmp_canvas = document.createElement("canvas");
  tmp_canvas.width = 640;
  tmp_canvas.height = 1000;
  var tmp_context = tmp_canvas.getContext("2d");
  tmp_context.beginPath();
  tmp_context.moveTo(path.start.x, path.start.y);
  tmp_context.lineWidth = 10;
  tmp_context.strokeStyle = 'black';
  tmp_context.lineCap = 'round';
  var delta = 0;
  path.nodes.forEach(function(n){
    var cpx = 320 + n.inten;
    var cpy = delta + n.apex;
    var epx = 320;
    var epy = delta + n.delta;
    tmp_context.quadraticCurveTo(cpx, cpy, epx, epy);
    delta += n.delta;
  });
  tmp_context.stroke();
  /**/
  delta = 0;
  path.nodes.forEach(function(n){
    var cpx = 320 + n.inten;
    var cpy = delta + n.apex;
    var epx = 320;
    var epy = delta + n.delta;
    var radius = 5;
    console.log(delta);
    console.log('cpx, cpy', cpx, cpy);
    console.log('epx, epy', epx, epy);
    tmp_context.beginPath();
    tmp_context.arc(cpx, cpy, radius, 0, 2 * Math.PI, false);
    tmp_context.arc(epx, epy, radius, 0, 2 * Math.PI, false);
    tmp_context.fillStyle = 'green';
    tmp_context.fill();
    //tmp_context.stroke();
    delta += n.delta;
  });
  /**/


  var road = new jam.Sprite(0, 0);
  road.image = tmp_canvas
  road.width = tmp_canvas.width;
  road.height = tmp_canvas.height;
  game.add(road);

}

// Generate coordinates for drawing the road.
var generate_path = function(len){
  var path = {};
  var dist = 0;
  path.start = {};
  path.start.x = 320;
  path.start.y = 0;

  var max_delt = 600;
  var min_delt = 200;
  var delt_delt = max_delt - min_delt;
  var max_in = 100;

  nodes = [];

  while (len - dist > 100){
    var node = {};
    node.delta = min_delt + Math.floor(Math.random() * (delt_delt));
    node.apex = Math.floor(Math.random() * node.delta);
    node.inten = Math.floor(Math.random() * max_in);
    nodes.push(node);
    dist += node.delta;
  }
  path.nodes = nodes;
  //return path;
  return {"start":{"x":320,"y":0},"nodes":[{"delta":314,"apex":267,"inten":4},{"delta":254,"apex":73,"inten":82},{"delta":460,"apex":244,"inten":97}]};
};

var makePlayer = function(game){
  var d_speed = 100;
  var max_speed = 400;
  var player = jam.AnimatedSprite(320, 1000);
  player.setImage("data/player.png", 32, 32);

  player.anim_idle = jam.Animation.Strip([0], 32, 32, 0);
  player.anim_run = jam.Animation.Strip([1,2,3,4,5,6], 32, 32, 9);
  player.anim_jump = jam.Animation.Strip([32], 32, 32, 0);
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
