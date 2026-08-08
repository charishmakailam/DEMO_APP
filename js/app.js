/**
 * FloraMagic Wand - Main Application Controller
 * Orchestrates particle wand engine, procedural flower renderer, audio synth, and UI controls.
 */

class FloraMagicApp {
  constructor() {
    // Canvases & Contexts
    this.flowerCanvas = document.getElementById('flowerCanvas');
    this.flowerCtx = this.flowerCanvas.getContext('2d');

    this.starfieldCanvas = document.getElementById('starfieldCanvas');
    this.wandTrailCanvas = document.getElementById('wandTrailCanvas');

    // Engine Instances
    this.wandEngine = new WandEngine(this.wandTrailCanvas, this.starfieldCanvas);
    this.handTracker = new HandTracker(
      (x, y) => this.handleWandMove(x, y),
      (x, y) => this.spawnBurst(x, y),
      () => this.clearWithWind()
    );

    // Active Flowers & Floating Petals
    this.flowers = [];
    this.floatingPetals = [];

    // App State Settings
    this.currentTheme = 'sakura';
    this.wandMode = 'stream'; // 'stream', 'burst', 'vine'
    this.flowerScale = 1.0;
    this.density = 3; // 1 (low) to 5 (high)
    this.windForce = 3;
    this.petalCount = 8;
    this.customColors = {
      petal: '#ff4b8b',
      pistil: '#ffd700',
      leaf: '#2ecc71'
    };

    // Auto-Magic Mandala Mode
    this.isAutoMagic = false;
    this.autoMagicAngle = 0;

    // Throttle / Distance Tracking for Spawning
    this.lastSpawnPos = { x: 0, y: 0 };
    this.minSpawnDistance = 45; // Pixels distance required before next flower

    // Performance Stats
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsTime = performance.now();

    this.init();
  }

  init() {
    this.resizeCanvases();
    window.addEventListener('resize', () => this.resizeCanvases());

    this.setupEventListeners();
    this.bindUIControls();

    // Start Main Animation Loop
    requestAnimationFrame((t) => this.animate(t));
  }

  resizeCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.flowerCanvas.width = w;
    this.flowerCanvas.height = h;
    this.wandEngine.resize(w, h);
  }

  setupEventListeners() {
    // Pointer Events on Wand Layer
    const canvas = this.wandTrailCanvas;

    const onPointerMove = (e) => {
      window.audioSynth.ensureContext();
      this.handleWandMove(e.clientX, e.clientY);
    };

    const onPointerDown = (e) => {
      // Don't trigger bloom if clicking UI panel
      if (e.target.closest('#controlPanel') || e.target.closest('.top-hud')) return;
      window.audioSynth.ensureContext();

      if (this.wandMode === 'burst') {
        this.spawnBurst(e.clientX, e.clientY);
      } else {
        this.spawnFlower(e.clientX, e.clientY, true);
      }
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);

    // Touch Support
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0]);
      }
    }, { passive: true });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0 && !e.target.closest('#controlPanel')) {
        onPointerDown(e.touches[0]);
      }
    }, { passive: true });
  }

  handleWandMove(x, y) {
    this.wandEngine.updatePosition(x, y);

    if (this.wandMode === 'stream' || this.wandMode === 'vine') {
      const dist = Math.hypot(x - this.lastSpawnPos.x, y - this.lastSpawnPos.y);
      const requiredDist = Math.max(15, this.minSpawnDistance - (this.density * 6));

      if (dist >= requiredDist) {
        this.spawnFlower(x, y, this.wandMode === 'vine');
        this.lastSpawnPos = { x, y };
      }
    }
  }

  spawnFlower(x, y, drawStem = false) {
    const flower = new FlowerInstance(x, y, {
      theme: this.currentTheme,
      customColors: this.customColors,
      size: this.flowerScale * (0.8 + Math.random() * 0.4),
      petalCount: this.petalCount,
      drawStem: drawStem
    });

    this.flowers.push(flower);

    // Play Synthesizer Chime Sound
    window.audioSynth.playFlowerBloomSound(x, y, this.flowerCanvas.width, this.flowerCanvas.height, this.flowerScale);

    this.updateFlowerCountUI();
  }

  spawnBurst(x, y) {
    const burstCount = 6 + Math.floor(Math.random() * 5);
    for (let i = 0; i < burstCount; i++) {
      const radius = Math.random() * (70 * this.flowerScale);
      const angle = Math.random() * Math.PI * 2;
      const bx = x + Math.cos(angle) * radius;
      const by = y + Math.sin(angle) * radius;

      setTimeout(() => {
        this.spawnFlower(bx, by, Math.random() < 0.3);
      }, i * 40);
    }
  }

  clearWithWind() {
    // Convert all flowers to scattering floating petals
    this.flowers.forEach(f => {
      const themeConfig = f.themeConfig;
      for (let i = 0; i < 4; i++) {
        this.floatingPetals.push(new FloatingPetal(
          f.x + (Math.random() - 0.5) * 20,
          f.y + (Math.random() - 0.5) * 20,
          themeConfig.petalColors[0],
          this.windForce * 2
        ));
      }
    });

    this.flowers = [];
    this.updateFlowerCountUI();
  }

  bindUIControls() {
    // Theme Selectors
    document.querySelectorAll('.theme-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.theme-card').forEach(b => b.classList.remove('active'));
        const card = e.currentTarget;
        card.classList.add('active');

        this.currentTheme = card.dataset.theme;
        window.audioSynth.setTheme(this.currentTheme);

        // Toggle Custom Colors Group
        const customGrp = document.getElementById('customColorGroup');
        customGrp.style.display = (this.currentTheme === 'custom') ? 'block' : 'none';
      });
    });

    // Custom Colors Pickers
    document.getElementById('petalColorInput').addEventListener('input', (e) => this.customColors.petal = e.target.value);
    document.getElementById('pistilColorInput').addEventListener('input', (e) => this.customColors.pistil = e.target.value);
    document.getElementById('leafColorInput').addEventListener('input', (e) => this.customColors.leaf = e.target.value);

    // Wand Mode Buttons
    document.querySelectorAll('.seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        this.wandMode = target.dataset.mode;
      });
    });

    // Wand Style Select
    document.getElementById('wandStyleSelect').addEventListener('change', (e) => {
      this.wandEngine.setStyle(e.target.value);
    });

    // Sliders
    const sizeSlider = document.getElementById('flowerSizeSlider');
    sizeSlider.addEventListener('input', (e) => {
      this.flowerScale = parseFloat(e.target.value);
      document.getElementById('flowerSizeVal').textContent = `${this.flowerScale.toFixed(1)}x`;
    });

    const densitySlider = document.getElementById('densitySlider');
    densitySlider.addEventListener('input', (e) => {
      this.density = parseInt(e.target.value);
      const labels = ['', 'Low', 'Medium-Low', 'Medium', 'High', 'Ultra'];
      document.getElementById('densityVal').textContent = labels[this.density] || 'Medium';
    });

    const windSlider = document.getElementById('windSlider');
    windSlider.addEventListener('input', (e) => {
      this.windForce = parseInt(e.target.value);
      const windLabels = ['Calm', 'Breeze', 'Gentle', 'Moderate', 'Brisk', 'Strong', 'Gale'];
      document.getElementById('windVal').textContent = windLabels[Math.min(6, Math.floor(this.windForce / 1.5))];
    });

    const petalSlider = document.getElementById('petalCountSlider');
    petalSlider.addEventListener('input', (e) => {
      this.petalCount = parseInt(e.target.value);
      document.getElementById('petalCountVal').textContent = this.petalCount;
    });

    const volSlider = document.getElementById('audioVolSlider');
    volSlider.addEventListener('input', (e) => {
      const vol = parseInt(e.target.value);
      window.audioSynth.setVolume(vol);
      document.getElementById('audioVolVal').textContent = `${vol}%`;
    });

    // Top Actions
    const autoBtn = document.getElementById('autoMagicBtn');
    autoBtn.addEventListener('click', () => {
      this.isAutoMagic = !this.isAutoMagic;
      autoBtn.classList.toggle('active', this.isAutoMagic);
    });

    const audioBtn = document.getElementById('audioToggleBtn');
    audioBtn.addEventListener('click', () => {
      window.audioSynth.ensureContext();
      const isMuted = window.audioSynth.toggleMute();
      document.getElementById('audioIcon').textContent = isMuted ? '🔇' : '🔊';
      audioBtn.querySelector('span:not(.btn-icon)').textContent = isMuted ? 'Sound OFF' : 'Sound ON';
      audioBtn.classList.toggle('active', !isMuted);
    });

    const cameraBtn = document.getElementById('cameraToggleBtn');
    cameraBtn.addEventListener('click', async () => {
      const active = await this.handTracker.toggleCamera();
      cameraBtn.classList.toggle('active', active);
    });

    document.getElementById('closePipBtn').addEventListener('click', () => {
      this.handTracker.stop();
      cameraBtn.classList.remove('active');
    });

    document.getElementById('clearCanvasBtn').addEventListener('click', () => {
      this.clearWithWind();
    });

    document.getElementById('snapshotBtn').addEventListener('click', () => {
      this.exportWallpaperPNG();
    });

    // Collapse Panel Toggle
    const collapseBtn = document.getElementById('collapsePanelBtn');
    const panel = document.getElementById('controlPanel');
    collapseBtn.addEventListener('click', () => {
      panel.classList.toggle('collapsed');
      collapseBtn.querySelector('span').textContent = panel.classList.contains('collapsed') ? '›' : '‹';
    });
  }

  updateFlowerCountUI() {
    document.getElementById('flowerCount').textContent = `${this.flowers.length} Flowers`;
  }

  exportWallpaperPNG() {
    // Combine Starfield + Flowers into an offscreen export canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.flowerCanvas.width;
    exportCanvas.height = this.flowerCanvas.height;
    const ctx = exportCanvas.getContext('2d');

    // Draw background gradient
    const grad = ctx.createRadialGradient(
      exportCanvas.width / 2, exportCanvas.height / 2, 0,
      exportCanvas.width / 2, exportCanvas.height / 2, exportCanvas.width * 0.7
    );
    grad.addColorStop(0, '#181d3d');
    grad.addColorStop(0.5, '#0f1226');
    grad.addColorStop(1, '#090b16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw starfield
    ctx.drawImage(this.starfieldCanvas, 0, 0);

    // Draw flowers
    ctx.drawImage(this.flowerCanvas, 0, 0);

    // Download PNG
    const link = document.createElement('a');
    link.download = `FloraMagic_Wallpaper_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }

  animate(timestamp) {
    // Calculate FPS
    this.frameCount++;
    if (timestamp - this.lastFpsTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsTime = timestamp;
      document.getElementById('fpsCount').textContent = `${this.fps} FPS`;
    }

    // Auto Magic Mandala Motion Logic
    if (this.isAutoMagic) {
      this.autoMagicAngle += 0.03;
      const cx = this.flowerCanvas.width / 2;
      const cy = this.flowerCanvas.height / 2;
      const R = Math.min(cx, cy) * 0.6;
      const k = 4; // Rose curve parameter
      const r = R * Math.cos(k * this.autoMagicAngle);
      const ax = cx + r * Math.cos(this.autoMagicAngle);
      const ay = cy + r * Math.sin(this.autoMagicAngle);

      this.handleWandMove(ax, ay);
    }

    // 1. Draw Starfield
    this.wandEngine.drawStarfield();

    // 2. Draw Flowers Canvas
    this.flowerCtx.clearRect(0, 0, this.flowerCanvas.width, this.flowerCanvas.height);

    // Update & Draw Flowers
    for (let i = this.flowers.length - 1; i >= 0; i--) {
      const flower = this.flowers[i];
      const alive = flower.update(this.windForce, this.floatingPetals);
      if (alive) {
        flower.draw(this.flowerCtx);
      } else {
        this.flowers.splice(i, 1);
        this.updateFlowerCountUI();
      }
    }

    // Update & Draw Floating Petals
    for (let i = this.floatingPetals.length - 1; i >= 0; i--) {
      const petal = this.floatingPetals[i];
      const alive = petal.update(this.windForce);
      if (alive) {
        petal.draw(this.flowerCtx);
      } else {
        this.floatingPetals.splice(i, 1);
      }
    }

    // 3. Update Wand Engine & Pointer Trail
    this.wandEngine.updateAndDraw();

    requestAnimationFrame((t) => this.animate(t));
  }
}

// Instantiate App on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new FloraMagicApp();
});
