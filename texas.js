jam.includeModule("RectCollision");
jam.includeModule("Animation");
jam.includeModule("Debug");

var initialize = function(){
  var game = window.game = jam.Game(640, 480, document.body);
  game.bgColor = 'tan';

  //jam.Debug.showBoundingBoxes = true;

  var bg = jam.Sprite(0, 0);
  bg.width = 640; bg.height = 480;
  bg.image = document.createElement("canvas");
  bg.image.width = 640;
  bg.image.height = 480;
  erase = false;
  var ctx = bg.image.getContext("2d");

  var player = makePlayer(game);
  var cop = makeCop(game);
  var road = drawRoad(game);
  var cam = makeCam(game, player);
  var potHole = makePotHole(260, 3000, player);
  var bus = makeBus(330, 3000, player);
  game.add(bus);
  game.add(potHole);

  _.each(_.range(30), function(i) {
    var potHole = makePotHole(randomRange(260, 360), i * randomRange(100, 300), player);
    game.add(potHole);
  });

  bg.color = "rgba(0,128,255,0.75)";

  game.add(player);
  game.add(bg);
  //game.camera.follow = player;
  game.camera.follow = cam;
  //game.camera.bounce.x = 20;
  //game.camera.bounce.y = 20;
  game.run();
}

var randomRange = function(min, max) {
  return Math.random() * (max - min) + min;
};

var makeCam = function(g, p){
  var c = new jam.Sprite(p.x, p.y);
  c.update = jam.extend(c.update, function(elapsed){
    c.x = p.x;
    c.y = p.y;
  });
  g.add(c);
  return c;
};

var cops = [];
var playCopCrash = _.debounce(function() {
  jam.Sound.play('data/car_crash_03.ogg');
}, 5000, true);
var makeCop =  function(game){
  var c = jam.Sprite(320, 4050);
  c.setImage("data/police_car.png", 32, 51);
  game.add(c);
  cops.push(c);
  c.speed = 5;

  /** /
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
  var coll_cou = 0;

  var dumb = function(elapsed){
    /**/

    if(c.overlaps(player)){
      playCopCrash();
      coll_cou += 0.1;
    } else if (coll_cou > 0){
      coll_cou = 0;
    }
    c.collide(player);
    //c.acceleration.x = -c.velocity.x * 5000;
    //c.acceleration.y = -c.velocity.y * 50000;

    var vec = {};
    vec.x = c.x - player.x;
    vec.y = c.y - player.y;
    var dist = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    if(dist != 0){
      vec.x /= dist;
      vec.y /= dist;
    }else{
      vec.x = 0;
      vec.y = -1;
    }
    c.forward = vec;
    if((Math.abs(c.x - player.x) > 20 ) || (Math.abs(c.y - player.y) > 20)){
      c.angle = -(Math.atan2(vec.x, vec.y) * (180/Math.PI));
      var cou_fac = (1/(Math.floor(coll_cou) + 1));
      if (cou_fac < 0.1){
        // It would be cool if velocity prior to the collision factored into this, but first we need cop acceleration.
        cou_fac = 0;
      }
      var velocityX = Math.sin (c.angle * Math.PI / 180) * c.speed * cou_fac;
      var velocityY = Math.cos (c.angle * Math.PI / 180) * -c.speed * cou_fac;
      c.x += velocityX;
      c.y += velocityY;

      //c.velocity.x = -vec.x * c.speed;
      //c.velocity.y = -vec.y * c.speed;
    }
    /**/

    /** /
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

     velocityX = Math.sin (c.angle * Math.PI / 180) * speed;
     velocityY = Math.cos (c.angle * Math.PI / 180) * -speed;

     c.x += velocityX;
     c.y += velocityY;

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
     c.angle += steering * speed;
     /**/
  };

  c.update = jam.extend(c.update, function(elapsed){
    dumb();
  });
};

