/* ==========================================================================
   LÓGICA PRINCIPAL DO SITE KIDCANVAS.COM.BR
   Roteador SPA, Galeria 100% Grátis, Busca Global, Auto-Sugestões e Downloads
   ========================================================================== */

// --- BASE DE DADOS DAS CATEGORIAS (12 ITENS) ---
const CATEGORIES_DATA = {
    'novidades': { name: 'Novidades', emoji: '✨', desc: 'Desenhos fresquinhos adicionados nos últimos 30 dias para você pintar primeiro!' },
    'animais-selvagens': { name: 'Animais Selvagens', emoji: '🦁', desc: 'Leões, pandas, girafas e outros bichos incríveis da floresta e da savana!' },
    'animais-do-mar': { name: 'Animais do Mar', emoji: '🦈', desc: 'Peixes coloridos, baleias, golfinhos e tubarões divertidos do oceano!' },
    'animais-domesticos': { name: 'Animais Domésticos', emoji: '🐱', desc: 'Gatinhos, cachorrinhos, coelhos e outros amiguinhos que temos em casa!' },
    'dinossauros': { name: 'Dinossauros', emoji: '🦖', desc: 'T-rex, Tricerátops, Velociraptores e outros gigantes pré-históricos!' },
    'contos-de-fada': { name: 'Contos de Fada', emoji: '👑', desc: 'Castelos mágicos, princesas, fadas e dragões encantados!' },
    'espaco': { name: 'Espaço Sideral', emoji: '🚀', desc: 'Foguetes, astronautas, planetas e alienígenas amigáveis!' },
    'natureza': { name: 'Natureza e Flores', emoji: '🌻', desc: 'Flores sorridentes, borboletas, lagos e a beleza das florestas!' },
    'veiculos': { name: 'Veículos e Carros', emoji: '🚗', desc: 'Carros velozes, aviões, trens e caminhões de bombeiro!' },
    'comidas-e-doces': { name: 'Comidas e Doces', emoji: '🍩', desc: 'Sorvetes gostosos, bolos de aniversário e frutas felizes!' },
    'cotidiano': { name: 'Cotidiano', emoji: '🧸', desc: 'Brinquedos, parquinhos, atividades e diversão do dia a dia!' },
    'fantasia': { name: 'Fantasia', emoji: '🦄', desc: 'Unicórnios mágicos, sereias cantando e monstros fofos!' },
    'profissoes': { name: 'Profissões', emoji: '👩‍🚒', desc: 'Bombeiros, médicos, professores e todas as profissões legais!' },
    'unicornios': { name: 'Unicórnios', emoji: '🦄', desc: 'Unicórnios mágicos, asas brilhantes e arco-íris encantados!' },
    'festa-junina': { name: 'Festa Junina', emoji: '🤠', desc: 'Fogueira, pipoca, bandeirinhas e toda a alegria das festas caipiras!' },
    'datas-comemorativas': { name: 'Datas Comemorativas', emoji: '🎄', desc: 'Desenhos para o Natal, Páscoa, Dia das Crianças e momentos especiais!' },
    'alfabeto-e-numeros': { name: 'Alfabeto e Números', emoji: '🔤', desc: 'Letras de A-Z e números de 0-9 grandes e vazados para pintar e aprender!' },
    'futebol': { name: 'Futebol', emoji: '⚽', desc: 'Bolas de futebol, traves, jogadores animados e a emoção do gol!' },
    'princesas': { name: 'Princesas', emoji: '👸', desc: 'Princesas fofas, vestidos bonitos e tiaras brilhantes em reinos mágicos!' },
    'super-herois': { name: 'Super-Heróis', emoji: '🦸', desc: 'Super-heróis e super-heroínas corajosos em aventuras incríveis!' },
    'frutas-e-legumes': { name: 'Frutas e Legumes', emoji: '🍎', desc: 'Frutinhas felizes, vegetais saudáveis e comidinhas divertidas!' },
    'flores': { name: 'Flores', emoji: '🌸', desc: 'Flores lindas, jardins floridos, girassóis e rosas para colorir!' },
    'paper-doll': { name: 'Bonecas de Papel', emoji: '✂️', desc: 'Bonecas de papel com roupas e acessórios divertidos para colorir e recortar!' }
};

const POPULAR_SUGGESTIONS = ['unicórnio', 'dinossauro', 'borboleta', 'leão', 'golfinho'];

// --- POOL DE FRASES POR CATEGORIA ---
const CATEGORY_PHRASES = {};

// --- ESTADO GLOBAL DA APLICAÇÃO ---
let allDrawings = [];
let lastSelectedPhrase = "";
let currentDrawingPhrase = "";

// --- INICIALIZAÇÃO ---
window.addEventListener('DOMContentLoaded', async () => {
    await loadDrawings();
    initGlobalEventListeners();
    initSearchAutocomplete();
    
    // Roteamento inicial baseado na URL atual
    navigate(window.location.pathname, false);
});

// --- CARREGAMENTO DE DESENHOS ---
async function loadDrawings() {
    try {
        const response = await fetch('/api/drawings');
        const data = await response.json();
        
        if (data.success && data.drawings) {
            allDrawings = data.drawings;
            
            // Atualizar contadores globais de desenhos na interface
            document.querySelectorAll('.drawing-total-counter').forEach(el => {
                el.innerHTML = `${allDrawings.length}`;
            });
        }
    } catch (error) {
        console.error('Erro ao buscar desenhos da biblioteca:', error);
        showToast('Não foi possível carregar o acervo. Tentando novamente...', 'error');
    }
}

// --- ROTEAMENTO SPA (CLIENT-SIDE ROUTING) ---
function initGlobalEventListeners() {
    // Interceptar cliques em links locais para fazer transição SPA
    document.addEventListener('click', (e) => {
        const targetLink = e.target.closest('a');
        if (targetLink) {
            const href = targetLink.getAttribute('href');
            
            // Interceptar apenas links locais válidos (não externos ou âncoras vazias)
            if (href && href.startsWith('/') && !href.startsWith('//')) {
                e.preventDefault();
                navigate(href);
            }
        }
    });
    
    // Escutar eventos de voltar/avançar no navegador
    window.addEventListener('popstate', () => {
        navigate(window.location.pathname, false);
    });
    
    // Configurar o gatilho da busca mobile na barra inferior
    const mobileSearchTrigger = document.getElementById('mobile-nav-search-trigger');
    if (mobileSearchTrigger) {
        mobileSearchTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            const globalSearch = document.getElementById('global-search-input');
            if (globalSearch) {
                globalSearch.focus();
                globalSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Remover as classes de controle de impressão após concluir ou cancelar a janela de impressão
    window.addEventListener('afterprint', () => {
        document.body.classList.remove('print-no-border');
        document.body.classList.remove('print-with-border');
    });
}

function navigate(path, pushState = true) {
    let cleanPath = path.trim();
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
    }
    
    // Ocultar todas as views de página
    document.querySelectorAll('.page-view').forEach(view => {
        view.style.display = 'none';
    });
    
    // Fechar dropdowns de sugestão de busca abertos
    closeAllSuggestions();
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Roteamento
    if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '') {
        renderHomeView();
    } else if (cleanPath === '/categorias') {
        renderCategoriasView();
    } else if (cleanPath === '/top50') {
        renderTop50View();
    } else if (cleanPath === '/politica-de-privacidade') {
        renderPoliticaPrivacidadeView();
    } else if (cleanPath.startsWith('/categoria/')) {
        const categorySlug = cleanPath.replace('/categoria/', '');
        renderCategoriaDetalheView(categorySlug);
    } else {
        // Possível rota de desenho individual: /:categoria-slug/:desenho-slug
        const parts = cleanPath.split('/').filter(p => p !== '');
        if (parts.length === 2 && CATEGORIES_DATA[parts[0]]) {
            renderDesenhoIndividualView(parts[0], parts[1]);
        } else {
            // Rota não encontrada -> Redirecionar para home
            renderHomeView();
            cleanPath = '/';
        }
    }
    
    // Atualizar classe ativa na barra de navegação inferior mobile (SPA)
    document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '') {
        const activeNav = document.getElementById('mobile-nav-home');
        if (activeNav) activeNav.classList.add('active');
    } else if (cleanPath === '/categorias' || cleanPath.startsWith('/categoria/')) {
        const activeNav = document.getElementById('mobile-nav-categorias');
        if (activeNav) activeNav.classList.add('active');
    }
    
    // Salvar no histórico
    if (pushState) {
        window.history.historyChange = true; // Flag opcional para evitar duplicações automáticas em GA se configurado
        window.history.pushState({}, '', cleanPath);
    }

    // Enviar evento de visualização de página para o Google Analytics (SPA)
    if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: cleanPath
        });
    }
}

