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

async function type(text) {
  for (const char of text) {
    typed.textContent += char;
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

const MEMORIES = [
  "Il y a des fêtes de la musique qu'on n'oublie pas",
  "Il y a des brunchs qu'on n'oublie pas",
  "Il y a des festivals qu'on n'oublie pas",
  "Il y a des runs qu'on n'oublie pas",
  "Il y a des week-ends qu'on n'oublie pas",
  "Il y a des repas qu'on n'oublie pas",
  "Il y a des soirées films qu'on n'oublie pas",
  "Il y a des randonnées qu'on n'oublie pas",
];

const PHOTOS = [
  "IMG_7609.JPEG", "IMG_8058.JPEG", "IMG_8078.JPEG", "IMG_8079.JPEG",
  "IMG_8080.JPEG", "IMG_8786.JPEG", "IMG_8804.JPEG", "IMG_8809.JPEG",
  "IMG_8814.JPEG", "IMG_8861.JPEG", "IMG_8892.JPEG", "IMG_8923.JPEG",
  "IMG_8932.JPEG", "IMG_8946.JPEG",
].map((name) => `images/${name}`);

const MEMORY_START_DELAY = 1500; // après l'ouverture de l'écran noir, avant la première phrase (ms)
const MEMORY_FADE = 1200;        // doit correspondre à la transition .memory / .photo du CSS (ms)
const MEMORY_HOLD = 3500;        // temps d'affichage de chaque phrase (ms)
const MEMORY_GAP = 600;          // écran sans texte entre deux phrases (ms)
const SCREEN_MARGIN = 24;        // distance minimale entre un élément et le bord de sa zone (px)
const TILT_MIN = 3;              // inclinaison des photos, à gauche ou à droite (degrés)
const TILT_MAX = 10;

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Coupe l'écran en deux moitiés (gauche/droite en paysage, haut/bas en portrait) :
// la photo va dans l'une, le texte dans l'autre, ils ne peuvent donc pas se chevaucher.
function splitScreen() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const halves = w >= h
    ? [{ x: 0, y: 0, w: w / 2, h }, { x: w / 2, y: 0, w: w / 2, h }]
    : [{ x: 0, y: 0, w, h: h / 2 }, { x: 0, y: h / 2, w, h: h / 2 }];
  return Math.random() < 0.5 ? halves : halves.reverse();
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

// Une phrase et une photo à la fois, dans un ordre aléatoire, sans répétition avant d'avoir tout montré
async function showMemories() {
  await wait(MEMORY_START_DELAY);
  let textQueue = [];
  let photoQueue = [];
  while (true) {
    if (textQueue.length === 0) textQueue = shuffle(MEMORIES);
    if (photoQueue.length === 0) photoQueue = shuffle(PHOTOS);

    const [photoZone, textZone] = splitScreen();
    const tilt = (TILT_MIN + Math.random() * (TILT_MAX - TILT_MIN)) * (Math.random() < 0.5 ? -1 : 1);

    await loadPhoto(photoQueue.shift());
    photo.style.setProperty("--tilt", `${tilt}deg`);
    placeInZone(photo, photoZone, tilt);

    memory.textContent = textQueue.shift();
    memory.style.maxWidth = `${textZone.w - 2 * SCREEN_MARGIN}px`;
    placeInZone(memory, textZone);

    photo.classList.add("visible");
    memory.classList.add("visible");
    await wait(MEMORY_FADE + MEMORY_HOLD);
    photo.classList.remove("visible");
    memory.classList.remove("visible");
    await wait(MEMORY_FADE + MEMORY_GAP);
  }
}

openBtn.addEventListener("click", () => {
  openBtn.disabled = true;

  // Lancée pendant le clic : les navigateurs bloquent le son qui ne démarre pas suite à une action de l'utilisateur
  song.play().catch(() => {});

  // L'écran noir démarre exactement à la forme du bouton...
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
    Fireworks.start(fireworksCanvas);
    showMemories();
  }, { once: true });
});
