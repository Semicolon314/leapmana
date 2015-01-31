/* Holds all game data, like player information */

var Game = (function() {
  var Game = function() {
    this.playerLeft = new Player();
    this.playerRight = new Player();
    this.playerLeft.setOpponent(this.playerRight);
    this.playerRight.setOpponent(this.playerLeft);
  };

  Game.prototype.handleFrame = function(frame) {
    if(frame.hands.length >= 3)
      return;

    if(frame.hands.length === 2) {
      frame.hands.sort(function(a, b) {
        return a.position[0] - b.position[0];
      });
      this.playerLeft.gesture.handFrame(frame.hands[0]);
      this.playerRight.gesture.handFrame(frame.hands[1]);
    }

    if(frame.hands.length === 1) {
      var hand = frame.hands[0];
      if(hand.palmPosition[0] < 0)
        this.playerLeft.gesture.handFrame(hand);
      else
        this.playerRight.gesture.handFrame(hand);
    }

    this.playerLeft.pruneHistory();
    this.playerRight.pruneHistory();
  };

  return Game;
})();