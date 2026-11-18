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

// Mobile menu
const navLinks = document.getElementById("navLinks");
document.getElementById("menuBtn").addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

// Contact form → opens the visitor's email app (no server needed)
document.getElementById("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const subject = HR
    ? `Novi projekt: ${f.get("type")} (${f.get("name")})`
    : `New project: ${f.get("type")} (from ${f.get("name")})`;
  const body = `${f.get("message")}\n\n${f.get("name")}\n${f.get("email")}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
