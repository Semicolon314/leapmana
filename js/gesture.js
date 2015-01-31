/* Exposes the gesture recognition system
 * Usage:
 * - create the Gesture object
 *   - give it a callback, which receives a single parameter: gesture
 * - pass it instances of Leap Motion hands
 * - when it detects a gesture, it will call the callback
 */

var Gesture = (function() {
  var THRESHOLD = 10; // required consecutive frames for a gesture to be valid
  var THRESH = {
    "THUMB": 15,
    "FIST": 15,
    "POINT": 10,
    "DOUBLE": 10,
    "FLIP": 5,
    "SPOCK": 15,
    "PRESS": 10,
    "STOP": 10
  };

  var Gesture = function(callback) {
    this.callback = callback;
    this.lastGesture = "NONE"; // last callback gesture
    this.currentGesture = "NONE";
    this.currentFrames = 0;
  };

  // Detects a gesture at an instantaneous moment in time
  function instantGesture(hand) {
    if(hand.confidence < 0.5)
      return; // too bad

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
      if(hand.palmNormal[2] > 0.4) {
        return "PRESS";
      }
      if(hand.palmNormal[2] < -0.4) {
        return "STOP";
      }
      var dA = Leap.vec3.dist(hand.indexFinger.distal.center(), hand.middleFinger.distal.center());
      var dB = Leap.vec3.dist(hand.middleFinger.distal.center(), hand.ringFinger.distal.center());
      var dC = Leap.vec3.dist(hand.ringFinger.medial.center(), hand.pinky.distal.center());
      if(dA < 25 && dB > 25 && dC < 25) {
        return "SPOCK";
      }
    }
    return "NONE";
  }

  Gesture.prototype.handFrame = function(hand) {
    var g = instantGesture(hand);
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