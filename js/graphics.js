var Renderer = (function() {
  var canvas = null;
  var game = null;
  var spells = [];
  var particles = [];
  var gestureIcons;
  var dodgeIcon;
  var exodiaIcons;
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
  var COLOUR_HP_POISONED = "#073";
  var COLOUR_HP_TEXT = "#111";

  window.addEventListener('resize', resizeCanvas, false);

  function Particle (x, y, vx, vy, ax, ay, size, asize, col, life, gravity) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ax = ax;
    this.ay = ay;
    this.size = size;
    this.asize = asize;
    this.col = col;
    this.life = life;
    this.gravity = gravity;
  }

  function drawFireball(g, x, y) {
    g.beginPath();
    g.arc(x, y, 100, 0, 2*Math.PI);
    g.fillStyle = "rgba(255, 50, 0, 0.4)";
    g.fill();
    g.beginPath();
    g.arc(x, y, 70, 0, 2*Math.PI);
    g.fillStyle = "rgba(255, 150, 0, 0.8)";
    g.fill();
    g.beginPath();
    g.arc(x, y, 40, 0, 2*Math.PI);
    g.fillStyle = "rgba(255, 255, 200, 1.0)";
    g.fill();
    if (Math.random() > 0.8) {
      particles.push(new Particle(x, y, Math.random() * 60 - 30, Math.random() * 40 - 25, 0.98, 0.98, Math.random() * 20 + 20, 0.95, "#f80", 80, 0.2));
    }
    if (Math.random() > 0.9) {
      particles.push(new Particle(x, y, Math.random() * 10 - 5, Math.random() * 20 - 5, 0.98, 0.98, Math.random() * 20 + 20, 0.95, "#888", 80, 0.2));
    }
  }

  function drawPyroblast(g, x, y) {
    // Draw a huge red circle
    g.beginPath();
    g.arc(x, y, 360, 0, 2*Math.PI);
    g.fillStyle = "rgba(153, 51, 34, 0.5)";
    g.fill();
    g.beginPath();
    g.arc(x, y, 180, 0, 2*Math.PI);
    g.fillStyle = "rgba(238, 119, 68, 0.5)";
    g.fill();
    g.beginPath();
    g.arc(x, y, 60, 0, 2*Math.PI);
    g.fillStyle = "#fa3";
    g.fill();
    if (Math.random() > 0.8) {
      particles.push(new Particle(x, x + Math.random() * 360 - 18, Math.random() * 60 - 30, 0, 0.98, 0.98, Math.random() * 20 + 20, 0.95, "#f80", 80, 0));
    }
    if (Math.random() > 0.9) {
      particles.push(new Particle(x, x + Math.random() * 360 - 18, Math.random() * 4 - 2, 0, 0.98, 0.98, Math.random() * 20 + 20, 0.95, "#888", 80, 0));
    }
  }
  function drawMagicMissile(g, x, y) {
    // Draw a glowing blue circle
    var grd = g.createRadialGradient(x, y, 0, x, y, 80);
    grd.addColorStop(0, "rgba(255, 255, 255, 1)");
    grd.addColorStop(1, "rgba(0, 128, 255, 0)");
    g.beginPath();
    g.arc(x, y, 80, 0, 2*Math.PI);
    g.fillStyle = grd;
    g.fill();
    g.beginPath();
    g.arc(x, y, 20, 0, 2*Math.PI);
    g.fillStyle = "rgba(240, 250, 255, 0.9)";
    g.fill();
    //Particles
    if (Math.random() > 0.5) {
      particles.push(new Particle(x, y, Math.random() * 10 - 5, Math.random() * 6 - 2, 0.9, 0.9, Math.random() * 20, 0.95, "#68a", 80, 0.2));
    }
  }
  function drawPoison(g, x, y) {
    g.beginPath();
    g.arc(x, y, 65, 0, 2*Math.PI);
    g.fillStyle = "rgba(51, 204, 34, 0.6)";
    g.fill();
    if (Math.random() > 0.7) {
      particles.push(new Particle(x, y, Math.random() * 30 - 15, Math.random() * 8 - 2, 0.9, 0.9, Math.random() * 20 + 20, 0.99, "rgba(51, 204, 34, 0.4)", Math.random() * 40 + 15, 0.2));
    }
  }
  function drawShieldBreaker(g, x, y) {
    g.beginPath();
    g.arc(x, y, 65, 0, 2*Math.PI);
    g.fillStyle = "rgba(128, 128, 128, 1.0)";
    g.fill();
    for (var i = 0; i < 25; i++)
       particles.push(new Particle(x, y + Math.random() * 65 - 32.5, Math.random() * 30 - 15, Math.random() * 8 - 2, 0.9, 0.9, Math.random() * 5, 0.99, "rgba(128, 128, 128, 1.0)", 7 + Math.random() * 3, 0));
  }
  function drawVampiricBlast(g, x, y, completion) {
    g.beginPath();
    g.arc(x, y, 65-20*completion, 0, 2*Math.PI);
    g.fillStyle = "#a00";
    g.fill();
    if (Math.random() > 0.7) {
      particles.push(new Particle(x, y, Math.random() * 15 - 5, Math.random() * 4 - 2, 0.999, 0.999, Math.random() * 20 + 20, 0.99, "#a00", Math.random() * 20 + 15, 0.2));
    }
    if (completion > Math.pow(0.5, 2)) {
      g.beginPath();
      g.arc(canvas.width-x, y, 35+10*completion, 0, 2*Math.PI);
      g.fillStyle = "#fff";
      g.fill();
      particles.push(new Particle(canvas.width - x, y, Math.random() * 100 - 50, Math.random() * 100 - 50, 0.9, 0.9, Math.random() * 5 + 2, 0.999, "#fff", 60, 0.2));
    }
  }
  function drawHeal(g, x, y, completion) {
    g.beginPath();
    g.arc(x, y, 600*completion, 0, 2*Math.PI);
    g.fillStyle = "rgba(170, 248, 210, " + ((1-completion)) + ")";
    g.fill();
  }
  function drawDynamite(g, x, y, completion) {
    g.beginPath();
    g.arc(x, y, 600*completion, 0, 2*Math.PI);
    g.fillStyle = "rgba(190, 48, 32, " + ((1-completion)) + ")";
    g.fill();
    g.beginPath();
    g.arc(x, y, 400*Math.pow(completion, 0.7), 0, 2*Math.PI);
    g.fillStyle = "rgba(255, 157, 10, " + ((1-completion)) + ")";
    g.fill();
    g.beginPath();
    g.arc(x, y, 200*Math.pow(completion, 0.5), 0, 2*Math.PI);
    g.fillStyle = "rgba(255, 248, 210, " + ((1-completion)) + ")";
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
      var completion = timeDelta / 500;
      if (spell.type === "MAGICMISSILE") {
        drawMagicMissile(g, xstart+(xdir*Math.pow(completion, 2)), spelly);
      } else if (spell.type === "FIREBALL") {
        drawFireball(g, xstart+(xdir*Math.pow(completion, 1.5)), spelly);
      } else if (spell.type === "POISON") {
        drawPoison(g, xstart+(xdir*Math.pow(completion, 1.3)), spelly);
      } else if (spell.type === "VAMPIRICBLAST") {
        drawVampiricBlast(g, xstart+(xdir*Math.pow(completion, 0.5)), spelly, completion);
      } else if (spell.type === "DYNAMITE") {
        drawDynamite(g, canvas.width/2, spelly, completion);
      } else if (spell.type === "SHIELDBREAKER") {
        drawShieldBreaker(g, xstart+(xdir*Math.pow(completion, 2)), spelly, completion);
      } else if (spell.type === "HEAL") {
        drawHeal(g, xstart+(xdir*0.25), spelly, completion);
      }
    }
  }

  function drawGestureIcon(g, gesture, x, y, size) {
    var data = gestureIconData[gesture];
    g.drawImage(gestureIcons, data.col * 200, data.row * 200, 200, 200, x, y, size, size);
  }

  function updateParticles(g) {
    for (var i = 0; i < particles.length;) {
      //Decay life, size and opacity
      particles[i].life --;
      if (particles[i].life < 0 || particles[i].size < 1) {
        particles.splice(i, 1);
      }
      else {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].vx *= particles[i].ax;
        particles[i].vy = particles[i].vy * particles[i].ax + particles[i].gravity;
        particles[i].size *= particles[i].asize;
        // Draw the thing
        g.beginPath();
        g.arc(particles[i].x, particles[i].y, particles[i].size, 0, 2*Math.PI);
        g.fillStyle = particles[i].col;
        g.fill();
        i++;
      }
    }
  }

  function render() {
    window.requestAnimationFrame(render);

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
      g.fillText(spellList[i].niceName, canvas.width / 2 - 5 - textWidth, i * 35 + 182);
      for(var j = 0; j < spellList[i].gesture.length; j++) {
        drawGestureIcon(g, gestureLetterMap[spellList[i].gesture[j]], Math.floor(canvas.width / 2 + 5 + j * 35), i * 35 + 160, 30);
      }
    }
    g.fillStyle = "rgba(51, 51, 51, 0.4)";
    g.fillRect(0, 0, canvas.width, canvas.height);

    // Particles
    updateParticles(g);

    // Health bars
    var max_hp_bar_width = canvas.width/2-20;

    // Player 1 health
    var hp = game.playerLeft.health;
    var w = max_hp_bar_width * (hp/Player.MAX_HEALTH);
    var hp_colour = COLOUR_HP_BAR;
    if (game.playerLeft.damageOverTime > 0) {
      hp_colour = COLOUR_HP_POISONED;
    }
    g.beginPath();
    g.rect(10, 10, w, 40);
    g.fillStyle = hp_colour;
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
    hp_colour = COLOUR_HP_BAR;
    if (game.playerRight.damageOverTime > 0) {
      hp_colour = COLOUR_HP_POISONED;
    }
    g.beginPath();
    g.rect(canvas.width - 10, 10, -w, 40);
    g.fillStyle = hp_colour;
    g.fill();
    g.beginPath();
    g.rect(canvas.width / 2 + 10, 10, max_hp_bar_width - w, 40);
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
      // shields farthest point
      var cxofs = (pid * 2*canvas.width/3)+canvas.width/6
      // shield radius
      var shield_radius = canvas.height/2;
      // shield center
      var shield_center = cxofs + (pid*2-1)*shield_radius;
      // x-coord that spell effects start at
      var xstart = canvas.width/2 + canvas.width/2*1.1*(pid*2-1);
      // Total x-movement of spell effects
      var xdir = canvas.width*(-pid*2+1)*1.2;
      if (p.opponent.defense != "NONE") {
        xdir *= 0.74;
      }
      // y-coordinate of most spell effects
      var spelly = canvas.height / 2;

      // Spells
      var str = "";
      p.spellHistory.forEach (function (spell, i) {
        drawSpell(g, xstart, xdir, spelly, spell);

        //if (timeDelta < 500) {
        //  str += spell.type + " ";
        //}
      });
      g.font = "24px sans";
      g.fillStyle = "#ff0";
      g.fillText(str, 20+xofs, 150);

      // Defense
      if (p.defense === "SHIELD") {
        var grd = g.createLinearGradient(xstart, 0, cxofs, 0);
        grd.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        grd.addColorStop(1, "rgba(255, 255, 255, 1)");

        g.beginPath();
        g.arc(shield_center, spelly, shield_radius, 0, 2*Math.PI);
        g.strokeStyle = grd;
        g.lineWidth = 8;
        g.stroke();
      }
      else if (p.defense === "GREATERSHIELD") {
        var grd = g.createLinearGradient(xstart, 0, cxofs, 0);
        grd.addColorStop(0, "rgba(255, 255, 255, 0)");
        grd.addColorStop(1, "rgba(255, 255, 255, 1)");

        g.beginPath();
        g.arc(shield_center, spelly, shield_radius, 0, 2*Math.PI);
        g.strokeStyle = grd;
        g.lineWidth = 20;
        g.stroke();
      }
      else if (p.defense === "GREATERSHIELDBROKEN") {
        var grd = g.createLinearGradient(xstart, 0, cxofs, 0);
        grd.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        grd.addColorStop(1, "rgba(255, 255, 255, 1)");

        g.beginPath();
        g.arc(shield_center, spelly, shield_radius, 0, 2*Math.PI);
        g.strokeStyle = grd;
        g.lineWidth = 20;
        g.stroke();
      }
      else if (p.defense === "COUNTERSPELL") {
        var grd = g.createLinearGradient(xstart, 0, cxofs, 0);
        grd.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        grd.addColorStop(1, "rgba(255, 128, 0, 1)");

        g.beginPath();
        g.arc(shield_center, spelly, shield_radius, 0, 2*Math.PI);
        g.strokeStyle = grd;
        g.lineWidth = 8;
        g.stroke();
      }
      else if (p.defense === "MIRROR") {
        var grd = g.createLinearGradient(xstart, 0, cxofs, 0);
        grd.addColorStop(0.5, "rgba(0, 128, 255, 0)");
        grd.addColorStop(0.8, "rgba(255, 255, 255, 1)");
        grd.addColorStop(0.93, "rgba(0, 128, 255, 1)");
        grd.addColorStop(1, "rgba(255, 255, 255, 1)");

        g.beginPath();
        g.arc(shield_center, spelly, shield_radius, 0, 2*Math.PI);
        g.strokeStyle = grd;
        g.lineWidth = 8;
        g.stroke();
      }
      else if (p.defense === "DODGE") {
        g.drawImage(dodgeIcon, cxofs-40, spelly-40, 80, 80);
      }
      else if (p.defense !== "NONE") {
        g.fillText(p.defense, 20+xofs, 210);
      }

      // Augment
      if (p.augmentSpell) {
        var grd = g.createLinearGradient(xstart, 0, xstart+xdir*0.2, 0);
        grd.addColorStop(0, "rgba(255, 0, 0, 0.5)");
        grd.addColorStop(1, "rgba(128, 0, 0, 0)");
        g.beginPath();
        g.fillStyle = grd;
        g.fillRect(xstart, 0, xdir*0.2, canvas.height);
      }

      // Silence
      if (p.isSilenced()) {
        var grd = g.createLinearGradient(xstart, 0, xstart+xdir*0.2, 0);
        grd.addColorStop(0, "rgba(0, 0, 0, 0.5)");
        grd.addColorStop(1, "rgba(0, 0, 0, 0)");
        g.beginPath();
        g.fillStyle = grd;
        g.fillRect(xstart, 0, xdir*0.4, canvas.height);
      }

      // Exodia
      if (p.exodiaCount > 0) {
        g.drawImage(exodiaIcons, 0, 0, 261*p.exodiaCount, 375, xofs, 300, 50*p.exodiaCount, 70);
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

      // Positioning guides
      if(game.interactionBox !== null) {
        var ibox = game.interactionBox;
        var guideWidth = 100;
        var guideHeight = guideWidth / ibox.width * ibox.height;
        var guideScale = guideWidth / ibox.width;
        g.fillStyle = "#888";
        g.fillRect(5, canvas.height - guideHeight - 5, guideWidth / 2, guideHeight);
        g.fillRect(canvas.width - guideWidth / 2 - 5, canvas.height - guideHeight - 5, guideWidth / 2, guideHeight);
        g.fillStyle = "#f00";
        if(game.playerLeft.handPosition !== null) {
          var pos = ibox.normalizePoint(game.playerLeft.handPosition);
          g.beginPath();
          g.arc(pos[0] * guideWidth + 5, canvas.height - pos[1] * guideHeight - 5, Math.max(1, 5 - pos[2] * 2), 0, Math.PI * 2);
          g.fill();
        }
        if(game.playerRight.handPosition !== null) {
          var pos = ibox.normalizePoint(game.playerRight.handPosition);
          g.beginPath();
          g.arc(canvas.width - guideWidth + pos[0] * guideWidth - 5, canvas.height - pos[1] * guideHeight - 5, Math.max(1, 5 - pos[2] * 2), 0, Math.PI * 2);
          g.fill();
        }
      }
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
    dodgeIcon = new Image();
    dodgeIcon.src = "images/dodge.svg";
    exodiaIcons = new Image();
    exodiaIcons.src = "images/exodiaIcons.png";
  }
  function initGraphics(g) {
    // Called when the document is loaded.
    canvas = document.getElementById('game_canvas');
    game = g;
    preloadImages();
    resizeCanvas();
    render();
  }
  return initGraphics;
})();

//$(document).ready(function() {Renderer({})});
