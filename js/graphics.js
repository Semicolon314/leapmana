var Renderer = (function() {
  var canvas = null;
  var game = null;
  var spells = [];
  var gestureIcons;
  var gestureIconData = {
    "SPOCK": {row: 0, col: 0},
    "FLIP": {row: 0, col: 1},
    "POINT": {row: 0, col: 2},
    "DOUBLE": {row: 0, col: 3},
    "STOP": {row: 1, col: 0},
    "PRESS": {row: 1, col: 1},
    "THUMB": {row: 1, col: 2},
    "FIST": {row: 1, col: 3},
  };

  // colours
  var COLOUR_BG = "#333";
  var COLOUR_HP_BAR = "#a00";
  var COLOUR_HP_GONE = "#bbb";
  var COLOUR_HP_TEXT = "#111";

  window.addEventListener('resize', resizeCanvas, false);

  function drawFireball(g, x, y) {
    // Draw a red circle
    g.beginPath();
    g.arc(x, y, 80, 0, 2*Math.PI);
    g.fillStyle = "#f51";
    g.fill();
  }
  function drawPyroblast(g, x, y) {
    // Draw a huge red circle
    g.beginPath();
    g.arc(x, y, 360, 0, 2*Math.PI);
    g.fillStyle = "#932";
    g.fill();
    g.beginPath();
    g.arc(x, y, 180, 0, 2*Math.PI);
    g.fillStyle = "#e74";
    g.fill();
    g.beginPath();
    g.arc(x, y, 60, 0, 2*Math.PI);
    g.fillStyle = "#fa3";
    g.fill();
  }
  function drawMagicMissile(g, x, y) {
    // Draw a blue circle
    g.beginPath();
    g.arc(x, y, 30, 0, 2*Math.PI);
    g.fillStyle = "#68a";
    g.fill();
  }
  function drawPoison(g, x, y) {
    g.beginPath();
    g.arc(x, y, 65, 0, 2*Math.PI);
    g.fillStyle = "#3c2";
    g.fill();
  }
  function drawHeal(g, x, y, completion) {
    g.beginPath();
    g.arc(x, y, 600*completion, 0, 2*Math.PI);
    g.fillStyle = "rgba(170, 248, 210, " + ((1-completion)) + ")";
    g.fill();
  }

  function drawSpell (g, xstart, xdir, spelly, spell) {
    timeDelta = new Date().getTime() - spell.timestamp;
    if (timeDelta < 1000) {
      if (spell.type === "PYROBLAST") {
        drawPyroblast(g, xstart+(xdir*Math.pow(timeDelta / 1000, 2.5)), spelly);
      }
    }
    if (timeDelta < 500) {
      if (spell.type === "MAGICMISSILE") {
        drawMagicMissile(g, xstart+(xdir*Math.pow(timeDelta / 500, 2)), spelly);
      } else if (spell.type === "FIREBALL") {
        drawFireball(g, xstart+(xdir*Math.pow(timeDelta / 500, 1.5)), spelly);
      } else if (spell.type === "POISON") {
        drawPoison(g, xstart+(xdir*Math.pow(timeDelta / 500, 1.3)), spelly);
      } else if (spell.type == "HEAL") {
        drawHeal(g, xstart+(xdir*0.25), spelly, timeDelta / 500);
      }
    }
  }

  function drawGestureIcon(g, gesture, x, y, size) {
    var data = gestureIconData[gesture];
    g.drawImage(gestureIcons, data.col * 200, data.row * 200, 200, 200, x, y, size, size);
  }

  function render() {
    // Called every frame to render graphics.
    var g = canvas.getContext('2d');

    // Fill entire frame with bg colour
    g.beginPath();
    g.rect(0, 0, canvas.width, canvas.height);
    g.fillStyle = COLOUR_BG;
    g.fill();

    // Draw the spell legend
    g.fillStyle = "#fff";
    g.font = "24px sans";
    for(var i = 0; i < spellList.length; i++) {
      var textWidth = g.measureText(spellList[i].niceName).width;
      g.fillText(spellList[i].niceName, canvas.width / 2 - 5 - textWidth, i * 35 + 132);
      for(var j = 0; j < spellList[i].gesture.length; j++) {
        drawGestureIcon(g, gestureLetterMap[spellList[i].gesture[j]], Math.floor(canvas.width / 2 + 5 + j * 35), i * 35 + 110, 30);
      }
    }
    g.fillStyle = "rgba(51, 51, 51, 0.4)";
    g.fillRect(0, 0, canvas.width, canvas.height);

    // Health bars
    var max_hp_bar_width = canvas.width/2-20;

    // Player 1 health
    var hp = game.playerLeft.health;
    var w = max_hp_bar_width * (hp/Player.MAX_HEALTH);
    g.beginPath();
    g.rect(10, 10, w, 40);
    g.fillStyle = COLOUR_HP_BAR;
    g.fill();
    g.beginPath();
    g.rect(w + 10, 10, max_hp_bar_width - w, 40);
    g.fillStyle = COLOUR_HP_GONE;
    g.fill();
    g.fillStyle = COLOUR_HP_TEXT;
    g.font = "30px Arial";
    g.fillText(hp, canvas.width / 4, 40);

    // Player 2 health
    hp = game.playerRight.health;
    w = max_hp_bar_width * (hp/Player.MAX_HEALTH);
    g.beginPath();
    g.rect(canvas.width - w, 10, w - 10, 40);
    g.fillStyle = COLOUR_HP_BAR;
    g.fill();
    g.beginPath();
    g.rect(canvas.width - max_hp_bar_width, 10, max_hp_bar_width - w, 40);
    g.fillStyle = COLOUR_HP_GONE;
    g.fill();
    g.fillStyle = COLOUR_HP_TEXT;
    g.font = "30px Arial";
    g.fillText(hp, canvas.width / 4 * 3, 40);


    var players = [game.playerLeft, game.playerRight];
    for (var pid=0; pid<=1; pid++) {
      var p = players[pid];

      // If player 2, offset by half the canvas width.
      var xofs = (pid * canvas.width / 2 + 30);
      // x-coord that spell effects start at
      var xstart = canvas.width/2 + canvas.width/2*1.1*(pid*2-1);
      // Total x-movement of spell effects
      var xdir = canvas.width*(-pid*2+1)*1.2;
      // y-coordinate of most spell effects
      var spelly = 300;

      // Log of recent gestures
      var drawPos = 20 + xofs;
      p.gestureHistory.forEach (function (gesture, i) {
        if (i+7 >= p.gestureHistory.length) {
          drawGestureIcon(g, gesture.type, drawPos, 60, 50);
          drawPos += 60;
        }
      });
      g.font = "24px sans";
      g.fillStyle = "#ff0";
      //g.fillText(str, 20+xofs, 60);

      // Spells
      var str = "";
      p.spellHistory.forEach (function (spell, i) {
        drawSpell(g, xstart, xdir, spelly, spell);

        if (timeDelta < 500) {
          str += spell.type + " ";
        }
      });
      g.font = "24px sans";
      g.fillStyle = "#ff0";
      g.fillText(str, 20+xofs, 150);

      // Defense
      if (p.defense === "SHIELD") {
        g.fillText("Shield!", 20+xofs, 210);
      }
      else if (p.defense === "GREATERSHIELD") {
        g.fillText("Greater shield!", 20+xofs, 210);
      }
      else if (p.defense !== "NONE") {
        g.fillText(p.defense, 20+xofs, 210);
      }

      // Augment
      if (p.augmentSpell) {
        g.fillText("Augment!", 20+xofs, 500);
      }

      // Log of recent gestures
      var drawPos = 20 + xofs;
      p.gestureHistory.forEach (function (gesture, i) {
        if (i+7 >= p.gestureHistory.length) {
          var data = gestureIconData[gesture.type];
          //console.log(gesture + ": " + JSON.stringify(data));
          g.drawImage(gestureIcons, data.col * 200, data.row * 200, 200, 200, drawPos, 60, 50, 50);
          drawPos += 60;
        }
      });
      g.font = "24px sans";
      g.fillStyle = "#ff0";
      //g.fillText(str, 20+xofs, 60);
    }
  }
  function resizeCanvas() {
    // Called whenever the window is resized.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  function preloadImages() {
    gestureIcons = new Image();
    gestureIcons.src = "images/gestureIcons.svg";
  }
  function initGraphics(g) {
    // Called when the document is loaded.
    canvas = document.getElementById('game_canvas');
    game = g;
    preloadImages();
    resizeCanvas();
    setInterval(render, 17);
  }
  return initGraphics;
})();

//$(document).ready(function() {Renderer({})});
