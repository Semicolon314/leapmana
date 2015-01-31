var Player = (function() {
  var Player = function() {
    var _this = this;

    this.defense = "NONE"; // active defense (only one at a time)
    this.gestureHistory = [];
    this.health = 20;
    this.gesture = new Gesture(function(g) {
      _this.gestureHistory.push(g);
      _this.castSpells();
    });
    this.spellHistory = [];
    // Spells are in format: {type: "FIREBALL", timestamp: epochtime_number}
  };

  Player.prototype.setOpponent = function(opponent) {
    this.opponent = opponent;
  };

  // Checks gestureHistory to see if a spell is cast
  // If it is, casts it
  Player.prototype.castSpells = function() {
    // TODO: Implement
  };

  return Player;
})();