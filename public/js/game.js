var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'matter',
      matter: {
          gravity: {
              scale: 0
          },
          plugins: {
              attractors: true
          }
      }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  } 
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image('ship', 'assets/spaceShips_001.png');
  this.load.image('otherPlayer', 'assets/enemyBlack5.png');
  this.load.image('star', 'assets/star_gold.png');
  this.load.image('sun', 'assets/sun.png');
}

function create() {
  //var floor = new Phaser.Geom.Rectangle(0, 450, 800, 50);
    //var graphics = this.add.graphics({ fillStyle: { color: 0x0000ff } });

    //graphics.fillRectShape(floor);
  var self = this;
  this.matter.world.setBounds(0, 0, 800, 600);
  this.socket = io();
  this.otherPlayers = [];
  this.cat1 = this.matter.world.nextCategory();
  this.cat2 = this.matter.world.nextCategory();

  this.sun = this.matter.add.image(400, 200, 'sun', null, {
        //mass: {0.5},
        shape: {
            type: 'circle',
            radius: 64
        },
        plugin: {
            attractors: [
                function (bodyA, bodyB) {
                    return {
                        x: (bodyA.position.x - bodyB.position.x)*0.000008,
                        y: (bodyA.position.y - bodyB.position.y)*0.000008
                    };
                }
            ]
        }
    });

    //this.sun.setMass(10);

  //for(var i = 0;i<this.otherPlayers.length;i++){
  //    this.matter.add.image()
  //}
    //otherplayer is a group that makes it easier to add physics to a number of bodies
  //this.otherPlayers = this.matter.add.group();
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on('disconnect', function (playerId) {
    //self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      self.otherPlayers.forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.socket.on('playerMoved', function (playerInfo) {

    //self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      self.otherPlayers.forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });


  });
  this.cursors = this.input.keyboard.createCursorKeys();

  this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
  this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });
  
  this.socket.on('scoreUpdate', function (scores) {
    self.blueScoreText.setText('Blue: ' + scores.blue);
    self.redScoreText.setText('Red: ' + scores.red);
  });

  this.socket.on('starLocation', function (starLocation) {
    if (self.star){
      //self.matter.world.remove(self.matter.world,self.star);
        //self.Composite.remove(world, self.star);
          //self.star.destroy()
        self.star.visible = false;
        self.matter.world.remove(self.star);

        //self.star.graphics.destroy();
        //self.star.destroy();
        }
    //else {
        self.star = self.matter.add.image(starLocation.x, starLocation.y, 'star');
        self.star.setMass(100);
        self.star.setFrictionAir(0.35);
        //self.star.setCollisionCategory(self.cat2);
    //}
    //self.matter.add.overlap(self.ship, self.star, function () {
    //  this.socket.emit('starCollected');
    //}, null, self);



  });

    self.matter.world.on('collisionstart', function (event, bodyA, bodyB){
        //console.log(bodyA.gameObject.texture.key);
        //console.log(bodyB.gameObject.texture);
        //console.log(bodyA);
        //console.log(bodyB);

        var myProp = 'texture';
        if(bodyA.gameObject!=null&&bodyB.gameObject!=null) {


            if (bodyA.gameObject.texture.key === "star" && bodyB.gameObject.texture.key === "ship" || bodyA.gameObject.texture.key === "ship" && bodyB.gameObject.texture.key === "star") {
                self.socket.emit('starCollected');

            }

        }
        //self.matter.world.remove(self.star);
        //self.star.graphics.destroy();
        //console.log(self.matter.world);
        //self.star.destroy();



    });

}

function addPlayer(self, playerInfo) {
  self.ship = self.matter.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  //self.ship.setMass(1);
  //self.ship = self.matter.add.image(playerInfo.x, playerInfo.y, 'ship');


    //self.ship.setCollisionCategory(self.cat1);
  //self.ship.setCollidesWith([ self.cat2 ]);

  if (playerInfo.team === 'blue') {
    self.ship.setTint(0x0000ff);
  } else {
    self.ship.setTint(0xff0000);
  }
  self.ship.setFrictionAir(0.15);
  self.ship.setMass(1);
  //self.ship.rotate(45);
  self.ship.setFixedRotation();
  //self.ship.setAngularDrag(100);
  //self.ship.setMaxVelocity(200);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  //otherPlayer.setCollisionCategory(self.cat1);
  //otherPlayer.setCollidesWith([ self.cat2 ]);
  if (playerInfo.team === 'blue') {
    otherPlayer.setTint(0x0000ff);
  } else {
    otherPlayer.setTint(0xff0000);
  }
  otherPlayer.playerId = playerInfo.playerId;
  //self.otherPlayers.add(otherPlayer);
    self.otherPlayers.push(otherPlayer);

}

function update() {
  if (this.ship) {
    if (this.cursors.left.isDown) {
      this.ship.setAngularVelocity(-0.1);
    } else if (this.cursors.right.isDown) {
      this.ship.setAngularVelocity(0.1);
    } else {
      this.ship.setAngularVelocity(0);
    }
  
    if (this.cursors.up.isDown) {
      //this.matter.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
      this.ship.thrust(0.005);
    } else {
      this.ship.thrust(0);
    }
  
    //this.matter.world.wrap(this.ship, 5);

    // emit player movement
    var x = this.ship.x;
    var y = this.ship.y;
    var r = this.ship.rotation;
    if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
      this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
    }
    // save old position data
    this.ship.oldPosition = {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.rotation
    };
  }
}