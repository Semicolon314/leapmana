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

    //Spellstats, calculated at the end of the if statement chain
    var spellDamage = 0, spellHeal = 0, spellDamageOverTime = 0;
    var spellChars = spellLength(spell);
    
    if (spell !== "NONE") {
      this.spellHistory.push({type: spell, timestamp: new Date().getTime()});
    } else if (spell === "FIREBALL") {
      spellDamage = 7;
    } else if (spell === "COUNTERSPELL") {
      this.defense = spell;
    } else if (spell === "SHIELD") {
      this.defense = spell;
    } else  if (spell === "SHIELDBREAKER") {
      if (this.opponent.defense === "SHIELD") {
        this.opponent.defense = "NONE";
      } else if (this.opponent.defense === "GREATERSHIELD") {
        this.opponent.defense = "GREATERSHIELDBROKEN";
      } else if (this.opponent.defense === "GREATERSHIELDBROKEN") this.opponent.defense = "NONE";
    } else if (spell === "GREATERSHIELD") {
      this.defense = spell;
    } else if (spell === "HEAL") {
      this.damageOverTime = 0;
      spellHeal == 3;
    } else if (spell === "MAGICMISSLE") {
      spellDamage = 2;
    } else if (spell === "DODGE") {
      this.defense = spell;
    } else if (spell === "SILENCE") {
      //Dunno if we should make him invunerable with certain defense
      this.opponent.silenced = Date().getTime();
    }else if (spell === "POISON") {
      spellDamageOverTime = 1;
    } else if (spell === "DYNAMITE") {
      spellDamage = 5;
      spellHeal = -5;
    } else if (spell === "PYROBLAST") {
      spellDamage = 10;
    } else if (spell === "VAMPIRICBLAST") {
      spellDamage = 3;
      spellHeal = 3;
    } else if (spell === "AUGMENT") {
      this.augmentSpell = true;
    } else if (spell === "MIRROR") {
      this.defense = spell;
    } else if (spell === "EXODIA") {
      this.exodiaCount ++;
      if (exodiaCount >= 5) {
        this.opponent.defense = "NONE";
        this.opponent.health = -9001;
      }
    } else console.log("Invalid spell was casted: " + spell); //For good measure and debugging

    //Actual logic starts here
    if (spellHeal > 0 || (this.defense != "SHIELD" && this.defense != "GREATERSHIELD")) this.heatlh += spellHeal;
    if (this.opponent.defense === "DODGE") {
      spellDamage = 0;
      this.opponent.defense = "NONE";
    }
    if (spellDamage > 0) {
      if (this.opponent.defense === "GREATERSHIELD") spellDamage = 0;
      if (this.opponent.defense === "SHIELD" && spellChars < 4) spellDamage = 0;
      if (this.opponent.defense === "MIRROR" && spellChars < 4) {
        this.opponent.defense = "NONE";
        this.opponent.castSpells(spell);
      }
      if (this.opponent.defense === "COUNTERSPELL") {
        spellDamage = 0;
        this.opponent.defense = "NONE";
      }
      if (this.opponent.defense = "DODGE")

      this.opponent.health -= spellDamage;
    }


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
