(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const letterToggle = document.querySelector("#letter-toggle");
  const letterContent = document.querySelector("#letter-content");
  const letterToggleText = letterToggle.querySelector("span");

  letterContent.hidden = true;
  letterToggle.hidden = false;
  letterToggle.setAttribute("aria-expanded", "false");

  letterToggle.addEventListener("click", () => {
    const willOpen = letterToggle.getAttribute("aria-expanded") === "false";
    letterToggle.setAttribute("aria-expanded", String(willOpen));
    letterToggleText.textContent = willOpen ? "收好这封信" : "拆开这封信";
    letterContent.hidden = !willOpen;

    if (willOpen && !reducedMotion.matches) {
      letterContent.classList.remove("is-opening");
      void letterContent.offsetWidth;
      letterContent.classList.add("is-opening");
    } else {
      letterContent.classList.remove("is-opening");
    }
  });

  const quotes = [
    "今天的晚霞很好看，第一反应是想分享给你。",
    "不是什么特别的日子，只是突然有点想你。",
    "下一次见面，想把最近攒下的故事都讲给你听。",
    "和你聊天的时候，再普通的小事也变得有趣。",
    "不用刻意找话题，和你待在一起就很开心。",
    "今天也偷偷期待，能在你的日常里多出现一点。",
    "把这句话留给你：遇见你，是最近的开心事。"
  ];
  const quoteText = document.querySelector("#quote-text");
  const quoteNext = document.querySelector("#quote-next");
  const quotePause = document.querySelector("#quote-pause");
  let quoteIndex = 0;
  let quoteTimer = null;
  let quotesPaused = reducedMotion.matches;

  function updateQuote() {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * quotes.length);
    } while (nextIndex === quoteIndex);

    quoteIndex = nextIndex;
    quoteText.textContent = quotes[quoteIndex];
    quoteText.classList.remove("is-changing");
    if (!reducedMotion.matches) {
      void quoteText.offsetWidth;
      quoteText.classList.add("is-changing");
    }
  }

  function stopQuotes() {
    window.clearInterval(quoteTimer);
    quoteTimer = null;
  }

  function startQuotes() {
    stopQuotes();
    if (!quotesPaused && !document.hidden) {
      quoteTimer = window.setInterval(updateQuote, 7500);
    }
  }

  function updatePauseButton() {
    quotePause.setAttribute("aria-pressed", String(quotesPaused));
    quotePause.textContent = quotesPaused ? "继续轮播" : "暂停轮播";
  }

  quoteNext.hidden = false;
  quotePause.hidden = false;
  updatePauseButton();
  startQuotes();

  quoteNext.addEventListener("click", () => {
    updateQuote();
    startQuotes();
  });

  quotePause.addEventListener("click", () => {
    quotesPaused = !quotesPaused;
    updatePauseButton();
    startQuotes();
  });

  document.addEventListener("visibilitychange", startQuotes);
  reducedMotion.addEventListener("change", (event) => {
    quotesPaused = event.matches;
    updatePauseButton();
    startQuotes();
  });

  const heartButton = document.querySelector("#heart-button");
  const heartLayer = document.querySelector("#heart-layer");
  const birthdayMessage = document.querySelector("#birthday-message");
  const activeHearts = new Set();
  const heartColors = ["#b96f75", "#d79291", "#e5aca5", "#c98588", "#e2b5a2"];
  const wishes = [
    "愿你的 24 岁，有更多松一口气的时刻，也有很多发自内心的笑。",
    "愿你收到好消息，也遇见小惊喜，喜欢的日子慢慢变多。",
    "愿每一次分享都有回应，每一次期待都值得。",
    "今天负责开心就好，剩下的愿望，让新的一岁慢慢实现。"
  ];
  let wishIndex = 0;
  const MAX_HEARTS = 24;

  function removeHeart(heart) {
    if (!activeHearts.has(heart)) return;
    window.clearTimeout(heart.cleanupTimer);
    activeHearts.delete(heart);
    heart.remove();
  }

  function addHeart(x, y, index, isReduced) {
    while (activeHearts.size >= MAX_HEARTS) {
      removeHeart(activeHearts.values().next().value);
    }

    const heart = document.createElement("span");
    const delay = isReduced ? 0 : index * 45;
    heart.className = "heart-particle";
    heart.textContent = "♥";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--heart-color", heartColors[Math.floor(Math.random() * heartColors.length)]);
    heart.style.setProperty("--heart-size", `${16 + Math.random() * 16}px`);
    heart.style.setProperty("--heart-drift", `${(Math.random() - 0.5) * 140}px`);
    heart.style.setProperty("--heart-lift", `${90 + Math.random() * 110}px`);
    heart.style.setProperty("--heart-rotate", `${(Math.random() - 0.5) * 50}deg`);
    heart.style.setProperty("--heart-delay", `${delay}ms`);
    heart.addEventListener("animationend", () => removeHeart(heart), { once: true });
    activeHearts.add(heart);
    heartLayer.append(heart);
    heart.cleanupTimer = window.setTimeout(() => removeHeart(heart), (isReduced ? 650 : 1900) + delay);
  }

  heartButton.hidden = false;
  heartButton.addEventListener("click", () => {
    wishIndex = (wishIndex + 1) % wishes.length;
    birthdayMessage.textContent = wishes[wishIndex];

    const rect = heartButton.getBoundingClientRect();
    const isReduced = reducedMotion.matches;
    const count = isReduced ? 3 : 8;
    for (let index = 0; index < count; index += 1) {
      const x = isReduced
        ? rect.left + rect.width / 2 + (index - 1) * 26
        : rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.7;
      addHeart(x, rect.top + 8, index, isReduced);
    }
  });
})();
