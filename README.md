# 🌸 FloraMagic Wand — Interactive Flower Wand Web Experience

[![License: MIT](https://img.shields.io/badge/License-MIT-pink.svg)](LICENSE)
[![Tech Stack: HTML5 / CSS3 / ES6 / Web Audio](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20JS%20%7C%20WebAudio-00f2fe.svg)](#technology-stack)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ff4b8b.svg)](docs/CONTRIBUTING.md)

An innovative, visually breathtaking, and interactive web application where mouse/touch movements or camera hand gestures bloom procedural flowers across a cosmic starfield backdrop, accompanied by synthesized pentatonic audio chimes and shimmering particle wand trails.

---

## 🌟 Features Overview

- **🪄 Magic Wand Particle Engine**:
  - **Smooth Motion Tracking**: High-frequency lerp interpolation for silky wand movement.
  - **4 Trail Particle Styles**: *Stardust Sparkles*, *Glowing Fireflies*, *Rainbow Ribbon*, and *Crystal Shards*.
  - **Custom Wand Cursor**: Glowing starburst crystal tip radiating light trails.

- **🌸 Procedural Flower Blooming Physics**:
  - Layered petal vector geometry rendering organic bloom growth, rotation, stem growth, pistil glow, and leaf tendrils.
  - **6 Flower Themes**:
    - 🌸 **Sakura Blossom**: Soft pinks, notch petals, white pistil.
    - 🪷 **Neon Lotus**: Electric magenta, cyan pistil, pointed petals.
    - 🌹 **Enchanted Rose**: Deep crimson velvet petals, golden center.
    - 🌻 **Solar Sunflower**: Golden yellow solar leaves, seed disc center.
    - 🌌 **Prismatic Cosmos**: Shifting rainbow gradient petals.
    - 🎨 **Custom Theme**: Color picker customization for Petal, Pistil, and Leaf.
  - **Floating Petal Breeze**: Wind force physics blowing detached petals across the screen.

- **🎵 Synthesized Pentatonic Audio Chimes**:
  - Real-time Web Audio API synthesizer playing harmonic bell chimes on every bloom.
  - **Position-Pitch Mapping**: Screen Y-axis maps to musical scale pitch (higher on screen = higher chime).
  - Stereo panning based on X-axis screen position.

- **📷 MediaPipe Webcam Gesture Tracking**:
  - 👆 **Index Finger Tip**: Operates as the physical magic wand tip.
  - 🤌 **Pinch Gesture**: Triggers a burst blossom explosion.
  - ✋ **Open Palm**: Creates a gust of wind to clear petals off the canvas.

- **🌀 Auto Draw & HD Wallpaper Exporter**:
  - **Auto Draw Mode**: Automatically animates parametric rose-curve mandalas across the canvas.
  - **Save Wallpaper**: Downloads high-resolution PNG artwork of your floral composition.

---

## 🚀 Quick Start Guide

### Option 1: Live Local Development Server

1. Clone or download this repository.
2. Open terminal in the project directory:
   ```bash
   cd flower-wand-effect
   ```
3. Start a local HTTP server:
   Using Node `serve`:
   ```bash
   npx serve .
   ```
   Or using Python 3:
   ```bash
   python -m http.server 8080
   ```
4. Open your browser at `http://localhost:8080` (or `http://localhost:3000`).

### Option 2: Direct Browser Opening

Double-click `index.html` to open directly in any modern web browser (Chrome, Edge, Firefox, Safari). *Note: Camera hand tracking requires serving via HTTP/HTTPS.*

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Structure** | HTML5 Semantic Elements | App container, glassmorphism HUD, double canvas layer |
| **Styling** | Vanilla CSS3 (Custom Properties) | Glassmorphism blur backdrop, neon accents, dark cosmic themes |
| **Graphics** | HTML5 2D Canvas API | Particle engine, procedural vector flower geometry |
| **Audio** | HTML5 Web Audio API | Pentatonic chime synthesizer & sound envelopes |
| **Machine Learning** | MediaPipe Hands CDN | Real-time webcam hand tracking & gesture recognition |

---

## 📁 Directory Structure

```
flower-wand-effect/
├── index.html              # Main HTML markup and HUD overlays
├── css/
│   └── style.css           # Design tokens, glassmorphism UI & responsive styles
├── js/
│   ├── wandEngine.js       # Wand particle trail & starfield engine
│   ├── flowerRenderer.js   # Procedural flower blooms & floating petal physics
│   ├── audioSynth.js       # Web Audio API chime synthesizer
│   ├── handTracker.js      # MediaPipe camera hand gesture controller
│   └── app.js              # Master application controller & event bindings
└── docs/
    ├── ARCHITECTURE.md     # Software design & system architecture documentation
    ├── API_AND_FEATURES.md # Detailed breakdown of parameters, events, & API methods
    └── CONTRIBUTING.md     # Development & contribution guidelines
```

---

## 🎮 How to Use & Controls

1. **Move Mouse / Drag Finger**: Wave around the canvas to stream blooming flowers and wand trail sparkles.
2. **Click / Tap**: Spawns single flower or blossom burst depending on active mode.
3. **Control Panel** (Floating Glass Card):
   - **Flower Theme**: Click theme cards to switch flower aesthetics.
   - **Wand Mode**: Choose between **Stream**, **Burst**, and **Vine** weaver mode.
   - **Wand Trail Style**: Select particle style (*Stardust*, *Fireflies*, *Ribbon*, *Crystal*).
   - **Physics Sliders**: Adjust scale, density, wind force, petal count, and sound volume.
4. **Top Action Buttons**:
   - 🌀 **Auto Draw**: Toggles automatic mandala rose-curve drawing.
   - 🔊 **Sound ON/OFF**: Toggles audio synthesizer.
   - 📷 **Hand Track**: Toggles webcam gesture control.
   - 🧹 **Clear**: Clears screen with a petal breeze gust.
   - 📸 **Save Wallpaper**: Downloads high-res PNG snapshot.

---

## 📚 Documentation

For in-depth technical documentation:
- 🏗️ [Architecture Overview](docs/ARCHITECTURE.md)
- ⚙️ [API & Feature Guide](docs/API_AND_FEATURES.md)
- 🤝 [Contributing Guidelines](docs/CONTRIBUTING.md)

---

## 📄 License

This project is open-source under the [MIT License](LICENSE). Feel free to customize, remix, and share!
