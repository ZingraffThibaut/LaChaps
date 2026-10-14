const FIRST_TEXT = "Hello !";
const SECOND_TEXT = "Je crois que tu as un message";

const START_DELAY = 1500;  // le curseur clignote seul avant de commencer à écrire (ms)
const PAUSE_BEFORE_ERASE = 3000; // temps d'affichage du premier texte (ms)
const PAUSE_AFTER_ERASE = 600;   // petite pause, ligne vide, avant la phrase suivante (ms)
const BUTTON_DELAY = 800;  // délai entre la fin de la phrase et l'apparition du bouton (ms)

const MIN_SPEED = 90;      // délai minimum entre deux lettres (ms)
const MAX_SPEED = 220;     // délai maximum, pour un rythme de frappe naturel
const ERASE_SPEED = 70;    // vitesse d'effacement, un peu plus rapide et régulière

const typed = document.getElementById("typed");
const openBtn = document.getElementById("open-btn");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const typingDelay = () => MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);

async function type(text, target = typed) {
  for (const char of text) {
    target.textContent += char;
    await wait(typingDelay());
  }
}

async function erase() {
  while (typed.textContent.length > 0) {
    typed.textContent = typed.textContent.slice(0, -1);
    await wait(ERASE_SPEED);
  }
}

async function run() {
  await wait(START_DELAY);
  await type(FIRST_TEXT);
  await wait(PAUSE_BEFORE_ERASE);
  await erase();
  await wait(PAUSE_AFTER_ERASE);
  await type(SECOND_TEXT);
  await wait(BUTTON_DELAY);
  openBtn.classList.add("visible");
}

run();

// --- Ouverture du message ---
const night = document.getElementById("night");
const fireworksCanvas = document.getElementById("fireworks");
const song = document.getElementById("song");
const memory = document.getElementById("memory");
const photo = document.getElementById("photo");
const mountains = document.getElementById("mountains");
const sun = document.getElementById("sun");
const whale = document.getElementById("whale");
const palm = document.getElementById("palm");
const finale = document.getElementById("finale");
const finaleText = document.getElementById("finale-text");
const countdown = document.getElementById("countdown");
const skipBtn = document.getElementById("skip-btn");

const MEMORIES = [
  "Il y a des fêtes de la musique qu'on n'oublie pas",
  "Il y a des brunchs qu'on n'oublie pas",
  "Il y a des festivals qu'on n'oublie pas",
  "Il y a des runs qu'on n'oublie pas",
  "Il y a des week-ends qu'on n'oublie pas",
  "Il y a des repas qu'on n'oublie pas",
  "Il y a des soirées films qu'on n'oublie pas",
  "Il y a des randonnées qu'on n'oublie pas",
  "Il y a des restaurants qu'on n'oublie pas",
  "Il y a des anniversaires qu'on n'oublie pas",
  "Il y a des matinées sous la couhette qu'on n'oublie pas",
  "Il y a des concerts qu'on n'oublie pas"
];

const PHOTOS = [
  "IMG_7609.JPEG", "IMG_8058.JPEG", "IMG_8078.JPEG", "IMG_8079.JPEG",
  "IMG_8080.JPEG", "IMG_8786.JPEG", "IMG_8804.JPEG", "IMG_8809.JPEG",
  "IMG_8814.JPEG", "IMG_8861.JPEG", "IMG_8892.JPEG", "IMG_8923.JPEG",
  "IMG_8932.JPEG", "IMG_8946.JPEG",
].map((name) => `images/${name}`);

