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
    "THUMB": 6,
    "FIST": 6,
    "POINT": 6,
    "DOUBLE": 6,
    "FLIP": 5,
    "SPOCK": 6,
    "PRESS": 3,
    "STOP": 3
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
    this.positionHistory = [];

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
    var _this = this;

    if(hand.confidence < 0.3)
      return; // too bad

    /*this.positionHistory.push(hand.palmPosition);
    if(this.positionHistory.length > 200) {
      this.positionHistory.shift();
    }
    var averagePosition = this.positionHistory.reduce(function(a, b) {
      return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    }).map(function(a) {
      return a / _this.positionHistory.length;
    });*/
    var heightDistance = hand.middleFinger.distal.center()[1] - hand.arm.nextJoint[1];

    var fA = hand.indexFinger.extended;
    var fB = hand.middleFinger.extended;
    var fC = hand.ringFinger.extended;
    var fD = hand.ringFinger.extended;
    var thumbDist = Leap.vec3.dist(hand.thumb.distal.center(), hand.indexFinger.proximal.center());

    //$("#curGesture").html(fA + "\t" + fB + "\t" + fC + "\t" + fD + "\t" + heightDistance);

    if(!fA && !fB && !fC && !fD && thumbDist > 25) { // FIST and THUMB
      return "THUMB";
    }
    var pointPoints = 0;
    if(fA && !fC && !fD) { // POINT and DOUBLE
      if(!fB) {
        return "POINT";
      } else {
        return "DOUBLE";
      }
    }
    if(fA && fB && fC && fD) { // FLIP, PRESS, STOP, SPOCK
      var dA = Leap.vec3.dist(hand.indexFinger.distal.center(), hand.middleFinger.distal.center());
      var dB = Leap.vec3.dist(hand.middleFinger.distal.center(), hand.ringFinger.distal.center());
      var dC = Leap.vec3.dist(hand.ringFinger.medial.center(), hand.pinky.distal.center());
      if(dA < 25 && dB > 35 && dC < 25) {
        return "SPOCK";
      }
      if(hand.palmNormal[1] > 0.2) {
        return "FLIP";
      }
      if(heightDistance < -60) {
        return "PRESS";
      }
      if(heightDistance > 70) {
        return "STOP";
      }
      if(hand.palmPosition[2] < -2.0) {
        return "FIST";
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
