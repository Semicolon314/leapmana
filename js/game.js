/* Holds all game data, like player information */

var Game = (function() {
  var Game = function() {
    this.playerLeft = new Player("LEFT");
    this.playerRight = new Player("RIGHT");
    this.playerLeft.setOpponent(this.playerRight);
    this.playerRight.setOpponent(this.playerLeft);
    this.interactionBox = null;
  };

  Game.prototype.handleFrame = function(frame) {
    this.interactionBox = frame.interactionBox;

    if(frame.hands.length >= 3)
      return;

    if(frame.hands.length === 2) {
      frame.hands.sort(function(a, b) {
        return a.palmPosition[0] - b.palmPosition[0];
      });
      this.playerLeft.handFrame(frame.hands[0]);
      this.playerRight.handFrame(frame.hands[1]);
    }

    if(frame.hands.length === 1) {
      var hand = frame.hands[0];
      if(hand.palmPosition[0] < 0)
        this.playerLeft.handFrame(hand);
      else
        this.playerRight.handFrame(hand);
    }
  };

  Game.prototype.tick = function() {
    this.playerLeft.frameUpdate();
    this.playerRight.frameUpdate();
    this.playerLeft.pruneHistory();
    this.playerRight.pruneHistory();
  }

  return Game;
})();
