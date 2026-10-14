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

openBtn.addEventListener("click", () => {
  openBtn.disabled = true;

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

  night.addEventListener("transitionend", () => Fireworks.start(fireworksCanvas), { once: true });
});
