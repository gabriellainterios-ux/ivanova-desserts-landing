const form = document.querySelector("#orderForm");
const note = document.querySelector("#formNote");
const whatsappPhone = "79160342553";
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
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