// --- RENDERIZADORES DE VIEW ---

// 0. POLÍTICA DE PRIVACIDADE VIEW
function renderPoliticaPrivacidadeView() {
    document.title = "Política de Privacidade — KidCanvas 🔒";
    setMetaDescription("Política de Privacidade do site KidCanvas. Entenda como respeitamos a privacidade de nossos usuários, famílias e crianças.");
    
    const view = document.getElementById('view-politica-de-privacidade');
    if (view) {
        view.style.display = 'block';
    }
}

// 1. HOME VIEW
function renderHomeView() {
    document.title = "KidCanvas — Desenhos para Colorir e Imprimir Grátis 🎨";
    setMetaDescription("Milhares de desenhos para colorir e imprimir grátis. Animais selvagens, mar, domésticos, dinossauros, contos de fada e muito mais para colorir!");
    
    const view = document.getElementById('view-home');
    view.style.display = 'block';
    
    // Renderizar categorias na Home (12 categorias)
    const homeCatGrid = document.getElementById('home-categories-grid');
    if (homeCatGrid) {
        homeCatGrid.innerHTML = '';
        Object.keys(CATEGORIES_DATA).forEach(slug => {
            const catInfo = CATEGORIES_DATA[slug];
            const drawingCount = allDrawings.filter(d => d.category === slug).length;
            
            const card = document.createElement('a');
            card.href = `/categoria/${slug}`;
            card.className = 'category-card';
            card.innerHTML = `
                <span class="category-icon">${catInfo.emoji}</span>
                <span class="category-name">${catInfo.name}</span>
                <span class="category-count">${drawingCount} desenhos</span>
            `;
            homeCatGrid.appendChild(card);
        });
    }
    
    // Renderizar Desenhos Populares na Home (Primeiros 11 desenhos da biblioteca + 1 Slot de Anúncio)
    const homeDrawGrid = document.getElementById('home-drawings-grid');
    if (homeDrawGrid && allDrawings.length > 0) {
        homeDrawGrid.innerHTML = '';
        
        const sortedDrawings = [...allDrawings].sort((a,b) => b.index - a.index).slice(0, 11);
        
        sortedDrawings.forEach((dw, idx) => {
            // Inserir anúncio no 5º card
            if (idx === 4) {
                const adCard = document.createElement('div');
                adCard.className = 'simulated-ad-card';
                adCard.innerHTML = `
                    <span class="ad-label">Anúncio AdSense</span>
                    <h4 class="ad-title">Giz de Cera Faber-Castell 🖍&bull;</h4>
                    <p class="ad-desc">Compre os melhores materiais de desenho e escrita com até 20% de desconto na papelaria parceira!</p>
                    <a href="https://google.com" target="_blank" class="btn btn-secondary btn-sm">Ver Ofertas</a>
                `;
                homeDrawGrid.appendChild(adCard);
            }
            
            const card = createDrawingCard(dw);
            homeDrawGrid.appendChild(card);
        });
    }
    
    // Configurar Barra de Busca da Home
    const searchInput = document.getElementById('search-input-home');
    const btnSearch = document.getElementById('btn-search-home');
    
    const handleSearchSubmit = () => {
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            triggerSearch(query);
        } else {
            showToast('Digite alguma palavra-chave para buscar!', 'error');
        }
    };
    
    if (btnSearch && searchInput) {
        // Remover listeners anteriores recriando os elementos
        const newBtn = btnSearch.cloneNode(true);
        btnSearch.parentNode.replaceChild(newBtn, btnSearch);
        newBtn.addEventListener('click', handleSearchSubmit);
        
        const newInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newInput, searchInput);
        newInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSearchSubmit();
        });
    }
    
    // Configurar tags rápidas de busca
    document.querySelectorAll('.quick-tag-btn').forEach(btn => {
        btn.onclick = () => {
            const query = btn.getAttribute('data-search');
            triggerSearch(query);
        };
    });
}

// 2. CATEGORIAS VIEW
function renderCategoriasView() {
    document.title = "Temas de Desenhos para Colorir — KidCanvas 🎒";
    setMetaDescription("Explore os temas de desenhos para colorir: Dinossauros, Animais do mar, Contos de fada, Espaço sideral, Natureza, Veículos e muito mais.");
    
    const view = document.getElementById('view-categorias');
    view.style.display = 'block';
    
    const pageGrid = document.getElementById('categories-page-grid');
    if (pageGrid) {
        pageGrid.innerHTML = '';
        Object.keys(CATEGORIES_DATA).forEach(slug => {
            const catInfo = CATEGORIES_DATA[slug];
            const drawingCount = allDrawings.filter(d => d.category === slug).length;
            
            const card = document.createElement('a');
            card.href = `/categoria/${slug}`;
            card.className = 'category-card';
            card.innerHTML = `
                <span class="category-icon">${catInfo.emoji}</span>
                <span class="category-name">${catInfo.name}</span>
                <span class="category-count">${drawingCount} desenhos</span>
            `;
            pageGrid.appendChild(card);
        });
    }
}

// 2B. CATEGORIA DETALHADA VIEW
function renderCategoriaDetalheView(categorySlug) {
    const catInfo = CATEGORIES_DATA[categorySlug];
    if (!catInfo) {
        navigate('/categorias');
        return;
    }
    
    document.title = `Desenhos de ${catInfo.name} para Colorir e Imprimir — KidCanvas 🎨`;
    setMetaDescription(catInfo.desc);
    
    const view = document.getElementById('view-categoria-detalhe');
    view.style.display = 'block';
    
    // Atualizar banner e crumbs
    document.getElementById('category-detail-title-crumb').textContent = catInfo.name;
    document.getElementById('category-detail-icon').textContent = catInfo.emoji;
    document.getElementById('category-detail-title').textContent = catInfo.name;
    document.getElementById('category-detail-desc').textContent = catInfo.desc;
    
    const filteredDrawings = categorySlug === 'novidades'
        ? allDrawings.filter(d => d.isNew)
        : allDrawings.filter(d => d.category === categorySlug);
    const countEl = document.getElementById('category-drawings-count');
    countEl.textContent = `${filteredDrawings.length} desenhos disponíveis`;
    
    const grid = document.getElementById('category-drawings-grid');
    renderDrawingsInGrid(filteredDrawings, grid);
    
    // Configurar busca interna da categoria
    const categorySearchInput = document.getElementById('category-drawings-search');
    if (categorySearchInput) {
        categorySearchInput.value = '';
        categorySearchInput.oninput = () => {
            const val = categorySearchInput.value.trim().toLowerCase();
            const searched = filteredDrawings.filter(d => d.pt.toLowerCase().includes(val) || d.en.toLowerCase().includes(val));
            renderDrawingsInGrid(searched, grid);
            countEl.textContent = `${searched.length} desenhos encontrados`;
        };
    }
}

