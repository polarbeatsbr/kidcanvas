function launchConfetti(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ['#f97316', '#7c3aed', '#16a34a', '#fbbf24', '#3b82f6', '#ec4899'];
  const particles = [];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      gravity: 0.08,
      opacity: 1,
    });
  }

  let frame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotSpeed;
      if (p.y > canvas.height * 0.7) p.opacity -= 0.02;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }

    if (alive) {
      frame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  if (window.Sound && typeof window.Sound.play === 'function') {
    window.Sound.play('confetti', 0.5);
  }
  frame = requestAnimationFrame(animate);

  // Limpar após 4 segundos
  setTimeout(() => {
    cancelAnimationFrame(frame);
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 4000);
}

window.launchConfetti = launchConfetti;
