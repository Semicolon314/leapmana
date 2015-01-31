var MAX_HEALTH = 20;

var Player = (function() {
  var Player = function() {
    var _this = this;

    this.defense = "NONE"; // active defense (only one at a time)
    this.gestureHistory = [];
    this.health = MAX_HEALTH;
    this.gesture = new Gesture(function(g) {
      console.log(_this);
      _this.gestureHistory.push({type: g, timestamp: new Date().getTime()});
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
    var rawList = this.gestureHistory.map(function(gestureObj) { return gestureObj.type });
    // TODO: Implement
  };

  // Gets rid of spells and gestures older than 20 seconds
  Player.prototype.pruneHistory = function() {
    var curTime = new Date().getTime();
    this.gestureHistory = this.gestureHistory.filter(function(gestureObj) { 
      return curTime - gestureObj.timestamp < 20 * 1000;
    });
    this.spellHistory = this.spellHistory.filter(function(spellObj) {
      return curTime - spellObj.timestamp < 20 * 1000;
    });
  }

  Player.MAX_HEALTH = MAX_HEALTH;

  return Player;
})();