const player = {
  width: 24,
  height: 32,
  x: 100,
  y: 500,
  vx: 0,
  vy: 0,
  color: 'red',
  gravity: 1450,
  maxSpeed: 280,
  accel: 1800,
  friction: 1400,
  jumpForce: -520,
  wallJumpForceX: 320,
  wallJumpForceY: -480,
  isGrounded: false,
  coyoteTime: 0,
  jumpBuffer: 0,
  isOnWall: 0,
  isDead: false,
  scaleX: 1.0,
  scaleY: 1.0,
  trail: [],
  facing: 1,
  onCarpet: false
};
function resetPlayer(spawn) {
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.color = spawn.color || 'red';
  player.isGrounded = false;
  player.isDead = false;
  player.coyoteTime = 0;
  player.jumpBuffer = 0;
  player.isOnWall = 0;
  player.scaleX = 1.0;
  player.scaleY = 1.0;
  player.trail = [];
}
function setPlayerColor(newColor) {
  if (player.color !== newColor) {
    player.color = newColor;
    window.colorAudio.playColorSwitch(newColor);
    return true;
  }
  return false;
}
function updatePlayer(dt, input, level, timeScale) {
  if (player.isDead) return;
  let effDt = dt * timeScale;
  if (player.isGrounded) {
    player.coyoteTime = 0.12;
  } else {
    player.coyoteTime = Math.max(0, player.coyoteTime - effDt);
  }
  if (input.jumpPressed) {
    player.jumpBuffer = 0.12;
  } else {
    player.jumpBuffer = Math.max(0, player.jumpBuffer - effDt);
  }
  let targetSpeed = 0;
  if (input.left) {
    targetSpeed -= player.maxSpeed;
    player.facing = -1;
  }
  if (input.right) {
    targetSpeed += player.maxSpeed;
    player.facing = 1;
  }
  if (player.onCarpet) {
    targetSpeed *= 1.35;
  }
  if (targetSpeed !== 0) {
    if (Math.sign(player.vx) !== Math.sign(targetSpeed)) {
      player.vx += Math.sign(targetSpeed) * player.friction * effDt * 1.5;
    }
    player.vx += Math.sign(targetSpeed) * player.accel * effDt;
    if (Math.abs(player.vx) > Math.abs(targetSpeed)) {
      player.vx = targetSpeed;
    }
  } else {
    let fric = player.isGrounded ? player.friction : player.friction * 0.4;
    if (Math.abs(player.vx) < fric * effDt) {
      player.vx = 0;
    } else {
      player.vx -= Math.sign(player.vx) * fric * effDt;
    }
  }
  let isSliding = false;
  if (!player.isGrounded && player.isOnWall !== 0 && player.vy > 0) {
    if ((player.isOnWall === -1 && input.left) || (player.isOnWall === 1 && input.right)) {
      isSliding = true;
      player.vy = Math.min(player.vy, 140);
    }
  }
  if (!isSliding) {
    player.vy += player.gravity * effDt;
    player.vy = Math.min(player.vy, 950);
  }
  if (player.jumpBuffer > 0) {
    if (player.coyoteTime > 0) {
      player.vy = player.jumpForce;
      player.jumpBuffer = 0;
      player.coyoteTime = 0;
      player.isGrounded = false;
      player.scaleX = 0.7;
      player.scaleY = 1.3;
      window.colorAudio.playJump();
    } else if (player.isOnWall !== 0) {
      player.vy = player.wallJumpForceY;
      player.vx = -player.isOnWall * player.wallJumpForceX;
      player.jumpBuffer = 0;
      player.isOnWall = 0;
      player.scaleX = 0.8;
      player.scaleY = 1.25;
      window.colorAudio.playWallJump();
    }
  }
  if (!input.jumpHold && player.vy < -160) {
    player.vy = -160;
  }
  handleMoveAndCollision(effDt, level);
  player.trail.push({ x: player.x, y: player.y, color: player.color, alpha: 0.6 });
  if (player.trail.length > 8) {
    player.trail.shift();
  }
  player.scaleX += (1.0 - player.scaleX) * 14 * effDt;
  player.scaleY += (1.0 - player.scaleY) * 14 * effDt;
  if (player.y > 850) {
    killPlayer();
  }
}
function handleMoveAndCollision(dt, level) {
  player.isGrounded = false;
  player.isOnWall = 0;
  player.onCarpet = false;
  for (let i = 0; i < level.platforms.length; i++) {
    let plat = level.platforms[i];
    if (plat.move) {
      plat.moveTimer = (plat.moveTimer || 0) + dt * plat.move.speed;
      let progress = Math.sin(plat.moveTimer + (plat.move.phase || 0));
      plat.curX = plat.x + (plat.move.dx || 0) * progress;
      plat.curY = plat.y + (plat.move.dy || 0) * progress;
      plat.vx = ((plat.move.dx || 0) * Math.cos(plat.moveTimer + (plat.move.phase || 0)) * plat.move.speed);
      plat.vy = ((plat.move.dy || 0) * Math.cos(plat.moveTimer + (plat.move.phase || 0)) * plat.move.speed);
    } else {
      plat.curX = plat.x;
      plat.curY = plat.y;
      plat.vx = 0;
      plat.vy = 0;
    }
    if (plat.colorCycle && plat.cycleInterval) {
      plat.cycleTime = (plat.cycleTime || 0) + dt;
      let phaseOffset = plat.cyclePhase || 0;
      let idx = Math.floor((plat.cycleTime + phaseOffset) / plat.cycleInterval) % plat.colorCycle.length;
      plat.curColor = plat.colorCycle[idx];
    } else {
      plat.curColor = plat.color;
    }
  }
  player.x += player.vx * dt;
  for (let i = 0; i < level.platforms.length; i++) {
    let plat = level.platforms[i];
    if (!isSolid(plat)) continue;
    let px = plat.curX;
    let py = plat.curY;
    if (boxOverlap(player.x, player.y, player.width, player.height, px, py, plat.w, plat.h)) {
      if (player.vx > 0) {
        player.x = px - player.width / 2;
        player.vx = 0;
        player.isOnWall = 1;
      } else if (player.vx < 0) {
        player.x = px + plat.w + player.width / 2;
        player.vx = 0;
        player.isOnWall = -1;
      }
    }
  }
  player.y += player.vy * dt;
  for (let i = 0; i < level.platforms.length; i++) {
    let plat = level.platforms[i];
    if (!isSolid(plat)) continue;
    let px = plat.curX;
    let py = plat.curY;
    if (boxOverlap(player.x, player.y, player.width, player.height, px, py, plat.w, plat.h)) {
      if (player.vy > 0) {
        player.y = py - player.height / 2;
        player.vy = 0;
        player.isGrounded = true;
        if (plat.vx || plat.vy) {
          player.x += plat.vx * dt;
          player.y += plat.vy * dt;
        }
        if (plat.isCarpet) {
          player.onCarpet = true;
        }
        if (player.scaleY > 0.9) {
          player.scaleX = 1.25;
          player.scaleY = 0.75;
          window.colorAudio.playLand();
        }
      } else if (player.vy < 0) {
        player.y = py + plat.h + player.height / 2;
        player.vy = 0;
      }
    }
  }
  if (level.bouncePads) {
    for (let i = 0; i < level.bouncePads.length; i++) {
      let pad = level.bouncePads[i];
      if (boxOverlap(player.x, player.y, player.width, player.height, pad.x, pad.y, pad.w, pad.h)) {
        player.vy = -(pad.force || 700);
        player.scaleX = 0.6;
        player.scaleY = 1.4;
        window.colorAudio.playBouncePad();
      }
    }
  }
  if (level.hazards) {
    for (let i = 0; i < level.hazards.length; i++) {
      let haz = level.hazards[i];
      if (haz.color !== player.color) {
        if (boxOverlap(player.x, player.y, player.width, player.height, haz.x, haz.y, haz.w, haz.h)) {
          killPlayer();
        }
      }
    }
  }
}
function isSolid(plat) {
  let col = plat.curColor || plat.color;
  if (col === 'white') return true;
  return col === player.color;
}
function boxOverlap(cx, cy, cw, ch, rx, ry, rw, rh) {
  let left = cx - cw / 2;
  let right = cx + cw / 2;
  let top = cy - ch / 2;
  let bottom = cy + ch / 2;
  return left < rx + rw && right > rx && top < ry + rh && bottom > ry;
}
function killPlayer() {
  if (player.isDead) return;
  player.isDead = true;
  window.colorAudio.playDeath();
  if (window.onPlayerDeathCallback) {
    window.onPlayerDeathCallback();
  }
}
window.player = player;
window.resetPlayer = resetPlayer;
window.setPlayerColor = setPlayerColor;
window.updatePlayer = updatePlayer;
