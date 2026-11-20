const CONTACT_EMAIL = "contact@nulldex.net";
const HR = document.documentElement.lang === "hr";

// Language switch: remember the visitor's choice (the server reads this cookie)
document.querySelectorAll("[data-lang]").forEach(a => a.addEventListener("click", () => {
  document.cookie = `lang=${a.dataset.lang}; path=/; max-age=31536000; SameSite=Lax`;
}));

// Year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Dark is the brand default; light is optional (remembered per visitor)
const root = document.documentElement;
document.getElementById("themeToggle").addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});

// Smooth scroll only on in-page link clicks (not on refresh)
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
  const id = a.getAttribute("href");
  const target = id === "#top" ? document.body : document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  history.replaceState(null, "", id === "#top" ? location.pathname : id);
}));

// ===== Self-typing code editor in the hero =====
const SNIPPETS = [
  { file: "studio.js", code:
`// nulldex — ${HR ? "gradimo od nule" : "building from null"}
const studio = new Nulldex({ mode: "focused" });

studio.build({
  website: "fast",
  app: "useful",
  game: "fun",
});

while (ideas.length) {
  const project = ideas.shift();
  studio.ship(project); // ${HR ? "objavljeno" : "deployed"}
}` },
  { file: "style.css", code:
`/* ${HR ? "neka izgleda dobro" : "make it look good"} */
.website {
  speed: instant;
  layout: responsive;
  vibe: clean;
}

.client:hover {
  smile: true;
}` },
  { file: "game.js", code:
`// ${HR ? "mala petlja igre" : "tiny game loop"}
function update(player) {
  player.x += player.speed;

  if (player.hitsWall()) {
    player.bounce();
    score += 100;
  }

  requestAnimationFrame(() => update(player));
}` },
];

const typedEl = document.getElementById("typed");
const fileEl = document.getElementById("codeFile");
const TOKENS = /(\/\/.*$|\/\*[\s\S]*?(?:\*\/|$))|("(?:[^"\\\n]|\\.)*"?)|\b(const|let|new|while|if|return|function|true|false)\b|\b(\d+)\b|([A-Za-z_$][\w$]*)(?=\s*\()/gm;

function highlight(src) {
  const esc = src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc.replace(TOKENS, (m, c, s, k, n, f) =>
    c ? `<span class="tk-c">${c}</span>` :
    s ? `<span class="tk-s">${s}</span>` :
    k ? `<span class="tk-k">${k}</span>` :
    n ? `<span class="tk-n">${n}</span>` :
        `<span class="tk-f">${f}</span>`);
}

function render(text, caret = true) {
  const lines = highlight(text).split("\n");
  if (caret) lines[lines.length - 1] += '<span class="caret"></span>';
  typedEl.innerHTML = lines.map(l => `<span class="line">${l || " "}</span>`).join("");
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function typeLoop() {
  let i = 0;
  while (true) {
    const { file, code } = SNIPPETS[i % SNIPPETS.length];
    fileEl.textContent = file;
    typedEl.parentElement.classList.remove("fading");
    for (let n = 1; n <= code.length; n++) {
      render(code.slice(0, n));
      const ch = code[n - 1];
      let d = 28 + Math.random() * 55;
      if (ch === "\n") d += 140;
      else if (/[;{},]/.test(ch)) d += 60;
      if (Math.random() < 0.03) d += 300; // little "thinking" pauses
      await sleep(d);
    }
    await sleep(2600);
    typedEl.parentElement.classList.add("fading");
    await sleep(550);
    i++;
  }
}

if (typedEl) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) render(SNIPPETS[0].code, false);
  else typeLoop();
}

// Mobile menu (slides in; closes on link click, outside click or Escape)
const navLinks = document.getElementById("navLinks");
const menuBtn = document.getElementById("menuBtn");
const setMenu = open => { navLinks.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open)); };
menuBtn.addEventListener("click", e => { e.stopPropagation(); setMenu(!navLinks.classList.contains("open")); });
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("click", e => { if (!navLinks.contains(e.target)) setMenu(false); });
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