const MEMORY_START_DELAY = 1500; // après l'ouverture du ciel, avant la première phrase (ms)
const MEMORY_FADE = 1200;        // doit correspondre à la transition .memory / .photo du CSS (ms)
const MEMORY_HOLD = 3500;        // temps d'affichage de chaque phrase (ms)
const MEMORY_GAP = 600;          // écran sans texte entre deux phrases (ms)
const SCREEN_MARGIN = 24;        // distance minimale entre un élément et le bord de sa zone (px)
const TILT_MIN = 3;              // inclinaison des photos, à gauche ou à droite (degrés)
const TILT_MAX = 10;
const PHOTO_ZONE_RATIO = 0.85;   // part de sa zone (largeur et hauteur) que la photo peut occuper
const PHOTO_SHARE_LANDSCAPE = 0.5; // part de l'écran réservée à la photo, en paysage (ordinateur)
const PHOTO_SHARE_PORTRAIT = 0.65; // idem en portrait (téléphone), où la place manque
const SKY_FALLBACK = 180;        // durée du passage jour → nuit si la durée de la musique est inconnue (s)

// Couleurs du ciel (haut, bas) et du soleil au fil de la musique : 0 = début, 1 = début du final
const SKY_STOPS = [
  { at: 0,    top: "#4fa3e0", bottom: "#a8d8f0", sun: "#f9a825" }, // plein jour
  { at: 0.33, top: "#ffc93c", bottom: "#f57c00", sun: "#d84315" }, // soleil jaune
  { at: 0.66, top: "#ff8fb1", bottom: "#c2185b", sun: "#8e0e45" }, // coucher rose
  { at: 1,    top: "#000000", bottom: "#0a0a14", sun: "#3d0a24" }, // nuit
];
const SUN_HIGHEST = 0.15;        // point le plus haut de l'arc du soleil (part de la hauteur de l'écran)

const FINALE_TEXT = "Joyeux anniversaire mon chat";
const FINALE_BEFORE_END = 30;    // le final commence quand il reste ce nombre de secondes de musique
const COUNTDOWN_TARGET = new Date(2026, 9, 17, 18, 11); // samedi 17 octobre 2026, 18h11 (les mois commencent à 0)
const COUNTDOWN_DONE_TEXT = "C'est l'heure !";

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Coupe l'écran en deux (gauche/droite en paysage, haut/bas en portrait) :
// la photo va dans une partie, le texte dans l'autre, ils ne peuvent donc pas se chevaucher.
// En portrait (téléphone), la photo prend la plus grande part, le texte étant court.
// La bande des montagnes est exclue, pour que le texte blanc ne tombe jamais sur du blanc.
// Renvoie [zone de la photo, zone du texte].
function splitScreen() {
  const w = window.innerWidth;
  const h = window.innerHeight - mountains.getBoundingClientRect().height;
  const landscape = w >= h;
  const share = landscape ? PHOTO_SHARE_LANDSCAPE : PHOTO_SHARE_PORTRAIT;
  const photoFirst = Math.random() < 0.5;
  let photoZone, textZone;
  if (landscape) {
    const pw = w * share;
    photoZone = { x: photoFirst ? 0 : w - pw, y: 0, w: pw, h };
    textZone = { x: photoFirst ? pw : 0, y: 0, w: w - pw, h };
  } else {
    const ph = h * share;
    photoZone = { x: 0, y: photoFirst ? 0 : h - ph, w, h: ph };
    textZone = { x: 0, y: photoFirst ? ph : 0, w, h: h - ph };
  }
  avoidDecor(textZone);
  return [photoZone, textZone];
}

// Raccourcit la zone du texte pour qu'elle s'arrête avant la baleine et le palmier
// (texte blanc sur dessin blanc) : par le bas si le dessin est en bas de la zone, par le haut sinon.
// Les photos, elles, peuvent passer par-dessus les dessins.
function avoidDecor(zone) {
  for (const decor of [whale, palm]) {
    const box = decor.getBoundingClientRect();
    const overlapsX = zone.x < box.right && zone.x + zone.w > box.left;
    const overlapsY = zone.y < box.bottom && zone.y + zone.h > box.top;
    if (!overlapsX || !overlapsY) continue;
    if (box.top + box.height / 2 > zone.y + zone.h / 2) {
      zone.h = Math.max(0, box.top - zone.y);
    } else {
      const bottom = zone.y + zone.h;
      zone.y = Math.min(bottom, box.bottom);
      zone.h = bottom - zone.y;
    }
  }
}

