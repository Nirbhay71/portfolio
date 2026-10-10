const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav__toggle");
const links = [...document.querySelectorAll(".nav__links a")];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Light / dark toggle (defaults to the OS setting, remembers the visitor's choice)
const root = document.documentElement;
const systemDark = matchMedia("(prefers-color-scheme: dark)");
document.querySelector(".theme-toggle").addEventListener("click", () => {
  const isDark = root.dataset.theme ? root.dataset.theme === "dark" : systemDark.matches;
  root.dataset.theme = isDark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});

// Nav background once the page scrolls
const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 20);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
links.forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));

// Highlight the nav link for the section in view
const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => s && spy.observe(s));

// Count-up for stats
const countUp = (el) => {
  const target = +el.dataset.count;
  const decimals = +(el.dataset.decimals || 0);
  if (reduceMotion) return (el.textContent = target.toFixed(decimals));
  const start = performance.now();
  const dur = 1400;
  const tick = (t) => {
    const p = Math.min((t - start) / dur, 1);
    el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

// Reveal-on-scroll
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      e.target.querySelectorAll("[data-count]").forEach(countUp);
      io.unobserve(e.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Project filters
const filterButtons = [...document.querySelectorAll(".filters button")];
const works = [...document.querySelectorAll(".work")];
filterButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filterButtons.forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-pressed", b === btn);
    });
    works.forEach((w) => {
      const show = f === "all" || w.dataset.cat.split(" ").includes(f);
      w.classList.toggle("is-hidden", !show);
      if (show) w.classList.add("is-in");
    });
  })
);
