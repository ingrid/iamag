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

  var player = makePlayer(game);
  var road = drawRoad(game);
  var cam = makeCam(game, player);
  bg.color = "rgba(0,128,255,0.75)";

  game.add(player);
  game.add(bg);
  //game.camera.follow = player;
  game.camera.follow = cam;
  //game.camera.bounce.x = 20;
  //game.camera.bounce.y = 20;
  game.run();
}

var makeCam = function(g, p){
  var c = new jam.Sprite(p.x, p.y);
  c.update = jam.extend(c.update, function(elapsed){
    c.x = p.x;
    c.y = p.y;
  });
  g.add(c);
  return c;
}

var drawRoad = function(game){
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

// Generate coordinates for drawing the road.


var makePlayer = function(game){

  /**/
  var speed = 0;
  var speedMax = 200;
  var speedMaxReverse = -3;
  var speedAcceleration = .5;
  var speedDeceleration = .90;
  var groundFriction = .95;

  var steering = 0;
  var steeringMax = 2;
  var steeringAcceleration = .10;
  var steeringFriction = .98;

  var velocityX = 0;
  var velocityY = 0;

  var up = false;
  var down = false;
  var left = false;
  var right = false;
  /**/

  var d_speed = 100;
  var max_speed = 600;
  var player = jam.AnimatedSprite(320, 4000);
    player.setImage("data/car.png", 32, 51);



  player.anim_idle = jam.Animation.Strip([0], 32, 51, 0);
  //player.anim_run = jam.Animation.Strip([1,2,3,4,5,6], 32, 51, 9);
  player.anim_run = player.anim_idle;
  player.anim_jump = jam.Animation.Strip([32], 32, 51, 0);
  player.playAnimation(player.anim_idle);

  player.setCollisionOffsets(6, 0, 20, 31);
  player.setLayer(1);

  player.update = jam.extend(player.update, function(elapsed){
    /**/
    if(up){
      if (speed < speedMax){
        speed += speedAcceleration;
        if (speed > speedMax){
          speed = speedMax;
        }
      }
    }
    if(down){
      if (speed > speedMaxReverse){
        speed -= speedAcceleration;
        if (speed < speedMaxReverse){
          speed = speedMaxReverse;
        }
      }
    }
    if (left){
      steering -= steeringAcceleration;
      if (steering > steeringMax){
        steering = steeringMax;
      }
    }
    if(right){
      steering += steeringAcceleration;
      if (steering < -steeringMax){
        steering = -steeringMax;
      }
    }

    speed *= groundFriction;

    // prevent drift
    if(speed > 0 && speed < 0.05){
      speed = 0;
    }

    velocityX = Math.sin (player.angle * Math.PI / 180) * speed;
    velocityY = Math.cos (player.angle * Math.PI / 180) * -speed;

    player.x += velocityX;
    player.y += velocityY;

    // prevent steering drift (right)
    if(steering > 0){
      // check if steering value is really low, set to 0
      if(steering < 0.05)
      {
        steering = 0;
      }
    }
    // prevent steering drift (left)
    else if(steering < 0){
      // check if steering value is really low, set to 0
      if(steering > -0.05){
        steering = 0;
      }
    }

    // apply steering friction
    steering = steering * steeringFriction;

    // make car go straight after driver stops turning
    steering -= (steering * 0.1);

    // rotate
    player.angle += steering * speed;
    /**/

    /**/
	if(jam.Input.justPressed("A") || jam.Input.justPressed("UP")){
      up = true;
    } else if(jam.Input.justPressed("S") || jam.Input.justPressed("DOWN")){
      down = true;
    } else if(jam.Input.justPressed("LEFT")){
      left = true;
    } else if(jam.Input.justPressed("RIGHT")){
      right = true;
    }

	if(jam.Input.justReleased("A") || jam.Input.justReleased("UP")){
      up = false;
    } else if(jam.Input.justReleased("S") || jam.Input.justReleased("DOWN")){
      down = false;
    } else if(jam.Input.justReleased("LEFT")){
      left = false;
    } else if(jam.Input.justReleased("RIGHT")){
      right = false;
    }
    /**/

    /** /
	player.velocity.x = 0;
	player.acceleration.y = 0;
	if(jam.Input.buttonDown("A") || jam.Input.buttonDown("UP")){
      player.acceleration.y -= 100;
    } else if(jam.Input.justPressed("S") || jam.Input.justPressed("DOWN")){
      if (player.velocity.y < 0){
        player.acceleration.y += 5000;
      }
    } else if(jam.Input.buttonDown("S") || jam.Input.buttonDown("DOWN")){
      if (player.velocity.y < 0){
        player.acceleration.y += 20;
      }
    }
	if(jam.Input.buttonDown("LEFT")){
	  player.velocity.x = Math.floor(-0.75 * Math.abs(player.velocity.y));
	  player.playAnimation(player.anim_run);
	  player.facing = jam.Sprite.LEFT;
      if (player.velocity.y > 0){
        player.acceleration.y += 2;
      }
	}
	else if(jam.Input.buttonDown("RIGHT")){
	  player.velocity.x = Math.floor(0.75 * Math.abs(player.velocity.y));
	  player.playAnimation(player.anim_run);
	  player.facing = jam.Sprite.RIGHT;
      if (player.velocity.y > 0){
        player.acceleration.y += 2;
      }
	}
	else{
	  player.playAnimation(player.anim_idle);
	}

    if (player.velocity.y > 0){
      // Consider implementing driving in reverse later.
      player.velocity.y = 0;
      player.acceleration.y = 0;
    }
    if (player.velocity.x > max_speed){
      player.velocity.x = max_speed;
    }
    /**/
  });
  return player;
}


window.onload = function(){
  jam.preload("data/player.png");
  jam.preload("data/car.png");
  jam.showPreloader(document.body, initialize);
};