var drawRoad = function(game){
  var tmp_canvas = document.createElement("canvas");
  tmp_canvas.width = 640;
  tmp_canvas.height = 10000;
  var tmp_context = tmp_canvas.getContext("2d");
  tmp_context.beginPath();
  tmp_context.moveTo(300, 0);
  tmp_context.lineWidth = 290;
  tmp_context.strokeStyle = 'grey';
  tmp_context.lineCap = 'Round';
  var delta = 0;
  var step = 500;
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
  road._layer = -10;
  road.image = tmp_canvas;
  road.width = tmp_canvas.width;
  road.height = tmp_canvas.height;
  game.add(road);

};

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
  var max_speed = 400;
  // G.
  player = jam.AnimatedSprite(320, 9000);
  player.setImage("data/car.png", 32, 51);



  player.anim_idle = jam.Animation.Strip([0], 32, 51, 0);
  //player.anim_run = jam.Animation.Strip([1,2,3,4,5,6], 32, 51, 9);
  player.anim_run = player.anim_idle;
  player.anim_jump = jam.Animation.Strip([32], 32, 51, 0);
  player.playAnimation(player.anim_idle);

  player.setCollisionOffsets(6, 0, 20, 31);
  player.setLayer(1);
  player.damage = 0;

  // TODO from Mr. President Tibbers.
  // Give Open Web Diplomat Mozilla Dino some hugs.
  // Give Parisian Diplomat Tibbers some American honey.

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

    player._speed = speed;

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
     if(jam.Input.buttonDown("A") || jam.Input.buttonDown("UP")){
     player.acceleration.y -= 100;
     } else if(jam.Input.buttonDown("S") || jam.Input.buttonDown("DOWN")){
     player.acceleration.y += 100;
     }

     if (player.velocity.y > 0){
     // Consider implementing driving in reverse later.
     //player.velocity.y = 0;
     }
     if (player.velocity.x > max_speed){
     player.velocity.x = max_speed;
     }
     /**/
  });
  return player;
};

var makeBus = function(x, y, player){
  var d_speed = 100;
  var max_speed = 420;
  var bus = jam.AnimatedSprite(x, y);
  bus.setImage("data/bus.png", 32, 64);

  bus.anim_idle = jam.Animation.Strip([0], 32, 64, 0);
  bus.anim_run = bus.anim_idle;
  bus.playAnimation(bus.anim_idle);

  //bus.setCollisionOffsets(5, 5, 5, 5);
  bus.setLayer(1);
  bus.speed = 7;
  var coll_cou = 0;
  bus.update = jam.extend(bus.update, function(elapsed){
    if(bus.overlaps(player)){
      jam.Sound.play('data/car_crash_02.ogg');
      coll_cou += 0.1;
    } else if (coll_cou > 0){
      coll_cou = 0;
    }
    bus.collide(player);

    var vec = {};
    vec.x = bus.x - player.x -35;
    vec.y = bus.y - player.y;
    var dist = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    if(dist != 0){
      vec.x /= dist;
      vec.y /= dist;
    }else{
      vec.x = 0;
      vec.y = -1;
    }
    bus.forward = vec;
    if((Math.abs(bus.x - player.x -35) > 20 ) || (Math.abs(bus.y - player.y) > 20)){
      bus.angle = -(Math.atan2(vec.x, vec.y) * (180/Math.PI));
      var cou_fac = (1/(Math.floor(coll_cou) + 1));
      if (cou_fac < 0.1){
        // It would be cool if velocity prior to the collision factored into this, but first we need cop acceleration.
        cou_fac = 0;
      }
      var velocityX = Math.sin (bus.angle * Math.PI / 180) * bus.speed * cou_fac;
      var velocityY = Math.cos (bus.angle * Math.PI / 180) * -bus.speed * cou_fac;
      bus.x += Math.floor(velocityX);
      bus.y += Math.floor(velocityY);
      if (player.y - bus.y < -400) {
        bus.x = player.x + 200;
        bus.y = player.y - 500;
      }

    }
  });
  return bus;
};

var makePotHole = function(x, y, player) {
  var pothole = jam.AnimatedSprite(x || 0, y || 0);
  pothole.setImage("data/pothole.png", 32, 26);
  pothole.update = jam.extend(pothole.update, function(elapsed){
    if(player.overlaps(pothole) && !pothole.has_collided){
      pothole.has_collided = true;
      player.setImage('data/damaged_car.png');
      jam.Sound.play('data/car_crash_01.ogg');
      player.damage++;
      // play damage sound

    }
  });
  return pothole;
};

var gameOver = function(game) {
  var gameOver = jsGame.Sprite(281, 200);
  gameOver.gameOveretImage("data/gameOver.png");
  gameOver.layer = 100;
  game.add(gameOver);
  
};


window.onload = function(){
  jam.preload("data/player.png");
  jam.preload("data/car.png");
  jam.preload("data/pothole.png");
  jam.preload("data/bus.png");
  jam.preload("data/damaged_car.png");
  jam.preload("data/car_crash_01.ogg");
  jam.preload("data/car_crash_02.ogg");
  jam.preload("data/car_crash_03.ogg");
  jam.preload(car_engine_low_ogg);
  jam.preload(car_engine_med_ogg);
  jam.preload(car_engine_high_ogg);
  jam.showPreloader(document.body, initialize);
};