// Identifica a categoria/pool correta de frases para um desenho com base no título e na pasta
function getPhrasePoolKeyForDrawing(drawing) {
    const title = drawing.pt.toLowerCase();
    
    // 1. Palavras-chave do título
    if (title.includes('estrela do mar') || title.includes('peixe') || title.includes('baleia') || 
        title.includes('golfinho') || title.includes('tubarão') || title.includes('polvo') || 
        title.includes('tartaruga marinha') || title.includes('sereia') || title.includes('caranguejo') ||
        title.includes('água-viva') || title.includes('lagosta') || title.includes('foca') || 
        title.includes('leão marinho') || title.includes('coral') || title.includes('concha')) {
        return 'animais-do-mar';
    }
    
    if (title.includes('leão') || title.includes('tigre') || title.includes('leopardo') || 
        title.includes('elefante') || title.includes('girafa') || title.includes('macaco') || 
        title.includes('hipopótamo') || title.includes('rinoceronte') || title.includes('zebra') || 
        title.includes('gorila') || title.includes('crocodilo') || title.includes('pantera') || 
        title.includes('lobo') || title.includes('guepardo') || title.includes('panda') || 
        title.includes('savana') || title.includes('leãozinho')) {
        return 'animais-selvagens';
    }
    
    if (title.includes('cachorro') || title.includes('cão') || title.includes('gato') || 
        title.includes('gatinh') || title.includes('coelho') || title.includes('hamster') || 
        title.includes('papagaio') || title.includes('peixinho dourado') || title.includes('porquinho da índia') || 
        title.includes('passarinho') || title.includes('poodle') || title.includes('filhote')) {
        return 'animais-domesticos';
    }
    
    if (title.includes('dinossauro') || title.includes('t-rex') || title.includes('triceratops') || 
        title.includes('brachiosaurus') || title.includes('pterodátilo') || title.includes('velociraptor') || 
        title.includes('estegossauro') || title.includes('anquilossauro') || title.includes('espinossauro') || 
        title.includes('dino') || title.includes('fóssil') || title.includes('ovo de dinossauro')) {
        return 'dinossauros';
    }
    
    if (title.includes('unicórnio') || title.includes('fada') || title.includes('dragão') || 
        title.includes('fênix') || title.includes('mago') || title.includes('bruxo') || 
        title.includes('elfo') || title.includes('gnomo') || title.includes('pegaso') || 
        title.includes('duende') || title.includes('castelo mágico')) {
        return 'fantasia';
    }
    
    if (title.includes('chapeuzinho') || title.includes('cinderela') || title.includes('príncipe') || 
        title.includes('princesa') || title.includes('bela adormecida') || title.includes('rapunzel') || 
        title.includes('branca de neve') || title.includes('porquinho') || title.includes('patinho feio') || 
        title.includes('pinóquio') || title.includes('alice') || title.includes('aladdin')) {
        return 'contos-de-fada';
    }
    
    if (title.includes('astronauta') || title.includes('foguete') || title.includes('alien') || 
        title.includes('planeta') || title.includes('saturno') || title.includes('marte') || 
        title.includes('estrela cadente') || title.includes('lua') || title.includes('sol') || 
        title.includes('galáxia') || title.includes('telescópio') || title.includes('nebulosa') || 
        title.includes('cometa') || title.includes('ovni') || title.includes('robô espacial')) {
        return 'espaco';
    }
    
    if (title.includes('flor') || title.includes('árvore') || title.includes('borboleta') || 
        title.includes('arco-íris') || title.includes('chuva') || title.includes('folha') || 
        title.includes('girassol') || title.includes('rosa') || title.includes('trevo') || 
        title.includes('cogumelo') || title.includes('rio') || title.includes('montanha') || 
        title.includes('vulcão') || title.includes('natureza')) {
        return 'natureza';
    }
    
    if (title.includes('carro') || title.includes('avião') || title.includes('trem') || 
        title.includes('barco') || title.includes('moto') || title.includes('caminhão') || 
        title.includes('ônibus') || title.includes('helicóptero') || title.includes('submarino') || 
        title.includes('bicicleta') || title.includes('trator') || title.includes('ambulância') || 
        title.includes('bombeiro') || title.includes('navio') || title.includes('patinete') || 
        title.includes('táxi') || title.includes('metrô') || title.includes('veículo')) {
        return 'veiculos';
    }
    
    if (title.includes('bolo') || title.includes('sorvete') || title.includes('pizza') || 
        title.includes('cupcake') || title.includes('chocolate') || title.includes('pirulito') || 
        title.includes('algodão doce') || title.includes('gelatina') || title.includes('brigadeiro') || 
        title.includes('torta') || title.includes('fruta') || title.includes('maçã') || 
        title.includes('banana') || title.includes('cenoura') || title.includes('comida') || 
        title.includes('doce')) {
        return 'comidas-e-doces';
    }
    
    if (title.includes('escola') || title.includes('parquinho') || title.includes('família') || 
        title.includes('piquenique') || title.includes('guarda-chuva') || title.includes('pipoca') || 
        title.includes('circo') || title.includes('pipa') || title.includes('futebol') || 
        title.includes('pião') || title.includes('brincadeira') || title.includes('jogo') || 
        title.includes('festa') || title.includes('aniversário') || title.includes('jardim')) {
        return 'cotidiano';
    }
    
    if (title.includes('médico') || title.includes('professor') || title.includes('policial') || 
        title.includes('veterinário') || title.includes('dentista') || title.includes('piloto') || 
        title.includes('músico') || title.includes('pintor') || title.includes('jardineiro') || 
        title.includes('padeiro') || title.includes('atleta') || title.includes('artista') || 
        title.includes('marinheiro') || title.includes('fotógrafo') || title.includes('construtor') || 
        title.includes('chef') || title.includes('profissão')) {
        return 'profissoes';
    }
    
    // 2. Fallbacks de categoria da pasta
    const categoryMapping = {
        'animais-selvagens': 'animais-selvagens',
        'animais-do-mar': 'animais-do-mar',
        'animais-domesticos': 'animais-domesticos',
        'dinossauros': 'dinossauros',
        'fantasia': 'fantasia',
        'unicornios': 'fantasia',
        'princesas': 'contos-de-fada',
        'contos-de-fada': 'contos-de-fada',
        'espaco': 'espaco',
        'natureza': 'natureza',
        'flores': 'natureza',
        'veiculos': 'veiculos',
        'comidas-e-doces': 'comidas-e-doces',
        'frutas-e-legumes': 'comidas-e-doces',
        'cotidiano': 'cotidiano',
        'festa-junina': 'cotidiano',
        'futebol': 'cotidiano',
        'datas-comemorativas': 'cotidiano',
        'profissoes': 'profissoes',
        'super-herois': 'fantasia',
        'alfabeto-e-numeros': 'cotidiano',
        'paper-doll': 'cotidiano'
    };
    
    return categoryMapping[drawing.category] || 'cotidiano';
}

// Extrai o sujeito principal do título do desenho
function extractSubject(title) {
    let clean = title.toLowerCase().trim();
    
    // Lista de sujeitos comuns compostos ou simples para casar primeiro
    const commonSubjects = [
        'estrela do mar', 'peixe palhaço', 'peixinho dourado', 'porquinho da índia',
        'leão marinho', 'cavalo marinho', 'pantera negra', 'golden retriever',
        'gato siamês', 'poodle encaracolado', 'tartaruga marinha', 'príncipe encantado',
        'bela adormecida', 'branca de neve', 'chapeuzinho vermelho', 'três porquinhos',
        'patinho feio', 'pé de feijão', 'estrela cadente', 'buraco negro',
        'ônibus escolar', 'carro de corrida', 'caminhão de bombeiro', 'algodão doce',
        'bolo de aniversário', 'bolo de cenoura', 'maçã do amor', 'criança no parque',
        'criança na escola', 'chef de cozinha', 'bebe dinossauro', 'bebê dinossauro',
        'ovo de dinossauro'
    ];
    
    for (const sub of commonSubjects) {
        if (clean.includes(sub)) {
            return sub;
        }
    }
    
    // Caso contrário, pega a primeira palavra (ou duas se for de/do/da/com/em)
    const words = clean.split(' ');
    if (words.length > 2 && (words[1] === 'de' || words[1] === 'do' || words[1] === 'da' || words[1] === 'com' || words[1] === 'em')) {
        return words[0] + ' ' + words[1] + ' ' + words[2];
    }
    if (words.length > 1 && (words[0] === 'o' || words[0] === 'a' || words[0] === 'um' || words[0] === 'uma')) {
        return words[0] + ' ' + words[1];
    }
    
    return words[0];
}

// Retorna o artigo correto ('o' ou 'a') baseado no gênero gramatical do sujeito
function getArticleForSubject(subject) {
    const feminines = ['estrela', 'girafa', 'zebra', 'tartaruga', 'sereia', 'baleia', 'fada', 'bruxa', 'princesa', 'cinderela', 'chapeuzinho', 'branca', 'borboleta', 'flor', 'pizza', 'gelatina', 'torta', 'fruta', 'maçã', 'banana', 'pipoca', 'pipa', 'brincadeira', 'escola', 'ambulância', 'bicicleta', 'moto', 'foca', 'lagosta', 'água-viva', 'roseira', 'nebulosa', 'galáxia', 'fênix'];
    const firstWord = subject.split(' ')[0].toLowerCase();
    
    if (feminines.some(f => firstWord.startsWith(f) || firstWord === f)) {
        return 'a';
    }
    return 'o';
}

