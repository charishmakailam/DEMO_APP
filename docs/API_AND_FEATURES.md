# ⚙️ FloraMagic Wand — API & Feature Specifications

This reference manual documents the parameters, state configurations, themes, synthesizer options, and extensibility hooks in **FloraMagic Wand**.

---

## 🎨 Theme Specifications (`FlowerTheme`)

Flower themes define the visual aesthetic of generated blooms. You can retrieve or extend themes using `FlowerTheme.getTheme(name, customColors)`.

### Built-in Themes

| Theme Key | Display Name | Petal Shape | Petal Colors | Pistil Color | Scale Note Series |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sakura` | Sakura Blossom | `notched` | `#ffd1dc`, `#ff9ebb`, `#ff4b8b` | `#ffffff` | C Major Pentatonic |
| `lotus` | Neon Lotus | `pointed` | `#c084fc`, `#a855f7`, `#ec4899`, `#3b82f6` | `#00f2fe` | A Minor Pentatonic |
| `rose` | Enchanted Rose | `rose` | `#fb7185`, `#f43f5e`, `#e11d48`, `#881337` | `#fde047` | D Minor Pentatonic |
| `sunflower` | Solar Sunflower | `sunflower` | `#fef08a`, `#fde047`, `#eab308`, `#f97316` | `#451a03` | E Lydian Pentatonic |
| `cosmos` | Prismatic Cosmos | `cosmos` | `#38bdf8`, `#818cf8`, `#c084fc`, `#f472b6` | `#ffffff` | F Sharp Pentatonic |
| `custom` | Custom Palette | `notched` | Dynamic User Input | Dynamic User Input | C Major Pentatonic |

---

## 🔊 Audio Synthesizer API (`AudioSynthesizer`)

The Web Audio API synthesizer generates harmonic chime tones when flowers blossom.

### Methods

#### `audioSynth.init()`
Initializes the `AudioContext` and master gain nodes.

#### `audioSynth.setTheme(themeName)`
Switches the active pentatonic scale mapping to match the selected flower theme (`'sakura'`, `'lotus'`, `'rose'`, `'sunflower'`, `'cosmos'`).

#### `audioSynth.setVolume(volPercent)`
Sets master volume level (0 to 100).

#### `audioSynth.toggleMute()`
Toggles master audio output on or off. Returns boolean `isMuted`.

#### `audioSynth.playFlowerBloomSound(x, y, width, height, scale)`
* **`x, y`** *(number)*: Screen pixel coordinates of the newly spawned flower.
* **`width, height`** *(number)*: Total canvas dimensions.
* **`scale`** *(number)*: Bloom scale factor.
* **Behavior**:
  - Calculates pitch based on normalized Y position (`1 - y / height`).
  - Applies stereo panning based on X position (`(x / width) * 2 - 1`).
  - Triggers dual sine/triangle oscillator voice with exponential decay.

---

## 🛠️ Adding a New Custom Theme

To add a new preset theme to FloraMagic Wand, update `FlowerTheme` in `js/flowerRenderer.js`:

```javascript
// Example: Adding a "Midnight Violet" theme
FlowerTheme.violet = {
  name: 'Midnight Violet',
  petalColors: ['#a7f3d0', '#34d399', '#059669'],
  pistilColor: '#fbbf24',
  centerGlow: '#f59e0b',
  leafColor: '#10b981',
  stemColor: 'rgba(16, 185, 129, 0.6)',
  petalShape: 'pointed',
  defaultPetals: 10
};
```

Then add the corresponding button in `index.html`:

```html
<button class="theme-card" data-theme="violet">
  <span class="theme-icon">🌿</span>
  <span class="theme-label">Violet</span>
</button>
```

---

## 📷 MediaPipe Hand Tracking Gestures

| Gesture | Detection Rule | Action |
| :--- | :--- | :--- |
| **Wand Tip Tracking** | Landmark 8 (Index Tip) | Smoothly moves wand position (`targetX`, `targetY`) across screen. |
| **Pinch Burst** | distance(Landmark 8, Landmark 4) < 0.06 | Spawns a ring burst explosion of multi-scale flowers at finger tip. |
| **Open Palm Clear** | Index, Middle, Ring & Pinky tips all extended above wrist | Clears screen with a gust of wind blowing petals away. |
