# 🤝 Contributing to FloraMagic Wand

Thank you for your interest in contributing to **FloraMagic Wand**! We welcome bug fixes, new flower themes, performance enhancements, and UI features.

---

## 🛠️ Local Development Setup

1. **Fork or Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/flower-wand-effect.git
   cd flower-wand-effect
   ```

2. **Serve Locally**:
   Use any zero-config local HTTP server:
   ```bash
   npx serve .
   ```
   Or Python:
   ```bash
   python -m http.server 8080
   ```

3. **Open Browser**:
   Navigate to `http://localhost:8080` (or the port indicated in terminal).

---

## 📐 Coding Guidelines

- **Vanilla Stack**: Keep the core lightweight with pure HTML, CSS, and ES6 JavaScript. Avoid heavy framework dependencies.
- **CSS Tokens**: Store reusable colors, blur filters, fonts, and radii in `:root` variables inside `css/style.css`.
- **Canvas Rendering Rules**:
  - Always wrap canvas state modifications inside `ctx.save()` and `ctx.restore()`.
  - Use smooth easing interpolation (`lerp`) for pointer tracking to maintain fluid animation on high refresh rate monitors.
- **Audio Cleanliness**: Ensure all Web Audio nodes connect through `masterGain` and have explicit start/stop timestamps to avoid memory leaks.

---

## 🧪 Testing Checklist

Before submitting a Pull Request, please verify:
- [ ] Responsive UI works on desktop (1920x1080) and mobile screen sizes.
- [ ] Touch drag flower streaming functions on touchscreens / mobile browsers.
- [ ] Web Audio API initializes cleanly upon first user interaction without console warnings.
- [ ] Snapshot wallpaper export generates clean PNG files containing both background stars and flowers.
- [ ] No syntax errors or unhandled promise rejections in Browser Developer Tools Console.

---

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](../LICENSE).
