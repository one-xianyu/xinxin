(() => {
  "use strict";

  const scene = document.querySelector("#love-scene");
  const canvas = document.querySelector("#heart-canvas");
  const context = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const music = document.querySelector("#bg-music");
  const musicButton = document.querySelector("#music-button");
  const musicLabel = document.querySelector("#music-label");
  const musicStatus = document.querySelector("#music-status");
  const loveButton = document.querySelector("#love-button");
  const loveButtonLabel = document.querySelector("#love-button-label");
  const loveMessage = document.querySelector("#love-message");

  musicButton.hidden = false;
  loveButton.hidden = false;

  async function playMusic() {
    try {
      await music.play();
    } catch {
      musicStatus.textContent = "音乐暂时无法播放，请再试一次。";
      musicLabel.textContent = "再试一次";
    }
  }

  function updateMusicButton() {
    const isPlaying = !music.paused;
    musicButton.classList.toggle("is-playing", isPlaying);
    musicButton.setAttribute("aria-pressed", String(isPlaying));
    musicLabel.textContent = isPlaying ? "音乐播放中" : "播放音乐";
  }

  musicButton.addEventListener("click", () => {
    if (music.paused) {
      playMusic();
    } else {
      music.pause();
    }
  });
  music.addEventListener("play", updateMusicButton);
  music.addEventListener("pause", updateMusicButton);
  music.addEventListener("error", () => {
    musicLabel.textContent = "音乐加载失败";
    musicStatus.textContent = "背景音乐加载失败，请稍后重试。";
  });

  if (!context) return;

  const colors = ["#ff4f8b", "#ff6f9f", "#ff8fb5", "#ffb0ca", "#ffd1df"];
  const sprites = colors.map((color) => {
    const sprite = document.createElement("canvas");
    sprite.width = 24;
    sprite.height = 24;
    const spriteContext = sprite.getContext("2d");
    const gradient = spriteContext.createRadialGradient(12, 12, 0, 12, 12, 12);
    gradient.addColorStop(0, "#fff7fb");
    gradient.addColorStop(0.16, color);
    gradient.addColorStop(0.48, color);
    gradient.addColorStop(1, "rgba(255,60,130,0)");
    spriteContext.fillStyle = gradient;
    spriteContext.fillRect(0, 0, 24, 24);
    return sprite;
  });

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let centerX = 0;
  let centerY = 0;
  let heartSize = 0;
  let animationFrame = null;
  let lastTime = 0;
  let heartParticles = [];
  let stars = [];
  let floatingHearts = [];
  const bursts = [];

  function createHeartParticles() {
    const count = width < 600 ? 560 : 900;
    heartParticles = Array.from({ length: count }, (_, index) => {
      const angle = Math.random() * Math.PI * 2;
      const edge = index < count * 0.58;
      const radius = edge ? 0.84 + Math.random() * 0.16 : Math.sqrt(Math.random()) * 0.9;
      const x = 16 * Math.sin(angle) ** 3;
      const y = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
      return {
        x: (x / 17) * radius,
        y: (-y / 17) * radius,
        size: 1.1 + Math.random() * 2.6,
        alpha: 0.35 + Math.random() * 0.65,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.1,
        sprite: sprites[Math.floor(Math.random() * sprites.length)]
      };
    });
  }

  function createAmbient() {
    stars = Array.from({ length: width < 600 ? 45 : 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.35 + Math.random() * 1.15,
      alpha: 0.12 + Math.random() * 0.42,
      phase: Math.random() * Math.PI * 2
    }));

    floatingHearts = Array.from({ length: width < 600 ? 11 : 17 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 3 + Math.random() * 7,
      speed: 7 + Math.random() * 13,
      drift: 8 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.1 + Math.random() * 0.25,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }

  function resizeCanvas() {
    const rect = scene.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    centerX = width / 2;
    centerY = height * (height < 650 ? 0.39 : 0.42);
    heartSize = Math.min(width * 0.33, height * 0.35, 235);
    createHeartParticles();
    createAmbient();
    if (reducedMotion.matches) drawFrame(0, 0);
  }

  function drawHeart(x, y, size, color, alpha) {
    context.save();
    context.translate(x, y);
    context.scale(size / 30, size / 30);
    context.beginPath();
    context.moveTo(0, 10);
    context.bezierCurveTo(-28, -7, -15, -28, 0, -13);
    context.bezierCurveTo(15, -28, 28, -7, 0, 10);
    context.fillStyle = color;
    context.globalAlpha = alpha;
    context.fill();
    context.restore();
  }

  function drawBackground(time, delta) {
    for (const star of stars) {
      const twinkle = reducedMotion.matches ? 1 : 0.65 + Math.sin(time * 0.0015 + star.phase) * 0.35;
      context.globalAlpha = star.alpha * twinkle;
      context.fillStyle = "#ffe4ee";
      context.beginPath();
      context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      context.fill();
    }

    for (const heart of floatingHearts) {
      if (!reducedMotion.matches) heart.y -= heart.speed * delta;
      if (heart.y < -20) {
        heart.y = height + 20;
        heart.x = Math.random() * width;
      }
      const x = heart.x + Math.sin(time * 0.0007 + heart.phase) * heart.drift;
      drawHeart(x, heart.y, heart.size, heart.color, heart.alpha);
    }
  }

  function drawMainHeart(time) {
    const pulse = reducedMotion.matches ? 1 : 1 + Math.sin(time * 0.0032) * 0.025 + Math.sin(time * 0.0064) * 0.009;
    const halo = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, heartSize * 1.45);
    halo.addColorStop(0, "rgba(255,65,132,0.13)");
    halo.addColorStop(0.5, "rgba(229,39,111,0.07)");
    halo.addColorStop(1, "rgba(180,20,80,0)");
    context.globalAlpha = 1;
    context.fillStyle = halo;
    context.fillRect(centerX - heartSize * 1.5, centerY - heartSize * 1.5, heartSize * 3, heartSize * 3);

    context.globalCompositeOperation = "lighter";
    for (const particle of heartParticles) {
      const shimmer = reducedMotion.matches ? 1 : 0.82 + Math.sin(time * 0.001 * particle.speed + particle.phase) * 0.18;
      const drift = reducedMotion.matches ? 0 : Math.sin(time * 0.0013 + particle.phase) * 0.9;
      const x = centerX + particle.x * heartSize * pulse + drift;
      const y = centerY + particle.y * heartSize * pulse + drift * 0.5;
      const size = particle.size * 3.1;
      context.globalAlpha = particle.alpha * shimmer;
      context.drawImage(particle.sprite, x - size / 2, y - size / 2, size, size);
    }
    context.globalCompositeOperation = "source-over";
  }

  function drawBursts(delta) {
    for (let index = bursts.length - 1; index >= 0; index -= 1) {
      const particle = bursts[index];
      particle.life -= delta;
      if (particle.life <= 0) {
        bursts.splice(index, 1);
        continue;
      }
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += 13 * delta;
      drawHeart(particle.x, particle.y, particle.size, particle.color, Math.min(1, particle.life * 2));
    }
  }

  function drawFrame(time, delta) {
    context.clearRect(0, 0, width, height);
    drawBackground(time, delta);
    drawMainHeart(time);
    drawBursts(delta);
    context.globalAlpha = 1;
  }

  function animate(time) {
    const delta = Math.min((time - lastTime) / 1000 || 0, 0.04);
    lastTime = time;
    drawFrame(time, delta);
    animationFrame = window.requestAnimationFrame(animate);
  }

  function startAnimation() {
    window.cancelAnimationFrame(animationFrame);
    lastTime = 0;
    if (reducedMotion.matches || document.hidden) {
      animationFrame = null;
      drawFrame(0, 0);
    } else {
      animationFrame = window.requestAnimationFrame(animate);
    }
  }

  function addBurst(x, y, count) {
    if (reducedMotion.matches) return;
    const available = Math.max(0, 90 - bursts.length);
    for (let index = 0; index < Math.min(count, available); index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 95;
      bursts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 35,
        size: 5 + Math.random() * 9,
        life: 0.7 + Math.random() * 0.75,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  const messages = [
    "欣欣，我喜欢你。想和你分享日常，也期待每一次见面。",
    "不是突然兴起，是每次想到你，都会再心动一次。",
    "想把今天的开心讲给你，想把明天的期待留给你。",
    "我们可以慢慢了解，慢慢靠近，慢慢把喜欢说给对方听。",
    "下一次见面，想光明正大地站在你身边。",
    "遇见你以后，平凡的日子也开始值得期待。"
  ];
  let messageIndex = -1;

  loveButton.addEventListener("click", () => {
    messageIndex = (messageIndex + 1) % messages.length;
    loveMessage.textContent = messages[messageIndex];
    loveButtonLabel.textContent = "再心动一次";
    loveMessage.classList.remove("is-changing");
    if (!reducedMotion.matches) {
      void loveMessage.offsetWidth;
      loveMessage.classList.add("is-changing");
    }
    addBurst(centerX, centerY, 44);
    if (music.paused) playMusic();
  });

  scene.addEventListener("pointerdown", (event) => {
    if (!event.target.closest("button")) addBurst(event.clientX, event.clientY, 14);
  });

  document.addEventListener("visibilitychange", startAnimation);
  reducedMotion.addEventListener("change", startAnimation);
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  startAnimation();
  document.body.classList.add("canvas-ready");
})();