// Cria um pool de exatamente 5 frases lúdicas e fofas exclusivas para cada desenho
function get5PhrasesForDrawing(drawing) {
    const title = drawing.pt;
    const category = getPhrasePoolKeyForDrawing(drawing);
    const subject = extractSubject(title);
    const art = getArticleForSubject(subject);
    
    // Extrai o restante do título para dar um contexto da ação se houver
    let action = title.replace(new RegExp('^' + subject, 'i'), '').trim();
    if (!action) {
        action = "brincando feliz";
    }
    
    const subjectLower = subject.toLowerCase();
    const phrases = [];
    
    // --- 1. CASOS ESPECÍFICOS (PERSONAGEM / OBJETO DO DESENHO GANHA VIDA) ---
    
    if (subjectLower.includes('estrela do mar')) {
        phrases.push(`Oi! Tava cochilando aqui...\nme acorda com suas cores!`);
        phrases.push(`Tenho 5 pontinhas esperando cor!`);
        phrases.push(`Psiu! Achei um tesouro no fundo...\né você me colorindo!`);
        phrases.push(`Quer ver o fundo do mar brilhar?\nMe colore bem lindo!`);
        phrases.push(`Sou uma estrela, mas moro no mar...\ne adoro ver você pintar!`);
    }
    else if (subjectLower.includes('golfinho')) {
        phrases.push(`Splash! Pulei bem alto\nsó pra te ver hoje!`);
        phrases.push(`Eiii! Quer nadar comigo?\nMe colore primeiro!`);
        phrases.push(`Faço acrobacias no mar quando\nganho cores lindas!`);
        phrases.push(`Que tal me pintar de azul bem\nclarinho ou turquesa?`);
        phrases.push(`Dá um salto na imaginação\ne escolhe sua cor favorita!`);
    }
    else if (subjectLower.includes('camaleão') || subjectLower.includes('camaleao')) {
        phrases.push(`Mudei de cor só pra te ver...\nme colore com sua cor favorita!`);
        phrases.push(`Posso me esconder no papel,\nmas sei que você vai me achar!`);
        phrases.push(`Vermelho, azul ou amarelo...\nqual cor eu vou vestir hoje?`);
        phrases.push(`Sou o rei do disfarce, mas\nadoro aparecer bem colorido!`);
        phrases.push(`Olha meus olhinhos girando,\nesperando suas cores lindas!`);
    }
    else if ((subjectLower.includes('leão') || subjectLower.includes('leao')) && !subjectLower.includes('camaleão') && !subjectLower.includes('camaleao')) {
        phrases.push(`Roarrr! Sou o rei aqui!\nMas só você pode me colorir!`);
        phrases.push(`Minha juba tá sem cor...\nsocorro amiguinho!`);
        phrases.push(`Um rugido fofinho pra você:\nme pinta com muito amor!`);
        phrases.push(`Vou reinar no seu caderno\nde desenho hoje!`);
        phrases.push(`Quem tem a juba mais colorida\ndo reino? Eu, se você me ajudar!`);
    }
    else if (subjectLower.includes('girafa')) {
        phrases.push(`Oi lá de cima! Daqui\nconsigo te ver colorindo!`);
        phrases.push(`Meu pescoço é longo mas\nmeu coração é maior ainda!`);
        phrases.push(`Pode pintar minhas pintinhas\nde marrom, roxo ou rosa!`);
        phrases.push(`Estiquei todo o pescoço\nsó pra espiar suas cores!`);
        phrases.push(`Que dia lindo pra pintar a\ngirafa mais alta da floresta!`);
    }
    else if (subjectLower.includes('triceratops') || subjectLower.includes('tricerátops')) {
        phrases.push(`Corri tanto pra te encontrar!\nAgora me pinta logo!`);
        phrases.push(`Tenho 3 chifres pra proteger\nvocê enquanto colore!`);
        phrases.push(`A pré-história era sem graça\nantes das suas cores!`);
        phrases.push(`Adoro comer folhinhas verdes\ne ganhar tintas alegres!`);
        phrases.push(`Meus três chifres querem ficar\nsuper coloridos hoje!`);
    }
    else if (subjectLower.includes('t-rex') || subjectLower.includes('tiranossauro') || subjectLower.includes('t-rex') || subjectLower.includes('t_rex')) {
        phrases.push(`RAWRR! Meu bracinho é pequeno\nmas meu abraço é gigante!`);
        phrases.push(`Sou o maior mas tenho\nmedo de ficar sem cor!`);
        phrases.push(`Quem disse que o T-Rex é bravo?\nEu sou super bonzinho!`);
        phrases.push(`Me ajuda a correr bem rápido\nna terra dos dinos coloridos!`);
        phrases.push(`Mostre seus dentinhos num\nsorriso e vamos pintar!`);
    }
    else if (subjectLower.includes('carro')) {
        phrases.push(`Vrum vrum! Tô esperando\nminha cor favorita!`);
        phrases.push(`Meu tanque tá cheio mas\nde cor tá vazio!`);
        phrases.push(`Apita apita! Me pinta\nque vou te dar uma volta!`);
        phrases.push(`Todo carro tem uma cor...\nqual vai ser a minha?`);
        phrases.push(`Tô parado na garagem\nesperando você me colorir!`);
    }
    else if (subjectLower.includes('avião') || subjectLower.includes('aviao')) {
        phrases.push(`Decolo em 3... 2... 1...\nmas primeiro me colore!`);
        phrases.push(`Já voei o mundo todo mas\nnunca vi cor tão linda!`);
        phrases.push(`Altitude máxima atingida!\nAgora me pinta!`);
        phrases.push(`Vou voar acima das nuvens\ncom as cores que você me der!`);
        phrases.push(`Aperte os cintos, o voo\nda imaginação vai começar!`);
    }
    else if (subjectLower.includes('trem')) {
        phrases.push(`Apito apito! Próxima parada:\nsua imaginação!`);
        phrases.push(`Todos a bordo! O trem\nda cor vai partir!`);
        phrases.push(`Piuiii! Minha chaminé\nquer soltar fumaça colorida!`);
        phrases.push(`Vou trilhar caminhos lindos\nse você me pintar agora!`);
        phrases.push(`Chique-chique no trilho da\nalegria, me pinta com carinho!`);
    }
    else if (subjectLower.includes('unicórnio') || subjectLower.includes('unicornio')) {
        phrases.push(`Minha crina perdeu o arco-íris...\nsó você pode trazer de volta!`);
        phrases.push(`Galopei pelas nuvens\nsó pra te encontrar hoje!`);
        phrases.push(`Espalhei purpurina mágica\nno papel pra você brilhar!`);
        phrases.push(`Meu chifre mágico brilha quando\nvocê usa cores lindas!`);
        phrases.push(`Vamos voar pelo céu\ncolorido da fantasia!`);
    }
    else if (subjectLower.includes('dragão') || subjectLower.includes('dragao')) {
        phrases.push(`Cospo fogo colorido!\nAgora me pinta logo!`);
        phrases.push(`Pareço assustador mas\nsó quero ser seu amigo!`);
        phrases.push(`Minhas asas querem voar\nalto com suas cores!`);
        phrases.push(`Guardo um tesouro secreto:\no seu talento para colorir!`);
        phrases.push(`Um abraço quentinho de\ndragão pra você!`);
    }
    else if (subjectLower.includes('fada')) {
        phrases.push(`Joguei pó mágico aqui...\nagora é sua vez de colorir!`);
        phrases.push(`Concedo um desejo hoje:\nme colore de cores lindas!`);
        phrases.push(`Minhas asinhas de fada\nquerem brilhar com glitter!`);
        phrases.push(`Cada traço seu é uma\nmágica de verdade!`);
        phrases.push(`Vamos fazer uma poção\nde alegria e muita cor!`);
    }
    else if (subjectLower.includes('borboleta')) {
        phrases.push(`Pousei aqui pertinho\nsó pra te ver colorir!`);
        phrases.push(`Minhas asas precisam\nde todas as cores do arco-íris!`);
        phrases.push(`Vou voar de flor em flor\nespalhando sua arte!`);
        phrases.push(`O vento me trouxe aqui\npara jogar com seus lápis!`);
        phrases.push(`Pinta minhas asas com\ncapricho e vamos voar!`);
    }
    else if (subjectLower.includes('flor') || subjectLower.includes('flores') || subjectLower.includes('girassol')) {
        phrases.push(`Abri minhas pétalas\nesperando suas cores!`);
        phrases.push(`O sol me achece mas\nvocê me colore!`); // fofo typo ou correto, vamos usar 'aquece'
        phrases.replace = (x) => x; // placeholder
        phrases.push(`O sol me aquece mas\nvocê me colore!`);
        phrases.push(`Quero enfeitar o jardim\nmais bonito com sua ajuda!`);
        phrases.push(`Uma pétala de cada cor,\npor favor! Vai ficar lindo!`);
        phrases.push(`O jardim da Vovó Sônia\nfica mais alegre com você!`);
        // Remove o item duplicado com erro de digitação
        phrases.splice(phrases.findIndex(p => p.includes('achece')), 1);
    }
    else if (subjectLower.includes('arco-íris') || subjectLower.includes('arco-iris') || subjectLower.includes('arco iris')) {
        phrases.push(`Perdi minhas 7 cores...\npode me ajudar?`);
        phrases.push(`Apareci depois da chuva\nsó pra te surpreender!`);
        phrases.push(`Um caminho de cores no\ncéu feito por você!`);
        phrases.push(`Ligue as nuvens com as\ncores mais brilhantes!`);
        phrases.push(`Onde termina o arco-íris?\nNo seu estojo de lápis!`);
    }
    else if (subjectLower.includes('bolo')) {
        phrases.push(`Hoje é meu aniversário!\nMe enfeita de cor?`);
        phrases.push(`Tenho várias camadas mas\nnenhuma tem cor ainda!`);
        phrases.push(`Que tal colocar granulados\ncoloridos em mim?`);
        phrases.push(`Hummm, com cereja no topo\nfica ainda mais gostoso!`);
        phrases.push(`Pode me colorir com o\nsabor que você mais gostar!`);
    }
    else if (subjectLower.includes('sorvete')) {
        phrases.push(`Tô derretendo de calor!\nMe colore rápido!`);
        phrases.push(`Que sabor de cor\nvocê vai escolher?`);
        phrases.push(`Uma bola de morango, uma\nde chocolate e muita cor!`);
        phrases.push(`Me deixa super geladinho\ne colorido no papel!`);
        phrases.push(`Uma casquinha crocante\nesperando seus lápis favoritos!`);
    }
    else if (subjectLower.includes('pirulito')) {
        phrases.push(`Giro giro rodando\nesperando sua cor favorita!`);
        phrases.push(`Sou o doce mais alegre\ndo caderno de desenhos!`);
        phrases.push(`Pode pintar minhas espirais\ncom cores do arco-íris?`);
        phrases.push(`Tão docinho e colorido\nquanto a sua imaginação!`);
        phrases.push(`Me colore bem brilhante\npara eu ficar lindo!`);
    }
    else if (subjectLower.includes('parque') || subjectLower.includes('joão') || subjectLower.includes('joao')) {
        phrases.push(`Oi! Eu sou o João!\nVamos passear juntos?`);
        phrases.push(`Hoje o parque tá lindo...\nfalta só a sua cor!`);
        phrases.push(`Quer brincar comigo?\nMe colore primeiro!`);
        phrases.push(`Vou correr e brincar depois\nque você me pintar!`);
        phrases.push(`O balanço e o escorregador\nestão esperando cores!`);
    }
    else if (subjectLower.includes('escola') || subjectLower.includes('professor') || subjectLower.includes('professora')) {
        phrases.push(`Aprendi muita coisa hoje!\nE você, vai me colorir?`);
        phrases.push(`A professora disse que\nvocê é o melhor artista!`);
        phrases.push(`Minha mochila está cheia de\nlivros e lápis para pintar!`);
        phrases.push(`Vamos fazer a lição de casa\nmais divertida e colorida!`);
        phrases.push(`A sala de aula fica mais\nalegre com seus desenhos!`);
    }
    else if (subjectLower.includes('bombeiro')) {
        phrases.push(`Apago fogo todo dia mas\nnão consigo me colorir sozinho!`);
        phrases.push(`SIREEEENE! Chamado urgente:\npreciso de cor agora!`);
        phrases.push(`Vrum! O caminhão vermelho\nde bombeiro precisa de pintura!`);
        phrases.push(`Pronto para salvar o dia\ncom as cores mais corajosas!`);
        phrases.push(`Me pinte com cuidado para\neu ficar bem visível no chamado!`);
    }
    else if (subjectLower.includes('médico') || subjectLower.includes('medico') || subjectLower.includes('doutor') || subjectLower.includes('médica') || subjectLower.includes('medica')) {
        phrases.push(`Cuido de todo mundo...\nmas quem cuida de mim? Você!`);
        phrases.push(`Um estetoscópio para ouvir\nseu coraçãozinho feliz!`);
        phrases.push(`Sua receita de hoje:\n10 minutos de pintura e alegria!`);
        phrases.push(`Pintar esse desenho faz\nmuito bem para a saúde!`);
        phrases.push(`Obrigado por ser o meu\nmelhor ajudante de cores!`);
    }
    else if (subjectLower.includes('chef') || subjectLower.includes('cozinheiro') || subjectLower.includes('cozinha')) {
        phrases.push(`Preparei uma receita especial:\n1 xícara de cor e muita alegria!`);
        phrases.push(`Coloquei muito amor e pitadas\nde imaginação nesse prato!`);
        phrases.push(`O que tem no menu de hoje?\nDesenhos deliciosos para pintar!`);
        phrases.push(`Misture o vermelho, azul e\namarelo para criar mágica!`);
        phrases.push(`Sou o chef das cores e\naprovo o seu desenho!`);
    }
    else if (subjectLower.includes('astronauta')) {
        phrases.push(`Houston, temos um problema:\nestou sem cor aqui no espaço!`);
        phrases.push(`Flutuo por aí esperando\nalguém me colorir!`);
        phrases.push(`Olha a Terra lá de cima! Ela\né azul, mas eu estou em branco!`);
        phrases.push(`Pinte meu traje espacial\ncom as cores das estrelas!`);
        phrases.push(`Explorando o universo em\nbusca do desenho mais bonito!`);
    }
    else if (subjectLower.includes('foguete')) {
        phrases.push(`Contagem regressiva!\n3... 2... 1... me colore!`);
        phrases.push(`Já fui à lua e de volta\nmas nunca vi artista igual a você!`);
        phrases.push(`Minhas turbinas vão soltar\nfogo colorido pelo espaço!`);
        phrases.push(`Rumo às estrelas com a\nvelocidade das suas cores!`);
        phrases.push(`Me pinte bem bonito para\neu brilhar no céu infinito!`);
    }
    else if (subjectLower.includes('alien') || subjectLower.includes('et') || subjectLower.includes('alienígena') || subjectLower.includes('alienigena')) {
        phrases.push(`Vim de muito longe\nsó pra ser seu amigo colorido!`);
        phrases.push(`No meu planeta todo mundo\né colorido... me ajuda?`);
        phrases.push(`Bip bop! My nave espacial\nprecisa de cores terrestres!`); // fofo com 'Minha'
        phrases.push(`Achei o planeta mais divertido\nde todos: o seu caderno!`);
        phrases.push(`Tenho anteninhas prontas para\nsintonizar suas cores!`);
        // Correção rápida
        phrases[2] = `Bip bop! Minha nave espacial\nprecisa de cores terrestres!`;
    }
    
    // --- 2. FALLBACK POR CATEGORIA DINÂMICA (MISTURA ESTILOS E FALA DIRETAMENTE COM GRAMÁTICA CORRETA) ---
    
    if (phrases.length === 0) {
        switch (category) {
            case 'animais-do-mar':
                phrases.push(`Splash! Quer nadar comigo?\nMe colore primeiro, amiguinho!`);
                phrases.push(`Oi! Me dá um mergulho\ncolorido no papel!`);
                phrases.push(`Achei um tesouro no mar:\nsuas cores lindas!`);
                phrases.push(`Tenho nadadeiras sem cor...\nme ajuda, amiguinho?`);
                phrases.push(`Oi! Sou ${art} ${subject}!\nMe colore com a cor do oceano!`);
                break;
                
            case 'animais-selvagens':
                phrases.push(`Oi! Sou ${art} ${subject}!\nMe pinta bem bonito!`);
                phrases.push(`Socorro! Estou sem cor\naqui na selva!`);
                phrases.push(`Quer brincar na floresta?\nMe colore primeiro!`);
                phrases.push(`Meu coração de ${subject}\nadora suas cores!`);
                phrases.push(`Roarrr! Pinta meu desenho\ncom muito amor!`);
                break;
                
            case 'animais-domesticos':
                phrases.push(`Miau! Au au! Me colore\ncom sua cor favorita!`);
                phrases.push(`Oi! Sou ${art} ${subject}!\nQuer ser meu amigo de pintura?`);
                phrases.push(`Abanei o rabinho de alegria\nquando vi seus lápis!`);
                phrases.push(`Estou te esperando no papel...\nvamos colorir juntinhos?`);
                phrases.push(`Que tal me pintar de colorido?\nAdoro brincar!`);
                break;
                
            case 'dinossauros':
                phrases.push(`RAWRR! Pinta meu corpinho\nde dinossauro!`);
                phrases.push(`Tenho chifres e espinhos,\nmas sou super bonzinho!`);
                phrases.push(`Corri tanto pra te ver!\nAgora me colore logo!`);
                phrases.push(`De que cor eu era de verdade?\nVocê que manda!`);
                phrases.push(`Grrr! Um dinossauro grandão\nquerendo suas cores!`);
                break;
                
            case 'fantasia':
                phrases.push(`Minhas asas perderam o brilho...\npode me ajudar?`);
                phrases.push(`Galopei pelas nuvens mágicas\nsó pra te ver colorir!`);
                phrases.push(`Espalhei purpurina no papel!\nEscolha os lápis mais lindos!`);
                phrases.push(`Pareço assustador mas só\nquero ser seu amigo colorido!`);
                phrases.push(`Joguei um pó de estrelas\npara te dar sorte na pintura!`);
                break;
                
            case 'contos-de-fada':
                phrases.push(`Era uma vez um desenho fofo\nesperando suas cores!`);
                phrases.push(`O final feliz desse conto\ndepende das suas cores!`);
                phrases.push(`Abra este livro de aventura\ne me colore bem lindo!`);
                phrases.push(`Sou ${art} ${subject}!\nTrouxe um abraço pra você!`);
                phrases.push(`Era uma vez uma criança que\npintava com muito amor!`);
                break;
                
            case 'espaco':
                phrases.push(`Houston, temos um problema:\nestou sem cor no espaço!`);
                phrases.push(`Flutuo pelas estrelas\nesperando você me pintar!`);
                phrases.push(`Contagem regressiva!\n3... 2... 1... me colore!`);
                phrases.push(`Já fui até a lua e de volta,\nmas adoro a sua pintura!`);
                phrases.push(`Vim de outro planeta só pra\nser seu amigo colorido!`);
                break;
                
            case 'natureza':
                phrases.push(`Pousei aqui pertinho\nsó pra te ver colorir!`);
                phrases.push(`Minhas pétalas e folhas\nprecisam de cores lindas!`);
                phrases.push(`O sol me aquece no jardim,\nmas você me dá vida!`);
                phrases.push(`Apareci depois da chuva\nsó pra te surpreender!`);
                phrases.push(`Abri minhas flores para\nreceber suas cores!`);
                break;
                
            case 'veiculos':
                phrases.push(`Vrum vrum! Tô esperando\nminha cor favorita!`);
                phrases.push(`Meu tanque tá cheio mas\nmeu corpinho tá sem cor!`);
                phrases.push(`Apita apita! Me colore\nque vou te dar uma volta!`);
                phrases.push(`Estou parado na garagem\nesperando a largada das cores!`);
                phrases.push(`Buzina, buzina! Me pinta\nbem rápido, amiguinho!`);
                break;
                
            case 'comidas-e-doces':
                phrases.push(`Hummm! Estou derretendo\nde calor! Me colore rápido!`);
                phrases.push(`Hoje é dia de festa!\nMe enfeita de cor?`);
                phrases.push(`Tenho várias camadas fofas,\nnenhuma tem cor ainda!`);
                phrases.push(`Que sabor de cor você\nvai escolher para mim?`);
                phrases.push(`Giro giro rodando no prato\nesperando o seu toque de cor!`);
                break;
                
            case 'cotidiano':
                phrases.push(`Oi! Vamos passear e brincar\njuntos hoje?`);
                phrases.push(`Hoje o dia tá lindo,\nfalta só a sua cor!`);
                phrases.push(`Quer brincar comigo?\nMe colore primeiro!`);
                phrases.push(`Aprendi coisas muito legais,\nvamos pintar juntinhos?`);
                phrases.push(`A Vovó Sônia disse que\nvocê pinta muito bem!`);
                break;
                
            case 'profissoes':
                phrases.push(`SIRENE! Chamado urgente:\npreciso de cor agora!`);
                phrases.push(`Cuido de todo mundo, mas\nquem cuida de mim é você!`);
                phrases.push(`Preparei uma receita:\numa xícara de cor e alegria!`);
                phrases.push(`Trabalho com amor todos os dias,\ne colorir comigo é pura diversão!`);
                phrases.push(`Qual profissão você quer ter?\nVamos sonhar colorindo!`);
                break;
                
            default:
                phrases.push(`Oi! Quer brincar comigo?\nMe colore bem lindo!`);
                phrases.push(`De que cor você vai me pintar?\nEscolha a sua favorita!`);
                phrases.push(`Estou no papel esperando,\nvamos colorir juntinhos?`);
                phrases.push(`Deixa meu desenho alegre\ne cheio de vida!`);
                phrases.push(`A Vovó Sônia separou esse\ndesenho com muito amor!`);
        }
    }
    
    return phrases.slice(0, 5);
}

