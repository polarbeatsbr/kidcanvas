function showDrawingComplete(drawing, starsEarned) {
  if (window.Sound && typeof window.Sound.play === 'function') {
    window.Sound.play('complete', 0.8);
  }

  const modal = document.createElement('div');
  modal.id = 'drawing-complete-modal';
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 9998;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.3s ease;
  `;

  modal.innerHTML = `
    <canvas id="complete-confetti" style="
      position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    "></canvas>

    <div style="
      background: white; border-radius: 24px;
      padding: 32px 28px; max-width: 360px; width: 90%;
      text-align: center; position: relative; z-index: 10000;
      animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
      <style>
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes wiggle {
          0%,100% { transform: rotate(0deg); }
          25%      { transform: rotate(-8deg); }
          75%      { transform: rotate(8deg); }
        }
      </style>

      <!-- Mascote Perigo comemorando -->
      <img
        src="/images/mascots/perigo-feliz.png"
        alt="MC Perigo comemorando"
        style="
          width: 100px; margin-bottom: 8px;
          animation: wiggle 0.6s ease 0.5s 3;
        "
      >

      <h2 style="color: #7c3aed; font-size: 1.6rem; margin: 0 0 8px;">
        Incrível! 🎉
      </h2>
      <p style="color: #555; margin: 0 0 20px;">
        Você terminou o desenho <strong>${drawing.title || drawing.name || 'Novo Desenho'}</strong>!
      </p>

      <!-- Estrelas ganhas -->
      <div style="
        background: #fef3c7; border-radius: 16px;
        padding: 16px; margin-bottom: 20px;
        display: flex; align-items: center; justify-content: center; gap: 8px;
      ">
        <span style="font-size: 1.8rem;">⭐</span>
        <div>
          <div style="font-size: 1.4rem; font-weight: 700; color: #92400e;">
            +${starsEarned} estrelas!
          </div>
          <div style="font-size: 0.8rem; color: #a16207;">
            Continue pintando para ganhar mais!
          </div>
        </div>
      </div>

      <!-- Preview do desenho finalizado -->
      <img
        id="completed-drawing-preview"
        style="
          width: 100%; border-radius: 12px;
          border: 2px solid #e5e7eb; margin-bottom: 20px;
          max-height: 200px; object-fit: contain;
        "
        alt="Seu desenho finalizado"
      >

      <!-- Botões de ação -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button onclick="saveAndShare()" style="
          background: #7c3aed; color: white; border: none;
          border-radius: 12px; padding: 14px; font-size: 1rem;
          font-weight: 600; cursor: pointer; width: 100%;
        ">
          💾 Salvar na Galeria
        </button>
        <button onclick="downloadDrawing()" style="
          background: #f0fdf4; color: #16a34a; border: 2px solid #bbf7d0;
          border-radius: 12px; padding: 12px; font-size: 0.95rem;
          font-weight: 600; cursor: pointer; width: 100%;
        ">
          📥 Baixar Desenho
        </button>
        <button onclick="closeDrawingComplete(); paintNewDrawing()" style="
          background: none; color: #7c3aed; border: none;
          font-size: 0.9rem; cursor: pointer; padding: 8px;
        ">
          🎨 Pintar outro desenho
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Capturar preview do canvas atual
  const canvas = document.getElementById('drawing-canvas');
  if (canvas) {
    document.getElementById('completed-drawing-preview').src = canvas.toDataURL('image/jpeg', 0.8);
  }

  // Disparar confetes
  setTimeout(() => {
    if (typeof window.launchConfetti === 'function') {
      window.launchConfetti('complete-confetti');
    }
  }, 200);

  // Animar contador de estrelas no header
  if (starsEarned > 0) {
    setTimeout(() => {
      const currentStars = (window.currentUser && window.currentUser.stars) || 0;
      if (typeof window.animateStarCounter === 'function') {
        window.animateStarCounter(currentStars + starsEarned, starsEarned);
      }
    }, 600);
  }
}

function closeDrawingComplete() {
  const modal = document.getElementById('drawing-complete-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

// Global functions for buttons in modal
window.saveAndShare = function() {
    closeDrawingComplete();
    const btnSave = document.getElementById('btn-save-drawing');
    if (btnSave) btnSave.click();
};

window.downloadDrawing = function() {
    const btnDl = document.getElementById('btn-download-drawing');
    if (btnDl) btnDl.click();
};

window.paintNewDrawing = function() {
    window.location.hash = '#/categorias';
};

window.showDrawingComplete = showDrawingComplete;
window.closeDrawingComplete = closeDrawingComplete;
