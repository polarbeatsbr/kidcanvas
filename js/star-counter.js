function animateStarCounter(newTotal, gained) {
  const counter = document.getElementById('star-count');
  if (!counter) return;

  const start = newTotal - gained;
  const end = newTotal;
  const duration = 800;
  const startTime = performance.now();

  // Efeito de pulso no ícone de estrela
  const starIcon = document.getElementById('star-icon');
  if (starIcon) {
    starIcon.style.transform = 'scale(1.4)';
    starIcon.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    setTimeout(() => { starIcon.style.transform = 'scale(1)'; }, 300);
  }

  // Mostrar "+N" flutuando
  showFloatingPoints(`+${gained}⭐`, counter);

  // Animar o número
  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing: começa rápido, termina devagar
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (end - start) * eased);

    counter.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      counter.textContent = end;
      if (window.Sound && typeof window.Sound.play === 'function') {
        window.Sound.play('star', 0.6);
      }
    }
  }

  requestAnimationFrame(updateCounter);
}

function showFloatingPoints(text, anchor) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `
    position: fixed;
    font-size: 1.4rem;
    font-weight: 700;
    color: #f59e0b;
    pointer-events: none;
    z-index: 9000;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    animation: floatUp 1.2s ease forwards;
  `;

  // Adicionar keyframes se ainda não existir
  if (!document.getElementById('float-up-style')) {
    const style = document.createElement('style');
    style.id = 'float-up-style';
    style.textContent = `
      @keyframes floatUp {
        0%   { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-60px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Posicionar perto do contador
  const rect = anchor.getBoundingClientRect();
  el.style.left = `${rect.left + rect.width / 2}px`;
  el.style.top = `${rect.top - 10}px`;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

window.animateStarCounter = animateStarCounter;
window.showFloatingPoints = showFloatingPoints;
