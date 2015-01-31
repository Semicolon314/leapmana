/* This creates instances of everything, runs the Leap loop, and puts everything together */

var game = new Game();

$(document).ready(function() {
  Renderer(game);
});

Leap.loop(game.handleFrame);