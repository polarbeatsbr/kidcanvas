const SOUNDS = {
  click:        '/sounds/click.mp3',
  paint:        '/sounds/paint-brush.mp3',
  bucket:       '/sounds/bucket-fill.mp3',
  star:         '/sounds/star-collect.mp3',
  card:         '/sounds/card-reveal.mp3',
  achievement:  '/sounds/achievement.mp3',
  complete:     '/sounds/drawing-complete.mp3',
  error:        '/sounds/error.mp3',
  levelUp:      '/sounds/level-up.mp3',
  confetti:     '/sounds/confetti.mp3',
};

class SoundManager {
  constructor() {
    this.muted = localStorage.getItem('kc_sound_muted') === 'true';
    this.cache = {};
    this.context = null;
  }

  init() {
    // Criar AudioContext na primeira interação do usuário (requisito do browser)
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  async preload(keys) {
    for (const key of keys) {
      if (!this.cache[key] && SOUNDS[key]) {
        const audio = new Audio(SOUNDS[key]);
        audio.load();
        this.cache[key] = audio;
      }
    }
  }

  play(key, volume = 1.0) {
    if (this.muted) return;
    const src = SOUNDS[key];
    if (!src) return;

    // Criar nova instância para permitir sobreposição de sons
    const audio = new Audio(src);
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.play().catch(() => {}); // ignorar erros de autoplay silenciosamente
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('kc_sound_muted', this.muted);
    return this.muted;
  }
}

window.Sound = new SoundManager();

// Pré-carregar sons mais usados após primeira interação
document.addEventListener('click', () => {
  window.Sound.init();
  window.Sound.preload(['click', 'paint', 'star', 'complete']);
}, { once: true });

window.toggleSound = function() {
  if (window.Sound) {
    const muted = window.Sound.toggleMute();
    const btn = document.getElementById('btn-sound-toggle');
    if (btn) {
      btn.textContent = muted ? '🔇' : '🔊';
      btn.title = muted ? 'Ativar sons' : 'Silenciar sons';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-sound-toggle');
  if (btn && window.Sound) {
    btn.textContent = window.Sound.muted ? '🔇' : '🔊';
    btn.title = window.Sound.muted ? 'Ativar sons' : 'Silenciar sons';
  }
});

