const camera = { x: 0, y: 0 };
let particles = [];
let timeSlowFilter = 0;
function updateCamera(targetX, targetY, dt, canvasWidth, canvasHeight) {
  let desiredX = targetX - canvasWidth / 2;
  let desiredY = targetY - canvasHeight / 2;
  camera.x += (desiredX - camera.x) * Math.min(1, 8 * dt);
  camera.y += (desiredY - camera.y) * Math.min(1, 8 * dt);
  camera.x = Math.max(-100, Math.min(1400 - canvasWidth, camera.x));
  camera.y = Math.max(-100, Math.min(900 - canvasHeight, camera.y));
}
function addColorBurst(x, y, color) {
  for (let i = 0; i < 16; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 60 + Math.random() * 160;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 4,
      color: COLOR_HEX[color] || '#fff',
      alpha: 1,
      life: 0.45 + Math.random() * 0.3
    });
  }
}
function addDeathBurst(x, y, color) {
  for (let i = 0; i < 30; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 50 + Math.random() * 240;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 5,
      color: Math.random() > 0.3 ? COLOR_HEX[color] : '#fff',
      alpha: 1,
      life: 0.6 + Math.random() * 0.4
    });
  }
}
function updateParticles(dt, isSlowMo) {
  timeSlowFilter += ((isSlowMo ? 1 : 0) - timeSlowFilter) * 10 * dt;
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha = Math.max(0, p.life / 0.5);
  }
}
function renderScene(ctx, canvas, playerObj, level, isSlowMo, wheelAngle, opponents, dt) {
  updateParticles(dt, isSlowMo);
  updateCamera(playerObj.x, playerObj.y, dt, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(camera.x - 200, camera.y - 200, canvas.width + 400, canvas.height + 400);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  let spacing = 48;
  let startX = Math.floor((camera.x - 100) / spacing) * spacing;
  let endX = camera.x + canvas.width + 100;
  let startY = Math.floor((camera.y - 100) / spacing) * spacing;
  let endY = camera.y + canvas.height + 100;
  for (let x = startX; x <= endX; x += spacing) {
    for (let y = startY; y <= endY; y += spacing) {
      ctx.fillRect(x, y, 2, 2);
    }
  }
  if (level.platforms) {
    for (let i = 0; i < level.platforms.length; i++) {
      let plat = level.platforms[i];
      if (plat.move) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        let sx = plat.x - (plat.move.dx || 0);
        let ex = plat.x + (plat.move.dx || 0);
        let sy = plat.y - (plat.move.dy || 0);
        let ey = plat.y + (plat.move.dy || 0);
        ctx.moveTo(sx + plat.w / 2, sy + plat.h / 2);
        ctx.lineTo(ex + plat.w / 2, ey + plat.h / 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    for (let i = 0; i < level.platforms.length; i++) {
      let plat = level.platforms[i];
      let col = plat.curColor || plat.color;
      let isMatch = (col === 'white' || col === playerObj.color);
      let px = plat.curX !== undefined ? plat.curX : plat.x;
      let py = plat.curY !== undefined ? plat.curY : plat.y;
      let hex = COLOR_HEX[col] || '#fff';
      ctx.save();
      if (isMatch) {
        ctx.fillStyle = hex;
        ctx.shadowColor = hex;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(px, py, plat.w, plat.h, 6);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 0;
        ctx.fillRect(px + 4, py + 2, plat.w - 8, 3);
        if (plat.isCarpet) {
          let shift = (Date.now() * 0.05) % 20;
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
    }
  }
  if (level.hazards) {
    for (let i = 0; i < level.hazards.length; i++) {
      let haz = level.hazards[i];
      let isSafe = (haz.color === playerObj.color);
      let hex = haz.color === 'all' ? '#ff0033' : (COLOR_HEX[haz.color] || '#ff0033');
      ctx.save();
      ctx.fillStyle = hex;
      ctx.globalAlpha = isSafe ? 0.3 : 1.0;
      if (!isSafe) {
        ctx.shadowColor = hex;
        ctx.shadowBlur = 10;
      }
      let count = Math.floor(haz.w / 16);
      for (let s = 0; s < count; s++) {
        let sx = haz.x + s * 16;
        ctx.beginPath();
        ctx.moveTo(sx, haz.y + haz.h);
        ctx.lineTo(sx + 8, haz.y);
        ctx.lineTo(sx + 16, haz.y + haz.h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }
  if (level.bouncePads) {
    for (let i = 0; i < level.bouncePads.length; i++) {
      let pad = level.bouncePads[i];
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#00F59B';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(pad.x, pad.y, pad.w, pad.h, 4);
      ctx.fill();
      ctx.strokeStyle = '#0b0f19';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pad.x + pad.w / 2 - 6, pad.y + pad.h - 4);
      ctx.lineTo(pad.x + pad.w / 2, pad.y + 4);
      ctx.lineTo(pad.x + pad.w / 2 + 6, pad.y + pad.h - 4);
      ctx.stroke();
      ctx.restore();
    }
  }
  if (level.portal) {
    let time = Date.now() * 0.003;
    ctx.save();
    ctx.translate(level.portal.x, level.portal.y);
    let rings = ['red', 'blue', 'yellow', 'green'];
    for (let r = 0; r < rings.length; r++) {
      ctx.save();
      ctx.rotate(time * (r % 2 === 0 ? 1 : -1) * (1 + r * 0.2));
      ctx.strokeStyle = COLOR_HEX[rings[r]];
      ctx.shadowColor = COLOR_HEX[rings[r]];
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.5;
      let sz = 18 + r * 8;
      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.lineTo(sz, 0);
      ctx.lineTo(0, sz);
      ctx.lineTo(-sz, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (let i = 0; i < opponents.length; i++) {
    let opp = opponents[i];
    let oppHex = COLOR_HEX[opp.color] || '#ffffff';
    ctx.save();
    ctx.translate(opp.x, opp.y);
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = oppHex;
    ctx.shadowColor = oppHex;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(-12, -16, 24, 32, 6);
    ctx.fill();
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(opp.name || 'Friend', 0, -22);
    ctx.restore();
  }
  if (!playerObj.isDead) {
    let hex = COLOR_HEX[playerObj.color] || '#FF2A6D';
    for (let i = 0; i < playerObj.trail.length; i++) {
      let t = playerObj.trail[i];
      ctx.save();
      ctx.globalAlpha = t.alpha * 0.4;
      ctx.fillStyle = COLOR_HEX[t.color] || hex;
      ctx.beginPath();
      ctx.roundRect(t.x - playerObj.width / 2, t.y - playerObj.height / 2, playerObj.width, playerObj.height, 6);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(playerObj.x, playerObj.y);
    ctx.scale(playerObj.scaleX * playerObj.facing, playerObj.scaleY);
    ctx.fillStyle = hex;
    ctx.shadowColor = hex;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(-playerObj.width / 2, -playerObj.height / 2, playerObj.width, playerObj.height, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.roundRect(-playerObj.width / 2 + 4, -playerObj.height / 2 + 4, playerObj.width - 8, playerObj.height - 8, 4);
    ctx.fill();
    ctx.fillStyle = '#0b0f19';
    ctx.beginPath();
    ctx.arc(4, -3, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  if (timeSlowFilter > 0.01) {
    let w = canvas.width;
    let h = canvas.height;
    let vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
    vig.addColorStop(0, `rgba(5, 8, 16, ${0.4 * timeSlowFilter})`);
    vig.addColorStop(1, `rgba(2, 4, 10, ${0.85 * timeSlowFilter})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
    if (isSlowMo) {
      let screenX = playerObj.x - camera.x;
      let screenY = playerObj.y - camera.y;
      let radius = 75;
      let innerRadius = 38;
      ctx.save();
      ctx.translate(screenX, screenY);
      let quads = [
        { color: 'blue', start: -Math.PI / 4, end: Math.PI / 4, mid: 0 },
        { color: 'yellow', start: Math.PI / 4, end: 3 * Math.PI / 4, mid: Math.PI / 2 },
        { color: 'green', start: 3 * Math.PI / 4, end: 5 * Math.PI / 4, mid: Math.PI },
        { color: 'red', start: -3 * Math.PI / 4, end: -Math.PI / 4, mid: -Math.PI / 2 }
      ];
      let norm = wheelAngle;
      while (norm > Math.PI) norm -= Math.PI * 2;
      while (norm < -Math.PI) norm += Math.PI * 2;
      for (let q = 0; q < quads.length; q++) {
        let quad = quads[q];
        let isHover = false;
        if (quad.color === 'blue') isHover = (norm >= -Math.PI / 4 && norm <= Math.PI / 4);
        else if (quad.color === 'yellow') isHover = (norm > Math.PI / 4 && norm <= 3 * Math.PI / 4);
        else if (quad.color === 'red') isHover = (norm < -Math.PI / 4 && norm >= -3 * Math.PI / 4);
        else if (quad.color === 'green') isHover = (norm > 3 * Math.PI / 4 || norm < -3 * Math.PI / 4);
        let qHex = COLOR_HEX[quad.color];
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, isHover ? radius + 10 : radius, quad.start + 0.05, quad.end - 0.05);
        ctx.arc(0, 0, innerRadius, quad.end - 0.05, quad.start + 0.05, true);
        ctx.closePath();
        ctx.fillStyle = qHex;
        ctx.globalAlpha = isHover ? 0.95 : 0.45;
        if (isHover) {
          ctx.shadowColor = qHex;
          ctx.shadowBlur = 20;
        }
        ctx.fill();
        let labelR = (radius + innerRadius) / 2;
        let lx = Math.cos(quad.mid) * labelR;
        let ly = Math.sin(quad.mid) * labelR;
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.fillText(quad.color.toUpperCase(), lx, ly);
        ctx.restore();
      }
      ctx.save();
      ctx.rotate(wheelAngle);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(innerRadius - 6, 0);
      ctx.lineTo(innerRadius - 16, -6);
      ctx.lineTo(innerRadius - 16, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
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
window.renderer = {
  render: renderScene,
  addColorBurst: addColorBurst,
  addDeathBurst: addDeathBurst,
  camera: camera
};