// Place l'élément au hasard dans sa zone, sans en dépasser.
// tilt : inclinaison en degrés, pour tenir compte de l'encombrement de la photo penchée.
function placeInZone(el, zone, tilt = 0) {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const rad = (Math.abs(tilt) * Math.PI) / 180;
  const extraX = (w * Math.cos(rad) + h * Math.sin(rad) - w) / 2;
  const extraY = (w * Math.sin(rad) + h * Math.cos(rad) - h) / 2;
  const minLeft = zone.x + SCREEN_MARGIN + extraX;
  const minTop = zone.y + SCREEN_MARGIN + extraY;
  const maxLeft = Math.max(minLeft, zone.x + zone.w - SCREEN_MARGIN - extraX - w);
  const maxTop = Math.max(minTop, zone.y + zone.h - SCREEN_MARGIN - extraY - h);
  el.style.left = `${minLeft + Math.random() * (maxLeft - minLeft)}px`;
  el.style.top = `${minTop + Math.random() * (maxTop - minTop)}px`;
}

// Charge la photo et attend qu'elle soit prête, pour connaître sa taille avant de la placer
async function loadPhoto(src) {
  photo.src = src;
  try {
    await photo.decode();
  } catch {
    // image illisible : on la place quand même avec la taille dont on dispose
  }
}

// Le final se déclenche quand il reste FINALE_BEFORE_END secondes de musique
let finaleStarted = false;
let triggerFinale;
const finaleReached = new Promise((resolve) => { triggerFinale = resolve; });

function startFinale() {
  if (finaleStarted) return;
  finaleStarted = true;
  skipBtn.classList.add("hidden");
  triggerFinale();
}

song.addEventListener("timeupdate", () => {
  if (song.duration - song.currentTime <= FINALE_BEFORE_END) startFinale();
});

// Bouton « passer » : saute directement aux 30 dernières secondes de la musique
skipBtn.addEventListener("click", () => {
  if (Number.isFinite(song.duration)) {
    song.currentTime = Math.max(0, song.duration - FINALE_BEFORE_END);
  }
  startFinale();
});

// Compte à rebours sous le message final, mis à jour chaque seconde
function startCountdown() {
  const pad = (n) => String(n).padStart(2, "0");
  function update() {
    const remaining = Math.max(0, COUNTDOWN_TARGET - Date.now());
    if (remaining === 0) {
      countdown.textContent = COUNTDOWN_DONE_TEXT;
      return;
    }
    const s = Math.floor(remaining / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    countdown.textContent = `${days} j ${pad(hours)} h ${pad(minutes)} min ${pad(s % 60)} s`;
    setTimeout(update, 1000 - (Date.now() % 1000));
  }
  update();
  countdown.classList.add("visible");
}

// Attend la durée demandée, ou moins si le final arrive entre-temps
const waitOrFinale = (ms) => Promise.race([wait(ms), finaleReached]);

async function showFinale() {
  photo.classList.remove("visible");
  memory.classList.remove("visible");
  await wait(MEMORY_FADE + MEMORY_GAP);
  finale.classList.add("visible");
  await wait(START_DELAY);
  await type(FINALE_TEXT, finaleText);
  await wait(BUTTON_DELAY);
  startCountdown();
}

// Une phrase et une photo à la fois, dans un ordre aléatoire, sans répétition avant d'avoir tout montré
async function showMemories() {
  await waitOrFinale(MEMORY_START_DELAY);
  let textQueue = [];
  let photoQueue = [];
  while (!finaleStarted) {
    if (textQueue.length === 0) textQueue = shuffle(MEMORIES);
    if (photoQueue.length === 0) photoQueue = shuffle(PHOTOS);

    const [photoZone, textZone] = splitScreen();
    const tilt = (TILT_MIN + Math.random() * (TILT_MAX - TILT_MIN)) * (Math.random() < 0.5 ? -1 : 1);

    // Aussi grande que possible tout en tenant dans sa zone, même penchée
    photo.style.maxWidth = `${photoZone.w * PHOTO_ZONE_RATIO}px`;
    photo.style.maxHeight = `${photoZone.h * PHOTO_ZONE_RATIO}px`;
    await loadPhoto(photoQueue.shift());
    photo.style.setProperty("--tilt", `${tilt}deg`);
    placeInZone(photo, photoZone, tilt);

    memory.textContent = textQueue.shift();
    memory.style.maxWidth = `${textZone.w - 2 * SCREEN_MARGIN}px`;
    placeInZone(memory, textZone);

    photo.classList.add("visible");
    memory.classList.add("visible");
    await waitOrFinale(MEMORY_FADE + MEMORY_HOLD);
    photo.classList.remove("visible");
    memory.classList.remove("visible");
    await waitOrFinale(MEMORY_FADE + MEMORY_GAP);
  }
  await showFinale();
}

// Mélange deux couleurs "#rrggbb" : t = 0 donne a, t = 1 donne b
function mixColors(a, b, t) {
  const channel = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const rgb = [0, 1, 2].map((i) => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t));
  return `rgb(${rgb.join(", ")})`;
}

