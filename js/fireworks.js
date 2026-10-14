// Feu d'artifice sur canvas : quelques fusées à la fois, qui montent doucement et explosent.
const Fireworks = (() => {
  const GRAVITY_ROCKET = 220;   // px/s² : freine la fusée pendant la montée
  const GRAVITY_SPARK = 60;     // px/s² : les étincelles retombent lentement
  const MAX_ROCKETS = 3;        // nombre maximum de fusées en l'air en même temps
  const LAUNCH_MIN = 900;       // intervalle entre deux tirs (ms)
  const LAUNCH_MAX = 1800;
  const SPARKS_MIN = 60;        // nombre d'étincelles par explosion
  const SPARKS_MAX = 90;

  let canvas, ctx, width, height;
  let rockets = [];
  let sparks = [];
  let lastTime = 0;
  let nextLaunch = 0;

  const rand = (min, max) => min + Math.random() * (max - min);

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function launch() {
    const x = rand(width * 0.15, width * 0.85);
    const targetY = rand(height * 0.12, height * 0.5);
    // Vitesse initiale calculée pour que la fusée s'arrête pile à la hauteur visée
    const vy = -Math.sqrt(2 * GRAVITY_ROCKET * (height - targetY));
    rockets.push({ x, y: height, vx: rand(-20, 20), vy, hue: rand(0, 360) });
  }

  function explode(rocket) {
    const count = Math.round(rand(SPARKS_MIN, SPARKS_MAX));
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(40, 170);
      const life = rand(1.4, 2.4);
      sparks.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        hue: rocket.hue + rand(-20, 20),
        life,
        maxLife: life,
      });
    }
  }

  function frame(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    if (time >= nextLaunch) {
      if (rockets.length < MAX_ROCKETS) launch();
      nextLaunch = time + rand(LAUNCH_MIN, LAUNCH_MAX);
    }

    // Efface en partie l'image précédente : laisse des traînées derrière chaque point,
    // tout en gardant le canvas transparent pour voir le ciel derrière
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";

    rockets = rockets.filter((r) => {
      r.vy += GRAVITY_ROCKET * dt;
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      if (r.vy >= 0) {
        explode(r);
        return false;
      }
      ctx.fillStyle = `hsl(${r.hue}, 100%, 75%)`;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });

    const drag = Math.exp(-1.2 * dt);
    sparks = sparks.filter((s) => {
      s.life -= dt;
      if (s.life <= 0) return false;
      s.vx *= drag;
      s.vy = s.vy * drag + GRAVITY_SPARK * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const alpha = s.life / s.maxLife;
      ctx.fillStyle = `hsla(${s.hue}, 100%, 65%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });

    requestAnimationFrame(frame);
  }

  function start(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
    lastTime = performance.now();
    nextLaunch = lastTime + 300;
    requestAnimationFrame(frame);
  }

  return { start };
})();