// Sorteia uma frase aleatória das 5 disponíveis para o desenho
function selectRandomPhraseForDrawing(drawing) {
    const phrases = get5PhrasesForDrawing(drawing);
    if (phrases.length === 0) return "Vamos colorir juntinhos?";
    if (phrases.length === 1) return phrases[0];
    
    let selected = "";
    do {
        const idx = Math.floor(Math.random() * phrases.length);
        selected = phrases[idx];
    } while (selected === lastSelectedPhrase);
    
    lastSelectedPhrase = selected;
    return selected;
}

// Inicializa o sistema de avaliação com estrelinhas
function initRatingSystem(categorySlug, drawingSlug) {
    const starContainer = document.getElementById('drawing-rating-stars');
    if (!starContainer) return;
    
    const stars = starContainer.querySelectorAll('.star-btn');
    const storageKey = `rated_${categorySlug}_${drawingSlug}`;
    
    const savedRating = localStorage.getItem(storageKey);
    
    const highlightStars = (rating) => {
        stars.forEach(star => {
            const val = parseInt(star.getAttribute('data-value'), 10);
            if (val <= rating) {
                star.className = 'fa-solid fa-star star-btn active';
            } else {
                star.className = 'fa-regular fa-star star-btn';
            }
        });
    };
    
    if (savedRating) {
        highlightStars(parseInt(savedRating, 10));
    } else {
        highlightStars(0);
    }
    
    stars.forEach(star => {
        star.onmouseenter = () => {
            if (localStorage.getItem(storageKey)) return;
            const val = parseInt(star.getAttribute('data-value'), 10);
            highlightStars(val);
        };
        
        star.onclick = async () => {
            if (localStorage.getItem(storageKey)) {
                showToast('Você já avaliou este desenho! Obrigado!', 'success');
                return;
            }
            
            const rating = parseInt(star.getAttribute('data-value'), 10);
            localStorage.setItem(storageKey, rating);
            highlightStars(rating);
            
            showToast('Obrigado pelo seu voto! ⭐', 'success');
            
            try {
                const response = await fetch('/api/rate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: categorySlug, slug: drawingSlug, rating })
                });
                const data = await response.json();
                if (data.success) {
                    await loadDrawings();
                }
            } catch (e) {
                console.error('Erro ao salvar avaliação:', e);
            }
        };
    });
    
    starContainer.onmouseleave = () => {
        const currentSaved = localStorage.getItem(storageKey);
        highlightStars(currentSaved ? parseInt(currentSaved, 10) : 0);
    };
}

