const form = document.querySelector("#orderForm");
const note = document.querySelector("#formNote");
const whatsappPhone = "79160342553";
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const partyCanvas = document.querySelector("#partyCanvas");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const staticPreview = new URLSearchParams(window.location.search).has("static");

if (staticPreview) {
  document.documentElement.classList.add("static-preview");
}

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
}

function formatDate(value) {
  if (!value) return "не указана";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 45, 240)}ms`;
    observer.observe(item);
  });
}

function setupHeroLight() {
  if (!hero || reduceMotion.matches || staticPreview) return;

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty("--mx", `${x}%`);
    hero.style.setProperty("--my", `${y}%`);
    hero.style.setProperty("--stage-x", `${((x - 50) * -0.11).toFixed(2)}px`);
    hero.style.setProperty("--stage-y", `${((y - 50) * -0.09).toFixed(2)}px`);
  });
}

function setupPartyCanvas() {
  if (!partyCanvas || !hero || reduceMotion.matches || staticPreview) return;

  const context = partyCanvas.getContext("2d");
  const colors = ["#d77a8f", "#f3c7d2", "#bd9a62", "#b8dcca", "#fff0d8", "#ffffff"];
  const particles = [];
  let width = 0;
  let height = 0;
  let rafId = 0;
  let lastFrame = 0;
  let running = false;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.7);
    const rect = partyCanvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    partyCanvas.width = Math.round(width * ratio);
    partyCanvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function addParticle(x, y, burst = false) {
    const angle = burst ? Math.random() * Math.PI * 2 : Math.PI / 2 + (Math.random() - 0.5) * 0.65;
    const speed = burst ? 1.8 + Math.random() * 4.2 : 0.35 + Math.random() * 1.25;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: burst ? 4 + Math.random() * 8 : 2 + Math.random() * 5,
      rotate: Math.random() * Math.PI,
      rotateSpeed: (Math.random() - 0.5) * 0.18,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.56 ? "sprinkle" : "petal",
      life: 0,
      ttl: burst ? 58 + Math.random() * 42 : 100 + Math.random() * 72
    });
  }

  function burstAt(x, y, count = 24) {
    for (let index = 0; index < count; index += 1) {
      addParticle(x, y, true);
    }
    start();
  }

  function drawParticle(particle) {
    const progress = particle.life / particle.ttl;
    const alpha = Math.max(0, 1 - progress);

    context.save();
    context.globalAlpha = alpha;
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotate);
    context.fillStyle = particle.color;

    if (particle.shape === "sprinkle") {
      context.fillRect(-particle.size * 0.72, -particle.size * 0.16, particle.size * 1.45, particle.size * 0.32);
    } else {
      context.beginPath();
      context.ellipse(0, 0, particle.size * 0.62, particle.size, 0, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }

  function tick(timestamp = 0) {
    if (timestamp - lastFrame < 33) {
      rafId = window.requestAnimationFrame(tick);
      return;
    }

    lastFrame = timestamp;
    context.clearRect(0, 0, width, height);

    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.life += 1;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.025;
      particle.vx *= 0.994;
      particle.rotate += particle.rotateSpeed;
      drawParticle(particle);

      if (particle.life > particle.ttl || particle.y > height + 40) {
        particles.splice(index, 1);
      }
    }

    if (particles.length) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      running = false;
      context.clearRect(0, 0, width, height);
    }
  }

  function start() {
    if (running) return;
    running = true;
    lastFrame = 0;
    rafId = window.requestAnimationFrame(tick);
  }

  hero.addEventListener("pointerenter", () => {
    burstAt(width * 0.72, height * 0.45, 18);
  });

  hero.addEventListener("pointermove", (event) => {
    if (Math.random() > 0.1) return;
    const rect = partyCanvas.getBoundingClientRect();
    burstAt(event.clientX - rect.left, event.clientY - rect.top, 2);
  });

  document.querySelectorAll(".primary-button").forEach((button) => {
    button.addEventListener("pointerenter", () => {
      const heroRect = hero.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      burstAt(
        buttonRect.left - heroRect.left + buttonRect.width * 0.62,
        buttonRect.top - heroRect.top + buttonRect.height * 0.5,
        18
      );
    });
  });

  resize();
  burstAt(width * 0.7, height * 0.48, 24);

  window.addEventListener("resize", resize);
  window.addEventListener("beforeunload", () => window.cancelAnimationFrame(rafId));
}

function setupTiltCards() {
  if (reduceMotion.matches || staticPreview) return;

  document.querySelectorAll(".gallery-item, .moment-collage figure").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

function scrollToHashTarget() {
  if (!window.location.hash) return;

  const target = document.querySelector(window.location.hash);
  if (!target) return;

  requestAnimationFrame(() => {
    target.scrollIntoView({ block: "start" });
  });
}

updateHeader();
setupReveal();
setupHeroLight();
setupPartyCanvas();
setupTiltCards();
scrollToHashTarget();
window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("load", () => {
  scrollToHashTarget();
  window.setTimeout(scrollToHashTarget, 250);
  window.setTimeout(scrollToHashTarget, 900);
});
window.addEventListener("hashchange", scrollToHashTarget);

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const name = data.get("name")?.toString().trim();
  const phone = data.get("phone")?.toString().trim();
  const eventType = data.get("eventType")?.toString().trim();
  const date = formatDate(data.get("date")?.toString());
  const guests = data.get("guests")?.toString().trim() || "не указано";
  const budget = data.get("budget")?.toString().trim() || "пока не знаю";
  const details = data.get("details")?.toString().trim() || "не указано";

  const message = [
    "Здравствуйте, Анастасия! Хочу рассчитать заказ Ivanova Desserts.",
    "",
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `Повод: ${eventType}`,
    `Дата события: ${date}`,
    `Количество гостей: ${guests}`,
    `Бюджет: ${budget}`,
    `Пожелания: ${details}`
  ].join("\n");

  const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
  note.textContent = "Открываю WhatsApp с готовым сообщением.";
  window.open(url, "_blank", "noopener,noreferrer");
});
