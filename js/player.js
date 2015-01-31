var MAX_HEALTH = 20;
var DOT_FRAMES = 50; // how many frames between DoT ticks

var Player = (function() {
  var Player = function(position) {
    var _this = this;

    this.position = position;
    this.defense = "NONE"; // active defense (only one at a time)
    this.gestureHistory = [];
    this.health = MAX_HEALTH;
    this.gesture = new Gesture(function(g) {
      console.log(g);
      _this.gestureHistory.push({type: g, timestamp: new Date().getTime()});
      _this.castSpells();
    }, position);
    this.spellHistory = [];
    this.damageOverTime = 0; // current damage remaining to be dealt over time
    this.damageOverTimeFrame = 0; // frames left until next DoT
    this.augmentSpell = false; // augment next spell?
    // Spells are in format: {type: "FIREBALL", timestamp: epochtime_number}
  };

  Player.prototype.setOpponent = function(opponent) {
    this.opponent = opponent;
  };

  // Checks gestureHistory to see if a spell is cast
  // If it is, casts it
  Player.prototype.castSpells = function() {
    var rawList = this.gestureHistory.map(function(gestureObj) { return gestureObj.type });
    
    var spell = spellcheck(rawList);
    if(spell !== "NONE") {
      this.spellHistory.push({type: spell, timestamp: new Date().getTime()});
    }
  };

  Player.prototype.frameUpdate = function() {
    if(this.damageOverTime > 0) {
      this.damageOverTimeFrame--;
      if(this.damageOverTimeFrame <= 0) {
        this.health--;
        this.damageOverTime--;
        this.damageOverTimeFrame = DOT_FRAMES;
      }
    }
  }

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