// 3. PÁGINA INDIVIDUAL DE DESENHO
function renderDesenhoIndividualView(categorySlug, drawingSlug) {
    const drawing = allDrawings.find(d => d.category === categorySlug && d.slug === drawingSlug);
    
    if (!drawing) {
        showToast('Desenho não encontrado no acervo!', 'error');
        navigate('/');
        return;
    }
    
    const catInfo = CATEGORIES_DATA[categorySlug];
    
    // SEO
    document.title = `Desenho de ${drawing.pt} para Colorir e Imprimir — KidCanvas`;
    setMetaDescription(`Baixe em alta resolução o desenho de ${drawing.pt} (${drawing.en}) para imprimir e colorir com as crianças. 100% gratuito e sem cadastro.`);
    
    const view = document.getElementById('view-desenho-individual');
    view.style.display = 'block';
    
    // Atualizar breadcrumbs e detalhes
    const crumbCategory = document.getElementById('drawing-crumb-category');
    crumbCategory.href = `/categoria/${categorySlug}`;
    crumbCategory.textContent = catInfo.name;
    
    document.getElementById('drawing-crumb-name').textContent = drawing.pt;
    document.getElementById('drawing-detail-name').textContent = drawing.pt;
    document.getElementById('drawing-detail-img').src = drawing.url;
    document.getElementById('drawing-detail-img').alt = drawing.pt;
    
    // Selecionar frase aleatória para esta visualização
    const poolKey = getPhrasePoolKeyForDrawing(drawing);
    currentDrawingPhrase = selectRandomPhraseForDrawing(drawing);
    
    // Configurar Frase de Exibição na Tela (letras minúsculas/normais e sem quebra para leitura fluida)
    const screenPhraseText = document.getElementById('character-speech-text');
    if (screenPhraseText) {
        screenPhraseText.textContent = currentDrawingPhrase.replace(/\n/g, ' ');
    }
    
    // Configurar Frases Vazadas Educativas (100% Unificado e Grátis)
    const phraseBox = document.getElementById('drawing-sheet-phrase-box');
    phraseBox.style.display = 'flex';
    renderHollowPhraseText(currentDrawingPhrase, 'pt');
    
    const sheetFrame = document.querySelector('.drawing-sheet-frame');
    if (sheetFrame) sheetFrame.classList.remove('no-border');
    
    // Inicializar avaliação por estrelas
    initRatingSystem(categorySlug, drawingSlug);
    
    // Escutar mudança de legenda e moldura (borda)
    const radios = document.getElementsByName('phrase-lang-mode');
    radios.forEach(radio => {
        // Resetar para PT ativo
        if (radio.value === 'pt') radio.checked = true;
        
        radio.onchange = () => {
            const mode = radio.value;
            if (mode === 'pt') {
                if (sheetFrame) sheetFrame.classList.remove('no-border');
                phraseBox.style.display = 'flex';
                renderHollowPhraseText(currentDrawingPhrase, 'pt');
            } else if (mode === 'en') {
                if (sheetFrame) sheetFrame.classList.remove('no-border');
                phraseBox.style.display = 'flex';
                renderHollowPhraseText(`${currentDrawingPhrase} / DRAWING`, 'en');
            } else if (mode === 'none') {
                if (sheetFrame) sheetFrame.classList.remove('no-border');
                phraseBox.style.display = 'none';
            } else if (mode === 'noborder') {
                if (sheetFrame) sheetFrame.classList.add('no-border');
                phraseBox.style.display = 'none';
            }
        };
    });
    
    // Configurar botões de impressão com e sem borda
    const btnPrintBorder = document.getElementById('btn-print-border');
    const btnPrintNoBorder = document.getElementById('btn-print-noborder');
    
    if (btnPrintBorder) {
        const newBtnBorder = btnPrintBorder.cloneNode(true);
        btnPrintBorder.parentNode.replaceChild(newBtnBorder, btnPrintBorder);
        newBtnBorder.addEventListener('click', () => {
            document.body.classList.add('print-with-border');
            window.print();
            document.body.classList.remove('print-with-border');
        });
    }
    
    if (btnPrintNoBorder) {
        const newBtnNoBorder = btnPrintNoBorder.cloneNode(true);
        btnPrintNoBorder.parentNode.replaceChild(newBtnNoBorder, btnPrintNoBorder);
        newBtnNoBorder.addEventListener('click', () => {
            document.body.classList.add('print-no-border');
            window.print();
            document.body.classList.remove('print-no-border');
        });
    }
    
    // Renderizar desenhos relacionados (mesma categoria, limitados a 4)
    const relatedGrid = document.getElementById('related-drawings-grid');
    if (relatedGrid) {
        relatedGrid.innerHTML = '';
        const related = allDrawings
            .filter(d => d.category === categorySlug && d.slug !== drawingSlug)
            .slice(0, 4);
            
        related.forEach(dw => {
            const card = createDrawingCard(dw);
            relatedGrid.appendChild(card);
        });
        
        if (related.length === 0) {
            document.querySelector('.related-drawings-section').style.display = 'none';
        } else {
            document.querySelector('.related-drawings-section').style.display = 'block';
        }
    }
}

