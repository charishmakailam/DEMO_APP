/**
 * FloraMagic Wand - Procedural Flower & Petal Renderer
 * Handles vector math for growing stems, layered petal blooms, glowing centers, and floating drift physics.
 */

class FlowerTheme {
  static sakura = {
    name: 'Sakura',
    petalColors: ['#ffd1dc', '#ff9ebb', '#ff4b8b'],
    pistilColor: '#ffffff',
    centerGlow: '#ffb7c5',
    leafColor: '#4ade80',
    stemColor: 'rgba(74, 222, 128, 0.6)',
    petalShape: 'notched',
    defaultPetals: 8
  };

  static lotus = {
    name: 'Neon Lotus',
    petalColors: ['#c084fc', '#a855f7', '#ec4899', '#3b82f6'],
    pistilColor: '#00f2fe',
    centerGlow: '#00f2fe',
    leafColor: '#06b6d4',
    stemColor: 'rgba(6, 182, 212, 0.6)',
    petalShape: 'pointed',
    defaultPetals: 12
  };

  static rose = {
    name: 'Enchanted Rose',
    petalColors: ['#fb7185', '#f43f5e', '#e11d48', '#881337'],
    pistilColor: '#fde047',
    centerGlow: '#fbbf24',
    leafColor: '#15803d',
    stemColor: 'rgba(21, 128, 61, 0.7)',
    petalShape: 'rose',
    defaultPetals: 14
  };

  static sunflower = {
    name: 'Solar Sunflower',
    petalColors: ['#fef08a', '#fde047', '#eab308', '#f97316'],
    pistilColor: '#451a03',
    centerGlow: '#ca8a04',
    leafColor: '#65a30d',
    stemColor: 'rgba(101, 163, 13, 0.7)',
    petalShape: 'sunflower',
    defaultPetals: 16
  };

  static cosmos = {
    name: 'Prismatic Cosmos',
    petalColors: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6'],
    pistilColor: '#ffffff',
    centerGlow: '#a855f7',
    leafColor: '#34d399',
    stemColor: 'rgba(52, 211, 153, 0.6)',
    petalShape: 'cosmos',
    defaultPetals: 10
  };

  static getTheme(name, customColors = null) {
    if (name === 'custom' && customColors) {
      return {
        name: 'Custom',
        petalColors: [customColors.petal, customColors.petal, '#ffffff'],
        pistilColor: customColors.pistil,
        centerGlow: customColors.pistil,
        leafColor: customColors.leaf,
        stemColor: customColors.leaf,
        petalShape: 'notched',
        defaultPetals: 10
      };
    }
    return FlowerTheme[name] || FlowerTheme.sakura;
  }
}

class FlowerInstance {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;

    this.themeConfig = FlowerTheme.getTheme(options.theme || 'sakura', options.customColors);
    this.targetSize = (options.size || 1.0) * (30 + Math.random() * 25);
    this.currentScale = 0.05;
    this.growthSpeed = 0.04 + Math.random() * 0.03;

    this.petalCount = options.petalCount || this.themeConfig.defaultPetals;
    this.rotation = Math.random() * Math.PI * 2;
    this.spinSpeed = (Math.random() - 0.5) * 0.005;

    this.age = 0;
    this.maxAge = options.infiniteLife ? Infinity : (300 + Math.random() * 200); // frames
    this.opacity = 1.0;

    // Optional Stem & Leaf data
    this.drawStem = options.drawStem || false;
    this.stemLength = 40 + Math.random() * 60;
    this.stemAngle = Math.PI / 2 + (Math.random() - 0.5) * 0.5;

