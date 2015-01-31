(function() {
  var canvas = null;
  window.addEventListener('resize', resizeCanvas, false);

  function render() {
    // Called every frame to render graphics.
    var g = canvas.getContext('2d');
    g.rect(0, 0, canvas.width, canvas.height);
    g.fillStyle = "#333";
    g.fill();
  }
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight-50;
  }
  function initGraphics() {
    canvas = document.getElementById('game_canvas');
    resizeCanvas();
    setInterval(render, 30);
  }
  $(document).ready(initGraphics);
})();
