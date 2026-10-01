// The Color - 2D Platformer Physics & Player Kinematics
class PlayerController {
  constructor() {
    this.width = 24;
    this.height = 32;
    this.x = 100;
    this.y = 500;
    this.vx = 0;
    this.vy = 0;
    this.color = 'red';

    // Physics parameters
    this.gravity = 1450;
    this.maxSpeed = 280;
    this.accel = 1800;
    this.friction = 1400;
    this.jumpForce = -520;
    this.wallJumpForceX = 320;
    this.wallJumpForceY = -480;

    // Game feel & buffers
    this.isGrounded = false;
    this.coyoteTime = 0; // jump grace period after leaving edge
    this.jumpBuffer = 0; // jump input buffer before landing
    this.isOnWall = 0; // -1 for left wall, 1 for right wall, 0 for none
    this.isDead = false;

    // Visuals & Squash/Stretch
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.trail = [];
    this.facing = 1; // 1 right, -1 left
  }

  reset(spawn) {
    this.x = spawn.x;
    this.y = spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.color = spawn.color || 'red';
    this.isGrounded = false;
    this.isDead = false;
    this.coyoteTime = 0;
    this.jumpBuffer = 0;
    this.isOnWall = 0;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.trail = [];
  }

  setColor(newColor) {
    if (this.color !== newColor) {
      this.color = newColor;
      window.colorAudio.playColorSwitch(newColor);
      return true;
    }
    return false;
  }

  update(dt, input, level, timeScale = 1.0) {
    if (this.isDead) return;

    const effDt = dt * timeScale;

    // Handle Timers
    if (this.isGrounded) {
      this.coyoteTime = 0.12;
    } else {
      this.coyoteTime = Math.max(0, this.coyoteTime - effDt);
    }

    if (input.jumpPressed) {
      this.jumpBuffer = 0.12;
    } else {
      this.jumpBuffer = Math.max(0, this.jumpBuffer - effDt);
    }

    // Horizontal Movement
    let targetSpeed = 0;
    if (input.left) {
      targetSpeed -= this.maxSpeed;
      this.facing = -1;
    }
    if (input.right) {
      targetSpeed += this.maxSpeed;
      this.facing = 1;
    }

    // Check if on active Color Carpet (speed boost!)
    if (this.onCarpet) {
      targetSpeed *= 1.35;
    }

    // Accelerate / Decelerate
    if (targetSpeed !== 0) {
      if (Math.sign(this.vx) !== Math.sign(targetSpeed)) {
        this.vx += Math.sign(targetSpeed) * this.friction * effDt * 1.5;
      }
      this.vx += Math.sign(targetSpeed) * this.accel * effDt;
      if (Math.abs(this.vx) > Math.abs(targetSpeed)) {
        this.vx = targetSpeed;
      }
    } else {
      // Apply ground / air friction
      const fric = this.isGrounded ? this.friction : this.friction * 0.4;
      if (Math.abs(this.vx) < fric * effDt) {
        this.vx = 0;
      } else {
        this.vx -= Math.sign(this.vx) * fric * effDt;
      }
    }

    // Wall Slide Logic
    let isSliding = false;
    if (!this.isGrounded && this.isOnWall !== 0 && this.vy > 0) {
      if ((this.isOnWall === -1 && input.left) || (this.isOnWall === 1 && input.right)) {
        isSliding = true;
        this.vy = Math.min(this.vy, 140); // slow descent on wall
      }
    }

    // Gravity
    if (!isSliding) {
      this.vy += this.gravity * effDt;
      this.vy = Math.min(this.vy, 950); // terminal velocity
    }

    // Jump Execution
    if (this.jumpBuffer > 0) {
      if (this.coyoteTime > 0) {
        // Normal Jump
        this.vy = this.jumpForce;
        this.jumpBuffer = 0;
        this.coyoteTime = 0;
        this.isGrounded = false;
        this.scaleX = 0.7;
        this.scaleY = 1.3; // Stretch
        window.colorAudio.playJump();
      } else if (this.isOnWall !== 0) {
        // Wall Jump!
        this.vy = this.wallJumpForceY;
        this.vx = -this.isOnWall * this.wallJumpForceX;
        this.jumpBuffer = 0;
        this.isOnWall = 0;
        this.scaleX = 0.8;
        this.scaleY = 1.25;
        window.colorAudio.playWallJump();
      }
    }

    // Variable jump height: release early to cut jump
    if (!input.jumpHold && this.vy < -160) {
      this.vy = -160;
    }

    // Collision Detection & Movement Resolution
    this.moveAndCollide(effDt, level);

    // Trail records
    this.trail.push({ x: this.x, y: this.y, color: this.color, alpha: 0.6 });
    if (this.trail.length > 8) {
      this.trail.shift();
    }

    // Ease squash & stretch back to 1.0
    this.scaleX += (1.0 - this.scaleX) * 14 * effDt;
    this.scaleY += (1.0 - this.scaleY) * 14 * effDt;

    // Out of bounds check
    if (this.y > 850) {
      this.die();
    }
  }

