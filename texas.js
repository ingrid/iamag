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

	bg.color = "rgba(0,128,255,0.75)";

	game.add(player);
	game.add(bg);

	game.run();
}

makePlayer = function(game){
	var player = jam.AnimatedSprite(250, 400);
	player.setImage("data/player.png", 32, 32);

	player.anim_idle = jam.Animation.Strip([0], 32, 32, 0);
	player.anim_run = jam.Animation.Strip([1,2,3,4,5,6], 32, 32, 9);
	player.anim_jump = jam.Animation.Strip([32], 32, 32, 0);
	player.playAnimation(player.anim_idle);

	player.setCollisionOffsets(6, 0, 20, 31);
	player.setLayer(1);

	player.update = jam.extend(player.update, function(elapsed){

		player.velocity.x = 0;
		if(jam.Input.buttonDown("LEFT")){
			player.velocity.x = -90;
			player.playAnimation(player.anim_run);
			player.facing = jam.Sprite.LEFT;
		}
		else if(jam.Input.buttonDown("RIGHT")){
			player.velocity.x = 90;
			player.playAnimation(player.anim_run);
			player.facing = jam.Sprite.RIGHT;
		}
		else{
			player.playAnimation(player.anim_idle);
		}

		if(!player.touchingBottom){
			player.playAnimation(player.anim_jump);
		}

		if((jam.Input.justPressed("X") || jam.Input.justPressed("UP")) && player.touchingBottom){
			player.velocity.y = -200;
		}
	});
	return player;
}
