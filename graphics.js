(function() {
  var canvas = null;
  window.addEventListener('resize', resizeCanvas, false);

  function render() {
    // Called every frame to render graphics.
    var g = canvas.getContext('2d');
    g.rect(20, 20, 30, 30);
    g.fillStyle = "red";
    g.fill();
  }
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  function initGraphics() {
    canvas = document.getElementById('game_canvas');
    resizeCanvas();
    setInterval(render, 30);
  }
  $(document).ready(initGraphics);
})();
