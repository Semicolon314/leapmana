(function() {
  var canvas = null;
  window.addEventListener('resize', resizeCanvas, false);

  function render() {
    // Called every frame to render graphics.
    var g = canvas.getContext('2d');

    // Fill entire frame with bg color
    g.rect(0, 0, canvas.width, canvas.height);
    g.fillStyle = "#333";
    g.fill();

    // Draw a blue circle in the center
    g.beginPath();
    g.arc(canvas.width/2, canvas.height/2, 20, 0, 2*Math.PI);
    g.fillStyle = "#89f";
    g.fill();
  }
  function resizeCanvas() {
    // Called whenever the window is resized.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight-50;
  }
  function initGraphics() {
    // Called when the document is loaded.
    canvas = document.getElementById('game_canvas');
    resizeCanvas();
    setInterval(render, 30);
  }
  $(document).ready(initGraphics);
})();
