/**
 * FloraMagic Wand - Webcam MediaPipe Hand Tracking
 * Detects index finger position as wand tip, pinch gesture for burst bloom, and open palm for wind clear.
 */

class HandTracker {
  constructor(onWandMove, onPinchBurst, onPalmClear) {
    this.onWandMove = onWandMove;
    this.onPinchBurst = onPinchBurst;
    this.onPalmClear = onPalmClear;

    this.videoElement = document.getElementById('webcamVideo');
    this.debugCanvas = document.getElementById('cameraDebugCanvas');
    this.debugCtx = this.debugCanvas ? this.debugCanvas.getContext('2d') : null;
    this.pipModal = document.getElementById('cameraPip');
    this.pipStatus = document.getElementById('pipStatus');

    this.hands = null;
    this.camera = null;
    this.isActive = false;

    this.lastPinchTime = 0;
    this.lastPalmTime = 0;
  }

  async toggleCamera() {
    if (this.isActive) {
      this.stop();
      return false;
    } else {
      return await this.start();
    }
  }

  async start() {
    if (!window.Hands || !window.Camera) {
      if (this.pipStatus) this.pipStatus.textContent = "MediaPipe library not loaded.";
      alert("Camera hand tracking library is still loading or blocked. Please check your internet connection.");
      return false;
    }

    try {
      if (this.pipStatus) this.pipStatus.textContent = "Requesting camera permission...";
      if (this.pipModal) this.pipModal.style.display = 'flex';

      // Initialize MediaPipe Hands
      this.hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });

      this.hands.onResults((results) => this.handleHandResults(results));

      // Setup Camera Utility
      this.camera = new Camera(this.videoElement, {
        onFrame: async () => {
          if (this.isActive && this.hands) {
            await this.hands.send({ image: this.videoElement });
          }
        },
        width: 640,
        height: 480
      });

      await this.camera.start();
      this.isActive = true;
      if (this.pipStatus) this.pipStatus.textContent = "Tracking hand gestures!";
      return true;

    } catch (err) {
      console.error("Camera access error:", err);
      if (this.pipStatus) this.pipStatus.textContent = "Camera access denied or failed.";
      this.stop();
      return false;
    }
  }

  stop() {
    this.isActive = false;
    if (this.camera) {
      try { this.camera.stop(); } catch(e) {}
      this.camera = null;
    }
    if (this.hands) {
      try { this.hands.close(); } catch(e) {}
      this.hands = null;
    }
    if (this.pipModal) this.pipModal.style.display = 'none';
  }

  handleHandResults(results) {
    if (!this.debugCtx || !this.isActive) return;

    // Clear debug canvas
    this.debugCtx.save();
    this.debugCtx.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);
    this.debugCtx.drawImage(results.image, 0, 0, this.debugCanvas.width, this.debugCanvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      // Draw skeleton on PIP
      this.drawLandmarksOnDebug(landmarks);

      // Landmark 8 = Index Finger Tip
      const indexTip = landmarks[8];
      // Landmark 4 = Thumb Tip
      const thumbTip = landmarks[4];
      // Landmark 0 = Wrist, 12 = Middle Tip, 16 = Ring Tip, 20 = Pinky Tip
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];
      const wrist = landmarks[0];

      // Screen Mirror X coordinate (webcam is mirrored)
      const screenX = (1 - indexTip.x) * window.innerWidth;
      const screenY = indexTip.y * window.innerHeight;

      // Trigger Wand Movement
      if (this.onWandMove) {
        this.onWandMove(screenX, screenY);
      }

      // Check Pinch Gesture (Distance between Thumb & Index Tip)
      const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
      if (pinchDist < 0.06 && Date.now() - this.lastPinchTime > 400) {
        this.lastPinchTime = Date.now();
        if (this.pipStatus) this.pipStatus.textContent = "🤌 Pinch Detected! Burst Bloom!";
        if (this.onPinchBurst) this.onPinchBurst(screenX, screenY);
      }

      // Check Open Palm Gesture (All finger tips extended high above wrist)
      const isOpenPalm = (indexTip.y < wrist.y) && (middleTip.y < wrist.y) && (ringTip.y < wrist.y) && (pinkyTip.y < wrist.y);
      const palmSpan = Math.hypot(indexTip.x - pinkyTip.x, indexTip.y - pinkyTip.y);

      if (isOpenPalm && palmSpan > 0.35 && Date.now() - this.lastPalmTime > 1500) {
        this.lastPalmTime = Date.now();
        if (this.pipStatus) this.pipStatus.textContent = "✋ Open Palm! Blowing Breeze!";
        if (this.onPalmClear) this.onPalmClear();
      }

    } else {
      if (this.pipStatus) this.pipStatus.textContent = "Wave your hand in front of camera";
    }

    this.debugCtx.restore();
  }

  drawLandmarksOnDebug(landmarks) {
    const ctx = this.debugCtx;
    const w = this.debugCanvas.width;
    const h = this.debugCanvas.height;

    ctx.fillStyle = '#00f2fe';
    landmarks.forEach((lm) => {
      ctx.beginPath();
      ctx.arc((1 - lm.x) * w, lm.y * h, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Highlight Index Tip (Wand)
    const indexTip = landmarks[8];
    ctx.fillStyle = '#ff4b8b';
    ctx.shadowColor = '#ff4b8b';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc((1 - indexTip.x) * w, indexTip.y * h, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}