// Le soleil se lève derrière les montagnes à gauche, monte en arc et se couche à droite
function placeSun(p) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const horizon = h - mountains.getBoundingClientRect().height * 0.15;
  const x = w * (0.06 + 0.88 * p);
  const y = horizon - Math.sin(Math.PI * p) * (horizon - h * SUN_HIGHEST);
  sun.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
}

// Fait évoluer le ciel en suivant la musique, pour qu'il fasse nuit au début du final.
// Si la durée de la musique est inconnue, on se base sur le temps écoulé.
function startSky() {
  const startTime = performance.now();
  function update() {
    const dayLength = song.duration - FINALE_BEFORE_END;
    const progress = dayLength > 0
      ? song.currentTime / dayLength
      : (performance.now() - startTime) / 1000 / SKY_FALLBACK;
    const p = finaleStarted ? 1 : Math.min(Math.max(progress, 0), 1);
    const next = SKY_STOPS.findIndex((stop) => stop.at >= p);
    const to = SKY_STOPS[Math.max(next, 1)];
    const from = SKY_STOPS[Math.max(next, 1) - 1];
    const t = (p - from.at) / (to.at - from.at);
    night.style.setProperty("--sky-top", mixColors(from.top, to.top, t));
    night.style.setProperty("--sky-bottom", mixColors(from.bottom, to.bottom, t));
    night.style.setProperty("--sun-color", mixColors(from.sun, to.sun, t));
    placeSun(p);
    if (p < 1) requestAnimationFrame(update);
  }
  update();
}

openBtn.addEventListener("click", () => {
  openBtn.disabled = true;

  // Lancée pendant le clic : les navigateurs bloquent le son qui ne démarre pas suite à une action de l'utilisateur
  song.play().catch(() => {});

  // Le ciel démarre exactement à la forme du bouton...
  const r = openBtn.getBoundingClientRect();
  const top = r.top;
  const right = window.innerWidth - r.right;
  const bottom = window.innerHeight - r.bottom;
  const left = r.left;
  night.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${r.height / 2}px)`;
  night.style.visibility = "visible";

  // ...puis s'étend jusqu'aux bords de l'écran (on force un reflow pour que la transition parte bien de là)
  night.getBoundingClientRect();
  night.classList.add("open");

  night.addEventListener("transitionend", () => {
    startSky();
    Fireworks.start(fireworksCanvas);
    showMemories();
  }, { once: true });
});