    // Floating detached petals spawned during bloom or breeze
    this.spawnedFloatingPetals = false;
  }

  update(windForce = 0, floatingPetalsArray = []) {
    this.age++;

    // Bloom growth easing
    if (this.currentScale < 1.0) {
      this.currentScale += (1.0 - this.currentScale) * this.growthSpeed;
      if (this.currentScale > 0.99) this.currentScale = 1.0;
    }

    this.rotation += this.spinSpeed;

    // Fade out near end of life
    if (this.maxAge !== Infinity && this.age > this.maxAge - 60) {
      this.opacity = Math.max(0, (this.maxAge - this.age) / 60);
    }

    // Shed loose petals in wind
    if (!this.spawnedFloatingPetals && this.currentScale > 0.8 && Math.random() < 0.3) {
      this.spawnedFloatingPetals = true;
      const petalQty = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < petalQty; i++) {
        floatingPetalsArray.push(new FloatingPetal(
          this.x + (Math.random() - 0.5) * this.targetSize * 0.5,
          this.y + (Math.random() - 0.5) * this.targetSize * 0.5,
          this.themeConfig.petalColors[0],
          windForce
        ));
      }
    }

    return this.opacity > 0;
  }

  draw(ctx) {
    if (this.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Draw Stem if enabled
    if (this.drawStem) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      const endX = this.x - Math.cos(this.stemAngle) * this.stemLength * this.currentScale;
      const endY = this.y + Math.sin(this.stemAngle) * this.stemLength * this.currentScale;
      ctx.quadraticCurveTo(this.x - 10, this.y + this.stemLength * 0.5, endX, endY);
      ctx.strokeStyle = this.themeConfig.stemColor;
      ctx.lineWidth = 3 * this.currentScale;
      ctx.stroke();

      // Stem Leaf
      ctx.save();
      ctx.translate(this.x - 5, this.y + 15 * this.currentScale);
      ctx.rotate(-0.4);
      ctx.fillStyle = this.themeConfig.leafColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, 8 * this.currentScale, 4 * this.currentScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Move to Flower Center
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    const radius = this.targetSize * this.currentScale;

    // Draw Layered Petals
    const angleStep = (Math.PI * 2) / this.petalCount;

    // Inner & Outer Petal Layers
    const layers = [
      { scale: 1.0, colorIndex: 0 },
      { scale: 0.7, colorIndex: 1 },
      { scale: 0.45, colorIndex: 2 || 0 }
    ];

    layers.forEach(layer => {
      const layerRadius = radius * layer.scale;
      const color = this.themeConfig.petalColors[layer.colorIndex % this.themeConfig.petalColors.length];

      for (let i = 0; i < this.petalCount; i++) {
        const angle = i * angleStep;
        ctx.save();
        ctx.rotate(angle);

        ctx.fillStyle = color;
        ctx.beginPath();

        // Custom Petal Shapes
        switch (this.themeConfig.petalShape) {
          case 'pointed':
            // Lotus pointed shape
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(layerRadius * 0.3, -layerRadius * 0.5, 0, -layerRadius);
            ctx.quadraticCurveTo(-layerRadius * 0.3, -layerRadius * 0.5, 0, 0);
            break;

          case 'rose':
            // Rounded overlapping rose petal
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(layerRadius * 0.5, -layerRadius * 0.3, layerRadius * 0.4, -layerRadius, 0, -layerRadius);
            ctx.bezierCurveTo(-layerRadius * 0.4, -layerRadius, -layerRadius * 0.5, -layerRadius * 0.3, 0, 0);
            break;

          case 'sunflower':
            // Slender solar leaf
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(layerRadius * 0.2, -layerRadius * 0.6, 0, -layerRadius * 1.1);
            ctx.quadraticCurveTo(-layerRadius * 0.2, -layerRadius * 0.6, 0, 0);
            break;

          case 'notched':
          default:
            // Sakura notched petal
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(layerRadius * 0.4, -layerRadius * 0.4, layerRadius * 0.3, -layerRadius * 0.9, 0, -layerRadius);
            ctx.bezierCurveTo(-layerRadius * 0.3, -layerRadius * 0.9, -layerRadius * 0.4, -layerRadius * 0.4, 0, 0);
            break;
        }

        ctx.fill();

        // Delicate Petal Outline Glow
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }
    });

    // Draw Pistil / Center Disc Glow
    const centerRadius = radius * 0.22;
    
    // Radial Gradient Glow
    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, centerRadius * 2);
    glowGrad.addColorStop(0, this.themeConfig.centerGlow);
    glowGrad.addColorStop(0.5, this.themeConfig.pistilColor);
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Solid Center Disc
    ctx.fillStyle = this.themeConfig.pistilColor;
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Stamen dots inside center
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let s = 0; s < 6; s++) {
      const sAngle = (s * Math.PI) / 3;
      const sDist = centerRadius * 0.5;
      ctx.beginPath();
      ctx.arc(Math.cos(sAngle) * sDist, Math.sin(sAngle) * sDist, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

class FloatingPetal {
  constructor(x, y, color, windForce = 3) {
    this.x = x;
    this.y = y;
    this.color = color;
    
    this.size = 5 + Math.random() * 8;
    this.vx = (Math.random() - 0.2) * 1.5 + (windForce * 0.3);
    this.vy = 0.5 + Math.random() * 1.2;
    
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.05;
    this.wobble = Math.random() * Math.PI * 2;
    
    this.opacity = 0.9;
    this.fadeSpeed = 0.003 + Math.random() * 0.004;
  }

  update(windForce = 3) {
    this.wobble += 0.05;
    this.x += this.vx + Math.sin(this.wobble) * 0.8 + (windForce * 0.2);
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    this.opacity -= this.fadeSpeed;

    return this.opacity > 0;
  }

  draw(ctx) {
    if (this.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