  moveAndCollide(dt, level) {
    this.isGrounded = false;
    this.isOnWall = 0;
    this.onCarpet = false;

    // Update level moving & cycling platforms first
    level.platforms.forEach(plat => {
      // 1. Moving Platform Translation
      if (plat.move) {
        plat.moveTimer = (plat.moveTimer || 0) + dt * plat.move.speed;
        const progress = Math.sin(plat.moveTimer + (plat.move.phase || 0));
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

      // 2. Color Cycling Platform
      if (plat.colorCycle && plat.cycleInterval) {
        plat.cycleTime = (plat.cycleTime || 0) + dt;
        const phaseOffset = plat.cyclePhase || 0;
        const idx = Math.floor((plat.cycleTime + phaseOffset) / plat.cycleInterval) % plat.colorCycle.length;
        plat.curColor = plat.colorCycle[idx];
      } else {
        plat.curColor = plat.color;
      }
    });

    // 1. Horizontal Motion & Collision
    this.x += this.vx * dt;
    level.platforms.forEach(plat => {
      if (!this.isPlatformSolid(plat)) return;

      const px = plat.curX;
      const py = plat.curY;

      if (this.checkOverlap(this.x, this.y, this.width, this.height, px, py, plat.w, plat.h)) {
        if (this.vx > 0) {
          this.x = px - this.width / 2;
          this.vx = 0;
          this.isOnWall = 1;
        } else if (this.vx < 0) {
          this.x = px + plat.w + this.width / 2;
          this.vx = 0;
          this.isOnWall = -1;
        }
      }
    });

    // 2. Vertical Motion & Collision
    this.y += this.vy * dt;
    level.platforms.forEach(plat => {
      if (!this.isPlatformSolid(plat)) return;

      const px = plat.curX;
      const py = plat.curY;

      if (this.checkOverlap(this.x, this.y, this.width, this.height, px, py, plat.w, plat.h)) {
        if (this.vy > 0) {
          // Landing on top of platform
          this.y = py - this.height / 2;
          this.vy = 0;
          this.isGrounded = true;

          // Riding moving platform
          if (plat.vx || plat.vy) {
            this.x += plat.vx * dt;
            this.y += plat.vy * dt;
          }

          if (plat.isCarpet) {
            this.onCarpet = true;
          }

          // Squash on landing
          if (this.scaleY > 0.9) {
            this.scaleX = 1.25;
            this.scaleY = 0.75;
            window.colorAudio.playLand();
          }
        } else if (this.vy < 0) {
          // Hitting ceiling
          this.y = py + plat.h + this.height / 2;
          this.vy = 0;
        }
      }
    });

    // 3. Bounce Pad Checks
    if (level.bouncePads) {
      level.bouncePads.forEach(pad => {
        if (this.checkOverlap(this.x, this.y, this.width, this.height, pad.x, pad.y, pad.w, pad.h)) {
          this.vy = -(pad.force || 700);
          this.scaleX = 0.6;
          this.scaleY = 1.4;
          window.colorAudio.playBouncePad();
        }
      });
    }

    // 4. Hazard Spike Checks
    if (level.hazards) {
      level.hazards.forEach(haz => {
        // If hazard matches player color, it is safe! If not, it is lethal!
        if (haz.color !== this.color) {
          if (this.checkOverlap(this.x, this.y, this.width, this.height, haz.x, haz.y, haz.w, haz.h)) {
            this.die();
          }
        }
      });
    }
  }

  isPlatformSolid(plat) {
    const col = plat.curColor || plat.color;
    // Neutral white platform is always solid!
    if (col === 'white') return true;
    // Colored platforms are ONLY solid if matching player's current color!
    return col === this.color;
  }

  checkOverlap(cx, cy, cw, ch, rx, ry, rw, rh) {
    const left = cx - cw / 2;
    const right = cx + cw / 2;
    const top = cy - ch / 2;
    const bottom = cy + ch / 2;
    return left < rx + rw && right > rx && top < ry + rh && bottom > ry;
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    window.colorAudio.playDeath();
    if (window.gameInstance) {
      window.gameInstance.onPlayerDeath();
    }
  }
}

window.PlayerController = PlayerController;