// Roteador de Frases Vazadas (SVG Outline)
function renderHollowPhraseText(text, mode) {
    const canvas = document.getElementById('hollow-text-canvas');
    if (!canvas) return;
    
    let cleanText = text.toUpperCase();
    const lines = cleanText.split('\n');
    
    // Limpar o canvas
    canvas.innerHTML = '';
    
    // Alterar o viewBox e o max-height dinamicamente dependendo da quantidade de linhas
    if (lines.length > 1) {
        canvas.setAttribute('viewBox', '0 0 500 80');
        canvas.style.maxHeight = '80px';
    } else {
        canvas.setAttribute('viewBox', '0 0 500 60');
        canvas.style.maxHeight = '60px';
    }
    
    if (lines.length === 1) {
        // Redimensionamento dinâmico super seguro baseado na largura do contêiner (500px)
        let fontSize = Math.min(34, Math.floor(500 / cleanText.length));
        if (fontSize < 10) fontSize = 10; // Garantir tamanho mínimo legível
        
        canvas.innerHTML = `
            <text x="250" y="40" font-family="'Fredoka', sans-serif" font-size="${fontSize}" font-weight="900" fill="none" stroke="#2d1854" stroke-width="1.8" text-anchor="middle" letter-spacing="1">
                ${cleanText}
            </text>
        `;
    } else {
        // Renderizar 2 linhas
        const line1 = lines[0];
        const line2 = lines[1];
        
        const maxLen = Math.max(line1.length, line2.length);
        let fontSize = Math.min(28, Math.floor(500 / maxLen));
        if (fontSize < 10) fontSize = 10;
        
        canvas.innerHTML = `
            <text x="250" y="32" font-family="'Fredoka', sans-serif" font-size="${fontSize}" font-weight="900" fill="none" stroke="#2d1854" stroke-width="1.6" text-anchor="middle" letter-spacing="1">
                ${line1}
            </text>
            <text x="250" y="68" font-family="'Fredoka', sans-serif" font-size="${fontSize}" font-weight="900" fill="none" stroke="#2d1854" stroke-width="1.6" text-anchor="middle" letter-spacing="1">
                ${line2}
            </text>
        `;
    }
}

// --- CONTROLE DAS AUTO-SUGESTÕES (AUTOCOMPLETE) ---
function initSearchAutocomplete() {
    const globalSearch = document.getElementById('global-search-input');
    const globalDropdown = document.getElementById('global-suggestions-dropdown');
    
    const homeSearch = document.getElementById('search-input-home');
    const homeDropdown = document.getElementById('home-suggestions-dropdown');
    
    // Configurar autocomplete global (cabeçalho)
    if (globalSearch && globalDropdown) {
        setupAutocompleteEvents(globalSearch, globalDropdown);
    }
    
    // Configurar autocomplete home
    if (homeSearch && homeDropdown) {
        setupAutocompleteEvents(homeSearch, homeDropdown);
    }
    
    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-search-box') && !e.target.closest('.search-form')) {
            closeAllSuggestions();
        }
    });
}

