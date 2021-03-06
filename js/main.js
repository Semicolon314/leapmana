/* This creates instances of everything, runs the Leap loop, and puts everything together */

var game = new Game();

$(document).ready(function() {
  Renderer(game);
  setInterval(function() {
    game.tick();
  }, 17);
});

Leap.loop(function(frame) {
  game.handleFrame(frame);
});
