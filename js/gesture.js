/* Exposes the gesture recognition system
 * Usage:
 * - create the Gesture object
 *   - give it a callback, which receives a single parameter: gesture
 * - pass it instances of Leap Motion hands
 * - when it detects a gesture, it will call the callback
 */

var USE_KEYS = true;

var Gesture = (function() {
  var THRESHOLD = 10; // required consecutive frames for a gesture to be valid
  var THRESH = {
    "THUMB": 10,
    "FIST": 10,
    "POINT": 10,
    "DOUBLE": 10,
    "FLIP": 5,
    "SPOCK": 15,
    "PRESS": 5,
    "STOP": 5
  };

  var KEYS = {
    "LEFT": {
      "Q": "THUMB",
      "W": "FLIP",
      "E": "PRESS",
      "R": "STOP",
      "A": "SPOCK",
      "S": "FIST",
      "D": "POINT",
      "F": "DOUBLE"
    },
    "RIGHT": {
      "U": "THUMB",
      "I": "FLIP",
      "O": "PRESS",
      "P": "STOP",
      "J": "SPOCK",
      "K": "FIST",
      "L": "POINT",
      186: "DOUBLE" // ;
    }
  }

  var Gesture = function(callback, player) {
    var _this = this;

    this.callback = callback;
    this.lastGesture = "NONE"; // last callback gesture
    this.currentGesture = "NONE";
    this.currentFrames = 0;
    this.player = player; // "LEFT" or "RIGHT"
    this.heightHistory = [];

    if(USE_KEYS) {
      $(window).keydown(function(event) {
        var p = KEYS[_this.player];
        if(event.which in p) {
          _this.callback(KEYS[_this.player][event.which]);
        } else if(String.fromCharCode(event.which) in p) {
          _this.callback(KEYS[_this.player][String.fromCharCode(event.which)]);
        }
      });
    }
  };

  // Detects a gesture at an instantaneous moment in time
  Gesture.prototype.instantGesture = function(hand) {
    if(hand.confidence < 0.3)
      return; // too bad

    this.heightHistory.push(hand.middleFinger.distal.center()[1]);
    if(this.heightHistory.length > 200) {
      this.heightHistory.shift();
    }
    var averageHeight = this.heightHistory.reduce(function(a, b) { return a + b }) / this.heightHistory.length;
    var heightDistance = hand.middleFinger.distal.center()[1] - hand.arm.nextJoint[1];
    var heightDistance2 = hand.palmPosition[1] - hand.arm.nextJoint[1];

    var fA = hand.indexFinger.extended;
    var fB = hand.middleFinger.extended;
    var fC = hand.ringFinger.extended;
    var fD = hand.ringFinger.extended;
    if(!fA && !fB && !fC && !fD) { // FIST and THUMB
      if(hand.thumb.extended) {
        return "THUMB";
      } else {
        return "FIST";
      }
    }
    if(fA && !fB && !fC && !fD) { // POINT
      return "POINT";
    }
    if(fA && fB && !fC && !fD) { // DOUBLE
      return "DOUBLE";
    // Detect FLIP, PRESS, STOP, SPOCK, and NONE
    }
    if(hand.indexFinger.extended && hand.middleFinger.extended && hand.ringFinger.extended && hand.pinky.extended) {
      if(hand.palmNormal[1] > 0.2) {
        return "FLIP";
      }
      if(/*hand.palmNormal[2] > 0.2 && */heightDistance < -35) {
        return "PRESS";
      }
      if(/*hand.palmNormal[2] < -0.2 && */heightDistance > 25) {
        return "STOP";
      }
      var dA = Leap.vec3.dist(hand.indexFinger.distal.center(), hand.middleFinger.distal.center());
      var dB = Leap.vec3.dist(hand.middleFinger.distal.center(), hand.ringFinger.distal.center());
      var dC = Leap.vec3.dist(hand.ringFinger.medial.center(), hand.pinky.distal.center());
      if(dA < 25 && dB > 35 && dC < 25) {
        return "SPOCK";
      }
    }
    return "NONE";
  }

  Gesture.prototype.handFrame = function(hand) {
    var g = this.instantGesture(hand);
    if(g === "NONE") {
      return; // Don't do anything, don't reset current gesture
    }
    if(g === this.currentGesture) {
      this.currentFrames++;
      if(this.currentFrames === THRESH[g]) {
        this.callback(g);
        this.lastGesture = g;
      }
    } else {
      this.currentFrames = g === this.lastGesture ? 50 : 0;
      this.currentGesture = g;
    }
  };

  return Gesture;
})();
