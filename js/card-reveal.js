function showCardReveal(card) {
  if (window.Sound && typeof window.Sound.play === 'function') {
    window.Sound.play('card', 1.0);
  }

  // Criar overlay de tela cheia
  const overlay = document.createElement('div');
  overlay.id = 'card-reveal-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.85);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    animation: fadeIn 0.3s ease;
  `;

  const rarityColors = {
    comum:    { bg: '#e5e7eb', glow: '#9ca3af', text: '#374151', label: 'Comum' },
    raro:     { bg: '#bfdbfe', glow: '#3b82f6', text: '#1e40af', label: 'Raro' },
    epico:    { bg: '#ddd6fe', glow: '#7c3aed', text: '#4c1d95', label: 'Épico' },
    lendario: { bg: '#fde68a', glow: '#f59e0b', text: '#78350f', label: 'Lendário ✨' },
  };

  const rInput = (card.rarity || 'comum').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const rKey = rInput.includes('comum') ? 'comum' :
               rInput.includes('raro') ? 'raro' :
               (rInput.includes('epico') || rInput.includes('epica') || rInput.includes('mitic')) ? 'epico' :
               (rInput.includes('lendari') || rInput.includes('mestre') || rInput.includes('lenda')) ? 'lendario' : 'comum';

  const rarity = rarityColors[rKey] || rarityColors.comum;

  overlay.innerHTML = `
    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      @keyframes cardFlip {
        0%   { transform: perspective(600px) rotateY(90deg) scale(0.8); opacity: 0; }
        50%  { transform: perspective(600px) rotateY(-10deg) scale(1.05); opacity: 1; }
        100% { transform: perspective(600px) rotateY(0deg) scale(1); opacity: 1; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-8px); }
      }
      @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 20px ${rarity.glow}, 0 0 40px ${rarity.glow}40; }
        50%       { box-shadow: 0 0 40px ${rarity.glow}, 0 0 80px ${rarity.glow}60; }
      }
      #reveal-card {
        animation: cardFlip 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both,
                   float 3s ease-in-out 1s infinite,
                   glow-pulse 2s ease-in-out 1s infinite;
      }
    </style>

    <!-- Partículas de confete -->
    <canvas id="confetti-canvas" style="
      position: fixed; inset: 0; pointer-events: none; z-index: 10000;
    "></canvas>

    <!-- Rótulo de raridade -->
    <div style="
      background: ${rarity.bg}; color: ${rarity.text};
      padding: 6px 20px; border-radius: 20px;
      font-size: 0.9rem; font-weight: 700;
      margin-bottom: 16px; letter-spacing: 0.05em;
      text-transform: uppercase; opacity: 0;
      animation: fadeIn 0.4s ease 0.8s forwards;
    ">
      ${rarity.label}
    </div>

    <!-- Carta -->
    <div id="reveal-card" style="
      width: 220px;
      background: ${rarity.bg};
      border-radius: 20px;
      padding: 20px;
      text-align: center;
      border: 3px solid ${rarity.glow};
    ">
      <img
        src="${card.imageUrl || '/images/cards/default.png'}"
        alt="${card.name}"
        style="width: 160px; height: 160px; object-fit: contain; border-radius: 12px;"
      >
      <div style="
        font-size: 1.1rem; font-weight: 700;
        color: ${rarity.text}; margin-top: 12px;
      ">${card.name}</div>
      <div style="font-size: 0.8rem; color: ${rarity.text}88; margin-top: 4px;">
        ${card.description || 'Carta colecionável KidCanvas'}
      </div>
    </div>

    <!-- Mensagem motivacional -->
    <div style="
      color: white; font-size: 1.1rem; margin-top: 20px;
      opacity: 0; animation: fadeIn 0.4s ease 1.2s forwards;
      text-align: center;
    ">
      🎉 Você ganhou uma nova carta!
    </div>

    <!-- Botão fechar -->
    <button onclick="closeCardReveal()" style="
      margin-top: 20px; background: white; color: #333;
      border: none; border-radius: 12px; padding: 12px 32px;
      font-size: 1rem; font-weight: 600; cursor: pointer;
      opacity: 0; animation: fadeIn 0.4s ease 1.6s forwards;
    ">
      Incrível! ✨
    </button>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Disparar confetes após 0.5s
  setTimeout(() => {
    if (typeof window.launchConfetti === 'function') {
      window.launchConfetti('confetti-canvas');
    }
  }, 500);
}

function closeCardReveal() {
  const overlay = document.getElementById('card-reveal-overlay');
  if (overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

window.showCardReveal = showCardReveal;
window.closeCardReveal = closeCardReveal;
