const SEO_CONFIG = {
  default: {
    title: 'KidCanvas — Pintura e Histórias Mágicas para Crianças',
    description: 'Mais de 14.000 desenhos para colorir online, histórias geradas por IA e cartas colecionáveis. Grátis para começar!',
    image: 'https://kidcanvas.com.br/images/og/home.jpg',
  },
  routes: {
    '/': {
      title: 'KidCanvas — Pintura e Histórias Mágicas para Crianças',
      description: 'Mais de 14.000 desenhos para colorir online, histórias geradas por IA e cartas colecionáveis. Grátis para começar!',
    },
    '/galeria': {
      title: 'Galeria de Desenhos para Colorir — KidCanvas',
      description: 'Escolha entre milhares de desenhos para colorir: animais, dinossauros, super-heróis, princesas e muito mais!',
    },
    '/categorias': {
      title: 'Categorias de Desenhos para Colorir — KidCanvas',
      description: 'Escolha entre milhares de desenhos para colorir: animais, dinossauros, super-heróis, princesas e muito mais!',
    },
    '/historias': {
      title: 'Histórias Mágicas com IA — KidCanvas',
      description: 'Crie histórias personalizadas com inteligência artificial. Seu filho é o herói da aventura!',
    },
    '/planos': {
      title: 'Planos KidCanvas — Família, Ultra e Escola',
      description: 'Escolha o plano ideal para sua família. Acesso ilimitado a desenhos, histórias com IA e cartas colecionáveis.',
    },
    '/perfil': {
      title: 'Meu Perfil — KidCanvas',
      description: 'Veja suas conquistas, coleção de cartas e histórias criadas.',
    },
  },
};

function updateSEO(path, customData = {}) {
  const routeConfig = SEO_CONFIG.routes[path] || SEO_CONFIG.default;
  const config = { ...SEO_CONFIG.default, ...routeConfig, ...customData };

  // Title
  document.title = config.title;

  // Meta description
  setMeta('name', 'description', config.description);

  // Canonical
  setLink('canonical', `https://kidcanvas.com.br${path}`);

  // Open Graph
  setMeta('property', 'og:title', config.title);
  setMeta('property', 'og:description', config.description);
  setMeta('property', 'og:url', `https://kidcanvas.com.br${path}`);
  setMeta('property', 'og:image', config.image || SEO_CONFIG.default.image);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', 'KidCanvas');
  setMeta('property', 'og:locale', 'pt_BR');

  // Twitter Card
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', config.title);
  setMeta('name', 'twitter:description', config.description);
  setMeta('name', 'twitter:image', config.image || SEO_CONFIG.default.image);
}

// Para categorias dinâmicas de desenhos
function updateDrawingSEO(category, count) {
  updateSEO(`/galeria/${category}`, {
    title: `Desenhos de ${capitalize(category)} para Colorir — KidCanvas`,
    description: `${count} desenhos de ${category} para colorir online de graça. Perfeito para crianças de 3 a 12 anos!`,
  });
}

// Para desenho específico
function updateSingleDrawingSEO(drawing) {
  updateSEO(`/pintar/${drawing.id}`, {
    title: `Colorir ${drawing.title} — KidCanvas`,
    description: `Pinte ${drawing.title} online de graça! Mais de 14.000 desenhos para colorir no KidCanvas.`,
    image: drawing.thumbnailUrl || SEO_CONFIG.default.image,
  });

  // Schema.org para o desenho
  let schemaEl = document.getElementById('schema-drawing');
  if (!schemaEl) {
    schemaEl = document.createElement('script');
    schemaEl.id = 'schema-drawing';
    schemaEl.type = 'application/ld+json';
    document.head.appendChild(schemaEl);
  }

  schemaEl.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": `Desenho para colorir: ${drawing.title}`,
    "description": `Desenho de ${drawing.title} para colorir online gratuitamente no KidCanvas`,
    "url": `https://kidcanvas.com.br/pintar/${drawing.id}`,
    "thumbnailUrl": drawing.thumbnailUrl,
    "author": {
      "@type": "Organization",
      "name": "KidCanvas"
    },
    "educationalUse": "Atividade criativa infantil",
    "audience": {
      "@type": "Audience",
      "audienceType": "Crianças"
    }
  });
}

function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

window.updateSEO = updateSEO;
window.updateDrawingSEO = updateDrawingSEO;
window.updateSingleDrawingSEO = updateSingleDrawingSEO;