function setupAutocompleteEvents(inputElement, dropdownElement) {
    const updateSuggestions = () => {
        const val = inputElement.value.trim().toLowerCase();
        
        // Obter sugestões filtrando a base de dados
        let suggestionsList = [];
        
        if (val.length === 0) {
            // Se estiver vazio, exibir as sugestões padrão sugeridas pelo usuário
            suggestionsList = POPULAR_SUGGESTIONS;
        } else {
            // Filtrar desenhos cujos nomes correspondem
            const matches = allDrawings.filter(d => d.pt.toLowerCase().includes(val));
            // Extrair nomes únicos correspondentes
            const uniqueMatches = [...new Set(matches.map(d => d.pt.toLowerCase()))].slice(0, 5);
            suggestionsList = uniqueMatches;
            
            // Garantir que as palavras-chave sugeridas pelo usuário apareçam se baterem com o texto
            POPULAR_SUGGESTIONS.forEach(s => {
                if (s.includes(val) && !suggestionsList.includes(s)) {
                    suggestionsList.unshift(s);
                }
            });
            
            suggestionsList = suggestionsList.slice(0, 5);
        }
        
        // Renderizar sugestões
        if (suggestionsList.length > 0) {
            dropdownElement.innerHTML = '';
            suggestionsList.forEach(sug => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> <span>${sug}</span>`;
                item.onclick = (e) => {
                    e.stopPropagation();
                    inputElement.value = sug;
                    triggerSearch(sug);
                    closeAllSuggestions();
                };
                dropdownElement.appendChild(item);
            });
            dropdownElement.style.display = 'flex';
        } else {
            dropdownElement.style.display = 'none';
        }
    };
    
    inputElement.addEventListener('focus', updateSuggestions);
    inputElement.addEventListener('input', updateSuggestions);
}

function closeAllSuggestions() {
    const globalDropdown = document.getElementById('global-suggestions-dropdown');
    const homeDropdown = document.getElementById('home-suggestions-dropdown');
    if (globalDropdown) globalDropdown.style.display = 'none';
    if (homeDropdown) homeDropdown.style.display = 'none';
}

// --- AUXILIARES E CONSTRUTORES ---

// Criação de Card de Desenho individual (100% Grátis, sem cadeado)
function createDrawingCard(dw, position = null) {
    const card = document.createElement('div');
    card.className = 'drawing-card';
    card.setAttribute('data-id', dw.slug);
    card.setAttribute('data-category', dw.category);
    
    // Rank Badge para Top 50
    let rankBadgeHtml = '';
    if (position !== null) {
        let rankClass = 'rank-bronze';
        let medal = '🥉';
        if (position <= 3) {
            rankClass = 'rank-gold';
            medal = '🥇';
        } else if (position <= 10) {
            rankClass = 'rank-silver';
            medal = '🥈';
        }
        rankBadgeHtml = `<div class="rank-badge ${rankClass}">#${position} ${medal}</div>`;
    }
    
    // Badge do tier com suporte a tag Novo
    let badgeHtml = '<span class="badge-free">Grátis</span>';
    
    // Desenhos marcados como isNew recebem badge de Novo!
    if (dw.isNew) {
        badgeHtml = '<span class="badge-free" style="background-color: var(--color-yellow); border-color: var(--color-dark);"><i class="fa-solid fa-star"></i> Novo!</span>';
    }
    
    card.innerHTML = `
        ${rankBadgeHtml}
        <a href="/${dw.category}/${dw.slug}">
            <div class="card-img-wrapper">
                <img src="${dw.url}" alt="${dw.pt}" loading="lazy">
            </div>
        </a>
        <div class="card-bottom-info">
            <span class="drawing-card-category">${CATEGORIES_DATA[dw.category].name}</span>
            <h4 class="drawing-card-title">${dw.pt}</h4>
        </div>
        <div class="card-bottom">
            ${badgeHtml}
            <button class="btn-download-card" title="Baixar desenho"><i class="fa-solid fa-download"></i> Imprimir</button>
        </div>
    `;
    
    // Configurar download direto no clique
    const btnDl = card.querySelector('.btn-download-card');
    btnDl.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        triggerDrawingDownload(dw);
    });
    
    return card;
}

// Renderizar lista de desenhos em um grid container
function renderDrawingsInGrid(drawings, gridContainer) {
    if (!gridContainer) return;
    gridContainer.innerHTML = '';
    
    if (drawings.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border: 2px dashed var(--color-dark); border-radius: var(--radius-sm);">
                <span style="font-size: 3rem;">🧸</span>
                <h4 style="font-size: 1.3rem; margin-top:10px;">Nenhum desenho encontrado!</h4>
                <p style="color: var(--color-dark-light); font-size: 0.95rem;">Tente buscar por termos parecidos.</p>
            </div>
        `;
        return;
    }
    
    drawings.forEach((dw, idx) => {
        // Adicionar anúncio AdSense a cada 8 desenhos
        if (idx > 0 && idx % 8 === 0) {
            const adCard = document.createElement('div');
            adCard.className = 'simulated-ad-card';
            adCard.innerHTML = `
                <span class="ad-label">Anúncio AdSense</span>
                <h4 class="ad-title">Lápis de Cor Faber-Castell 🎨</h4>
                <p class="ad-desc">Caixa com 24 cores estojo metálico para os pequenos colorirem com alta qualidade.</p>
                <a href="https://google.com" target="_blank" class="btn btn-secondary btn-sm">Ver Ofertas</a>
            `;
            gridContainer.appendChild(adCard);
        }
        
        const card = createDrawingCard(dw);
        gridContainer.appendChild(card);
    });
}

// Disparar a busca global e navegar para categorias exibindo o resultado filtrado
function triggerSearch(query) {
    const cleanQuery = query.trim().toLowerCase();
    
    // Filtrar desenhos
    const matched = allDrawings.filter(d => 
        d.pt.toLowerCase().includes(cleanQuery) || 
        d.en.toLowerCase().includes(cleanQuery) ||
        CATEGORIES_DATA[d.category].name.toLowerCase().includes(cleanQuery)
    );
    
    // Navegar para uma view de categorias que exibe a busca
    document.title = `Busca por "${query}" — KidCanvas 🎨`;
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Ocultar todas as views de página
    document.querySelectorAll('.page-view').forEach(view => view.style.display = 'none');
    
    // Sincronizar o input do cabeçalho com a pesquisa efetuada
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) globalSearch.value = query;
    
    // Usar a view de categoria detalhe como grade dos resultados de busca
    const view = document.getElementById('view-categoria-detalhe');
    view.style.display = 'block';
    
    // Atualizar crumbs e cabeçalho do resultado
    document.getElementById('category-detail-title-crumb').textContent = `Busca: ${query}`;
    document.getElementById('category-detail-icon').textContent = '🔍';
    document.getElementById('category-detail-title').textContent = `Resultados para: "${query}"`;
    document.getElementById('category-detail-desc').textContent = `Encontramos desenhos na nossa biblioteca que combinam com sua busca!`;
    
    const countEl = document.getElementById('category-drawings-count');
    countEl.textContent = `${matched.length} desenhos encontrados`;
    
    const grid = document.getElementById('category-drawings-grid');
    renderDrawingsInGrid(matched, grid);
    
    // Sincronizar o filtro interno se existir
    const categorySearchInput = document.getElementById('category-drawings-search');
    if (categorySearchInput) {
        categorySearchInput.value = query;
        categorySearchInput.oninput = () => {
            const val = categorySearchInput.value.trim().toLowerCase();
            const searched = allDrawings.filter(d => 
                d.pt.toLowerCase().includes(val) || 
                d.en.toLowerCase().includes(val) ||
                CATEGORIES_DATA[d.category].name.toLowerCase().includes(val)
            );
            renderDrawingsInGrid(searched, grid);
            countEl.textContent = `${searched.length} desenhos encontrados`;
        };
    }
}

// Configurar a barra de pesquisa global do cabeçalho
const globalSearchInput = document.getElementById('global-search-input');
if (globalSearchInput) {
    globalSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = globalSearchInput.value.trim();
            if (query) {
                triggerSearch(query);
                closeAllSuggestions();
            } else {
                showToast('Digite alguma palavra-chave para buscar!', 'error');
            }
        }
    });
}

// Trigger real de download da imagem PNG
function triggerDrawingDownload(drawing) {
    showToast('Iniciando download em alta qualidade... 🖨️', 'success');
    
    const link = document.createElement('a');
    link.href = drawing.url;
    
    const fileName = `kidcanvas_${drawing.category}_${drawing.slug}.png`;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Notificação Toast estilo cartoon
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast active ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3500);
}

// Metas
function setMetaDescription(content) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', content);
    }
}

// 5. PÁGINA TOP 50 (Desenhos Mais Amados)
function renderTop50View() {
    document.title = "Top 50 Desenhos Mais Amados — KidCanvas 🏆";
    setMetaDescription("Descubra os 50 desenhos para colorir e imprimir mais amados pelas crianças e selecionados pela Vovó Sônia!");
    
    const view = document.getElementById('view-top50');
    view.style.display = 'block';
    
    const grid = document.getElementById('top50-drawings-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // Ordenar desenhos: Prioriza quem tem votos, depois por maior rating médio, depois por maior número de votos, e por fim pelo index do lançamento
    const sortedDrawings = [...allDrawings]
        .sort((a, b) => {
            const aHasVotes = a.votes > 0 ? 1 : 0;
            const bHasVotes = b.votes > 0 ? 1 : 0;
            
            if (bHasVotes !== aHasVotes) {
                return bHasVotes - aHasVotes; // Desenhos com votos vêm primeiro
            }
            
            if (b.rating !== a.rating) {
                return b.rating - a.rating; // Maior média de estrelas primeiro
            }
            
            if (b.votes !== a.votes) {
                return b.votes - a.votes; // Em caso de empate de estrelas, maior número de votos
            }
            
            return b.index - a.index; // Se empatar em tudo, os lançamentos mais novos primeiro
        })
        .slice(0, 50);
        
    sortedDrawings.forEach((dw, idx) => {
        const position = idx + 1;
        const card = createDrawingCard(dw, position);
        grid.appendChild(card);
    });
}
