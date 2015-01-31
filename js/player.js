var MAX_HEALTH = 20;
var DOT_FRAMES = 50; // how many frames between DoT ticks

var Player = (function() {
  var Player = function(position) {
    var _this = this;

    this.position = position;
    this.defense = "NONE"; // active defense (only one at a time)
    this.gestureHistory = [];
    this.gestureHistoryClearTimeout = null;
    this.health = MAX_HEALTH;
    this.gesture = new Gesture(function(g) {
      console.log(g);
      if(new Date().getTime() - _this.silenced > 2000) {
        if (_this.gestureHistory.length > 0) {
          clearTimeout(_this.gestureHistoryClearTimeout);
          // Clear the history if the user gestures *after*
          // finishing a spell.
          var last_g = _this.gestureHistory[_this.gestureHistory.length-1].type;
          if (last_g === "FIST" || last_g === "POINT" || last_g === "DOUBLE") {
            _this.gestureHistory = [];
          }
        }
        // Clear the history if the user finishes casting a spell, then
        // waits.
        if (g === "FIST" || g === "POINT" || g === "DOUBLE") {
          _this.gestureHistoryClearTimeout = setTimeout(function() {
            _this.gestureHistory = [];
          }, 500);
        }
        _this.gestureHistory.push({type: g, timestamp: new Date().getTime()});
        _this.castSpells(_this.getHistory());
      }
    }, position);
    this.spellHistory = [];
    this.damageOverTime = 0; // current damage remaining to be dealt over time
    this.damageOverTimeFrame = 0; // frames left until next DoT
    this.augmentSpell = false; // augment next spell?
    this.silenced = 0; //Player's silenced amount, in time
    this.exodiaCount = 0; //Number of times player has casted
    // Spells are in format: {type: "FIREBALL", timestamp: epochtime_number}
  };

  Player.prototype.setOpponent = function(opponent) {
    this.opponent = opponent;
  };

  // Gets user's gesture history and attempts to transform it into a spell
  Player.prototype.getHistory = function() {
    return spellCheck(this.gestureHistory.map(function(gestureObj) { return gestureObj.type }));
  }

  // Passed a spell in its caps name, then casts a spell
  Player.prototype.castSpells = function(spell) {
    var _this = this;

    if(spell === "NONE")
      return;

    //Spellstats, calculated at the end of the if statement chain
    var spellDamage = 0, spellHeal = 0, spellDamageOverTime = 0, spellDelay = 0;
    var spellChars = spellLength(spell);
    var spellOffensive = false;
    var effect = null;

    this.spellHistory.push({type: spell, timestamp: new Date().getTime()});

    if (spell === "FIREBALL") {
      spellDamage = 7;
      spellOffensive = true; // can be blocked by shields
      spellDelay = 500;
    } else if (spell === "COUNTERSPELL") {
      effect = function() {
        _this.defense = spell;
      };
    } else if (spell === "SHIELD") {
      effect = function() {
        _this.defense = spell;
      };
    } else if (spell === "SHIELDBREAKER") {
      effect = function() {
        if (_this.opponent.defense === "SHIELD" || _this.opponent.defense === "GREATERSHIELDBROKEN") {
          _this.opponent.defense = "NONE";
        } else if (_this.opponent.defense === "GREATERSHIELD") {
          _this.opponent.defense = "GREATERSHIELDBROKEN";
        }
      };
    } else if (spell === "GREATERSHIELD") {
      effect = function() {
        _this.defense = spell;
      };
    } else if (spell === "HEAL") {
      this.damageOverTime = 0;
      spellHeal = 4;
    } else if (spell === "MAGICMISSILE") {
      spellDamage = 1;
      spellOffensive = true;
      spellDelay = 500;
    } else if (spell === "DODGE") {
      this.defense = spell;
    } else if (spell === "SILENCE") {
      //Dunno if we should make him invunerable with certain defense
      effect = function() {
        _this.opponent.silenced = new Date().getTime();
      };
      spellOffensive = true;
    } else if (spell === "POISON") {
      spellDamageOverTime = 4;
      spellOffensive = true;
      spellDelay = 500;
    } else if (spell === "DYNAMITE") {
      spellDamage = 4;
      spellHeal = -4;
      spellOffensive = true;
    } else if (spell === "PYROBLAST") {
      spellDamage = 10;
      spellOffensive = true;
      spellDelay = 1000;
    } else if (spell === "VAMPIRICBLAST") {
      spellDamage = 3;
      spellHeal = 2;
      spellOffensive = true;
    } else if (spell === "AUGMENT") {
      effect = function() {
        _this.augmentSpell = true;
      };
    } else if (spell === "MIRROR") {
      effect = function() {
        _this.defense = spell;
      };
    } else if (spell === "EXODIA") {
      effect = function() {
        _this.exodiaCount ++;
        if (_this.exodiaCount >= 5) {
          _this.opponent.defense = "NONE";
          _this.opponent.health = -9001;
        }
      }
    } else {
      console.log("Invalid spell was casted: " + spell); //For good measure and debugging
    }

    if(this.augmentSpell && (spellDamage !== 0 || spellDamageOverTime !== 0 || spellHeal !== 0)) {
      spellDamage = Math.floor(spellDamage * 1.5);
      spellDamageOverTime = Math.floor(spellDamageOverTime * 1.5);
      spellHeal = Math.floor(spellHeal * 1.5);
      this.augmentSpell = false;
    }

    //Actual logic starts here

    setTimeout(function () {
      var blocked = false;
      if (_this.opponent.defense === "COUNTERSPELL" && spell !== "PYROBLAST") {
        blocked = true;
        _this.opponent.defense = "NONE";
      }
      if (spellOffensive) {
        if (_this.opponent.defense === "GREATERSHIELD" || _this.opponent.defense === "GREATERSHIELDBROKEN"){
          if (spell !== "SHIELDBREAKER") {
            blocked = true;
          }
        }
        if (_this.opponent.defense === "SHIELD" && spell !== "SHIELDBREAKER") {
          if(spellChars < 4) {
            blocked = true;
          } else {
            _this.opponent.defense = "NONE";
          }
        }
        if (_this.opponent.defense === "MIRROR") {
          if(spellChars < 4) {
            blocked = true;
            _this.opponent.castSpells(spell);
          }
          _this.opponent.defense = "NONE";
        }
        if (_this.opponent.defense === "DODGE" && spell !== "PYROBLAST") {
          blocked = true;
          _this.opponent.defense = "NONE";
        }
      }
      if (spellHeal > 0 || (_this.defense !== "SHIELD" && _this.defense !== "GREATERSHIELD" && _this.defense !== "GREATERSHIELDBROKEN")) {
        _this.health += spellHeal;
        if(_this.health > MAX_HEALTH) {
          _this.health = MAX_HEALTH;
        }
      }
      if (!blocked) {
        _this.opponent.health -= spellDamage;
        _this.opponent.damageOverTime += spellDamageOverTime;
        if(effect !== null) {
          effect();
        }
      }
    }, spellDelay);
    this.frameUpdate();
    this.opponent.frameUpdate();
  };

  Player.prototype.frameUpdate = function() {
    if(this.damageOverTime > 0) {
      this.damageOverTimeFrame --;
      if(this.damageOverTimeFrame <= 0) {
        this.health --;
        this.damageOverTime --;
        this.damageOverTimeFrame = DOT_FRAMES;
      }
    }
    if (this.health < 0 && this.health > -1000) {
      this.health = 0;
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
