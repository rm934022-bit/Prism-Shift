// The Color - Minimalist Geometric Art & Camera Renderer
class ColorRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.camera = { x: 0, y: 0 };
    this.particles = [];
    this.timeSlowFilter = 0;
  }

  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.width = w;
    this.height = h;
  }

  // Camera lerp towards player
  updateCamera(targetX, targetY, dt) {
    const desiredX = targetX - this.width / 2;
    const desiredY = targetY - this.height / 2;
    this.camera.x += (desiredX - this.camera.x) * Math.min(1, 8 * dt);
    this.camera.y += (desiredY - this.camera.y) * Math.min(1, 8 * dt);

    // Clamp camera within level bounds
    this.camera.x = Math.max(-100, Math.min(1400 - this.width, this.camera.x));
    this.camera.y = Math.max(-100, Math.min(900 - this.height, this.camera.y));
  }

  // Particle Emitters
  addJumpDust(x, y, color) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + 14,
        vx: (Math.random() - 0.5) * 80,
        vy: -20 - Math.random() * 30,
        size: 3 + Math.random() * 3,
        color: COLOR_HEX[color] || '#fff',
        alpha: 0.8,
        life: 0.35
      });
    }
  }

  addColorBurst(x, y, color) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: COLOR_HEX[color] || '#fff',
        alpha: 1,
        life: 0.45 + Math.random() * 0.3
      });
    }
  }

  addDeathBurst(x, y, color) {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 240;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 5,
        color: Math.random() > 0.3 ? COLOR_HEX[color] : '#fff',
        alpha: 1,
        life: 0.6 + Math.random() * 0.4
      });
    }
  }

  update(dt, isSlowMo) {
    this.timeSlowFilter += ((isSlowMo ? 1 : 0) - this.timeSlowFilter) * 10 * dt;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / 0.5);
    }
  }

  render(player, level, isSlowMo, wheelAngle, opponents = [], dt = 0.016) {
    this.update(dt, isSlowMo);
    this.updateCamera(player.x, player.y, dt);

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    // Camera Transform
    ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    // 1. Subtle Background Grid
    this.drawBackground(ctx);

    // 2. Moving Platform Guide Rails
    this.drawPlatformRails(ctx, level.platforms);

    // 3. Platforms (Solid matching vs Ghost non-matching)
    this.drawPlatforms(ctx, level.platforms, player.color);

    // 4. Hazards (Spikes & Beams)
    this.drawHazards(ctx, level.hazards, player.color);

    // 5. Bounce Pads
    this.drawBouncePads(ctx, level.bouncePads);

    // 6. Prism Gateway (Level Goal)
    this.drawPortal(ctx, level.portal);

    // 7. Multiplayer Opponents (Ghosts)
    opponents.forEach(opp => {
      this.drawOpponent(ctx, opp);
    });

    // 8. Player Character
    if (!player.isDead) {
      this.drawPlayer(ctx, player);
    }

    // 9. Particle Bursts
    this.drawParticles(ctx);

    ctx.restore();

    // 10. Slow-Motion Vignette & Radial Color Wheel
    if (this.timeSlowFilter > 0.01) {
      this.drawSlowMoOverlay(ctx, isSlowMo, wheelAngle, player);
    }
  }

  drawBackground(ctx) {
    // Elegant deep slate matte background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(this.camera.x - 200, this.camera.y - 200, this.width + 400, this.height + 400);

    // Minimalist architectural dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const spacing = 48;
    const startX = Math.floor((this.camera.x - 100) / spacing) * spacing;
    const endX = this.camera.x + this.width + 100;
    const startY = Math.floor((this.camera.y - 100) / spacing) * spacing;
    const endY = this.camera.y + this.height + 100;

    for (let x = startX; x <= endX; x += spacing) {
      for (let y = startY; y <= endY; y += spacing) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  drawPlatformRails(ctx, platforms = []) {
    platforms.forEach(plat => {
      if (plat.move) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        const startX = plat.x - (plat.move.dx || 0);
        const endX = plat.x + (plat.move.dx || 0);
        const startY = plat.y - (plat.move.dy || 0);
        const endY = plat.y + (plat.move.dy || 0);
        ctx.moveTo(startX + plat.w / 2, startY + plat.h / 2);
        ctx.lineTo(endX + plat.w / 2, endY + plat.h / 2);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  drawPlatforms(ctx, platforms = [], playerColor) {
    platforms.forEach(plat => {
      const col = plat.curColor || plat.color;
      const isSolid = (col === 'white' || col === playerColor);
      const px = plat.curX !== undefined ? plat.curX : plat.x;
      const py = plat.curY !== undefined ? plat.curY : plat.y;
      const hex = COLOR_HEX[col] || '#fff';

      ctx.save();
      if (isSolid) {
        // --- MATCHING SOLID PLATFORM ---
        ctx.fillStyle = hex;
        ctx.shadowColor = hex;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(px, py, plat.w, plat.h, 6);
        ctx.fill();

        // Top crisp highlight line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 0;
        ctx.fillRect(px + 4, py + 2, plat.w - 8, 3);

        // Color carpet animated chevron pattern
        if (plat.isCarpet) {
          const shift = (Date.now() * 0.05) % 20;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 2;
          for (let cx = px + shift; cx < px + plat.w - 10; cx += 24) {
            ctx.beginPath();
            ctx.moveTo(cx, py + 5);
            ctx.lineTo(cx + 6, py + plat.h / 2);
            ctx.lineTo(cx, py + plat.h - 5);
            ctx.stroke();
          }
        }
      } else {
        // --- NON-MATCHING GHOST PLATFORM (PLAYER PASSES THROUGH) ---
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = hex;
        ctx.beginPath();
        ctx.roundRect(px, py, plat.w, plat.h, 6);
        ctx.fill();

        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = hex;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(px, py, plat.w, plat.h);
      }
      ctx.restore();
    });
  }

  drawHazards(ctx, hazards = [], playerColor) {
    hazards.forEach(haz => {
      const isSafe = (haz.color === playerColor);
      const hex = haz.color === 'all' ? '#ff0033' : (COLOR_HEX[haz.color] || '#ff0033');

      ctx.save();
      ctx.fillStyle = hex;
      ctx.globalAlpha = isSafe ? 0.3 : 1.0;
      if (!isSafe) {
        ctx.shadowColor = hex;
        ctx.shadowBlur = 10;
      }

      // Draw danger spikes
      const spikeW = 16;
      const count = Math.floor(haz.w / spikeW);
      for (let i = 0; i < count; i++) {
        const sx = haz.x + i * spikeW;
        ctx.beginPath();
        ctx.moveTo(sx, haz.y + haz.h);
        ctx.lineTo(sx + spikeW / 2, haz.y);
        ctx.lineTo(sx + spikeW, haz.y + haz.h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });
  }

  drawBouncePads(ctx, pads = []) {
    pads.forEach(pad => {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#00F59B';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(pad.x, pad.y, pad.w, pad.h, 4);
      ctx.fill();

      // Upward arrows
      ctx.strokeStyle = '#0b0f19';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pad.x + pad.w / 2 - 6, pad.y + pad.h - 4);
      ctx.lineTo(pad.x + pad.w / 2, pad.y + 4);
      ctx.lineTo(pad.x + pad.w / 2 + 6, pad.y + pad.h - 4);
      ctx.stroke();
      ctx.restore();
    });
  }

  drawPortal(ctx, portal) {
    const time = Date.now() * 0.003;
    ctx.save();
    ctx.translate(portal.x, portal.y);

    // 4 Concentric diamond rings of Red, Blue, Yellow, Green
    const rings = ['red', 'blue', 'yellow', 'green'];
    rings.forEach((col, idx) => {
      ctx.save();
      ctx.rotate(time * (idx % 2 === 0 ? 1 : -1) * (1 + idx * 0.2));
      ctx.strokeStyle = COLOR_HEX[col];
      ctx.shadowColor = COLOR_HEX[col];
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.5;

      const size = 18 + idx * 8;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });

    // Glowing White Core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawPlayer(ctx, player) {
    const hex = COLOR_HEX[player.color] || '#FF2A6D';

    // 1. Ghost Trails
    player.trail.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.alpha * 0.4;
      ctx.fillStyle = COLOR_HEX[t.color] || hex;
      ctx.beginPath();
      ctx.roundRect(t.x - player.width / 2, t.y - player.height / 2, player.width, player.height, 6);
      ctx.fill();
      ctx.restore();
    });

    // 2. Main Player Body (Juicy squash & stretch)
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(player.scaleX * player.facing, player.scaleY);

    // Glowing aura
    ctx.fillStyle = hex;
    ctx.shadowColor = hex;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(-player.width / 2, -player.height / 2, player.width, player.height, 7);
    ctx.fill();

    // Inner bright center core
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.roundRect(-player.width / 2 + 4, -player.height / 2 + 4, player.width - 8, player.height - 8, 4);
    ctx.fill();

    // Expressive eye looking forward
    ctx.fillStyle = '#0b0f19';
    ctx.beginPath();
    ctx.arc(4, -3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawOpponent(ctx, opp) {
    const hex = COLOR_HEX[opp.color] || '#ffffff';
    ctx.save();
    ctx.translate(opp.x, opp.y);
    ctx.globalAlpha = 0.65;

    // Body
    ctx.fillStyle = hex;
    ctx.shadowColor = hex;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(-12, -16, 24, 32, 6);
    ctx.fill();

    // Tag
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(opp.name || 'Friend', 0, -22);

    ctx.restore();
  }

  drawParticles(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // --- SLOW-MOTION RADIAL COLOR WHEEL ---
  drawSlowMoOverlay(ctx, isSlowMo, currentWheelAngle, player) {
    const w = this.width;
    const h = this.height;

    // Vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
    vig.addColorStop(0, `rgba(5, 8, 16, ${0.4 * this.timeSlowFilter})`);
    vig.addColorStop(1, `rgba(2, 4, 10, ${0.85 * this.timeSlowFilter})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    if (isSlowMo) {
      // Screen space player location
      const screenX = player.x - this.camera.x;
      const screenY = player.y - this.camera.y;

      const radius = 75;
      const innerRadius = 38;

      ctx.save();
      ctx.translate(screenX, screenY);

      // 4 Quadrants:
      // Top: Red (-PI/2)
      // Right: Blue (0)
      // Bottom: Yellow (PI/2)
      // Left: Green (PI)
      const quadrants = [
        { color: 'blue', start: -Math.PI / 4, end: Math.PI / 4, mid: 0, label: 'BLUE [2]' },
        { color: 'yellow', start: Math.PI / 4, end: 3 * Math.PI / 4, mid: Math.PI / 2, label: 'YELLOW [3]' },
        { color: 'green', start: 3 * Math.PI / 4, end: 5 * Math.PI / 4, mid: Math.PI, label: 'GREEN [4]' },
        { color: 'red', start: -3 * Math.PI / 4, end: -Math.PI / 4, mid: -Math.PI / 2, label: 'RED [1]' }
      ];

      // Determine active quadrant from angle
      let normAngle = currentWheelAngle;
      while (normAngle > Math.PI) normAngle -= Math.PI * 2;
      while (normAngle < -Math.PI) normAngle += Math.PI * 2;

      quadrants.forEach(q => {
        let isHovered = false;
        if (q.color === 'blue') isHovered = (normAngle >= -Math.PI / 4 && normAngle <= Math.PI / 4);
        else if (q.color === 'yellow') isHovered = (normAngle > Math.PI / 4 && normAngle <= 3 * Math.PI / 4);
        else if (q.color === 'red') isHovered = (normAngle < -Math.PI / 4 && normAngle >= -3 * Math.PI / 4);
        else if (q.color === 'green') isHovered = (normAngle > 3 * Math.PI / 4 || normAngle < -3 * Math.PI / 4);

        const hex = COLOR_HEX[q.color];
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, isHovered ? radius + 10 : radius, q.start + 0.05, q.end - 0.05);
        ctx.arc(0, 0, innerRadius, q.end - 0.05, q.start + 0.05, true);
        ctx.closePath();

        ctx.fillStyle = hex;
        ctx.globalAlpha = isHovered ? 0.95 : 0.45;
        if (isHovered) {
          ctx.shadowColor = hex;
          ctx.shadowBlur = 20;
        }
        ctx.fill();

        // Label
        const labelR = (radius + innerRadius) / 2;
        const lx = Math.cos(q.mid) * labelR;
        const ly = Math.sin(q.mid) * labelR;
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.fillText(q.color.toUpperCase(), lx, ly);

        ctx.restore();
      });

      // Directional pointer arrow
      ctx.save();
      ctx.rotate(currentWheelAngle);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(innerRadius - 6, 0);
      ctx.lineTo(innerRadius - 16, -6);
      ctx.lineTo(innerRadius - 16, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Center slow-mo badge
      ctx.fillStyle = '#0b0f19';
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius - 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SLOW-MO', 0, 0);

      ctx.restore();
    }
  }
}

window.ColorRenderer = ColorRenderer;
