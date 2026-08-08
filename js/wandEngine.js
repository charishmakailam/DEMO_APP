/**
 * FloraMagic Wand - Wand Trail & Starfield Particle Engine
 * Manages smooth wand motion, sparkling trail physics, custom wand cursors, and ambient background starfield.
 */

class WandEngine {
  constructor(trailCanvas, starCanvas) {
    this.trailCanvas = trailCanvas;
    this.trailCtx = trailCanvas.getContext('2d');

    this.starCanvas = starCanvas;
    this.starCtx = starCanvas.getContext('2d');

    // Wand Position (Target vs Smoothed Lerp)
    this.targetX = window.innerWidth / 2;
    this.targetY = window.innerHeight / 2;
    this.currentX = this.targetX;
    this.currentY = this.targetY;
    this.isMoving = false;
    this.lastMoveTime = 0;

    // Trail Particles & Path History
    this.trailParticles = [];
    this.pathHistory = [];
    this.maxHistory = 20;

    // Wand Style Theme
    this.style = 'stardust'; // 'stardust', 'firefly', 'ribbon', 'crystal'

    // Background Stars
    this.stars = [];
    this.initStarfield();
  }

  resize(width, height) {
    this.trailCanvas.width = width;
    this.trailCanvas.height = height;
    this.starCanvas.width = width;
    this.starCanvas.height = height;
    this.initStarfield();
  }

  setStyle(styleName) {
    this.style = styleName;
  }

  updatePosition(x, y) {
    this.targetX = x;
    this.targetY = y;
    this.isMoving = true;
    this.lastMoveTime = Date.now();
  }

  initStarfield() {
    this.stars = [];
    const count = Math.floor((this.starCanvas.width * this.starCanvas.height) / 8000);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.starCanvas.width,
        y: Math.random() * this.starCanvas.height,
        size: Math.random() * 2,
        alpha: Math.random(),
        twinkleSpeed: 0.005 + Math.random() * 0.015,
        color: ['#ffffff', '#e0e7ff', '#ffedd5', '#fce7f3'][Math.floor(Math.random() * 4)]
      });
    }
  }

  drawStarfield() {
    if (!this.starCtx) return;
    const ctx = this.starCtx;
    ctx.clearRect(0, 0, this.starCanvas.width, this.starCanvas.height);

    // Draw Stars
    this.stars.forEach(star => {
      star.alpha += star.twinkleSpeed;
      if (star.alpha > 1 || star.alpha < 0.2) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0.2, Math.min(1, star.alpha));
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Faint glow for larger stars
      if (star.size > 1.4) {
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      ctx.restore();
    });
  }

  emitTrailParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 2;

    this.trailParticles.push({
      x: this.currentX + (Math.random() - 0.5) * 8,
      y: this.currentY + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.5,
      size: 3 + Math.random() * 5,
      alpha: 1.0,
      decay: 0.02 + Math.random() * 0.03,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.1,
      color: ['#ff4b8b', '#00f2fe', '#ffd700', '#c084fc', '#ffffff'][Math.floor(Math.random() * 5)]
    });
  }

  updateAndDraw() {
    const ctx = this.trailCtx;
    ctx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);

    // Smooth Lerp Position towards target
    const dx = this.targetX - this.currentX;
    const dy = this.targetY - this.currentY;
    const dist = Math.hypot(dx, dy);

    this.currentX += dx * 0.35;
    this.currentY += dy * 0.35;

    // Record Path History
    this.pathHistory.unshift({ x: this.currentX, y: this.currentY });
    if (this.pathHistory.length > this.maxHistory) {
      this.pathHistory.pop();
    }

    // Emit particles if moving
    if (dist > 1.5) {
      const emitCount = Math.min(4, Math.floor(dist / 4) + 1);
      for (let i = 0; i < emitCount; i++) {
        this.emitTrailParticle();
      }
    }

    // Check motion timeout
    if (Date.now() - this.lastMoveTime > 300) {
      this.isMoving = false;
    }

    // Draw Ribbon Style
    if (this.style === 'ribbon' && this.pathHistory.length > 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.pathHistory[0].x, this.pathHistory[0].y);
      for (let i = 1; i < this.pathHistory.length - 1; i++) {
        const xc = (this.pathHistory[i].x + this.pathHistory[i + 1].x) / 2;
        const yc = (this.pathHistory[i].y + this.pathHistory[i + 1].y) / 2;
        ctx.quadraticCurveTo(this.pathHistory[i].x, this.pathHistory[i].y, xc, yc);
      }
      ctx.strokeStyle = 'rgba(255, 75, 139, 0.4)';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 12;
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // Update & Draw Trail Particles
    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.trailParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = p.color;

      switch (this.style) {
        case 'firefly':
          // Soft floating sphere
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'crystal':
          // Diamond Shard
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.6, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.6, 0);
          ctx.closePath();
          ctx.fill();
          break;

        case 'stardust':
        default:
          // 4-point Sparkle Star
          ctx.beginPath();
          for (let s = 0; s < 4; s++) {
            const rot = (s * Math.PI) / 2;
            ctx.lineTo(Math.cos(rot) * p.size, Math.sin(rot) * p.size);
            const inRot = rot + Math.PI / 4;
            ctx.lineTo(Math.cos(inRot) * (p.size * 0.3), Math.sin(inRot) * (p.size * 0.3));
          }
          ctx.closePath();
          ctx.fill();
          break;
      }

      ctx.restore();
    }

    // Draw Custom Glowing Wand Pointer Tip
    this.drawWandTip(ctx, this.currentX, this.currentY);
  }

  drawWandTip(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Radiating Aura
    const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.2;
    const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 25 * pulse);
    auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    auraGrad.addColorStop(0.3, 'rgba(255, 75, 139, 0.6)');
    auraGrad.addColorStop(0.7, 'rgba(0, 242, 254, 0.3)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 25 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Wand Crystal Star Core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    const spikes = 8;
    for (let i = 0; i < spikes * 2; i++) {
      const r = (i % 2 === 0) ? 12 * pulse : 4 * pulse;
      const a = (i * Math.PI) / spikes;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
