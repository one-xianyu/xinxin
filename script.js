(() => {
  "use strict";

  const music = document.querySelector("#bg-music");
  const musicButton = document.querySelector("#music-button");
  const musicLabel = document.querySelector("#music-label");
  const musicSymbol = document.querySelector("#music-symbol");
  const musicStatus = document.querySelector("#music-status");
  const heartContainer = document.querySelector("#falling-hearts");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const activeHearts = new Set();
  const MAX_HEARTS = 24;

  musicButton.hidden = false;

  function updateMusicButton() {
    const isPlaying = !music.paused;
    musicButton.setAttribute("aria-pressed", String(isPlaying));
    musicLabel.textContent = isPlaying ? "暂停 Dear D" : "播放 Dear D";
    musicSymbol.textContent = isPlaying ? "Ⅱ" : "♪";
  }

  musicButton.addEventListener("click", async () => {
    if (!music.paused) {
      music.pause();
      return;
    }

    try {
      await music.play();
    } catch {
      musicStatus.textContent = "音乐暂时无法播放，请再试一次。";
    }
  });
  music.addEventListener("play", updateMusicButton);
  music.addEventListener("pause", updateMusicButton);
  music.addEventListener("error", () => {
    musicStatus.textContent = "背景音乐加载失败，请稍后重试。";
  });

  function removeHeart(heart) {
    if (!activeHearts.has(heart)) return;
    window.clearTimeout(heart.cleanupTimer);
    activeHearts.delete(heart);
    heart.remove();
  }

  function createHeart() {
    if (reducedMotion.matches || document.hidden) return;
    if (activeHearts.size >= MAX_HEARTS) {
      removeHeart(activeHearts.values().next().value);
    }

    const heart = document.createElement("span");
    const duration = 4 + Math.random() * 3;
    heart.className = "fall-heart";
    heart.textContent = "♥";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${14 + Math.random() * 12}px`;
    heart.style.setProperty("--fall-duration", `${duration}s`);
    heart.style.setProperty("--fall-drift", `${(Math.random() - 0.5) * 90}px`);
    heart.addEventListener("animationend", () => removeHeart(heart), { once: true });
    activeHearts.add(heart);
    heartContainer.append(heart);
    heart.cleanupTimer = window.setTimeout(() => removeHeart(heart), (duration + 0.3) * 1000);
  }

  window.setInterval(createHeart, 350);
})();