// ===== Custom dropdown =====
// Replaces the browser's own option list (which can't be styled) with one in the site's style.
// The real <select> stays in the form, so the value is submitted as before.
function enhanceSelect(select) {
  const wrap = document.createElement("div");
  wrap.className = "dd";
  select.replaceWith(wrap);
  wrap.append(select);
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");

  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "dd-btn";
  btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false");
  const label = document.createElement("span");
  btn.append(label);
  btn.insertAdjacentHTML("beforeend", '<svg class="dd-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');

  const list = document.createElement("ul");
  list.className = "dd-list"; list.setAttribute("role", "listbox");
  const opts = [...select.options].map((o, i) => {
    const li = document.createElement("li");
    li.className = "dd-opt"; li.setAttribute("role", "option"); li.textContent = o.text; li.dataset.i = i;
    li.addEventListener("click", () => { choose(i); close(); btn.focus(); });
    li.addEventListener("mousemove", () => highlight(i));
    list.append(li);
    return li;
  });
  wrap.append(btn, list);

  let active = select.selectedIndex;
  function sync() {
    label.textContent = select.options[select.selectedIndex].text;
    opts.forEach((li, i) => li.setAttribute("aria-selected", String(i === select.selectedIndex)));
  }
  function highlight(i) { active = i; opts.forEach((li, j) => li.classList.toggle("active", j === i)); }
  function choose(i) { select.selectedIndex = i; select.dispatchEvent(new Event("change", { bubbles: true })); sync(); }
  function open() { wrap.classList.add("open"); btn.setAttribute("aria-expanded", "true"); highlight(select.selectedIndex); }
  function close() { wrap.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
  const isOpen = () => wrap.classList.contains("open");

  btn.addEventListener("click", () => (isOpen() ? close() : open()));
  btn.addEventListener("keydown", e => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen()) return open();
      highlight((active + (e.key === "ArrowDown" ? 1 : opts.length - 1)) % opts.length);
    } else if (e.key === "Enter" || e.key === " ") {
      if (isOpen()) { e.preventDefault(); choose(active); close(); }
    } else if (e.key === "Escape" || e.key === "Tab") close();
  });
  document.addEventListener("click", e => { if (!wrap.contains(e.target)) close(); });
  select.form?.addEventListener("reset", () => setTimeout(sync)); // after sending, show the default again
  sync();
}
document.querySelectorAll(".form select").forEach(enhanceSelect);

// ===== Gentle fade-up as sections scroll into view =====
// Runs once per element. Anything already on screen when the page loads is left alone (no load flicker).
if (!reduceMotion && "IntersectionObserver" in window) {
  const groups = [".section-head", ".projects > .project", ".cards > .card", ".steps > li", ".contact > *"];
  const io = new IntersectionObserver(entries => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const el = en.target;
      io.unobserve(el);
      el.classList.add("in");
      // hand the element back to its normal styles (e.g. card hover lift) once the fade is done
      setTimeout(() => { el.classList.remove("reveal", "in"); el.style.removeProperty("--d"); }, 1300);
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  for (const sel of groups) {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (el.getBoundingClientRect().top < innerHeight) return; // visible at load: no animation
      el.classList.add("reveal");
      el.style.setProperty("--d", `${Math.min(i, 4) * 70}ms`); // items in a row arrive one after another
      io.observe(el);
    });
  }
}

// Contact form → sends to the Nulldex inbox; falls back to the visitor's email app if that fails
const T = HR
  ? { sending: "Šaljem…", sent: "Hvala! Poruka je poslana, javit ću vam se unutar 24 sata.", error: "Slanje nije uspjelo, otvaram vašu aplikaciju za e-poštu…" }
  : { sending: "Sending…", sent: "Thanks! Your message was sent. I'll get back to you within 24 hours.", error: "Couldn't send, opening your email app instead…" };

const form = document.getElementById("contactForm");
const note = document.getElementById("formNote");
form.addEventListener("submit", async e => {
  e.preventDefault();
  const f = new FormData(form);
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true; note.textContent = T.sending; note.className = "form-note";
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(f), lang: HR ? "hr" : "en" }),
    });
    if (res.status === 400) { note.textContent = (await res.json()).error; note.className = "form-note form-error"; return; }
    if (!res.ok) throw new Error(res.status);
    form.reset();
    note.textContent = T.sent; note.className = "form-note form-ok";
  } catch (err) {
    note.textContent = T.error; note.className = "form-note form-error";
    const subject = HR
      ? `Novi projekt: ${f.get("type")} (${f.get("name")})`
      : `New project: ${f.get("type")} (from ${f.get("name")})`;
    const body = `${f.get("message")}\n\n${f.get("name")}\n${f.get("email")}`;
    setTimeout(() => {
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 900);
  } finally {
    btn.disabled = false;
  }
});
