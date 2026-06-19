/* ==========================================================================
   LÓGICA PRINCIPAL DO SITE KIDCANVAS.COM.BR
   Roteador SPA, Galeria 100% Grátis, Busca Global, Auto-Sugestões e Downloads
   ========================================================================== */

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
window.escapeHTML = escapeHTML;

// --- BASE DE DADOS DAS CATEGORIAS (12 ITENS) ---
const CATEGORIES_DATA = {
    'novidades': { name: 'Novidades', emoji: '✨', desc: 'Confira os novos desenhos para colorir e imprimir grátis no KidCanvas! Desenhos fresquinhos adicionados nos últimos 30 dias para pintar e se divertir.' },
    'animais-selvagens': { name: 'Animais Selvagens', emoji: '🦁', desc: 'Desenhos de Animais Selvagens para colorir e imprimir grátis! Encontre leões, pandas, girafas e outros bichos incríveis da floresta e da savana.' },
    'animais-do-mar': { name: 'Animais do Mar', emoji: '🦈', desc: 'Desenhos de Animais do Mar para colorir e imprimir grátis! Baixe imagens de peixes coloridos, baleias, golfinhos e tubarões divertidos do oceano.' },
    'animais-domesticos': { name: 'Animais Domésticos', emoji: '🐱', desc: 'Desenhos de Animais Domésticos para colorir e imprimir grátis! Baixe fotos de gatinhos, cachorrinhos, coelhos e outros amiguinhos para pintar.' },
    'dinossauros': { name: 'Dinossauros', emoji: '🦖', desc: 'Desenhos de Dinossauros para colorir e imprimir grátis! Divirta-se pintando o T-Rex, Tricerátops, Velociraptores e outros gigantes pré-históricos.' },
    'espaco': { name: 'Espaço Sideral', emoji: '🚀', desc: 'Desenhos do Espaço Sideral para colorir e imprimir grátis! Viaje pintando foguetes, astronautas, planetas distantes e alienígenas amigáveis.' },
    'veiculos': { name: 'Veículos e Carros', emoji: '🚗', desc: 'Desenhos de Veículos e Carros para colorir e imprimir grátis! Pinte carros velozes, aviões no céu, trens nos trilhos e caminhões de bombeiro.' },
    'comidas-e-doces': { name: 'Comidas e Doces', emoji: '🍩', desc: 'Desenhos de Comidas e Doces para colorir e imprimir grátis! Baixe desenhos de sorvetes gostosos, bolos de aniversário e frutas felizes para pintar.' },
    'fantasia': { name: 'Fantasia', emoji: '🦄', desc: 'Desenhos de Fantasia para colorir e imprimir grátis! Entre no mundo da imaginação com unicórnios mágicos, sereias cantoras e monstros fofos.' },
    'profissoes': { name: 'Profissões', emoji: '👩‍🚒', desc: 'Desenhos de Profissões para colorir e imprimir grátis! Inspire-se colorindo bombeiros corajosos, médicos atenciosos, professores e muito mais.' },
    'unicornios': { name: 'Unicórnios', emoji: '🦄', desc: 'Desenhos de Unicórnios para colorir e imprimir grátis! Lindas imagens de unicórnios mágicos com asas brilhantes, nuvens fofas e arco-íris encantados.' },
    'alfabeto-e-numeros': { name: 'Alfabeto e Números', emoji: '🔤', desc: 'Desenhos do Alfabeto e Números para colorir e imprimir grátis! Letras de A a Z e números de 0 a 9 grandes e vazados para pintar, brincar e aprender.' },
    'princesas': { name: 'Princesas', emoji: '👸', desc: 'Desenhos de Princesas para colorir e imprimir grátis! Imagens de princesas fofas com vestidos bonitos e tiaras brilhantes em reinos mágicos.' },
    'super-herois': { name: 'Super-Heróis', emoji: '🦸', desc: 'Desenhos de Super-Heróis para colorir e imprimir grátis! Baixe ilustrações de super-heróis e super-heroínas corajosos em aventuras incríveis.' },
    'flores-e-natureza': { name: 'Flores e Natureza', emoji: '🌸', desc: 'Desenhos de Flores e Natureza para colorir e imprimir grátis! Pinte flores lindas, jardins coloridos, árvores, florestas e borboletas encantadoras.' },
    'halloween': { name: 'Halloween', emoji: '🎃', desc: 'Desenhos de Halloween para colorir e imprimir grátis! Divirta-se pintando abóboras assustadoras, bruxinhas fofas, fantasmas e morcegos divertidos.' },
    'natal': { name: 'Natal', emoji: '🎄', desc: 'Desenhos de Natal para colorir e imprimir grátis! Baixe imagens de Papai Noel, árvores de Natal decoradas, bonecos de neve e renas fofas.' },
    'mandalas': { name: 'Mandalas', emoji: '🌀', desc: 'Desenhos de Mandalas para colorir e imprimir grátis! Encontre mandalas geométricas, florais e simples, perfeitas para relaxar e pintar.' },
    'folclore-brasileiro': { name: 'Folclore Brasileiro', emoji: '🏹', desc: 'Desenhos do Folclore Brasileiro para colorir e imprimir grátis! Encontre o Saci-Pererê, Curupira, Iara, Boto Cor-de-Rosa e outros personagens das lendas brasileiras.' },
    'esportes': { name: 'Esportes', emoji: '🏆', desc: 'Desenhos de Esportes para colorir e imprimir grátis! Baixe imagens de futebol, basquete, natação, ginástica e muitas outras modalidades divertidas.' },
    'robos': { name: 'Robôs', emoji: '🤖', desc: 'Desenhos de robôs fofos e inteligentes para colorir grátis! Baixe imagens de robôs astronautas, brinquedos e robôs amigos.' },
    'copa-do-mundo': { name: 'Copa do Mundo', emoji: '⚽', desc: 'Desenhos da Copa do Mundo para colorir grátis! Encontre jogadores com camisas de seleções, grandes estádios e a taça dos campeões.' },
    'monstros': { name: 'Monstros Infantil', emoji: '👾', desc: 'Desenhos de monstros infantis fofos para colorir e imprimir grátis! Encontre monstrinhos peludos, múmias fofas e zumbis amigáveis.' },
    'cowboys': { name: 'Cowboys', emoji: '🤠', desc: 'Desenhos de cowboys para colorir e imprimir grátis! Pinte cowboys em cavalos, no saloon, xerifes com laço e muito mais.' },
    'bandeiras': { name: 'Bandeiras', emoji: '🚩', desc: 'Desenhos de bandeiras de países para colorir e imprimir grátis! Pinte a bandeira do Brasil, Estados Unidos, Japão e muitas outras.' },
    'instrumentos-musicais': { name: 'Instrumentos Musicais', emoji: '🎸', desc: 'Desenhos de instrumentos musicais para colorir e imprimir grátis! Baixe desenhos de violão, piano, bateria, flauta e outros instrumentos.' },
    'brinquedos': { name: 'Brinquedos', emoji: '🧸', desc: 'Desenhos de brinquedos para colorir e imprimir grátis! Pinte ursinhos de pelúcia, bonecas, carrinhos, blocos de montar e muito mais.' },
    'fan-art': { name: 'Fan Art', emoji: '🎨', desc: 'Desenhos de Fan Art dos seus personagens favoritos para colorir! Pinte o Goku, Stitch, Pikachu, Super Mario, Homem-Aranha e muitos outros.' },
    'aves': { name: 'Aves', emoji: '🦜', desc: 'Desenhos de Aves e Passarinhos fofos para colorir e imprimir grátis! Pinte araras, papagaios, corujas, tucanos e outros passarinhos lindos.' },
    'bailarinas': { name: 'Bailarinas', emoji: '🩰', desc: 'Desenhos de Bailarinas para colorir e imprimir grátis! Pinte dançarinas fofas com sapatilhas, tutus brilhantes e poses clássicas de ballet.' },
    'salao-de-beleza': { name: 'Salão de Beleza', emoji: '💅', desc: 'Desenhos de Salão de Beleza e maquiagem para colorir grátis! Pinte esmaltes, batons, secadores de cabelo, espelhos e acessórios fofos.' },
    'guerreiros-e-lendas': { name: 'Guerreiros e Lendas', emoji: '⚔️', desc: 'Desenhos de Guerreiros e Lendas para colorir e imprimir grátis! Divirta-se pintando Cavaleiros medievais, Ninjas silenciosos, Vikings corajosos e Samurais.' },
    'paises-e-viagens': { name: 'Países e Viagens', emoji: '🌎', desc: 'Desenhos de Viagens e Países para colorir e imprimir grátis! Viaje pelo mundo colorindo pontos turísticos famosos, monumentos históricos e malas de viagem.' },
    'ciencias-e-corpo-humano': { name: 'Ciências e Corpo Humano', emoji: '🔬', desc: 'Desenhos de Ciências e Corpo Humano para colorir e aprender! Pinte órgãos humanos de forma divertida, telescópios, átomos e tubos de ensaio.' },
    'praia-e-estacoes': { name: 'Praia e Estações', emoji: '🏖️', desc: 'Desenhos de Praia, Férias e Estações do Ano para colorir grátis! Pinte dias ensolarados de verão, bonecos de neve no inverno, acampamentos e conchas.' },
    'fazenda': { name: 'Fazenda', emoji: '🚜', desc: 'Desenhos de Fazenda para colorir e imprimir grátis! Divirta-se pintando vaquinhas, porquinhos, ovelhas, tratores trabalhando e a vida no campo.' },
    'mundo-gamer': { name: 'Mundo Gamer', emoji: '🎮', desc: 'Desenhos de Mundo Gamer para colorir e imprimir grátis! Encontre controles de videogame, consoles modernos, personagens de pixel e cenários de jogos.' },
    'anime-garotos': { name: 'Garotos Anime', emoji: '👦', desc: 'Desenhos de Garotos Anime para colorir e imprimir grátis! Encontre heróis aventureiros, ninjas, guerreiros elementais, magos e espadachins.' },
    'anime-garotas': { name: 'Garotas Anime', emoji: '👧', desc: 'Desenhos de Garotas Anime para colorir e imprimir grátis! Pinte meninas mágicas, princesas de anime, idols cantoras, feiticeiras e heroínas.' },
    'anime-samurais-e-guerreiros': { name: 'Samurais Anime', emoji: '⚔️', desc: 'Desenhos de Samurais e Guerreiros de anime para colorir grátis! Pinte samurais jovens, mestres samurais, ronins lendários e guerreiras samurais.' },
    'anime-ninjas': { name: 'Ninjas Anime', emoji: '<img src="/ninja_icon.png" style="width: 1em; height: 1em; object-fit: contain; vertical-align: middle;" />', desc: 'Desenhos de Ninjas de anime para colorir e imprimir grátis! Encontre ninjas elementais, ninjas iniciantes, mestres das sombras e ninjas mágicos.' },
    'anime-mechas-e-robos': { name: 'Mechas e Robôs Anime', emoji: '🤖', desc: 'Desenhos de Mechas e Robôs gigantes de anime para colorir grátis! Pinte robôs amigáveis, pilotos de mecha, robôs animais e naves.' },
    'anime-kawaii': { name: 'Desenhos Kawaii', emoji: '🐱', desc: 'Desenhos Kawaii super fofos para colorir grátis! Pinte gatos, cachorros, pandas, capivaras, sorvetes e frutas no estilo kawaii japonês.' },
    'anime-criaturas-misticas': { name: 'Criaturas Místicas Anime', emoji: '🐉', desc: 'Desenhos de Criaturas Místicas de anime para colorir grátis! Baixe imagens de dragões, fênix, raposas mágicas de nove caudas e grifos.' },
    'anime-vida-escolar': { name: 'Vida Escolar Anime', emoji: '🏫', desc: 'Desenhos de Vida Escolar estilo anime para colorir e imprimir! Pinte salas de aula, festivais escolares, clubes de artes e amigos da escola.' },
    'anime-fantasia': { name: 'Fantasia Anime', emoji: '✨', desc: 'Desenhos de Fantasia estilo anime para colorir grátis! Baixe desenhos de reinos mágicos, castelos voadores, cristais e portais encantados.' },
    'anime-futurista': { name: 'Sci-Fi e Futurista Anime', emoji: '🚀', desc: 'Desenhos de Sci-Fi e Futurismo estilo anime para colorir! Pinte cidades futuristas, motos voadoras, naves e estações espaciais.' },
    'anime-gamer': { name: 'Gamer Anime', emoji: '🎮', desc: 'Desenhos Gamer estilo anime para colorir grátis! Encontre avatares de jogadores, guerreiros digitais, monstros de pixel e mundos virtuais.' },
    'lutas': { name: 'Lutas', emoji: '🥋', desc: 'Desenhos de Lutas e Artes Marciais para colorir e imprimir grátis! Encontre desenhos de karatê, judô, boxe, capoeira, kung fu e muito mais para pintar.' },
    'mundo-da-magica': { name: 'Mundo da Mágica', emoji: '🎩', desc: 'Desenhos do Mundo da Mágica para colorir e imprimir grátis! Pinte o pequeno mágico Mr. M Kids, cartolas com coelhos, livros de feitiços e castelos encantados.' },
    'destaques': { name: 'Destaques', emoji: '✨', desc: 'Os desenhos favoritos e mais populares no KidCanvas! Descubra e pinte ilustrações incríveis recomendadas por nossa comunidade.' }
};

const POPULAR_SUGGESTIONS = ['unicórnio', 'dinossauro', 'borboleta', 'leão', 'golfinho'];

// --- POOL DE FRASES POR CATEGORIA ---
const CATEGORY_PHRASES = {};

// --- ESTADO GLOBAL DA APLICAÇÃO ---
let allDrawings = [];
let lastSelectedPhrase = "";
let currentDrawingPhrase = "";
let categoryPaginationState = {
    drawings: [],
    currentIndex: 0,
    limit: 24,
    showTrendingFirstN: 0
};
let scrollPositions = {};

// --- LISTA DE CATEGORIAS DISPONÍVEIS PARA VISITANTES ---
const FREE_CATEGORIES = ['animais-selvagens', 'dinossauros', 'fantasia', 'flores-e-natureza', 'veiculos'];

// --- DICIONÁRIO DE TRADUÇÃO DE INGLÊS PARA ESPANHOL ---
const EN_TO_ES_DICT = {
    "dolphin": "delfín", "whale": "ballena", "shark": "tiburón", "lion": "león", "tiger": "tigre",
    "elephant": "elefante", "dog": "perro", "cat": "gato", "unicorn": "unicornio", "princess": "princesa",
    "castle": "castillo", "butterfly": "mariposa", "flower": "flor", "car": "coche", "train": "tren",
    "airplane": "avión", "rocket": "cohete", "astronaut": "astronauta", "sun": "sol", "moon": "luna",
    "star": "estrella", "robot": "robot", "bear": "oso", "monkey": "mono", "rabbit": "conejo",
    "panda": "panda", "giraffe": "jirafa", "zebra": "cebra", "turtle": "tortuga", "fish": "pez",
    "octopus": "pulpo", "crab": "cangrejo", "seahorse": "caballito de mar", "owl": "búho",
    "fox": "zorro", "deer": "ciervo", "squirrel": "ardilla", "frog": "rana", "bee": "abeja",
    "ladybug": "mariquita", "dragon": "dragón", "fairy": "hada", "mermaid": "sirena",
    "dinosaur": "dinosaurio", "truck": "camión", "bicycle": "bicicleta", "motorcycle": "motocicleta",
    "boat": "barco", "helicopter": "helicóptero", "submarine": "submarino", "fire-truck": "camión de bomberos",
    "firetruck": "camión de bomberos", "police-car": "coche de policía", "police car": "coche de policía",
    "ambulance": "ambulancia", "ice-cream": "helado", "ice cream": "helado", "cupcake": "magdalena",
    "cake": "pastel", "donut": "dona", "cookie": "galleta", "apple": "manzana", "banana": "plátano",
    "strawberry": "fresa", "orange": "naranja", "grape": "uva", "watermelon": "sandía",
    "pineapple": "piña", "carrot": "zanahoria", "tomato": "tomate", "broccoli": "brócoli",
    "corn": "maíz", "mushroom": "champiñón", "pumpkin": "calabaza", "house": "casa",
    "tree": "árbol", "cloud": "nube", "rainbow": "arcoíris", "mountain": "montaña",
    "river": "río", "sea": "mar", "beach": "playa", "shell": "concha", "starfish": "estrella de mar",
    "jellyfish": "medusa", "penguin": "pingüino", "koala": "koala", "kangaroo": "canguro",
    "camel": "camello", "hippo": "hipopótamo", "rhino": "rinoceronte", "crocodile": "cocodrilo",
    "snake": "serpiente", "lizard": "lagarto", "chameleon": "camaleón", "parrot": "loro",
    "flamingo": "flamenco", "swan": "cisne", "duck": "pato", "chicken": "pollo",
    "cow": "vaca", "horse": "caballo", "pig": "cerdo", "sheep": "oveja", "goat": "cabra",
    "mouse": "ratón", "puppy": "cachorro", "kitten": "gatito"
};

function getSpanishWord(englishWord) {
    if (!englishWord) return "";
    const clean = englishWord.toLowerCase().trim();
    return EN_TO_ES_DICT[clean] || clean;
}

// --- VERIFICAÇÃO DE ACESSO A DESENHOS POR PLANO ---
function isDrawingAccessible(dw) {
    const requiredPlan = getRequiredPlanForDrawing(dw);
    if (requiredPlan === 'Aprendiz') {
        return true;
    }
    if (!currentUser) return false;
    const plan = currentUser.plan || 'Aprendiz';
    if (plan === 'Aprendiz' || plan === 'Grátis') {
        return false;
    }
    return true;
}

function getRequiredPlanForDrawing(dw) {
    if (dw.isNew) {
        return 'Artista';
    }
    if (typeof allDrawings !== 'undefined' && Array.isArray(allDrawings) && allDrawings.length > 0) {
        const categoryDrawings = allDrawings.filter(d => d.category === dw.category);
        const indexInCat = categoryDrawings.findIndex(d => d.slug === dw.slug);
        if (indexInCat !== -1 && indexInCat >= 42) {
            return 'Artista';
        }
    } else {
        // Fallback de segurança se o array global ainda não carregou
        if (dw.index && dw.index > 2000) {
            return 'Artista';
        }
    }
    return 'Aprendiz';
}

// --- LIMITE DE DESENHOS POR PLANO ---
// Visitante (sem login): 500 | Aprendiz: 2.000 | Artista+: todos
function getDrawingsLimit() {
    if (!currentUser) return 500;
    const plan = currentUser.plan || 'Aprendiz';
    if (plan === 'Aprendiz' || plan === 'Grátis') return 2000;
    return Infinity; // Artista, Mago, Lenda = todos
}

// Filtra os desenhos visíveis respeitando o limite do plano do usuário
// Exclui novidades para não-Artista e aplica o teto de quantidade
function getVisibleDrawings(drawingsArray, categorySlug) {
    // Novidades é 100% bloqueado para não-Artista
    if (categorySlug === 'novidades') {
        const userPlan = currentUser ? (currentUser.plan || 'Aprendiz') : 'Grátis';
        if (!currentUser || userPlan === 'Aprendiz' || userPlan === 'Grátis') {
            return []; // Bloqueado totalmente
        }
    }
    
    const limit = getDrawingsLimit();
    if (limit === Infinity) return drawingsArray;
    return drawingsArray.slice(0, limit);
}


// --- SISTEMA DE AUTENTICAÇÃO E SESSÃO ---
let sessionToken = localStorage.getItem("kidcanvas_session_token") || null;
let currentUser = null;

async function syncUserProfile() {
    if (!sessionToken) {
        updateHeaderAuthDisplay();
        return;
    }
    try {
        const res = await fetch('/api/auth/me', {
            headers: { 'X-Session-Token': sessionToken }
        });
        const data = await res.json();
        if (res.ok && data.success) {
            currentUser = data.user;
            updateHeaderAuthDisplay();
            checkNewAchievements();
            if (data.newlyUnlockedCertificates && data.newlyUnlockedCertificates.length > 0) {
                checkNewlyUnlockedCertificates(data.newlyUnlockedCertificates);
            }
            if(typeof checkActiveEvent === 'function') checkActiveEvent();
        } else {
            sessionToken = null;
            currentUser = null;
            localStorage.removeItem("kidcanvas_session_token");
            updateHeaderAuthDisplay();
        }
    } catch(e) {
        console.error("Erro ao sincronizar perfil:", e);
        updateHeaderAuthDisplay();
    }
}

function showWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.classList.add('open');
    }
}

function closeWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

function updateHeaderAuthDisplay() {
    const googleBtn = document.getElementById('google-signin-btn-header');
    const btnEntrar = document.getElementById('btn-entrar-header');
    const userWidget = document.getElementById('user-profile-widget');
    
    const dropdownAvatar = document.getElementById('dropdown-user-avatar');
    const dropdownDisplayName = document.getElementById('dropdown-user-display-name');
    const dropdownPlanBadge = document.getElementById('dropdown-user-plan-badge');
    
    // Elementos do Perfil Direto no Header
    const userAvatarImg = document.getElementById('user-avatar-img');
    const userDisplayName = document.getElementById('user-display-name');
    const userPlanBadge = document.getElementById('user-plan-badge');
    
    const batterySegments = document.getElementById('battery-segments');
    const headerCreditsCount = document.getElementById('header-credits-count');
    
    const creatorPanel = document.getElementById('creator-dashboard-panel');
    const creatorLoggedIn = document.getElementById('creator-dashboard-logged-in');
    const creatorLoggedOut = document.getElementById('creator-dashboard-logged-out');
    const creatorName = document.getElementById('creator-dashboard-name');
    const creatorCredits = document.getElementById('creator-dashboard-credits');
    const generatorLoginGate = document.getElementById('gerar-desenho-login-gate');

    if (!userWidget) return;

    if (currentUser) {
        if (googleBtn) googleBtn.style.display = 'none';
        if (btnEntrar) btnEntrar.style.display = 'none';
        userWidget.style.display = 'flex';
        
        // Atualizar Foto/Avatar (Header e Dropdown)
        const userAvatar = currentUser.avatar || currentUser.photo || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
        updateUserAvatarUI(userAvatar);
        
        // Atualizar Nome (Header e Dropdown)
        const shortName = currentUser.name ? currentUser.name.split(' ')[0] : 'Nome';
        if (userDisplayName) userDisplayName.textContent = shortName;
        if (dropdownDisplayName) dropdownDisplayName.textContent = shortName;
        
        // Atualizar Badge de Plano (Header e Dropdown)
        [userPlanBadge, dropdownPlanBadge].forEach(badge => {
            if (badge) {
                const planName = currentUser.plan || 'Aprendiz';
                badge.textContent = planName;
                if (planName === 'Aprendiz' || planName === 'Grátis') {
                    badge.style.backgroundColor = 'var(--color-green)';
                    badge.textContent = 'Aprendiz 👶';
                } else if (planName === 'Artista') {
                    badge.style.backgroundColor = 'var(--color-purple)';
                    badge.textContent = 'Artista 🎨';
                } else if (planName === 'Mago Criador' || planName === 'Professor' || planName === 'Premium') {
                    badge.style.backgroundColor = 'var(--color-blue)';
                    badge.textContent = 'Mago 🧙';
                } else if (planName === 'Lenda KidCanvas' || planName === 'Colégio' || planName === 'Ultra') {
                    badge.style.backgroundColor = 'var(--color-yellow)';
                    badge.textContent = 'Lenda 👑';
                } else {
                    badge.style.backgroundColor = 'var(--color-dark-light)';
                    badge.textContent = planName;
                }
            }
        });

        const credits = currentUser.paginasRestantes || 0;
        
        // Atualizar Medidor de Bateria (iPhone Coins Meter)
        if (headerCreditsCount) {
            headerCreditsCount.textContent = credits;
        }
        
        if (batterySegments) {
            batterySegments.innerHTML = '';
            
            // Determinar capacidade máxima por plano para calcular porcentagem real
            let maxCapacity = 3;
            const plan = currentUser.plan || 'Aprendiz';
            if (plan === 'Aprendiz' || plan === 'Grátis') {
                maxCapacity = 3;
            } else if (plan === 'Artista' || plan === 'Família') {
                maxCapacity = 30;
            } else if (plan === 'Mago Criador' || plan === 'Professor' || plan === 'Premium') {
                maxCapacity = 100;
            } else if (plan === 'Lenda KidCanvas' || plan === 'Colégio' || plan === 'Ultra') {
                maxCapacity = 250;
            } else {
                maxCapacity = 100;
            }
            
            const percentage = Math.min(100, Math.max(0, Math.floor((credits / maxCapacity) * 100)));
            
            // Definir número de segmentos (de 0 a 5)
            let segmentCount = 0;
            if (credits > 0) {
                segmentCount = Math.max(1, Math.ceil((percentage / 100) * 5));
            }
            
            // Definir cor com base na quantidade de segmentos
            let segmentColor = '#2ECC71'; // Verde
            if (segmentCount <= 1) {
                segmentColor = '#E74C3C'; // Vermelho
            } else if (segmentCount <= 2) {
                segmentColor = '#E67E22'; // Laranja
            } else if (segmentCount <= 3) {
                segmentColor = '#F39C12'; // Amarelo/Laranja
            }
            
            // Criar elementos de segmento
            for (let i = 0; i < segmentCount; i++) {
                const seg = document.createElement('div');
                seg.className = 'battery-segment';
                seg.style.backgroundColor = segmentColor;
                batterySegments.appendChild(seg);
            }
        }

        // Atualizar contador de selos no header
        if (typeof updateHeaderAchievementCount === 'function') {
            updateHeaderAchievementCount();
        }

        // Mostrar menu admin se for o administrador
        const adminMenuSection = document.getElementById('admin-menu-section');
        if (adminMenuSection) {
            adminMenuSection.style.display = (currentUser.email === 'foneoliver@gmail.com') ? 'block' : 'none';
        }

        // Dashboard do Criador (painel da home)
        if (creatorPanel) {
            creatorPanel.style.display = 'block';
            if (creatorLoggedIn) creatorLoggedIn.style.display = 'block';
            if (creatorLoggedOut) creatorLoggedOut.style.display = 'none';
            if (creatorName) creatorName.textContent = currentUser.name.split(' ')[0];
            if (creatorCredits) {
                let boltColor = '#95A5A6';
                if (credits >= 400) boltColor = '#FFD700';
                else if (credits >= 200) boltColor = '#E67E22';
                else if (credits >= 1) boltColor = '#E74C3C';
                creatorCredits.innerHTML = `${credits} <span style="color: ${boltColor}; font-weight: bold; text-shadow: 0 0 2px rgba(0,0,0,0.5);">⚡</span>`;
            }
        }
        
        if (generatorLoginGate) {
            generatorLoginGate.style.display = 'none';
        }
    } else {
        if (googleBtn) googleBtn.style.display = 'none';
        if (btnEntrar) btnEntrar.style.display = 'inline-flex';
        userWidget.style.display = 'none';

        if (creatorPanel) {
            creatorPanel.style.display = 'block';
            if (creatorLoggedIn) creatorLoggedIn.style.display = 'none';
            if (creatorLoggedOut) creatorLoggedOut.style.display = 'block';
        }
        
        if (generatorLoginGate) {
            generatorLoginGate.style.display = 'block';
        }
    }
    
    if (typeof window.updateGenerateButtonText === 'function') {
        window.updateGenerateButtonText();
    }
    if (typeof window.updateCustomDrawingSubmitButtonText === 'function') {
        window.updateCustomDrawingSubmitButtonText();
    }
}

function updateCustomDrawingSubmitButtonText() {
    const submitBtn = document.getElementById('btn-submit-custom-drawing');
    if (!submitBtn) return;
    
    if (!currentUser) {
        submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Faça login para gerar';
        return;
    }
    
    const checkedQuality = document.querySelector('input[name="customDrawingQuality"]:checked');
    const imageQuality = checkedQuality ? checkedQuality.value : 'medium';
    if (imageQuality === 'high') {
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Desenho (3 créditos)';
    } else {
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Desenho (1 crédito)';
    }
}
window.updateCustomDrawingSubmitButtonText = updateCustomDrawingSubmitButtonText;

async function initGoogleSignIn() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        const clientId = config.googleClientId;
        if (!clientId) {
            console.warn("[Google Auth] Client ID não configurado no backend.");
            return;
        }

        google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse
        });

        const googleBtn = document.getElementById("google-signin-btn-header");
        if (googleBtn) {
            const isMobile = window.innerWidth <= 768;
            google.accounts.id.renderButton(googleBtn, {
                theme: "outline",
                size: isMobile ? "small" : "medium",
                shape: "pill",
                text: "signin_with",
                logo_alignment: "left"
            });
        }

        const modalBtn = document.getElementById("google-signin-btn-modal");
        if (modalBtn) {
            google.accounts.id.renderButton(modalBtn, {
                theme: "outline",
                size: "large",
                shape: "pill",
                text: "signin_with",
                width: 280
            });
        }
    } catch (err) {
        console.error("[Google Auth] Erro ao inicializar o Google Sign-In:", err);
    }
}

async function handleGoogleCredentialResponse(response) {
    try {
        console.log("[Google Auth] Login efetuado, enviando token ao servidor...");
        const refCode = localStorage.getItem('kidcanvas_ref') || undefined;
        const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credential: response.credential, refCode })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            sessionToken = data.token;
            localStorage.setItem("kidcanvas_session_token", sessionToken);
            currentUser = data.user;
            
            updateHeaderAuthDisplay();
            closeAuthModal();
            if (data.isNewUser) {
                showWelcomeModal();
            } else {
                showToast(`Bem-vindo, ${currentUser.name}! 👋`, 'success');
            }
            await checkPendingUpgrade();
            navigate(window.location.pathname, false);
            
            // Recarregar a página se estiver na tela de histórias mágicas para sincronizar
            if (window.location.pathname.includes('/historias-magicas') || window.location.pathname.includes('historia.html')) {
                window.location.reload();
            }
        } else {
            showToast(`Erro na autenticação: ${data.message}`, 'error');
        }
    } catch (err) {
        console.error("[Google Auth Error]:", err);
        showToast("Erro ao conectar ao servidor para autenticação com Google.", "error");
    }
}

function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('open');
        switchAuthTab('login');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

function switchAuthTab(tab) {
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const tabs = document.getElementById('authTabsContainer');
    const recoveryTitle = document.getElementById('recoveryTitle');
    
    if (!tabLogin || !tabRegister || !loginForm || !registerForm) return;
    
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
    if (tabs) tabs.style.display = 'flex';
    if (recoveryTitle) recoveryTitle.style.display = 'none';
    
    if (tab === 'login') {
        tabLogin.style.color = 'var(--color-purple)';
        tabLogin.style.borderBottomColor = 'var(--color-purple)';
        tabRegister.style.color = 'var(--color-dark-light)';
        tabRegister.style.borderBottomColor = 'transparent';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        tabRegister.style.color = 'var(--color-purple)';
        tabRegister.style.borderBottomColor = 'var(--color-purple)';
        tabLogin.style.color = 'var(--color-dark-light)';
        tabLogin.style.borderBottomColor = 'transparent';
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function togglePasswordVisibility(inputId, element) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = element.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.className = 'fa-solid fa-eye-slash';
    } else {
        input.type = 'password';
        if (icon) icon.className = 'fa-solid fa-eye';
    }
}

function showForgotPasswordForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotPasswordForm');
    const tabs = document.getElementById('authTabsContainer');
    const recoveryTitle = document.getElementById('recoveryTitle');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'none';
    if (forgotForm) forgotForm.style.display = 'block';
    if (tabs) tabs.style.display = 'none';
    if (recoveryTitle) recoveryTitle.style.display = 'block';
}

function showLoginFormFromForgot() {
    const forgotForm = document.getElementById('forgotPasswordForm');
    const loginForm = document.getElementById('loginForm');
    const tabs = document.getElementById('authTabsContainer');
    const recoveryTitle = document.getElementById('recoveryTitle');
    
    if (forgotForm) forgotForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'block';
    if (tabs) tabs.style.display = 'flex';
    if (recoveryTitle) recoveryTitle.style.display = 'none';
    
    switchAuthTab('login');
}

async function handleForgotPasswordSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();
    if (!email) return;
    
    try {
        const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            let successMsg = 'E-mail de recuperação enviado com sucesso!';
            if (data.mockLink) {
                successMsg += `<br><br><strong>Link de teste gerado:</strong><br><a href="${data.mockLink}" style="color: var(--color-purple); font-weight: bold; word-break: break-all;">${data.mockLink}</a>`;
                
                const forgotForm = document.getElementById('forgotPasswordForm');
                if (forgotForm) {
                    forgotForm.innerHTML = `
                        <div style="background-color: var(--color-purple-light); border: 2px dashed var(--color-purple); border-radius: var(--radius-sm); padding: 15px; margin-bottom: 20px; text-align: left;">
                            <p style="font-size: 0.95rem; color: var(--color-dark); margin-bottom: 10px; line-height: 1.4;">✨ <strong>Ambiente de Testes:</strong> Como não temos um servidor SMTP real configurado, clique no link abaixo para redefinir sua senha agora:</p>
                            <a href="${data.mockLink}" style="color: var(--color-purple); font-weight: bold; word-break: break-all; display: block; font-size: 0.95rem;">${data.mockLink}</a>
                        </div>
                        <button class="btn btn-secondary" onclick="location.reload()" style="font-size: 1.1rem; padding: 12px; width: 100%; border-radius: var(--radius-sm); font-weight: 700;">Recarregar Página 🔄</button>
                    `;
                    return;
                }
            }
            showToast(successMsg, 'success', 8000);
        } else {
            showToast(`Erro: ${data.message}`, 'error');
        }
    } catch(err) {
        console.error('Erro ao solicitar recuperação de senha:', err);
        showToast('Erro ao conectar ao servidor para recuperar senha.', 'error');
    }
}

async function handleResetPasswordSubmit(event) {
    event.preventDefault();
    const newPassword = document.getElementById('resetNewPassword').value;
    if (!newPassword || newPassword.length < 4) {
        showToast('A senha precisa ter no mínimo 4 caracteres.', 'warning');
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (!token) {
        showToast('Token de redefinição ausente na URL.', 'error');
        return;
    }
    
    try {
        const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            showToast('Senha redefinida com sucesso! Redirecionando para login...', 'success');
            setTimeout(() => {
                window.history.replaceState({}, document.title, window.location.pathname);
                navigate('/');
                openAuthModal();
            }, 2000);
        } else {
            showToast(`Erro ao redefinir: ${data.message}`, 'error');
        }
    } catch(err) {
        console.error('Erro ao redefinir senha:', err);
        showToast('Erro ao conectar ao servidor para redefinir senha.', 'error');
    }
}

window.togglePasswordVisibility = togglePasswordVisibility;
window.showForgotPasswordForm = showForgotPasswordForm;
window.showLoginFormFromForgot = showLoginFormFromForgot;
window.handleForgotPasswordSubmit = handleForgotPasswordSubmit;
window.handleResetPasswordSubmit = handleResetPasswordSubmit;

function renderResetPasswordView() {
    document.title = "Redefinir Senha — KidCanvas 🔒";
    const view = document.getElementById('view-reset-password');
    if (view) view.style.display = 'block';
}
window.renderResetPasswordView = renderResetPasswordView;

async function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            sessionToken = data.token;
            localStorage.setItem("kidcanvas_session_token", sessionToken);
            currentUser = data.user;
            
            updateHeaderAuthDisplay();
            closeAuthModal();
            showToast(`Bem-vindo de volta, ${currentUser.name}! 👋`, 'success');
            await checkPendingUpgrade();
            navigate(window.location.pathname, false);
        } else {
            showToast(`Erro no login: ${data.message}`, 'error');
        }
    } catch(err) {
        console.error(err);
        showToast("Erro ao conectar com o servidor para login.", 'error');
    }
}

async function handleRegisterSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    
    try {
        const refCode = localStorage.getItem('kidcanvas_ref') || undefined;
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, refCode })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            sessionToken = data.token;
            localStorage.setItem("kidcanvas_session_token", sessionToken);
            currentUser = data.user;
            
            updateHeaderAuthDisplay();
            closeAuthModal();
            showWelcomeModal();
            await checkPendingUpgrade();
            navigate(window.location.pathname, false);
        } else {
            showToast(`Erro no cadastro: ${data.message}`, 'error');
        }
    } catch(err) {
        console.error(err);
        showToast("Erro ao conectar com o servidor para cadastro.", 'error');
    }
}


function handleHeaderLogout() {
    sessionToken = null;
    currentUser = null;
    localStorage.removeItem("kidcanvas_session_token");
    updateHeaderAuthDisplay();
    showToast("Você saiu da sua conta.", "info");
    
    if (window.location.pathname.includes('/historias-magicas') || window.location.pathname.includes('historia.html')) {
        window.location.reload();
    }
}

function checkGsiLoaded() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
        initGoogleSignIn();
    } else {
        setTimeout(checkGsiLoaded, 100);
    }
}

// --- INICIALIZAÇÃO ---
window.addEventListener('DOMContentLoaded', async () => {
    // Intercept Google OAuth redirect token and ref code
    const urlParams = new URLSearchParams(window.location.search);
    const googleToken = urlParams.get('google_token');
    const isNewUserQuery = urlParams.get('is_new_user');
    const refCode = urlParams.get('ref');

    if (refCode) {
        localStorage.setItem('kidcanvas_ref', refCode);
    }

    if (googleToken) {
        localStorage.setItem("kidcanvas_session_token", googleToken);
        sessionToken = googleToken;
        
        let newUrl = window.location.pathname;
        if (isNewUserQuery === 'true') {
            newUrl += '?is_new_user=true';
        }
        window.history.replaceState({}, document.title, newUrl);
    }

    if (isNewUserQuery === 'true' || urlParams.get('is_new_user') === 'true') {
        showWelcomeModal();
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }

    // Intercept Stripe checkout parameters
    const checkoutStatus = urlParams.get('checkout');
    if (checkoutStatus === 'success') {
        showToast('Parabéns! Sua assinatura foi processada com sucesso. Seu plano será ativado em instantes! 🎉', 'success');
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    } else if (checkoutStatus === 'cancel') {
        showToast('O checkout foi cancelado. Você pode tentar novamente a qualquer momento.', 'info');
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
    
    // Inicializar desafio ativo a partir do sessionStorage se existir
    try {
        const savedChallenge = sessionStorage.getItem('kidcanvas_active_challenge');
        if (savedChallenge) {
            window.activeDrawingChallenge = JSON.parse(savedChallenge);
        }
    } catch (err) {
        console.error('Erro ao ler kidcanvas_active_challenge:', err);
    }

    // Carregar catálogo de cards na inicialização
    try {
        const res = await fetch('/api/store/catalog');
        const data = await res.json();
        if (data.success) {
            window.globalCatalog = data.catalog;
        }
    } catch(e) {
        console.error('Erro ao carregar catálogo na inicialização:', e);
    }

    await syncUserProfile();
    checkGsiLoaded();
    await loadDrawings();
    initGlobalEventListeners();
    initSearchAutocomplete();
    
    // Roteamento inicial baseado na URL atual
    navigate(window.location.pathname, false);

    // Abrir modal de login se foi redirecionado
    if (localStorage.getItem("kidcanvas_trigger_auth") === "true") {
        localStorage.removeItem("kidcanvas_trigger_auth");
        openAuthModal();
    }
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
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const navbar = document.getElementById('navbar');

    // Interceptar cliques em links locais para fazer transição SPA
    document.addEventListener('click', (e) => {
        const targetLink = e.target.closest('a');
        if (targetLink) {
            const href = targetLink.getAttribute('href');
            
            // Alternar dropdowns ao clicar
            if (targetLink.classList.contains('dropdown-toggle')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                const dropdownMenu = targetLink.nextElementSibling;
                
                // Fecha outros dropdowns abertos
                document.querySelectorAll('#navbar ul.dropdown-menu').forEach(menu => {
                    if (menu !== dropdownMenu) {
                        menu.classList.remove('show');
                        menu.previousElementSibling.classList.remove('open');
                    }
                });

                if (dropdownMenu) {
                    const isOpen = dropdownMenu.classList.toggle('show');
                    targetLink.classList.toggle('open', isOpen);
                }
                return;
            }
            
            // Evitar comportamento padrão para links vazios
            if (href === '#') {
                e.preventDefault();
            }
            
            
            
            // Interceptar apenas links locais válidos (não externos, não âncoras vazias, não arquivos estáticos como .html, e não as rotas de histórias mágicas)
            if (href && href.startsWith('/') && !href.startsWith('//') && !href.endsWith('.html') && !href.includes('.html?')) {
                e.preventDefault();
                if (navbar) {
                    navbar.classList.remove('open');
                    const icon = menuToggleBtn ? menuToggleBtn.querySelector('i') : null;
                    if (icon) icon.className = 'fa-solid fa-bars';
                }
                navigate(href);
            }
        }
    });
    
    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        if (e.target.closest('.dropdown-toggle')) return;
        document.querySelectorAll('#navbar ul.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
        document.querySelectorAll('#navbar .dropdown-toggle').forEach(btn => {
            btn.classList.remove('open');
        });
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

    // Alternar expansão da busca compacta no clique da lupa
    const searchToggleBtn = document.getElementById('search-toggle-btn');
    const headerSearchBox = document.getElementById('header-search-box');
    const globalSearchInput = document.getElementById('global-search-input');
    
    if (searchToggleBtn && headerSearchBox && globalSearchInput) {
        searchToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = headerSearchBox.classList.toggle('expanded');
            if (isExpanded) {
                globalSearchInput.focus();
            }
        });
        
        globalSearchInput.addEventListener('focus', () => {
            headerSearchBox.classList.add('expanded');
        });
        
        globalSearchInput.addEventListener('blur', () => {
            if (globalSearchInput.value.trim() === '') {
                headerSearchBox.classList.remove('expanded');
            }
        });
        
        // Fechar busca ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#header-search-box')) {
                if (globalSearchInput.value.trim() === '') {
                    headerSearchBox.classList.remove('expanded');
                }
            }
        });
    }

    // Menu hambúrguer mobile toggle
    if (menuToggleBtn && navbar) {
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navbar.classList.toggle('open');
            const icon = menuToggleBtn.querySelector('i');
            if (icon) {
                if (isOpen) {
                    icon.className = 'fa-solid fa-xmark';
                } else {
                    icon.className = 'fa-solid fa-bars';
                }
            }
        });
        
        // Fechar menu hambúrguer ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#navbar') && !e.target.closest('#menu-toggle-btn')) {
                navbar.classList.remove('open');
                const icon = menuToggleBtn.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        });
    }

    // Toggle engrenagem settings dropdown
    const btnProfileSettings = document.getElementById('btn-profile-settings');
    const profileDropdownMenu = document.getElementById('profile-dropdown-menu');
    if (btnProfileSettings && profileDropdownMenu) {
        btnProfileSettings.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdownMenu.classList.toggle('open');
        });
        
        // Fechar dropdown de perfil ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-settings-dropdown-wrapper')) {
                profileDropdownMenu.classList.remove('open');
            }
        });
    }

    // Configurar botão de "Carregar mais" da categoria
    const btnLoadMore = document.getElementById('btn-load-more-category');
    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', () => {
            loadNextCategoryDrawings();
        });
    }

    // Clique no avatar ou nome do usuário no header leva ao perfil
    const userAvatarContainer = document.getElementById('user-avatar-container');
    const userMetaInfo = document.querySelector('.user-meta-info');
    if (userAvatarContainer) {
        userAvatarContainer.addEventListener('click', () => {
            navigate('/perfil');
        });
    }
    if (userMetaInfo) {
        userMetaInfo.addEventListener('click', () => {
            navigate('/perfil');
        });
    }
}

function navigate(path, pushState = true) {
    if (window.paintAutosaveInterval) {
        clearInterval(window.paintAutosaveInterval);
        window.paintAutosaveInterval = null;
    }
    let cleanPath = path.trim();
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
    }
    
    // Salvar posição de scroll antes de navegar
    const oldPath = window.location.pathname;
    if (oldPath.startsWith('/categoria/')) {
        scrollPositions[oldPath] = window.scrollY;
    }
    
    // Fechar dropdowns de navegação (perfil e hambúrguer mobile) ao navegar
    const profileDropdownMenu = document.getElementById('profile-dropdown-menu');
    if (profileDropdownMenu) {
        profileDropdownMenu.classList.remove('open');
    }
    const navbar = document.getElementById('navbar');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    if (navbar) {
        navbar.classList.remove('open');
        if (menuToggleBtn) {
            const icon = menuToggleBtn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        }
    }
    
    // Ocultar todas as views de página
    document.querySelectorAll('.page-view').forEach(view => {
        view.style.display = 'none';
    });
    
    // Fechar dropdowns de sugestão de busca abertos
    closeAllSuggestions();
    
    // Restaurar scroll se estiver voltando para a categoria
    let restored = false;
    if (cleanPath.startsWith('/categoria/')) {
        const catSlug = cleanPath.replace('/categoria/', '');
        const oldParts = oldPath.split('/').filter(Boolean);
        const cameFromDrawingInSameCategory = oldParts.length === 2 && oldParts[0] === catSlug && CATEGORIES_DATA[catSlug];
        
        if ((cameFromDrawingInSameCategory || !pushState) && scrollPositions[cleanPath] !== undefined) {
            const savedScroll = scrollPositions[cleanPath];
            setTimeout(() => {
                window.scrollTo({ top: savedScroll, behavior: 'instant' });
            }, 50);
            restored = true;
        }
    }
    
    if (!restored) {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
    
    // Roteamento
    if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '') {
        renderHomeView();
    } else if (cleanPath === '/reset-password') {
        renderResetPasswordView();
    } else if (cleanPath === '/categorias') {
        renderCategoriasView();
    } else if (cleanPath === '/top50') {
        renderTop50View();
    } else if (cleanPath === '/planos') {
        renderPlanosView();
    } else if (cleanPath === '/gerar-desenho') {
        renderGerarDesenhoView();
    } else if (cleanPath === '/historias-magicas' || cleanPath === '/historia') {
        renderHistoriasMagicasView();
    } else if (cleanPath === '/historias-exemplo') {
        renderHistoriasExemploView();
    } else if (cleanPath === '/politica-de-privacidade') {
        renderPoliticaPrivacidadeView();
    } else if (cleanPath === '/reportar-bug') {
        renderReportarBugView();
    } else if (cleanPath === '/minhas-criacoes') {
        renderMinhasCriacoesView();
    } else if (cleanPath === '/hall-da-fama') {
        renderHallDaFamaView();
    } else if (cleanPath === '/pintar-online') {
        renderPintarOnlineView();
    } else if (cleanPath === '/pintura-livre') {
        renderPinturaLivreChooser();
    } else if (cleanPath === '/conquistas') {
        renderConquistasView();
    } else if (cleanPath === '/certificados') {
        if (!currentUser) {
            showToast('Faça login ou cadastre-se para ver seus certificados! 📜', 'info');
            openAuthModal();
            renderHomeView();
            cleanPath = '/';
        } else {
            renderCertificadosView();
        }
    } else if (cleanPath === '/perfil') {
        if (!currentUser) {
            showToast('Faça login ou cadastre-se para ver seu perfil! 👤', 'info');
            openAuthModal();
            renderHomeView();
            cleanPath = '/';
        } else {
            renderPerfilView();
        }
    } else if (cleanPath.startsWith('/categoria/')) {
        const categorySlug = cleanPath.replace('/categoria/', '');
        const isNovidades = categorySlug === 'novidades';
        const userPlan = currentUser ? (currentUser.plan || 'Aprendiz') : 'Grátis';
        const isNovidadesLocked = isNovidades && (!currentUser || userPlan === 'Aprendiz' || userPlan === 'Grátis');
        
        if (isNovidadesLocked) {
            showToast('Esta categoria requer o plano Artista! Faça upgrade para acessar. 🚀', 'info');
            renderPlanosView();
            cleanPath = '/planos';
        } else if (!currentUser && !FREE_CATEGORIES.includes(categorySlug)) {
            showToast('Cadastre-se grátis para desbloquear todas as categorias! 🎨', 'info');
            openAuthModal();
            renderHomeView();
            cleanPath = '/';
        } else {
            renderCategoriaDetalheView(categorySlug);
        }
    } else {
        // Possível rota de desenho individual: /:categoria-slug/:desenho-slug
        const parts = cleanPath.split('/').filter(p => p !== '');
        if (parts.length === 2 && CATEGORIES_DATA[parts[0]]) {
            if (!currentUser && !FREE_CATEGORIES.includes(parts[0])) {
                showToast('Cadastre-se grátis para desbloquear todos os desenhos! 🎨', 'info');
                openAuthModal();
                renderHomeView();
                cleanPath = '/';
            } else {
                const dw = allDrawings.find(d => d.category === parts[0] && d.slug === parts[1]);
                if (dw && !isDrawingAccessible(dw)) {
                    const requiredPlan = getRequiredPlanForDrawing(dw);
                    showToast(`Este desenho requer o plano ${requiredPlan}! Faça upgrade para acessar. 🎨`, 'info');
                    renderPlanosView();
                    cleanPath = '/planos';
                } else {
                    renderDesenhoIndividualView(parts[0], parts[1]);
                }
            }
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

// PLANOS VIEW
let currentBillingCycle = 'mensal';

function setBillingCycle(cycle) {
    currentBillingCycle = cycle;
    
    const toggleMensal = document.getElementById('toggle-mensal');
    const toggleAnual = document.getElementById('toggle-anual');
    
    if (cycle === 'mensal') {
        if (toggleMensal) toggleMensal.classList.add('active');
        if (toggleAnual) toggleAnual.classList.remove('active');
        
        const priceArtista = document.getElementById('price-artista');
        const priceMago = document.getElementById('price-mago');
        const priceLenda = document.getElementById('price-lenda');
        if (priceArtista) priceArtista.textContent = '9,90';
        if (priceMago) priceMago.textContent = '19,90';
        if (priceLenda) priceLenda.textContent = '39,90';
    } else {
        if (toggleMensal) toggleMensal.classList.remove('active');
        if (toggleAnual) toggleAnual.classList.add('active');
        
        const priceArtista = document.getElementById('price-artista');
        const priceMago = document.getElementById('price-mago');
        const priceLenda = document.getElementById('price-lenda');
        if (priceArtista) priceArtista.textContent = '7,90';
        if (priceMago) priceMago.textContent = '15,90';
        if (priceLenda) priceLenda.textContent = '31,90';
    }
}

async function handleCreditPackagePurchase(credits, price) {
    if (!currentUser) {
        showToast('Faça login ou cadastre-se grátis para comprar créditos avulsos! 🚀', 'info');
        openAuthModal();
        return;
    }
    
    selectedPlanForUpgrade = `${credits} Créditos Avulsos`;
    selectedPageAmountForUpgrade = credits;
    
    const planNameEl = document.getElementById('paymentModalPlanName');
    if (planNameEl) {
        planNameEl.textContent = `${credits} Créditos Avulsos (R$ ${price.toFixed(2).replace('.', ',')})`;
    }
    const modal = document.getElementById('paymentMethodModal');
    if (modal) {
        modal.classList.add('open');
    }
}

function renderPlanosView() {
    document.title = "KidCanvas — Planos de Assinatura 🎨";
    setMetaDescription("Conheça os planos de assinatura do KidCanvas. Do Aprendiz ao Lenda, libere milhares de desenhos exclusivos e histórias mágicas para colorir!");
    
    const view = document.getElementById('view-planos');
    if (view) {
        view.style.display = 'block';
    }
    
    // Atualizar os botões baseados no plano do usuário
    const btnAprendiz = document.getElementById('btn-plan-aprendiz');
    const btnArtista = document.getElementById('btn-plan-artista');
    const btnMago = document.getElementById('btn-plan-mago');
    const btnLenda = document.getElementById('btn-plan-lenda');
    
    const cardAprendiz = document.getElementById('plan-card-aprendiz');
    const cardArtista = document.getElementById('plan-card-artista');
    const cardMago = document.getElementById('plan-card-mago');
    const cardLenda = document.getElementById('plan-card-lenda');
    
    // Resetar estilos de plano atual
    [cardAprendiz, cardArtista, cardMago, cardLenda].forEach(card => {
        if (card) card.classList.remove('active-plan');
    });
    
    const plansInfo = [
        { name: 'Aprendiz', btn: btnAprendiz, card: cardAprendiz, credits: 3 },
        { name: 'Artista', btn: btnArtista, card: cardArtista, credits: 30 },
        { name: 'Mago Criador', btn: btnMago, card: cardMago, credits: 100 },
        { name: 'Lenda KidCanvas', btn: btnLenda, card: cardLenda, credits: 250 }
    ];

    if (currentUser) {
        const currentPlan = currentUser.plan || 'Aprendiz';
        
        plansInfo.forEach(p => {
            if (p.card && (p.name === currentPlan || (p.name === 'Aprendiz' && currentPlan === 'Grátis'))) {
                p.card.classList.add('active-plan');
            }
            
            if (p.btn) {
                if (p.name === currentPlan || (p.name === 'Aprendiz' && currentPlan === 'Grátis')) {
                    p.btn.textContent = 'Seu plano atual 🎨';
                    p.btn.disabled = true;
                    p.btn.onclick = null;
                } else {
                    if (p.name === 'Aprendiz') {
                        p.btn.textContent = 'Grátis';
                        p.btn.disabled = true;
                        p.btn.onclick = null;
                    } else {
                        p.btn.textContent = 'Assinar';
                        p.btn.disabled = false;
                        p.btn.onclick = () => handlePlanUpgrade(p.name, p.credits);
                    }
                }
            }
        });
    } else {
        // Visitante deslogado
        if (btnAprendiz) {
            btnAprendiz.textContent = 'Cadastrar Grátis';
            btnAprendiz.disabled = false;
            btnAprendiz.onclick = () => {
                openAuthModal();
                switchAuthTab('register');
            };
        }
        
        [
            { name: 'Artista', btn: btnArtista, credits: 30 },
            { name: 'Mago Criador', btn: btnMago, credits: 100 },
            { name: 'Lenda KidCanvas', btn: btnLenda, credits: 250 }
        ].forEach(p => {
            if (p.btn) {
                p.btn.textContent = 'Assinar';
                p.btn.disabled = false;
                p.btn.onclick = () => handlePlanUpgrade(p.name, p.credits);
            }
        });
    }
}

let selectedPlanForUpgrade = null;
let selectedPageAmountForUpgrade = null;
let pixPollInterval = null;

async function handlePlanUpgrade(planName, pageAmount) {
    if (!currentUser) {
        localStorage.setItem("kidcanvas_pending_upgrade", JSON.stringify({ planName, pageAmount }));
        showToast('Faça login ou cadastre-se grátis para assinar o plano! 🚀', 'info');
        openAuthModal();
        return;
    }
    
    selectedPlanForUpgrade = planName;
    selectedPageAmountForUpgrade = pageAmount;
    
    // Abre o modal de escolha de método de pagamento
    const planNameEl = document.getElementById('paymentModalPlanName');
    if (planNameEl) {
        planNameEl.textContent = planName;
    }
    const modal = document.getElementById('paymentMethodModal');
    if (modal) {
        modal.classList.add('open');
    }
}

function closePaymentMethodModal() {
    const modal = document.getElementById('paymentMethodModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

function closePixCheckoutModal() {
    const modal = document.getElementById('pixCheckoutModal');
    if (modal) {
        modal.classList.remove('open');
    }
    // Para o polling do Pix se estiver rodando
    if (pixPollInterval) {
        clearInterval(pixPollInterval);
        pixPollInterval = null;
    }
}

async function handlePayWithCard() {
    closePaymentMethodModal();
    let planName = selectedPlanForUpgrade;
    if (!planName) return;
    
    // Se for um plano recorrente, adiciona o ciclo de faturamento
    if (!planName.includes('Créditos Avulsos') && planName !== 'Aprendiz' && planName !== 'Grátis') {
        planName = `${planName} (${currentBillingCycle === 'mensal' ? 'Mensal' : 'Anual'})`;
    }
    
    try {
        showToast(`Redirecionando para o Stripe Checkout... 💳`, 'info');
        const res = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify({ planName })
        });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
            localStorage.removeItem("kidcanvas_pending_upgrade");
            window.open(data.url, '_blank');
        } else {
            showToast(`Erro ao abrir checkout: ${data.message || 'Erro desconhecido'}`, 'error');
            if (res.status === 401 || (data.message && (data.message.includes('Sessão inválida') || data.message.includes('Sessão expirada') || data.message.includes('Faça login novamente')))) {
                setTimeout(() => {
                    handleHeaderLogout();
                }, 1500);
            }
        }
    } catch(err) {
        console.error(err);
        showToast("Erro de conexão ao processar checkout.", 'error');
    }
}

function handlePayWithPix() {
    closePaymentMethodModal();
    
    const pixFullnameInput = document.getElementById('pix-fullname');
    if (pixFullnameInput && currentUser) {
        pixFullnameInput.value = currentUser.name || '';
    }
    
    // Resetar campos e etapas
    const pixCpfInput = document.getElementById('pix-cpf');
    if (pixCpfInput) pixCpfInput.value = '';
    
    document.getElementById('pix-details-step').style.display = 'block';
    document.getElementById('pix-display-step').style.display = 'none';
    
    const modal = document.getElementById('pixCheckoutModal');
    if (modal) {
        modal.classList.add('open');
    }
}

function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g,'');
    if(cpf == '') return false;
    if (cpf.length != 11 || 
        cpf == "00000000000" || 
        cpf == "11111111111" || 
        cpf == "22222222222" || 
        cpf == "33333333333" || 
        cpf == "44444444444" || 
        cpf == "55555555555" || 
        cpf == "66666666666" || 
        cpf == "77777777777" || 
        cpf == "88888888888" || 
        cpf == "99999999999")
            return false;       
    let add = 0;
    for (let i=0; i < 9; i ++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9)))
        return false;       
    add = 0;
    for (let i = 0; i < 10; i ++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10)))
        return false;       
    return true;   
}

async function generatePixPayment() {
    const fullName = document.getElementById('pix-fullname').value.trim();
    const cpf = document.getElementById('pix-cpf').value.trim();
    let planName = selectedPlanForUpgrade;
    
    if (!fullName) {
        showToast("Por favor, insira seu nome completo.", "warning");
        return;
    }
    if (!cpf) {
        showToast("Por favor, insira seu CPF.", "warning");
        return;
    }
    if (!validateCPF(cpf)) {
        showToast("CPF inválido. Por favor, verifique os dígitos.", "warning");
        return;
    }
    
    // Se for um plano recorrente, adiciona o ciclo de faturamento
    if (planName && !planName.includes('Créditos Avulsos') && planName !== 'Aprendiz' && planName !== 'Grátis') {
        planName = `${planName} (${currentBillingCycle === 'mensal' ? 'Mensal' : 'Anual'})`;
    }
    
    try {
        showToast("Gerando Pix no Mercado Pago... ⚡", "info");
        const res = await fetch('/api/mercadopago/create-pix-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify({ planName, fullName, cpf })
        });
        
        const data = await res.json();
        if (res.ok && data.success) {
            document.getElementById('pix-details-step').style.display = 'none';
            document.getElementById('pix-display-step').style.display = 'block';
            
            document.getElementById('pix-qr-code-img').src = `data:image/png;base64,${data.qrCodeBase64}`;
            document.getElementById('pix-copy-paste-code').value = data.qrCode;
            document.getElementById('pix-status-message').textContent = "Aguardando pagamento... 🔄";
            
            showToast("QR Code Pix gerado com sucesso!", "success");
            localStorage.removeItem("kidcanvas_pending_upgrade");
            
            startPixPolling(data.paymentId);
        } else {
            showToast(`Erro ao gerar Pix: ${data.message || 'Erro desconhecido'}`, 'error');
        }
    } catch (err) {
        console.error(err);
        showToast("Erro de conexão ao gerar o Pix.", "error");
    }
}

function copyPixCode() {
    const copyText = document.getElementById("pix-copy-paste-code");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value)
        .then(() => {
            showToast("Código Pix Copia e Cola copiado! 📋", "success");
        })
        .catch(err => {
            console.error('Erro ao copiar código Pix: ', err);
            showToast("Não foi possível copiar. Selecione e copie o código manualmente.", "warning");
        });
}

function startPixPolling(paymentId) {
    if (pixPollInterval) clearInterval(pixPollInterval);
    
    pixPollInterval = setInterval(async () => {
        try {
            const res = await fetch(`/api/mercadopago/payment-status/${paymentId}`, {
                headers: {
                    'X-Session-Token': sessionToken
                }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                if (data.status === 'approved') {
                    clearInterval(pixPollInterval);
                    pixPollInterval = null;
                    
                    document.getElementById('pix-status-message').innerHTML = "Pagamento confirmado! 🎉";
                    showToast("Oba! Pagamento Pix confirmado e plano ativado! 🎉✨", "success");
                    
                    setTimeout(async () => {
                        closePixCheckoutModal();
                        await syncUserProfile();
                        // Se estiver na aba planos, recarrega a visualização
                        if (window.location.pathname === '/planos') {
                            renderPlanosView();
                        }
                    }, 3000);
                } else if (data.status === 'cancelled' || data.status === 'rejected') {
                    clearInterval(pixPollInterval);
                    pixPollInterval = null;
                    document.getElementById('pix-status-message').textContent = "Pagamento recusado ou cancelado.";
                    showToast("O pagamento do Pix foi recusado ou cancelado.", "error");
                }
            }
        } catch (err) {
            console.error("Erro no polling de status do Pix:", err);
        }
    }, 5000);
}

async function checkPendingUpgrade() {
    const pending = localStorage.getItem("kidcanvas_pending_upgrade");
    if (pending) {
        try {
            const { planName, pageAmount } = JSON.parse(pending);
            localStorage.removeItem("kidcanvas_pending_upgrade");
            await handlePlanUpgrade(planName, pageAmount);
        } catch(e) {
            console.error("Erro no processar upgrade pendente:", e);
        }
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
            const drawingCount = slug === 'novidades'
                ? allDrawings.filter(d => d.isNew).length
                : allDrawings.filter(d => d.category === slug).length;
            
            let isLocked = false;
            let lockType = ''; // 'auth' ou 'upgrade'
            
            if (slug === 'novidades') {
                const userPlan = currentUser ? (currentUser.plan || 'Aprendiz') : 'Grátis';
                if (!currentUser || userPlan === 'Aprendiz' || userPlan === 'Grátis') {
                    isLocked = true;
                    lockType = 'upgrade';
                }
            } else if (!currentUser && !FREE_CATEGORIES.includes(slug)) {
                isLocked = true;
                lockType = 'auth';
            }
            
            const card = document.createElement('a');
            
            if (isLocked) {
                card.href = '#';
                card.className = 'category-card locked';
                if (lockType === 'upgrade') {
                    card.innerHTML = `
                        <span class="category-icon">${catInfo.emoji}<i class="fa-solid fa-lock locked-badge"></i></span>
                        <span class="category-name">${catInfo.name}</span>
                        <span class="category-count">Requer Plano Artista</span>
                    `;
                    card.addEventListener('click', (e) => {
                        e.preventDefault();
                        showToast('Esta categoria requer o plano Artista! Faça upgrade para acessar. 🚀', 'info');
                        navigate('/planos');
                    });
                } else {
                    card.innerHTML = `
                        <span class="category-icon">${catInfo.emoji}<i class="fa-solid fa-lock locked-badge"></i></span>
                        <span class="category-name">${catInfo.name}</span>
                        <span class="category-count">Cadastre-se grátis para desbloquear</span>
                    `;
                    card.addEventListener('click', (e) => {
                        e.preventDefault();
                        showToast('Cadastre-se grátis para desbloquear todas as categorias! 🎨', 'info');
                        openAuthModal();
                    });
                }
            } else {
                card.href = `/categoria/${slug}`;
                card.className = 'category-card';
                card.innerHTML = `
                    <span class="category-icon">${catInfo.emoji}</span>
                    <span class="category-name">${catInfo.name}</span>
                    <span class="category-count">${drawingCount} desenhos</span>
                `;
            }
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
            
            const card = createDrawingCard(dw, null, idx < 4);
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
    
    // Buscar mais amados da semana
    fetch('/api/featured-drawings')
        .then(response => response.json())
        .then(result => {
            if (result.success && result.featured) {
                updateFeaturedHomeCards(result.featured);
            }
        })
        .catch(err => console.error('Erro ao carregar os mais amados da home:', err));
}

// Atualiza os cards de Mais Amados na home
function updateFeaturedHomeCards(featured) {
    if (!featured) return;

    const cardsMap = {
        colorido: 'featured-card-colorido',
        impresso: 'featured-card-impresso',
        favoritado: 'featured-card-favoritado'
    };

    Object.keys(cardsMap).forEach(key => {
        const cardId = cardsMap[key];
        const cardElement = document.getElementById(cardId);
        const data = featured[key];

        if (cardElement && data) {
            const img = cardElement.querySelector('.featured-img');
            const title = cardElement.querySelector('.featured-card-title');
            const proof = cardElement.querySelector('.featured-card-proof');

            if (img && data.url) {
                img.src = data.url;
                img.alt = data.title;
            }
            if (title) {
                title.textContent = data.title;
            }
            if (proof) {
                proof.textContent = `${data.count} ${data.label}`;
            }

            // Configurar clique para abrir no editor/tela de pintura
            const linkPath = `/${data.category}/${data.slug}`;
            cardElement.onclick = (e) => {
                e.preventDefault();
                navigate(linkPath);
            };
        }
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
            const drawingCount = slug === 'novidades'
                ? allDrawings.filter(d => d.isNew).length
                : allDrawings.filter(d => d.category === slug).length;
            
            let isLocked = false;
            let lockType = ''; // 'auth' ou 'upgrade'
            
            if (slug === 'novidades') {
                const userPlan = currentUser ? (currentUser.plan || 'Aprendiz') : 'Grátis';
                if (!currentUser || userPlan === 'Aprendiz' || userPlan === 'Grátis') {
                    isLocked = true;
                    lockType = 'upgrade';
                }
            } else if (!currentUser && !FREE_CATEGORIES.includes(slug)) {
                isLocked = true;
                lockType = 'auth';
            }
            
            const card = document.createElement('a');
            
            if (isLocked) {
                card.href = '#';
                card.className = 'category-card locked';
                if (lockType === 'upgrade') {
                    card.innerHTML = `
                        <span class="category-icon">${catInfo.emoji}<i class="fa-solid fa-lock locked-badge"></i></span>
                        <span class="category-name">${catInfo.name}</span>
                        <span class="category-count">Requer Plano Artista</span>
                    `;
                    card.addEventListener('click', (e) => {
                        e.preventDefault();
                        showToast('Esta categoria requer o plano Artista! Faça upgrade para acessar. 🚀', 'info');
                        navigate('/planos');
                    });
                } else {
                    card.innerHTML = `
                        <span class="category-icon">${catInfo.emoji}<i class="fa-solid fa-lock locked-badge"></i></span>
                        <span class="category-name">${catInfo.name}</span>
                        <span class="category-count">Cadastre-se grátis para desbloquear</span>
                    `;
                    card.addEventListener('click', (e) => {
                        e.preventDefault();
                        showToast('Cadastre-se grátis para desbloquear todas as categorias! 🎨', 'info');
                        openAuthModal();
                    });
                }
            } else {
                card.href = `/categoria/${slug}`;
                card.className = 'category-card';
                card.innerHTML = `
                    <span class="category-icon">${catInfo.emoji}</span>
                    <span class="category-name">${catInfo.name}</span>
                    <span class="category-count">${drawingCount} desenhos</span>
                `;
            }
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
    document.getElementById('category-detail-icon').innerHTML = catInfo.emoji;
    document.getElementById('category-detail-title').textContent = catInfo.name;
    document.getElementById('category-detail-desc').textContent = catInfo.desc;
    
    const allCategoryDrawings = categorySlug === 'novidades'
        ? allDrawings.filter(d => d.isNew)
        : allDrawings.filter(d => d.category === categorySlug);
    
    // Aplicar limite de desenhos por plano
    const visibleDrawings = getVisibleDrawings(allCategoryDrawings, categorySlug);
    const totalCount = allCategoryDrawings.length;
    const visibleCount = visibleDrawings.length;
    const limit = getDrawingsLimit();
    const isLimited = visibleCount < totalCount;
    
    const countEl = document.getElementById('category-drawings-count');
    if (isLimited) {
        countEl.textContent = `Mostrando ${visibleCount} de ${totalCount} desenhos`;
    } else {
        countEl.textContent = `${totalCount} desenhos disponíveis`;
    }
    
    const grid = document.getElementById('category-drawings-grid');
    renderDrawingsInGrid(visibleDrawings, grid, 4);
    
    // Mostrar banner de upgrade quando o limite é atingido
    let upgradeBanner = document.getElementById('category-upgrade-banner');
    if (!upgradeBanner) {
        upgradeBanner = document.createElement('div');
        upgradeBanner.id = 'category-upgrade-banner';
        grid.parentNode.insertBefore(upgradeBanner, grid.nextSibling);
    }
    
    if (isLimited) {
        const planMsg = !currentUser 
            ? { action: 'Crie sua conta grátis', nextPlan: 'Aprendiz', nextLimit: '2.000', btnText: 'Criar Conta Grátis', btnAction: 'openAuthModal()' }
            : { action: 'Faça upgrade', nextPlan: 'Artista', nextLimit: 'todos os 13.000+', btnText: 'Ver Planos', btnAction: "navigate('/planos')" };
        
        upgradeBanner.style.cssText = 'background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #f59e0b; border-radius: 16px; padding: 24px 28px; text-align: center; margin-top: 24px;';
        upgradeBanner.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 8px;">🔒</div>
            <h3 style="font-size: 1.1rem; font-weight: 800; color: #92400e; margin: 0 0 6px;">Você está vendo ${visibleCount} de ${totalCount} desenhos</h3>
            <p style="color: #a16207; font-size: 0.9rem; margin: 0 0 14px;">${planMsg.action} para o plano <strong>${planMsg.nextPlan}</strong> e desbloqueie ${planMsg.nextLimit} desenhos!</p>
            <button onclick="${planMsg.btnAction}" class="btn" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; border-radius: 12px; padding: 12px 28px; font-weight: 800; font-size: 0.95rem; cursor: pointer;">
                <i class="fa-solid fa-rocket"></i> ${planMsg.btnText}
            </button>
        `;
    } else {
        upgradeBanner.innerHTML = '';
        upgradeBanner.style.cssText = '';
    }
    
    // Configurar busca interna da categoria
    const categorySearchInput = document.getElementById('category-drawings-search');
    if (categorySearchInput) {
        categorySearchInput.value = '';
        categorySearchInput.oninput = () => {
            const val = categorySearchInput.value.trim().toLowerCase();
            const searched = visibleDrawings.filter(d => d.pt.toLowerCase().includes(val) || d.en.toLowerCase().includes(val));
            renderDrawingsInGrid(searched, grid, 4);
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
        'flores-e-natureza': 'natureza',
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
        'paper-doll': 'cotidiano',
        'halloween': 'cotidiano',
        'natal': 'cotidiano',
        'mandalas': 'cotidiano',
        'folclore-brasileiro': 'fantasia',
        'esportes': 'cotidiano'
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
        if (category === 'veiculos') {
            action = "pronto para correr";
        } else if (category === 'comidas-e-doces') {
            action = "esperando para ser provado";
        } else if (category === 'natureza') {
            action = "deixando o mundo mais lindo";
        } else if (category === 'espaco') {
            action = "viajando pelo espaço";
        } else {
            action = "brincando feliz";
        }
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
        phrases.push(`Splash! Estou aqui ${action}!\nMe colore primeiro, amiguinho!`);
        phrases.push(`Eiii! Quer nadar comigo ${action}?\nMe colore primeiro!`);
        phrases.push(`Faço acrobacias no mar quando\nganho cores lindas e fico ${action}!`);
        phrases.push(`Que tal me pintar de azul bem\nclarinho ou turquesa ${action}?`);
        phrases.push(`Dá um salto na imaginação ${action}\ne escolhe sua cor favorita!`);
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
        phrases.push(`Vrum vrum! Olha eu ${action}!\nTô esperando minha cor favorita!`);
        phrases.push(`Meu tanque tá cheio enquanto estou ${action},\nmas meu corpinho tá sem cor!`);
        phrases.push(`Apita apita! Me colore ${action}\nque vou te dar uma volta!`);
        phrases.push(`Todo carro tem uma cor...\nqual vai ser a minha para ficar ${action}?`);
        phrases.push(`Tô parado na garagem ${action}\nesperando você me colorir!`);
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
        phrases.push(`Hoje é dia de festa e estou ${action}!\nMe enfeita de cor?`);
        phrases.push(`Tenho várias camadas fofas ${action},\nnenhuma tem cor ainda!`);
        phrases.push(`Que tal colocar granulados coloridos\nem mim enquanto estou ${action}?`);
        phrases.push(`Hummm, olha eu ${action}!\nCom cereja no topo fica ainda mais gostoso!`);
        phrases.push(`Pode me colorir com o sabor que você\nmais gostar para ficar ${action}!`);
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
                phrases.push(`Splash! Estou aqui ${action}!\nMe colore primeiro, amiguinho!`);
                phrases.push(`Olha só eu ${action}!\nMe dá um mergulho colorido no papel!`);
                phrases.push(`Achei um tesouro no mar enquanto estava ${action}:\nsuas cores lindas!`);
                phrases.push(`Como ${subject}, adoro ficar ${action}...\nmas preciso de cor!`);
                phrases.push(`Oi! Sou ${art} ${subject} ${action}!\nMe colore com a cor do oceano!`);
                break;
                
            case 'animais-selvagens':
                phrases.push(`Oi! Sou ${art} ${subject} ${action}!\nMe pinta bem bonito!`);
                phrases.push(`Socorro! Estou ${action} na selva\nmas estou sem cor!`);
                phrases.push(`Quer brincar de pintar? Olha eu aqui\n${action}!`);
                phrases.push(`Meu coração de ${subject} adora ver você\npintando meu desenho!`);
                phrases.push(`Roarrr! O que achou de me ver ${action}?\nMe colore com muito amor!`);
                break;
                
            case 'animais-domesticos':
                phrases.push(`Miau! Au au! Olha eu aqui ${action}!\nMe colore com sua cor favorita!`);
                phrases.push(`Oi! Sou ${art} ${subject} ${action}!\nQuer ser meu amigo de pintura?`);
                phrases.push(`Abanei o rabinho de alegria por estar ${action}!\nVamos colorir?`);
                phrases.push(`Estou te esperando no papel ${action}...\nvamos colorir juntinhos?`);
                phrases.push(`Que tal me pintar de colorido?\nAdoro ficar ${action}!`);
                break;
                
            case 'dinossauros':
                phrases.push(`RAWRR! Pinta meu corpinho de dino\nenquanto estou ${action}!`);
                phrases.push(`Pareço grandão ${action},\nmas sou um dinossauro super bonzinho!`);
                phrases.push(`Corri tanto para ficar ${action}!\nAgora me colore bem lindo!`);
                phrases.push(`De que cor era ${art} ${subject} ${action}?\nVocê que manda!`);
                phrases.push(`Grrr! Um dinossauro grandão ${action}\nquerendo suas cores favoritas!`);
                break;
                
            case 'fantasia':
                phrases.push(`Minhas asas perderam o brilho enquanto eu estava ${action}...\nme ajuda?`);
                phrases.push(`Galopei pelas nuvens mágicas ${action}\nsó pra te ver colorir!`);
                phrases.push(`Olha eu aqui ${action}! Espalhei purpurina\nno papel para você brilhar!`);
                phrases.push(`Pareço mágico ${action}, mas só\nfico completo com as suas cores!`);
                phrases.push(`Joguei um pó de estrelas enquanto estava ${action}\npara te dar sorte na pintura!`);
                break;
                
            case 'contos-de-fada':
                phrases.push(`Era uma vez ${art} ${subject} ${action}\nesperando suas cores lindas!`);
                phrases.push(`O final feliz desse desenho ${action}\ndepende do seu toque colorido!`);
                phrases.push(`Abra este livro de aventura e pinte\neu aqui ${action}!`);
                phrases.push(`Sou ${art} ${subject} ${action}!\nTrouxe um abraço bem quentinho!`);
                phrases.push(`Era uma vez uma criança que pintava\neu aqui ${action} com muito amor!`);
                break;
                
            case 'espaco':
                phrases.push(`Houston, temos um problema:\nestou sem cor aqui ${action}!`);
                phrases.push(`Flutuo pelas estrelas ${action}\nesperando você me pintar!`);
                phrases.push(`Contagem regressiva! Olha eu ${action}...\n3... 2... 1... me colore!`);
                phrases.push(`Já fui até a lua e de volta ${action},\nmas amo quando você me pinta!`);
                phrases.push(`Vim de outro planeta ${action}\nsó para ver sua pintura linda!`);
                break;
                
            case 'natureza':
                phrases.push(`Pousei aqui pertinho ${action}\nsó pra te ver colorir!`);
                phrases.push(`Minhas pétalas e folhas ${action}\nprecisam de cores lindas!`);
                phrases.push(`Olha só eu ${action}!\nVocê me dá vida com seus lápis!`);
                phrases.push(`Apareci bem lindo ${action}\nsó pra te surpreender!`);
                phrases.push(`Estou no jardim ${action}\npronto para receber suas cores!`);
                break;
                
            case 'veiculos':
                phrases.push(`Vrum vrum! Olha eu ${action}!\nTô esperando minha cor favorita!`);
                phrases.push(`Meu tanque tá cheio enquanto estou ${action},\nmas meu corpinho tá sem cor!`);
                phrases.push(`Apita apita! Me colore ${action}\nque vou te dar uma volta!`);
                phrases.push(`Estou ${action} e esperando\na largada das suas cores!`);
                phrases.push(`Buzina, buzina! Me pinta ${action}\nbem rápido, amiguinho!`);
                break;
                
            case 'comidas-e-doces':
                phrases.push(`Hummm! Estou ${action}!\nMe colore rápido com cores deliciosas!`);
                phrases.push(`Hoje é dia de festa e eu estou ${action}!\nMe enfeita de cor?`);
                phrases.push(`Estou aqui ${action} e fofinho,\nmas ainda não tenho cor!`);
                phrases.push(`Que sabor de cor você vai escolher\npara me pintar ${action}?`);
                phrases.push(`Olha só eu ${action}!\nEstou esperando o seu toque de cor!`);
                break;
                
            case 'cotidiano':
                phrases.push(`Oi! Olha eu aqui ${action}!\nVamos brincar e colorir juntos hoje?`);
                phrases.push(`Hoje o dia tá lindo e eu estou ${action}...\nfalta só a sua cor!`);
                phrases.push(`Quer se divertir comigo ${action}?\nMe colore primeiro!`);
                phrases.push(`Estou ${action} e aprendendo coisas legais,\nvamos pintar juntinhos?`);
                phrases.push(`A Vovó Sônia disse que adora ver\neu aqui ${action} bem colorido!`);
                break;
                
            case 'profissoes':
                phrases.push(`SIRENE! Chamado urgente:\npreciso de cor agora para continuar ${action}!`);
                phrases.push(`Cuido de todo mundo enquanto estou ${action},\nmas quem cuida de mim é você!`);
                phrases.push(`Preparei uma receita de cor e alegria\nenquanto estava ${action}!`);
                phrases.push(`Trabalho com amor ${action},\ne colorir comigo é pura diversão!`);
                phrases.push(`Olha eu aqui ${action}!\nQual profissão você quer ter quando crescer?`);
                break;
                
            default:
                phrases.push(`Oi! Quer brincar comigo ${action}?\nMe colore bem lindo!`);
                phrases.push(`De que cor você vai me pintar ${action}?\nEscolha a sua favorita!`);
                phrases.push(`Estou no papel ${action} esperando,\nvamos colorir juntinhos?`);
                phrases.push(`Deixa meu desenho ${action}\nsuper alegre e cheio de vida!`);
                phrases.push(`A Vovó Sônia separou esse desenho\neu aqui ${action} com muito amor!`);
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
    setMetaDescription(`Desenho de ${drawing.pt} para colorir e imprimir grátis! Baixe em alta resolução a ilustração de ${drawing.pt} (${drawing.en}) para pintar e colorir em casa.`);
    
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
    
    // Configurar Card de Curiosidade Lúdica
    const curiosityBox = document.getElementById('drawing-curiosity-box');
    const curiosityText = document.getElementById('drawing-curiosity-text');
    if (curiosityBox && curiosityText) {
        const curiosity = getCuriosityForDrawing(drawing);
        curiosityText.textContent = curiosity;
        curiosityBox.style.display = 'flex';
    }
    
    // Configurar Frases Vazadas Educativas (100% Unificado e Grátis)
    const phraseBox = document.getElementById('drawing-sheet-phrase-box');
    phraseBox.style.display = 'flex';
    renderHollowPhraseText(currentDrawingPhrase, 'pt');
    
    // Inicializar avaliação por estrelas
    initRatingSystem(categorySlug, drawingSlug);
    
    // Configurar Cadeados e Permissões dos Idiomas
    const hasEn = currentUser && ['Artista', 'Mago Criador', 'Lenda KidCanvas', 'Ultra', 'Família', 'Professor', 'Colégio', 'Premium'].includes(currentUser.plan);
    const hasEs = currentUser && ['Mago Criador', 'Lenda KidCanvas', 'Ultra', 'Colégio', 'Premium'].includes(currentUser.plan);
    
    const lockEn = document.getElementById('lock-en');
    const lockEs = document.getElementById('lock-es');
    if (lockEn) lockEn.style.display = hasEn ? 'none' : 'inline-block';
    if (lockEs) lockEs.style.display = hasEs ? 'none' : 'inline-block';

    // Escutar mudança de legenda com proteção por plano
    const radios = document.getElementsByName('phrase-lang-mode');
    radios.forEach(radio => {
        // Resetar para PT ativo
        if (radio.value === 'pt') radio.checked = true;
        
        radio.onclick = (e) => {
            const val = radio.value;
            if (val === 'en' && !hasEn) {
                e.preventDefault();
                // Forçar a seleção de volta para o PT
                document.querySelector('input[name="phrase-lang-mode"][value="pt"]').checked = true;
                showToast('A legenda bilíngue em inglês está disponível a partir do plano Artista! 🚀', 'info');
                return false;
            }
            if (val === 'es' && !hasEs) {
                e.preventDefault();
                // Forçar a seleção de volta para o PT
                document.querySelector('input[name="phrase-lang-mode"][value="pt"]').checked = true;
                showToast('A legenda trilíngue em espanhol está disponível a partir do plano Mago Criador! 🚀', 'info');
                return false;
            }
        };
        
        radio.onchange = () => {
            const mode = radio.value;
            if (mode === 'pt') {
                phraseBox.style.display = 'flex';
                renderHollowPhraseText(currentDrawingPhrase, 'pt');
            } else if (mode === 'en') {
                if (!hasEn) return;
                phraseBox.style.display = 'flex';
                const ptText = drawing.pt.toUpperCase();
                const enText = (drawing.en || drawing.pt).toUpperCase();
                renderHollowPhraseText(`${ptText} / ${enText}`, 'en');
            } else if (mode === 'es') {
                if (!hasEs) return;
                phraseBox.style.display = 'flex';
                const ptText = drawing.pt.toUpperCase();
                const enText = (drawing.en || drawing.pt).toUpperCase();
                const esText = (drawing.es || getSpanishWord(drawing.en) || drawing.pt).toUpperCase();
                renderHollowPhraseText(`${ptText} / ${enText} / ${esText}`, 'es');
            } else {
                phraseBox.style.display = 'none'; // Sem legenda
            }
        };
    });
    
    // Configurar botão de download direto (sem cadastro)
    const btnDownload = document.getElementById('btn-download-drawing');
    const newBtn = btnDownload.cloneNode(true);
    btnDownload.parentNode.replaceChild(newBtn, btnDownload);
    
    newBtn.addEventListener('click', () => {
        triggerDrawingDownload(drawing);
    });
    
    // Configurar botão de colorir online
    const btnColorOnline = document.getElementById('btn-color-online-drawing');
    if (btnColorOnline) {
        const newColorBtn = btnColorOnline.cloneNode(true);
        btnColorOnline.parentNode.replaceChild(newColorBtn, btnColorOnline);
        newColorBtn.addEventListener('click', () => {
            window.currentPaintingData = {
                imgUrl: drawing.url,
                name: drawing.title || drawing.pt || 'Desenho',
                backUrl: `/${categorySlug}/${drawingSlug}`,
                category: categorySlug,
                originalCategory: categorySlug
            };
            navigate('/pintar-online');
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

    // Botão de deletar desenho para Administrador (foneoliver@gmail.com) na visualização de detalhes
    const sheetFrame = view.querySelector('.drawing-sheet-frame');
    if (sheetFrame) {
        const oldAdminBtn = sheetFrame.querySelector('.admin-detail-delete-btn');
        if (oldAdminBtn) oldAdminBtn.remove();

        if (currentUser && currentUser.email === 'foneoliver@gmail.com') {
            const adminBtn = document.createElement('button');
            adminBtn.className = 'admin-detail-delete-btn';
            adminBtn.title = 'Excluir desenho bugado (Admin)';
            adminBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Deletar Desenho';
            adminBtn.style.cssText = 'position: absolute; top: 15px; right: 15px; z-index: 100; background-color: #e74c3c; border: 3px solid var(--color-dark); border-radius: var(--radius-sm); padding: 8px 16px; color: white; font-family: var(--font-heading); font-weight: 700; font-size: 1rem; cursor: pointer; transition: transform 0.2s ease; box-shadow: 3px 3px 0 var(--color-dark); display: flex; align-items: center; gap: 8px;';
            
            adminBtn.onmouseenter = () => adminBtn.style.transform = 'translate(-2px, -2px)';
            adminBtn.onmouseleave = () => adminBtn.style.transform = 'none';

            adminBtn.onclick = async () => {
                const confirmed = confirm(`ATENÇÃO ADMIN: Deseja realmente excluir permanentemente o desenho "${drawing.pt}" do acervo do site?`);
                if (!confirmed) return;

                try {
                    const response = await fetch('/api/drawings/delete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-session-token': sessionToken || ''
                        },
                        body: JSON.stringify({ category: categorySlug, slug: drawingSlug })
                    });
                    const result = await response.json();
                    if (result.success) {
                        showToast('Desenho excluído com sucesso!', 'success');
                        navigate('/');
                    } else {
                        showToast(result.message || 'Erro ao excluir desenho.', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Falha de rede ao excluir desenho.', 'error');
                }
            };

            sheetFrame.appendChild(adminBtn);
        }
    }
}

// Roteador de Frases Vazadas (SVG Outline)
function renderHollowPhraseText(text, mode) {
    const canvas = document.getElementById('hollow-text-canvas');
    if (!canvas) return;
    
    let cleanText = text.toUpperCase();
    
    // Divide por quebras de linha ou pelo caractere separador " / " para exibir cada idioma em uma linha
    let lines = cleanText.split('\n');
    if (lines.length === 1 && cleanText.includes(' / ')) {
        lines = cleanText.split(' / ').map(l => l.trim());
    }
    
    // Limpar linhas vazias
    lines = lines.filter(l => l.length > 0);
    
    // Alterar o viewBox e o max-height dinamicamente dependendo da quantidade de linhas
    if (lines.length === 1) {
        canvas.setAttribute('viewBox', '0 0 500 50');
        canvas.style.maxHeight = '50px';
    } else if (lines.length === 2) {
        canvas.setAttribute('viewBox', '0 0 500 85');
        canvas.style.maxHeight = '85px';
    } else {
        canvas.setAttribute('viewBox', '0 0 500 120');
        canvas.style.maxHeight = '120px';
    }
    
    canvas.innerHTML = '';
    
    // Calcular tamanho de fonte ideal baseado no maior texto da linha
    const maxLen = Math.max(...lines.map(l => l.length));
    let fontSize = Math.min(34, Math.floor(500 / maxLen));
    
    // Ajustar tamanho máximo de fonte baseado na quantidade de linhas para não cortar verticalmente
    if (lines.length === 2) fontSize = Math.min(26, fontSize);
    if (lines.length === 3) fontSize = Math.min(21, fontSize);
    if (fontSize < 10) fontSize = 10; // Garantir tamanho mínimo legível
    
    // O stroke-width (grossura do contorno) agora escala dinamicamente com o tamanho da fonte!
    // Isso garante que se a letra for pequena, o contorno não "coma" o espaço interno dela, mantendo-a sempre vazada.
    const strokeWidth = Math.max(0.7, (fontSize * 0.085).toFixed(2));
    
    lines.forEach((line, idx) => {
        let y = 35;
        if (lines.length === 2) {
            y = idx === 0 ? 30 : 66;
        } else if (lines.length === 3) {
            y = idx === 0 ? 28 : (idx === 1 ? 62 : 96);
        }
        
        canvas.innerHTML += `
            <text x="250" y="${y}" font-family="'Fredoka', sans-serif" font-size="${fontSize}" font-weight="900" fill="none" stroke="#2d1854" stroke-width="${strokeWidth}" text-anchor="middle" letter-spacing="1">
                ${line}
            </text>
        `;
    });
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
function createDrawingCard(dw, position = null, showTrending = false) {
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
    
    // Badge de "EM ALTA 🔥"
    const trendingBadgeHtml = showTrending ? '<div class="trending-badge">EM ALTA 🔥</div>' : '';
    
    // Badge do tier com suporte a tag Novo
    const isLocked = !isDrawingAccessible(dw);
    let cardLink = `/${dw.category}/${dw.slug}`;
    let badgeHtml = '<span class="badge-free">Grátis</span>';
    
    if (isLocked) {
        cardLink = '#';
        const requiredPlan = getRequiredPlanForDrawing(dw);
        badgeHtml = `<span class="badge-free" style="background-color: var(--color-orange); border-color: var(--color-dark);"><i class="fa-solid fa-lock"></i> Plano ${requiredPlan}</span>`;
    } else if (dw.isNew) {
        badgeHtml = '<span class="badge-free" style="background-color: var(--color-yellow); border-color: var(--color-dark);"><i class="fa-solid fa-star"></i> Novo!</span>';
    }
    
    const isAdminUser = currentUser && currentUser.email === 'foneoliver@gmail.com';
    const deleteBtnHtml = isAdminUser ? `
        <button class="btn-delete-acervo-drawing" title="Excluir desenho bugado" style="position: absolute; top: 10px; left: 10px; z-index: 10; background-color: #e74c3c; border: 2px solid var(--color-dark); border-radius: 50%; width: 32px; height: 32px; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s ease; box-shadow: 0 2px 0 var(--color-dark);"><i class="fa-solid fa-trash-can"></i></button>
    ` : '';
    
    card.innerHTML = `
        ${deleteBtnHtml}
        ${rankBadgeHtml}
        ${trendingBadgeHtml}
        <a href="${cardLink}" class="drawing-card-link">
            <div class="card-img-wrapper" style="${isLocked ? 'filter: blur(5px) grayscale(0.2) opacity(0.8);' : ''}">
                <img src="${dw.url}" alt="${dw.pt}" loading="lazy">
            </div>
        </a>
        <div class="card-bottom-info">
            <span class="drawing-card-category">${CATEGORIES_DATA[dw.category].name}</span>
            <h4 class="drawing-card-title">${dw.pt}</h4>
        </div>
        <div class="card-bottom">
            ${badgeHtml}
            <button class="btn-download-card" title="${isLocked ? 'Assine para desbloquear' : 'Baixar desenho'}"><i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-download'}"></i> ${isLocked ? 'Desbloquear' : 'Imprimir'}</button>
        </div>
    `;
    
    // Interceptar clique no link do card
    const cardA = card.querySelector('.drawing-card-link');
    if (cardA) {
        cardA.addEventListener('click', (e) => {
            if (isLocked) {
                e.preventDefault();
                if (!currentUser) {
                    showToast('Faça login ou cadastre-se grátis para liberar este desenho e todas as categorias! 🎨', 'info');
                    openAuthModal();
                } else {
                    const requiredPlan = getRequiredPlanForDrawing(dw);
                    showToast(`Este desenho requer o plano ${requiredPlan}! Redirecionando para a página de planos... 🚀`, 'info');
                    navigate('/planos');
                }
            }
        });
    }

    // Configurar download direto no clique
    const btnDl = card.querySelector('.btn-download-card');
    btnDl.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isLocked) {
            if (!currentUser) {
                showToast('Faça login ou cadastre-se grátis para baixar e imprimir! 🎨', 'info');
                openAuthModal();
            } else {
                const requiredPlan = getRequiredPlanForDrawing(dw);
                showToast(`Este desenho requer o plano ${requiredPlan}! Faça upgrade para baixar. 🚀`, 'info');
                navigate('/planos');
            }
        } else {
            triggerDrawingDownload(dw);
        }
    });

    // Configurar clique do botão de deletar do admin
    if (isAdminUser) {
        const btnDel = card.querySelector('.btn-delete-acervo-drawing');
        if (btnDel) {
            btnDel.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const confirmed = confirm(`ATENÇÃO ADMIN: Deseja realmente excluir permanentemente o desenho "${dw.pt}" do acervo do site?`);
                if (!confirmed) return;
                
                try {
                    const response = await fetch('/api/drawings/delete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-session-token': sessionToken || ''
                        },
                        body: JSON.stringify({ category: dw.category, slug: dw.slug })
                    });
                    const result = await response.json();
                    if (result.success) {
                        showToast('Desenho excluído com sucesso!', 'success');
                        card.remove();
                    } else {
                        showToast(result.message || 'Erro ao excluir desenho.', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Falha de rede ao excluir desenho.', 'error');
                }
            });
        }
    }
    
    return card;
}

// Função para carregar mais desenhos paginados na categoria
function loadNextCategoryDrawings() {
    const grid = document.getElementById('category-drawings-grid');
    if (!grid) return;
    
    const start = categoryPaginationState.currentIndex;
    const end = Math.min(start + categoryPaginationState.limit, categoryPaginationState.drawings.length);
    const chunk = categoryPaginationState.drawings.slice(start, end);
    
    chunk.forEach((dw, idx) => {
        const absoluteIdx = start + idx;
        
        // Adicionar anúncio AdSense a cada 8 desenhos
        if (absoluteIdx > 0 && absoluteIdx % 8 === 0) {
            const adCard = document.createElement('div');
            adCard.className = 'simulated-ad-card';
            adCard.innerHTML = `
                <span class="ad-label">Anúncio AdSense</span>
                <h4 class="ad-title">Lápis de Cor Faber-Castell 🎨</h4>
                <p class="ad-desc">Caixa com 24 cores estojo metálico para os pequenos colorirem com alta qualidade.</p>
                <a href="https://google.com" target="_blank" class="btn btn-secondary btn-sm">Ver Ofertas</a>
            `;
            grid.appendChild(adCard);
        }
        
        const showTrending = absoluteIdx < categoryPaginationState.showTrendingFirstN;
        const card = createDrawingCard(dw, null, showTrending);
        grid.appendChild(card);
    });
    
    categoryPaginationState.currentIndex = end;
    
    const loadMoreContainer = document.getElementById('category-pagination-container');
    if (loadMoreContainer) {
        if (categoryPaginationState.currentIndex < categoryPaginationState.drawings.length) {
            loadMoreContainer.style.display = 'flex';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }
}

// Renderizar lista de desenhos em um grid container
function renderDrawingsInGrid(drawings, gridContainer, showTrendingFirstN = 0) {
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
        const loadMoreContainer = document.getElementById('category-pagination-container');
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        return;
    }
    
    // Se o container for o grid de categorias, usa paginação. Caso contrário, renderiza tudo diretamente.
    if (gridContainer.id === 'category-drawings-grid') {
        categoryPaginationState.drawings = drawings;
        categoryPaginationState.currentIndex = 0;
        categoryPaginationState.showTrendingFirstN = showTrendingFirstN;
        loadNextCategoryDrawings();
    } else {
        // Ocultar botão de carregar mais se for outro grid
        const loadMoreContainer = document.getElementById('category-pagination-container');
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        
        drawings.forEach((dw, idx) => {
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
            const showTrending = idx < showTrendingFirstN;
            const card = createDrawingCard(dw, null, showTrending);
            gridContainer.appendChild(card);
        });
    }
}

// Disparar a busca global e navegar para categorias exibindo o resultado filtrado
function triggerSearch(query) {
    const cleanQuery = query.trim().toLowerCase();
    
    // Filtrar desenhos (respeitando limite do plano)
    const allMatched = allDrawings.filter(d => 
        d.pt.toLowerCase().includes(cleanQuery) || 
        d.en.toLowerCase().includes(cleanQuery) ||
        CATEGORIES_DATA[d.category].name.toLowerCase().includes(cleanQuery)
    );
    const matched = getVisibleDrawings(allMatched);
    
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
    
    const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(drawing.url)}`;
    
    fetch(proxiedUrl)
        .then(response => {
            if (!response.ok) throw new Error('Proxy failed');
            return response.blob();
        })
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            
            const fileName = `kidcanvas_${drawing.category}_${drawing.slug}.png`;
            link.download = fileName;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(blobUrl);
        })
        .catch(err => {
            console.error('Erro no download via proxy, tentando fallback:', err);
            const link = document.createElement('a');
            link.href = drawing.url;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
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

// Pool de curiosidades curtas e divertidas para as crianças
function getCuriosityForDrawing(drawing) {
    const title = drawing.pt.toLowerCase();
    const cat = drawing.category;
    
    // 1. Verificar por palavras-chave específicas no título do desenho
    if (title.includes('leão') || title.includes('leoa')) {
        return "O leão é conhecido como o rei da selva e vive em grandes grupos familiares chamados bandos.";
    }
    if (title.includes('elefante')) {
        return "Os elefantes são os maiores animais terrestres do mundo e usam a tromba para respirar, beber água e pegar coisas!";
    }
    if (title.includes('girafa')) {
        return "As girafas têm pescoços gigantes e línguas azul-escuras muito longas, perfeitas para alcançar as folhas mais altas das árvores.";
    }
    if (title.includes('tigre')) {
        return "Nenhum tigre tem as listras iguais às de outro! Elas funcionam como a nossa impressão digital.";
    }
    if (title.includes('panda')) {
        return "Os pandas passam quase o dia todo comendo bambu! Eles podem comer até 12 quilos de bambu por dia.";
    }
    if (title.includes('urso')) {
        return "Os ursos têm um olfato incrível, muito melhor do que o de um cachorrinho.";
    }
    if (title.includes('macaco')) {
        return "Os macacos são super espertos e usam ferramentas, como pedras e galhos, para abrir alimentos!";
    }
    if (title.includes('zebra')) {
        return "As listras pretas e brancas da zebra servem como um 'repelente natural' contra insetos e ajudam a refrescar o corpo.";
    }
    if (title.includes('jacaré') || title.includes('crocodilo')) {
        return "Os crocodilos podem viver mais de 70 anos e são parentes bem antigos dos dinossauros!";
    }
    if (title.includes('tartaruga')) {
        return "As tartarugas marinhas podem prender a respiração por várias horas enquanto nadam no mar.";
    }
    if (title.includes('sapo')) {
        return "Os sapos não bebem água pela boca, eles absorvem a água diretamente através da pele!";
    }
    if (title.includes('pinguim')) {
        return "Os pinguins não voam no ar, mas são nadadores incríveis e usam suas asas como nadadeiras debaixo d'água!";
    }
    if (title.includes('golfinho')) {
        return "Os golfinhos são muito inteligentes e amigáveis, e cada um tem um assobio único para chamar o seu nome!";
    }
    if (title.includes('baleia')) {
        return "A baleia-azul é o maior animal que já viveu em toda a história do planeta Terra!";
    }
    if (title.includes('tubarão')) {
        return "Os tubarões têm vários conjuntos de dentes e, se perderem um dente, outro cresce rapidinho no lugar!";
    }
    if (title.includes('polvo')) {
        return "Os polvos têm três corações e o sangue deles é azul!";
    }
    if (title.includes('cavalo-marinho') || title.includes('cavalo marinho')) {
        return "Os cavalos-marinhos nadam de pé e são os papais que carregam os ovinhos na barriga até os bebês nascerem.";
    }
    if (title.includes('papagaio') || title.includes('arara') || title.includes('tucano')) {
        return "Os papagaios são famosos por conseguir imitar sons e vozes humanas muito bem!";
    }
    if (title.includes('coruja')) {
        return "As corujas conseguem girar a cabeça quase inteira (até 270 graus) para olhar ao redor!";
    }
    if (title.includes('flamingo')) {
        return "Os flamingos nascem cinzas e ficam rosa por causa da comida que adoram comer, como pequenos camarões!";
    }
    if (title.includes('gato') || title.includes('gatinho')) {
        return "Os gatos passam cerca de metade do dia se limpando com lambidas! Isso ajuda a manter a higiene e a temperatura.";
    }
    if (title.includes('cachorro') || title.includes('cão') || title.includes('filhote')) {
        return "O olfato dos cães é tão poderoso que eles conseguem farejar coisas que nós nem imaginamos!";
    }
    if (title.includes('coelho')) {
        return "Os coelhos têm uma audição excelente e conseguem girar suas orelhas para ouvir sons de todas as direções.";
    }
    if (title.includes('cavalo')) {
        return "Os cavalos conseguem dormir em pé graças a uma trava especial que têm nas articulações das pernas!";
    }
    if (title.includes('borboleta')) {
        return "As borboletas usam sensores nas patinhas traseiras para sentir o sabor das flores e plantas.";
    }
    if (title.includes('abelha')) {
        return "As abelhas visitam milhares de flores por dia para produzir o mel doce que nós adoramos comer!";
    }
    if (title.includes('caracol')) {
        return "Os caracóis carregam sua casinha nas costas e andam bem devagar, deixando um rastro de brilho para não se perderem.";
    }
    if (title.includes('dinossauro') || title.includes('t-rex') || title.includes('tricerátops')) {
        return "Os dinossauros governaram a Terra por mais de 160 milhões de anos antes de desaparecerem.";
    }
    if (title.includes('foguete') || title.includes('astronauta') || title.includes('planeta') || title.includes('espaço')) {
        return "No espaço sideral não existe som! É um silêncio absoluto porque não há ar para transportar as ondas sonoras.";
    }
    if (title.includes('sol')) {
        return "O Sol é uma estrela gigante! Ele é tão grande que caberiam mais de 1 milhão de planetas Terra dentro dele.";
    }
    if (title.includes('lua')) {
        return "A Lua não tem luz própria, ela apenas brilha porque reflete a luz do Sol igual a um espelho gigante.";
    }
    if (title.includes('bombeiro') || title.includes('médico') || title.includes('professor') || title.includes('policial')) {
        return "As profissões ajudam a cuidar do nosso planeta e fazem com que as cidades funcionem com segurança e amor!";
    }
    if (title.includes('futebol') || title.includes('bola')) {
        return "O futebol é o esporte mais popular do planeta e é jogado por milhões de crianças em todos os países!";
    }
    if (title.includes('carro') || title.includes('avião') || title.includes('trem') || title.includes('trator')) {
        return "O primeiro carro motorizado foi inventado há mais de 130 anos pelo engenheiro Karl Benz.";
    }
    if (title.includes('sorvete') || title.includes('bolo') || title.includes('doce') || title.includes('chocolate')) {
        return "O primeiro sorvete surgiu na China antiga há mais de 3.000 anos, feito com neve, arroz e leite!";
    }
    if (title.includes('maçã') || title.includes('banana') || title.includes('laranja') || title.includes('uva') || title.includes('morango')) {
        return "As frutas são cheias de vitaminas e água, ajudando a dar muita energia para você brincar e colorir o dia todo!";
    }
    if (title.includes('flor') || title.includes('rosa') || title.includes('girassol')) {
        return "Os girassóis giram suas pétalas para acompanhar o caminho do Sol no céu durante o dia!";
    }
    if (title.includes('castelo') || title.includes('princesa') || title.includes('rei') || title.includes('rainha')) {
        return "Muitos castelos reais antigos tinham fossos cheios de água ao redor para proteção e pontes que subiam e desciam.";
    }
    if (title.includes('unicórnio') || title.includes('sereia') || title.includes('fada') || title.includes('dragão')) {
        return "Essas criaturas mágicas vivem nas histórias e na nossa imaginação, nos enchendo de sonhos e fantasia!";
    }

    // 2. Fallbacks baseados na categoria temática do desenho
    if (cat === 'animais-selvagens' || cat === 'animais-do-mar' || cat === 'animais-domesticos') {
        return "Os animais têm habilidades incríveis! Alguns correm super rápido, outros voam alto e outros nadam no fundo do oceano.";
    }
    if (cat === 'dinossauros') {
        return "Os dinossauros viveram na Terra muito antes dos seres humanos e havia dinossauros gigantes e outros bem pequenininhos!";
    }
    if (cat === 'espaco') {
        return "O universo é infinito e cheio de mistérios, com bilhões de estrelas, planetas e galáxias brilhantes!";
    }
    if (cat === 'natureza' || cat === 'flores' || cat === 'flores-e-natureza') {
        return "A natureza nos dá o ar que respiramos, a água limpa e flores coloridas. Cuidar das plantas é cuidar da nossa vida!";
    }
    if (cat === 'veiculos') {
        return "Os veículos nos ajudam a viajar para longe por terra, água ou ar, conectando pessoas do mundo todo!";
    }
    if (cat === 'comidas-e-doces' || cat === 'frutas-e-legumes') {
        return "Comer alimentos coloridos e variados nos deixa fortes, saudáveis e com superpoderes para aprender e crescer!";
    }
    if (cat === 'fantasia' || cat === 'unicornios' || cat === 'princesas' || cat === 'contos-de-fada') {
        return "Colorir desenhos de fantasia ajuda a abrir as asas da criatividade e a viajar para reinos cheios de magia!";
    }
    if (cat === 'alfabeto-e-numeros') {
        return "As letras e os números são como chaves mágicas que abrem as portas para a leitura, escrita e grandes descobertas!";
    }
    if (cat === 'profissoes') {
        return "Cada profissão tem ferramentas especiais e ajuda a tornar o nosso dia a dia mais seguro, saudável e divertido!";
    }
    if (cat === 'halloween') {
        return "O Halloween é uma festa divertida onde as pessoas se fantasiam e as crianças pedem doces ou travessuras!";
    }
    if (cat === 'natal') {
        return "O Natal é uma época mágica cheia de amor, união, luzes brilhantes e troca de presentes com quem amamos!";
    }
    if (cat === 'mandalas') {
        return "Colorir mandalas é uma atividade super relaxante que ajuda a acalmar a mente e a focar a nossa atenção!";
    }
    if (cat === 'folclore-brasileiro') {
        return "O folclore brasileiro é cheio de lendas e seres mágicos que protegem a floresta e os animais!";
    }
    if (cat === 'esportes') {
        return "Praticar esportes faz muito bem para a saúde, nos dá energia e ajuda a fazer novos amigos!";
    }

    // Fallback geral de desenho / pintura
    return "Colorir é uma atividade maravilhosa! Ajuda a relaxar, desenvolve a coordenação motora e deixa o cérebro super ativo.";
}

// --- CRIAÇÃO DE DESENHOS PERSONALIZADOS (Gere sua Imagem) ---

function renderGerarDesenhoView() {
    document.querySelectorAll('.page-view').forEach(view => {
        view.style.display = 'none';
    });
    const viewGerarDesenho = document.getElementById('view-gerar-desenho');
    if (viewGerarDesenho) {
        viewGerarDesenho.style.display = 'block';
    }
    
    const form = document.getElementById('customDrawingForm');
    if (form) form.reset();
    
    const placeholder = document.getElementById('custom-drawing-placeholder');
    const loader = document.getElementById('custom-drawing-loader');
    const img = document.getElementById('custom-drawing-img');
    const actions = document.getElementById('custom-drawing-actions');
    const loginGate = document.getElementById('gerar-desenho-login-gate');
    
    if (placeholder) placeholder.style.display = 'block';
    if (loader) loader.style.display = 'none';
    if (img) img.style.display = 'none';
    if (actions) actions.style.display = 'none';
    
    // Reset quality selectors and button text
    const customDrawingRadioMedium = document.getElementById('customDrawingQualityMedium');
    const customDrawingRadioHigh = document.getElementById('customDrawingQualityHigh');
    if (customDrawingRadioMedium) customDrawingRadioMedium.classList.add('active');
    if (customDrawingRadioHigh) customDrawingRadioHigh.classList.remove('active');
    
    if (typeof window.updateCustomDrawingSubmitButtonText === 'function') {
        window.updateCustomDrawingSubmitButtonText();
    }
    
    if (loginGate) {
        loginGate.style.display = currentUser ? 'none' : 'block';
    }
}

function renderHistoriasMagicasView() {
    document.querySelectorAll('.page-view').forEach(view => {
        view.style.display = 'none';
    });
    const viewHistorias = document.getElementById('view-historias-magicas');
    if (viewHistorias) {
        viewHistorias.style.display = 'block';
    }
    
    document.title = "Criador de Histórias Mágicas — KidCanvas 🧙‍♂️";
    setMetaDescription("Crie e ilustre histórias ilustradas personalizadas consumindo seus créditos mágicos no KidCanvas!");
    
    if (typeof resetForm === 'function') {
        resetForm();
    }
    
    if (typeof updatePlanRestrictions === 'function') {
        updatePlanRestrictions();
    }
}

function openCreditsModal(message, title) {
    const modal = document.getElementById('creditsModal');
    const msgEl = document.getElementById('creditsModalMessage');
    const titleEl = modal ? modal.querySelector('h3') : null;
    if (modal) {
        if (msgEl && message) {
            msgEl.textContent = message;
        }
        if (titleEl) {
            titleEl.textContent = title || "Seus créditos mágicos acabaram!";
        }
        modal.classList.add('open');
    }
}

function closeCreditsModal() {
    const modal = document.getElementById('creditsModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

window.closeCreditsModal = closeCreditsModal;

function handleVerPlanosClick() {
    closeCreditsModal();
    if (typeof navigate === 'function') {
        navigate('/planos');
    } else {
        window.location.href = '/planos';
    }
}

window.handleVerPlanosClick = handleVerPlanosClick;

async function handleCustomDrawingSubmit(event) {
    event.preventDefault();
    
    const promptInput = document.getElementById('customDrawingPrompt');
    if (!promptInput) return;
    const userPrompt = promptInput.value.trim();
    if (!userPrompt) return;
    
    // Obter o estilo escolhido (bw ou color)
    const checkedRadio = document.querySelector('input[name="customDrawingStyle"]:checked');
    const styleType = checkedRadio ? checkedRadio.value : 'bw';
    
    // Obter a qualidade escolhida (medium ou high)
    const checkedQuality = document.querySelector('input[name="customDrawingQuality"]:checked');
    const imageQuality = checkedQuality ? checkedQuality.value : 'medium';
    const cost = imageQuality === 'high' ? 3 : 1;
    
    if (!currentUser) {
        showToast('Cadastre-se grátis para criar desenhos mágicos! 🎨', 'info');
        openAuthModal();
        switchAuthTab('register');
        return;
    }
    
    if (currentUser.paginasRestantes < cost) {
        openCreditsModal('Seus créditos mágicos acabaram! Faça upgrade de plano para continuar criando desenhos mágicos.');
        return;
    }
    
    const placeholder = document.getElementById('custom-drawing-placeholder');
    const loader = document.getElementById('custom-drawing-loader');
    const img = document.getElementById('custom-drawing-img');
    const actions = document.getElementById('custom-drawing-actions');
    const submitBtn = document.getElementById('btn-submit-custom-drawing');
    
    if (placeholder) placeholder.style.display = 'none';
    if (loader) loader.style.display = 'block';
    if (img) img.style.display = 'none';
    if (actions) actions.style.display = 'none';
    if (submitBtn) submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/generate-custom-drawing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify({ userPrompt, styleType, imageQuality })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            if (img) {
                img.src = data.imageUrl;
                img.style.display = 'block';
            }
            if (actions) {
                actions.style.display = 'flex';
            }
            
            setupCustomDrawingActionListeners(data.imageUrl, data.drawingId);
            
            currentUser.paginasRestantes = data.paginasRestantes;
            updateHeaderAuthDisplay();
            
            showToast('Desenho gerado com sucesso! Divirta-se colorindo! 🎨', 'success');
        } else {
            showToast(data.message || 'Ocorreu um erro ao gerar a imagem.', 'error');
            if (data.limitExceeded) {
                openCreditsModal(data.message || 'Você atingiu o limite do seu plano. Faça upgrade para salvar mais!', 'Limite do Plano Atingido! 🚀');
            }
            if (placeholder) placeholder.style.display = 'block';
            if (response.status === 401 || (data.message && (data.message.includes('Sessão inválida') || data.message.includes('Sessão expirada') || data.message.includes('Faça login novamente')))) {
                setTimeout(() => {
                    handleHeaderLogout();
                }, 1500);
            }
        }
    } catch (err) {
        console.error('[Generate Custom Drawing Error]:', err);
        showToast('Erro de conexão ao gerar a imagem.', 'error');
        if (placeholder) placeholder.style.display = 'block';
    } finally {
        if (loader) loader.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
    }
}

window.handleCustomDrawingSubmit = handleCustomDrawingSubmit;

async function handleBugReportSubmit(event) {
    event.preventDefault();
    const bugName = document.getElementById('bugName');
    const bugEmail = document.getElementById('bugEmail');
    const bugTypeRadio = document.querySelector('input[name="bugType"]:checked');
    const bugUrl = document.getElementById('bugUrl');
    const bugMessage = document.getElementById('bugMessage');
    const submitBtn = document.getElementById('btn-submit-bug');
    const successBox = document.getElementById('bug-success-message');
    const formEl = document.getElementById('bugReportForm');
    
    if (!bugName || !bugEmail || !bugTypeRadio || !bugMessage || !submitBtn) return;
    
    const payload = {
        name: bugName.value.trim(),
        email: bugEmail.value.trim(),
        issueType: bugTypeRadio.value,
        message: bugMessage.value.trim(),
        errorUrl: bugUrl ? bugUrl.value.trim() : ''
    };
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
    
    try {
        const response = await fetch('/api/report-bug', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            formEl.style.display = 'none';
            if (successBox) {
                const textEl = document.getElementById('bug-success-text');
                if (textEl) textEl.textContent = data.message;
                successBox.style.display = 'block';
            }
            showToast('Bug reportado com sucesso! 🐛', 'success');
        } else {
            showToast(data.message || 'Erro ao enviar o relato do bug.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Relato 🐛';
        }
    } catch (err) {
        console.error('[Bug Report Submit Error]:', err);
        showToast('Erro de conexão ao enviar o relato do bug.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Relato 🐛';
    }
}
window.handleBugReportSubmit = handleBugReportSubmit;

function renderReportarBugView() {
    document.querySelectorAll('.page-view').forEach(view => {
        view.style.display = 'none';
    });
    const viewReportarBug = document.getElementById('view-reportar-bug');
    if (viewReportarBug) {
        viewReportarBug.style.display = 'block';
    }
    document.title = "Reportar Bug — KidCanvas 🐛";
    setMetaDescription("Viu algo estranho? Envie um relatório de erro direto para a equipe do KidCanvas!");
    
    const formEl = document.getElementById('bugReportForm');
    const successBox = document.getElementById('bug-success-message');
    if (formEl) formEl.style.display = 'block';
    if (successBox) successBox.style.display = 'none';
    
    // Reset form elements
    if (formEl) formEl.reset();
    
    // Reset styles active class for radios
    document.querySelectorAll('input[name="bugType"]').forEach(r => {
        const parent = r.closest('.style-radio-label');
        if (parent) {
            if (r.value === 'drawing') {
                parent.classList.add('active');
                r.checked = true;
            } else {
                parent.classList.remove('active');
            }
        }
    });
    
    // Auto-preencher e-mail e nome se o usuário estiver logado
    const bugName = document.getElementById('bugName');
    const bugEmail = document.getElementById('bugEmail');
    if (currentUser) {
        if (bugName) bugName.value = currentUser.name || '';
        if (bugEmail) bugEmail.value = currentUser.email || '';
    }
    
    const submitBtn = document.getElementById('btn-submit-bug');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Relato 🐛';
    }

    // Setup character counter
    const bugMessage = document.getElementById('bugMessage');
    const charCounter = document.getElementById('bugMessageCharCount');
    if (bugMessage && charCounter) {
        charCounter.textContent = `${bugMessage.value.length} / 300 caracteres`;
        bugMessage.oninput = () => {
            charCounter.textContent = `${bugMessage.value.length} / 300 caracteres`;
        };
    }
}
window.renderReportarBugView = renderReportarBugView;

function setupCustomDrawingActionListeners(imageUrl, drawingId) {
    const downloadBtn = document.getElementById('btn-download-custom');
    const downloadPdfBtn = document.getElementById('btn-download-pdf-custom');
    const printBtn = document.getElementById('btn-print-custom');
    const shareWhatsAppBtn = document.getElementById('btn-share-whatsapp-custom');
    
    const promptText = document.getElementById('customDrawingPrompt').value.trim() || 'Meu desenho mágico';
    
    if (downloadBtn) {
        downloadBtn.onclick = async () => {
            try {
                const cleanPrompt = promptText.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
                const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
                const res = await fetch(proxiedUrl);
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = blobUrl;
                let extension = 'png';
                if (blob.type === 'image/jpeg') {
                    extension = 'jpg';
                } else if (blob.type === 'image/webp') {
                    extension = 'webp';
                }
                a.download = `desenho-magico-${cleanPrompt}.${extension}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
                showToast('Download iniciado! ⬇️', 'success');
            } catch (err) {
                console.error('[Download Custom Drawing Error]:', err);
                // Fallback direct link
                const a = document.createElement('a');
                a.href = imageUrl;
                a.download = `desenho-magico-kidcanvas.jpg`;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showToast('Download iniciado! ⬇️', 'success');
            }
        };
    }

    if (downloadPdfBtn) {
        downloadPdfBtn.onclick = () => {
            downloadCustomDrawingPDF(imageUrl, promptText);
        };
    }
    
    if (printBtn) {
        printBtn.onclick = () => {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Imprimir Desenho Mágico — KidCanvas</title>
                    <style>
                        body {
                            margin: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            background: white;
                        }
                        img {
                            max-width: 100%;
                            max-height: 100%;
                            object-fit: contain;
                        }
                        @media print {
                            body {
                                height: auto;
                            }
                            img {
                                width: 100%;
                                max-height: 100%;
                            }
                        }
                    </style>
                </head>
                <body>
                    <img src="${imageUrl}" onload="window.print(); window.close();">
                </body>
                </html>
            `);
            printWindow.document.close();
        };
    }

    if (shareWhatsAppBtn) {
        shareWhatsAppBtn.onclick = () => {
            shareDrawingOnWhatsApp(imageUrl, promptText);
        };
    }

    const paintOnlineBtn = document.getElementById('btn-paint-custom-online');
    if (paintOnlineBtn) {
        paintOnlineBtn.onclick = () => {
            window.currentPaintingData = {
                imgUrl: imageUrl,
                name: promptText || 'Desenho Customizado',
                backUrl: window.location.pathname,
                isCustomAI: true
            };
            navigate('/pintar-online');
        };
    }

    const saveGalleryBtn = document.getElementById('btn-save-custom-gallery');
    if (saveGalleryBtn) {
        if (currentUser) {
            saveGalleryBtn.style.display = 'inline-flex';
            saveGalleryBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 💾 Salvar na Galeria';
            saveGalleryBtn.disabled = false;
            saveGalleryBtn.onclick = async () => {
                if (!currentUser) {
                    showToast('Por favor, faça login para salvar desenhos na galeria.', 'error');
                    openAuthModal();
                    return;
                }
                
                try {
                    saveGalleryBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
                    saveGalleryBtn.disabled = true;
                    
                    const sessionToken = localStorage.getItem('kidcanvas_session_token') || currentUser.token;
                    const response = await fetch('/api/user/save-painting', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-session-token': sessionToken
                        },
                        body: JSON.stringify({
                            imageUrl: imageUrl,
                            drawingId: drawingId,
                            prompt: promptText,
                            isPublic: false,
                            category: 'Criação com IA'
                        })
                    });
                    
                    const resData = await response.json();
                    
                    if (response.ok && resData.success) {
                        currentUser.myPaintings = resData.myPaintings;
                        if (resData.cards) currentUser.cards = resData.cards;
                        if (resData.stars) {
                            currentUser.stars = resData.stars;
                            updateStarsUI();
                        }
                        
                        if (resData.alreadySaved) {
                            showToast('Desenho já salvo na sua galeria! 🎉', 'success');
                        } else {
                            checkNewAchievements();
                            showToast('Desenho salvo na sua galeria com sucesso! 🎉', 'success');
                        }
                        
                        saveGalleryBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> ✅ Salvo!';
                        saveGalleryBtn.disabled = true;
                        
                        // Animar revelações de descobertas recém-desbloqueadas
                        if (!resData.alreadySaved && resData.newlyUnlocked && resData.newlyUnlocked.length > 0) {
                            resData.newlyUnlocked.forEach((card, index) => {
                                setTimeout(() => {
                                    revealCardAnimation(
                                        card.name,
                                        card.rarity,
                                        card.imageUrl,
                                        card.curiosity,
                                        card.collection ? card.collection.split(' ')[0] : null
                                    );
                                }, index * 4000 + 1500);
                            });
                        }
                        
                        // Animar revelações de Mítica (completou coleção)
                        if (!resData.alreadySaved && resData.completionRewards && resData.completionRewards.length > 0) {
                            resData.completionRewards.forEach((comp, index) => {
                                const mythic = comp.mythicCard;
                                const colName = comp.colName;
                                const delay = (resData.newlyUnlocked ? resData.newlyUnlocked.length : 0) * 4000 + (index * 4000) + 2500;
                                setTimeout(() => {
                                    revealCardAnimation(mythic.name, 'Mítica', mythic.imageUrl, mythic.curiosity, colName);
                                }, delay);
                            });
                        }
                        
                        if (resData.newlyUnlockedCertificates && resData.newlyUnlockedCertificates.length > 0) {
                            setTimeout(() => {
                                checkNewlyUnlockedCertificates(resData.newlyUnlockedCertificates);
                            }, 1000);
                        }
                    } else {
                        showToast(resData.message || 'Erro ao salvar desenho na galeria.', 'error');
                        saveGalleryBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 💾 Salvar na Galeria';
                        saveGalleryBtn.disabled = false;
                        if (resData.limitExceeded) {
                            openCreditsModal(resData.message || 'Você atingiu o limite do seu plano. Faça upgrade para salvar mais!', 'Limite do Plano Atingido! 🚀');
                        }
                    }
                } catch (err) {
                    console.error('[Save Custom Drawing Error]:', err);
                    showToast('Erro de conexão ao salvar na galeria.', 'error');
                    saveGalleryBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 💾 Salvar na Galeria';
                    saveGalleryBtn.disabled = false;
                }
            };
        } else {
            saveGalleryBtn.style.display = 'none';
        }
    }
}

async function handleWaitlistSubmit(event) {
    event.preventDefault();
    const emailInput = document.getElementById('waitlistEmail');
    if (!emailInput) return;
    const email = emailInput.value.trim();
    if (!email) return;
    
    try {
        const response = await fetch('/api/waitlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            showToast(data.message || 'Cadastrado com sucesso!', 'success');
            emailInput.value = '';
        } else {
            showToast(data.message || 'Erro ao cadastrar na lista de espera.', 'error');
        }
    } catch(err) {
        console.error('[Waitlist Submit Error]:', err);
        showToast('Erro ao conectar com o servidor.', 'error');
    }
}

window.handleWaitlistSubmit = handleWaitlistSubmit;

async function handlePlansInterestSubmit(event) {
    event.preventDefault();
    const emailInput = document.getElementById('interest-email');
    if (!emailInput) return;
    const email = emailInput.value.trim();
    if (!email) return;
    
    try {
        const response = await fetch('/api/waitlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            const form = document.getElementById('plans-interest-form');
            if (form) form.style.display = 'none';
            const msg = document.getElementById('interest-success-msg');
            if (msg) msg.style.display = 'block';
            emailInput.value = '';
        } else {
            showToast(data.message || 'Erro ao cadastrar na lista de espera.', 'error');
        }
    } catch(err) {
        console.error('[Plans Waitlist Submit Error]:', err);
        showToast('Erro ao conectar com o servidor.', 'error');
    }
}
window.handlePlansInterestSubmit = handlePlansInterestSubmit;


/* === HISTORIAS MAGICAS CUSTOM LOGIC === */

    function capitalizeFirstLetter(str) {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // -------------------------------------------------------------
    // PRELOADED STORIES DATA & VIEWER LOGIC
    // -------------------------------------------------------------
    const PRELOADED_STORIES = {
        story1: {
            characterName: "Pedrinho, Perigo e Tequila",
            themes: ["Visita à casa da Vovó Sônia"],
            pageCount: 4,
            coverUrl: "https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/pintai-biblioteca/exemplos/story1_cover.png",
            paragraphs: [
                {
                    text: "Pedrinho, um menino adorável de três anos com bochechas fofinhas e um sorriso largo, mal podia esperar para chegar na casa da Vovó Sônia. Assim que a porta se abriu, ele correu para um abraço apertado com sua avó, que usava seus óculos e sorria com carinho. Logo Perigo e Tequila, seus dois amiguinhos Lhasa Apso, apareceram abanando o rabo para dar as boas-vindas. Perigo, o mais travesso, já estava pronto para a brincadeira, enquanto Tequila espreguiçava-se calmamente no tapete fofo da sala.",
                    imageUrl: "https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/pintai-biblioteca/exemplos/story1_page_1.png"
                },
                {
                    text: "Pedrinho adorava a energia do Perigo. O cachorrinho marrom e branco pulava, latia de alegria e corria pela sala, convidando Pedrinho para uma emocionante perseguição de bola. Com suas mãozinhas, Pedrinho jogava a bolinha vermelha, e Perigo, com seus pelos fofos voando, disparava para pegá-la, trazendo de volta com um ar de orgulho. Vovó Sônia observava os dois, rindo baixinho da bagunça divertida que faziam, com Perigo sempre aprontando uma gracinha.",
                    imageUrl: "https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/pintai-biblioteca/exemplos/story1_page_2.png"
                },
                {
                    text: "Depois de tanta correria, Pedrinho sentou-se ao lado da Tequila, a Lhasa Apso mais calma e preguiçosa. Ela era toda branca, parecendo uma nuvem de algodão, e adorava um bom cochilo. Pedrinho fez um carinho suave em sua cabeça, e Tequila, com um suspiro preguiçoso, deitou a cabeça em seu colo, fechando os olhinhos de satisfação. Era um momento tranquilo, de puro carinho entre o menino e sua amiga peluda, que nem se importava com as brincadeiras agitadas do Perigo, preferindo o aconchego.",
                    imageUrl: "https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/pintai-biblioteca/exemplos/story1_page_3.png"
                },
                {
                    text: "À medida que a tarde chegava ao fim, Pedrinho, Perigo e Tequila se aninhavam na sala de Vovó Sônia. Pedrinho estava no chão, encostado nas pernas da avó, que lia um livro para ele com sua voz doce. Perigo, cansado da brincadeira, cochilava aos pés de Pedrinho, e Tequila, sempre preguiçosa, dormia profundamente ao lado deles. A casa estava cheia de amor e alegria, prometendo mais aventuras na próxima visita.",
                    imageUrl: "https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/pintai-biblioteca/exemplos/story1_page_4.png"
                }
            ]
        },
        story2: {
            characterName: "Vovó Sônia e Pedrinho",
            themes: ["Tarde de brincadeiras e amor entre avó e neto"],
            pageCount: 6,
            coverUrl: "https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/pintai-biblioteca/exemplos/story2_cover.png",
            paragraphs: [
                {
                    text: "Era uma vez um menininho chamado Pedrinho, com suas bochechas gordinhas e um sorriso que iluminava qualquer dia. Hoje era um dia especial: Pedrinho ia passar a tarde na casa de sua querida Vovó Sônia! Com sua mochila colorida nas costas e o coração cheio de alegria, ele correu para os braços da vovó, que o esperava na porta com um abraço quentinho e um sorriso doce por trás de seus óculos.",
                    imageUrl: "https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/pintai-biblioteca/exemplos/story2_page_1.png"
                },
                {
                    text: "Depois de muitos beijinhos e abraços, Vovó Sônia convidou Pedrinho para uma aventura no jardim. 'Vamos ajudar as florzinhas a beber água?', perguntou ela, entregando a ele um pequeno regador verde. Pedrinho, com seu sorriso largo, aceitou a missão com entusiasmo. Juntos, eles passearam entre as roseiras e as margaridas, regando cada plantinha com muito carinho, enquanto o sol brilhava suavemente.",
                    imageUrl: "https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/pintai-biblioteca/exemplos/story2_page_2.png"
                },
                {
                    text: "O cheirinho doce que vinha da cozinha já estava enchendo a casa. 'Que cheiro delicioso, vovó!', exclamou Pedrinho, seguindo o aroma até encontrar um bolo recém-assado sobre a mesa, dourado e fofinho, esperando por eles. Vovó Sônia sorriu e disse: 'É o seu bolo favorito, Pedrinho! Com muito amor, como você gosta'.",
                    imageUrl: "https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/pintai-biblioteca/exemplos/story2_page_3.png"
                },
                {
                    text: "Sentados à mesa, com xícaras de chá de camomila e fatias generosas do bolo, Pedrinho saboreava cada pedacinho. Ele tinha um pouco de glacê no nariz, o que fazia Vovó Sônia rir carinhosamente. Era o bolo mais gostoso do mundo, cheio do sabor do carinho da vovó. Ele se sentia o menino mais sortudo do universo, comendo aquele doce pedaço de nuvem.",
                    imageUrl: "https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/pintai-biblioteca/exemplos/story2_page_4.png"
                },
                {
                    text: "Com a barriguinha cheia e o coração feliz, Pedrinho e a Vovó Sônia foram para a sala de estar. A vovó sentou-se em sua poltrona preferida, e Pedrinho aconchegou-se a seu lado, pronto para a melhor parte da tarde. 'Que história vamos ouvir hoje, vovó?', perguntou ele, com os olhinhos brilhando de curiosidade. Vovó Sônia pegou um livro com capa antiga e um sorriso misterioso.",
                    imageUrl: "https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/pintai-biblioteca/exemplos/story2_page_5.png"
                },
                {
                    text: "Enquanto Vovó Sônia contava sobre dragões gentis e princesas corajosas, a imaginação de Pedrinho voava. Ele podia ver os castelos e as florestas encantadas, tudo ganhando vida na sua mente. A tarde na casa da vovó foi mais do que apenas regar flores ou comer bolo; foi uma tarde de magia, amor e histórias que ele guardaria para sempre em seu coração, até a próxima visita.",
                    imageUrl: "https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/pintai-biblioteca/exemplos/story2_page_6.png"
                }
            ]
        }
    };

    const viewerModal = document.getElementById('viewerModal');
    const viewerContent = document.getElementById('viewerContent');
    const viewerModalTitle = document.getElementById('viewerModalTitle');

    function openViewer(storyKey) {
        const story = PRELOADED_STORIES[storyKey];
        if (!story) return;

        viewerModalTitle.textContent = `✨ A História Mágica de ${story.characterName}`;
        
        let html = `
            <div class="cover-page-card" style="margin-top: 10px;">
                <div class="cover-header">
                    <h2 class="cover-title">A História Mágica de ${story.characterName}</h2>
                    <div class="cover-subtitle">Uma história criada especialmente para ${story.characterName}</div>
                </div>
                <div class="cover-art-frame">
                    <img src="${story.coverUrl}" alt="Capa da História Mágica">
                </div>
            </div>
            
            <div style="margin-top: 30px; margin-bottom: 20px;">
                <h4 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--color-orange); text-align: center; margin-bottom: 25px;">📖 Páginas da História</h4>
            </div>
        `;

        story.paragraphs.forEach((page, idx) => {
            html += `
                <div class="story-page" style="margin-bottom: 30px;">
                    <div class="page-grid">
                        <div class="page-text">
                            <span class="page-number">Página ${idx + 1}</span>
                            <p>${page.text}</p>
                        </div>
                        <div class="page-art">
                            <div class="art-frame">
                                <img src="${page.imageUrl}" alt="Ilustração da Página ${idx + 1}">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
            <div style="text-align: center; margin-top: 40px; margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
                <button class="btn-generate btn-bottom" style="background-color: var(--color-purple); display: inline-block; width: auto; padding: 12px 30px;" onclick="scrollToFormAndClose()">✨ Criar a sua história agora! ✨</button>
                <button class="btn-generate btn-bottom" style="background-color: var(--color-blue); display: inline-block; width: auto; padding: 12px 30px;" id="btnDownloadPreloadedPDF" onclick="generatePreloadedPDF('${storyKey}')">📥 Baixar PDF A4</button>
                <button class="btn-generate btn-bottom" style="background-color: #25d366; display: inline-block; width: auto; padding: 12px 30px;" onclick="sharePreloadedStoryOnWhatsApp('${storyKey}')"><i class="fa-brands fa-whatsapp"></i> Enviar pelo WhatsApp</button>
                <button class="btn-generate btn-bottom" style="background-color: var(--color-orange); display: inline-block; width: auto; padding: 12px 30px;" onclick="printPreloadedStory('${storyKey}')"><i class="fa-solid fa-print"></i> Imprimir Livro</button>
            </div>
        `;


        viewerContent.innerHTML = html;
        viewerModal.classList.add('open');
    }

    function closeViewer() {
        viewerModal.classList.remove('open');
        viewerContent.innerHTML = '';
    }

    function scrollToFormAndClose() {
        closeViewer();
        const formCard = document.getElementById('formCard');
        if (formCard) {
            formCard.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                const charInput = document.getElementById('characterName');
                if (charInput) charInput.focus();
            }, 500);
        }
    }

    // -------------------------------------------------------------
    // PROFILE BALANCE & PLAN SYSTEM (Real R2DB integration)
    // -------------------------------------------------------------




    function updatePlanRestrictions() {
        const plan = currentUser ? currentUser.plan : 'Grátis';
        
        // --- 1. Restrição de Páginas do Livro ---
        const card3 = document.getElementById('card3');
        const card5 = document.getElementById('card5');
        const card10 = document.getElementById('card10');
        
        const radio3 = document.querySelector('input[name="pageCount"][value="3"]');
        const radio5 = document.querySelector('input[name="pageCount"][value="5"]');
        const radio10 = document.querySelector('input[name="pageCount"][value="10"]');
        
        // Resetar bloqueios
        [card3, card5, card10].forEach(card => {
            if (card) {
                card.classList.remove('locked-option');
                card.style.opacity = '1';
                card.style.pointerEvents = 'auto';
                const existingLock = card.querySelector('.lock-badge-mini');
                if (existingLock) existingLock.remove();
            }
        });
        
        const lockCard = (card, radio, requiredPlan) => {
            if (card) {
                card.classList.add('locked-option');
                card.style.opacity = '0.6';
                const title = card.querySelector('.page-card-title');
                if (title && !card.querySelector('.lock-badge-mini')) {
                    title.innerHTML += ` <span class="lock-badge-mini" style="font-size:0.8rem;color:var(--color-orange);"><i class="fa-solid fa-lock"></i> ${requiredPlan}</span>`;
                }
            }
        };
        
        if (plan === 'Grátis') {
            lockCard(card5, radio5, 'Família');
            lockCard(card10, radio10, 'Colégio');
        } else if (plan === 'Família') {
            lockCard(card10, radio10, 'Colégio');
        } else if (plan === 'Professor') {
            lockCard(card10, radio10, 'Colégio');
        }
        
        // Escutar cliques para interceptar opções bloqueadas
        [card3, card5, card10].forEach(card => {
            if (card) {
                card.onclick = (e) => {
                    if (card.classList.contains('locked-option')) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (radio3) radio3.checked = true;
                        document.querySelectorAll('.page-card').forEach(c => c.classList.remove('active'));
                        if (card3) card3.classList.add('active');
                        updateGenerateButtonText();
                        
                        const requiredPlan = card === card5 ? 'Família' : 'Colégio';
                        alert(`Esta quantidade de páginas requer o plano ${requiredPlan}! Acesse os Planos para fazer upgrade.`);
                        return false;
                    }
                };
            }
        });
        
        // --- 2. Restrição de Idiomas do Livro ---
        const langCardPt = document.getElementById('langCardPt');
        const langCardEn = document.getElementById('langCardEn');
        const langCardEs = document.getElementById('langCardEs');
        
        const radioPt = document.querySelector('input[name="bookLang"][value="pt"]');
        const radioEn = document.querySelector('input[name="bookLang"][value="en"]');
        const radioEs = document.querySelector('input[name="bookLang"][value="es"]');
        
        const lockEnIcon = document.getElementById('book-lang-lock-en');
        const lockEsIcon = document.getElementById('book-lang-lock-es');
        
        const hasEn = ['Artista', 'Mago Criador', 'Lenda KidCanvas', 'Ultra', 'Família', 'Professor', 'Colégio', 'Premium'].includes(plan);
        const hasEs = ['Mago Criador', 'Lenda KidCanvas', 'Ultra', 'Colégio', 'Premium'].includes(plan);
        
        if (lockEnIcon) lockEnIcon.style.display = hasEn ? 'none' : 'inline-block';
        if (lockEsIcon) lockEsIcon.style.display = hasEs ? 'none' : 'inline-block';
        
        [langCardEn, langCardEs].forEach(card => {
            if (card) {
                card.onclick = (e) => {
                    const isEn = card === langCardEn;
                    if (isEn && !hasEn) {
                        e.preventDefault();
                        e.stopPropagation();
                        radioPt.checked = true;
                        document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('active'));
                        langCardPt.classList.add('active');
                        alert("A criação de livros em Inglês está disponível a partir do plano Artista!");
                        return false;
                    }
                    if (!isEn && !hasEs) {
                        e.preventDefault();
                        e.stopPropagation();
                        radioPt.checked = true;
                        document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('active'));
                        langCardPt.classList.add('active');
                        alert("A criação de livros em Espanhol está disponível a partir do plano Mago Criador!");
                        return false;
                    }
                };
            }
        });
        
        // Estilo de cliques simples para os novos lang-cards
        document.querySelectorAll('.lang-card').forEach(card => {
            card.addEventListener('click', () => {
                if (!card.classList.contains('locked-option')) {
                    document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                }
            });
        });
    }

    // Modal control
    const plansModal = document.getElementById('plansModal');
    
    

    
    
    
    window.closeCreditsModal = closeCreditsModal;
    window.handleVerPlanosClick = handleVerPlanosClick;

    // Switch tabs

    // Handle Login

    // Handle Register

    // Handle Logout

    // Sync User Profile

    // Google Sign-In para o Modal de Histórias Mágicas


    // Handle Subscriptions/Upgrade

    // Initialize display & sync on load
    const urlParams = new URLSearchParams(window.location.search);
    const googleToken = urlParams.get('google_token');
    const isNewUserQuery = urlParams.get('is_new_user');
    
    if (googleToken) {
        localStorage.setItem("kidcanvas_session_token", googleToken);
        sessionToken = googleToken;
        
        let newUrl = window.location.pathname;
        if (isNewUserQuery === 'true') {
            newUrl += '?is_new_user=true';
        }
        window.history.replaceState({}, document.title, newUrl);
    }
    
    if (isNewUserQuery === 'true' || urlParams.get('is_new_user') === 'true') {
        showWelcomeModal();
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }

    if (sessionToken) {
        syncUserProfile();
    }
    

    function updateGenerateButtonText() {
        const btnGenerate = document.getElementById('btnGenerate');
        if (!btnGenerate) return;
        
        if (!currentUser) {
            btnGenerate.textContent = `🔑 Faça login para gerar`;
            btnGenerate.disabled = false;
            return;
        }
        
        const checkedRadio = document.querySelector('input[name="pageCount"]:checked');
        const pageCount = checkedRadio ? parseInt(checkedRadio.value, 10) : 3;
        const cost = pageCount * 3;
        
        btnGenerate.textContent = `Gerar História (${cost} créditos)`;
        const chkCiente = document.getElementById('chkCiente');
        btnGenerate.disabled = chkCiente ? !chkCiente.checked : false;
    }
    window.updateGenerateButtonText = updateGenerateButtonText;
    updateGenerateButtonText();

    // -------------------------------------------------------------
    // FORM CONTROLS & INTERACTIVE UI
    // -------------------------------------------------------------

    // Page count selection visual feedback
    const pageCards = document.querySelectorAll('.page-card');
    pageCards.forEach(card => {
        card.addEventListener('click', () => {
            pageCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            card.querySelector('input[type="radio"]').checked = true;
            updateGenerateButtonText();
        });
    });

    // Style toggle styling visual feedback
    const radioColor = document.getElementById('labelColor');
    const radioBw = document.getElementById('labelBw');
    const inputRadios = document.querySelectorAll('input[name="styleType"]');

    inputRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'color') {
                radioColor.classList.add('active');
                radioBw.classList.remove('active');
            } else {
                radioBw.classList.add('active');
                radioColor.classList.remove('active');
            }
        });
    });

    // Story image quality toggle styling visual feedback and cost updates
    const qualityRadioMedium = document.getElementById('labelQualityMedium');
    const qualityRadioHigh = document.getElementById('labelQualityHigh');
    const inputQualityRadios = document.querySelectorAll('input[name="imageQuality"]');

    if (inputQualityRadios.length > 0) {
        inputQualityRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'high') {
                    if (qualityRadioHigh) qualityRadioHigh.classList.add('active');
                    if (qualityRadioMedium) qualityRadioMedium.classList.remove('active');
                } else {
                    if (qualityRadioMedium) qualityRadioMedium.classList.add('active');
                    if (qualityRadioHigh) qualityRadioHigh.classList.remove('active');
                }
                updateGenerateButtonText();
            });
        });
    }

    // Custom drawing style toggle styling visual feedback
    const customDrawingRadioColor = document.getElementById('customDrawingLabelColor');
    const customDrawingRadioBw = document.getElementById('customDrawingLabelBw');
    const customDrawingInputRadios = document.querySelectorAll('input[name="customDrawingStyle"]');

    if (customDrawingInputRadios.length > 0) {
        customDrawingInputRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'color') {
                    if (customDrawingRadioColor) customDrawingRadioColor.classList.add('active');
                    if (customDrawingRadioBw) customDrawingRadioBw.classList.remove('active');
                } else {
                    if (customDrawingRadioBw) customDrawingRadioBw.classList.add('active');
                    if (customDrawingRadioColor) customDrawingRadioColor.classList.remove('active');
                }
            });
        });
    }

    // Custom drawing quality toggle styling visual feedback and price updates
    const customDrawingRadioMedium = document.getElementById('customDrawingQualityMedium');
    const customDrawingRadioHigh = document.getElementById('customDrawingQualityHigh');
    const customDrawingInputQualityRadios = document.querySelectorAll('input[name="customDrawingQuality"]');
    const submitBtnCustomDrawing = document.getElementById('btn-submit-custom-drawing');

    if (customDrawingInputQualityRadios.length > 0) {
        customDrawingInputQualityRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'high') {
                    if (customDrawingRadioHigh) customDrawingRadioHigh.classList.add('active');
                    if (customDrawingRadioMedium) customDrawingRadioMedium.classList.remove('active');
                } else {
                    if (customDrawingRadioMedium) customDrawingRadioMedium.classList.add('active');
                    if (customDrawingRadioHigh) customDrawingRadioHigh.classList.remove('active');
                }
                if (typeof window.updateCustomDrawingSubmitButtonText === 'function') {
                    window.updateCustomDrawingSubmitButtonText();
                }
            });
        });
    }

    // Bug Report page styling toggle feedback
    const bugRadios = document.querySelectorAll('input[name="bugType"]');
    if (bugRadios.length > 0) {
        bugRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll('input[name="bugType"]').forEach(r => {
                    const parent = r.closest('.style-radio-label');
                    if (parent) {
                        if (r.checked) {
                            parent.classList.add('active');
                        } else {
                            parent.classList.remove('active');
                        }
                    }
                });
            });
        });
    }

    // Dropdown custom theme toggle visibility
    const themeSelect = document.getElementById('themeSelect');
    const customThemeWrapper = document.getElementById('customThemeWrapper');
    const customThemeInput = document.getElementById('customThemeInput');

    themeSelect.addEventListener('change', () => {
        if (themeSelect.value === 'custom') {
            customThemeWrapper.classList.add('open');
            customThemeInput.focus();
        } else {
            customThemeWrapper.classList.remove('open');
            customThemeInput.value = '';
        }
    });

    // Dynamic character counter for synopsis
    const storySynopsis = document.getElementById('storySynopsis');
    const synopsisCounter = document.getElementById('synopsisCounter');
    storySynopsis.addEventListener('input', () => {
        synopsisCounter.textContent = `${storySynopsis.value.length}/300`;
    });

    // Consent checkbox logic to enable/disable submit button
    const chkCiente = document.getElementById('chkCiente');
    
    function startLoadingAnimation() {
        const loadTextEl = document.getElementById('loadingText');
        if (loadTextEl) {
            loadTextEl.textContent = 'Chamando as fadas ilustradoras...';
        }
    }

    // -------------------------------------------------------------
    // GENERATE STORY PIPELINE
    // -------------------------------------------------------------
    const btnGenerate = document.getElementById('btnGenerate');
    const errorAlert = document.getElementById('errorAlert');

    if (chkCiente && btnGenerate) {
        chkCiente.addEventListener('change', () => {
            if (!currentUser) {
                btnGenerate.disabled = false;
            } else {
                btnGenerate.disabled = !chkCiente.checked;
            }
        });
    }
    let generatedParagraphs = []; // Global reference to paragraphs
    let generatedCoverUrl = ""; // Global cover URL reference
    
    btnGenerate.addEventListener('click', async () => {
        const rawCharacterName = document.getElementById('characterName').value.trim();
        const characterName = capitalizeFirstLetter(rawCharacterName);
        const styleType = document.querySelector('input[name="styleType"]:checked').value;
        const pageCount = parseInt(document.querySelector('input[name="pageCount"]:checked').value, 10);
        const bookLang = document.querySelector('input[name="bookLang"]:checked').value;
        const synopsis = storySynopsis.value.trim();
        const checkedQuality = document.querySelector('input[name="imageQuality"]:checked');
        const imageQuality = checkedQuality ? checkedQuality.value : 'medium';
        const cost = pageCount * 3;
        
        let finalTheme = themeSelect.value;
        if (finalTheme === 'custom') {
            finalTheme = customThemeInput.value.trim();
        }
        
        // 1. Validar inputs básicos
        if (!characterName) {
            showError("Ops! Por favor, digite quem é o personagem principal.");
            document.getElementById('characterName').focus();
            return;
        }
        
        if (!finalTheme) {
            showError("Ops! Por favor, selecione ou escreva o tema principal da história.");
            if (themeSelect.value === 'custom') {
                customThemeInput.focus();
            }
            return;
        }

        // 2. Validar Saldo do Plano
        if (!currentUser) {
            showError("Cadastre-se grátis para criar!");
            openAuthModal();
            switchAuthTab('register');
            return;
        }
        if (currentUser.paginasRestantes < cost) {
            openCreditsModal('Seus créditos mágicos acabaram! Faça upgrade de plano para adicionar saldo.');
            return;
        }
        
        hideError();
        
        // Hide Form, Show Loading
        document.getElementById('formCard').style.display = 'none';
        document.getElementById('loadingCard').style.display = 'block';
        startLoadingAnimation();
        
        // Rotate loading messages dynamically
        const loadingTexts = [
            "Chamando as fadas ilustradoras...",
            "Misturando tintas mágicas...",
            "O dragão está desenhando...",
            "As estrelas estão escrevendo...",
            "Quase pronto, segura a emoção!"
        ];
        let loadIdx = 0;
        const loadTextEl = document.getElementById('loadingText');
        const loadInt = setInterval(() => {
            loadIdx = (loadIdx + 1) % loadingTexts.length;
            loadTextEl.textContent = loadingTexts[loadIdx];
        }, 2000);
        
        try {
            const response = await fetch('/api/generate-full-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify({
                    characterName: characterName,
                    themes: [finalTheme],
                    styleType: styleType,
                    pageCount: pageCount,
                    synopsis: synopsis,
                    bookLang: bookLang,
                    imageQuality: imageQuality
                })
            });
            
            const result = await response.json();
            
            clearInterval(loadInt);
            
            if (!response.ok || !result.success) {
                if (result.limitExceeded) {
                    showToast(result.message || 'Você atingiu o limite do seu plano. Faça upgrade para salvar mais!', 'error');
                    openCreditsModal(result.message || 'Você atingiu o limite do seu plano. Faça upgrade para salvar mais!', 'Limite do Plano Atingido! 🚀');
                }
                throw new Error(result.message || "Ocorreu um erro ao gerar a história ilustrada.");
            }
            
            // 3. Sincronizar dados do usuário atualizados do servidor
            await syncUserProfile();
            
            // Populating Cover page
            generatedParagraphs = result.paragraphs;
            generatedCoverUrl = result.coverUrl;
            
            document.getElementById('bookTitle').textContent = `✨ A História Mágica de ${characterName}`;
            document.getElementById('coverTitle').textContent = `A História Mágica de ${characterName}`;
            document.getElementById('coverSubtitle').textContent = `Uma história criada especialmente para ${characterName}`;
            document.getElementById('coverImage').src = result.coverUrl;
            
            // Setup cover actions
            setupCoverActions(result.coverUrl, characterName);
            
            // Render inner pages
            const pagesListContainer = document.getElementById('pagesListContainer');
            pagesListContainer.innerHTML = '';
            
            generatedParagraphs.forEach((page, idx) => {
                const pageEl = document.createElement('div');
                pageEl.className = 'story-page';
                pageEl.innerHTML = `
                    <div class="page-grid">
                        <div class="page-text">
                            <span class="page-number">Página ${idx + 1}</span>
                            <p>${page.text}</p>
                        </div>
                        <div class="page-art">
                            <div class="art-frame">
                                <img src="${page.imageUrl}" alt="Ilustração da Página ${idx + 1}">
                            </div>
                            <div class="btn-action-group">
                                <button class="btn-action btn-print" onclick="printSinglePage(${idx})">🖨️ Imprimir Página</button>
                                <button class="btn-action" onclick="downloadImage('${page.imageUrl}', '${characterName}', ${idx + 1})">💾 Salvar Imagem</button>
                            </div>
                        </div>
                    </div>
                `;
                pagesListContainer.appendChild(pageEl);
            });
            
            // Setup full book print trigger
            setupFullBookPrint(characterName, finalTheme);
            
            // Hide loading, show output
            document.getElementById('loadingCard').style.display = 'none';
            
            const outputSection = document.getElementById('outputSection');
            outputSection.classList.add('show');
            
        } catch (err) {
            clearInterval(loadInt);
            console.error(err);
            document.getElementById('loadingCard').style.display = 'none';
            document.getElementById('formCard').style.display = 'block';
            showError(`Erro ao gerar história: ${err.message}`);
            if (err.message && (err.message.includes('Sessão inválida') || err.message.includes('Sessão expirada') || err.message.includes('Faça login novamente'))) {
                setTimeout(() => {
                    handleHeaderLogout();
                }, 1500);
            }
        }
    });
    
    function showError(msg) {
        errorAlert.textContent = msg;
        errorAlert.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    function hideError() {
        errorAlert.style.display = 'none';
    }
    
    function resetForm() {
        document.getElementById('outputSection').classList.remove('show');
        setTimeout(() => {
            document.getElementById('formCard').style.display = 'block';
            document.getElementById('characterName').value = '';
            document.getElementById('customThemeInput').value = '';
            storySynopsis.value = '';
            synopsisCounter.textContent = '0/300';
            
            // reset select
            themeSelect.selectedIndex = 0;
            customThemeWrapper.classList.remove('open');
            
            // reset page count to 3
            pageCards.forEach(c => c.classList.remove('active'));
            const defaultCard = document.getElementById('card3');
            if (defaultCard) defaultCard.classList.add('active');
            const defaultRadio = document.querySelector('input[name="pageCount"][value="3"]');
            if (defaultRadio) defaultRadio.checked = true;
            updateGenerateButtonText();
            
            // reset radios to color
            document.querySelector('input[name="styleType"][value="color"]').checked = true;
            radioColor.classList.add('active');
            radioBw.classList.remove('active');

            // reset consent checkbox and disable submit button
            if (chkCiente) {
                chkCiente.checked = false;
            }
            if (btnGenerate) {
                btnGenerate.disabled = true;
            }
        }, 300);
    }
    
    // Download image helper
    async function downloadImage(imageUrl, characterName, pageNum) {
        const cleanName = characterName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        try {
            const res = await fetch(imageUrl);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `historia-${cleanName}-pagina-${pageNum}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            window.open(imageUrl, '_blank');
        }
    }
    
    // Setup cover download/print actions
    function setupCoverActions(coverUrl, characterName) {
        const cleanName = characterName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const btnDownloadCover = document.getElementById('btnDownloadCover');
        btnDownloadCover.onclick = async () => {
            try {
                const res = await fetch(coverUrl);
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `historia-${cleanName}-capa.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            } catch (err) {
                window.open(coverUrl, '_blank');
            }
        };
        
        const btnPrintCover = document.getElementById('btnPrintCover');
        btnPrintCover.onclick = () => {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Capa - A História Mágica de ${characterName}</title>
                    <style>
                        body {
                            font-family: sans-serif;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            margin: 0;
                            padding: 20px;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                            max-height: 90vh;
                            border: 8px double #3D281A;
                            border-radius: 15px;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        }
                        .no-print {
                            margin-bottom: 20px;
                        }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="no-print">
                        <button onclick="window.print()" style="padding: 10px 25px; font-size: 1.1rem; cursor: pointer; background: #2ECC71; color: white; border: none; border-radius: 5px; font-weight: bold;">Imprimir Capa 🖨</button>
                    </div>
                    <img src="${coverUrl}">
                </body>
                </html>
            `);
            printWindow.document.close();
        };
    }
    
    // Print a single page
    function printSinglePage(index) {
        const page = generatedParagraphs[index];
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Página ${index + 1} - História Mágica</title>
                <style>
                    body {
                        font-family: sans-serif;
                        color: #3D281A;
                        padding: 30px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                    }
                    .page-container {
                        max-width: 600px;
                        text-align: center;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                        max-height: 400px;
                        border-radius: 10px;
                        border: 3px solid #3D281A;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        margin-bottom: 25px;
                    }
                    p {
                        font-size: 1.25rem;
                        line-height: 1.8;
                        text-align: justify;
                        text-indent: 15px;
                    }
                    .no-print {
                        margin-bottom: 20px;
                    }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print">
                    <button onclick="window.print()" style="padding: 10px 25px; font-size: 1.1rem; cursor: pointer; background: #2ECC71; color: white; border: none; border-radius: 5px; font-weight: bold;">Imprimir Página ${index + 1} 🖨</button>
                </div>
                <div class="page-container">
                    <img src="${page.imageUrl}">
                    <p>${page.text}</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
    
    // Setup full book print trigger
    function setupFullBookPrint(characterName, theme) {
        const btnPrintFullBook = document.getElementById('btnPrintFullBook');
        btnPrintFullBook.onclick = () => {
            const printWindow = window.open('', '_blank');
            
            // Build pages structure
            const pagesHtml = generatedParagraphs.map((page, idx) => `
                <div class="print-page">
                    <div class="page-header">Página ${idx + 1}</div>
                    <div class="image-container">
                        <img src="${page.imageUrl}">
                    </div>
                    <p>${page.text}</p>
                </div>
            `).join('<div style="page-break-after: always;"></div>');
            
            printWindow.document.write(`
                <html>
                <head>
                    <title>A História Mágica de ${characterName}</title>
                    <style>
                        body {
                            font-family: sans-serif;
                            color: #3D281A;
                            padding: 20px;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .book-cover-print {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 95vh;
                            text-align: center;
                        }
                        .book-cover-print img {
                            max-width: 100%;
                            max-height: 80vh;
                            border: 6px solid #3D281A;
                            border-radius: 15px;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        }
                        .print-page {
                            padding: 20px 0;
                            height: 95vh;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                        }
                        .page-header {
                            font-weight: bold;
                            color: #7B4FA6;
                            font-size: 1.1rem;
                            border-bottom: 2px dashed #E67E22;
                            padding-bottom: 5px;
                            margin-bottom: 20px;
                        }
                        .image-container {
                            display: flex;
                            justify-content: center;
                            margin-bottom: 20px;
                            flex-grow: 1;
                            align-items: center;
                        }
                        img {
                            max-width: 100%;
                            max-height: 480px;
                            height: auto;
                            border-radius: 10px;
                            border: 3px solid #3D281A;
                        }
                        p {
                            font-size: 1.25rem;
                            line-height: 1.8;
                            text-align: justify;
                            text-indent: 15px;
                            margin: 0;
                            margin-top: 15px;
                        }
                        .no-print {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        @media print {
                            .no-print { display: none; }
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="no-print">
                        <button onclick="window.print()" style="padding: 10px 25px; font-size: 1.1rem; cursor: pointer; background: #2ECC71; color: white; border: none; border-radius: 5px; font-weight: bold;">Imprimir História Completa 🖨</button>
                    </div>
                    
                    <!-- Cover Page Print -->
                    <div class="book-cover-print">
                        <img src="${generatedCoverUrl}">
                    </div>
                    
                    <div style="page-break-after: always;"></div>
                    
                    <!-- Inner Pages -->
                    ${pagesHtml}
                </body>
                </html>
            `);
            printWindow.document.close();
        };
    }

    // Client-side A4 PDF generation
    function generatePDF() {
        if (!generatedCoverUrl || !generatedParagraphs || generatedParagraphs.length === 0) {
            alert("Nenhuma história gerada para exportação.");
            return;
        }
        const characterName = document.getElementById('characterName').value.trim() || 'Crianca';
        generatePDFFromData(characterName, generatedCoverUrl, generatedParagraphs, 'btnDownloadPDF');
    }

    function generatePDFFromData(characterName, coverUrl, paragraphs, btnId) {
        const cleanCharName = capitalizeFirstLetter(characterName || 'Crianca');
        
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '210mm';
        tempContainer.style.background = '#FFFFFF';
        tempContainer.style.color = '#3D281A';
        tempContainer.style.fontFamily = 'sans-serif';
        document.body.appendChild(tempContainer);

        const proxiedCoverUrl = `/api/proxy-image?url=${encodeURIComponent(coverUrl)}`;

        // 1. Cover Page
        const coverPage = document.createElement('div');
        coverPage.style.width = '210mm';
        coverPage.style.height = '297mm';
        coverPage.style.pageBreakAfter = 'always';
        coverPage.style.display = 'flex';
        coverPage.style.flexDirection = 'column';
        coverPage.style.alignItems = 'center';
        coverPage.style.justifyContent = 'center';
        coverPage.style.boxSizing = 'border-box';
        coverPage.style.padding = '20mm';
        coverPage.style.textAlign = 'center';

        coverPage.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 10mm 0;">
                <div>
                    <h1 style="font-size: 30px; color: #7B4FA6; margin-bottom: 5px; font-family: 'Fredoka', sans-serif; text-align: center;">A História Mágica de ${cleanCharName}</h1>
                    <p style="font-size: 16px; color: #5C4033; font-weight: bold; text-align: center; margin: 0;">Uma história criada especialmente para ${cleanCharName}</p>
                </div>
                <div style="width: 140mm; height: 140mm; border: 4px solid #3D281A; border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #fafbfc; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                    <img src="${proxiedCoverUrl}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 15px; font-weight: bold; color: #7B4FA6;">KidCanvas</div>
                    <div style="font-size: 12px; color: #5C4033;">www.kidcanvas.com.br</div>
                </div>
            </div>
        `;
        tempContainer.appendChild(coverPage);

        // 2. Inner Pages
        paragraphs.forEach((page, idx) => {
            const pageDiv = document.createElement('div');
            pageDiv.style.width = '210mm';
            pageDiv.style.height = '297mm';
            pageDiv.style.pageBreakAfter = (idx === paragraphs.length - 1) ? 'avoid' : 'always';
            pageDiv.style.display = 'flex';
            pageDiv.style.flexDirection = 'column';
            pageDiv.style.alignItems = 'center';
            pageDiv.style.justifyContent = 'space-between';
            pageDiv.style.boxSizing = 'border-box';
            pageDiv.style.padding = '20mm 20mm';

            const proxiedImageUrl = `/api/proxy-image?url=${encodeURIComponent(page.imageUrl)}`;

            pageDiv.innerHTML = `
                <div style="width: 100%; border-bottom: 2px dashed #E67E22; padding-bottom: 5px; font-weight: bold; color: #7B4FA6; font-size: 16px; display: flex; justify-content: space-between;">
                    <span>A História Mágica de ${cleanCharName}</span>
                    <span>Página ${idx + 1}</span>
                </div>
                <div style="width: 130mm; height: 130mm; border: 3px solid #3D281A; border-radius: 15px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #fafbfc; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin: 15px 0;">
                    <img src="${proxiedImageUrl}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <p style="font-size: 16px; line-height: 1.6; text-align: justify; text-indent: 15px; margin: 0; color: #3D281A; max-width: 170mm; flex-grow: 1; display: flex; align-items: center;">${page.text}</p>
                <div style="width: 100%; border-top: 1px solid #eee; padding-top: 5px; font-size: 11px; color: #7B4FA6; font-weight: bold; display: flex; justify-content: space-between;">
                    <span>Criado em www.kidcanvas.com.br</span>
                    <span>KidCanvas IA Mágica</span>
                </div>
            `;
            tempContainer.appendChild(pageDiv);
        });

        const cleanCharNameLower = cleanCharName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const opt = {
            margin: 0,
            filename: `historia-${cleanCharNameLower}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const btnPDF = document.getElementById(btnId);
        let oldText = "";
        if (btnPDF) {
            oldText = btnPDF.textContent;
            btnPDF.textContent = "⏳ Gerando PDF...";
            btnPDF.disabled = true;
        }

        waitForImages(tempContainer).then(() => {
            html2pdf().from(tempContainer).set(opt).save().then(() => {
                document.body.removeChild(tempContainer);
                if (btnPDF) {
                    btnPDF.textContent = oldText;
                    btnPDF.disabled = false;
                }
                showToast('PDF pronto para impressão! ⬇️', 'success');
            }).catch(err => {
                document.body.removeChild(tempContainer);
                console.error("Erro ao gerar PDF:", err);
                if (btnPDF) {
                    btnPDF.textContent = oldText;
                    btnPDF.disabled = false;
                }
                alert("Erro ao exportar PDF. Tente novamente.");
            });
        });
    }

    function downloadCustomDrawingPDF(imageUrl, promptText) {
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '210mm';
        tempContainer.style.height = '297mm';
        tempContainer.style.background = '#FFFFFF';
        tempContainer.style.color = '#3D281A';
        tempContainer.style.fontFamily = 'sans-serif';
        tempContainer.style.display = 'flex';
        tempContainer.style.flexDirection = 'column';
        tempContainer.style.alignItems = 'center';
        tempContainer.style.justifyContent = 'space-between';
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.padding = '20mm 20mm';
        document.body.appendChild(tempContainer);

        const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;

        tempContainer.innerHTML = `
            <div style="width: 100%; border-bottom: 2px dashed #E67E22; padding-bottom: 10px; font-weight: bold; color: #7B4FA6; font-size: 18px; text-align: center; font-family: 'Fredoka', sans-serif;">
                Desenho Mágico — KidCanvas
            </div>
            <div style="width: 160mm; height: 160mm; border: 4px solid #3D281A; border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #fafbfc; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                <img src="${proxiedUrl}" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            <div style="text-align: center; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; max-width: 170mm;">
                <p style="font-size: 16px; font-style: italic; color: #5c4033; font-weight: bold; line-height: 1.5; margin: 0; word-break: break-word;">"${promptText}"</p>
            </div>
            <div style="width: 100%; border-top: 1px solid #eee; padding-top: 10px; font-size: 12px; color: #7B4FA6; font-weight: bold; display: flex; justify-content: space-between; font-family: sans-serif;">
                <span>Criado em www.kidcanvas.com.br</span>
                <span>KidCanvas IA Mágica</span>
            </div>
        `;

        const opt = {
            margin: 0,
            filename: `desenho-magico-kidcanvas.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const btnPDF = document.getElementById('btn-download-pdf-custom');
        let oldText = "";
        if (btnPDF) {
            oldText = btnPDF.textContent;
            btnPDF.textContent = "⏳ Gerando PDF...";
            btnPDF.disabled = true;
        }

        waitForImages(tempContainer).then(() => {
            html2pdf().from(tempContainer).set(opt).save().then(() => {
                document.body.removeChild(tempContainer);
                if (btnPDF) {
                    btnPDF.textContent = oldText;
                    btnPDF.disabled = false;
                }
                showToast('PDF pronto para impressão! ⬇️', 'success');
            }).catch(err => {
                document.body.removeChild(tempContainer);
                console.error("Erro ao gerar PDF:", err);
                if (btnPDF) {
                    btnPDF.textContent = oldText;
                    btnPDF.disabled = false;
                }
                alert("Erro ao exportar PDF. Tente novamente.");
            });
        });
    }

    function shareDrawingOnWhatsApp(imageUrl, promptText) {
        let absoluteImageUrl = imageUrl;
        if (imageUrl && imageUrl.startsWith('/')) {
            absoluteImageUrl = window.location.origin + imageUrl;
        }
        const imagePart = (absoluteImageUrl && !absoluteImageUrl.startsWith('data:')) ? `${absoluteImageUrl}\n\n` : '';
        const message = `Olha o desenho que eu criei no KidCanvas! 🎨\n\n"${promptText}"\n\n${imagePart}Crie o seu também em: https://www.kidcanvas.com.br`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Record share count on backend
        if (typeof window.recordShare === 'function') {
            window.recordShare('painting');
        }
    }

    function shareStoryOnWhatsApp(title) {
        const message = `Criei uma história mágica personalizada chamada "${title}" no KidCanvas! 🧙‍♂️✨\n\nVocê também pode criar histórias personalizadas com ilustrações lindas para seus filhos! Acesse: https://www.kidcanvas.com.br`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Record share count on backend
        if (typeof window.recordShare === 'function') {
            window.recordShare('story');
        }
    }

    function sharePreloadedStoryOnWhatsApp(storyKey) {
        const story = PRELOADED_STORIES[storyKey];
        if (!story) return;
        shareStoryOnWhatsApp(story.characterName);
    }

    function generatePreloadedPDF(storyKey) {
        if (!currentUser) {
            showToast('Faça login ou crie uma conta grátis para baixar histórias em PDF! 📚', 'info');
            openAuthModal();
            return;
        }
        const story = PRELOADED_STORIES[storyKey];
        if (!story) return;
        generatePDFFromData(story.characterName, story.coverUrl, story.paragraphs, 'btnDownloadPreloadedPDF');
    }

    function shareGeneratedStory() {
        const characterName = document.getElementById('characterName').value.trim() || 'Crianca';
        shareStoryOnWhatsApp(characterName);
    }

    function renderHistoriasExemploView() {
        document.title = "Exemplos de Histórias Mágicas — KidCanvas 📚";
        setMetaDescription("Confira exemplos reais de livros ilustrados personalizados gerados por Inteligência Artificial no KidCanvas.");
        
        const view = document.getElementById('view-historias-exemplo');
        if (view) view.style.display = 'block';
        
        fetch('/examples_metadata.json')
            .then(res => res.json())
            .then(data => {
                if (data.story1 && data.story1.coverUrl) {
                    document.getElementById('exemplo-story1-img').src = data.story1.coverUrl;
                }
                if (data.story2 && data.story2.coverUrl) {
                    document.getElementById('exemplo-story2-img').src = data.story2.coverUrl;
                }
                if (data.story1) PRELOADED_STORIES.story1 = { ...PRELOADED_STORIES.story1, ...data.story1 };
                if (data.story2) PRELOADED_STORIES.story2 = { ...PRELOADED_STORIES.story2, ...data.story2 };
            })
            .catch(err => {
                console.warn("examples_metadata.json não pôde ser carregado, usando cache estático:", err);
                document.getElementById('exemplo-story1-img').src = PRELOADED_STORIES.story1.coverUrl;
                document.getElementById('exemplo-story2-img').src = PRELOADED_STORIES.story2.coverUrl;
            });
    }

// === HISTORIAS MAGICAS WINDOW BINDINGS ===
window.openViewer = openViewer;
window.closeViewer = closeViewer;
window.scrollToFormAndClose = scrollToFormAndClose;
window.printSinglePage = printSinglePage;
window.downloadImage = downloadImage;
window.generatePDF = generatePDF;
window.generatePreloadedPDF = generatePreloadedPDF;
window.sharePreloadedStoryOnWhatsApp = sharePreloadedStoryOnWhatsApp;
window.shareGeneratedStory = shareGeneratedStory;
window.renderHistoriasExemploView = renderHistoriasExemploView;
window.resetForm = resetForm;

// === MINHAS CRIAÇÕES GALLERY LOGIC ===
function renderMinhasCriacoesView() {
    document.title = "Minhas Criações — KidCanvas 🎨";
    setMetaDescription("Gerencie e veja seus desenhos e livros mágicos gerados por Inteligência Artificial.");
    
    const view = document.getElementById('view-minhas-criacoes');
    if (view) {
        view.style.display = 'block';
    }
    
    const drawingsGrid = document.getElementById('my-drawings-grid');
    const storiesContainer = document.getElementById('my-stories-container');
    
    if (!currentUser) {
        showToast('Faça login para ver suas criações! 🚪', 'info');
        openAuthModal();
        navigate('/');
        return;
    }
    
    // 1. Renderizar Desenhos
    if (drawingsGrid) {
        drawingsGrid.innerHTML = '';
        const drawings = currentUser.myImages || [];
        
        if (drawings.length === 0) {
            drawingsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border: 2px dashed var(--color-dark); border-radius: var(--radius-sm);">
                    <span style="font-size: 3rem;">🖍️</span>
                    <h4 style="font-size: 1.3rem; margin-top:10px;">Você ainda não gerou desenhos!</h4>
                    <p style="color: var(--color-dark-light); font-size: 0.95rem;">Vá em 'Gere sua Imagem' para criar desenhos incríveis.</p>
                </div>
            `;
        } else {
            drawings.forEach(dw => {
                const imageUrl = dw.url.startsWith('/saved_images/') 
                    ? `https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev${dw.url}` 
                    : dw.url;
                
                const card = document.createElement('div');
                card.className = 'drawing-card';
                card.innerHTML = `
                    <div class="card-img-wrapper" onclick="openImageLightbox('${imageUrl}', '${dw.prompt}')" style="cursor: pointer; transition: transform 0.2s ease;" onmouseenter="this.querySelector('img').style.transform='scale(1.05)'" onmouseleave="this.querySelector('img').style.transform='scale(1)'">
                        <img src="${imageUrl}" alt="${dw.prompt}" loading="lazy" style="transition: transform 0.2s ease; transform-origin: center;">
                    </div>
                    <div class="card-bottom-info">
                        <span class="drawing-card-category">${dw.styleType === 'color' ? 'Colorido 🌈' : 'Preto e Branco 🖍️'}</span>
                        <h4 class="drawing-card-title" style="font-size: 0.85rem; line-height: 1.2; max-height: 34px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${dw.prompt}</h4>
                    </div>
                    <div class="card-bottom" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" onclick="downloadSavedImage('${imageUrl}', '${dw.prompt}')" style="justify-content: center; padding: 6px 10px; font-size: 0.85rem;"><i class="fa-solid fa-download"></i> Salvar</button>
                        <button class="btn btn-secondary btn-sm" onclick="downloadSavedDrawingPDF('${imageUrl}', '${dw.prompt}', this)" style="justify-content: center; padding: 6px 10px; font-size: 0.85rem; background-color: #e74c3c; border-color: #e74c3c; color: white;"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                        <button class="btn btn-primary btn-sm" onclick="printSavedImage('${imageUrl}')" style="justify-content: center; padding: 6px 10px; font-size: 0.85rem; background-color: var(--color-purple);"><i class="fa-solid fa-print"></i> Imprimir</button>
                        <button class="btn btn-success btn-sm" onclick="shareSavedDrawingOnWhatsApp('${imageUrl}', '${dw.prompt}')" style="justify-content: center; padding: 6px 10px; font-size: 0.85rem; background-color: #25d366; border-color: #25d366; color: white;"><i class="fa-brands fa-whatsapp"></i> WhatsApp</button>
                    </div>
                `;
                drawingsGrid.appendChild(card);
            });
        }
    }
    
    // 2. Renderizar Histórias
    if (storiesContainer) {
        storiesContainer.innerHTML = '';
        const stories = currentUser.myStories || [];
        
        if (stories.length === 0) {
            storiesContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; background: white; border: 2px dashed var(--color-dark); border-radius: var(--radius-sm);">
                    <span style="font-size: 3rem;">📖</span>
                    <h4 style="font-size: 1.3rem; margin-top:10px;">Você ainda não criou histórias mágicas!</h4>
                    <p style="color: var(--color-dark-light); font-size: 0.95rem;">Vá em 'Histórias Mágicas' para iniciar histórias personalizadas.</p>
                </div>
            `;
        } else {
            const grid = document.createElement('div');
            grid.className = 'drawings-grid';
            stories.forEach((st, idx) => {
                const card = document.createElement('div');
                card.className = 'drawing-card';
                card.innerHTML = `
                    <div class="card-img-wrapper" style="cursor: pointer;" onclick="openSavedStoryViewer(${idx})">
                        <img src="${st.coverUrl}" alt="${st.title}" loading="lazy">
                    </div>
                    <div class="card-bottom-info">
                        <span class="drawing-card-category">História Mágica 📖</span>
                        <h4 class="drawing-card-title">${st.title}</h4>
                    </div>
                    <div class="card-bottom" style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" onclick="openSavedStoryViewer(${idx})" style="flex: 1; justify-content: center; padding: 6px 10px; font-size: 0.85rem;"><i class="fa-solid fa-eye"></i> Ler</button>
                    </div>
                `;
                grid.appendChild(card);
            });
            storiesContainer.appendChild(grid);
        }
    }

    // 3. Renderizar Pinturas
    const paintingsGrid = document.getElementById('my-paintings-grid');
    if (paintingsGrid) {
        paintingsGrid.innerHTML = '';
        const paintings = currentUser.myPaintings || [];

        if (paintings.length === 0) {
            paintingsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border: 2px dashed var(--color-dark); border-radius: var(--radius-sm);">
                    <span style="font-size: 3rem;">🎨</span>
                    <h4 style="font-size: 1.3rem; margin-top:10px;">Você ainda não salvou pinturas!</h4>
                    <p style="color: var(--color-dark-light); font-size: 0.95rem;">Abra qualquer desenho e clique em "Colorir no Site" para começar.</p>
                </div>
            `;
        } else {
            paintings.forEach(pt => {
                const card = document.createElement('div');
                card.className = 'drawing-card';
                card.innerHTML = `
                    <div class="card-img-wrapper" onclick="openImageLightbox('${pt.url}', '${pt.prompt}')" style="cursor: pointer; transition: transform 0.2s ease;">
                        <img src="${pt.url}" alt="${pt.prompt}" loading="lazy" style="transition: transform 0.2s ease; transform-origin: center;">
                    </div>
                    <div class="card-bottom-info">
                        <span class="drawing-card-category">Minha Pintura 🎨</span>
                        <h4 class="drawing-card-title" style="font-size: 0.85rem; line-height: 1.2; max-height: 34px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${pt.prompt}</h4>
                    </div>
                    <div class="card-bottom" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" onclick="downloadSavedImage('${pt.url}', '${pt.prompt}')" style="justify-content: center; padding: 6px 10px; font-size: 0.85rem;"><i class="fa-solid fa-download"></i> Salvar</button>
                        <button class="btn btn-primary btn-sm" onclick="printSavedImage('${pt.url}')" style="justify-content: center; padding: 6px 10px; font-size: 0.85rem; background-color: var(--color-purple);"><i class="fa-solid fa-print"></i> Imprimir</button>
                    </div>
                `;
                paintingsGrid.appendChild(card);
            });
        }
    }
}

async function downloadSavedImage(url, prompt) {
    const cleanPrompt = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    try {
        const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxiedUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        let extension = 'png';
        if (blob.type === 'image/jpeg') {
            extension = 'jpg';
        } else if (blob.type === 'image/webp') {
            extension = 'webp';
        }
        a.download = `kidcanvas-${cleanPrompt}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch (err) {
        console.error('[Download Saved Image Error]:', err);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kidcanvas-${cleanPrompt}.jpg`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

function printStoryObj(story) {
    if (!currentUser) {
        showToast('Faça login ou crie uma conta grátis para imprimir histórias! 📚', 'info');
        openAuthModal();
        return;
    }
    const printWindow = window.open('', '_blank');
    let html = `
        <html>
        <head>
            <title>Imprimir Livro Mágico — ${story.title}</title>
            <style>
                body { font-family: sans-serif; color: #3D281A; margin: 0; padding: 20px; }
                .page { page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; box-sizing: border-box; padding: 40px; text-align: center; }
                .cover { justify-content: center; }
                .cover img { max-width: 80%; max-height: 60vh; object-fit: contain; border: 4px solid #3d281a; border-radius: 15px; margin: 20px 0; }
                .inner img { max-width: 80%; max-height: 50vh; object-fit: contain; border: 3px solid #3d281a; border-radius: 15px; margin: 15px 0; }
                p { font-size: 1.2rem; line-height: 1.6; max-width: 800px; margin-top: 20px; }
                h1 { font-size: 2.5rem; color: #7B4FA6; }
                @media print {
                    body { padding: 0; }
                    .page { height: 100vh; padding: 20mm; }
                }
            </style>
        </head>
        <body>
            <div class="page cover">
                <h1>${story.title}</h1>
                <img src="${story.coverUrl}">
                <p>Criado em www.kidcanvas.com.br</p>
            </div>
    `;
    
    story.paragraphs.forEach((page, idx) => {
        html += `
            <div class="page inner">
                <h2>Página ${idx + 1}</h2>
                <img src="${page.imageUrl}">
                <p>${page.text}</p>
            </div>
        `;
    });
    
    html += `
            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                };
            </script>
        </body>
        </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
}

function printSavedStory(storyIdx) {
    if (!currentUser || !currentUser.myStories || !currentUser.myStories[storyIdx]) return;
    const story = currentUser.myStories[storyIdx];
    printStoryObj(story);
}

function printPreloadedStory(storyKey) {
    const story = PRELOADED_STORIES[storyKey];
    if (!story) return;
    printStoryObj({
        title: `A História Mágica de ${story.characterName}`,
        coverUrl: story.coverUrl,
        paragraphs: story.paragraphs
    });
}

function downloadSavedStoryPDF(storyIdx) {
    if (!currentUser || !currentUser.myStories || !currentUser.myStories[storyIdx]) return;
    const story = currentUser.myStories[storyIdx];
    generatePDFFromData(story.title, story.coverUrl, story.paragraphs, 'btnDownloadSavedStoryPDF');
}

function shareSavedStoryOnWhatsApp(storyIdx) {
    if (!currentUser || !currentUser.myStories || !currentUser.myStories[storyIdx]) return;
    const story = currentUser.myStories[storyIdx];
    shareStoryOnWhatsApp(story.title);
}

window.printSavedStory = printSavedStory;
window.printPreloadedStory = printPreloadedStory;
window.downloadSavedStoryPDF = downloadSavedStoryPDF;
window.shareSavedStoryOnWhatsApp = shareSavedStoryOnWhatsApp;


function printSavedImage(url) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Imprimir Desenho — KidCanvas</title>
            <style>
                body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: white; }
                img { max-width: 100%; max-height: 100%; object-fit: contain; }
                @media print { body { height: auto; } img { width: 100%; max-height: 100%; } }
            </style>
        </head>
        <body>
            <img src="${url}" onload="window.print(); window.close();">
        </body>
        </html>
    `);
    printWindow.document.close();
}

function waitForImages(container) {
    const images = Array.from(container.getElementsByTagName('img'));
    const promises = images.map(img => {
        return new Promise((resolve) => {
            if (img.complete) {
                resolve();
            } else {
                let resolved = false;
                const done = () => {
                    if (!resolved) {
                        resolved = true;
                        resolve();
                    }
                };
                img.addEventListener('load', done);
                img.addEventListener('error', done);
                setTimeout(done, 8000); // safety timeout
            }
        });
    });
    return Promise.all(promises);
}

function downloadSavedDrawingPDF(imageUrl, promptText, btnEl) {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '210mm';
    tempContainer.style.height = '297mm';
    tempContainer.style.background = '#FFFFFF';
    tempContainer.style.color = '#3D281A';
    tempContainer.style.fontFamily = 'sans-serif';
    tempContainer.style.display = 'flex';
    tempContainer.style.flexDirection = 'column';
    tempContainer.style.alignItems = 'center';
    tempContainer.style.justifyContent = 'space-between';
    tempContainer.style.boxSizing = 'border-box';
    tempContainer.style.padding = '20mm 20mm';
    document.body.appendChild(tempContainer);

    const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;

    tempContainer.innerHTML = `
        <div style="width: 100%; border-bottom: 2px dashed #E67E22; padding-bottom: 10px; font-weight: bold; color: #7B4FA6; font-size: 18px; text-align: center; font-family: 'Fredoka', sans-serif;">
            Desenho Mágico — KidCanvas
        </div>
        <div style="width: 160mm; height: 160mm; border: 4px solid #3D281A; border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #fafbfc; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin: 20px 0;">
            <img src="${proxiedUrl}" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
        <div style="text-align: center; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; max-width: 170mm;">
            <p style="font-size: 16px; font-style: italic; color: #5c4033; font-weight: bold; line-height: 1.5; margin: 0; word-break: break-word;">"${promptText}"</p>
        </div>
        <div style="width: 100%; border-top: 1px solid #eee; padding-top: 10px; font-size: 12px; color: #7B4FA6; font-weight: bold; display: flex; justify-content: space-between; font-family: sans-serif;">
            <span>Criado em www.kidcanvas.com.br</span>
            <span>KidCanvas IA Mágica</span>
        </div>
    `;

    const opt = {
        margin: 0,
        filename: `desenho-magico-kidcanvas.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    let oldText = "";
    if (btnEl) {
        oldText = btnEl.innerHTML;
        btnEl.innerHTML = "⏳ PDF...";
        btnEl.disabled = true;
    }

    waitForImages(tempContainer).then(() => {
        html2pdf().from(tempContainer).set(opt).save().then(() => {
            document.body.removeChild(tempContainer);
            if (btnEl) {
                btnEl.innerHTML = oldText;
                btnEl.disabled = false;
            }
            showToast('PDF pronto para impressão! ⬇️', 'success');
        }).catch(err => {
            document.body.removeChild(tempContainer);
            console.error("Erro ao gerar PDF:", err);
            if (btnEl) {
                btnEl.innerHTML = oldText;
                btnEl.disabled = false;
            }
            alert("Erro ao exportar PDF. Tente novamente.");
        });
    });
}

function shareSavedDrawingOnWhatsApp(imageUrl, promptText) {
    let absoluteImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith('/')) {
        absoluteImageUrl = window.location.origin + imageUrl;
    }
    const imagePart = (absoluteImageUrl && !absoluteImageUrl.startsWith('data:')) ? `${absoluteImageUrl}\n\n` : '';
    const message = `Olha o desenho que eu criei no KidCanvas! 🎨\n\n"${promptText}"\n\n${imagePart}Crie o seu também em: https://www.kidcanvas.com.br`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Record share count on backend
    if (typeof window.recordShare === 'function') {
        window.recordShare('painting');
    }
}

function openImageLightbox(imageUrl, altText) {
    // Check if lightbox already exists, if so remove it
    let lightbox = document.getElementById('drawing-lightbox');
    if (lightbox) {
        lightbox.remove();
    }

    // Create lightbox element
    lightbox = document.createElement('div');
    lightbox.id = 'drawing-lightbox';
    
    // Style the lightbox overlay
    Object.assign(lightbox.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '99999',
        opacity: '0',
        transition: 'opacity 0.25s ease',
        cursor: 'zoom-out',
        backdropFilter: 'blur(5px)',
        webkitBackdropFilter: 'blur(5px)'
    });

    // Create container for image and close button
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'relative',
        maxWidth: '90%',
        maxHeight: '90%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default'
    });

    // Create image element
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = altText || 'Desenho ampliado';
    Object.assign(img.style, {
        maxWidth: '100%',
        maxHeight: '85vh',
        borderRadius: '16px',
        border: '4px solid #ffffff',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        objectFit: 'contain',
        transform: 'scale(0.95)',
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
    });

    // Create close button (X)
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&#x2715;'; // Unicode character ✕ (multiplication sign)
    Object.assign(closeBtn.style, {
        position: 'absolute',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#e74c3c',
        border: '3px solid #ffffff',
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        zIndex: '100000',
        transition: 'background-color 0.2s, transform 0.2s'
    });

    // Responsive position for close button (top-right of screen on mobile to prevent overflow)
    const applyResponsiveStyles = () => {
        if (window.innerWidth < 768) {
            closeBtn.style.position = 'fixed';
            closeBtn.style.top = '16px';
            closeBtn.style.right = '16px';
        } else {
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '-15px';
            closeBtn.style.right = '-15px';
        }
    };
    applyResponsiveStyles();
    
    // Listen to resize to keep button responsive
    window.addEventListener('resize', applyResponsiveStyles);
    
    // Add hover effect to close button
    closeBtn.onmouseenter = () => closeBtn.style.transform = 'scale(1.1)';
    closeBtn.onmouseleave = () => closeBtn.style.transform = 'scale(1)';

    // Assemble lightbox
    const btnContainer = document.createElement('div');
    Object.assign(btnContainer.style, {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '15px',
        gap: '10px',
        zIndex: '100000',
        position: 'relative'
    });

    const printBtn = document.createElement('button');
    printBtn.innerHTML = '<i class="fa-solid fa-print"></i> Imprimir';
    Object.assign(printBtn.style, {
        padding: '8px 16px',
        backgroundColor: '#7950f2',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontFamily: 'Quicksand, sans-serif',
        cursor: 'pointer'
    });
    printBtn.onclick = () => printSavedImage(imageUrl);

    const colorBtn = document.createElement('button');
    colorBtn.innerHTML = '<i class="fa-solid fa-paintbrush"></i> Colorir no Site';
    Object.assign(colorBtn.style, {
        padding: '8px 16px',
        backgroundColor: '#ff5e7e',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontFamily: 'Quicksand, sans-serif',
        cursor: 'pointer'
    });
    colorBtn.onclick = () => {
        closeLightbox();
        window.currentPaintingData = {
            imgUrl: imageUrl,
            name: altText || 'Desenho',
            backUrl: window.location.pathname
        };
        navigate('/pintar-online');
    };

    btnContainer.appendChild(printBtn);
    btnContainer.appendChild(colorBtn);
    container.appendChild(img);
    container.appendChild(btnContainer);
    container.appendChild(closeBtn);
    lightbox.appendChild(container);
    document.body.appendChild(lightbox);

    // Fade in
    setTimeout(() => {
        lightbox.style.opacity = '1';
        img.style.transform = 'scale(1)';
    }, 10);

    // Close function
    const closeLightbox = () => {
        lightbox.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        setTimeout(() => {
            lightbox.remove();
            window.removeEventListener('resize', applyResponsiveStyles);
        }, 250);
        document.removeEventListener('keydown', handleEsc);
    };

    // Close on click background
    lightbox.onclick = (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    };

    // Close on click close button
    closeBtn.onclick = closeLightbox;

    // Close on Esc keypress
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    };
    document.addEventListener('keydown', handleEsc);
}

window.downloadSavedDrawingPDF = downloadSavedDrawingPDF;
window.shareSavedDrawingOnWhatsApp = shareSavedDrawingOnWhatsApp;
window.openImageLightbox = openImageLightbox;

function openSavedStoryViewer(storyIdx) {
    if (!currentUser || !currentUser.myStories || !currentUser.myStories[storyIdx]) return;
    const story = currentUser.myStories[storyIdx];
    
    const viewerModal = document.getElementById('viewerModal');
    const viewerContent = document.getElementById('viewerContent');
    const viewerModalTitle = document.getElementById('viewerModalTitle');
    
    if (!viewerModal || !viewerContent || !viewerModalTitle) return;
    
    viewerModalTitle.textContent = `✨ ${story.title}`;
    
    let html = `
        <div class="cover-page-card" style="margin-top: 10px;">
            <div class="cover-header">
                <h2 class="cover-title">${story.title}</h2>
                <div class="cover-subtitle">Uma história personalizada salva na sua conta</div>
            </div>
            <div class="cover-art-frame">
                <img src="${story.coverUrl}" alt="Capa da História Mágica">
            </div>
        </div>
        
        <div style="margin-top: 30px; margin-bottom: 20px;">
            <h4 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--color-orange); text-align: center; margin-bottom: 25px;">📖 Páginas da História</h4>
        </div>
    `;

    story.paragraphs.forEach((page, idx) => {
        html += `
            <div class="story-page" style="margin-bottom: 30px;">
                <div class="page-grid">
                    <div class="page-text">
                        <span class="page-number">Página ${idx + 1}</span>
                        <p>${page.text}</p>
                    </div>
                    <div class="page-art">
                        <div class="art-frame">
                            <img src="${page.imageUrl}" alt="Ilustração da Página ${idx + 1}">
                        </div>
                        <div class="btn-action-group">
                            <button class="btn-action btn-print" onclick="printSavedImage('${page.imageUrl}')">🖨️ Imprimir Página</button>
                            <button class="btn-action" onclick="downloadSavedImage('${page.imageUrl}', 'pagina-${idx+1}')">💾 Salvar Imagem</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
        <div style="text-align: center; margin-top: 40px; margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
            <button class="btn-generate btn-bottom" style="background-color: var(--color-blue); display: inline-block; width: auto; padding: 12px 30px;" id="btnDownloadSavedStoryPDF" onclick="downloadSavedStoryPDF(${storyIdx})">📥 Baixar PDF A4</button>
            <button class="btn-generate btn-bottom" style="background-color: #25d366; display: inline-block; width: auto; padding: 12px 30px;" onclick="shareSavedStoryOnWhatsApp(${storyIdx})"><i class="fa-brands fa-whatsapp"></i> Enviar pelo WhatsApp</button>
            <button class="btn-generate btn-bottom" style="background-color: var(--color-orange); display: inline-block; width: auto; padding: 12px 30px;" onclick="printSavedStory(${storyIdx})"><i class="fa-solid fa-print"></i> Imprimir Livro</button>
            <button class="btn-generate btn-bottom" style="background-color: var(--color-purple); display: inline-block; width: auto; padding: 12px 30px;" onclick="closeViewer()">Fechar História</button>
        </div>
    `;


    viewerContent.innerHTML = html;
    viewerModal.classList.add('open');
}

function switchCreationsTab(tab) {
    const tabDrawings = document.getElementById('tab-my-drawings');
    const tabStories = document.getElementById('tab-my-stories');
    const tabPaintings = document.getElementById('tab-my-paintings');
    const gridDrawings = document.getElementById('my-drawings-grid');
    const containerStories = document.getElementById('my-stories-container');
    const gridPaintings = document.getElementById('my-paintings-grid');

    if (!tabDrawings || !tabStories || !tabPaintings || !gridDrawings || !containerStories || !gridPaintings) return;

    [tabDrawings, tabStories, tabPaintings].forEach(t => {
        t.style.color = 'var(--color-dark-light)';
        t.style.borderBottomColor = 'transparent';
    });
    [gridDrawings, containerStories, gridPaintings].forEach(g => {
        g.style.display = 'none';
    });

    if (tab === 'drawings') {
        tabDrawings.style.color = 'var(--color-purple)';
        tabDrawings.style.borderBottomColor = 'var(--color-purple)';
        gridDrawings.style.display = 'grid';
    } else if (tab === 'stories') {
        tabStories.style.color = 'var(--color-purple)';
        tabStories.style.borderBottomColor = 'var(--color-purple)';
        containerStories.style.display = 'block';
    } else if (tab === 'paintings') {
        tabPaintings.style.color = 'var(--color-purple)';
        tabPaintings.style.borderBottomColor = 'var(--color-purple)';
        gridPaintings.style.display = 'grid';
    }
}

window.renderMinhasCriacoesView = renderMinhasCriacoesView;
window.downloadSavedImage = downloadSavedImage;
window.printSavedImage = printSavedImage;
window.openSavedStoryViewer = openSavedStoryViewer;
window.switchCreationsTab = switchCreationsTab;

function openCreationsTab(tab) {
    if (!currentUser) {
        if (typeof openAuthModal === 'function') {
            openAuthModal();
        } else {
            alert('Por favor, faça login para ver suas criações.');
        }
        return;
    }
    navigate('/minhas-criacoes');
    setTimeout(() => {
        if (typeof switchCreationsTab === 'function') {
            switchCreationsTab(tab);
        }
    }, 50);
}
window.openCreationsTab = openCreationsTab;

// === PINTAR ONLINE LOGIC ===
let paintCanvas = null;
let pCtx = null;
let selectedPaintColor = [255, 94, 126]; // Pink
let activePaintTool = 'bucket'; // 'bucket', 'glitter', 'brush', 'eraser'
let isPaintDrawing = false;
let paintLastX = 0;
let paintLastY = 0;
let paintDrawingImage = null;

// Zoom and Pan System State
window.paintZoomLevel = 1.0;
window.paintPanX = 0;
window.paintPanY = 0;

// Interactive Sticker System State
window.activeStickers = [];
window.selectedSticker = null;
window.stickerDragMode = null;

// Replay Action History
window.paintActions = [];

// Painting Statistics
window.strokeCount = 0;
window.paintStartTime = null;

// Color History and Favorites
window.paintColorHistory = [];
window.paintColorFavorites = [];

// Crayons Paleta (RGB)
const paintCrayons = [
    // Linha 1 (Cores Principais)
    { hex: '#ff5e7e', rgb: [255, 94, 126], name: 'Vermelho', row: 1 },
    { hex: '#ff2800', rgb: [255, 40, 0], name: 'Vermelho Ferrari', row: 1 },
    { hex: '#ff8138', rgb: [255, 129, 56], name: 'Laranja', row: 1 },
    { hex: '#ffd43b', rgb: [255, 212, 59], name: 'Amarelo', row: 1 },
    { hex: '#40c057', rgb: [64, 192, 87], name: 'Verde', row: 1 },
    { hex: '#12b886', rgb: [18, 184, 134], name: 'Verde Água', row: 1 },
    { hex: '#22b8cf', rgb: [34, 184, 207], name: 'Azul Claro', row: 1 },
    { hex: '#4dabf7', rgb: [77, 171, 247], name: 'Azul', row: 1 },
    { hex: '#7950f2', rgb: [121, 80, 242], name: 'Roxo', row: 1 },
    { hex: '#e64980', rgb: [230, 73, 128], name: 'Rosa', row: 1 },
    { hex: '#a61e4d', rgb: [166, 30, 77], name: 'Vinho', row: 1 },
    { hex: '#868e96', rgb: [134, 142, 150], name: 'Cinza', row: 1 },
    { hex: '#212529', rgb: [33, 37, 41], name: 'Preto', row: 1 },
    { hex: '#ffffff', rgb: [255, 255, 255], name: 'Branco', row: 1 },
    
    // Linha 2 (Cores Complementares e Tons de Pele)
    { hex: '#ffb3c6', rgb: [255, 179, 198], name: 'Rosa Claro', row: 2 },
    { hex: '#d0bfff', rgb: [208, 191, 255], name: 'Lilás', row: 2 },
    { hex: '#a5d8ff', rgb: [165, 216, 255], name: 'Azul Bebê', row: 2 },
    { hex: '#b2f2bb', rgb: [178, 242, 187], name: 'Verde Claro', row: 2 },
    { hex: '#2b8a3e', rgb: [43, 138, 62], name: 'Verde Escuro', row: 2 },
    { hex: '#1864ab', rgb: [24, 100, 171], name: 'Azul Marinho', row: 2 },
    { hex: '#f5e6d3', rgb: [245, 230, 211], name: 'Bege', row: 2 },
    { hex: '#cd853f', rgb: [205, 133, 63], name: 'Marrom Claro', row: 2 },
    { hex: '#5c3d2e', rgb: [92, 61, 46], name: 'Marrom Escuro', row: 2 },
    { hex: '#fed7aa', rgb: [254, 215, 170], name: 'Pele Clara', row: 2 },
    { hex: '#f0b878', rgb: [240, 184, 120], name: 'Pele Média', row: 2 },
    { hex: '#8d5524', rgb: [141, 85, 36], name: 'Pele Morena', row: 2 },
    { hex: '#4a2c11', rgb: [74, 44, 17], name: 'Pele Escura', row: 2 }
];

let paintHistory = [];
let paintHistoryIndex = -1;
const maxHistoryStates = 20;

let paintBgCanvas = null;
let paintBgCtx = null;
let paintFgCanvas = null;
let paintFgCtx = null;
let paintBorderImage = null;

// === PINTURA LIVRE HELPERS & IMPROVEMENTS ===

// 1. Color System Helper
function selectPaintingColor(rgb) {
    selectedPaintColor = rgb;
    const hex = '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
    
    if (!window.colorsUsedInPainting) window.colorsUsedInPainting = new Set();
    window.colorsUsedInPainting.add(hex);
    
    // Add to recent colors
    addColorToRecentHistory(hex);
    
    // Update crayon selections
    document.querySelectorAll('#paint-colors-grid .color-crayon').forEach(c => {
        const cHex = c.getAttribute('data-hex');
        if (cHex === hex) {
            c.classList.add('selected');
            c.style.borderColor = 'var(--color-dark)';
            c.style.transform = 'scale(1.15)';
        } else {
            c.classList.remove('selected');
            c.style.borderColor = 'white';
            c.style.transform = 'none';
        }
    });
    
    if (activePaintTool === 'text') {
        updatePaintCursor('text');
    }
}

// 2. Recent Colors History
function addColorToRecentHistory(hex) {
    window.paintColorHistory = window.paintColorHistory || [];
    window.paintColorHistory = window.paintColorHistory.filter(c => c !== hex);
    window.paintColorHistory.unshift(hex);
    window.paintColorHistory = window.paintColorHistory.slice(0, 8);
    renderRecentColors();
}

function renderRecentColors() {
    const container = document.getElementById('paint-recent-colors');
    if (!container) return;
    container.innerHTML = '';
    window.paintColorHistory.forEach(hex => {
        const div = document.createElement('div');
        div.className = 'recent-color-circle';
        div.style.width = '24px';
        div.style.height = '24px';
        div.style.borderRadius = '50%';
        div.style.backgroundColor = hex;
        div.style.border = '2px solid white';
        div.style.cursor = 'pointer';
        div.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        div.style.transition = 'all 0.1s ease';
        div.title = `Cor recente: ${hex}`;
        
        div.onclick = () => {
            const rgb = [
                parseInt(hex.slice(1, 3), 16),
                parseInt(hex.slice(3, 5), 16),
                parseInt(hex.slice(5, 7), 16)
            ];
            selectPaintingColor(rgb);
        };
        container.appendChild(div);
    });
}

// 3. Favorite Colors
function addColorToFavorites(hex) {
    window.paintColorFavorites = window.paintColorFavorites || JSON.parse(localStorage.getItem('kidcanvas_fav_colors') || '[]');
    if (window.paintColorFavorites.includes(hex)) {
        showToast('Cor já favoritada! ⭐', 'info');
        return;
    }
    if (window.paintColorFavorites.length >= 8) {
        showToast('Máximo de 8 cores favoritas atingido! Remova alguma com duplo clique. 🎨', 'info');
        return;
    }
    window.paintColorFavorites.push(hex);
    localStorage.setItem('kidcanvas_fav_colors', JSON.stringify(window.paintColorFavorites));
    renderFavoriteColors();
    showToast('Cor salva nas favoritas! ⭐', 'success');
}

function removeFavoriteColor(hex) {
    window.paintColorFavorites = window.paintColorFavorites.filter(c => c !== hex);
    localStorage.setItem('kidcanvas_fav_colors', JSON.stringify(window.paintColorFavorites));
    renderFavoriteColors();
    showToast('Favorito removido! 🖍️', 'info');
}

function renderFavoriteColors() {
    const container = document.getElementById('paint-favorite-colors');
    if (!container) return;
    container.innerHTML = '';
    if (window.paintColorFavorites.length === 0) {
        container.innerHTML = '<span style="font-size: 0.75rem; color: var(--color-dark-light); font-style: italic;">Nenhuma favorita ainda</span>';
        return;
    }
    window.paintColorFavorites.forEach(hex => {
        const div = document.createElement('div');
        div.style.width = '26px';
        div.style.height = '26px';
        div.style.borderRadius = '50%';
        div.style.backgroundColor = hex;
        div.style.border = '2px solid white';
        div.style.cursor = 'pointer';
        div.style.boxShadow = '0 1.5px 3px rgba(0,0,0,0.2)';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.fontSize = '0.65rem';
        div.style.color = '#ffd43b';
        div.style.transition = 'all 0.1s ease';
        div.textContent = '★';
        div.title = `Favorito: ${hex}. Duplo clique para excluir.`;
        
        div.onclick = () => {
            const rgb = [
                parseInt(hex.slice(1, 3), 16),
                parseInt(hex.slice(3, 5), 16),
                parseInt(hex.slice(5, 7), 16)
            ];
            selectPaintingColor(rgb);
        };
        div.ondblclick = (e) => {
            e.stopPropagation();
            removeFavoriteColor(hex);
        };
        container.appendChild(div);
    });
}

// 4. Zoom and Pan UI Update
function updateZoomTransform() {
    const viewport = document.getElementById('paint-canvas-viewport');
    if (viewport) {
        viewport.style.transform = `translate(${window.paintPanX}px, ${window.paintPanY}px) scale(${window.paintZoomLevel})`;
    }
    const indicator = document.getElementById('paint-zoom-indicator');
    if (indicator) {
        indicator.textContent = `${Math.round(window.paintZoomLevel * 100)}%`;
    }
}

// 5. Interactive Stickers Helpers & Renderer
function getStickerHandleAt(sticker, px, py) {
    if (!sticker) return null;
    const dx = px - sticker.x;
    const dy = py - sticker.y;
    const cos = Math.cos(-sticker.rotation);
    const sin = Math.sin(-sticker.rotation);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    
    const size = sticker.size || 80;
    const half = size / 2;
    const handleRadius = 30; // Hit area slightly larger for children's fingers
    
    // Delete handle (top-left) - ❌
    const distDelete = Math.hypot(lx - (-half - 8), ly - (-half - 8));
    if (distDelete <= handleRadius) return 'delete';
    
    // Duplicate handle (top-right) - ➕
    const distDuplicate = Math.hypot(lx - (half + 8), ly - (-half - 8));
    if (distDuplicate <= handleRadius) return 'duplicate';
    
    // Rotate handle (bottom-left) - 🔄
    const distRotate = Math.hypot(lx - (-half - 8), ly - (half + 8));
    if (distRotate <= handleRadius) return 'rotate';

    // Scale handle (bottom-right) - ↔️
    const distScale = Math.hypot(lx - (half + 8), ly - (half + 8));
    if (distScale <= handleRadius) return 'scale';
    
    // Body select area
    if (Math.abs(lx) <= half + 8 && Math.abs(ly) <= half + 8) {
        return 'body';
    }
    
    return null;
}

function getStickerAtPosition(px, py) {
    if (!window.activeStickers) return null;
    for (let i = window.activeStickers.length - 1; i >= 0; i--) {
        const st = window.activeStickers[i];
        const dx = px - st.x;
        const dy = py - st.y;
        const cos = Math.cos(-st.rotation);
        const sin = Math.sin(-st.rotation);
        const lx = dx * cos - dy * sin;
        const ly = dx * sin + dy * cos;
        const size = st.size || 80;
        const half = size / 2;
        if (Math.abs(lx) <= half + 8 && Math.abs(ly) <= half + 8) {
            return st;
        }
    }
    return null;
}

window.stickerImageCache = {};
function drawSingleSticker(ctx, sticker, isSelected) {
    ctx.save();
    ctx.translate(sticker.x, sticker.y);
    ctx.rotate(sticker.rotation || 0);
    
    const size = sticker.size || 80;
    const half = size / 2;
    
    if (sticker.stamp.startsWith('http') || sticker.stamp.startsWith('/') || sticker.stamp.startsWith('./')) {
        let img = window.stickerImageCache[sticker.stamp];
        if (!img) {
            img = new Image();
            img.crossOrigin = "anonymous";
            img.src = sticker.stamp;
            img.onload = () => {
                window.stickerImageCache[sticker.stamp] = img;
                composePaintCanvas();
            };
        } else {
            ctx.drawImage(img, -half, -half, size, size);
        }
    } else {
        ctx.font = `${size}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sticker.stamp, 0, 0);
    }
    
    if (isSelected) {
        // Bounding box border
        ctx.strokeStyle = '#9c27b0';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-half - 8, -half - 8, size + 16, size + 16);
        ctx.setLineDash([]);
        
        // Handles (arc radius 16)
        // 1. Delete (top-left) - ❌
        ctx.fillStyle = '#ff5e7e';
        ctx.beginPath();
        ctx.arc(-half - 8, -half - 8, 16, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '15px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❌', -half - 8, -half - 8);
        
        // 2. Duplicate (top-right) - ➕
        ctx.fillStyle = '#2b8a3e';
        ctx.beginPath();
        ctx.arc(half + 8, -half - 8, 16, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('➕', half + 8, -half - 8);
        
        // 3. Rotate (bottom-left) - 🔄
        ctx.fillStyle = '#f59f00';
        ctx.beginPath();
        ctx.arc(-half - 8, half + 8, 16, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔄', -half - 8, half + 8);

        // 4. Scale (bottom-right) - ↔️
        ctx.fillStyle = '#1864ab';
        ctx.beginPath();
        ctx.arc(half + 8, half + 8, 16, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↔️', half + 8, half + 8);
    }
    ctx.restore();
}

function drawActiveStickers(ctx, skipSelection = false) {
    if (!window.activeStickers) window.activeStickers = [];
    window.activeStickers.forEach(st => {
        const isSelected = !skipSelection && (window.selectedSticker === st);
        drawSingleSticker(ctx, st, isSelected);
    });
}

function insertStickerInstantly(emoji) {
    if (!window.paintStartTime) {
        window.paintStartTime = Date.now();
    }
    const newSticker = {
        id: 'sticker_' + Date.now() + '_' + Math.round(Math.random() * 1000000),
        stamp: emoji,
        x: 400,
        y: 300,
        size: 80,
        rotation: 0
    };
    if (!window.activeStickers) window.activeStickers = [];
    window.activeStickers.push(newSticker);
    window.selectedSticker = newSticker;
    
    // Switch to select tool so it's draggable
    setPaintTool('select');

    // Track action
    if (!window.paintActions) window.paintActions = [];
    window.paintActions.push({
        type: 'sticker-add',
        id: newSticker.id,
        stamp: emoji,
        x: 400,
        y: 300,
        size: 80,
        rotation: 0,
        time: Date.now()
    });
    
    composePaintCanvas();
    savePaintHistory();
}

// 6. Confetti and Stars Finalization Effect
let confettiActive = false;
let confettiParticles = [];
function startConfettiCelebration() {
    confettiActive = true;
    const canvas = document.getElementById('paint-confetti-canvas');
    if (!canvas) return;
    canvas.style.display = 'block';
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    // Handle resizing during confetti
    const resizeHandler = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeHandler);
    
    confettiParticles = [];
    for (let i = 0; i < 150; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * canvas.height,
            color: `hsl(${Math.random() * 360}, 100%, 60%)`,
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0
        });
    }
    
    function drawConfetti() {
        if (!confettiActive) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = 'none';
            window.removeEventListener('resize', resizeHandler);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiParticles.forEach((p, idx) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.tilt = Math.sin(p.tiltAngle - idx/3) * 15;
            
            if (p.y > canvas.height) {
                confettiParticles[idx] = {
                    x: Math.random() * canvas.width,
                    y: -20,
                    r: p.r,
                    d: p.d,
                    color: p.color,
                    tilt: p.tilt,
                    tiltAngleIncremental: p.tiltAngleIncremental,
                    tiltAngle: p.tiltAngle
                };
            }
            
            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
        });
        
        requestAnimationFrame(drawConfetti);
    }
    
    drawConfetti();
    setTimeout(() => { confettiActive = false; }, 6000);
}

// 7. Auto-Save System
function saveAutosaveToLocalStorage() {
    if (!paintCanvas || !window.currentPaintingData) return;
    try {
        const autosave = {
            drawingId: window.currentPaintingData.id || window.currentPaintingData.name,
            bg: paintBgCanvas.toDataURL(),
            fg: paintFgCanvas.toDataURL(),
            stickers: window.activeStickers,
            colors: Array.from(window.colorsUsedInPainting || []),
            strokes: window.strokeCount,
            startTime: window.paintStartTime,
            timestamp: Date.now()
        };
        localStorage.setItem('kidcanvas_autosave', JSON.stringify(autosave));
    } catch (e) {
        console.error('Erro ao gravar autosave no LocalStorage:', e);
    }
}

function checkAndRestoreAutosave() {
    const data = window.currentPaintingData;
    if (!data) return;
    const currentId = data.id || data.name;
    const raw = localStorage.getItem('kidcanvas_autosave');
    if (!raw) return;
    
    try {
        const autosave = JSON.parse(raw);
        // Expirar autosave mais antigo que 24 horas
        if (Date.now() - autosave.timestamp > 86400000) {
            localStorage.removeItem('kidcanvas_autosave');
            return;
        }
        
        if (autosave.drawingId === currentId) {
            showCustomConfirm(
                'Continuar Desenho? 🎨',
                'Detectamos que você tem uma pintura não salva deste desenho! Quer continuar de onde parou? 🎨',
                () => {
                    const bgImg = new Image();
                    bgImg.onload = () => {
                        paintBgCtx.clearRect(0, 0, 800, 600);
                        paintBgCtx.drawImage(bgImg, 0, 0);
                        
                        const fgImg = new Image();
                        fgImg.onload = () => {
                            paintFgCtx.clearRect(0, 0, 800, 600);
                            paintFgCtx.drawImage(fgImg, 0, 0);
                            
                            window.activeStickers = autosave.stickers || [];
                            window.colorsUsedInPainting = new Set(autosave.colors || []);
                            window.strokeCount = autosave.strokes || 0;
                            window.paintStartTime = autosave.startTime || null;
                            
                            composePaintCanvas();
                            savePaintHistory();
                            showToast('Progresso recuperado com sucesso! 🖍️', 'success');
                        };
                        fgImg.src = autosave.fg;
                    };
                    bgImg.src = autosave.bg;
                },
                () => {
                    localStorage.removeItem('kidcanvas_autosave');
                }
            );
        }
    } catch (e) {
        console.error(e);
    }
}

function renderPintarOnlineView() {
    document.title = "Colorir Online — KidCanvas 🎨";
    setMetaDescription("Colore e pinte online usando lápis de cor, balde de tinta e glitter mágico de forma interativa.");

    const view = document.getElementById('view-pintar-online');
    if (view) {
        view.style.display = 'block';
    }

    const data = window.currentPaintingData;
    if (!data || !data.imgUrl) {
        navigate('/');
        return;
    }

    // Configurar botão de voltar
    const backBtn = document.getElementById('paint-breadcrumbs-back');
    if (backBtn) {
        backBtn.textContent = data.name;
        backBtn.onclick = (e) => {
            e.preventDefault();
            navigate(data.backUrl);
        };
    }

    // Inicializar Canvas Principal
    paintCanvas = document.getElementById('main-paint-canvas');
    pCtx = paintCanvas.getContext('2d');
    
    paintCanvas.width = 800;
    paintCanvas.height = 600;

    // Inicializar Canvases Auxiliares
    if (!paintBgCanvas) {
        paintBgCanvas = document.createElement('canvas');
        paintBgCanvas.width = 800;
        paintBgCanvas.height = 600;
        paintBgCtx = paintBgCanvas.getContext('2d');
    }
    if (!paintFgCanvas) {
        paintFgCanvas = document.createElement('canvas');
        paintFgCanvas.width = 800;
        paintFgCanvas.height = 600;
        paintFgCtx = paintFgCanvas.getContext('2d');
    }

    // Limpar camadas
    paintBgCtx.clearRect(0, 0, 800, 600);
    paintFgCtx.clearRect(0, 0, 800, 600);

    // Limpar Histórico
    paintHistory = [];
    paintHistoryIndex = -1;
    updateUndoRedoButtons();

    // Resetar estado de desenho e zoom
    isPaintDrawing = false;
    setPaintTool('bucket');
    
    window.paintZoomLevel = parseFloat(sessionStorage.getItem('kidcanvas_zoom')) || 1.0;
    window.paintPanX = 0;
    window.paintPanY = 0;
    updateZoomTransform();

    window.activeStickers = [];
    window.selectedSticker = null;
    window.stickerDragMode = null;
    window.paintActions = [];
    window.strokeCount = 0;
    window.paintStartTime = null;
    window.colorsUsedInPainting = new Set();
    window.paintColorHistory = window.paintColorHistory || [];

    // Resetar checkbox público e botão de salvar
    const resetChkPublic = document.getElementById('paint-chk-public');
    const resetBtnSave = document.getElementById('paint-btn-save');
    const publicCard = document.getElementById('paint-chk-public-wrapper');
    if (resetChkPublic) {
        resetChkPublic.checked = false;
        if (publicCard) {
            publicCard.style.background = '#fffdf0';
            publicCard.style.borderColor = 'var(--color-dark)';
        }
    }
    if (resetBtnSave) {
        resetBtnSave.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar na Galeria';
        resetBtnSave.style.backgroundColor = 'var(--color-green)';
        resetBtnSave.style.borderColor = 'var(--color-green)';
        resetBtnSave.classList.remove('pulse-button');
    }

    // Carregar imagem de desenho
    const loader = document.getElementById('paint-canvas-loader');
    if (loader) loader.style.display = 'flex';

    const chkPublicWrapper = document.getElementById('paint-chk-public-wrapper');
    if (chkPublicWrapper) {
        chkPublicWrapper.style.display = 'flex';
    }

    if (data.imgUrl === 'blank') {
        paintDrawingImage = null;
        paintBorderImage = null;
        
        // Desenhar no background inicial branco
        paintBgCtx.fillStyle = '#ffffff';
        paintBgCtx.fillRect(0, 0, 800, 600);
        
        composePaintCanvas();
        savePaintHistory();
        if (loader) loader.style.display = 'none';
    } else {
        if (chkPublicWrapper) chkPublicWrapper.style.display = 'flex';
        paintDrawingImage = new Image();
        paintDrawingImage.crossOrigin = "anonymous";
        paintDrawingImage.onload = () => {
            // Ajustar dimensões preservando proporção
            const aspect = paintDrawingImage.width / paintDrawingImage.height;
            let w = paintCanvas.width;
            let h = paintCanvas.height;
            let x = 0;
            let y = 0;

            if (aspect > 4/3) {
                h = paintCanvas.width / aspect;
                y = (paintCanvas.height - h) / 2;
            } else {
                w = paintCanvas.height * aspect;
                x = (paintCanvas.width - w) / 2;
            }

            // Desenhar no background inicial
            paintBgCtx.fillStyle = '#ffffff';
            paintBgCtx.fillRect(0, 0, 800, 600);
            paintBgCtx.drawImage(paintDrawingImage, x, y, w, h);
            
            // Limpar outlines do desenho
            cleanPaintCanvasOutlineDirect(paintBgCtx);

            paintBorderImage = null;
            composePaintCanvas();
            savePaintHistory();
            if (loader) loader.style.display = 'none';
        };
        paintDrawingImage.src = '/api/proxy-image?url=' + encodeURIComponent(data.imgUrl);
    }

    // Configurar Paleta e Rastrear Cores
    if (paintCrayons && paintCrayons.length > 0) {
        window.colorsUsedInPainting.add(paintCrayons[0].hex); // Cor inicial padrão
    }

    const colorsGrid = document.getElementById('paint-colors-grid');
    if (colorsGrid) {
        colorsGrid.innerHTML = '';
        
        // Criar as duas linhas na interface
        const row1El = document.createElement('div');
        row1El.className = 'paint-colors-row';
        row1El.style.display = 'flex';
        row1El.style.flexWrap = 'wrap';
        row1El.style.gap = '10px';
        
        const row2El = document.createElement('div');
        row2El.className = 'paint-colors-row';
        row2El.style.display = 'flex';
        row2El.style.flexWrap = 'wrap';
        row2El.style.gap = '10px';
        
        colorsGrid.appendChild(row1El);
        colorsGrid.appendChild(row2El);
        
        paintCrayons.forEach((crayon, index) => {
            const div = document.createElement('div');
            div.className = 'color-crayon' + (index === 0 ? ' selected' : '');
            div.style.backgroundColor = crayon.hex;
            div.style.width = '36px';
            div.style.height = '36px';
            div.style.borderRadius = '50%';
            div.style.border = '3px solid white';
            div.style.cursor = 'pointer';
            div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)';
            div.style.transition = 'all 0.2s ease';
            div.title = crayon.name;
            div.setAttribute('data-hex', crayon.hex);
            
            div.addEventListener('click', () => {
                selectPaintingColor(crayon.rgb);
            });
            
            if (crayon.row === 1) {
                row1El.appendChild(div);
            } else {
                row2El.appendChild(div);
            }
        });
    }

    // Renderizar Recentes e Favoritos
    renderRecentColors();
    renderFavoriteColors();

    const btnFav = document.getElementById('paint-btn-add-favorite');
    if (btnFav) {
        btnFav.onclick = () => {
            const hex = '#' + selectedPaintColor.map(x => x.toString(16).padStart(2, '0')).join('');
            addColorToFavorites(hex);
        };
    }

    // Configurar botões de Zoom
    const btnZoomIn = document.getElementById('paint-btn-zoom-in');
    if (btnZoomIn) {
        btnZoomIn.onclick = () => {
            window.paintZoomLevel = Math.min(3.0, window.paintZoomLevel * 1.25);
            updateZoomTransform();
        };
    }
    const btnZoomOut = document.getElementById('paint-btn-zoom-out');
    if (btnZoomOut) {
        btnZoomOut.onclick = () => {
            window.paintZoomLevel = Math.max(0.5, window.paintZoomLevel / 1.25);
            updateZoomTransform();
        };
    }
    const btnZoomFit = document.getElementById('paint-btn-zoom-fit');
    if (btnZoomFit) {
        btnZoomFit.onclick = () => {
            window.paintZoomLevel = 1.0;
            window.paintPanX = 0;
            window.paintPanY = 0;
            updateZoomTransform();
        };
    }

    // Configurar Eventos do Canvas
    paintCanvas.onmousedown = startPaintingDraw;
    paintCanvas.onmousemove = executePaintingDraw;
    paintCanvas.onmouseup = stopPaintingDraw;
    paintCanvas.onmouseleave = stopPaintingDraw;

    paintCanvas.ontouchstart = (e) => {
        if (e.touches.length === 1) {
            e.preventDefault();
            startPaintingDraw(e);
        }
    };
    paintCanvas.ontouchmove = (e) => {
        if (e.touches.length === 1) {
            e.preventDefault();
            executePaintingDraw(e);
        }
    };
    paintCanvas.ontouchend = (e) => {
        e.preventDefault();
        stopPaintingDraw();
    };

    // Configurar Zoom via Scroll do Mouse no Container
    const workspaceContainer = document.querySelector('.paint-canvas-container');
    let isPanning = false;
    let startPanX = 0, startPanY = 0;
    let startMouseX = 0, startMouseY = 0;
    let isSpaceBarPressed = false;

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            const onlineView = document.getElementById('view-pintar-online');
            if (onlineView && onlineView.style.display === 'block') {
                isSpaceBarPressed = true;
                e.preventDefault();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            isSpaceBarPressed = false;
        }
    });

    if (workspaceContainer) {
        workspaceContainer.onwheel = (e) => {
            e.preventDefault();
            const rect = workspaceContainer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const canvasX = (mouseX - window.paintPanX) / window.paintZoomLevel;
            const canvasY = (mouseY - window.paintPanY) / window.paintZoomLevel;
            
            const oldZoom = window.paintZoomLevel;
            const zoomFactor = 1.1;
            if (e.deltaY < 0) {
                window.paintZoomLevel = Math.min(3.0, window.paintZoomLevel * zoomFactor);
            } else {
                window.paintZoomLevel = Math.max(0.5, window.paintZoomLevel / zoomFactor);
            }
            
            window.paintPanX = mouseX - canvasX * window.paintZoomLevel;
            window.paintPanY = mouseY - canvasY * window.paintZoomLevel;
            
            sessionStorage.setItem('kidcanvas_zoom', window.paintZoomLevel);
            updateZoomTransform();
        };

        // Panning handler
        workspaceContainer.onmousedown = (e) => {
            if (isSpaceBarPressed || e.button === 1 || activePaintTool === 'pan') {
                isPanning = true;
                startPanX = window.paintPanX;
                startPanY = window.paintPanY;
                startMouseX = e.clientX;
                startMouseY = e.clientY;
                e.preventDefault();
            }
        };

        workspaceContainer.addEventListener('mousemove', (e) => {
            if (isPanning) {
                const dx = e.clientX - startMouseX;
                const dy = e.clientY - startMouseY;
                window.paintPanX = startPanX + dx;
                window.paintPanY = startPanY + dy;
                updateZoomTransform();
            }
        });

        workspaceContainer.addEventListener('mouseup', () => {
            isPanning = false;
        });

        workspaceContainer.addEventListener('mouseleave', () => {
            isPanning = false;
        });

        // Touch systems for Mobile (Pinch to Zoom & Pan)
        let lastTouchDist = 0;
        let lastTouchX = 0;
        let lastTouchY = 0;

        workspaceContainer.ontouchstart = (e) => {
            if (e.touches.length === 2) {
                const t1 = e.touches[0];
                const t2 = e.touches[1];
                lastTouchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
                lastTouchX = (t1.clientX + t2.clientX) / 2;
                lastTouchY = (t1.clientY + t2.clientY) / 2;
            } else if (e.touches.length === 1) {
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                paintCanvas.dispatchEvent(mouseEvent);
            }
        };

        workspaceContainer.ontouchmove = (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const t1 = e.touches[0];
                const t2 = e.touches[1];
                const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
                const touchX = (t1.clientX + t2.clientX) / 2;
                const touchY = (t1.clientY + t2.clientY) / 2;
                
                const rect = workspaceContainer.getBoundingClientRect();
                const mouseX = touchX - rect.left;
                const mouseY = touchY - rect.top;
                
                const canvasX = (mouseX - window.paintPanX) / window.paintZoomLevel;
                const canvasY = (mouseY - window.paintPanY) / window.paintZoomLevel;
                
                const zoomFactor = dist / lastTouchDist;
                window.paintZoomLevel = Math.max(0.5, Math.min(3.0, window.paintZoomLevel * zoomFactor));
                
                const dx = touchX - lastTouchX;
                const dy = touchY - lastTouchY;
                window.paintPanX = mouseX - canvasX * window.paintZoomLevel + dx;
                window.paintPanY = mouseY - canvasY * window.paintZoomLevel + dy;
                
                lastTouchDist = dist;
                lastTouchX = touchX;
                lastTouchY = touchY;
                
                updateZoomTransform();
            } else if (e.touches.length === 1) {
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                paintCanvas.dispatchEvent(mouseEvent);
            }
        };

        workspaceContainer.ontouchend = (e) => {
            if (e.touches.length === 0) {
                const mouseEvent = new MouseEvent('mouseup', {});
                paintCanvas.dispatchEvent(mouseEvent);
            }
        };
    }

    // Configurar Tamanho Presets
    document.querySelectorAll('.paint-size-preset-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.paint-size-preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const sz = parseInt(btn.getAttribute('data-size'));
            const slider = document.getElementById('paint-brush-size');
            const valEl = document.getElementById('paint-brush-size-val');
            if (slider) slider.value = sz;
            if (valEl) valEl.textContent = `${sz}px`;
        };
    });

    const brushSizeInput = document.getElementById('paint-brush-size');
    if (brushSizeInput) {
        brushSizeInput.oninput = (e) => {
            const val = parseInt(e.target.value);
            const valEl = document.getElementById('paint-brush-size-val');
            if (valEl) valEl.textContent = `${val}px`;
            
            document.querySelectorAll('.paint-size-preset-btn').forEach(btn => {
                const sz = parseInt(btn.getAttribute('data-size'));
                if (sz === val) btn.classList.add('active');
                else btn.classList.remove('active');
            });
        };
    }

    // Atualização dinâmica do cursor de texto à medida que a criança digita ou troca a fonte
    const textInputVal = document.getElementById('paint-text-value');
    const textFontVal = document.getElementById('paint-text-font');
    if (textInputVal) {
        textInputVal.oninput = () => {
            if (activePaintTool === 'text') {
                updatePaintCursor('text');
            }
        };
    }
    if (textFontVal) {
        textFontVal.onchange = () => {
            if (activePaintTool === 'text') {
                updatePaintCursor('text');
            }
        };
    }

    // Configurar botões extras
    const btnUndo = document.getElementById('paint-btn-undo');
    if (btnUndo) btnUndo.onclick = undoPaint;

    const btnRedo = document.getElementById('paint-btn-redo');
    if (btnRedo) btnRedo.onclick = redoPaint;

    const btnPrint = document.getElementById('paint-btn-print');
    if (btnPrint) {
        btnPrint.onclick = () => {
            // Compose without handles before printing
            const originalSticker = window.selectedSticker;
            window.selectedSticker = null;
            composePaintCanvas();
            const dataUrl = paintCanvas.toDataURL('image/png');
            printSavedImage(dataUrl);
            window.selectedSticker = originalSticker;
            composePaintCanvas();
        };
    }

    const btnPDF = document.getElementById('paint-btn-pdf');
    if (btnPDF) {
        btnPDF.onclick = () => {
            // Compose without handles before export
            const originalSticker = window.selectedSticker;
            window.selectedSticker = null;
            composePaintCanvas();
            const dataUrl = paintCanvas.toDataURL('image/png');
            downloadSavedDrawingPDF(dataUrl, window.currentPaintingData.name, btnPDF);
            window.selectedSticker = originalSticker;
            composePaintCanvas();
        };
    }

    const btnWhatsApp = document.getElementById('paint-btn-whatsapp');
    if (btnWhatsApp) {
        btnWhatsApp.onclick = async () => {
            if (!currentUser) {
                showToast('Faça login ou crie uma conta grátis para compartilhar sua pintura por WhatsApp! 📲', 'info');
                openAuthModal();
                return;
            }
            
            const oldText = btnWhatsApp.innerHTML;
            btnWhatsApp.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparando...';
            btnWhatsApp.disabled = true;
            
            try {
                // Hide selection handles for export
                const originalSticker = window.selectedSticker;
                window.selectedSticker = null;
                composePaintCanvas();
                const dataUrl = paintCanvas.toDataURL('image/png');
                window.selectedSticker = originalSticker;
                composePaintCanvas();

                const chkPublic = document.getElementById('paint-chk-public');
                const isPublic = chkPublic ? chkPublic.checked : false;

                const response = await fetch('/api/user/save-painting', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-token': sessionToken || ''
                    },
                    body: JSON.stringify({
                        imageBase64: dataUrl,
                        prompt: window.currentPaintingData.name,
                        isPublic: isPublic
                    })
                });
                
                const result = await response.json();
                if (result.success && result.imageUrl) {
                    shareSavedDrawingOnWhatsApp(result.imageUrl, window.currentPaintingData.name);
                    showToast('Compartilhando no WhatsApp! 📲', 'success');
                } else {
                    showToast(result.message || 'Erro ao preparar compartilhamento.', 'error');
                    if (result.limitExceeded) {
                        openCreditsModal(result.message || 'Você atingiu o limite do seu plano. Faça upgrade para salvar mais!', 'Limite do Plano Atingido! 🚀');
                    }
                }
            } catch (err) {
                console.error(err);
                showToast('Erro ao enviar para o WhatsApp.', 'error');
            } finally {
                btnWhatsApp.innerHTML = oldText;
                btnWhatsApp.disabled = false;
            }
        };
    }

    const btnSave = document.getElementById('paint-btn-save');
    if (btnSave) {
        btnSave.onclick = () => {
            savePaintingToGallery();
        };
    }

    const btnSavePub = document.getElementById('paint-btn-save-public');
    if (btnSavePub) {
        btnSavePub.onclick = () => {
            const chkPublic = document.getElementById('paint-chk-public');
            if (chkPublic) {
                chkPublic.checked = true;
                chkPublic.dispatchEvent(new Event('change'));
            }
            savePaintingToGallery();
        };
    }

    const chkPublic = document.getElementById('paint-chk-public');
    const publicCardWrapper = document.getElementById('paint-chk-public-wrapper');
    if (chkPublic && publicCardWrapper) {
        chkPublic.onchange = () => {
            if (chkPublic.checked) {
                publicCardWrapper.style.backgroundColor = '#f3e5f5';
                publicCardWrapper.style.borderColor = 'var(--color-purple)';
            } else {
                publicCardWrapper.style.backgroundColor = '#fffdf0';
                publicCardWrapper.style.borderColor = 'var(--color-dark)';
            }
        };
        publicCardWrapper.onclick = (e) => {
            if (e.target !== chkPublic) {
                chkPublic.checked = !chkPublic.checked;
                chkPublic.dispatchEvent(new Event('change'));
            }
        };
    }

    const btnClear = document.getElementById('paint-btn-clear');
    if (btnClear) {
        btnClear.onclick = () => {
            showCustomConfirm(
                'Limpar Pintura? 🎨',
                'Tem certeza que quer limpar a sua pintura e começar de novo? 🎨',
                () => {
                    paintBgCtx.clearRect(0, 0, 800, 600);
                    paintFgCtx.clearRect(0, 0, 800, 600);
                    
                    if (window.currentPaintingData && window.currentPaintingData.imgUrl === 'blank') {
                        paintBgCtx.fillStyle = '#ffffff';
                        paintBgCtx.fillRect(0, 0, 800, 600);
                    } else if (paintDrawingImage) {
                        const aspect = paintDrawingImage.width / paintDrawingImage.height;
                        let w = paintCanvas.width;
                        let h = paintCanvas.height;
                        let x = 0;
                        let y = 0;

                        if (aspect > 4/3) {
                            h = paintCanvas.width / aspect;
                            y = (paintCanvas.height - h) / 2;
                        } else {
                            w = paintCanvas.height * aspect;
                            x = (paintCanvas.width - w) / 2;
                        }

                        paintBgCtx.fillStyle = '#ffffff';
                        paintBgCtx.fillRect(0, 0, 800, 600);
                        paintBgCtx.drawImage(paintDrawingImage, x, y, w, h);
                        
                        cleanPaintCanvasOutlineDirect(paintBgCtx);
                    } else {
                        paintBgCtx.fillStyle = '#ffffff';
                        paintBgCtx.fillRect(0, 0, 800, 600);
                    }

                    window.activeStickers = [];
                    window.selectedSticker = null;
                    window.paintActions = [];
                    window.strokeCount = 0;
                    window.paintStartTime = null;
                    window.colorsUsedInPainting = new Set();
                    if (paintCrayons && paintCrayons.length > 0) {
                        window.colorsUsedInPainting.add(paintCrayons[0].hex);
                    }

                    // Track action
                    window.paintActions.push({ type: 'clear', time: Date.now() });

                    composePaintCanvas();
                    savePaintHistory();
                    showToast('Tela limpa com sucesso! 🖍️', 'success');
                }
            );
        };
    }

    const btnWatchReplay = document.getElementById('paint-btn-watch-replay');
    if (btnWatchReplay) {
        btnWatchReplay.onclick = () => {
            openReplayModal();
        };
    }

    // Start auto-save every 30 seconds
    if (window.paintAutosaveInterval) {
        clearInterval(window.paintAutosaveInterval);
    }
    window.paintAutosaveInterval = setInterval(() => {
        saveAutosaveToLocalStorage();
    }, 30000);

    // Check for auto-save recovery prompt
    checkAndRestoreAutosave();

    // Configurar barra de desafio de desenho se ativo
    const challengeBar = document.getElementById('paint-challenge-bar');
    const challengeText = document.getElementById('paint-challenge-text');
    if (window.activeDrawingChallenge) {
        if (challengeText) {
            challengeText.textContent = `Desafio ativo: desenhe um ${window.activeDrawingChallenge.subject} para desbloquear ${window.activeDrawingChallenge.name}.`;
        }
        if (challengeBar) {
            challengeBar.style.display = 'flex';
        }
    } else {
        if (challengeBar) {
            challengeBar.style.display = 'none';
        }
    }
}

// Atalhos do teclado para Desfazer/Refazer
document.addEventListener('keydown', (e) => {
    const view = document.getElementById('view-pintar-online');
    if (view && view.style.display === 'block') {
        if (e.ctrlKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            undoPaint();
        } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            redoPaint();
        }
    }
});

function composePaintCanvas(skipSelection = false) {
    pCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
    
    // Fundo branco
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
    
    // Camada de fundo (Magic brush, Bucket, Glitter)
    pCtx.drawImage(paintBgCanvas, 0, 0);
    
    // Desenho outline com Multiply
    if (paintDrawingImage) {
        const aspect = paintDrawingImage.width / paintDrawingImage.height;
        let w = paintCanvas.width;
        let h = paintCanvas.height;
        let x = 0;
        let y = 0;

        if (aspect > 4/3) {
            h = paintCanvas.width / aspect;
            y = (paintCanvas.height - h) / 2;
        } else {
            w = paintCanvas.height * aspect;
            x = (paintCanvas.width - w) / 2;
        }
        
        pCtx.save();
        pCtx.globalCompositeOperation = 'multiply';
        pCtx.drawImage(paintDrawingImage, x, y, w, h);
        pCtx.restore();
    }
    
    // Camada de primeiro plano (Normal brush, stamps)
    pCtx.drawImage(paintFgCanvas, 0, 0);
    
    // Camada de adesivos
    drawActiveStickers(pCtx, skipSelection);
}

function savePaintHistory() {
    if (paintHistoryIndex < paintHistory.length - 1) {
        paintHistory = paintHistory.slice(0, paintHistoryIndex + 1);
    }
    
    const bgData = paintBgCtx.getImageData(0, 0, 800, 600);
    const fgData = paintFgCtx.getImageData(0, 0, 800, 600);
    const stickersCopy = (window.activeStickers || []).map(st => ({ ...st }));
    
    paintHistory.push({ bg: bgData, fg: fgData, stickers: stickersCopy });
    
    if (paintHistory.length > maxHistoryStates) {
        paintHistory.shift();
    }
    paintHistoryIndex = paintHistory.length - 1;
    updateUndoRedoButtons();
}

function undoPaint() {
    if (paintHistoryIndex > 0) {
        paintHistoryIndex--;
        const state = paintHistory[paintHistoryIndex];
        paintBgCtx.putImageData(state.bg, 0, 0);
        paintFgCtx.putImageData(state.fg, 0, 0);
        window.activeStickers = (state.stickers || []).map(st => ({ ...st }));
        window.selectedSticker = null;
        composePaintCanvas();
        updateUndoRedoButtons();
    }
}

function redoPaint() {
    if (paintHistoryIndex < paintHistory.length - 1) {
        paintHistoryIndex++;
        const state = paintHistory[paintHistoryIndex];
        paintBgCtx.putImageData(state.bg, 0, 0);
        paintFgCtx.putImageData(state.fg, 0, 0);
        window.activeStickers = (state.stickers || []).map(st => ({ ...st }));
        window.selectedSticker = null;
        composePaintCanvas();
        updateUndoRedoButtons();
    }
}

function updateUndoRedoButtons() {
    const btnUndo = document.getElementById('paint-btn-undo');
    const btnRedo = document.getElementById('paint-btn-redo');
    if (btnUndo) {
        btnUndo.disabled = (paintHistoryIndex <= 0);
        btnUndo.style.opacity = (paintHistoryIndex <= 0) ? '0.5' : '1';
    }
    if (btnRedo) {
        btnRedo.disabled = (paintHistoryIndex >= paintHistory.length - 1);
        btnRedo.style.opacity = (paintHistoryIndex >= paintHistory.length - 1) ? '0.5' : '1';
    }
}

// ==============================================
// ACCELERATED PAINT REPLAY PLAYER ENGINE
// ==============================================
let replayIsPlaying = false;
let replayTimer = null;
let replayCurrentIndex = 0;
let replaySpeed = 3;
let replayBgCanvas = null;
let replayBgCtx = null;
let replayFgCanvas = null;
let replayFgCtx = null;
let replayCanvas = null;
let replayCtx = null;
let replayActiveStickers = [];

let replayMagicBrushMaskCanvas = null;
let replayMagicBrushMaskCtx = null;
let replayMagicBrushTempCanvas = null;
let replayMagicBrushTempCtx = null;

function initReplayCanvases() {
    replayCanvas = document.getElementById('paint-replay-canvas');
    if (!replayCanvas) return;
    replayCtx = replayCanvas.getContext('2d');
    
    if (!replayBgCanvas) {
        replayBgCanvas = document.createElement('canvas');
        replayBgCanvas.width = 800;
        replayBgCanvas.height = 600;
        replayBgCtx = replayBgCanvas.getContext('2d');
    }
    if (!replayFgCanvas) {
        replayFgCanvas = document.createElement('canvas');
        replayFgCanvas.width = 800;
        replayFgCanvas.height = 600;
        replayFgCtx = replayFgCanvas.getContext('2d');
    }
}

function composeReplayCanvas() {
    if (!replayCtx) return;
    replayCtx.clearRect(0, 0, 800, 600);
    
    // White background
    replayCtx.fillStyle = '#ffffff';
    replayCtx.fillRect(0, 0, 800, 600);
    
    // Background layer
    replayCtx.drawImage(replayBgCanvas, 0, 0);
    
    // Multiply drawing outline
    if (paintDrawingImage) {
        const aspect = paintDrawingImage.width / paintDrawingImage.height;
        let w = 800;
        let h = 600;
        let x = 0;
        let y = 0;

        if (aspect > 4/3) {
            h = 800 / aspect;
            y = (600 - h) / 2;
        } else {
            w = 600 * aspect;
            x = (800 - w) / 2;
        }
        
        replayCtx.save();
        replayCtx.globalCompositeOperation = 'multiply';
        replayCtx.drawImage(paintDrawingImage, x, y, w, h);
        replayCtx.restore();
    }
    
    // Foreground layer
    replayCtx.drawImage(replayFgCanvas, 0, 0);
    
    // Stickers layer (hide selection box during playback)
    if (replayActiveStickers && replayActiveStickers.length > 0) {
        replayActiveStickers.forEach(st => {
            drawSingleSticker(replayCtx, st, false);
        });
    }
}

function openReplayModal() {
    initReplayCanvases();
    const modal = document.getElementById('paint-replay-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    
    // Clear and draw white background
    replayBgCtx.fillStyle = '#ffffff';
    replayBgCtx.fillRect(0, 0, 800, 600);
    replayFgCtx.clearRect(0, 0, 800, 600);
    replayActiveStickers = [];
    
    if (paintDrawingImage) {
        const aspect = paintDrawingImage.width / paintDrawingImage.height;
        let w = 800;
        let h = 600;
        let x = 0;
        let y = 0;

        if (aspect > 4/3) {
            h = 800 / aspect;
            y = (600 - h) / 2;
        } else {
            w = 600 * aspect;
            x = (800 - w) / 2;
        }
        replayBgCtx.drawImage(paintDrawingImage, x, y, w, h);
        cleanPaintCanvasOutlineDirect(replayBgCtx);
    }
    
    composeReplayCanvas();
    
    replayCurrentIndex = 0;
    replayIsPlaying = false;
    updateReplayPlayButtonState();
    updateReplayProgressBar();
    
    const speedSelect = document.getElementById('paint-replay-speed');
    if (speedSelect) {
        replaySpeed = parseInt(speedSelect.value) || 3;
    }
    
    const playBtn = document.getElementById('paint-replay-play-btn');
    if (playBtn) {
        playBtn.onclick = () => {
            if (replayIsPlaying) {
                pauseReplay();
            } else {
                playReplay();
            }
        };
    }
    
    const closeBtn = document.getElementById('paint-btn-close-replay');
    if (closeBtn) {
        closeBtn.onclick = () => {
            pauseReplay();
            modal.style.display = 'none';
        };
    }
    
    if (speedSelect) {
        speedSelect.onchange = () => {
            replaySpeed = parseInt(speedSelect.value) || 3;
            if (replayIsPlaying) {
                pauseReplay();
                playReplay();
            }
        };
    }

    const shareBtn = document.getElementById('paint-replay-share-btn');
    if (shareBtn) {
        shareBtn.onclick = () => {
            shareReplayVideo();
        };
    }
}
window.openReplayModal = openReplayModal;

function playReplay() {
    if (!window.paintActions || window.paintActions.length === 0) {
        showToast('Nenhum traço para reproduzir! Comece a pintar para ver o replay.', 'info');
        return;
    }
    
    if (replayCurrentIndex >= window.paintActions.length) {
        replayBgCtx.fillStyle = '#ffffff';
        replayBgCtx.fillRect(0, 0, 800, 600);
        replayFgCtx.clearRect(0, 0, 800, 600);
        replayActiveStickers = [];
        
        if (paintDrawingImage) {
            const aspect = paintDrawingImage.width / paintDrawingImage.height;
            let w = 800;
            let h = 600;
            let x = 0;
            let y = 0;

            if (aspect > 4/3) {
                h = 800 / aspect;
                y = (600 - h) / 2;
            } else {
                w = 600 * aspect;
                x = (800 - w) / 2;
            }
            replayBgCtx.drawImage(paintDrawingImage, x, y, w, h);
            cleanPaintCanvasOutlineDirect(replayBgCtx);
        }
        
        replayCurrentIndex = 0;
        updateReplayProgressBar();
    }
    
    replayIsPlaying = true;
    updateReplayPlayButtonState();
    
    const tick = () => {
        if (!replayIsPlaying) return;
        
        let actionsExecuted = 0;
        while (actionsExecuted < replaySpeed && replayCurrentIndex < window.paintActions.length) {
            executeReplayAction(window.paintActions[replayCurrentIndex]);
            replayCurrentIndex++;
            actionsExecuted++;
        }
        
        composeReplayCanvas();
        updateReplayProgressBar();
        
        if (replayCurrentIndex >= window.paintActions.length) {
            pauseReplay();
            showToast('Replay concluído! 🎉', 'success');
        } else {
            replayTimer = setTimeout(tick, 30);
        }
    };
    
    replayTimer = setTimeout(tick, 30);
}

function pauseReplay() {
    replayIsPlaying = false;
    if (replayTimer) {
        clearTimeout(replayTimer);
        replayTimer = null;
    }
    updateReplayPlayButtonState();
}

function updateReplayPlayButtonState() {
    const playBtn = document.getElementById('paint-replay-play-btn');
    if (!playBtn) return;
    if (replayIsPlaying) {
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
        playBtn.style.backgroundColor = 'var(--color-orange)';
    } else {
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
        playBtn.style.backgroundColor = 'var(--color-purple)';
    }
}

function updateReplayProgressBar() {
    const fill = document.getElementById('paint-replay-progress-fill');
    if (!fill) return;
    const total = window.paintActions ? window.paintActions.length : 0;
    if (total === 0) {
        fill.style.width = '0%';
    } else {
        const pct = (replayCurrentIndex / total) * 100;
        fill.style.width = `${pct}%`;
    }
}

function executeReplayAction(act) {
    if (act.type === 'clear') {
        replayBgCtx.fillStyle = '#ffffff';
        replayBgCtx.fillRect(0, 0, 800, 600);
        replayFgCtx.clearRect(0, 0, 800, 600);
        replayActiveStickers = [];
        
        if (paintDrawingImage) {
            const aspect = paintDrawingImage.width / paintDrawingImage.height;
            let w = 800;
            let h = 600;
            let x = 0;
            let y = 0;

            if (aspect > 4/3) {
                h = 800 / aspect;
                y = (600 - h) / 2;
            } else {
                w = 600 * aspect;
                x = (800 - w) / 2;
            }
            replayBgCtx.drawImage(paintDrawingImage, x, y, w, h);
            cleanPaintCanvasOutlineDirect(replayBgCtx);
        }
        return;
    }
    
    if (act.type === 'magic-mask-init') {
        replayMagicBrushMaskCanvas = document.createElement('canvas');
        replayMagicBrushMaskCanvas.width = 800;
        replayMagicBrushMaskCanvas.height = 600;
        replayMagicBrushMaskCtx = replayMagicBrushMaskCanvas.getContext('2d');
        
        const imgData = replayCtx.getImageData(0, 0, 800, 600);
        const data = imgData.data;
        const width = 800;
        const height = 600;
        
        const startIdx = (act.y * width + act.x) * 4;
        const startR = data[startIdx];
        const startG = data[startIdx+1];
        const startB = data[startIdx+2];
        const startA = data[startIdx+3];
        
        function isOutline(r, g, b, a) {
            return (r < 130 && g < 130 && b < 130 && a > 100);
        }
        
        if (isOutline(startR, startG, startB, startA)) {
            return;
        }
        
        const maskImgData = replayMagicBrushMaskCtx.createImageData(width, height);
        const maskData = maskImgData.data;
        
        const stack = [[act.x, act.y]];
        const visited = new Uint8Array(width * height);
        visited[act.y * width + act.x] = 1;
        
        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            const idx = (cy * width + cx) * 4;
            
            maskData[idx] = 255;
            maskData[idx+1] = 255;
            maskData[idx+2] = 255;
            maskData[idx+3] = 255;
            
            const neighbors = [
                [cx + 1, cy],
                [cx - 1, cy],
                [cx, cy + 1],
                [cx, cy - 1]
            ];
            
            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nIdx = ny * width + nx;
                    if (!visited[nIdx]) {
                        visited[nIdx] = 1;
                        const pIdx = nIdx * 4;
                        if (!isOutline(data[pIdx], data[pIdx+1], data[pIdx+2], data[pIdx+3])) {
                            stack.push([nx, ny]);
                        }
                    }
                }
            }
        }
        replayMagicBrushMaskCtx.putImageData(maskImgData, 0, 0);
        return;
    }
    
    if (act.type === 'draw') {
        const brushSizeVal = act.size;
        const color = act.color;
        
        if (act.tool === 'brush-magic') {
            if (!replayMagicBrushTempCanvas) {
                replayMagicBrushTempCanvas = document.createElement('canvas');
                replayMagicBrushTempCanvas.width = 800;
                replayMagicBrushTempCanvas.height = 600;
                replayMagicBrushTempCtx = replayMagicBrushTempCanvas.getContext('2d');
            }
            replayMagicBrushTempCtx.clearRect(0, 0, 800, 600);
            
            replayMagicBrushTempCtx.save();
            replayMagicBrushTempCtx.beginPath();
            replayMagicBrushTempCtx.moveTo(act.x1, act.y1);
            replayMagicBrushTempCtx.lineTo(act.x2, act.y2);
            replayMagicBrushTempCtx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            replayMagicBrushTempCtx.lineWidth = brushSizeVal;
            replayMagicBrushTempCtx.lineCap = 'round';
            replayMagicBrushTempCtx.lineJoin = 'round';
            replayMagicBrushTempCtx.stroke();
            replayMagicBrushTempCtx.restore();
            
            if (replayMagicBrushMaskCanvas) {
                replayMagicBrushTempCtx.save();
                replayMagicBrushTempCtx.globalCompositeOperation = 'destination-in';
                replayMagicBrushTempCtx.drawImage(replayMagicBrushMaskCanvas, 0, 0);
                replayMagicBrushTempCtx.restore();
            }
            
            replayBgCtx.save();
            replayBgCtx.drawImage(replayMagicBrushTempCanvas, 0, 0);
            replayBgCtx.restore();
        } else if (act.tool === 'brush') {
            replayFgCtx.save();
            replayFgCtx.beginPath();
            replayFgCtx.moveTo(act.x1, act.y1);
            replayFgCtx.lineTo(act.x2, act.y2);
            replayFgCtx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            replayFgCtx.lineWidth = brushSizeVal;
            replayFgCtx.lineCap = 'round';
            replayFgCtx.lineJoin = 'round';
            replayFgCtx.stroke();
            replayFgCtx.restore();
        } else if (act.tool === 'glitter') {
            replayBgCtx.save();
            replayBgCtx.strokeStyle = createGlitterPattern(color);
            replayBgCtx.lineWidth = brushSizeVal;
            replayBgCtx.lineCap = 'round';
            replayBgCtx.lineJoin = 'round';
            replayBgCtx.beginPath();
            replayBgCtx.moveTo(act.x1, act.y1);
            replayBgCtx.lineTo(act.x2, act.y2);
            replayBgCtx.stroke();
            replayBgCtx.restore();
        } else if (act.tool === 'neon') {
            // Neon Glow Pass
            replayFgCtx.save();
            replayFgCtx.strokeStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            replayFgCtx.lineWidth = brushSizeVal * 1.5;
            replayFgCtx.lineCap = 'round';
            replayFgCtx.lineJoin = 'round';
            replayFgCtx.shadowColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            replayFgCtx.shadowBlur = brushSizeVal * 1.2;
            replayFgCtx.beginPath();
            replayFgCtx.moveTo(act.x1, act.y1);
            replayFgCtx.lineTo(act.x2, act.y2);
            replayFgCtx.stroke();
            replayFgCtx.restore();
            
            // Neon Inner Core Pass
            replayFgCtx.save();
            replayFgCtx.strokeStyle = '#ffffff';
            replayFgCtx.lineWidth = brushSizeVal * 0.4;
            replayFgCtx.lineCap = 'round';
            replayFgCtx.lineJoin = 'round';
            replayFgCtx.beginPath();
            replayFgCtx.moveTo(act.x1, act.y1);
            replayFgCtx.lineTo(act.x2, act.y2);
            replayFgCtx.stroke();
            replayFgCtx.restore();
        } else if (act.tool === 'eraser') {
            [replayBgCtx, replayFgCtx].forEach(ctx => {
                ctx.save();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.moveTo(act.x1, act.y1);
                ctx.lineTo(act.x2, act.y2);
                ctx.lineWidth = brushSizeVal;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
                ctx.restore();
            });
        }
        return;
    }
    
    if (act.type === 'flood-fill') {
        const imgData = replayCtx.getImageData(0, 0, 800, 600);
        const data = imgData.data;
        const width = 800;
        const height = 600;
        
        const startIdx = (act.startY * width + act.startX) * 4;
        const startR = data[startIdx];
        const startG = data[startIdx+1];
        const startB = data[startIdx+2];
        const startA = data[startIdx+3];
        
        const fillR = act.color[0];
        const fillG = act.color[1];
        const fillB = act.color[2];
        const fillA = 255;
        
        const bgImgData = replayBgCtx.getImageData(0, 0, width, height);
        const bgData = bgImgData.data;
        
        function isOutline(r, g, b, a) {
            return (r < 130 && g < 130 && b < 130 && a > 100);
        }
        
        if (isOutline(startR, startG, startB, startA)) {
            return;
        }
        
        const stack = [[act.startX, act.startY]];
        const visited = new Uint8Array(width * height);
        visited[act.startY * width + act.startX] = 1;
        
        const fillMaskCanvas = act.isGlitter ? document.createElement('canvas') : null;
        const fCtx = act.isGlitter ? fillMaskCanvas.getContext('2d') : null;
        let maskData = null;
        
        if (act.isGlitter) {
            fillMaskCanvas.width = width;
            fillMaskCanvas.height = height;
            maskData = fCtx.createImageData(width, height);
        }
        
        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            const idx = (cy * width + cx) * 4;
            
            if (act.isGlitter) {
                const mIdx = (cy * width + cx) * 4;
                maskData.data[mIdx] = 255;
                maskData.data[mIdx+1] = 255;
                maskData.data[mIdx+2] = 255;
                maskData.data[mIdx+3] = 255;
            } else {
                bgData[idx] = fillR;
                bgData[idx+1] = fillG;
                bgData[idx+2] = fillB;
                bgData[idx+3] = fillA;
            }
            
            const neighbors = [
                [cx + 1, cy],
                [cx - 1, cy],
                [cx, cy + 1],
                [cx, cy - 1]
            ];
            
            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nIdx = ny * width + nx;
                    if (!visited[nIdx]) {
                        visited[nIdx] = 1;
                        const pIdx = nIdx * 4;
                        if (!isOutline(data[pIdx], data[pIdx+1], data[pIdx+2], data[pIdx+3])) {
                            stack.push([nx, ny]);
                        }
                    }
                }
            }
        }
        
        if (act.isGlitter) {
            fCtx.putImageData(maskData, 0, 0);
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tCtx = tempCanvas.getContext('2d');
            
            tCtx.fillStyle = createGlitterPattern(act.color);
            tCtx.fillRect(0, 0, width, height);
            
            tCtx.globalCompositeOperation = 'destination-in';
            tCtx.drawImage(fillMaskCanvas, 0, 0);
            
            replayBgCtx.save();
            replayBgCtx.drawImage(tempCanvas, 0, 0);
            replayBgCtx.restore();
        } else {
            replayBgCtx.putImageData(bgImgData, 0, 0);
        }
        return;
    }
    
    if (act.type === 'sticker-add') {
        const newSt = {
            id: act.id,
            stamp: act.stamp,
            x: act.x,
            y: act.y,
            size: act.size,
            rotation: act.rotation
        };
        replayActiveStickers.push(newSt);
        return;
    }
    
    if (act.type === 'sticker-delete') {
        replayActiveStickers = replayActiveStickers.filter(s => s.id !== act.id);
        return;
    }
    
    if (act.type === 'sticker-update') {
        const st = replayActiveStickers.find(s => s.id === act.id);
        if (st) {
            st.x = act.x;
            st.y = act.y;
            st.size = act.size;
            st.rotation = act.rotation;
        }
        return;
    }
}

function shareReplayVideo() {
    showToast('Processando replay para compartilhamento... 🎬', 'info');
    setTimeout(() => {
        showToast('Link do Replay copiado para a área de transferência! Compartilhe com os amigos! 🚀', 'success');
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.origin + '/replay/' + (currentUser ? currentUser.username : 'artista'));
        }
    }, 1500);
}

function cleanPaintCanvasOutlineDirect(ctx) {
    const imgData = ctx.getImageData(0, 0, 800, 600);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        if (r > 210 && g > 210 && b > 210) {
            data[i] = 255;
            data[i+1] = 255;
            data[i+2] = 255;
            data[i+3] = 255;
        } else if (r < 90 && g < 90 && b < 90 && a > 150) {
            data[i] = 0;
            data[i+1] = 0;
            data[i+2] = 0;
            data[i+3] = 255;
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

// Cursor Customizado e Magic Brush Mask Variables
let magicBrushMaskCanvas = null;
let magicBrushMaskCtx = null;
let magicBrushTempCanvas = null;
let magicBrushTempCtx = null;

function updatePaintCursor(tool, stamp) {
    if (!paintCanvas) return;
    if (tool === 'bucket') {
        paintCanvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 576 512\' width=\'24\' height=\'24\' fill=\'black\'><path d=\'M41.4 9.4C53.9-3.1 74.1-3.1 86.6 9.4L168 90.7l53.1-53.1c28.1-28.1 73.7-28.1 101.8 0L474.3 189.1c28.1 28.1 28.1 73.7 0 101.8L283.9 481.4c-37.5 37.5-98.3 37.5-135.8 0L30.6 363.9c-37.5-37.5-37.5-98.3 0-135.8L122.7 136 41.4 54.6c-12.5-12.5-12.5-32.8 0-45.3zm176 221.3L168 181.3 75.9 273.4c-4.2 4.2-7 9.3-8.4 14.6H386.7l42.3-42.3c3.1-3.1 3.1-8.2 0-11.3L277.7 82.9c-3.1-3.1-8.2-3.1-11.3 0L213.3 136l49.4 49.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0zM512 512c-35.3 0-64-28.7-64-64c0-25.2 32.6-79.6 51.2-108.7c6-9.4 19.5-9.4 25.5 0C543.4 368.4 576 422.8 576 448c0 35.3-28.7 64-64 64z\'/></svg>") 0 24, auto';
    } else if (tool === 'glitter') {
        paintCanvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' style=\'font-size:22px\'><text y=\'22\'>✨</text></svg>") 11 11, auto';
    } else if (tool === 'neon') {
        paintCanvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' style=\'font-size:22px\'><text y=\'22\'>💡</text></svg>") 11 11, auto';
    } else if (tool === 'pipette') {
        paintCanvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' style=\'font-size:22px\'><text y=\'22\'>💧</text></svg>") 11 11, auto';
    } else if (tool === 'select') {
        paintCanvas.style.cursor = 'default';
    } else if (tool === 'brush-magic') {
        // Usa o pincel comum 🖌️ que é universalmente suportado, para evitar a caixinha quadrada
        paintCanvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' style=\'font-size:22px\'><text y=\'22\'>🖌️</text></svg>") 4 22, auto';
    } else if (tool === 'brush') {
        paintCanvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' style=\'font-size:22px\'><text y=\'22\'>🖌️</text></svg>") 4 22, auto';
    } else if (tool === 'eraser') {
        paintCanvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' style=\'font-size:22px\'><text y=\'22\'>🧽</text></svg>") 11 11, auto';
    } else if (tool === 'text') {
        const textInput = document.getElementById('paint-text-value');
        const rawText = textInput ? textInput.value.trim() : '';
        const text = rawText || 'KidCanvas';
        const fontSelect = document.getElementById('paint-text-font');
        const font = fontSelect ? fontSelect.value : 'Fredoka';
        
        // Criar SVG do cursor dinamicamente para mostrar o texto que vai ser colado e tirar a dúvida do clique
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="30" style="font-family:${font}, sans-serif;font-size:13px;font-weight:bold;"><text x="2" y="18" fill="%239c27b0" stroke="white" stroke-width="3" paint-order="stroke">✍️ ${text}</text></svg>`;
        paintCanvas.style.cursor = `url("data:image/svg+xml;utf8,${encodeURIComponent(svgString)}") 0 15, auto`;
    } else if (tool === 'stamp') {
        const activeStamp = stamp || window.selectedPaintStamp || '⭐';
        if (activeStamp.startsWith('http') || activeStamp.startsWith('/') || activeStamp.startsWith('./')) {
            paintCanvas.style.cursor = `url("${activeStamp}") 16 16, auto`;
        } else {
            paintCanvas.style.cursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' style='font-size:22px'><text y='22'>${activeStamp}</text></svg>") 11 11, auto`;
        }
    } else {
        paintCanvas.style.cursor = 'default';
    }
}

function initMagicBrushMask(startX, startY) {
    const width = paintCanvas.width;
    const height = paintCanvas.height;
    
    if (!magicBrushMaskCanvas) {
        magicBrushMaskCanvas = document.createElement('canvas');
    }
    magicBrushMaskCanvas.width = width;
    magicBrushMaskCanvas.height = height;
    magicBrushMaskCtx = magicBrushMaskCanvas.getContext('2d');
    
    // Limpar máscara
    magicBrushMaskCtx.clearRect(0, 0, width, height);
    
    if (!paintDrawingImage) {
        // Modo mão livre: sem restrição (máscara total)
        magicBrushMaskCtx.fillStyle = '#ffffff';
        magicBrushMaskCtx.fillRect(0, 0, width, height);
        return;
    }
    
    // Desenhar contornos limpos em um canvas auxiliar
    const outlineCanvas = document.createElement('canvas');
    outlineCanvas.width = width;
    outlineCanvas.height = height;
    const oCtx = outlineCanvas.getContext('2d');
    oCtx.fillStyle = '#ffffff';
    oCtx.fillRect(0, 0, width, height);
    
    const aspect = paintDrawingImage.width / paintDrawingImage.height;
    let w = width;
    let h = height;
    let x = 0;
    let y = 0;
    if (aspect > 4/3) {
        h = width / aspect;
        y = (height - h) / 2;
    } else {
        w = height * aspect;
        x = (width - w) / 2;
    }
    oCtx.drawImage(paintDrawingImage, x, y, w, h);
    
    const oImgData = oCtx.getImageData(0, 0, width, height);
    const oData = oImgData.data;
    
    function isOutlinePixel(r, g, b, a) {
        return (r < 110 && g < 110 && b < 110 && a > 100);
    }
    
    const startIdx = (startY * width + startX) * 4;
    if (isOutlinePixel(oData[startIdx], oData[startIdx+1], oData[startIdx+2], oData[startIdx+3])) {
        // Se clicar no preto, não mascara para não bloquear o desenho
        magicBrushMaskCtx.fillStyle = '#ffffff';
        magicBrushMaskCtx.fillRect(0, 0, width, height);
        return;
    }
    
    // Flood fill para achar a área fechada
    const stack = [[startX, startY]];
    const visited = new Uint8Array(width * height);
    visited[startY * width + startX] = 1;
    
    const maskImgData = magicBrushMaskCtx.createImageData(width, height);
    const maskData = maskImgData.data;
    
    while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        const idx = cy * width + cx;
        const idx4 = idx * 4;
        
        maskData[idx4] = 255;
        maskData[idx4+1] = 255;
        maskData[idx4+2] = 255;
        maskData[idx4+3] = 255;
        
        const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1]
        ];
        
        for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (!visited[nIdx]) {
                    visited[nIdx] = 1;
                    const pIdx = nIdx * 4;
                    if (!isOutlinePixel(oData[pIdx], oData[pIdx+1], oData[pIdx+2], oData[pIdx+3])) {
                        stack.push([nx, ny]);
                    }
                }
            }
        }
    }
    
    magicBrushMaskCtx.putImageData(maskImgData, 0, 0);
}

function setPaintTool(tool) {
    if (tool !== 'select') {
        window.selectedSticker = null;
    }
    activePaintTool = tool;
    document.querySelectorAll('.paint-tool-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.paint-stamp-btn').forEach(btn => btn.classList.remove('active'));

    const sliderGroup = document.getElementById('paint-slider-group');
    
    if (tool === 'bucket') {
        document.getElementById('paint-tool-bucket').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'none';
    } else if (tool === 'glitter') {
        document.getElementById('paint-tool-glitter').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'flex'; // Allow brush size for glitter brush
    } else if (tool === 'brush') {
        document.getElementById('paint-tool-brush').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'flex';
    } else if (tool === 'neon') {
        document.getElementById('paint-tool-neon').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'flex';
    } else if (tool === 'brush-magic') {
        document.getElementById('paint-tool-brush-magic').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'flex';
    } else if (tool === 'eraser') {
        document.getElementById('paint-tool-eraser').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'flex';
    } else if (tool === 'pipette') {
        document.getElementById('paint-tool-pipette').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'none';
    } else if (tool === 'text') {
        document.getElementById('paint-tool-text').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'flex';
        
        // Auto-preenche o campo de texto se estiver vazio para dar feedback visual imediato no cursor
        const textInput = document.getElementById('paint-text-value');
        if (textInput && textInput.value.trim() === '') {
            textInput.value = 'KidCanvas';
        }
    } else if (tool === 'select') {
        document.getElementById('paint-tool-select').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'none';
    }
    
    updatePaintCursor(tool);
    if (paintCanvas) {
        composePaintCanvas();
    }
}

// Configurar Toolbar de Pintura
document.getElementById('paint-tool-bucket').onclick = () => setPaintTool('bucket');
document.getElementById('paint-tool-glitter').onclick = () => setPaintTool('glitter');
document.getElementById('paint-tool-brush-magic').onclick = () => setPaintTool('brush-magic');
document.getElementById('paint-tool-brush').onclick = () => setPaintTool('brush');
document.getElementById('paint-tool-neon').onclick = () => setPaintTool('neon');
document.getElementById('paint-tool-eraser').onclick = () => setPaintTool('eraser');
document.getElementById('paint-tool-pipette').onclick = () => setPaintTool('pipette');
document.getElementById('paint-tool-text').onclick = () => setPaintTool('text');
document.getElementById('paint-tool-select').onclick = () => setPaintTool('select');

// Configurar carimbos rápidos (clique insere instantaneamente no centro)
document.querySelectorAll('.paint-stamp-btn').forEach(btn => {
    btn.onclick = () => {
        const emoji = btn.getAttribute('data-stamp');
        insertStickerInstantly(emoji);
    };
});

function getPaintMousePos(evt) {
    const rect = paintCanvas.getBoundingClientRect();
    let clientX = evt.clientX;
    let clientY = evt.clientY;
    
    // Check if it's a TouchEvent
    if (evt.touches && evt.touches.length > 0) {
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
    } else if (evt.changedTouches && evt.changedTouches.length > 0) {
        clientX = evt.changedTouches[0].clientX;
        clientY = evt.changedTouches[0].clientY;
    }
    
    return {
        x: (clientX - rect.left) * (paintCanvas.width / rect.width),
        y: (clientY - rect.top) * (paintCanvas.height / rect.height)
    };
}

function startPaintingDraw(evt) {
    if (!window.paintStartTime) {
        window.paintStartTime = Date.now();
    }
    const pos = getPaintMousePos(evt);
    const brushSizeInput = document.getElementById('paint-brush-size');
    const brushSizeVal = brushSizeInput ? parseInt(brushSizeInput.value) : 8;
    
    if (activePaintTool === 'pipette') {
        const sampledData = pCtx.getImageData(pos.x, pos.y, 1, 1).data;
        const rgb = [sampledData[0], sampledData[1], sampledData[2]];
        selectPaintingColor(rgb);
        setPaintTool('brush');
        return;
    }
    
    if (activePaintTool === 'select') {
        const handle = getStickerHandleAt(window.selectedSticker, pos.x, pos.y);
        if (handle) {
            if (handle === 'delete') {
                const oldId = window.selectedSticker.id;
                window.activeStickers = (window.activeStickers || []).filter(s => s.id !== oldId);
                
                // Track replay action
                if (!window.paintActions) window.paintActions = [];
                window.paintActions.push({
                    type: 'sticker-delete',
                    id: oldId,
                    time: Date.now()
                });
                
                window.selectedSticker = null;
                composePaintCanvas();
                savePaintHistory();
            } else if (handle === 'duplicate') {
                const old = window.selectedSticker;
                const clone = {
                    id: 'sticker_' + Date.now() + '_' + Math.round(Math.random() * 1000000),
                    stamp: old.stamp,
                    x: old.x + 30,
                    y: old.y + 30,
                    size: old.size,
                    rotation: old.rotation
                };
                window.activeStickers.push(clone);
                window.selectedSticker = clone;
                
                // Track replay action
                if (!window.paintActions) window.paintActions = [];
                window.paintActions.push({
                    type: 'sticker-add',
                    id: clone.id,
                    stamp: clone.stamp,
                    x: clone.x,
                    y: clone.y,
                    size: clone.size,
                    rotation: clone.rotation,
                    time: Date.now()
                });
                
                composePaintCanvas();
                savePaintHistory();
            } else if (handle === 'scale') {
                window.stickerDragMode = 'scale';
                window.stickerStartDist = Math.hypot(pos.x - window.selectedSticker.x, pos.y - window.selectedSticker.y);
                window.stickerStartSize = window.selectedSticker.size || 80;
                isPaintDrawing = true;
            } else if (handle === 'rotate') {
                window.stickerDragMode = 'rotate';
                window.stickerStartAngle = Math.atan2(pos.y - window.selectedSticker.y, pos.x - window.selectedSticker.x) - (window.selectedSticker.rotation || 0);
                isPaintDrawing = true;
            } else if (handle === 'body') {
                window.stickerDragMode = 'drag';
                window.stickerOffsetX = pos.x - window.selectedSticker.x;
                window.stickerOffsetY = pos.y - window.selectedSticker.y;
                isPaintDrawing = true;
            }
        } else {
            const st = getStickerAtPosition(pos.x, pos.y);
            if (st) {
                window.selectedSticker = st;
                window.stickerDragMode = 'drag';
                window.stickerOffsetX = pos.x - st.x;
                window.stickerOffsetY = pos.y - st.y;
                isPaintDrawing = true;
            } else {
                window.selectedSticker = null;
            }
            composePaintCanvas();
        }
        return;
    }
    
    if (activePaintTool === 'bucket') {
        executePaintFloodFill(Math.round(pos.x), Math.round(pos.y), false);
    } else if (activePaintTool === 'glitter') {
        isPaintDrawing = true;
        paintLastX = pos.x;
        paintLastY = pos.y;
        window.glitterStartX = pos.x;
        window.glitterStartY = pos.y;
        window.glitterHasMoved = false;
    } else if (activePaintTool === 'stamp') {
        executePaintStamp(pos.x, pos.y);
    } else if (activePaintTool === 'text') {
        executePaintText(pos.x, pos.y);
    } else {
        isPaintDrawing = true;
        paintLastX = pos.x;
        paintLastY = pos.y;
        
        if (activePaintTool === 'brush-magic') {
            initMagicBrushMask(Math.round(pos.x), Math.round(pos.y));
            if (!window.paintActions) window.paintActions = [];
            window.paintActions.push({
                type: 'magic-mask-init',
                x: Math.round(pos.x),
                y: Math.round(pos.y),
                time: Date.now()
            });
        }
        
        // Record initial dot for draw replay
        if (activePaintTool === 'brush' || activePaintTool === 'neon' || activePaintTool === 'eraser' || activePaintTool === 'brush-magic') {
            if (!window.paintActions) window.paintActions = [];
            window.paintActions.push({
                type: 'draw',
                tool: activePaintTool,
                x1: pos.x,
                y1: pos.y,
                x2: pos.x,
                y2: pos.y,
                color: [...selectedPaintColor],
                size: brushSizeVal,
                time: Date.now()
            });
        }
    }
}

function executePaintingDraw(evt) {
    const pos = getPaintMousePos(evt);
    const brushSizeInput = document.getElementById('paint-brush-size');
    const brushSizeVal = brushSizeInput ? parseInt(brushSizeInput.value) : 8;

    if (activePaintTool === 'select' && window.selectedSticker && window.stickerDragMode) {
        if (window.stickerDragMode === 'drag') {
            window.selectedSticker.x = pos.x - window.stickerOffsetX;
            window.selectedSticker.y = pos.y - window.stickerOffsetY;
        } else if (window.stickerDragMode === 'scale') {
            const currentDist = Math.hypot(pos.x - window.selectedSticker.x, pos.y - window.selectedSticker.y);
            const scale = currentDist / window.stickerStartDist;
            window.selectedSticker.size = Math.max(20, Math.min(600, window.stickerStartSize * scale));
        } else if (window.stickerDragMode === 'rotate') {
            const currentAngle = Math.atan2(pos.y - window.selectedSticker.y, pos.x - window.selectedSticker.x);
            window.selectedSticker.rotation = currentAngle - window.stickerStartAngle;
        }
        composePaintCanvas();
        return;
    }

    if (!isPaintDrawing) return;

    if (activePaintTool === 'glitter') {
        const dist = Math.hypot(pos.x - window.glitterStartX, pos.y - window.glitterStartY);
        if (dist > 3) {
            window.glitterHasMoved = true;
        }
        
        if (window.glitterHasMoved) {
            paintBgCtx.save();
            paintBgCtx.strokeStyle = createGlitterPattern(selectedPaintColor);
            paintBgCtx.lineWidth = brushSizeVal;
            paintBgCtx.lineCap = 'round';
            paintBgCtx.lineJoin = 'round';
            paintBgCtx.beginPath();
            paintBgCtx.moveTo(paintLastX, paintLastY);
            paintBgCtx.lineTo(pos.x, pos.y);
            paintBgCtx.stroke();
            paintBgCtx.restore();
            
            // Record to replay actions
            if (!window.paintActions) window.paintActions = [];
            window.paintActions.push({
                type: 'draw',
                tool: 'glitter',
                x1: paintLastX,
                y1: paintLastY,
                x2: pos.x,
                y2: pos.y,
                color: [...selectedPaintColor],
                size: brushSizeVal,
                time: Date.now()
            });
            
            paintLastX = pos.x;
            paintLastY = pos.y;
            composePaintCanvas();
        }
        return;
    }

    // Normal drawing recording segment
    if (activePaintTool === 'brush' || activePaintTool === 'neon' || activePaintTool === 'eraser' || activePaintTool === 'brush-magic') {
        if (!window.paintActions) window.paintActions = [];
        window.paintActions.push({
            type: 'draw',
            tool: activePaintTool,
            x1: paintLastX,
            y1: paintLastY,
            x2: pos.x,
            y2: pos.y,
            color: [...selectedPaintColor],
            size: brushSizeVal,
            time: Date.now()
        });
    }

    if (activePaintTool === 'brush-magic') {
        if (!magicBrushTempCanvas) {
            magicBrushTempCanvas = document.createElement('canvas');
        }
        magicBrushTempCanvas.width = paintCanvas.width;
        magicBrushTempCanvas.height = paintCanvas.height;
        magicBrushTempCtx = magicBrushTempCanvas.getContext('2d');
        
        magicBrushTempCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
        
        magicBrushTempCtx.save();
        magicBrushTempCtx.beginPath();
        magicBrushTempCtx.moveTo(paintLastX, paintLastY);
        magicBrushTempCtx.lineTo(pos.x, pos.y);
        magicBrushTempCtx.strokeStyle = `rgb(${selectedPaintColor[0]}, ${selectedPaintColor[1]}, ${selectedPaintColor[2]})`;
        magicBrushTempCtx.lineWidth = brushSizeVal;
        magicBrushTempCtx.lineCap = 'round';
        magicBrushTempCtx.lineJoin = 'round';
        magicBrushTempCtx.stroke();
        magicBrushTempCtx.restore();
        
        if (magicBrushMaskCanvas) {
            magicBrushTempCtx.save();
            magicBrushTempCtx.globalCompositeOperation = 'destination-in';
            magicBrushTempCtx.drawImage(magicBrushMaskCanvas, 0, 0);
            magicBrushTempCtx.restore();
        }
        
        paintBgCtx.save();
        paintBgCtx.drawImage(magicBrushTempCanvas, 0, 0);
        paintBgCtx.restore();
    } else if (activePaintTool === 'brush') {
        paintFgCtx.save();
        paintFgCtx.beginPath();
        paintFgCtx.moveTo(paintLastX, paintLastY);
        paintFgCtx.lineTo(pos.x, pos.y);
        paintFgCtx.strokeStyle = `rgb(${selectedPaintColor[0]}, ${selectedPaintColor[1]}, ${selectedPaintColor[2]})`;
        paintFgCtx.lineWidth = brushSizeVal;
        paintFgCtx.lineCap = 'round';
        paintFgCtx.lineJoin = 'round';
        paintFgCtx.stroke();
        paintFgCtx.restore();
    } else if (activePaintTool === 'neon') {
        // Neon Glow Pass
        paintFgCtx.save();
        paintFgCtx.strokeStyle = `rgb(${selectedPaintColor[0]}, ${selectedPaintColor[1]}, ${selectedPaintColor[2]})`;
        paintFgCtx.lineWidth = brushSizeVal * 1.5;
        paintFgCtx.lineCap = 'round';
        paintFgCtx.lineJoin = 'round';
        paintFgCtx.shadowColor = `rgb(${selectedPaintColor[0]}, ${selectedPaintColor[1]}, ${selectedPaintColor[2]})`;
        paintFgCtx.shadowBlur = brushSizeVal * 1.2;
        paintFgCtx.beginPath();
        paintFgCtx.moveTo(paintLastX, paintLastY);
        paintFgCtx.lineTo(pos.x, pos.y);
        paintFgCtx.stroke();
        paintFgCtx.restore();
        
        // Neon Inner Core Pass
        paintFgCtx.save();
        paintFgCtx.strokeStyle = '#ffffff';
        paintFgCtx.lineWidth = brushSizeVal * 0.4;
        paintFgCtx.lineCap = 'round';
        paintFgCtx.lineJoin = 'round';
        paintFgCtx.beginPath();
        paintFgCtx.moveTo(paintLastX, paintLastY);
        paintFgCtx.lineTo(pos.x, pos.y);
        paintFgCtx.stroke();
        paintFgCtx.restore();
    } else if (activePaintTool === 'eraser') {
        [paintBgCtx, paintFgCtx].forEach(ctx => {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.moveTo(paintLastX, paintLastY);
            ctx.lineTo(pos.x, pos.y);
            ctx.lineWidth = brushSizeVal;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            ctx.restore();
        });
    }

    paintLastX = pos.x;
    paintLastY = pos.y;
    
    composePaintCanvas();
}

function stopPaintingDraw() {
    if (activePaintTool === 'select' && window.selectedSticker && window.stickerDragMode) {
        // Record final transform to replay action log
        if (!window.paintActions) window.paintActions = [];
        window.paintActions.push({
            type: 'sticker-update',
            id: window.selectedSticker.id,
            x: window.selectedSticker.x,
            y: window.selectedSticker.y,
            size: window.selectedSticker.size,
            rotation: window.selectedSticker.rotation,
            time: Date.now()
        });
        window.stickerDragMode = null;
        savePaintHistory();
        composePaintCanvas();
        return;
    }

    if (isPaintDrawing) {
        isPaintDrawing = false;
        
        if (activePaintTool === 'glitter') {
            if (!window.glitterHasMoved) {
                // Tap: perform glitter flood fill
                executePaintFloodFill(Math.round(window.glitterStartX), Math.round(window.glitterStartY), true);
            } else {
                window.strokeCount = (window.strokeCount || 0) + 1;
                savePaintHistory();
            }
        } else {
            window.strokeCount = (window.strokeCount || 0) + 1;
            savePaintHistory();
        }
        
        // Resetar máscaras do pincel mágico
        magicBrushMaskCanvas = null;
        magicBrushMaskCtx = null;
    }
}

function executePaintStamp(x, y) {
    const stamp = window.selectedPaintStamp || '⭐';
    const sizeInput = document.getElementById('paint-brush-size');
    const size = sizeInput ? parseInt(sizeInput.value) * 2.5 : 80;
    
    const newSticker = {
        id: 'sticker_' + Date.now() + '_' + Math.round(Math.random() * 1000000),
        stamp: stamp,
        x: x,
        y: y,
        size: size,
        rotation: 0
    };
    
    if (!window.activeStickers) window.activeStickers = [];
    window.activeStickers.push(newSticker);
    window.selectedSticker = newSticker;
    
    // Track action
    if (!window.paintActions) window.paintActions = [];
    window.paintActions.push({
        type: 'sticker-add',
        id: newSticker.id,
        stamp: stamp,
        x: x,
        y: y,
        size: size,
        rotation: 0,
        time: Date.now()
    });
    
    setPaintTool('select');
    composePaintCanvas();
    savePaintHistory();
}

function executePaintText(x, y) {
    const textInput = document.getElementById('paint-text-value');
    const text = textInput ? textInput.value.trim() : '';
    
    if (!text) {
        if (textInput) {
            textInput.focus();
            textInput.style.borderColor = 'var(--color-orange)';
            setTimeout(() => {
                textInput.style.borderColor = 'var(--color-dark)';
            }, 1000);
        }
        return;
    }

    const fontSelect = document.getElementById('paint-text-font');
    const selectedFont = fontSelect ? fontSelect.value : 'Fredoka';

    const sizeInput = document.getElementById('paint-brush-size');
    const fontSize = sizeInput ? parseInt(sizeInput.value) * 1.5 + 16 : 28;

    paintFgCtx.save();
    
    let fontStr = `bold ${fontSize}px Fredoka, sans-serif`;
    if (selectedFont === '\'Arial Black\'') {
        fontStr = `bold ${fontSize}px 'Arial Black', sans-serif`;
    } else if (selectedFont === 'Georgia') {
        fontStr = `bold ${fontSize}px Georgia, serif`;
    } else if (selectedFont === 'Comic Sans MS') {
        fontStr = `bold ${fontSize}px "Comic Sans MS", cursive, sans-serif`;
    } else if (selectedFont === 'Courier New') {
        fontStr = `bold ${fontSize}px "Courier New", Courier, monospace`;
    }
    
    paintFgCtx.font = fontStr;
    
    // Contorno branco para legibilidade premium
    paintFgCtx.strokeStyle = '#ffffff';
    paintFgCtx.lineWidth = 5;
    paintFgCtx.lineJoin = 'round';
    paintFgCtx.miterLimit = 2;
    paintFgCtx.textAlign = 'center';
    paintFgCtx.textBaseline = 'middle';
    paintFgCtx.strokeText(text, x, y);

    // Texto preenchido
    paintFgCtx.fillStyle = `rgb(${selectedPaintColor[0]}, ${selectedPaintColor[1]}, ${selectedPaintColor[2]})`;
    paintFgCtx.fillText(text, x, y);
    
    paintFgCtx.restore();

    composePaintCanvas();
    savePaintHistory();
}

function createGlitterPattern(colorRgb) {
    const patCanvas = document.createElement('canvas');
    patCanvas.width = 40;
    patCanvas.height = 40;
    const patCtx = patCanvas.getContext('2d');

    // Preencher base colorida com textura mais clara
    patCtx.fillStyle = `rgba(${colorRgb[0]}, ${colorRgb[1]}, ${colorRgb[2]}, 0.85)`;
    patCtx.fillRect(0, 0, 40, 40);

    // Adicionar glitters circulares e estrelas
    for (let i = 0; i < 24; i++) {
        const px = Math.random() * 40;
        const py = Math.random() * 40;
        const radius = Math.random() * 1.8 + 0.5;

        // Círculos de brilho coloridos
        patCtx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#ffd43b';
        patCtx.beginPath();
        patCtx.arc(px, py, radius, 0, Math.PI * 2);
        patCtx.fill();

        // Estrelinhas cruzadas para efeito mágico
        if (Math.random() > 0.7) {
            patCtx.strokeStyle = '#ffffff';
            patCtx.lineWidth = 0.5;
            patCtx.beginPath();
            patCtx.moveTo(px - 3, py);
            patCtx.lineTo(px + 3, py);
            patCtx.moveTo(px, py - 3);
            patCtx.lineTo(px, py + 3);
            patCtx.stroke();
        }
    }
    return pCtx.createPattern(patCanvas, 'repeat');
}

function executePaintFloodFill(startX, startY, isGlitter) {
    const imgData = pCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
    const data = imgData.data;
    const width = paintCanvas.width;
    const height = paintCanvas.height;

    const startIdx = (startY * width + startX) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx+1];
    const startB = data[startIdx+2];
    const startA = data[startIdx+3];

    const fillR = selectedPaintColor[0];
    const fillG = selectedPaintColor[1];
    const fillB = selectedPaintColor[2];
    const fillA = 255;

    const bgImgData = paintBgCtx.getImageData(0, 0, width, height);
    const bgData = bgImgData.data;

    function isOutline(r, g, b, a) {
        return (r < 130 && g < 130 && b < 130 && a > 100);
    }

    if (isOutline(startR, startG, startB, startA)) {
        return;
    }

    // Log action for replay
    if (!window.paintActions) window.paintActions = [];
    window.paintActions.push({
        type: 'flood-fill',
        startX: startX,
        startY: startY,
        isGlitter: isGlitter,
        color: [...selectedPaintColor],
        time: Date.now()
    });

    const stack = [[startX, startY]];
    const visited = new Uint8Array(width * height);
    visited[startY * width + startX] = 1;

    const fillMaskCanvas = isGlitter ? document.createElement('canvas') : null;
    const fCtx = isGlitter ? fillMaskCanvas.getContext('2d') : null;
    let maskData = null;
    
    if (isGlitter) {
        fillMaskCanvas.width = width;
        fillMaskCanvas.height = height;
        maskData = fCtx.createImageData(width, height);
    }

    while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        const idx = (cy * width + cx) * 4;

        if (isGlitter) {
            const mIdx = (cy * width + cx) * 4;
            maskData.data[mIdx] = 255;
            maskData.data[mIdx+1] = 255;
            maskData.data[mIdx+2] = 255;
            maskData.data[mIdx+3] = 255;
        } else {
            bgData[idx] = fillR;
            bgData[idx+1] = fillG;
            bgData[idx+2] = fillB;
            bgData[idx+3] = fillA;
        }

        const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (!visited[nIdx]) {
                    visited[nIdx] = 1;
                    const pIdx = nIdx * 4;

                    if (!isOutline(data[pIdx], data[pIdx+1], data[pIdx+2], data[pIdx+3])) {
                        stack.push([nx, ny]);
                    }
                }
            }
        }
    }

    if (isGlitter) {
        fCtx.putImageData(maskData, 0, 0);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tCtx = tempCanvas.getContext('2d');

        tCtx.fillStyle = createGlitterPattern(selectedPaintColor);
        tCtx.fillRect(0, 0, width, height);

        tCtx.globalCompositeOperation = 'destination-in';
        tCtx.drawImage(fillMaskCanvas, 0, 0);

        paintBgCtx.save();
        paintBgCtx.drawImage(tempCanvas, 0, 0);
        paintBgCtx.restore();
    } else {
        paintBgCtx.putImageData(bgImgData, 0, 0);
    }

    composePaintCanvas();
    savePaintHistory();
}

function renderStarsBadgeHtml(stars) {
    if (stars >= 180) {
        return `<span class="badge-star badge-lenda" title="👑 Lenda do KidCanvas (180+ estrelas)"><i class="fa-solid fa-crown"></i> Lenda do KidCanvas</span>`;
    } else if (stars >= 50) {
        return `<span class="badge-star badge-destaque" style="background-color: #f3e5f5; border-color: #d1c4e9; color: #673ab7;" title="🚀 Explorador Mágico (50+ estrelas)"><i class="fa-solid fa-rocket"></i> Explorador Mágico</span>`;
    } else if (stars >= 30) {
        return `<span class="badge-star badge-mestre" style="background-color: #fff3e0; border-color: #ffe0b2; color: #e65100;" title="🦄 Mestre da Imaginação (30+ estrelas)"><i class="fa-solid fa-wand-magic-sparkles"></i> Mestre da Imaginação</span>`;
    } else if (stars >= 10) {
        return `<span class="badge-star badge-criativo" style="background-color: #e8f5e9; border-color: #c8e6c9; color: #2e7d32;" title="🌈 Colorista Criativo (10+ estrelas)"><i class="fa-solid fa-palette"></i> Colorista Criativo</span>`;
    }
    return '';
}
window.renderStarsBadgeHtml = renderStarsBadgeHtml;

function renderRankingList(paintings, elementId) {
    const listEl = document.getElementById(elementId);
    if (!listEl) return;
    
    if (paintings.length === 0) {
        listEl.innerHTML = '<div style="font-size: 0.85rem; color: var(--color-dark-light); text-align: center; padding: 10px;">Sem votos acumulados ainda.</div>';
        return;
    }

    listEl.innerHTML = '';
    paintings.forEach((p, idx) => {
        const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`));
        const itemEl = document.createElement('div');
        itemEl.className = 'ranking-item';
        itemEl.style.cursor = 'pointer';
        itemEl.onclick = () => {
            window.open(p.url, '_blank');
        };
        const creatorEscaped = escapeHTML(p.creatorName || p.userName || 'Artista');
        const emailEscaped = escapeHTML(p.userEmail || '');
        const promptEscaped = escapeHTML(p.prompt || '');

        itemEl.innerHTML = `
            <span class="ranking-position">${medal}</span>
            <img class="ranking-thumb" src="${p.url}" alt="${promptEscaped}">
            <div class="ranking-info">
                <h4 class="ranking-title">${promptEscaped}</h4>
                <p class="ranking-creator">Por: <strong style="color: var(--color-purple); text-decoration: underline;" onclick="event.stopPropagation(); openPublicProfile('${creatorEscaped.replace(/'/g, "\\'")}', '${emailEscaped.replace(/'/g, "\\'")}')">${creatorEscaped}</strong></p>
            </div>
            <span class="ranking-stars">⭐ ${p.stars || 0}</span>
        `;
        listEl.appendChild(itemEl);
    });
}
window.renderRankingList = renderRankingList;

async function loadTopExplorers() {
    const listEl = document.getElementById('ranking-explorers-list');
    if (!listEl) return;
    
    listEl.innerHTML = '<div style="text-align: center; font-size: 0.8rem; color: #777; padding: 10px;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando ranking...</div>';
    
    try {
        const res = await fetch('/api/paintings/top-explorers');
        const data = await res.json();
        
        if (data.success && data.explorers) {
            listEl.innerHTML = '';
            const explorers = data.explorers;
            
            if (explorers.length === 0) {
                listEl.innerHTML = '<div style="text-align: center; font-size: 0.8rem; color: #999; padding: 10px;">Nenhum explorador ranqueado ainda.</div>';
                return;
            }
            
            explorers.forEach((user, idx) => {
                const itemEl = document.createElement('div');
                itemEl.style.display = 'flex';
                itemEl.style.alignItems = 'center';
                itemEl.style.gap = '8px';
                itemEl.style.padding = '4px 0';
                
                let medal = '';
                if (idx === 0) medal = '🥇 ';
                else if (idx === 1) medal = '🥈 ';
                else if (idx === 2) medal = '🥉 ';
                else medal = `<span style="font-weight: 800; font-size: 0.85rem; color: var(--color-dark-light); width: 18px; display: inline-block;">${idx + 1}.</span> `;
                
                const avatarHtml = window.getAvatarHtml(user.avatar, '18px');
                
                const nameEscaped = escapeHTML(user.name);
                const emailEscaped = escapeHTML(user.email);

                itemEl.innerHTML = `
                    ${medal}
                    ${avatarHtml}
                    <span style="font-weight: 700; font-size: 0.85rem; color: var(--color-purple); text-decoration: underline; cursor: pointer;" onclick="openPublicProfile('${nameEscaped.replace(/'/g, "\\'")}', '${emailEscaped.replace(/'/g, "\\'")}')">${nameEscaped}</span>
                    <span style="margin-left: auto; font-size: 0.85rem; font-weight: 800; color: var(--color-orange);">⭐ ${user.monthlyStars}</span>
                `;
                listEl.appendChild(itemEl);
            });
        } else {
            listEl.innerHTML = '<div style="text-align: center; font-size: 0.8rem; color: red; padding: 10px;">Erro ao carregar exploradores.</div>';
        }
    } catch (err) {
        console.error('Erro ao carregar top exploradores:', err);
        listEl.innerHTML = '<div style="text-align: center; font-size: 0.8rem; color: red; padding: 10px;">Erro de conexão.</div>';
    }
}
window.loadTopExplorers = loadTopExplorers;

async function loadPendingPaintingsAdmin() {
    const pendingGrid = document.getElementById('admin-pending-grid');
    const pendingCount = document.getElementById('admin-pending-count');
    if (!pendingGrid) return;

    try {
        const sessionToken = localStorage.getItem('kidcanvas_session_token') || (currentUser ? currentUser.token : '');
        const response = await fetch('/api/paintings/pending', {
            headers: {
                'x-session-token': sessionToken
            }
        });
        const result = await response.json();
        
        if (result.success && result.paintings && result.paintings.length > 0) {
            if (pendingCount) pendingCount.textContent = `${result.paintings.length} pendentes`;
            pendingGrid.innerHTML = '';
            
            result.paintings.forEach(dw => {
                const card = document.createElement('div');
                card.className = 'example-card';
                card.style.background = '#fff';
                card.style.border = '2px solid #ffcccc';
                card.style.borderRadius = 'var(--radius-sm)';
                card.style.padding = '10px';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.gap = '6px';
                
                const promptEscaped = escapeHTML(dw.prompt);
                const creatorEscaped = escapeHTML(dw.creatorName || dw.userName || 'Artista');
                const emailEscaped = escapeHTML(dw.userEmail || 'Desconhecido');
                const categoryEscaped = escapeHTML(dw.category || 'Colorir');
                const urlEscaped = escapeHTML(dw.url);

                card.innerHTML = `
                    <div style="aspect-ratio: 4/3; background: #fafafa; border-radius: 4px; overflow: hidden;">
                        <img src="${urlEscaped}" style="width: 100%; height: 100%; object-fit: contain; cursor: pointer;" onclick="window.open('${urlEscaped.replace(/'/g, "\\'")}', '_blank')">
                    </div>
                    <div style="font-size: 0.8rem; line-height: 1.3;">
                        <strong>Título:</strong> ${promptEscaped}<br>
                        <strong>Criador:</strong> ${creatorEscaped}<br>
                        <strong>Email:</strong> ${emailEscaped}<br>
                        <strong>Categoria:</strong> ${categoryEscaped}
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: auto;">
                        <button class="btn btn-sm btn-success" onclick="approvePublicPainting('${urlEscaped.replace(/'/g, "\\'")}')" style="flex: 1; font-size: 0.72rem; padding: 4px 2px; background-color: #2ecc71; border-color: #2ecc71; color: white; cursor: pointer; border-radius: 4px;">Aprovar ✅</button>
                        <button class="btn btn-sm btn-danger" onclick="deletePublicPainting('${urlEscaped.replace(/'/g, "\\'")}')" style="flex: 1; font-size: 0.72rem; padding: 4px 2px; background-color: #e74c3c; border-color: #e74c3c; color: white; cursor: pointer; border-radius: 4px;">Deletar ❌</button>
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 4px;">
                        <button class="btn btn-sm" onclick="warnUserAdmin('${urlEscaped.replace(/'/g, "\\'")}', '${emailEscaped.replace(/'/g, "\\'")}')" style="flex: 1; font-size: 0.72rem; padding: 4px 2px; background-color: #f39c12; border: 1px solid #f39c12; color: white; cursor: pointer; border-radius: 4px;">⚠️ Advertir</button>
                        <button class="btn btn-sm" onclick="banUserAdmin('${urlEscaped.replace(/'/g, "\\'")}', '${emailEscaped.replace(/'/g, "\\'")}')" style="flex: 1; font-size: 0.72rem; padding: 4px 2px; background-color: #c0392b; border: 1px solid #c0392b; color: white; cursor: pointer; border-radius: 4px;">🚫 Banir</button>
                    </div>
                `;
                pendingGrid.appendChild(card);
            });
        } else {
            if (pendingCount) pendingCount.textContent = `0 pendentes`;
            pendingGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: #777; font-size: 0.95rem;"><i class="fa-solid fa-check-double" style="color: #2ecc71;"></i> Nenhuma obra pendente de aprovação!</div>';
        }
    } catch (err) {
        console.error(err);
        pendingGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: red;">Erro ao carregar pendentes.</div>';
    }
}
window.loadPendingPaintingsAdmin = loadPendingPaintingsAdmin;

function formatRelativeTime(timestamp) {
    if (!timestamp) return 'há algum tempo';
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSec < 60) {
        return 'há poucos segundos';
    } else if (diffMin < 60) {
        return diffMin === 1 ? 'há 1 minuto' : `há ${diffMin} minutos`;
    } else if (diffHr < 24) {
        return diffHr === 1 ? 'há 1 hora' : `há ${diffHr} horas`;
    } else if (diffDays < 30) {
        return diffDays === 1 ? 'há 1 dia' : `há ${diffDays} dias`;
    } else if (diffMonths < 12) {
        return diffMonths === 1 ? 'há 1 mês' : `há ${diffMonths} meses`;
    } else {
        return diffYears === 1 ? 'há 1 ano' : `há ${diffYears} anos`;
    }
}
window.formatRelativeTime = formatRelativeTime;

async function renderHallDaFamaView() {
    document.title = "Hall da Fama 🏆 — KidCanvas";
    setMetaDescription("Veja as criações mais votadas da comunidade KidCanvas.");

    // Ocultar todas as views e exibir o Hall da Fama
    document.querySelectorAll('.page-view').forEach(view => view.style.display = 'none');
    const hallView = document.getElementById('view-hall-da-fama');
    if (hallView) hallView.style.display = 'block';

    // Configurar abas de filtro
    const filterTabs = document.querySelectorAll('.hall-filters-wrapper .filter-tab');
    
    if (!window.activeHallCategory) {
        window.activeHallCategory = 'all';
    }

    filterTabs.forEach(tab => {
        const cat = tab.getAttribute('data-category');
        if (cat === window.activeHallCategory) {
            tab.className = 'btn filter-tab active';
        } else {
            tab.className = 'btn filter-tab btn-secondary';
        }

        tab.onclick = () => {
            window.activeHallCategory = cat;
            renderHallDaFamaView();
        };
    });

    const grid = document.getElementById('public-paintings-grid');
    if (!grid) return;
    
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; font-weight: bold; color: var(--color-dark-light);"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>Carregando as criações mágicas...</div>';

    const emptyState = document.getElementById('hall-empty-state');
    if (emptyState) emptyState.style.display = 'none';

    try {
        const response = await fetch('/api/paintings/public');
        const result = await response.json();
        
        if (result.success && result.paintings) {
            const allPaintings = result.paintings.filter(p => p.category !== 'Mão Livre');

            // Rankings de campeões semanais por categoria
            const weeklyChampions = {};
            const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            const categoriesList = ['Colorir', 'Criação com IA', 'Histórias Mágicas'];
            for (const cat of categoriesList) {
                const catApproved = allPaintings.filter(p => p.category === cat || (cat === 'Colorir' && !p.category));
                let weeklyItems = catApproved.filter(p => p.date >= oneWeekAgo && (p.stars || p.likes || 0) > 0);
                if (weeklyItems.length > 0) {
                    weeklyItems.sort((a, b) => (b.stars || b.likes || 0) - (a.stars || a.likes || 0));
                    weeklyChampions[cat] = weeklyItems[0].url;
                } else {
                    let allTimeItems = catApproved.filter(p => (p.stars || p.likes || 0) > 0);
                    if (allTimeItems.length > 0) {
                        allTimeItems.sort((a, b) => (b.stars || b.likes || 0) - (a.stars || a.likes || 0));
                        weeklyChampions[cat] = allTimeItems[0].url;
                    }
                }
            }

            // Filtrar por categoria ativa
            let filtered = allPaintings;
            if (window.activeHallCategory !== 'all') {
                filtered = allPaintings.filter(p => p.category === window.activeHallCategory);
            }

            if (filtered.length === 0) {
                grid.innerHTML = '';
                if (emptyState) {
                    emptyState.style.display = 'block';
                    const emptyTitle = emptyState.querySelector('p:nth-child(2)');
                    const emptySub = emptyState.querySelector('p:nth-child(3)');
                    if (window.activeHallCategory === 'Mão Livre') {
                        if (emptyTitle) emptyTitle.textContent = 'Nenhuma pintura Mão Livre por aqui ainda.';
                        if (emptySub) emptySub.textContent = 'Pinte um desenho do zero e compartilhe no Hall da Fama!';
                    } else if (window.activeHallCategory === 'Colorir') {
                        if (emptyTitle) emptyTitle.textContent = 'Nenhuma obra de Colorir por aqui ainda.';
                        if (emptySub) emptySub.textContent = 'Escolha um desenho legal, pinte e publique aqui!';
                    } else if (window.activeHallCategory === 'Criação com IA') {
                        if (emptyTitle) emptyTitle.textContent = 'Nenhuma criação com IA por aqui ainda.';
                        if (emptySub) emptySub.textContent = 'Use sua imaginação no gerador de IA e envie para o Hall!';
                    } else if (window.activeHallCategory === 'Histórias Mágicas') {
                        if (emptyTitle) emptyTitle.textContent = 'Nenhuma história mágica por aqui ainda.';
                        if (emptySub) emptySub.textContent = 'Crie um livro incrível e compartilhe no Hall!';
                    } else {
                        if (emptyTitle) emptyTitle.textContent = 'O Hall da Fama está esperando a primeira obra.';
                        if (emptySub) emptySub.textContent = 'Pinte, compartilhe e brilhe por aqui!';
                    }
                }
            } else {
                if (emptyState) emptyState.style.display = 'none';
                grid.innerHTML = '';
                
                filtered.forEach(dw => {
                    const card = document.createElement('div');
                    card.className = 'example-card';
                    card.style.background = 'white';
                    card.style.border = 'var(--border-medium)';
                    card.style.borderRadius = 'var(--radius-sm)';
                    card.style.padding = '15px';
                    card.style.boxShadow = 'var(--shadow-cartoon)';
                    card.style.textAlign = 'left';
                    card.style.display = 'flex';
                    card.style.flexDirection = 'column';
                    card.style.gap = '8px';
                    card.style.position = 'relative';

                    const timeStr = formatRelativeTime(dw.date);
                    const starsCount = dw.stars || dw.likes || 0;
                    const category = dw.category || 'Colorir';
                    
                    const likedKey = 'liked_painting_' + btoa(dw.url).replace(/=/g, '');
                    const hasLiked = localStorage.getItem(likedKey);
                    const btnStyle = hasLiked 
                        ? 'background-color: #fff3cd; border-color: #ffe082; color: #ffb300;' 
                        : 'background-color: #ffffff; color: var(--color-dark);';

                    let catBadgeColor = 'background: #10ac84;';
                    if (category === 'Mão Livre') catBadgeColor = 'background: #ff9f43;';
                    else if (category === 'Criação com IA') catBadgeColor = 'background: #9c27b0;';
                    else if (category === 'Histórias Mágicas') catBadgeColor = 'background: #2196f3;';

                    // Avatar do criador (emoji, url externa ou card do livro)
                    const avatarHtml = window.getAvatarHtml(dw.creatorAvatar, '18px');

                    // Champion Badge
                    let championBadgeHtml = '';
                    if (dw.url === weeklyChampions[category]) {
                        let championText = '';
                        let championColor = '';
                        if (category === 'Colorir') {
                            championText = '🏆 Campeão da Semana — Colorir';
                            championColor = '#ffb300';
                        } else if (category === 'Mão Livre') {
                            championText = '🎨 Campeão da Semana — Mão Livre';
                            championColor = '#ff9f43';
                        } else if (category === 'Criação com IA') {
                            championText = '🪄 Mestre dos Prompts';
                            championColor = '#9c27b0';
                        } else if (category === 'Histórias Mágicas') {
                            championText = '📖 Contador de Histórias';
                            championColor = '#2196f3';
                        }
                        championBadgeHtml = `
                            <div style="background: ${championColor}; color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; text-align: center; margin-bottom: 8px; border: var(--border-thin); box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-color: var(--color-dark); text-shadow: 0 1px 1px rgba(0,0,0,0.2);">
                                ${championText}
                            </div>
                        `;
                    }

                    const creatorEscaped = escapeHTML(dw.creatorName || dw.userName || 'Artista');
                    const emailEscaped = escapeHTML(dw.userEmail || '');
                    const promptEscaped = escapeHTML(dw.prompt || '');
                    const firstLinesEscaped = escapeHTML(dw.firstLines || 'Era uma vez...');
                    const urlEscaped = escapeHTML(dw.url);

                    if (category === 'Histórias Mágicas') {
                        card.innerHTML = `
                            ${championBadgeHtml}
                            <div style="border: var(--border-thin); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 4px; aspect-ratio: 4/3; background: #fdfdfd; display: flex; align-items: center; justify-content: center; position: relative;">
                                <img src="${urlEscaped}" alt="${promptEscaped}" style="width: 100%; height: 100%; object-fit: contain; cursor: pointer;" onclick="window.open('${urlEscaped.replace(/'/g, "\\'")}', '_blank')">
                                <span style="position: absolute; top: 6px; right: 6px; font-size: 0.7rem; font-weight: 800; padding: 3px 8px; border-radius: 20px; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.4); ${catBadgeColor}">
                                    ${category}
                                </span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 4px; flex-grow: 1;">
                                <span style="font-size: 0.8rem; color: var(--color-dark-light); font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">${avatarHtml} Autor: <strong style="color: var(--color-purple); cursor: pointer; text-decoration: underline;" onclick="openPublicProfile('${creatorEscaped.replace(/'/g, "\\'")}', '${emailEscaped.replace(/'/g, "\\'")}')">${creatorEscaped}</strong></span>
                                <h4 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--color-purple); margin: 0; line-height: 1.2;">📖 ${promptEscaped}</h4>
                                <p style="font-size: 0.75rem; color: var(--color-dark-light); margin: 0;">Publicado ${timeStr}</p>
                                
                                <div style="background: #fdfdfd; border-left: 3px solid var(--color-purple); padding: 6px 10px; margin: 4px 0; font-size: 0.75rem; font-style: italic; color: #555; max-height: 50px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                                    "${firstLinesEscaped}"
                                </div>
                                
                                <button class="btn btn-primary btn-sm" onclick="viewPublicStory('${urlEscaped.replace(/'/g, "\\'")}')" style="width: 100%; font-size: 0.8rem; padding: 6px; font-weight: 700; border-radius: 8px; margin-top: auto; background-color: var(--color-purple); border-color: var(--color-purple); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                                    📖 Ler História
                                </button>
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #f0f0f0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <span style="font-weight: 800; color: var(--color-orange); font-size: 1.05rem;">⭐ <span class="like-count">${starsCount}</span></span>
                                    <button class="btn btn-secondary btn-sm like-btn" onclick="likePublicPainting('${urlEscaped.replace(/'/g, "\\'")}', this)" style="font-size: 0.8rem; padding: 4px 10px; font-weight: 700; border-radius: 8px; border: var(--border-medium); ${btnStyle} cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 4px;">
                                        ⭐ Dar estrelinha
                                    </button>
                                </div>
                                <div style="display: flex; gap: 6px; width: 100%; align-items: center;">
                                    <button class="btn btn-secondary btn-sm" onclick="printSavedImage('${urlEscaped.replace(/'/g, "\\'")}')" style="flex: 1; justify-content: center; font-size: 0.75rem; padding: 4px;" title="Imprimir"><i class="fa-solid fa-print"></i></button>
                                    <button class="btn btn-success btn-sm" onclick="shareSavedDrawingOnWhatsApp('${urlEscaped.replace(/'/g, "\\'")}', '${promptEscaped.replace(/'/g, "\\'")}')" style="flex: 1; justify-content: center; font-size: 0.75rem; padding: 4px; background-color: #25d366; border-color: #25d366; color: white;" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></button>
                                    <a href="#" onclick="reportPublicPainting(event, '${urlEscaped.replace(/'/g, "\\'")}')" style="color: #e74c3c; font-size: 0.7rem; font-weight: bold; text-decoration: none; padding: 4px; display: inline-flex; align-items: center; gap: 2px;" title="Denunciar esta história"><i class="fa-solid fa-flag"></i> Denunciar</a>
                                </div>
                            </div>
                        `;
                    } else {
                        let extraContentHtml = '';
                        if (category === 'Criação com IA') {
                            extraContentHtml = `
                                <div style="background: #f7f9fa; border: 1px dashed #ced4da; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 0.75rem; font-weight: 600; color: var(--color-dark); max-height: 70px; overflow-y: auto;">
                                    <strong>Prompt:</strong> <span style="font-style: italic; color: #495057;">"${promptEscaped}"</span>
                                </div>
                            `;
                        }

                        card.innerHTML = `
                            ${championBadgeHtml}
                            <div style="border: var(--border-thin); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 4px; aspect-ratio: 4/3; background: #fdfdfd; display: flex; align-items: center; justify-content: center; position: relative;">
                                <img src="${urlEscaped}" alt="${promptEscaped}" style="width: 100%; height: 100%; object-fit: contain; cursor: pointer;" onclick="window.open('${urlEscaped.replace(/'/g, "\\'")}', '_blank')">
                                <span style="position: absolute; top: 6px; right: 6px; font-size: 0.7rem; font-weight: 800; padding: 3px 8px; border-radius: 20px; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.4); ${catBadgeColor}">
                                    ${category}
                                </span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                ${extraContentHtml}
                                <span style="font-size: 0.8rem; color: var(--color-dark-light); font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">${avatarHtml} Por: <strong style="color: var(--color-purple); cursor: pointer; text-decoration: underline;" onclick="openPublicProfile('${creatorEscaped.replace(/'/g, "\\'")}', '${emailEscaped.replace(/'/g, "\\'")}')">${creatorEscaped}</strong></span>
                                <h4 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--color-purple); margin: 0;">${promptEscaped}</h4>
                                <p style="font-size: 0.75rem; color: var(--color-dark-light); margin: 0;">Publicado ${timeStr}</p>
                                
                                <!-- Selo Automático -->
                                <div style="margin-top: 4px; min-height: 20px;">
                                    ${renderStarsBadgeHtml(starsCount)}
                                </div>
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: auto; padding-top: 8px; border-top: 1px dashed #f0f0f0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <span style="font-weight: 800; color: var(--color-orange); font-size: 1.05rem;">⭐ <span class="like-count">${starsCount}</span></span>
                                    <button class="btn btn-secondary btn-sm like-btn" onclick="likePublicPainting('${urlEscaped.replace(/'/g, "\\'")}', this)" style="font-size: 0.8rem; padding: 4px 10px; font-weight: 700; border-radius: 8px; border: var(--border-medium); ${btnStyle} cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 4px;">
                                        ⭐ Dar estrelinha
                                    </button>
                                </div>
                                <div style="display: flex; gap: 6px; width: 100%; align-items: center;">
                                    <button class="btn btn-secondary btn-sm" onclick="printSavedImage('${urlEscaped.replace(/'/g, "\\'")}')" style="flex: 1; justify-content: center; font-size: 0.75rem; padding: 4px;" title="Imprimir"><i class="fa-solid fa-print"></i></button>
                                    <button class="btn btn-success btn-sm" onclick="shareSavedDrawingOnWhatsApp('${urlEscaped.replace(/'/g, "\\'")}', '${promptEscaped.replace(/'/g, "\\'")}')" style="flex: 1; justify-content: center; font-size: 0.75rem; padding: 4px; background-color: #25d366; border-color: #25d366; color: white;" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></button>
                                    <a href="#" onclick="reportPublicPainting(event, '${urlEscaped.replace(/'/g, "\\'")}')" style="color: #e74c3c; font-size: 0.7rem; font-weight: bold; text-decoration: none; padding: 4px; display: inline-flex; align-items: center; gap: 2px;" title="Denunciar esta pintura"><i class="fa-solid fa-flag"></i> Denunciar</a>
                                </div>
                            </div>
                        `;
                    }
                    grid.appendChild(card);
                });
            }

            // Renderizar Rankings
            const weekPaintings = allPaintings.filter(p => p.date >= oneWeekAgo);
            weekPaintings.sort((a, b) => (b.stars || b.likes || 0) - (a.stars || a.likes || 0));
            renderRankingList(weekPaintings.slice(0, 5), 'ranking-week-list');

            const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            const monthPaintings = allPaintings.filter(p => p.date >= oneMonthAgo);
            monthPaintings.sort((a, b) => (b.stars || b.likes || 0) - (a.stars || a.likes || 0));
            renderRankingList(monthPaintings.slice(0, 5), 'ranking-month-list');
            loadTopExplorers();
        } else {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-red); font-weight: bold;">Erro ao carregar o Hall da Fama. Tente novamente mais tarde.</div>';
    }

    // Moderação - Apenas para o Admin foneoliver@gmail.com
    const adminPanel = document.getElementById('view-hall-da-fama-admin');
    if (adminPanel) {
        if (currentUser && currentUser.email === 'foneoliver@gmail.com') {
            adminPanel.style.display = 'block';
            loadPendingPaintingsAdmin();
        } else {
            adminPanel.style.display = 'none';
        }
    }
}
window.renderHallDaFamaView = renderHallDaFamaView;

async function approvePublicPainting(url) {
    showCustomConfirm(
        'Aprovar Pintura? ✅',
        'Deseja aprovar esta pintura para exibição pública no Hall da Fama?',
        async () => {
            try {
                const sessionToken = localStorage.getItem('kidcanvas_session_token') || (currentUser ? currentUser.token : '');
                const response = await fetch('/api/paintings/approve', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-token': sessionToken
                    },
                    body: JSON.stringify({ url })
                });
                const res = await response.json();
                if (res.success) {
                    showToast('Pintura aprovada com sucesso! 🎉', 'success');
                    renderHallDaFamaView();
                } else {
                    showToast(res.message || 'Erro ao aprovar.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Erro ao aprovar pintura.', 'error');
            }
        }
    );
}
window.approvePublicPainting = approvePublicPainting;

async function deletePublicPainting(url) {
    showCustomConfirm(
        'Excluir Pintura? 🚨',
        'Deseja realmente excluir esta pintura permanentemente?',
        async () => {
            try {
                const sessionToken = localStorage.getItem('kidcanvas_session_token') || (currentUser ? currentUser.token : '');
                const response = await fetch('/api/paintings/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-token': sessionToken
                    },
                    body: JSON.stringify({ url })
                });
                const res = await response.json();
                if (res.success) {
                    showToast('Pintura excluída com sucesso! 🗑️', 'success');
                    renderHallDaFamaView();
                } else {
                    showToast(res.message || 'Erro ao excluir.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Erro ao excluir pintura.', 'error');
            }
        }
    );
}
window.deletePublicPainting = deletePublicPainting;

async function warnUserAdmin(url, email) {
    if (!email) {
        showToast('E-mail do usuário não disponível.', 'error');
        return;
    }
    showCustomConfirm(
        'Dar Advertência? ⚠️',
        `Deseja realmente dar uma advertência para o usuário ${email}? Isso também removerá esta pintura da moderação.`,
        async () => {
            try {
                const sessionToken = localStorage.getItem('kidcanvas_session_token') || (currentUser ? currentUser.token : '');
                const response = await fetch('/api/admin/warn-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-token': sessionToken
                    },
                    body: JSON.stringify({ email, url })
                });
                const res = await response.json();
                if (res.success) {
                    showToast(res.message || 'Usuário advertido com sucesso! ⚠️', 'success');
                    renderHallDaFamaView();
                } else {
                    showToast(res.message || 'Erro ao advertir.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Erro ao advertir usuário.', 'error');
            }
        }
    );
}
window.warnUserAdmin = warnUserAdmin;

async function banUserAdmin(url, email) {
    if (!email) {
        showToast('E-mail do usuário não disponível.', 'error');
        return;
    }
    showCustomConfirm(
        'Banir Usuário? 🚫',
        `Deseja realmente banir o usuário ${email} permanentemente? Isso também removerá esta pintura da moderação e invalidará todas as sessões ativas dele.`,
        async () => {
            try {
                const sessionToken = localStorage.getItem('kidcanvas_session_token') || (currentUser ? currentUser.token : '');
                const response = await fetch('/api/admin/ban-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-token': sessionToken
                    },
                    body: JSON.stringify({ email, url })
                });
                const res = await response.json();
                if (res.success) {
                    showToast('Usuário banido com sucesso! 🚫', 'success');
                    renderHallDaFamaView();
                } else {
                    showToast(res.message || 'Erro ao banir.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Erro ao banir usuário.', 'error');
            }
        }
    );
}
window.banUserAdmin = banUserAdmin;

async function reportPublicPainting(e, url) {
    if (e) e.preventDefault();
    showCustomConfirm(
        'Denunciar Imagem? 🚩',
        'Deseja mesmo denunciar esta imagem? Ela será revisada pela nossa equipe e ocultada se violar as regras.',
        async () => {
            try {
                const response = await fetch('/api/paintings/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                });
                const res = await response.json();
                if (res.success) {
                    showToast('Obrigado pela denúncia! A imagem será revisada. 🚩', 'success');
                    renderHallDaFamaView();
                } else {
                    showToast(res.message || 'Erro ao denunciar.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Erro ao denunciar imagem.', 'error');
            }
        }
    );
}
window.reportPublicPainting = reportPublicPainting;

async function likePublicPainting(url, btn) {
    const likedKey = 'liked_painting_' + btoa(url).replace(/=/g, '');
    if (localStorage.getItem(likedKey)) {
        showToast('Você já deu estrelinhas para esta pintura! ⭐', 'info');
        return;
    }

    try {
        btn.style.pointerEvents = 'none';
        const sessionToken = localStorage.getItem('kidcanvas_session_token') || (currentUser ? currentUser.token : '');
        const response = await fetch('/api/paintings/like', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-token': sessionToken || ''
            },
            body: JSON.stringify({ url })
        });
        const result = await response.json();
        if (response.ok && result.success) {
            const card = btn.closest('.example-card');
            const countSpan = card ? card.querySelector('.like-count') : null;
            if (countSpan) countSpan.textContent = result.stars;
            
            localStorage.setItem(likedKey, 'true');
            btn.style.backgroundColor = '#fff3cd';
            btn.style.borderColor = '#ffe082';
            btn.style.color = '#ffb300';
            showToast('Obrigado por votar! ⭐ Dar estrelinha computado!', 'success');
        } else {
            showToast(result.message || 'Erro ao registrar voto.', 'error');
        }
    } catch (err) {
        console.error(err);
    } finally {
        btn.style.pointerEvents = 'auto';
    }
}
window.likePublicPainting = likePublicPainting;


async function savePaintingToGallery() {
    if (!currentUser) {
        showToast('Faça login ou crie uma conta grátis para salvar suas pinturas! 🎨', 'info');
        openAuthModal();
        return;
    }

    const data = window.currentPaintingData;
    if (!data) return;

    const chkPublic = document.getElementById('paint-chk-public');
    const isPublic = chkPublic ? chkPublic.checked : false;

    let creatorName = '';
    if (isPublic) {
        creatorName = currentUser.name || currentUser.email.split('@')[0];
    }

    const btnSave = document.getElementById('paint-btn-save');
    let oldBtnHtml = '';
    if (btnSave) {
        oldBtnHtml = btnSave.innerHTML;
        btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        btnSave.disabled = true;
    }

    try {
        // Hide selection handles for export
        const originalSticker = window.selectedSticker;
        window.selectedSticker = null;
        composePaintCanvas();

        // Exportar como JPEG (qualidade 0.85) - muito menor que PNG para envio ao servidor
        const imageBase64 = paintCanvas.toDataURL('image/jpeg', 0.85);

        // Restore selection handles
        window.selectedSticker = originalSticker;
        composePaintCanvas();

        const sessionToken = localStorage.getItem('kidcanvas_session_token') || currentUser.token;
        const isCustomAI = data.isCustomAI || false;
        const isPinturaLivre = data.isPinturaLivre || false;
        const category = isCustomAI ? 'Criação com IA' : (data.imgUrl === 'blank' ? 'Mão Livre' : 'Colorir');

        const originalCategory = data.originalCategory || data.category || null;
        const colorsCount = window.colorsUsedInPainting ? window.colorsUsedInPainting.size : 1;

        const response = await fetch('/api/user/save-painting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': sessionToken
            },
            body: JSON.stringify({
                imageBase64: imageBase64,
                prompt: data.name,
                isPublic: isPublic,
                category: category,
                creatorName: creatorName,
                originalCategory: originalCategory,
                colorsCount: colorsCount,
                fromPinturaLivre: isPinturaLivre,
                activeChallengeId: window.activeDrawingChallenge ? window.activeDrawingChallenge.id : null
            })
        });

        const resData = await response.json();

        if (response.ok && resData.success) {
            currentUser.myPaintings = resData.myPaintings;
            if (resData.cards) currentUser.cards = resData.cards;
            if (resData.activeChallengeSuccess) {
                showToast(`Parabéns! Você concluiu o desafio e desbloqueou o card ${window.activeDrawingChallenge ? window.activeDrawingChallenge.name : ''}! 🏆`, 'success');
                window.activeDrawingChallenge = null;
                sessionStorage.removeItem('kidcanvas_active_challenge');
                const challengeBar = document.getElementById('paint-challenge-bar');
                if (challengeBar) challengeBar.style.display = 'none';
            } else if (resData.activeChallengeFailed) {
                showToast('Quase! Tente desenhar novamente para desbloquear este card. ✏️', 'info');
            }
            if (resData.stars) {
                currentUser.stars = resData.stars;
                updateStarsUI();
            }
            if (!isPinturaLivre) {
                checkNewAchievements();
            }
            if (isPublic) {
                showToast('Pintura enviada para o Hall da Fama! Ela passará por moderação antes de aparecer publicamente. 🎉', 'success');
            } else {
                showToast('Pintura salva com sucesso na sua galeria! 🎉', 'success');
            }
            
            if (btnSave) {
                btnSave.innerHTML = '<i class="fa-solid fa-circle-check"></i> ✅ Salvo!';
                btnSave.disabled = true;
                setTimeout(() => {
                    btnSave.innerHTML = oldBtnHtml || '<i class="fa-solid fa-floppy-disk"></i> Salvar na Galeria';
                    btnSave.disabled = false;
                }, 3000);
            }
            
            window.lastSavedPaintingUrl = resData.imageUrl;
            window.lastSavedPaintingName = data.name;
            openCertificateModal(data.name);

            // Animar revelações de descobertas recém-desbloqueadas
            if (resData.newlyUnlocked && resData.newlyUnlocked.length > 0) {
                resData.newlyUnlocked.forEach((card, index) => {
                    setTimeout(() => {
                        revealCardAnimation(
                            card.name,
                            card.rarity,
                            card.imageUrl,
                            card.curiosity,
                            card.collection ? card.collection.split(' ')[0] : null
                        );
                    }, index * 4000 + 1500);
                });
            }
            
            // Animar revelações de Mítica (completou coleção)
            if (resData.completionRewards && resData.completionRewards.length > 0) {
                resData.completionRewards.forEach((comp, index) => {
                    const mythic = comp.mythicCard;
                    const colName = comp.colName;
                    const delay = (resData.newlyUnlocked ? resData.newlyUnlocked.length : 0) * 4000 + (index * 4000) + 2500;
                    setTimeout(() => {
                        revealCardAnimation(mythic.name, 'Mítica', mythic.imageUrl, mythic.curiosity, colName);
                    }, delay);
                });
            }

            if (resData.newlyUnlockedCertificates && resData.newlyUnlockedCertificates.length > 0) {
                setTimeout(() => {
                    checkNewlyUnlockedCertificates(resData.newlyUnlockedCertificates);
                }, 1000);
            }
        } else {
            if (btnSave) {
                btnSave.innerHTML = oldBtnHtml || '<i class="fa-solid fa-floppy-disk"></i> Salvar na Galeria';
                btnSave.disabled = false;
            }
            showToast(resData.message || 'Erro ao salvar pintura.', 'error');
            if (resData.limitExceeded) {
                openCreditsModal(resData.message || 'Você atingiu o limite do seu plano. Faça upgrade para salvar mais!', 'Limite do Plano Atingido! 🚀');
            }
        }
    } catch(err) {
        console.error(err);
        if (btnSave) {
            btnSave.innerHTML = oldBtnHtml || '<i class="fa-solid fa-floppy-disk"></i> Salvar na Galeria';
            btnSave.disabled = false;
        }
        showToast('Erro ao se conectar ao servidor.', 'error');
    }
}

function openCertificateModal(drawingName) {
    const modal = document.getElementById('certificateModal');
    if (!modal) return;

    // Play confetti celebration
    startConfettiCelebration();

    // Set a random motivational quote for the child
    const MOTIVATIONAL_QUOTES = [
        "Que obra incrível! 🎨",
        "Você é um verdadeiro artista! 🌟",
        "Que desenho fantástico! 🦄",
        "Ficou super colorido e alegre! 🎉",
        "Sua criatividade não tem limites! 🚀",
        "Que talento maravilhoso! 💖",
        "Um trabalho digno de galeria! 🏆",
        "Que explosão de cores linda! 🌈"
    ];
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    const heading = document.getElementById('certificate-quote-heading');
    if (heading) heading.textContent = randomQuote;

    // Calculate paint statistics
    const timeElapsedSeconds = window.paintStartTime ? Math.round((Date.now() - window.paintStartTime) / 1000) : 0;
    let timeStr = `${timeElapsedSeconds}s`;
    if (timeElapsedSeconds >= 60) {
        timeStr = `${Math.floor(timeElapsedSeconds / 60)}m ${timeElapsedSeconds % 60}s`;
    }
    
    const colorsCount = window.colorsUsedInPainting ? window.colorsUsedInPainting.size : 0;
    const strokesCount = window.strokeCount || 0;
    const stickersCount = window.activeStickers ? window.activeStickers.length : 0;
    
    // Update stats UI
    const statTime = document.getElementById('paint-stat-time');
    const statColors = document.getElementById('paint-stat-colors');
    const statStrokes = document.getElementById('paint-stat-strokes');
    const statStickers = document.getElementById('paint-stat-stickers');
    
    if (statTime) statTime.textContent = timeStr;
    if (statColors) statColors.textContent = colorsCount;
    if (statStrokes) statStrokes.textContent = strokesCount;
    if (statStickers) statStickers.textContent = stickersCount;

    document.getElementById('certificate-congrats-text').textContent = `Você coloriu o desenho "${drawingName}" com muito brilho!`;
    document.getElementById('certificate-child-name').value = currentUser.name || '';
    
    renderCertificate(currentUser.name || '', drawingName);

    modal.style.display = 'flex';

    const btnDownloadCert = document.getElementById('btn-download-certificate');
    btnDownloadCert.onclick = () => {
        const nameInput = document.getElementById('certificate-child-name').value.trim();
        renderCertificate(nameInput || 'Pequeno Artista', drawingName);

        const certCanvas = document.getElementById('certificate-render-canvas');
        const link = document.createElement('a');
        link.download = `certificado-artista-${nameInput || 'artista'}.png`;
        link.href = certCanvas.toDataURL('image/png');
        link.click();
        
        showToast('Certificado baixado com sucesso! 🎓', 'success');
    };

    const btnShareCert = document.getElementById('btn-share-certificate');
    if (btnShareCert) {
        btnShareCert.onclick = () => {
            const promptText = window.lastSavedPaintingName || drawingName;
            if (window.lastSavedPaintingUrl) {
                shareSavedDrawingOnWhatsApp(window.lastSavedPaintingUrl, promptText);
            } else {
                showToast('Aguarde a pintura ser salva para poder compartilhar! 🚀', 'info');
            }
        };
    }
}

function closeCertificateModal() {
    const modal = document.getElementById('certificateModal');
    if (modal) modal.style.display = 'none';
}

function renderCertificate(childName, drawingName) {
    const certCanvas = document.getElementById('certificate-render-canvas');
    const cCtx = certCanvas.getContext('2d');
    const w = certCanvas.width;
    const h = certCanvas.height;

    cCtx.fillStyle = '#faf8f5';
    cCtx.fillRect(0, 0, w, h);

    cCtx.lineWidth = 16;
    cCtx.strokeStyle = '#ffd43b';
    cCtx.strokeRect(20, 20, w - 40, h - 40);

    cCtx.lineWidth = 3;
    cCtx.strokeStyle = '#ff5e7e';
    cCtx.strokeRect(36, 36, w - 72, h - 72);

    cCtx.font = '36px Arial';
    cCtx.fillText('🎨', 60, 90);
    cCtx.fillText('🏆', w - 110, 90);
    cCtx.fillText('⭐', 60, h - 70);
    cCtx.fillText('🎉', w - 110, h - 70);

    cCtx.textAlign = 'center';
    cCtx.fillStyle = '#ff5e7e';
    cCtx.font = 'bold 44px Fredoka, Quicksand, sans-serif';
    cCtx.fillText('CERTIFICADO DE ARTISTA', w / 2, 130);

    cCtx.fillStyle = '#495057';
    cCtx.font = '22px Quicksand, sans-serif';
    cCtx.fillText('Este certificado é concedido com muito orgulho a:', w / 2, 220);

    cCtx.fillStyle = '#4dabf7';
    cCtx.font = 'bold 48px Fredoka, Quicksand, sans-serif';
    cCtx.fillText(childName.toUpperCase() || 'PEQUENO ARTISTA', w / 2, 305);

    cCtx.strokeStyle = '#e9ecef';
    cCtx.lineWidth = 3;
    cCtx.beginPath();
    cCtx.moveTo(w / 2 - 200, 345);
    cCtx.lineTo(w / 2 + 200, 345);
    cCtx.stroke();

    cCtx.fillStyle = '#495057';
    cCtx.font = '20px Quicksand, sans-serif';
    cCtx.fillText('Por ter colorido de forma incrivelmente criativa o desenho:', w / 2, 395);

    cCtx.fillStyle = '#ff5e7e';
    cCtx.font = 'bold 28px Fredoka, Quicksand, sans-serif';
    cCtx.fillText(`★ ${drawingName} ★`, w / 2, 445);

    // Desenhar assinaturas decorativas acima das linhas
    cCtx.fillStyle = '#7b4fa6'; // Roxo da Vovó Sônia
    cCtx.font = "italic 36px 'Alex Brush', cursive";
    cCtx.fillText('Vovó Sônia', w / 2 - 150, 495);

    cCtx.fillStyle = '#1971c2'; // Azul do Pedrinho
    cCtx.font = "32px 'Gochi Hand', cursive";
    cCtx.fillText('Pedrinho', w / 2 + 150, 495);

    // Nomes impressos abaixo das linhas
    cCtx.fillStyle = '#868e96';
    cCtx.font = 'bold 14px Quicksand, sans-serif';
    cCtx.fillText('Vovó Sônia', w / 2 - 150, 525);
    cCtx.fillText('Pedrinho', w / 2 + 150, 525);

    // Linhas de assinatura
    cCtx.strokeStyle = '#cbd5e1';
    cCtx.lineWidth = 1.5;
    cCtx.beginPath();
    cCtx.moveTo(w / 2 - 220, 505);
    cCtx.lineTo(w / 2 - 80, 505);
    cCtx.moveTo(w / 2 + 80, 505);
    cCtx.lineTo(w / 2 + 220, 505);
    cCtx.stroke();
}

function startFreeHandDrawing(e) {
    if (e) e.preventDefault();
    window.currentPaintingData = {
        imgUrl: 'blank',
        name: 'Desenho Livre',
        backUrl: '/',
        category: 'Mão Livre',
        isPinturaLivre: true
    };
    navigate('/pintar-online');
}

window.renderPintarOnlineView = renderPintarOnlineView;
window.closeCertificateModal = closeCertificateModal;
window.startFreeHandDrawing = startFreeHandDrawing;

// ==============================================
// PINTURA LIVRE CHOOSER (ROLETA MÁGICA)
// ==============================================

let plcCurrentDrawings = []; // Armazena os 3 desenhos aleatórios atuais

function renderPinturaLivreChooser() {
    document.title = "Pintura Livre — KidCanvas 🎨";
    setMetaDescription("Escolha entre uma tela em branco ou receba sugestões aleatórias de desenhos para colorir online!");

    // Ocultar todas as views e exibir a view de escolha
    document.querySelectorAll('.page-view').forEach(view => view.style.display = 'none');
    const view = document.getElementById('view-pintura-livre-chooser');
    if (view) view.style.display = 'block';

    // Resetar estado: mostrar opções e esconder roleta
    const optionsGrid = document.querySelector('.plc-options-grid');
    const roulettePanel = document.getElementById('plc-roulette-panel');
    if (optionsGrid) optionsGrid.style.display = 'grid';
    if (roulettePanel) roulettePanel.style.display = 'none';
}

function getRandomDrawings(count) {
    if (!allDrawings || allDrawings.length === 0) {
        return [];
    }
    
    // Filtrar desenhos free para usuários sem plano pago
    let pool = allDrawings;
    if (!currentUser || !currentUser.plan || currentUser.plan === 'Aprendiz' || currentUser.plan === 'Grátis') {
        pool = pool.filter(d => d.tier === 'free');
    }
    
    if (pool.length === 0) return [];
    
    // Algoritmo Fisher-Yates para N aleatórios sem repetição
    const shuffled = [...pool];
    const result = [];
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        const j = i + Math.floor(Math.random() * (shuffled.length - i));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        result.push(shuffled[i]);
    }
    return result;
}

function populateRouletteCards(drawings) {
    plcCurrentDrawings = drawings;
    for (let i = 0; i < 3; i++) {
        const drawing = drawings[i];
        const img = document.getElementById(`plc-img-${i}`);
        const name = document.getElementById(`plc-name-${i}`);
        const badge = document.getElementById(`plc-badge-${i}`);
        
        if (drawing && img && name && badge) {
            img.src = drawing.url;
            img.alt = drawing.pt;
            name.textContent = drawing.pt;
            
            // Pegar emoji e nome da categoria
            const catData = CATEGORIES_DATA[drawing.category];
            badge.textContent = catData ? `${catData.emoji} ${catData.name}` : drawing.category;
        }
    }
}

function openMagicRoulette() {
    const optionsGrid = document.querySelector('.plc-options-grid');
    const roulettePanel = document.getElementById('plc-roulette-panel');
    
    if (optionsGrid) optionsGrid.style.display = 'none';
    if (roulettePanel) {
        roulettePanel.style.display = 'block';
        // Re-trigger animation
        roulettePanel.style.animation = 'none';
        roulettePanel.offsetHeight; // Force reflow
        roulettePanel.style.animation = '';
    }
    
    // Sortear 3 desenhos
    const drawings = getRandomDrawings(3);
    if (drawings.length < 3) {
        showToast('Carregando desenhos... Tente novamente em um instante! ⏳', 'info');
        return;
    }
    populateRouletteCards(drawings);
}

function closeRoulette() {
    const optionsGrid = document.querySelector('.plc-options-grid');
    const roulettePanel = document.getElementById('plc-roulette-panel');
    
    if (optionsGrid) optionsGrid.style.display = 'grid';
    if (roulettePanel) roulettePanel.style.display = 'none';
}

function shuffleRouletteDrawings() {
    const shuffleBtn = document.getElementById('plc-shuffle-btn');
    if (shuffleBtn) {
        shuffleBtn.classList.add('plc-shuffling');
        setTimeout(() => shuffleBtn.classList.remove('plc-shuffling'), 500);
    }
    
    // Animação de flip nos cards
    for (let i = 0; i < 3; i++) {
        const card = document.getElementById(`plc-card-${i}`);
        if (card) {
            card.classList.add('plc-card-flip');
            setTimeout(() => card.classList.remove('plc-card-flip'), 600);
        }
    }
    
    // Trocar desenhos após metade da animação de flip
    setTimeout(() => {
        const drawings = getRandomDrawings(3);
        if (drawings.length >= 3) {
            populateRouletteCards(drawings);
        }
    }, 300);
}

function selectRouletteDrawing(index) {
    const drawing = plcCurrentDrawings[index];
    if (!drawing) return;
    
    window.currentPaintingData = {
        imgUrl: drawing.url,
        name: drawing.pt,
        backUrl: '/pintura-livre',
        category: drawing.category,
        isPinturaLivre: true
    };
    navigate('/pintar-online');
}

function startBlankCanvas() {
    window.currentPaintingData = {
        imgUrl: 'blank',
        name: 'Desenho Livre',
        backUrl: '/pintura-livre',
        category: 'Mão Livre',
        isPinturaLivre: true
    };
    navigate('/pintar-online');
}

window.renderPinturaLivreChooser = renderPinturaLivreChooser;
window.openMagicRoulette = openMagicRoulette;
window.closeRoulette = closeRoulette;
window.shuffleRouletteDrawings = shuffleRouletteDrawings;
window.selectRouletteDrawing = selectRouletteDrawing;
window.startBlankCanvas = startBlankCanvas;

// ==============================================
// STICKER CONSOLE & CUSTOM DIALOG SYSTEM
// ==============================================

const stickerCategories = {
    top: ['😎', '👑', '🌈', '⭐', '❤️', '🎈', '🦋', '🐶', '🐱', '☀️', '🌙', '🚀', '🏆'],
    animais: ['🦁', '🐯', '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🐵', '🐸', '🐹', '🐧', '🐥', '🐝', '🐞', '🦋'],
    dinossauros: ['🦖', '🦕', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🥚'],
    natureza: ['🌸', '🌹', '🌻', '🌼', '🌷', '🌱', '🌿', '☘️', '🍀', '🍁', '🍂', '🍄', '🌳', '🌴', '🌵', '🌺', '🍒'],
    festa: ['🎈', '🎁', '🎂', '🍰', '🧁', '🍬', '🍭', '🎉', '🎊', '🎀', '🍿', '🥤', '🍕', '🍟'],
    espaco: ['🚀', '🛸', '🪐', '☄️', '🌟', '⭐', '🌙', '🌌', '🌍', '👽', '🛰️', '🧑‍🚀'],
    fantasia: ['🦄', '🐉', '🧚', '🧜', '🧙', '🧝', '🧞', '🏰', '🔮', '🪄', '⭐', '✨'],
    acessorios: [
        { name: 'Óculos gigantes', url: '/stickers/oculos_gigantes.png' },
        { name: 'Boné azul', url: '/stickers/bone_azul.png' },
        { name: 'Boné vermelho', url: '/stickers/bone_vermelho.png' },
        { name: 'Coroa dourada', url: '/stickers/coroa_dourada.png' },
        { name: 'Gravata', url: '/stickers/gravata.png' },
        { name: 'Laço rosa', url: '/stickers/laco_rosa.png' },
        { name: 'Relógio', url: '/stickers/relogio.png' },
        { name: 'Fones de ouvido', url: '/stickers/fones_de_ouvido.png' },
        '🤠', '🏴‍☠️', '🎩', '👔', '💡', '👓', '🕶️', '👒', '👑', '🎀'
    ]
};

const unlockableBadges = [
    { name: 'Artista Iniciante', emoji: '🎨', stars: 0 },
    { name: 'Colorista Criativo', emoji: '🌈', stars: 10 },
    { name: 'Mestre da Imaginação', emoji: '🦄', stars: 30 },
    { name: 'Explorador Mágico', emoji: '🚀', stars: 50 },
    { name: 'Lenda do KidCanvas', emoji: '👑', stars: 180 }
];

const unlockableStickers = [
    { name: 'Óculos de estrela', emoji: '⭐', url: '/stickers/oculos_estrela.png', stars: 10 },
    { name: 'Óculos arco-íris', emoji: '🌈', url: '/stickers/oculos_arco_iris.png', stars: 30 },
    { name: 'Óculos lendário dourado cravejado de diamantes', emoji: '💎', url: '/stickers/oculos_lendario_dourado_diamantes.png', stars: 20 },
    { name: 'Óculos lendário dourado', emoji: '👑', url: '/stickers/oculos_lendario_dourado.png', stars: 100 }
];

let activeStickerTab = 'top';

function getUserTotalStars() {
    if (!currentUser) return 0;
    const paintings = currentUser.myPaintings || [];
    return paintings.reduce((sum, p) => sum + (p.stars || p.likes || 0), 0);
}

function openStickerConsoleModal() {
    const modal = document.getElementById('sticker-console-modal');
    if (!modal) return;
    
    // Calcular estrelas e desbloqueados
    const stars = getUserTotalStars();
    let unlockedCount = 0;
    unlockableBadges.forEach(b => {
        if (stars >= b.stars) unlockedCount++;
    });
    
    const badgeCountSpan = document.getElementById('unlocked-badge-count');
    if (badgeCountSpan) {
        badgeCountSpan.textContent = `${unlockedCount}/5`;
    }
    
    modal.classList.add('open');
    switchStickerTab(activeStickerTab);
}
window.openStickerConsoleModal = openStickerConsoleModal;

function closeStickerConsoleModal() {
    const modal = document.getElementById('sticker-console-modal');
    if (modal) {
        modal.classList.remove('open');
    }
}
window.closeStickerConsoleModal = closeStickerConsoleModal;

function switchStickerTab(tab) {
    activeStickerTab = tab;
    
    // Atualizar botões de aba
    const container = document.querySelector('.sticker-tabs-container');
    if (container) {
        container.querySelectorAll('.sticker-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const btns = container.querySelectorAll('.sticker-tab-btn');
        const tabNames = ['top', 'animais', 'dinossauros', 'natureza', 'festa', 'espaco', 'fantasia', 'acessorios', 'desbloqueaveis'];
        const idx = tabNames.indexOf(tab);
        if (idx !== -1 && btns[idx]) {
            btns[idx].classList.add('active');
        }
    }
    
    // Renderizar conteúdo
    const grid = document.getElementById('sticker-grid-content');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (tab === 'desbloqueaveis') {
        const stars = getUserTotalStars();
        
        // 1. Renderizar os Distintivos de Perfil (Badges)
        unlockableBadges.forEach(badge => {
            const isUnlocked = stars >= badge.stars;
            const item = document.createElement('div');
            item.className = 'sticker-badge-item' + (isUnlocked ? '' : ' locked');
            
            if (isUnlocked) {
                item.innerHTML = `
                    <span class="sticker-badge-icon">${badge.emoji}</span>
                    <span class="sticker-badge-name" style="font-size: 0.8rem; line-height: 1.1;">${badge.name}</span>
                    <span class="sticker-badge-requirement" style="color: #2e7d32; font-size: 0.75rem;">Desbloqueado! 🔓</span>
                `;
                item.onclick = () => {
                    selectConsoleSticker(`${badge.emoji} ${badge.name}`);
                };
            } else {
                item.innerHTML = `
                    <span class="sticker-badge-icon" style="filter: grayscale(1); opacity: 0.5;">🔒</span>
                    <span class="sticker-badge-name" style="color: #90a4ae; font-size: 0.8rem; line-height: 1.1;">${badge.name}</span>
                    <span class="sticker-badge-requirement" style="font-size: 0.75rem;">Precisa de ${badge.stars} ⭐</span>
                `;
                item.onclick = () => {
                    showCustomAlert('Adesivo Bloqueado! 🔒', `Esta insígnia especial será liberada quando suas pinturas no Hall da Fama acumularem ${badge.stars} estrelas! Continue colorindo e compartilhando! 🎨`);
                };
            }
            grid.appendChild(item);
        });

        // 2. Renderizar os Adesivos Customizados Desbloqueáveis (Stickers)
        unlockableStickers.forEach(st => {
            const isUnlocked = stars >= st.stars;
            const item = document.createElement('div');
            item.className = 'sticker-badge-item' + (isUnlocked ? '' : ' locked');
            
            if (isUnlocked) {
                item.innerHTML = `
                    <span class="sticker-badge-icon" style="padding: 4px; display: flex; align-items: center; justify-content: center; height: 42px;"><img src="${st.url}" alt="${st.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;"></span>
                    <span class="sticker-badge-name" style="font-size: 0.8rem; line-height: 1.1;">${st.name}</span>
                    <span class="sticker-badge-requirement" style="color: #2e7d32; font-size: 0.75rem;">Desbloqueado! 🔓</span>
                `;
                item.onclick = () => {
                    selectConsoleSticker(st.url);
                };
            } else {
                item.innerHTML = `
                    <span class="sticker-badge-icon" style="filter: grayscale(1); opacity: 0.5; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; height: 42px;">🔒</span>
                    <span class="sticker-badge-name" style="color: #90a4ae; font-size: 0.8rem; line-height: 1.1;">${st.name}</span>
                    <span class="sticker-badge-requirement" style="font-size: 0.75rem;">Precisa de ${st.stars} ⭐</span>
                `;
                item.onclick = () => {
                    showCustomAlert('Adesivo Bloqueado! 🔒', `Este acessório especial será liberado quando suas pinturas no Hall da Fama acumularem ${st.stars} estrelas! Continue colorindo e compartilhando! 🎨`);
                };
            }
            grid.appendChild(item);
        });
    } else {
        const stickers = stickerCategories[tab] || [];
        stickers.forEach(st => {
            const item = document.createElement('div');
            if (typeof st === 'object' && st.url) {
                item.className = 'sticker-grid-item';
                item.style.padding = '6px';
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.justifyContent = 'center';
                item.innerHTML = `<img src="${st.url}" alt="${st.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" title="${st.name}">`;
                item.onclick = () => {
                    selectConsoleSticker(st.url);
                };
            } else {
                item.className = 'sticker-grid-item';
                item.textContent = st;
                item.onclick = () => {
                    selectConsoleSticker(st);
                };
            }
            grid.appendChild(item);
        });
    }
}
window.switchStickerTab = switchStickerTab;

function selectConsoleSticker(emoji) {
    insertStickerInstantly(emoji);
    closeStickerConsoleModal();
    
    // Remover classe active de todos os botões de carimbo rápidos do sidebar
    document.querySelectorAll('.paint-stamp-btn').forEach(btn => btn.classList.remove('active'));
    
    // Mostrar feedback
    if (emoji.startsWith('http') || emoji.startsWith('/') || emoji.startsWith('./')) {
        const parts = emoji.split('/');
        const filename = parts[parts.length - 1].replace('.png', '').replace(/_/g, ' ');
        const formattedName = filename.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        showToast(`Adesivo "${formattedName}" inserido! ✨`, 'success');
    } else {
        showToast(`Carimbo ${emoji} inserido! ✨`, 'success');
    }
}

// Dialog Modals Customizados
function showCustomAlert(title, message, callback) {
    const modal = document.getElementById('custom-dialog-modal');
    if (!modal) {
        alert(message);
        if (callback) callback();
        return;
    }
    
    document.getElementById('custom-dialog-icon').textContent = '🎨';
    document.getElementById('custom-dialog-title').textContent = title;
    document.getElementById('custom-dialog-message').textContent = message;
    
    const btnCancel = document.getElementById('custom-dialog-btn-cancel');
    const btnConfirm = document.getElementById('custom-dialog-btn-confirm');
    
    if (btnCancel) btnCancel.style.display = 'none';
    if (btnConfirm) {
        btnConfirm.textContent = 'Ok ✅';
        btnConfirm.style.width = '100%';
        btnConfirm.onclick = () => {
            modal.classList.remove('open');
            if (callback) callback();
        };
    }
    
    modal.classList.add('open');
}
window.showCustomAlert = showCustomAlert;

function showCustomConfirm(title, message, onConfirm, onCancel) {
    const modal = document.getElementById('custom-dialog-modal');
    if (!modal) {
        const ok = confirm(message);
        if (ok) {
            if (onConfirm) onConfirm();
        } else {
            if (onCancel) onCancel();
        }
        return;
    }
    
    let icon = '🎨';
    const msgLower = message.toLowerCase();
    if (msgLower.includes('limpar') || msgLower.includes('excluir') || msgLower.includes('deletar')) {
        icon = '🗑️';
    } else if (msgLower.includes('aprovar')) {
        icon = '✅';
    } else if (msgLower.includes('denunciar')) {
        icon = '⚠️';
    }
    
    document.getElementById('custom-dialog-icon').textContent = icon;
    document.getElementById('custom-dialog-title').textContent = title;
    document.getElementById('custom-dialog-message').textContent = message;
    
    const btnCancel = document.getElementById('custom-dialog-btn-cancel');
    const btnConfirm = document.getElementById('custom-dialog-btn-confirm');
    
    if (btnCancel) {
        btnCancel.style.display = 'block';
        btnCancel.textContent = 'Cancelar ❌';
        btnCancel.onclick = () => {
            modal.classList.remove('open');
            if (onCancel) onCancel();
        };
    }
    
    if (btnConfirm) {
        btnConfirm.textContent = 'Confirmar ✅';
        btnConfirm.style.width = 'auto';
        btnConfirm.onclick = () => {
            modal.classList.remove('open');
            if (onConfirm) onConfirm();
        };
    }
    
    modal.classList.add('open');
}
window.showCustomConfirm = showCustomConfirm;


// --- SISTEMA DE CONQUISTAS V2 (ÁLBUM DE COLEÇÃO) ---

const USER_LEVELS = [
    { minStars: 0,   name: 'Aprendiz de Cores', color: '#9e9e9e', icon: '🎨' },
    { minStars: 10,  name: 'Rabiscador Criativo', color: '#4CAF50', icon: '🖍️' },
    { minStars: 30,  name: 'Desenhista Amador', color: '#2196F3', icon: '✏️' },
    { minStars: 50,  name: 'Artista Promissor', color: '#9C27B0', icon: '🌟' },
    { minStars: 100, name: 'Mestre dos Pincéis', color: '#FF9800', icon: '🖌️' },
    { minStars: 180, name: 'Leonardo da Vinte', color: '#E91E63', icon: '👨‍🎨' },
    { minStars: 300, name: 'Picasso do Pixel', color: '#00BCD4', icon: '🖼️' },
    { minStars: 500, name: 'Lenda Suprema', color: '#FFD700', icon: '👑' }
];

function getUserLevel(stars) {
    let currentLevel = USER_LEVELS[0];
    for (const level of USER_LEVELS) {
        if (stars >= level.minStars) {
            currentLevel = level;
        } else {
            break;
        }
    }
    return currentLevel;
}

const ACHIEVEMENT_RARITIES = {
    common:    { name: 'Comum',     color: '#4CAF50', glow: 'rgba(76,175,80,0.25)',   stars: '⭐' },
    rare:      { name: 'Raro',      color: '#2196F3', glow: 'rgba(33,150,243,0.25)',  stars: '⭐⭐' },
    epic:      { name: 'Épico',     color: '#9C27B0', glow: 'rgba(156,39,176,0.25)',  stars: '⭐⭐⭐' },
    legendary: { name: 'Lendário',  color: '#FF9800', glow: 'rgba(255,152,0,0.3)',    stars: '⭐⭐⭐⭐' },
    mythic:    { name: 'Mítico',    color: '#FFD700', glow: 'rgba(255,215,0,0.35)',   stars: '⭐⭐⭐⭐⭐' }
};


const SOCIAL_ACHIEVEMENTS = [
    { id: 'turma_colorida',   name: 'Turma Colorida', emoji: '🎨', req: 5,  desc: 'Convidou 5 amigos ativos' },
    { id: 'festa_cores',      name: 'Festa das Cores', emoji: '🎉', req: 10, desc: 'Convidou 10 amigos ativos' },
    { id: 'escola_inteira',   name: 'Escola Inteira',  emoji: '🏫', req: 20, desc: 'Convidou 20 amigos ativos' },
    { id: 'mundo_kidcanvas',  name: 'Mundo KidCanvas', emoji: '🌎', req: 50, desc: 'Convidou 50 amigos ativos' }
];

function getUserStars(u) {
    if (!u || !u.myPaintings) return 0;
    return u.myPaintings.reduce((sum, p) => sum + (p.stars || p.likes || 0), 0);
}

const ACHIEVEMENTS_CATALOG = [
    // --- COMUNS (🟢) ---
    { id: 'primeiro_traco',       name: 'Primeiro Traço',        emoji: '✏️',  rarity: 'common', desc: 'Salvar sua primeira pintura', check: u => (u.myPaintings?.length || 0) >= 1 },
    { id: 'primeira_historia',    name: 'Primeira História',     emoji: '📖',  rarity: 'common', desc: 'Criar sua primeira história', check: u => (u.myStories?.length || 0) >= 1 },
    { id: 'guardiao_galeria',     name: 'Guardião da Galeria',   emoji: '💾',  rarity: 'common', desc: 'Salvar 5 pinturas', check: u => (u.myPaintings?.length || 0) >= 5 },
    { id: 'fa_carteirinha',       name: 'Fã de Carteirinha',     emoji: '🎒',  rarity: 'common', desc: 'Pintar 10 desenhos', check: u => (u.myPaintings?.length || 0) >= 10 },
    { id: 'colorista_criativo',   name: 'Colorista Criativo',    emoji: '🖍️',  rarity: 'common', desc: 'Pintar 15 desenhos', check: u => (u.myPaintings?.length || 0) >= 15 },
    { id: 'artista_iniciante',    name: 'Artista Iniciante',     emoji: '🎨',  rarity: 'common', desc: 'Publicar 1 obra no Hall', check: u => (u.myPaintings?.filter(p => p.isPublic)?.length || 0) >= 1 },
    { id: 'primeira_estrela',     name: 'Primeira Estrela',      emoji: '⭐',  rarity: 'common', desc: 'Ganhar sua primeira estrela', check: u => getUserStars(u) >= 1 },
    { id: 'explorador_ia',        name: 'Explorador IA',         emoji: '🤖',  rarity: 'common', desc: 'Gerar 1 imagem com IA', check: u => (u.myImages?.length || 0) >= 1 },
    { id: 'escritor_iniciante',   name: 'Escritor Iniciante',    emoji: '📝',  rarity: 'common', desc: 'Criar 3 histórias', check: u => (u.myStories?.length || 0) >= 3 },
    { id: 'rotina_basica',        name: 'Dois Dias!',            emoji: '📅',  rarity: 'common', desc: 'Entrar 2 dias seguidos', check: u => (u.consecutiveDays || 1) >= 2 },
    
    // --- RAROS (🔵) ---
    { id: 'mestre_dinos',         name: 'Mestre dos Dinossauros', emoji: '🦕', rarity: 'rare', desc: 'Pintar 5 dinossauros', check: u => countPaintingsByCategory(u, 'dinossauros') >= 5 },
    { id: 'rei_unicornios',       name: 'Rei dos Unicórnios',    emoji: '🦄',  rarity: 'rare', desc: 'Pintar 5 de fantasia', check: u => countPaintingsByCategory(u, 'fantasia') >= 5 },
    { id: 'explorador_espacial',  name: 'Explorador Espacial',   emoji: '🚀',  rarity: 'rare', desc: 'Pintar 5 de espaço', check: u => countPaintingsByCategory(u, 'espaco') >= 5 },
    { id: 'mestre_animais',       name: 'Mestre dos Animais',    emoji: '🐾',  rarity: 'rare', desc: 'Pintar 5 animais', check: u => countPaintingsByCategory(u, 'animais-selvagens') + countPaintingsByCategory(u, 'animais-domesticos') + countPaintingsByCategory(u, 'animais-do-mar') >= 5 },
    { id: 'arco_iris',            name: 'Arco-Íris de Cores',    emoji: '🌈',  rarity: 'rare', desc: '10 estrelas recebidas', check: u => getUserStars(u) >= 10 },
    { id: 'estrela_nascente',     name: 'Estrela Nascente',      emoji: '🌟',  rarity: 'rare', desc: 'Publicar 5 obras no Hall', check: u => (u.myPaintings?.filter(p => p.isPublic)?.length || 0) >= 5 },
    { id: 'designer_ia',          name: 'Designer com IA',       emoji: '🧠',  rarity: 'rare', desc: 'Gerar 5 imagens com IA', check: u => (u.myImages?.length || 0) >= 5 },
    { id: 'galeria_20',           name: 'Galeria Cheia',         emoji: '🖼️',  rarity: 'rare', desc: 'Pintar 20 desenhos', check: u => (u.myPaintings?.length || 0) >= 20 },
    { id: 'tres_dias',            name: 'Três Dias!',            emoji: '🔥',  rarity: 'rare', desc: 'Entrar 3 dias seguidos', check: u => (u.consecutiveDays || 1) >= 3 },
    { id: 'escritor_mirim',       name: 'Escritor Mirim',        emoji: '✍️',  rarity: 'rare', desc: 'Criar 5 histórias', check: u => (u.myStories?.length || 0) >= 5 },
    
    // --- ÉPICOS (🟣) ---
    { id: '50_desenhos',          name: '50 Desenhos',           emoji: '🏆',  rarity: 'epic', desc: 'Pintar 50 desenhos', check: u => (u.myPaintings?.length || 0) >= 50 },
    { id: '25_historias',         name: '25 Histórias Criadas',  emoji: '📚',  rarity: 'epic', desc: 'Criar 15 histórias', check: u => (u.myStories?.length || 0) >= 15 },
    { id: '100_estrelas',         name: '100 Estrelas',          emoji: '💯',  rarity: 'epic', desc: '100 estrelas recebidas', check: u => getUserStars(u) >= 100 },
    { id: '7_dias',               name: 'Uma Semana!',           emoji: '🗓️', rarity: 'epic', desc: '7 dias consecutivos', check: u => (u.consecutiveDays || 1) >= 7 },
    { id: 'hall_bronze',          name: 'Hall da Fama Bronze',   emoji: '🥉',  rarity: 'epic', desc: 'Publicar 20 obras no Hall', check: u => (u.myPaintings?.filter(p => p.isPublic)?.length || 0) >= 20 },
    { id: 'ia_master',            name: 'Mestre da IA',          emoji: '🔮',  rarity: 'epic', desc: 'Gerar 20 imagens com IA', check: u => (u.myImages?.length || 0) >= 20 },
    { id: 'veiculos',             name: 'Piloto Rápido',         emoji: '🏎️', rarity: 'epic', desc: 'Pintar 10 veículos', check: u => countPaintingsByCategory(u, 'veiculos') >= 10 },
    { id: 'profissoes',           name: 'Mestre do Trabalho',    emoji: '👷', rarity: 'epic', desc: 'Pintar 10 profissões', check: u => countPaintingsByCategory(u, 'profissoes') >= 10 },
    { id: 'comida',               name: 'Chef de Cozinha',       emoji: '🍔',  rarity: 'epic', desc: 'Pintar 10 comidas', check: u => countPaintingsByCategory(u, 'comidas') >= 10 },
    { id: 'natureza',             name: 'Defensor da Natureza',  emoji: '🌿',  rarity: 'epic', desc: 'Pintar 10 de natureza', check: u => countPaintingsByCategory(u, 'natureza') >= 10 },
    
    // --- LENDÁRIOS (🟠) ---
    { id: '250_estrelas',         name: '250 Estrelas',          emoji: '✨',  rarity: 'legendary', desc: '250 estrelas recebidas', check: u => getUserStars(u) >= 250 },
    { id: '100_desenhos',         name: '100 Desenhos',          emoji: '🖼️',  rarity: 'legendary', desc: 'Pintar 100 desenhos', check: u => (u.myPaintings?.length || 0) >= 100 },
    { id: 'hall_ouro',            name: 'Hall da Fama Ouro',     emoji: '🥇',  rarity: 'legendary', desc: 'Publicar 50 obras no Hall', check: u => (u.myPaintings?.filter(p => p.isPublic)?.length || 0) >= 50 },
    { id: 'mestre_historias',     name: 'Mestre das Histórias',  emoji: '📜',  rarity: 'legendary', desc: 'Criar 30 histórias', check: u => (u.myStories?.length || 0) >= 30 },
    { id: 'criador_supremo',      name: 'Criador Supremo',       emoji: '👑',  rarity: 'legendary', desc: 'Gerar 50 imagens com IA', check: u => (u.myImages?.length || 0) >= 50 },
    { id: '14_dias',              name: 'Duas Semanas!',         emoji: '🔥🔥', rarity: 'legendary', desc: '14 dias consecutivos', check: u => (u.consecutiveDays || 1) >= 14 },
    { id: 'amigo_monstros',       name: 'Amigo dos Monstros',    emoji: '👾',  rarity: 'legendary', desc: 'Pintar 15 monstros', check: u => countPaintingsByCategory(u, 'monstros') >= 15 },
    { id: 'construtor',           name: 'Construtor',            emoji: '🏗️', rarity: 'legendary', desc: 'Pintar 15 cidades', check: u => countPaintingsByCategory(u, 'cidades') >= 15 },
    { id: 'ninja',                name: 'Ninja das Cores',       emoji: '🥷',  rarity: 'legendary', desc: 'Pintar 15 esportes', check: u => countPaintingsByCategory(u, 'esportes') >= 15 },
    { id: 'aventureiro',          name: 'Aventureiro',           emoji: '🗺️', rarity: 'legendary', desc: '50 pinturas completas', check: u => (u.myPaintings?.length || 0) >= 50 },
    
    // --- MÍTICOS (👑) ---
    { id: '500_estrelas',         name: '500 Estrelas',          emoji: '🌟',  rarity: 'mythic', desc: '500 estrelas recebidas', check: u => getUserStars(u) >= 500 },
    { id: '500_desenhos',         name: '500 Desenhos',          emoji: '🖌️', rarity: 'mythic', desc: 'Pintar 500 desenhos', check: u => (u.myPaintings?.length || 0) >= 500 },
    { id: '30_dias',              name: 'Um Mês Inteiro!',       emoji: '🔥🔥🔥', rarity: 'mythic', desc: '30 dias consecutivos', check: u => (u.consecutiveDays || 1) >= 30 },
    { id: 'hall_diamante',        name: 'Hall da Fama Diamante', emoji: '💎',  rarity: 'mythic', desc: 'Publicar 100 obras no Hall', check: u => (u.myPaintings?.filter(p => p.isPublic)?.length || 0) >= 100 },
    { id: 'lenda_kidcanvas',      name: 'Lenda KidCanvas',       emoji: '👑',  rarity: 'mythic', desc: 'Ganhar 1000 estrelas', check: u => getUserStars(u) >= 1000 },
    { id: 'todas_categorias',     name: 'Explorador Total',      emoji: '🌍',  rarity: 'mythic', desc: 'Pintar 10 desenhos diferentes', check: u => (u.myPaintings?.length || 0) >= 100 },
    { id: 'ia_deus',              name: 'Deus da IA',            emoji: '🌌',  rarity: 'mythic', desc: 'Gerar 200 imagens com IA', check: u => (u.myImages?.length || 0) >= 200 },
    { id: 'escritor_lenda',       name: 'Escritor Lendário',     emoji: '📖',  rarity: 'mythic', desc: 'Criar 100 histórias', check: u => (u.myStories?.length || 0) >= 100 },
    { id: 'publicador_lenda',     name: 'Publicador Lendário',   emoji: '🏛️',  rarity: 'mythic', desc: 'Publicar 200 obras', check: u => (u.myPaintings?.filter(p => p.isPublic)?.length || 0) >= 200 },
    { id: '100_dias',             name: 'Cem Dias!',             emoji: '💯',  rarity: 'mythic', desc: '100 dias consecutivos', check: u => (u.consecutiveDays || 1) >= 100 },
    
    // --- COMPARTILHAMENTO ---
    { id: 'primeiro_compartilhamento', name: 'Primeiro Compartilhamento', emoji: '📣', rarity: 'common', desc: 'Compartilhe uma descoberta', check: u => (u.shareCount || 0) >= 1 },
    { id: 'explorador_popular',       name: 'Explorador Popular',       emoji: '🌎', rarity: 'rare',   desc: 'Compartilhe 10 descobertas', check: u => (u.shareCount || 0) >= 10 },
    { id: 'descobridor_famoso',        name: 'Descobridor Famoso',        emoji: '🚀', rarity: 'epic',   desc: 'Compartilhe 25 descobertas', check: u => (u.shareCount || 0) >= 25 },
    { id: 'embaixador_descobertas',    name: 'Embaixador das Descobertas', emoji: '👑', rarity: 'mythic', desc: 'Compartilhe 100 descobertas', check: u => (u.shareCount || 0) >= 100 }
];


// Conta pinturas de uma categoria específica
function countPaintingsByCategory(user, categorySlug) {
    if (!user || !user.myPaintings) return 0;
    return user.myPaintings.filter(p => {
        if (!p.drawingSlug && !p.prompt) return false;
        // Tenta pegar a categoria do slug do desenho original
        const slug = p.drawingSlug || '';
        const parts = slug.split('/');
        if (parts.length >= 2) {
            const folderName = parts[parts.length - 2] || '';
            // O folderName é como "dinossauros", "fantasia" etc.
            // Mapear nomes de pastas para slugs de categorias
            const folderToCat = {
                'dinossauros': 'dinossauros',
                'fantasia': 'fantasia',
                'animais-selvagens': 'animais-selvagens',
                'animais-domesticos': 'animais-domesticos',
                'animais-do-mar': 'animais-do-mar',
                'contos-de-fada': 'contos-de-fada',
                'veiculos': 'veiculos',
                'flores-e-natureza': 'flores-e-natureza',
                'comidas-e-doces': 'comidas-e-doces',
                'personagens': 'personagens',
                'esportes': 'esportes',
                'profissoes': 'profissoes'
            };
            return (folderToCat[folderName] || folderName) === categorySlug;
        }
        return false;
    }).length;
}

// Retorna lista de conquistas desbloqueadas para um usuário
function getUnlockedAchievements(user) {
    if (!user) return [];
    return ACHIEVEMENTS_CATALOG.filter(a => {
        try { return a.check(user); } catch(e) { return false; }
    });
}

// Verifica conquistas e mostra modais para novas
function checkAllAchievements() {
    if (!currentUser) return;
    
    const storageKey = 'achievements_unlocked_' + currentUser.id;
    let previouslyUnlocked = [];
    try {
        previouslyUnlocked = JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch(e) { previouslyUnlocked = []; }
    
    // Primeira execução: salva estado atual sem mostrar modais
    if (!localStorage.getItem(storageKey)) {
        const currentlyUnlocked = getUnlockedAchievements(currentUser).map(a => a.id);
        localStorage.setItem(storageKey, JSON.stringify(currentlyUnlocked));
        updateHeaderAchievementCount();
        return;
    }
    
    const currentlyUnlocked = getUnlockedAchievements(currentUser).map(a => a.id);
    const newlyUnlocked = currentlyUnlocked.filter(id => !previouslyUnlocked.includes(id));
    
    // Salvar estado atualizado
    localStorage.setItem(storageKey, JSON.stringify(currentlyUnlocked));
    // Atualizar contador no header
    updateHeaderAchievementCount();
    
    // Sincronizar com o backend
    const sessionToken = localStorage.getItem('kidcanvas_session_token') || currentUser.token;
    if (sessionToken) {
        fetch('/api/user/update-achievements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': sessionToken
            },
            body: JSON.stringify({ achievements: currentlyUnlocked })
        }).catch(err => console.error('Erro ao sincronizar conquistas', err));
    }
    
    // Mostrar modal para cada novo desbloqueio (com delay entre eles)
    if (newlyUnlocked.length > 0) {
        const queue = newlyUnlocked.map(id => ACHIEVEMENTS_CATALOG.find(a => a.id === id)).filter(Boolean);
        showAchievementUnlockQueue(queue);
    }
}
window.checkAllAchievements = checkAllAchievements;
// Manter compatibilidade com chamadas antigas
window.checkNewAchievements = checkAllAchievements;

// Fila de modais de desbloqueio
function showAchievementUnlockQueue(queue) {
    if (queue.length === 0) return;
    const achievement = queue[0];
    showEpicAchievementModal(achievement, () => {
        if (queue.length > 1) {
            setTimeout(() => showAchievementUnlockQueue(queue.slice(1)), 500);
        }
    });
}

// Modal épico de desbloqueio
function showEpicAchievementModal(achievement, onClose) {
    const rarity = ACHIEVEMENT_RARITIES[achievement.rarity];
    const unlockedCount = getUnlockedAchievements(currentUser).length;
    const totalCount = ACHIEVEMENTS_CATALOG.length;
    const percent = Math.round((unlockedCount / totalCount) * 100);
    
    // Remover modal anterior se existir
    let overlay = document.getElementById('achievement-unlock-overlay');
    if (overlay) overlay.remove();
    
    overlay = document.createElement('div');
    overlay.id = 'achievement-unlock-overlay';
    overlay.className = 'achievement-unlock-overlay';
    
    overlay.innerHTML = `
        <div class="achievement-unlock-card" style="--achievement-color: ${rarity.color}; --achievement-glow: ${rarity.glow};">
            <div class="achievement-unlock-rarity" style="background: ${rarity.color}; color: white;">
                ✨ SELO ${rarity.name.toUpperCase()} DESBLOQUEADO ✨
            </div>
            
            <span class="achievement-unlock-emoji">${achievement.emoji}</span>
            
            <div class="achievement-unlock-name">${achievement.name}</div>
            
            <div class="achievement-unlock-stars">${rarity.stars}</div>
            
            <div class="achievement-unlock-desc">${achievement.desc}</div>
            
            <div class="achievement-unlock-progress">
                <div class="achievement-unlock-progress-text">🏅 Coleção: ${unlockedCount}/${totalCount} selos (${percent}%)</div>
                <div class="achievement-unlock-progress-track">
                    <div class="achievement-unlock-progress-fill" style="width: ${percent}%;"></div>
                </div>
            </div>
            
            <div class="achievement-unlock-actions">
                <button class="achievement-btn-close" onclick="closeEpicAchievementModal()">🎉 Incrível!</button>
                <button class="achievement-btn-share" onclick="shareAchievementWhatsApp('${achievement.name}', '${achievement.emoji}', '${rarity.name}')">
                    <i class="fa-brands fa-whatsapp"></i> Compartilhar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Animar entrada
    requestAnimationFrame(() => {
        overlay.classList.add('open');
    });
    
    // Confetti
    if (typeof confetti === 'function') {
        const colors = {
            common: ['#4CAF50', '#81C784', '#A5D6A7'],
            rare: ['#2196F3', '#64B5F6', '#90CAF9'],
            epic: ['#9C27B0', '#BA68C8', '#CE93D8'],
            legendary: ['#FF9800', '#FFB74D', '#FFCC80'],
            mythic: ['#FFD700', '#FFF176', '#FFEE58', '#FF6F00']
        };
        const duration = achievement.rarity === 'mythic' ? 5000 : 3000;
        const end = Date.now() + duration;
        (function frame() {
            confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: colors[achievement.rarity] || colors.common });
            confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: colors[achievement.rarity] || colors.common });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    }
    
    // Guardar callback
    window._achievementOnClose = onClose;
}
window.showEpicAchievementModal = showEpicAchievementModal;

function closeEpicAchievementModal() {
    const overlay = document.getElementById('achievement-unlock-overlay');
    if (overlay) {
        overlay.classList.remove('open');
        setTimeout(() => overlay.remove(), 400);
    }
    if (window._achievementOnClose) {
        const cb = window._achievementOnClose;
        window._achievementOnClose = null;
        cb();
    }
}
window.closeEpicAchievementModal = closeEpicAchievementModal;

function shareAchievementWhatsApp(name, emoji, rarity) {
    const text = `${emoji} Desbloqueei o selo "${name}" (${rarity}) no KidCanvas! 🏆\n\nVem colecionar conquistas também! 🎨\nhttps://www.kidcanvas.com.br`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
window.shareAchievementWhatsApp = shareAchievementWhatsApp;

// Atualizar contagem no header
function updateHeaderAchievementCount() {
    const el = document.getElementById('header-achievement-count');
    if (!el) return;
    
    if (!currentUser) {
        el.style.display = 'none';
        return;
    }
    
    const count = getUnlockedAchievements(currentUser).length;
    const totalCount = ACHIEVEMENTS_CATALOG.length;
    el.style.display = 'inline-flex';
    el.textContent = `🏆 ${count}/${totalCount}`;
    el.onclick = () => navigate('/conquistas');
}
window.updateHeaderAchievementCount = updateHeaderAchievementCount;

// Renderizar página do Álbum de Conquistas
function renderConquistasView() {
    document.title = "Álbum de Conquistas 🏆 — KidCanvas";
    setMetaDescription("Colecione selos e suba de nível! Veja todas as conquistas disponíveis no KidCanvas.");
    
    const view = document.getElementById('view-conquistas');
    if (!view) return;
    view.style.display = 'block';
    
    if (!currentUser) {
        showToast('Faça login para ver suas conquistas! 🏆', 'info');
        openAuthModal();
        navigate('/');
        return;
    }
    
    const unlocked = getUnlockedAchievements(currentUser);
    const unlockedIds = unlocked.map(a => a.id);
    const totalCount = ACHIEVEMENTS_CATALOG.length;
    const unlockedCount = unlocked.length;
    const percent = Math.round((unlockedCount / totalCount) * 100);
    
    // Atualizar barra de progresso
    const countEl = document.getElementById('conquistas-count');
    const percentEl = document.getElementById('conquistas-percent');
    const fillEl = document.getElementById('conquistas-progress-fill');
    const subtitleEl = document.getElementById('conquistas-subtitle');
    
    if (countEl) countEl.textContent = `🏅 ${unlockedCount}/${totalCount} selos`;
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;
    
    if (subtitleEl) {
        if (percent === 100) subtitleEl.textContent = '🎉 Parabéns! Você completou o álbum!';
        else if (percent >= 75) subtitleEl.textContent = '🔥 Quase lá! Continue colecionando!';
        else if (percent >= 50) subtitleEl.textContent = '⭐ Você já passou da metade!';
        else if (percent >= 25) subtitleEl.textContent = '🌟 Bom começo! Continue pintando!';
        else subtitleEl.textContent = 'Colecione selos e suba de nível!';
    }
    
    // Renderizar grid por raridade
    const albumGrid = document.getElementById('conquistas-album-grid');
    if (!albumGrid) return;
    albumGrid.innerHTML = '';
    
    const rarityOrder = ['common', 'rare', 'epic', 'legendary', 'mythic'];
    
    rarityOrder.forEach(rarityKey => {
        const rarity = ACHIEVEMENT_RARITIES[rarityKey];
        const achievements = ACHIEVEMENTS_CATALOG.filter(a => a.rarity === rarityKey);
        if (achievements.length === 0) return;
        
        const unlockedInRarity = achievements.filter(a => unlockedIds.includes(a.id)).length;
        
        const section = document.createElement('div');
        section.className = 'conquistas-rarity-section';
        
        section.innerHTML = `
            <div class="conquistas-rarity-header">
                <span class="conquistas-rarity-dot" style="background: ${rarity.color}; color: ${rarity.color};"></span>
                <span class="conquistas-rarity-title">${rarity.name}</span>
                <span class="conquistas-rarity-count">${unlockedInRarity}/${achievements.length}</span>
            </div>
            <div class="conquistas-grid" id="conquistas-grid-${rarityKey}"></div>
        `;
        
        albumGrid.appendChild(section);
        
        const grid = document.getElementById(`conquistas-grid-${rarityKey}`);
        
        achievements.forEach(achievement => {
            const isUnlocked = unlockedIds.includes(achievement.id);
            const card = document.createElement('div');
            card.className = `conquista-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.style.setProperty('--achievement-color', rarity.color);
            card.style.setProperty('--achievement-glow', rarity.glow);
            
            if (isUnlocked) {
                card.innerHTML = `
                    <span class="conquista-emoji">${achievement.emoji}</span>
                    <div class="conquista-name">${achievement.name}</div>
                    <div class="conquista-desc">${achievement.desc}</div>
                    <span class="conquista-rarity-badge" style="background: ${rarity.color};">${rarity.name}</span>
                `;
            } else {
                card.innerHTML = `
                    <span class="conquista-lock-icon"><i class="fa-solid fa-lock"></i></span>
                    <span class="conquista-emoji">🔒</span>
                    <div class="conquista-name">${achievement.name}</div>
                    <div class="conquista-desc">${achievement.desc}</div>
                    <span class="conquista-rarity-badge" style="background: #b0a89f;">${rarity.name}</span>
                `;
            }
            
            grid.appendChild(card);
        });
    });
}
window.renderConquistasView = renderConquistasView;

// Manter compatibilidade com o antigo showAchievementModal
function showAchievementModal(badge) {
    // Converter do formato antigo para o novo
    const achievement = ACHIEVEMENTS_CATALOG.find(a => a.name === badge.name);
    if (achievement) {
        showEpicAchievementModal(achievement, () => {});
    }
}
window.showAchievementModal = showAchievementModal;

function closeAchievementModal() {
    closeEpicAchievementModal();
}
window.closeAchievementModal = closeAchievementModal;

async function openPublicProfile(name, userEmail = '') {
    const modal = document.getElementById('publicProfileModal');
    if (!modal) return;

    // Carregar estado de visualização limpo/loading
    const avatarEl = document.getElementById('profile-modal-avatar');
    if (avatarEl) {
        avatarEl.innerHTML = '👤';
        avatarEl.style.fontSize = '3.5rem';
    }
    document.getElementById('profile-modal-name').textContent = name;
    document.getElementById('profile-modal-paintings').textContent = '...';
    const storiesEl = document.getElementById('profile-modal-stories');
    if (storiesEl) storiesEl.textContent = '...';
    
    const aiImagesEl = document.getElementById('profile-modal-ai-images');
    if (aiImagesEl) aiImagesEl.textContent = '...';
    
    document.getElementById('profile-modal-badges').textContent = '...';
    document.getElementById('profile-modal-badges-grid').innerHTML = '<div style="text-align:center; padding: 20px; font-weight: bold; color: var(--color-dark-light);"><i class="fa-solid fa-spinner fa-spin"></i> Carregando conquistas...</div>';

    modal.classList.add('open');

    try {
        const url = `/api/user/public-profile?name=${encodeURIComponent(name)}&userEmail=${encodeURIComponent(userEmail)}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success && data.profile) {
            const profile = data.profile;
            const modalWrapper = document.getElementById('profile-modal-avatar-wrapper');
            if (modalWrapper) {
                modalWrapper.className = 'avatar-wrapper';
                modalWrapper.style.border = '';
                modalWrapper.style.boxShadow = '';
                modalWrapper.style.animation = '';
            }

            if (avatarEl) {
                avatarEl.style.width = '100%';
                avatarEl.style.height = '100%';
                avatarEl.style.display = 'flex';
                avatarEl.style.alignItems = 'center';
                avatarEl.style.justifyContent = 'center';

                const avatarVal = profile.avatar || 'avatar_default_1';
                const defaultEmojis = {
                    'avatar_default_1': '👦',
                    'avatar_default_2': '👧',
                    'avatar_default_3': '👦🏽',
                    'avatar_default_4': '👧🏽',
                    '👦': '👦',
                    '👧': '👧',
                    '👦🏽': '👦🏽',
                    '👧🏽': '👧🏽'
                };
                
                const card = (window.globalCatalog || []).find(c => c.id === avatarVal);
                if (card) {
                    const rarity = card.rarity || 'Comum';
                    const rarityLower = rarity.toLowerCase().replace('á', 'a').replace('é', 'e').replace('o', 'a');
                    const borderClass = `rarity-border-${rarityLower}`;
                    if (modalWrapper) modalWrapper.classList.add(borderClass);
                    
                    avatarEl.innerHTML = `<img src="${card.imageUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                    avatarEl.style.fontSize = '';
                } else {
                    if (modalWrapper) {
                        const planName = profile.plan || 'Aprendiz';
                        if (planName === 'Aprendiz' || planName === 'Grátis') {
                            modalWrapper.classList.add('plan-aprendiz');
                        } else if (planName === 'Artista') {
                            modalWrapper.classList.add('plan-artista');
                        } else if (planName === 'Mago Criador' || planName === 'Professor' || planName === 'Premium') {
                            modalWrapper.classList.add('plan-mago');
                        } else if (planName === 'Lenda KidCanvas' || planName === 'Colégio' || planName === 'Ultra' || planName === 'Lenda') {
                            modalWrapper.classList.add('plan-lenda');
                        } else {
                            modalWrapper.classList.add('plan-aprendiz');
                        }
                    }
                    
                    const emojiValue = defaultEmojis[avatarVal] || '👦';
                    const isUrl = avatarVal.startsWith('http') || avatarVal.startsWith('/');
                    if (isUrl) {
                        avatarEl.innerHTML = `<img src="${avatarVal}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                        avatarEl.style.fontSize = '';
                    } else {
                        avatarEl.innerHTML = emojiValue;
                        avatarEl.style.fontSize = '3.5rem';
                    }
                }
            }

            // Atualizar Badge de Plano do Perfil Público
            const modalPlanBadge = document.getElementById('profile-modal-plan-badge');
            if (modalPlanBadge) {
                const planName = profile.plan || 'Aprendiz';
                modalPlanBadge.textContent = planName;
                if (planName === 'Aprendiz' || planName === 'Grátis') {
                    modalPlanBadge.style.backgroundColor = 'var(--color-green)';
                    modalPlanBadge.textContent = '🌱 APRENDIZ';
                } else if (planName === 'Artista') {
                    modalPlanBadge.style.backgroundColor = 'var(--color-purple)';
                    modalPlanBadge.textContent = '🎨 ARTISTA';
                } else if (planName === 'Mago Criador' || planName === 'Professor' || planName === 'Premium') {
                    modalPlanBadge.style.backgroundColor = 'var(--color-blue)';
                    modalPlanBadge.textContent = '🧙 MAGO CRIADOR';
                } else if (planName === 'Lenda KidCanvas' || planName === 'Colégio' || planName === 'Ultra' || planName === 'Lenda') {
                    modalPlanBadge.style.backgroundColor = 'var(--color-yellow)';
                    modalPlanBadge.textContent = '👑 LENDA';
                } else {
                    modalPlanBadge.style.backgroundColor = 'var(--color-dark-light)';
                    modalPlanBadge.textContent = planName.toUpperCase();
                }
            }

            // Renderizar Selos em Destaque do Perfil Público
            const featuredContainer = document.getElementById('profile-modal-featured-container');
            const featuredBadgesGrid = document.getElementById('profile-modal-featured-badges');
            if (featuredBadgesGrid) {
                featuredBadgesGrid.innerHTML = '';
                const featured = profile.featuredCards || [null, null, null];
                const hasFeatured = featured.some(id => id !== null);
                
                if (hasFeatured) {
                    if (featuredContainer) featuredContainer.style.display = 'block';
                    featured.forEach(cardId => {
                        if (cardId) {
                            const badge = ACHIEVEMENTS_CATALOG.find(a => a.id === cardId);
                            if (badge) {
                                featuredBadgesGrid.innerHTML += `
                                    <div style="width: 70px; height: 70px; border: 2.5px solid var(--color-purple); border-radius: var(--radius-sm); display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fffdf5; box-shadow: var(--shadow-button-secondary);" title="${badge.name}: ${badge.desc}">
                                        <span style="font-size: 1.8rem;">${badge.emoji}</span>
                                        <span style="font-size: 0.6rem; font-weight: 800; color: var(--color-dark); text-align: center; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px;">${badge.name}</span>
                                    </div>
                                `;
                            } else {
                                featuredBadgesGrid.innerHTML += `
                                    <div style="width: 70px; height: 70px; border: 2px dashed #ccc; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; background: #fafafa;">
                                        <span style="font-size: 1.2rem; color: #bbb;">🔒</span>
                                    </div>
                                `;
                            }
                        } else {
                            featuredBadgesGrid.innerHTML += `
                                <div style="width: 70px; height: 70px; border: 2px dashed #ccc; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; background: #fafafa;">
                                    <span style="font-size: 1.2rem; color: #bbb;">-</span>
                                </div>
                            `;
                        }
                    });
                } else {
                    if (featuredContainer) featuredContainer.style.display = 'none';
                }
            }

            document.getElementById('profile-modal-name').textContent = profile.name;
            document.getElementById('profile-modal-paintings').textContent = profile.paintingsCount;
            
            if (storiesEl) storiesEl.textContent = profile.storiesCount;
            if (aiImagesEl) aiImagesEl.textContent = profile.aiImagesCount;
            
            // Atualizar Nível do Usuário com Barra de Progresso
            const stars = profile.stars || 0;
            const userLevel = getUserLevel(stars);
            
            let nextLevel = null;
            const levelIndex = USER_LEVELS.findIndex(l => l.name === userLevel.name);
            if (levelIndex >= 0 && levelIndex < USER_LEVELS.length - 1) {
                nextLevel = USER_LEVELS[levelIndex + 1];
            }

            const levelIcon = document.getElementById('profile-modal-level-icon');
            const levelName = document.getElementById('profile-modal-level-name');
            const progressText = document.getElementById('profile-modal-level-progress-text');
            const progressBar = document.getElementById('profile-modal-level-progress-bar');
            const levelHint = document.getElementById('profile-modal-level-hint');
            
            if (levelIcon && levelName) {
                levelIcon.textContent = userLevel.icon;
                levelName.textContent = userLevel.name;
                levelName.style.color = userLevel.color;
            }
            
            if (nextLevel) {
                const prevStars = userLevel.minStars;
                const nextStars = nextLevel.minStars;
                const starsInLevel = stars - prevStars;
                const starsRequired = nextStars - prevStars;
                const percent = Math.min(100, Math.max(0, Math.floor((starsInLevel / starsRequired) * 100)));
                
                if (progressText) progressText.textContent = `${stars}/${nextStars} ⭐`;
                if (progressBar) {
                    progressBar.style.width = `${percent}%`;
                    progressBar.style.backgroundColor = userLevel.color;
                }
                if (levelHint) {
                    levelHint.textContent = `Faltam ${nextStars - stars} estrelas para virar ${nextLevel.name}!`;
                    levelHint.style.display = 'block';
                }
            } else {
                if (progressText) progressText.textContent = `${stars} ⭐`;
                if (progressBar) {
                    progressBar.style.width = `100%`;
                    progressBar.style.backgroundColor = userLevel.color;
                }
                if (levelHint) {
                    levelHint.textContent = `Nível Máximo Alcançado! 🎉`;
                    levelHint.style.display = 'block';
                }
            }

            // Renderizar grade de conquistas/selos — usa ACHIEVEMENTS_CATALOG
            const unlockedIds = profile.unlockedAchievements || [];

            const list = ACHIEVEMENTS_CATALOG.map(badge => {
                const isUnlocked = unlockedIds.includes(badge.id);
                return {
                    title: badge.name,
                    desc: badge.desc,
                    emoji: badge.emoji,
                    rarity: ACHIEVEMENT_RARITIES[badge.rarity],
                    isUnlocked: isUnlocked
                };
            });

            let unlockedCount = list.filter(i => i.isUnlocked).length;
            
            document.getElementById('profile-modal-badges').textContent = `${unlockedCount}/${list.length}`;
            
            // Ordenar para mostrar as desbloqueadas primeiro
            list.sort((a, b) => {
                if (a.isUnlocked && !b.isUnlocked) return -1;
                if (!a.isUnlocked && b.isUnlocked) return 1;
                return 0;
            });

            const gridHtml = list.map(item => {
                const opacity = item.isUnlocked ? '1' : '0.4';
                const filter = item.isUnlocked ? 'none' : 'grayscale(1)';
                const bg = item.isUnlocked ? '#fffde7' : '#fafafa';
                const borderColor = item.isUnlocked ? item.rarity.color : '#e0e0e0';
                const titleColor = item.isUnlocked ? item.rarity.color : '#757575';
                const descColor = item.isUnlocked ? 'var(--color-dark-light)' : '#9e9e9e';

                return `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: 2px solid ${borderColor}; border-radius: var(--radius-sm); background: ${bg}; opacity: ${opacity}; filter: ${filter}; transition: all 0.2s ease;">
                        <span style="font-size: 2.2rem; min-width: 40px; text-align: center;">${item.emoji}</span>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-weight: 800; font-size: 0.95rem; color: ${titleColor};">${item.title}</span>
                            <span style="font-size: 0.8rem; color: ${descColor}; font-weight: 500;">${item.desc}</span>
                        </div>
                        <span style="margin-left: auto; font-size: 0.85rem; font-weight: 800; color: ${item.isUnlocked ? '#2e7d32' : '#9e9e9e'};">
                            ${item.isUnlocked ? '✅ Conquistado' : '🔒'}
                        </span>
                    </div>
                `;
            }).join('');
            
            document.getElementById('profile-modal-badges').textContent = `${unlockedCount}/${unlockableBadges.length}`;
            document.getElementById('profile-modal-badges-grid').innerHTML = gridHtml;
        } else {
            showToast('Erro ao carregar dados do perfil.', 'error');
            closePublicProfileModal();
        }
    } catch(err) {
        console.error(err);
        showToast('Erro ao buscar dados no servidor.', 'error');
        closePublicProfileModal();
    }
}
window.openPublicProfile = openPublicProfile;

function closePublicProfileModal() {
    const modal = document.getElementById('publicProfileModal');
    if (modal) modal.classList.remove('open');
}
window.closePublicProfileModal = closePublicProfileModal;

async function viewPublicStory(url) {
    const viewerModal = document.getElementById('viewerModal');
    const viewerContent = document.getElementById('viewerContent');
    const viewerModalTitle = document.getElementById('viewerModalTitle');
    
    if (!viewerModal || !viewerContent || !viewerModalTitle) return;

    viewerContent.innerHTML = '<div style="text-align:center; padding: 40px; font-weight: bold; color: var(--color-dark-light);"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>Carregando a história mágica...</div>';
    viewerModalTitle.textContent = 'Carregando...';
    viewerModal.classList.add('open');

    let matchedStory = null;
    try {
        const response = await fetch('/api/paintings/public');
        const result = await response.json();
        if (result.success && result.paintings) {
            const painting = result.paintings.find(p => p.url === url);
            if (painting && painting.storyData) {
                matchedStory = painting.storyData;
            }
        }
    } catch(err) {
        console.error('Erro ao buscar detalhes da história:', err);
    }

    if (!matchedStory) {
        showToast('Não foi possível carregar o conteúdo desta história.', 'error');
        viewerModal.classList.remove('open');
        return;
    }

    viewerModalTitle.textContent = `📖 ${matchedStory.title}`;
    
    let html = `
        <div class="cover-page-card" style="margin-top: 10px;">
            <div class="cover-header">
                <h2 class="cover-title">${matchedStory.title}</h2>
                <div class="cover-subtitle">Uma história incrível criada no KidCanvas</div>
            </div>
            <div class="cover-art-frame">
                <img src="${matchedStory.coverUrl || matchedStory.imageUrl || url}" alt="Capa da História Mágica">
            </div>
        </div>
    `;

    (matchedStory.paragraphs || []).forEach((page, idx) => {
        html += `
            <div class="story-page" style="margin-top: 20px;">
                <div class="page-grid">
                    <div class="page-text">
                        <span class="page-number">Página ${idx + 1}</span>
                        <p>${page.text}</p>
                    </div>
                    <div class="page-art">
                        <div class="art-frame">
                            <img src="${page.imageUrl}" alt="Ilustração da Página ${idx + 1}">
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
        <div style="margin-top: 30px; display: flex; gap: 10px; justify-content: center; width: 100%;">
            <button class="btn btn-secondary" id="btnDownloadPublicPDF" style="background-color: var(--color-blue); color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: var(--radius-sm); cursor: pointer;"><i class="fa-solid fa-file-pdf"></i> Baixar PDF</button>
            <button class="btn btn-secondary" id="btnPrintPublicBook" style="background-color: var(--color-green); color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: var(--radius-sm); cursor: pointer;"><i class="fa-solid fa-print"></i> Imprimir</button>
        </div>
    `;

    viewerContent.innerHTML = html;

    const btnDownload = document.getElementById('btnDownloadPublicPDF');
    if (btnDownload) {
        btnDownload.onclick = () => {
            if (!currentUser) {
                showToast('Faça login ou crie uma conta grátis para baixar histórias em PDF! 📚', 'info');
                openAuthModal();
                return;
            }
            generatePDFFromData(matchedStory.title, matchedStory.coverUrl || matchedStory.imageUrl || url, matchedStory.paragraphs, 'btnDownloadPublicPDF');
        };
    }
    
    const btnPrint = document.getElementById('btnPrintPublicBook');
    if (btnPrint) {
        btnPrint.onclick = () => {
            if (!currentUser) {
                showToast('Faça login ou crie uma conta grátis para imprimir histórias! 📚', 'info');
                openAuthModal();
                return;
            }
            const printWindow = window.open('', '_blank');
            let printHtml = `
                <html>
                <head>
                    <title>${matchedStory.title} — KidCanvas</title>
                    <style>
                        body { font-family: 'Quicksand', 'Nunito', sans-serif; margin: 20px; background: white; }
                        h1 { text-align: center; color: #7B4FA6; }
                        .cover { text-align: center; page-break-after: always; margin-bottom: 50px; }
                        .cover img { max-width: 80%; border-radius: 12px; }
                        .page { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; page-break-inside: avoid; }
                        .page img { max-width: 60%; border-radius: 12px; margin-bottom: 20px; }
                        .text { font-size: 1.25rem; line-height: 1.6; text-align: justify; max-width: 700px; }
                        @media print {
                            body { margin: 0; }
                            .page { margin-bottom: 0; page-break-after: always; }
                        }
                    </style>
                </head>
                <body>
                    <div class="cover">
                        <h1>${matchedStory.title}</h1>
                        <img src="${matchedStory.coverUrl || matchedStory.imageUrl || url}">
                    </div>
            `;

            (matchedStory.paragraphs || []).forEach((p, idx) => {
                printHtml += `
                    <div class="page">
                        <img src="${p.imageUrl}">
                        <div class="text"><strong>Página ${idx + 1}:</strong> ${p.text}</div>
                    </div>
                `;
            });

            printHtml += `
                </body>
                </html>
            `;
            printWindow.document.write(printHtml);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.print();
                printWindow.close();
            };
        };
    }
}
window.viewPublicStory = viewPublicStory;

async function shareStoryToHall() {
    if (!currentUser) {
        showToast('Faça login ou crie uma conta grátis para compartilhar sua história no Hall da Fama! 🧙‍♂️', 'info');
        openAuthModal();
        return;
    }
    
    if (typeof generatedCoverUrl === 'undefined' || typeof generatedParagraphs === 'undefined' || !generatedCoverUrl || !generatedParagraphs || generatedParagraphs.length === 0) {
        showToast('Nenhuma história gerada para compartilhar.', 'error');
        return;
    }

    const coverTitleEl = document.getElementById('coverTitle');
    const title = coverTitleEl ? coverTitleEl.textContent : 'O Livro Mágico';
    const firstLines = generatedParagraphs[0].text;
    
    let creatorName = prompt('Qual o nome ou apelido do pequeno autor que criou esta história?', currentUser.name || currentUser.email.split('@')[0]);
    if (creatorName === null) {
        return;
    }
    creatorName = creatorName.trim() || currentUser.name || currentUser.email.split('@')[0];

    showToast('Compartilhando sua história no Hall... ⏳', 'info');

    try {
        const sessionToken = localStorage.getItem('kidcanvas_session_token') || currentUser.token;
        const response = await fetch('/api/user/save-painting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': sessionToken
            },
            body: JSON.stringify({
                imageUrl: generatedCoverUrl,
                prompt: title,
                isPublic: true,
                category: 'Histórias Mágicas',
                creatorName: creatorName,
                firstLines: firstLines,
                storyData: {
                    title: title,
                    coverUrl: generatedCoverUrl,
                    paragraphs: generatedParagraphs
                }
            })
        });

        const resData = await response.json();
        if (response.ok && resData.success) {
            showToast('Sua história foi enviada para o Hall da Fama! Ela passará por moderação antes de aparecer. 🎉', 'success');
        } else {
            showToast(resData.message || 'Erro ao compartilhar história.', 'error');
            if (resData.limitExceeded) {
                openCreditsModal(resData.message || 'Você atingiu o limite do seu plano. Faça upgrade para salvar mais!', 'Limite do Plano Atingido! 🚀');
            }
        }
    } catch (err) {
        console.error(err);
        showToast('Erro ao enviar história para o servidor.', 'error');
    }
}
window.shareStoryToHall = shareStoryToHall;

// Funções do Modal de Escolha de Avatar
function openAvatarSelectionModal() {
    const modal = document.getElementById('avatarSelectionModal');
    if (!modal) return;
    
    // Obter o modal box para podermos alterar seu conteúdo de forma dinâmica e premium
    const modalBox = modal.querySelector('.modal-box');
    if (!modalBox) return;
    
    // Obter todos os cards do catálogo e cards desbloqueados do usuário
    const catalog = window.globalCatalog || [];
    const userCards = currentUser ? (currentUser.cards || []) : [];
    
    // Filtrar IDs dos cards que o usuário possui
    const unlockedCardIds = userCards.map(uc => {
        if (!uc) return '';
        if (typeof uc === 'string') return uc;
        return uc.id || uc.value || '';
    }).filter(Boolean);
    
    // Contagem geral
    const unlockedCatalogCards = catalog.filter(c => unlockedCardIds.includes(c.id));
    const ownedCount = unlockedCatalogCards.length;
    const totalCount = catalog.length > 0 ? catalog.length : 165;
    const percent = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;
    
    // Avatares Padrão (Menino, Menina e Morenos)
    const defaults = [
        { id: 'avatar_default_1', emoji: '👦', label: 'Menino' },
        { id: 'avatar_default_2', emoji: '👧', label: 'Menina' },
        { id: 'avatar_default_3', emoji: '👦🏽', label: 'Menino Moreno' },
        { id: 'avatar_default_4', emoji: '👧🏽', label: 'Menina Morena' }
    ];
    
    // Mapeamento bidirecional para compatibilidade de emojis legados no banco
    const oldEmojiToId = {
        '👦': 'avatar_default_1',
        '👧': 'avatar_default_2',
        '👦🏽': 'avatar_default_3',
        '👧🏽': 'avatar_default_4'
    };
    
    const currentAvatar = currentUser ? currentUser.avatar : 'avatar_default_1';
    const resolvedAvatarId = oldEmojiToId[currentAvatar] || currentAvatar;
    
    // Construir lista linear de itens pré-visualizáveis (Padrão + Desbloqueados)
    const previewItems = [
        ...defaults.map(item => ({
            type: 'default',
            id: item.id,
            name: item.label,
            rarity: 'Comum'
        })),
        ...unlockedCatalogCards.map(card => ({
            type: 'card',
            id: card.id,
            name: card.name,
            imageUrl: card.imageUrl,
            rarity: card.rarity
        }))
    ];
    
    // Configurar estado no escopo global/window
    window.avatarPreviewItems = previewItems;
    let currentIdx = previewItems.findIndex(item => item.id === resolvedAvatarId);
    if (currentIdx === -1) currentIdx = 0;
    window.currentPreviewIndex = currentIdx;
    
    const defaultsHtml = `
        <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
            ${defaults.map(item => {
                const isSelected = resolvedAvatarId === item.id;
                const borderStyle = isSelected 
                    ? 'border: 3px solid var(--color-purple); background: #f3effa; box-shadow: 0 0 0 2px var(--color-purple);' 
                    : 'border: var(--border-thin); background: white;';
                
                return `
                    <button onclick="previewDefaultAvatar('${item.id}'); return false;" style="font-size: 2.2rem; padding: 10px; border-radius: 50%; width: 66px; height: 66px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.15s ease, background-color 0.15s ease; ${borderStyle}" class="hover-bounce" title="${item.label}">
                        ${item.emoji}
                    </button>
                `;
            }).join('')}
        </div>
    `;
    
    // Grid de todos os cards do catálogo (somente desbloqueados)
    let cardsContentHtml = '';
    if (unlockedCatalogCards.length > 0) {
        cardsContentHtml = `
            <div class="avatar-picker-scroll-container" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; padding: 10px; max-height: 380px; overflow-y: auto; background: #fafafa; border: var(--border-thin); border-radius: var(--radius-sm); margin-bottom: 20px;">
                ${unlockedCatalogCards.map(card => {
                    const isSelected = resolvedAvatarId === card.id;
                    const rarityLower = card.rarity.toLowerCase().replace('á', 'a').replace('é', 'e').replace('o', 'a');
                    const borderClass = `rarity-border-${rarityLower}`;
                    const selectedClass = isSelected ? 'selected-avatar' : '';
                    
                    return `
                        <button class="avatar-option-card-btn ${borderClass} ${selectedClass}" onclick="previewUnlockedCard('${card.id}'); return false;" title="${card.name} (${card.rarity})" style="aspect-ratio: 1; border-radius: 50%; overflow: visible; display: inline-flex; align-items: center; justify-content: center; position: relative;">
                            <img src="${card.imageUrl}" alt="${card.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                            ${isSelected ? `<div style="position: absolute; top: -6px; right: -6px; background: var(--color-green); color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-check"></i></div>` : ''}
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    } else {
        cardsContentHtml = `
            <div style="padding: 20px; text-align: center; background: #fafafa; border: 2px dashed rgba(0,0,0,0.1); border-radius: var(--radius-sm); margin-bottom: 20px;">
                <span style="font-size: 2.2rem; display: block; margin-bottom: 10px;">📖</span>
                <p style="font-size: 0.95rem; color: var(--color-dark-light); line-height: 1.4; margin: 0 0 12px 0; font-weight: bold;">
                    Desbloqueie cards no Livro das Descobertas para usar como avatar!
                </p>
                <button class="btn btn-primary btn-sm" onclick="closeAvatarSelectionModal(); openAlbumModal(); return false;" style="font-size: 0.8rem; padding: 6px 14px; font-weight: bold; border-radius: var(--radius-sm); box-shadow: var(--shadow-button-primary);">
                    🎨 Ir para o Livro
                </button>
            </div>
        `;
    }
    
    // Substituir o conteúdo do modal box dinamicamente com o novo layout de progressão
    modalBox.innerHTML = `
        <button class="btn-close-modal" onclick="closeAvatarSelectionModal()">&times;</button>
        
        <!-- Área de Pré-Visualização Dinâmica no Topo -->
        <div id="avatar-selection-preview-area" style="background: #fffdf5; border: var(--border-medium); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px; text-align: center; box-shadow: var(--shadow-cartoon); position: relative;">
            <!-- Preenchido dinamicamente por updateAvatarPreviewUI -->
        </div>

        <h3 style="font-family: var(--font-heading); font-size: 1.6rem; color: var(--color-purple); margin-bottom: 8px;">Escolha seu Avatar</h3>
        <p style="font-size: 0.92rem; color: var(--color-dark-light); line-height: 1.4; margin-bottom: 20px;">
            Selecione um card fofo desbloqueado ou um personagem padrão para o seu perfil!
        </p>
        
        <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: var(--color-dark); margin-bottom: 12px; text-align: left; border-bottom: 1px dashed rgba(0,0,0,0.1); padding-bottom: 4px;">👤 Avatares Padrão</h4>
        ${defaultsHtml}
        
        <div style="text-align: left; margin-bottom: 15px; background: white; padding: 12px; border: var(--border-thin); border-radius: var(--radius-sm);">
            <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: var(--color-dark); margin: 0 0 4px 0; display: flex; align-items: center; gap: 6px;">
                <span>🃏</span> Coleção de Descobertas
            </h4>
            <div style="font-size: 0.82rem; font-weight: bold; color: var(--color-dark-light); display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>${ownedCount} / ${totalCount} descobertas desbloqueadas</span>
                <span>${percent}%</span>
            </div>
            <div style="width: 100%; height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; border: 1px solid rgba(0,0,0,0.05);">
                <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #ff7675, #fdcb6e, #55efc4, #74b9ff, #a29bfe); border-radius: 6px;"></div>
            </div>
        </div>
        
        ${cardsContentHtml}
    `;
    
    // Atualizar visualização do topo
    window.updateAvatarPreviewUI();
    
    modal.style.display = 'flex';
}

window.updateAvatarPreviewUI = function() {
    const previewContainer = document.getElementById('avatar-selection-preview-area');
    if (!previewContainer) return;
    
    const items = window.avatarPreviewItems || [];
    const idx = window.currentPreviewIndex || 0;
    const item = items[idx];
    if (!item) return;
    
    const rarityColors = {
        'Comum': '#2ecc71',
        'Rara': '#3498db',
        'Raro': '#3498db',
        'Épica': '#9b59b6',
        'Épico': '#9b59b6',
        'Lendária': '#e67e22',
        'Lendário': '#e67e22',
        'Mítica': '#e74c3c',
        'Mítico': '#e74c3c'
    };
    const badgeColor = rarityColors[item.rarity] || '#cbd5e1';
    
    let contentHtml = '';
    const defaultEmojis = {
        'avatar_default_1': '👦',
        'avatar_default_2': '👧',
        'avatar_default_3': '👦🏽',
        'avatar_default_4': '👧🏽',
        '👦': '👦',
        '👧': '👧',
        '👦🏽': '👦🏽',
        '👧🏽': '👧🏽'
    };
    
    if (item.type === 'default') {
        const emojiVal = defaultEmojis[item.id] || '👦';
        contentHtml = `
            <div style="font-size: 4rem; width: 100px; height: 100px; border-radius: 50%; border: 3px solid #cbd5e1; background: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
                ${emojiVal}
            </div>
            <h4 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--color-dark); margin: 0 0 4px 0;">${item.name}</h4>
            <div style="margin-bottom: 12px;">
                <span style="font-size: 0.75rem; padding: 3px 12px; border-radius: 20px; color: white; font-weight: 800; background-color: #2ecc71; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
                    🟢 Padrão
                </span>
            </div>
        `;
    } else {
        const rarityLower = item.rarity.toLowerCase().replace('á', 'a').replace('é', 'e').replace('o', 'a');
        const borderClass = `rarity-border-${rarityLower}`;
        
        let bullet = '🟢';
        if (item.rarity === 'Rara' || item.rarity === 'Raro') bullet = '🔵';
        else if (item.rarity === 'Épica' || item.rarity === 'Épico') bullet = '🟣';
        else if (item.rarity === 'Lendária' || item.rarity === 'Lendário') bullet = '🟠';
        else if (item.rarity === 'Mítica' || item.rarity === 'Mítico') bullet = '🔴';
        
        contentHtml = `
            <div class="${borderClass}" style="position: relative; width: 100px; height: 100px; margin: 0 auto 10px auto; border-radius: 50%; overflow: visible; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <img src="${item.imageUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
            </div>
            <h4 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--color-dark); margin: 0 0 4px 0;">${item.name}</h4>
            <div style="margin-bottom: 12px;">
                <span style="font-size: 0.75rem; padding: 3px 12px; border-radius: 20px; color: white; font-weight: 800; background-color: ${badgeColor}; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${bullet} ${item.rarity}
                </span>
            </div>
        `;
    }
    
    // Botão de equipar
    const currentAvatar = currentUser ? currentUser.avatar : 'avatar_default_1';
    const isCurrentlyEquipped = currentAvatar === item.id || (defaultEmojis[currentAvatar] && defaultEmojis[currentAvatar] === defaultEmojis[item.id]);
    
    const buttonHtml = isCurrentlyEquipped
        ? `
            <button disabled class="btn btn-secondary" style="font-size: 1rem; padding: 10px 24px; width: 100%; border-radius: var(--radius-sm); font-weight: bold; background: #e2e8f0; color: #94a3b8; border: none; cursor: not-allowed; display: flex; align-items: center; justify-content: center; gap: 8px;">
                ✅ Ativo no Perfil
            </button>
        `
        : `
            <button onclick="equipPreviewItem(); return false;" class="btn btn-primary" style="font-size: 1rem; padding: 10px 24px; width: 100%; border-radius: var(--radius-sm); font-weight: bold; box-shadow: var(--shadow-button-primary); display: flex; align-items: center; justify-content: center; gap: 8px;">
                🃏 Equipar no Perfil
            </button>
        `;
        
    previewContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 12px; width: 100%;">
            <button onclick="navigatePreview(-1); return false;" class="hover-bounce" style="width: 46px; height: 46px; border-radius: 50%; border: var(--border-medium); background: var(--color-purple); color: white; display: inline-flex; align-items: center; justify-content: center; font-size: 1.25rem; cursor: pointer; box-shadow: var(--shadow-button-primary); transition: transform 0.15s ease;" title="Anterior">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <div style="text-align: center; flex: 1; min-width: 160px;">
                ${contentHtml}
            </div>
            <button onclick="navigatePreview(1); return false;" class="hover-bounce" style="width: 46px; height: 46px; border-radius: 50%; border: var(--border-medium); background: var(--color-purple); color: white; display: inline-flex; align-items: center; justify-content: center; font-size: 1.25rem; cursor: pointer; box-shadow: var(--shadow-button-primary); transition: transform 0.15s ease;" title="Próximo">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
        
        ${buttonHtml}
    `;
};

window.navigatePreview = function(direction) {
    const items = window.avatarPreviewItems || [];
    if (items.length === 0) return;
    
    let idx = window.currentPreviewIndex || 0;
    idx = (idx + direction + items.length) % items.length;
    window.currentPreviewIndex = idx;
    
    window.updateAvatarPreviewUI();
};

window.previewDefaultAvatar = function(id) {
    const items = window.avatarPreviewItems || [];
    const idx = items.findIndex(item => item.id === id);
    if (idx !== -1) {
        window.currentPreviewIndex = idx;
        window.updateAvatarPreviewUI();
    }
};

window.previewUnlockedCard = function(cardId) {
    const items = window.avatarPreviewItems || [];
    const idx = items.findIndex(item => item.id === cardId);
    if (idx !== -1) {
        window.currentPreviewIndex = idx;
        window.updateAvatarPreviewUI();
    }
};

window.equipPreviewItem = function() {
    const items = window.avatarPreviewItems || [];
    const idx = window.currentPreviewIndex || 0;
    const item = items[idx];
    if (!item) return;
    
    selectAvatar(item.id);
};

window.showLockedCardDetailsById = function(cardId) {
    const catalog = window.globalCatalog || [];
    const card = catalog.find(c => c.id === cardId);
    if (!card) return;
    
    const rarityLower = card.rarity.toLowerCase().replace('á', 'a').replace('é', 'e');
    
    const rarityColors = {
        'Comum': '#2ecc71',
        'Raro': '#3498db',
        'Épico': '#9b59b6',
        'Lendário': '#e67e22',
        'Mítico': '#e74c3c'
    };
    const badgeColor = rarityColors[card.rarity] || '#7f8c8d';
    
    // Obter progresso atual usando a função global
    let current = 0;
    let target = 0;
    let percent = 0;
    if (typeof window.getDiscoveryProgress === 'function') {
        const progress = window.getDiscoveryProgress(card);
        if (progress) {
            current = progress.current || 0;
            target = progress.target || 0;
            percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
        }
    }
    
    // Fallback de cálculo se necessário
    if (target === 0 && card.unlockCondition) {
        target = card.unlockCondition.count || 1;
        if (currentUser) {
            const condType = card.unlockCondition.type || '';
            if (condType === 'paint_count') {
                current = (currentUser.savedDrawings || []).length || 0;
            } else if (condType === 'ai_count') {
                current = (currentUser.aiDrawings || []).length || 0;
            } else if (condType === 'free_count') {
                current = (currentUser.freeDrawings || []).length || 0;
            }
        }
        percent = Math.min(100, Math.round((current / target) * 100));
    }
    
    let progressHtml = '';
    if (target > 0) {
        progressHtml = `
            <div style="margin-top: 15px; text-align: left; background: rgba(0,0,0,0.02); padding: 12px; border-radius: 12px; border: 1px dashed rgba(0,0,0,0.08);">
                <div style="font-size: 0.8rem; font-weight: bold; color: var(--color-dark-light); display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Progresso Atual:</span>
                    <span>${current} / ${target}</span>
                </div>
                <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${percent}%; height: 100%; background: var(--color-purple); border-radius: 4px;"></div>
                </div>
            </div>
        `;
    }
    
    // Criar overlay modal de detalhes temporário
    const overlay = document.createElement('div');
    overlay.id = 'locked-avatar-card-details-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '10000';
    overlay.style.animation = 'fadeIn 0.2s ease-out';
    
    const box = document.createElement('div');
    box.className = 'modal-box';
    box.style.maxWidth = '360px';
    box.style.width = '90%';
    box.style.padding = '25px';
    box.style.backgroundColor = '#fffdf5';
    box.style.border = 'var(--border-medium)';
    box.style.borderRadius = 'var(--radius-md)';
    box.style.boxShadow = 'var(--shadow-cartoon)';
    box.style.textAlign = 'center';
    box.style.position = 'relative';
    
    const borderClass = `rarity-border-${rarityLower}`;
    const imgHtml = `
        <div class="${borderClass}" style="position: relative; width: 100px; height: 100px; margin: 0 auto 15px auto; border-radius: 50%; overflow: visible; display: flex; align-items: center; justify-content: center;">
            <img src="${card.imageUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; filter: blur(8px) grayscale(1) brightness(0.35);">
            <div style="position: absolute; font-size: 2rem; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5);"><i class="fa-solid fa-lock"></i></div>
        </div>
    `;
    
    box.innerHTML = `
        <button class="btn-close-modal" onclick="document.getElementById('locked-avatar-card-details-overlay').remove()">&times;</button>
        ${imgHtml}
        <h3 style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--color-dark); margin-bottom: 6px;">Descoberta Misteriosa</h3>
        <div style="margin-bottom: 12px;">
            <span class="rarity-badge-mini" style="font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; color: white; font-weight: 800; text-transform: uppercase; background-color: ${badgeColor}; display: inline-block; letter-spacing: 0.5px;">
                ${card.rarity}
            </span>
        </div>
        
        <div style="margin-top: 15px; padding: 12px; background: #fff8e1; border: 1px solid #ffe082; border-radius: 10px; text-align: left;">
            <div style="font-weight: 900; color: #ff8f00; font-size: 0.75rem; margin-bottom: 4px; letter-spacing: 0.5px;">🤔 COMO DESBLOQUEAR</div>
            <div style="font-weight: 800; color: #5d4037; font-size: 0.9rem; line-height: 1.3;">${card.unlockHint || 'Pinte e salve desenhos para desbloquear!'}</div>
        </div>
        
        <div style="margin-top: 12px; padding: 12px; background: #f3effa; border: 1px solid #dcd1f0; border-radius: 10px; text-align: left;">
            <div style="font-weight: 900; color: var(--color-purple); font-size: 0.75rem; margin-bottom: 4px; letter-spacing: 0.5px;">✨ RECOMPENSA</div>
            <div style="font-weight: 800; color: var(--color-dark); font-size: 0.9rem; line-height: 1.3;">Um novo Card para seu Perfil</div>
        </div>
        
        ${progressHtml}
        
        <button class="btn btn-primary" onclick="document.getElementById('locked-avatar-card-details-overlay').remove()" style="margin-top: 20px; width: 100%; font-size: 1rem; padding: 10px 20px; border-radius: var(--radius-sm); font-weight: bold; box-shadow: var(--shadow-button-primary);">
            Voltar
        </button>
    `;
    
    overlay.appendChild(box);
    document.body.appendChild(overlay);
};
window.openAvatarSelectionModal = openAvatarSelectionModal;

function closeAvatarSelectionModal() {
    const modal = document.getElementById('avatarSelectionModal');
    if (modal) modal.style.display = 'none';
}
window.closeAvatarSelectionModal = closeAvatarSelectionModal;

async function selectAvatar(emoji) {
    try {
        const token = localStorage.getItem('kidcanvas_session_token') || sessionToken || (currentUser ? currentUser.token : '') || '';
        if (!token) {
            showToast('Por favor, faça login para salvar seu avatar.', 'error');
            return;
        }
        
        const response = await fetch('/api/user/update-avatar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': token
            },
            body: JSON.stringify({ avatar: emoji })
        });
        const result = await response.json();
        if (response.ok && result.success) {
            if (currentUser) {
                currentUser.avatar = emoji;
            }
            showToast('Avatar atualizado com sucesso! 😍', 'success');
            
            updateUserAvatarUI(emoji);
            closeAvatarSelectionModal();
            
            // Recarregar Hall para ver a mudança imediata nas suas postagens
            renderHallDaFamaView();
            
            // Recarregar Perfil se a view de perfil estiver aberta para atualizar a moldura e status
            const profileView = document.getElementById('view-perfil');
            if (profileView && profileView.style.display === 'block') {
                renderPerfilView();
            }
        } else {
            showToast(result.message || 'Erro ao salvar avatar.', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Erro ao se conectar ao servidor.', 'error');
    }
}
window.selectAvatar = selectAvatar;

window.getAvatarHtml = function(avatarValue, size = '18px', borderStyle = '') {
    if (!avatarValue) return `<span style="font-size: calc(${size} * 0.9); vertical-align: middle; margin-right: 4px; display: inline-block; line-height: 1;">👤</span>`;
    
    const defaultEmojis = {
        'avatar_default_1': '👦',
        'avatar_default_2': '👧',
        'avatar_default_3': '👦🏽',
        'avatar_default_4': '👧🏽',
        '👦': '👦',
        '👧': '👧',
        '👦🏽': '👦🏽',
        '👧🏽': '👧🏽'
    };
    
    // Check if it's a card ID
    const card = (window.globalCatalog || []).find(c => c.id === avatarValue);
    if (card) {
        let borderClass = '';
        const rarity = card.rarity || 'Comum';
        const rarityLower = rarity.toLowerCase().replace('á', 'a').replace('é', 'e').replace('o', 'a');
        borderClass = `rarity-border-${rarityLower}`;
        
        return `<div class="avatar-card-container ${borderClass}" style="width: ${size}; height: ${size}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; overflow: hidden; vertical-align: middle; margin-right: 4px; ${borderStyle}">
            <img src="${card.imageUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
        </div>`;
    }
    
    const emojiValue = defaultEmojis[avatarValue] || avatarValue;
    const isUrl = emojiValue.startsWith('http') || emojiValue.startsWith('/');
    if (isUrl) {
        return `<img src="${emojiValue}" style="width: ${size}; height: ${size}; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 4px; display: inline-block; border: 1px solid rgba(0,0,0,0.1); ${borderStyle}">`;
    } else {
        return `<span style="font-size: calc(${size} * 0.95); vertical-align: middle; margin-right: 4px; display: inline-block; line-height: 1; ${borderStyle}">${emojiValue}</span>`;
    }
};

function updateUserAvatarUI(avatar) {
    const userAvatarImg = document.getElementById('user-avatar-img');
    const userAvatarEmoji = document.getElementById('user-avatar-emoji');
    const dropdownAvatar = document.getElementById('dropdown-user-avatar');
    const dropdownAvatarEmoji = document.getElementById('dropdown-user-avatar-emoji');
    const container = document.getElementById('user-avatar-container');
    const dropdownContainer = document.getElementById('dropdown-user-avatar-container');
    
    if (!avatar) {
        avatar = 'avatar_default_1';
    }
    
    // Clear all previous rarity classes
    [container, dropdownContainer].forEach(c => {
        if (c) {
            c.className = c.className.split(' ').filter(cls => !cls.startsWith('rarity-border-')).join(' ');
            c.style.border = '';
            c.style.boxShadow = '';
            c.style.animation = '';
        }
    });
    
    const defaultEmojis = {
        'avatar_default_1': '👦',
        'avatar_default_2': '👧',
        'avatar_default_3': '👦🏽',
        'avatar_default_4': '👧🏽',
        '👦': '👦',
        '👧': '👧',
        '👦🏽': '👦🏽',
        '👧🏽': '👧🏽'
    };
    
    const card = (window.globalCatalog || []).find(c => c.id === avatar);
    if (card) {
        const rarity = card.rarity || 'Comum';
        const rarityLower = rarity.toLowerCase().replace('á', 'a').replace('é', 'e').replace('o', 'a');
        const borderClass = `rarity-border-${rarityLower}`;
        
        if (userAvatarImg) {
            userAvatarImg.src = card.imageUrl;
            userAvatarImg.style.display = 'block';
            userAvatarImg.style.borderRadius = '50%';
        }
        if (userAvatarEmoji) userAvatarEmoji.style.display = 'none';
        
        if (dropdownAvatar) {
            dropdownAvatar.src = card.imageUrl;
            dropdownAvatar.style.display = 'block';
            dropdownAvatar.style.borderRadius = '50%';
        }
        if (dropdownAvatarEmoji) dropdownAvatarEmoji.style.display = 'none';
        
        if (container) container.classList.add(borderClass);
        if (dropdownContainer) dropdownContainer.classList.add(borderClass);
    } else {
        const emojiValue = defaultEmojis[avatar] || '👦';
        const isUrl = avatar.startsWith('http') || avatar.startsWith('/');
        
        if (isUrl) {
            if (userAvatarImg) {
                userAvatarImg.src = avatar;
                userAvatarImg.style.display = 'block';
            }
            if (userAvatarEmoji) userAvatarEmoji.style.display = 'none';
            
            if (dropdownAvatar) {
                dropdownAvatar.src = avatar;
                dropdownAvatar.style.display = 'block';
            }
            if (dropdownAvatarEmoji) dropdownAvatarEmoji.style.display = 'none';
        } else {
            if (userAvatarImg) userAvatarImg.style.display = 'none';
            if (userAvatarEmoji) {
                userAvatarEmoji.textContent = emojiValue;
                userAvatarEmoji.style.display = 'block';
            }
            
            if (dropdownAvatar) dropdownAvatar.style.display = 'none';
            if (dropdownAvatarEmoji) {
                dropdownAvatarEmoji.textContent = emojiValue;
                dropdownAvatarEmoji.style.display = 'block';
            }
        }
    }
}
window.updateUserAvatarUI = updateUserAvatarUI;


window.switchConquistasTab = function(tab) {
    const btnCriatividade = document.getElementById('btn-tab-criatividade');
    const btnSocial = document.getElementById('btn-tab-social');
    const contentCriatividade = document.getElementById('tab-content-criatividade');
    const contentSocial = document.getElementById('tab-content-social');
    
    if (!btnCriatividade || !btnSocial || !contentCriatividade || !contentSocial) return;

    if (tab === 'criatividade') {
        btnCriatividade.classList.remove('btn-secondary', 'btn-outline');
        btnCriatividade.classList.add('btn-primary');
        btnSocial.classList.remove('btn-primary');
        btnSocial.classList.add('btn-secondary', 'btn-outline');
        contentCriatividade.style.display = 'block';
        contentSocial.style.display = 'none';
    } else {
        btnSocial.classList.remove('btn-secondary', 'btn-outline');
        btnSocial.classList.add('btn-primary');
        btnCriatividade.classList.remove('btn-primary');
        btnCriatividade.classList.add('btn-secondary', 'btn-outline');
        contentCriatividade.style.display = 'none';
        contentSocial.style.display = 'block';
    }
};

window.copyInviteLink = function() {
    const input = document.getElementById('invite-link-input');
    if (!input) return;
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value).then(() => {
        const msg = document.getElementById('invite-link-copied-msg');
        if (msg) {
            msg.style.display = 'block';
            setTimeout(() => { msg.style.display = 'none'; }, 3000);
        }
    });
};


// ==========================================
// EVENTOS - SEXTA MÁGICA
// ==========================================

let currentActiveEvent = null;

async function checkActiveEvent() {
    try {
        const res = await fetch('/api/events/current', {
            headers: { 'X-Session-Token': sessionToken }
        });
        const data = await res.json();
        
        if (data.success && data.active) {
            currentActiveEvent = data;
            
            const heroBtn = document.getElementById('hero-event-button');
            const heroTimer = document.getElementById('hero-event-timer');
            
            if (heroBtn) {
                heroBtn.style.display = 'block';
            }
            
            if (heroTimer) {
                const endDate = new Date(data.week.endDate);
                
                const updateTimer = () => {
                    const now = new Date();
                    const diff = endDate - now;
                    if (diff <= 0) {
                        heroTimer.innerHTML = '⏰ Terminou! Nova expedição em breve! ✨';
                        return;
                    }
                    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                    const m = Math.floor((diff / 1000 / 60) % 60);
                    heroTimer.innerHTML = `⏰ Termina em ${d}d ${h}h ${m}m`;
                };
                
                updateTimer();
                setInterval(updateTimer, 1000);
            }
        }
    } catch (e) {
        console.error('Erro ao buscar evento:', e);
    }
}

function openEventModal() {
    if (!currentUser) {
        showToast('Faça login para ver suas missões e aventuras! 🎯', 'info');
        openAuthModal();
        return;
    }
    if (!currentActiveEvent) {
        showToast('Nenhuma expedição ativa no momento! Volte mais tarde. ⏳', 'info');
        return;
    }
    
    // Instead of separate modal, open the Book overlay and select expedition!
    openAlbumModal();
    setTimeout(() => {
        selectChapter('expedition');
    }, 150);
}
window.openEventModal = openEventModal;

function closeEventModal() {
    closeAlbumModal();
}
window.closeEventModal = closeEventModal;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEventModal();
    }
});

// Click outside to close
document.addEventListener('click', (e) => {
    const modal = document.getElementById('eventModal');
    if (modal && modal.style.display === 'block') {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent && !modalContent.contains(e.target) && !e.target.closest('#hero-event-button') && !e.target.closest('#global-event-banner') && !e.target.closest('.hero-cta-card-new')) {
            closeEventModal();
        }
    }
});

function renderEventInventory() {
    const invArea = document.getElementById('event-inventory-area');
    const invItems = document.getElementById('event-inventory-items');
    if (!invArea || !invItems || !currentActiveEvent.inventory) return;
    
    if (currentActiveEvent.inventory.length === 0) {
        invArea.style.display = 'none';
        return;
    }
    
    invArea.style.display = 'block';
    invItems.innerHTML = '';
    
    currentActiveEvent.inventory.forEach(item => {
        let emoji = '🎁';
        let name = 'Item Especial';
        if (item === 'egg_1') { emoji = '🥚'; name = 'Ovo Misterioso'; }
        if (item === 'egg_2') { emoji = '🐣'; name = 'Ovo Rachando'; }
        if (item === 'egg_3') { emoji = '🌟'; name = 'Ovo Brilhante'; }
        if (item === 'egg_4') { emoji = '🐉'; name = 'Mascote Dragão'; }
        
        invItems.innerHTML += `
            <div style="background: #f0f0f0; border-radius: 10px; padding: 10px; width: 100px; border: 2px solid #ddd;">
                <div style="font-size: 2.5rem;">${emoji}</div>
                <div style="font-size: 0.8rem; font-weight: bold; margin-top: 5px;">${name}</div>
            </div>
        `;
    });
}

function renderEventMissions() {
    const container = document.getElementById('event-missions-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const week = currentActiveEvent.week;
    const progress = currentActiveEvent.progress;
    
    week.missions.forEach(m => {
        const p = progress[m.id];
        const isCompleted = p.current >= m.req;
        const isClaimed = p.claimed;
        
        // Progress Visuals
        let visualProgressHtml = '<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; justify-content: center;">';
        
        for (let i = 0; i < m.req; i++) {
            const isDone = p.current > i;
            let icon = m.id.includes('dino') ? (isDone ? '🦕' : '🥚') : (isDone ? '🌟' : '⭐');
            if (m.type === 'complete_all') icon = isDone ? '👑' : '⏳';
            const filter = isDone ? 'none' : 'grayscale(100%) opacity(60%)';
            const scale = isDone ? 'scale(1.2)' : 'scale(1)';
            visualProgressHtml += `<div style="font-size: 2.5rem; filter: ${filter}; transform: ${scale}; transition: all 0.3s ease;">${icon}</div>`;
        }
        visualProgressHtml += '</div>';
        
        let rewardHtml = '';
        if (m.reward.type === 'stars') rewardHtml = `<div style="font-weight: 900; color: #ff9f43; font-size: 1.2rem; text-shadow: 1px 1px 0px rgba(0,0,0,0.1);"><i class="fa-solid fa-star"></i> +${m.reward.value}</div>`;
        if (m.reward.type === 'badge') rewardHtml = `<div style="font-weight: 900; color: #9b59b6; font-size: 1.2rem; text-shadow: 1px 1px 0px rgba(0,0,0,0.1);"><i class="fa-solid fa-award"></i> Selo</div>`;
        if (m.reward.type === 'card') rewardHtml = `<div style="font-weight: 900; color: #e74c3c; font-size: 1.2rem; text-shadow: 1px 1px 0px rgba(0,0,0,0.1);">🃏 Carta</div>`;
        
        let btnHtml = '';
        if (isClaimed) {
            btnHtml = `<div style="font-size: 2.5rem; text-align: center;">✅</div>`;
        } else if (isCompleted) {
            btnHtml = `<button onclick="claimEventMission('${m.id}')" style="background: linear-gradient(135deg, #FFD700, #F39C12); border: 4px solid #fff; padding: 10px 20px; border-radius: 20px; font-weight: 900; color: white; cursor: pointer; box-shadow: 0 6px 15px rgba(243, 156, 18, 0.4); font-size: 1.2rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">✨ Abrir! ✨</button>`;
        } else {
            btnHtml = `<div style="font-size: 2.5rem; text-align: center; filter: grayscale(100%) opacity(50%);">🎁</div>`;
        }
        
        container.innerHTML += `
            <div style="background: ${isClaimed ? '#f0fff0' : 'white'}; border-radius: 20px; padding: 20px; display: flex; align-items: center; justify-content: space-between; border: 4px solid ${isCompleted && !isClaimed ? '#f1c40f' : '#eee'}; box-shadow: 0 4px 10px rgba(0,0,0,0.05); flex-wrap: wrap; gap: 15px;">
                <div style="flex: 1; min-width: 200px; text-align: center;">
                    <h4 style="margin: 0; font-size: 1.3rem; color: #333; font-weight: 900;">${m.title}</h4>
                    <p style="margin: 5px 0 0 0; font-size: 1.0rem; color: #666; font-weight: 600;">${m.desc}</p>
                    ${visualProgressHtml}
                </div>
                <div style="text-align: center; min-width: 120px; background: #fff5eb; padding: 10px; border-radius: 15px; border: 2px dashed #ffdcb0;">
                    <div style="margin-bottom: 5px; font-size: 0.9rem; color: #888; font-weight: bold;">Prêmio:</div>
                    ${rewardHtml}
                    <div style="margin-top: 10px;">${btnHtml}</div>
                </div>
            </div>
        `;
    });
}

async function claimEventMission(missionId) {
    try {
        const res = await fetch('/api/events/claim', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify({ missionId })
        });
        const data = await res.json();
        
        if (data.success) {
            let wonCard = false;
            if (data.reward && data.reward.type === 'card') {
                const cardId = data.reward.id || data.reward.value;
                const catalogCard = (window.globalCatalog || []).find(c => c.id === cardId);
                const rarity = catalogCard ? catalogCard.rarity : 'Comum';
                const imageUrl = catalogCard ? catalogCard.imageUrl : '';
                const name = catalogCard ? catalogCard.name : data.reward.name;
                const curiosity = catalogCard ? catalogCard.curiosity : data.reward.curiosity;
                const colName = catalogCard ? (catalogCard.collection ? catalogCard.collection.split(' ')[0] : null) : null;
                
                revealCardAnimation(name, rarity, imageUrl, curiosity, colName);
                wonCard = true;
            } else if (data.reward && data.reward.type === 'badge') {
                if(typeof confetti !== 'undefined') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                showPerigoMessage('Nova Conquista!', 'Você ganhou um selo exclusivo!');
            } else {
                showPerigoMessage('Recompensa Resgatada!', 'Você concluiu a missão e ganhou estrelas!');
            }
            
            // Refresh data
            if (data.stars) {
                currentUser.stars = data.stars;
                updateStarsUI();
            }
            if (data.cards) {
                currentUser.cards = data.cards;
            }
            
            // Verificar se há conclusão de capítulo e recompensar com Mítica
            if (data.completionRewards && data.completionRewards.length > 0) {
                const comp = data.completionRewards[0];
                const mythic = comp.mythicCard;
                const colName = comp.colName;
                
                setTimeout(() => {
                    revealCardAnimation(mythic.name, 'Mítica', mythic.imageUrl, mythic.curiosity, colName);
                }, wonCard ? 3800 : 1000);
            }
            
            if (data.newlyUnlockedCertificates && data.newlyUnlockedCertificates.length > 0) {
                setTimeout(() => {
                    checkNewlyUnlockedCertificates(data.newlyUnlockedCertificates);
                }, wonCard ? 4500 : 1500);
            }
            
            // re-fetch the current event to update progress
            await checkActiveEvent();
            renderEventMissions();
            renderEventInventory();
        } else {
            Swal.fire('Erro', data.message || 'Erro ao resgatar recompensa.', 'error');
        }
    } catch (e) {
        console.error(e);
        Swal.fire('Erro', 'Falha na conexão.', 'error');
    }
}

window.revealCardAnimation = function(name, rarity, imageUrl, curiosity, collectionName = null) {
    playRaritySound(rarity);
    
    // Determinar a coleção se não fornecida
    let colTheme = collectionName;
    if (!colTheme && window.globalCatalog) {
        const catCard = window.globalCatalog.find(c => c.name === name);
        if (catCard && catCard.collection) {
            colTheme = catCard.collection.split(' ')[0];
        }
    }
    if (!colTheme) colTheme = 'Dinossauros'; // Default fallback
    
    // Obter os elementos do overlay
    const overlay = document.getElementById('revelacao-descoberta-overlay');
    const book = document.getElementById('magico-livro');
    const img = document.getElementById('revelacao-img');
    const nameEl = document.getElementById('revelacao-nome');
    const curEl = document.getElementById('revelacao-curiosidade');
    const capEl = document.getElementById('revelacao-capitulo-label');
    const statusEl = document.getElementById('revelacao-titulo-status');
    const btn = document.getElementById('revelacao-salvar-btn');
    
    if (!overlay || !book) {
        console.warn("Overlay de revelação não encontrado.");
        return;
    }
    
    // Configurar informações da descoberta
    img.src = imageUrl || '/favicon-64x64.png';
    nameEl.textContent = name;
    curEl.textContent = curiosity;
    capEl.textContent = `Capítulo ${colTheme} (${rarity.toUpperCase()})`;
    statusEl.textContent = (rarity === 'Épica' || rarity === 'Mítica') ? '✨ Descoberta Rara Encontrada!' : 'Nova descoberta encontrada!';
    
    // Configurar Destaque de Compartilhamento e Botão Mítico
    const c = window.globalCatalog ? window.globalCatalog.find(card => card.name === name) : null;
    const cardId = c ? (c.id || c.value) : '';
    
    const highlightEl = document.getElementById('revelacao-share-highlight');
    const compBtn = document.getElementById('revelacao-compartilhar-btn');
    
    if (highlightEl) {
        if (rarity === 'Épica' || rarity === 'Mítica') {
            highlightEl.style.display = 'block';
        } else {
            highlightEl.style.display = 'none';
        }
    }
    
    if (compBtn) {
        if (rarity === 'Mítica') {
            compBtn.style.display = 'inline-block';
            compBtn.textContent = '👑 Compartilhar Descoberta Mítica';
            compBtn.onclick = () => {
                openSharePlatformsModal(cardId, false, true);
            };
        } else {
            compBtn.style.display = 'none';
        }
    }
    
    // Resetar classes e estados
    book.className = `magico-livro reveal-rarity-${rarity.toLowerCase().replace('á', 'a').replace('é', 'e')}`;
    overlay.classList.add('active');
    btn.classList.remove('visible');
    
    // Animação de Abertura do Livro após um pequeno atraso
    setTimeout(() => {
        book.classList.add('aberto');
        
        // Disparar efeitos de partículas
        dispararParticulasMagicas(colTheme, rarity);
        
        // Confetes e show de fogos de artifício no fundo do card
        if (typeof confetti !== 'undefined') {
            const duration = 2.5 * 1000;
            const end = Date.now() + duration;
            
            let colors = ['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#3498db'];
            if (rarity === 'Rara') colors = ['#74b9ff', '#0984e3', '#ffffff'];
            else if (rarity === 'Épica') colors = ['#a29bfe', '#6c5ce7', '#ffffff'];
            else if (rarity === 'Mítica') colors = ['#ffeaa7', '#fdcb6e', '#fd9644', '#00b894', '#ffffff'];

            (function frame() {
                confetti({
                    particleCount: 4,
                    angle: 60,
                    spread: 55,
                    colors: colors,
                    origin: { x: 0, y: 0.8 }
                });
                confetti({
                    particleCount: 4,
                    angle: 120,
                    spread: 55,
                    colors: colors,
                    origin: { x: 1, y: 0.8 }
                });
                
                if (Math.random() > 0.75) {
                    confetti({
                        particleCount: 15,
                        spread: 80,
                        colors: colors,
                        origin: { x: Math.random() * 0.4 + 0.3, y: Math.random() * 0.3 + 0.3 }
                    });
                }

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
        
        // Exibir o botão salvar após a animação de folheamento
        setTimeout(() => {
            btn.classList.add('visible');
        }, 1200);
    }, 400);
};

window.dispararParticulasMagicas = function(colTheme, rarity) {
    let colors = ['#ffeaa7', '#ffffff']; // Padrão
    let numParticulas = 40;
    
    if (rarity === 'Rara') numParticulas = 70;
    else if (rarity === 'Épica') numParticulas = 120;
    else if (rarity === 'Mítica') numParticulas = 200;
    
    if (colTheme === 'Dinossauros') {
        colors = ['#ffeaa7', '#2ecc71', '#27ae60', '#d35400']; // Dourado, verdes, poeira quente
    } else if (colTheme === 'Oceano') {
        colors = ['#74b9ff', '#0984e3', '#a8e6cf', '#ffffff']; // Azul marinho, azul claro, translúcidos
    } else if (colTheme === 'Espaço') {
        colors = ['#a29bfe', '#6c5ce7', '#ffeaa7', '#2c3e50']; // Poeira estelar, violeta, estrelas
    } else if (colTheme === 'Fantasia') {
        colors = ['#fd79a8', '#e84393', '#ffeaa7', '#a29bfe']; // Rosa, magenta, dourado, violeta
    } else if (colTheme === 'Veículos') {
        colors = ['#e17055', '#fdcb6e', '#0984e3', '#ffeaa7']; // Faíscas de motor, laranja, azul metálico
    } else if (colTheme === 'Animais') {
        colors = ['#2ecc71', '#f1c40f', '#e67e22', '#ffffff']; // Folhas verdes, raio de sol, natural
    }
    
    const container = document.getElementById('revelacao-descoberta-overlay');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2 - 50; 
    
    for (let i = 0; i < numParticulas; i++) {
        const p = document.createElement('div');
        p.className = 'magia-particula';
        
        const angle = Math.random() * Math.PI * 2;
        const distanceMultiplier = rarity === 'Mítica' ? 300 : (rarity === 'Épica' ? 220 : 150);
        const distance = (0.2 + Math.random() * 0.8) * distanceMultiplier;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        p.style.left = `${centerX}px`;
        p.style.top = `${centerY}px`;
        p.style.backgroundColor = color;
        p.style.setProperty('--x', `${x}px`);
        p.style.setProperty('--y', `${y}px`);
        
        const size = Math.floor(Math.random() * 6 + 4);
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        
        if (colTheme === 'Oceano' && Math.random() > 0.5) {
            p.style.borderRadius = '50%';
            p.style.border = '1.5px solid rgba(255,255,255,0.7)';
            p.style.backgroundColor = 'transparent';
        }
        
        const duration = 0.8 + Math.random() * 1.0;
        p.style.animationDuration = `${duration}s`;
        
        container.appendChild(p);
        
        setTimeout(() => {
            p.remove();
        }, duration * 1000);
    }
};

window.fecharRevelacao = function() {
    const overlay = document.getElementById('revelacao-descoberta-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
    const highlightEl = document.getElementById('revelacao-share-highlight');
    const compBtn = document.getElementById('revelacao-compartilhar-btn');
    if (highlightEl) highlightEl.style.display = 'none';
    if (compBtn) compBtn.style.display = 'none';
    
    if (document.getElementById('livro-descobertas-overlay').classList.contains('active') && window.activeChapterName) {
        renderChapterGrid(window.activeChapterName);
    }
};

window.isDiscoveryOwned = function(card) {
    if (!currentUser || !currentUser.cards || !card) return false;
    const cardId = card.id || card.value;
    if (!cardId) return false;
    return currentUser.cards.some(uc => {
        if (!uc) return false;
        if (typeof uc === 'string') return uc === cardId;
        const ucId = uc.id || uc.value;
        return ucId === cardId;
    });
};

window.triggerDiscoveryReveal = function(card) {
    if (!card) return;
    
    const overlay = document.getElementById('discovery-flip-reveal-overlay');
    const inner = document.getElementById('reveal-card-inner-el');
    const frontImg = document.getElementById('reveal-card-front-img');
    const backEl = document.getElementById('reveal-card-back-el');
    const backImg = document.getElementById('reveal-card-back-img');
    const titleEl = document.getElementById('discovery-flip-title-el');
    const rarityEl = document.getElementById('discovery-flip-rarity-el');
    const curiosityEl = document.getElementById('discovery-flip-curiosity-el');
    const btn = document.getElementById('discovery-flip-btn-el');
    
    const equipPrompt = document.getElementById('discovery-equip-avatar-prompt');
    const equipBtn = document.getElementById('discovery-equip-btn-el');
    const equipText = document.getElementById('discovery-equip-prompt-text');
    
    if (!overlay || !inner) return;
    
    // Prevent double triggering if already showing
    if (overlay.classList.contains('active')) return;
    
    // Reset classes and state
    inner.classList.remove('flipped');
    backEl.classList.remove('glow-rara', 'glow-epica', 'glow-mitica');
    
    if (equipPrompt) equipPrompt.style.display = 'none';
    if (equipBtn) {
        equipBtn.style.display = 'block';
        equipBtn.disabled = false;
        equipBtn.textContent = 'Equipar Agora';
    }
    if (equipText) equipText.textContent = 'Deseja usar este card no seu perfil?';
    
    // Set content
    frontImg.src = card.imageUrl || '/favicon-64x64.png';
    backImg.src = card.imageUrl || '/favicon-64x64.png';
    titleEl.textContent = card.name;
    
    const rarity = card.rarity || 'Comum';
    rarityEl.textContent = rarity;
    
    // Set rarity styling class
    rarityEl.className = 'discovery-flip-rarity';
    const rarityLower = rarity.toLowerCase().replace('á', 'a').replace('é', 'e');
    rarityEl.classList.add(`rarity-color-${rarityLower}`);
    
    curiosityEl.innerHTML = card.curiosity ? `<strong>📚 SABIA QUE?</strong><br>${card.curiosity}` : '';
    
    // Configurar prompt de equipar se estiver logado
    if (currentUser && card.id && equipPrompt) {
        equipPrompt.style.display = 'block';
        if (equipBtn) {
            equipBtn.onclick = async function() {
                try {
                    equipBtn.disabled = true;
                    equipBtn.textContent = 'Equipando...';
                    
                    const token = localStorage.getItem('kidcanvas_session_token') || sessionToken || (currentUser ? currentUser.token : '') || '';
                    const response = await fetch('/api/user/update-avatar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-session-token': token
                        },
                        body: JSON.stringify({ avatar: card.id })
                    });
                    const result = await response.json();
                    if (response.ok && result.success) {
                        currentUser.avatar = card.id;
                        showToast('Avatar atualizado com sucesso! 😍', 'success');
                        updateUserAvatarUI(card.id);
                        
                        equipText.textContent = 'Card equipado com sucesso! 🎉';
                        equipBtn.style.display = 'none';
                        
                        // Atualizar Hall
                        renderHallDaFamaView();
                        
                        // Atualizar Perfil
                        const profileView = document.getElementById('view-perfil');
                        if (profileView && profileView.style.display === 'block') {
                            renderPerfilView();
                        }
                    } else {
                        showToast(result.message || 'Erro ao salvar avatar.', 'error');
                        equipBtn.disabled = false;
                        equipBtn.textContent = 'Equipar Agora';
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Erro ao se conectar ao servidor.', 'error');
                    equipBtn.disabled = false;
                    equipBtn.textContent = 'Equipar Agora';
                }
            };
        }
    }
    
    // Play sound depending on rarity
    if (typeof playRaritySound === 'function') {
        playRaritySound(rarity);
    }
    
    // Show overlay
    overlay.classList.add('active');
    
    // Start celebration confetti falling from the top, z-indexed behind the card
    if (typeof confetti !== 'undefined') {
        const confettiCanvas = document.getElementById('discovery-confetti-canvas');
        if (confettiCanvas) {
            // Set explicit dimensions immediately to avoid 0x0 size bugs when shown
            confettiCanvas.width = confettiCanvas.clientWidth || window.innerWidth;
            confettiCanvas.height = confettiCanvas.clientHeight || window.innerHeight;
            
            try {
                window.discoveryConfetti = confetti.create(confettiCanvas, { resize: true });
            } catch (e) {
                console.error("Erro ao instanciar local confetti:", e);
            }
        }
        
        if (window.discoveryConfetti) {
            const end = Date.now() + 5000; // 5 seconds duration
            const colors = ['#2ecc71', '#9b59b6', '#f1c40f', '#e67e22', '#e84393']; // verde, roxo, amarelo, laranja, rosa
            
            (function frame() {
                window.discoveryConfetti({
                    particleCount: 6, // 3x more particles
                    angle: 270, // falling down
                    spread: 80,
                    startVelocity: Math.random() * 15 + 5, // varied fall speed
                    gravity: Math.random() * 0.8 + 0.4, // varied gravity (some faster, some slower)
                    scalar: Math.random() * 0.8 + 1.2, // larger size and varied scale
                    drift: Math.random() * 2 - 1, // slight breeze drift
                    colors: colors,
                    origin: { x: Math.random(), y: -0.1 }
                });
                
                if (Date.now() < end && overlay.classList.contains('active')) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }
    
    // Start Flip animation after a small delay (500ms)
    setTimeout(() => {
        inner.classList.add('flipped');
        
        // After 600ms (duration of flip), add glow if applicable
        setTimeout(() => {
            if (rarity === 'Rara') {
                backEl.classList.add('glow-rara');
                if (typeof confetti !== 'undefined' && window.discoveryConfetti) {
                    window.discoveryConfetti({ particleCount: 50, spread: 60, colors: ['#3498db', '#ffffff'], origin: { x: 0.5, y: 0.5 } });
                }
            } else if (rarity === 'Épica') {
                backEl.classList.add('glow-epica');
                if (typeof confetti !== 'undefined' && window.discoveryConfetti) {
                    window.discoveryConfetti({ particleCount: 90, spread: 80, colors: ['#e67e22', '#ffffff'], origin: { x: 0.5, y: 0.5 } });
                }
            } else if (rarity === 'Mítica') {
                backEl.classList.add('glow-mitica');
                if (typeof confetti !== 'undefined' && window.discoveryConfetti) {
                    window.discoveryConfetti({ particleCount: 150, spread: 100, colors: ['#9b59b6', '#ecf0f1', '#f1c40f'], origin: { x: 0.5, y: 0.5 } });
                }
            } else {
                if (typeof confetti !== 'undefined' && window.discoveryConfetti) {
                    window.discoveryConfetti({ particleCount: 20, spread: 40, colors: ['#2ecc71', '#ffffff'], origin: { x: 0.5, y: 0.5 } });
                }
            }
        }, 600);
    }, 500);
    
    // Configure close button
    btn.onclick = function() {
        overlay.classList.remove('active');
        // If discoveries overlay is active, re-render grid
        const albumOverlay = document.getElementById('livro-descobertas-overlay');
        if (albumOverlay && albumOverlay.classList.contains('active') && window.activeChapterName) {
            if (typeof renderChapterGrid === 'function') {
                renderChapterGrid(window.activeChapterName);
            }
        }
    };
};

window.revealCardAnimation = function(name, rarity, imageUrl, curiosity, collectionName = null) {
    const card = {
        name: name,
        rarity: rarity,
        imageUrl: imageUrl,
        curiosity: curiosity,
        collection: collectionName
    };
    window.triggerDiscoveryReveal(card);
};

// Fetch interceptor to automatically catch newDiscovery responses
(function() {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch(...args);
        try {
            const clone = response.clone();
            const data = await clone.json();
            if (data && data.success && data.newDiscovery) {
                setTimeout(() => {
                    window.triggerDiscoveryReveal(data.newDiscovery);
                }, 1000);
            }
        } catch (e) {
            // Ignore non-json or failed parses
        }
        return response;
    };
})();

window.getDiscoveryProgress = function(card) {
    if (!currentUser) return { current: 0, target: 0 };
    
    const condition = card.unlockCondition;
    if (!condition) return { current: 0, target: 0 };
    
    const myPaintings = currentUser.myPaintings || [];
    const myStories = currentUser.myStories || [];
    const userCards = currentUser.cards || [];
    
    const countPaintingsOfCategory = (cats) => {
        return myPaintings.filter(p => {
            // Pinturas salvas pela Pintura Livre NÃO contam progresso nas Descobertas
            if (p.fromPinturaLivre === true || p.category === 'Mão Livre') return false;
            
            if (p.originalCategory && cats.includes(p.originalCategory)) return true;
            if (p.category && cats.includes(p.category.toLowerCase())) return true;
            return false;
        }).length;
    };

    const getCategoryCount = (cat) => {
        if (cat === 'dinossauros') return countPaintingsOfCategory(['dinossauros']);
        if (cat === 'unicornios') return countPaintingsOfCategory(['unicornios']);
        if (cat === 'veiculos') return countPaintingsOfCategory(['veiculos']);
        if (cat === 'espaco') return countPaintingsOfCategory(['espaco']);
        if (cat === 'fantasia') return countPaintingsOfCategory(['fantasia', 'contos-de-fada']);
        if (cat === 'animais') return countPaintingsOfCategory(['animais-selvagens', 'animais-domesticos', 'aves', 'fazenda', 'animais-do-mar']);
        return countPaintingsOfCategory([cat]);
    };

    switch (condition.type) {
        case 'paint_count': {
            // Só desenhos gerados pelo "Gerar Desenho" contam (Criação com IA)
            const count = myPaintings.filter(p => p.category === 'Criação com IA').length;
            return { current: count, target: condition.count };
        }
            
        case 'category_paint':
            return { current: getCategoryCount(condition.category), target: condition.count };
            
        case 'categories_painted': {
            // Pinturas salvas pela Pintura Livre NÃO contam progresso nas Descobertas
            const validPaintings = myPaintings.filter(p => p.fromPinturaLivre !== true && p.category !== 'Mão Livre');
            const categories = new Set(validPaintings.map(p => p.originalCategory || (p.category ? p.category.toLowerCase() : null)).filter(Boolean));
            return { current: categories.size, target: condition.count };
        }
        
        case 'story_count':
            return { current: myStories.length, target: condition.count };
            
        case 'story_pages_count': {
            const booksWithPages = myStories.filter(s => s.paragraphs && s.paragraphs.length >= condition.pages).length;
            return { current: booksWithPages, target: condition.count };
        }
        
        case 'expedition_count': {
            const completedExpeditions = currentUser.eventInventory ? currentUser.eventInventory.length : 0;
            return { current: completedExpeditions, target: condition.count };
        }
        
        case 'share_count':
            return { current: currentUser.paintingShareCount || 0, target: condition.count };
            
        case 'hall_count': {
            const count = myPaintings.filter(p => p.isPublic && p.fromPinturaLivre !== true && p.category !== 'Mão Livre').length;
            return { current: count, target: condition.count };
        }
            
        case 'likes_count':
            return { current: currentUser.likesReceived || 0, target: condition.count };
            
        case 'all_cards_unlocked':
            return { current: userCards.length, target: condition.count };
            
        case 'login_streak':
            return { current: currentUser.consecutiveDays || 1, target: condition.count };
            
        case 'invite':
            return { current: currentUser.referredUsers ? currentUser.referredUsers.length : 0, target: condition.count };
            
        case 'collection_complete':
        default:
            return { current: 0, target: 0 };
    }
};

window.getDynamicClueText = function(card) {
    if (!currentUser) return card.unlockHint || "Continue explorando para revelar!";
    if (card.rarity === 'Mítica') {
        const colName = card.collection ? card.collection.replace(/\s+\d+\/\d+$/, '').trim() : '';
        return `Desbloqueada ao obter todas as outras descobertas de ${colName || 'este capítulo'}.`;
    }
    const progress = window.getDiscoveryProgress(card);
    if (progress && progress.target > 0) {
        return `${card.unlockHint} (Progresso: ${progress.current}/${progress.target})`;
    }
    return card.unlockHint || "Continue explorando para revelar!";
};

window.openAlbumModal = async function() {
    closeEventModal();
    if (!currentUser) {
        showToast('Faça login para ver seu Livro das Descobertas! 📖', 'info');
        openAuthModal();
        return;
    }
    
    try {
        const res = await fetch('/api/store/catalog');
        const data = await res.json();
        
        if (data.success) {
            window.globalCatalog = data.catalog;
        }
    } catch(e) {
        console.log('Erro ao carregar catálogo:', e);
    }
    
    const catalog = window.globalCatalog || [];
    const userCards = currentUser.cards || [];
    
    // Calcular Estatística Global
    const globalTotal = catalog.length;
    const globalOwned = catalog.filter(c => window.isDiscoveryOwned(c)).length;
    const globalPct = globalTotal > 0 ? Math.round((globalOwned / globalTotal) * 100) : 0;
    
    const statsTextEl = document.getElementById('livro-global-stats-text');
    if (statsTextEl) statsTextEl.innerText = `${globalOwned} / ${globalTotal}`;
    const statsBarEl = document.getElementById('livro-global-stats-bar');
    if (statsBarEl) statsBarEl.style.width = `${globalPct}%`;
    const statsPctEl = document.getElementById('livro-global-stats-pct');
    if (statsPctEl) statsPctEl.innerText = `${globalPct}%`;

    // Iniciar Dicas Rotativas
    if (window.livroDicasInterval) {
        clearInterval(window.livroDicasInterval);
    }
    const tips = [
        "📖 Cada pintura pode revelar uma nova descoberta.",
        "🦖 Os maiores exploradores completam todos os capítulos.",
        "✨ Algumas descobertas são extremamente raras.",
        "🌊 Continue explorando para revelar segredos escondidos.",
        "🚀 O Universo Infinito aguarda os exploradores mais dedicados."
    ];
    let tipIdx = 0;
    const tipTextEl = document.getElementById('livro-dica-texto');
    const tipContainerEl = document.getElementById('livro-dicas-rotativas');
    if (tipTextEl) tipTextEl.innerText = tips[0];
    if (tipContainerEl) tipContainerEl.style.opacity = '1';

    window.livroDicasInterval = setInterval(() => {
        if (tipTextEl && tipContainerEl) {
            tipContainerEl.style.opacity = '0';
            setTimeout(() => {
                tipIdx = (tipIdx + 1) % tips.length;
                tipTextEl.innerText = tips[tipIdx];
                tipContainerEl.style.opacity = '1';
            }, 400);
        }
    }, 6000);

    // Agrupar por coleção/capítulo
    const collections = {};
    catalog.forEach(c => {
        const colName = c.collection ? c.collection.split(' ')[1] : 'Geral';
        if (!collections[colName]) collections[colName] = [];
        collections[colName].push(c);
    });

    // Renderizar Mapa de Exploração Geral ("Seu Progresso")
    const progGeralListaEl = document.getElementById('livro-progresso-geral-lista');
    if (progGeralListaEl) {
        progGeralListaEl.innerHTML = '';
        
        const colors = {
            'Pinturas': 'linear-gradient(90deg, #3498db, #2980b9)',
            'Dinossauros': 'linear-gradient(90deg, #2ecc71, #27ae60)',
            'Livros': 'linear-gradient(90deg, #f1c40f, #e67e22)',
            'Expedições': 'linear-gradient(90deg, #e74c3c, #c0392b)',
            'Comunidade': 'linear-gradient(90deg, #9b59b6, #8e44ad)',
            'Lendárias': 'linear-gradient(90deg, #f39c12, #d35400)',
            'Lendas-do-Desenho': 'linear-gradient(90deg, #fdcb6e, #e67e22)'
        };

        for (const [colName, cardsInCol] of Object.entries(collections)) {
            const owned = cardsInCol.filter(c => window.isDiscoveryOwned(c)).length;
            const total = cardsInCol.length;
            const pct = Math.round((owned / total) * 100);
            const firstCard = cardsInCol[0];
            const emoji = firstCard && firstCard.collection ? firstCard.collection.split(' ')[0] : '🃏';
            const barBg = colors[colName] || 'linear-gradient(90deg, #6c5ce7, #a29bfe)';

            const item = document.createElement('div');
            item.className = 'livro-progresso-geral-item';
            item.onclick = () => selectChapter(colName);
            item.innerHTML = `
                <div class="livro-progresso-item-info">
                    <span class="livro-progresso-item-nome">${emoji} ${colName}</span>
                    <span>${owned}/${total}</span>
                </div>
                <div class="livro-progresso-item-bar-bg">
                    <div class="livro-progresso-item-bar-fill" style="width: ${pct}%; background: ${barBg};"></div>
                </div>
            `;
            progGeralListaEl.appendChild(item);
        }
    }
    
    // Renderizar a lista de capítulos na folha esquerda
    const chaptersListEl = document.getElementById('livro-capitulos-lista');
    if (chaptersListEl) {
        chaptersListEl.innerHTML = '';
        
        // --- ADICIONADO: BOTÃO EXPEDIÇÃO MÁGICA DA SEMANA NO TOPO ---
        if (typeof currentActiveEvent !== 'undefined' && currentActiveEvent && currentActiveEvent.active) {
            const week = currentActiveEvent.week;
            const progress = currentActiveEvent.progress;
            
            const mainMissions = week.missions.filter(m => m.tier !== 'epica');
            const completedMain = mainMissions.filter(m => progress[m.id] && progress[m.id].current >= m.req).length;
            const totalMain = mainMissions.length;
            
            const expBtn = document.createElement('div');
            expBtn.className = 'livro-capitulo-btn livro-expedition-btn';
            expBtn.id = 'btn-capitulo-expedition';
            expBtn.onclick = () => selectChapter('expedition');
            
            const expeditionEmoji = {
                'Dinossauros': '🦖',
                'Animais': '🦊',
                'Fantasia': '✨',
                'Veículos': '🚗',
                'Oceano': '🌊',
                'Espaço': '🚀',
                'Piratas': '⚓'
            }[week.theme] || '✨';
            
            expBtn.innerHTML = `
                <div class="livro-capitulo-info">
                    <span class="livro-capitulo-emoji">${expeditionEmoji}</span>
                    <span class="livro-capitulo-nome" style="font-weight:900; color:#8e44ad;">✨ Expedição Mágica</span>
                </div>
                <span class="livro-capitulo-progresso" id="livro-expedition-progresso-badge" style="background:linear-gradient(135deg, #a29bfe, #6c5ce7); color:white; font-weight:800; border:none; padding:2px 8px; border-radius:10px;">${completedMain}/${totalMain}</span>
            `;
            chaptersListEl.appendChild(expBtn);
        }
        
        const mestreNames = {
            'Pinturas': 'Mestre das Pinturas',
            'Dinossauros': 'Mestre dos Dinossauros',
            'Livros': 'Mestre dos Livros',
            'Expedições': 'Mestre das Expedições',
            'Comunidade': 'Mestre da Comunidade',
            'Lendárias': 'Lenda do KidCanvas',
            'Lendas-do-Desenho': 'Lenda do Desenho'
        };
        
        let firstCol = null;
        for (const [colName, cardsInCol] of Object.entries(collections)) {
            if (!firstCol) firstCol = colName;
            
            const owned = cardsInCol.filter(c => window.isDiscoveryOwned(c)).length;
            const total = cardsInCol.length;
            const firstCard = cardsInCol[0];
            const emoji = firstCard && firstCard.collection ? firstCard.collection.split(' ')[0] : '🃏';
            
            const isCompleted = owned === total && total > 0;
            const displayName = colName.replace(/-/g, ' ');
            const chapterTitle = isCompleted ? `🏆 ${mestreNames[colName] || 'Mestre de ' + displayName}` : `Capítulo ${displayName}`;
            
            const btn = document.createElement('div');
            btn.className = `livro-capitulo-btn${isCompleted ? ' capitulo-completo' : ''}`;
            btn.id = `btn-capitulo-${colName}`;
            btn.onclick = () => selectChapter(colName);
            btn.innerHTML = `
                <div class="livro-capitulo-info">
                    <span class="livro-capitulo-emoji">${emoji}</span>
                    <span class="livro-capitulo-nome">${chapterTitle}</span>
                </div>
                <span class="livro-capitulo-progresso">${owned}/${total}</span>
            `;
            chaptersListEl.appendChild(btn);
        }
        
        if (firstCol) {
            selectChapter(firstCol);
        }
    }
    
    // Exibir o overlay do livro
    const overlay = document.getElementById('livro-descobertas-overlay');
    if (overlay) {
        overlay.classList.add('active');
        const wrap = overlay.querySelector('.livro-paginas-wrap');
        if (wrap) wrap.scrollLeft = 0;
    }
};

window.activeChapterName = null;

window.selectChapter = function(colName) {
    const chapterOrder = ['expedition', 'Pinturas', 'Dinossauros', 'Livros', 'Comunidade', 'Lendárias', 'Lendas-do-Desenho'];
    const oldColName = window.activeChapterName || 'Pinturas';
    
    window.activeChapterName = colName;
    
    document.querySelectorAll('.livro-capitulo-btn').forEach(btn => {
        btn.classList.remove('ativo');
    });
    const activeBtn = document.getElementById(`btn-capitulo-${colName}`);
    if (activeBtn) activeBtn.classList.add('ativo');
    
    const gradeEl = document.getElementById('livro-grade-conteudo');
    const detalhesEl = document.getElementById('livro-detalhes-conteudo');
    const expeditionEl = document.getElementById('livro-expedition-conteudo');
    const guideEl = document.getElementById('livro-regras-conteudo');
    
    // Encontrar qual painel estava visível antes do clique
    const panels = [gradeEl, detalhesEl, expeditionEl, guideEl];
    const oldPanel = panels.find(p => p && p.style.display !== 'none');
    
    // Determinar novo painel
    let newPanel = null;
    if (colName === 'expedition') {
        newPanel = expeditionEl;
        renderWeeklyExpeditionPage();
    } else {
        newPanel = gradeEl;
        renderChapterGrid(colName);
    }
    
    // Determinar direção baseado na ordem
    const oldIdx = chapterOrder.indexOf(oldColName);
    const newIdx = chapterOrder.indexOf(colName);
    const direction = newIdx >= oldIdx ? 'next' : 'prev';
    
    // Rodar a virada de página
    window.triggerPageFlipAnimation(oldPanel, newPanel, direction);
    
    const wrap = document.querySelector('.livro-paginas-wrap');
    if (wrap && window.innerWidth <= 768) {
        wrap.scrollTo({ left: wrap.clientWidth, behavior: 'smooth' });
    }
};

window.renderChapterGrid = function(colName) {
    const catalog = window.globalCatalog || [];
    const cardsInCol = catalog.filter(c => (c.collection ? c.collection.split(' ')[1] : 'Geral') === colName);
    
    const owned = cardsInCol.filter(c => window.isDiscoveryOwned(c)).length;
    const total = cardsInCol.length;
    const pct = Math.round((owned / total) * 100);
    
    const firstCard = cardsInCol[0];
    const emoji = firstCard && firstCard.collection ? firstCard.collection.split(' ')[0] : '🃏';
    
    const remaining = total - owned;
    const subText = remaining === 0 ? "🏆 Capítulo Completo!" : `Faltam ${remaining} descobertas`;
    const subTextColor = remaining === 0 ? "#ff7675" : "#6c5ce7";
    
    document.getElementById('livro-capitulo-titulo').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:3px; width:100%;">
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <span style="font-weight: 800;">${emoji} Capítulo ${colName}</span>
                <span style="font-size: 1.05rem; font-weight: 800; color: ${owned === total ? '#00b894' : '#636e72'};">${owned}/${total} descobertas</span>
            </div>
            <div style="font-size: 0.88rem; font-weight: 700; color: ${subTextColor}; text-align: left; display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 8px;">
                <span>${subText}</span>
                <button onclick="openChapterGuide('${colName}'); return false;" style="background: none; border: none; color: #6c5ce7; font-weight: 800; cursor: pointer; text-decoration: underline; padding: 0; font-size: 0.85rem; font-family: inherit; display: inline-flex; align-items: center; gap: 4px;">
                    📖 Dicas e Regras
                </button>
            </div>
            ${(owned === total && total > 0) ? `<button class="livro-capitulo-conclusao-share-btn" onclick="openSharePlatformsModal(null, true, false, '${colName}')" style="margin-top: 5px;"><i class="fa-solid fa-trophy"></i> Compartilhar Conclusão</button>` : ''}
        </div>
    `;
    
    const bar = document.getElementById('livro-progresso-bar-preenchida');
    if (bar) {
        bar.style.width = `${pct}%`;
        bar.style.background = owned === total 
            ? 'linear-gradient(90deg, #00b894, #55efc4)' 
            : 'linear-gradient(90deg, #6c5ce7, #a29bfe)';
    }

    // Identificar a primeira descoberta pendente do capítulo (para Meta Recomendada)
    const firstLockedCard = cardsInCol.find(c => !window.isDiscoveryOwned(c));

    const metaBox = document.getElementById('livro-proxima-descoberta-box');
    if (metaBox) {
        if (firstLockedCard) {
            const pistaEl = document.getElementById('livro-proxima-descoberta-pista');
            pistaEl.innerHTML = window.getDynamicClueText(firstLockedCard);
            metaBox.style.display = 'flex';
        } else {
            metaBox.style.display = 'none';
        }
    }
    
    // Renderizar regras de progressão do capítulo
    const chapterRulesMap = {
        'Pinturas': {
            do: ['Pintar desenhos livres ou temáticos', 'Salvar as pinturas finalizadas no perfil', 'Completar metas de total de pinturas'],
            dont: ['Apenas abrir um desenho e fechar', 'Apenas visualizar desenhos de outros pintores', 'Apenas imprimir desenhos em branco']
        },
        'Dinossauros': {
            do: ['Pintar desenhos com o tema Dinossauros', 'Salvar as pinturas de dinossauros no perfil', 'Explorar e colorir novas espécies na galeria'],
            dont: ['Pintar desenhos de outros temas', 'Apenas abrir o desenho de dinossauro sem salvar']
        },
        'Livros': {
            do: ['Criar histórias com nosso gerador de IA', 'Concluir a geração e leitura das histórias', 'Explorar novos temas e capítulos de livros'],
            dont: ['Apenas ler histórias geradas no passado', 'Apenas visualizar as ilustrações sem ler']
        },
        'Comunidade': {
            do: ['Compartilhar seus desenhos no Hall da Fama', 'Receber reações e curtidas dos amigos', 'Interagir de forma positiva na galeria pública'],
            dont: ['Salvar pinturas de modo privado no perfil', 'Enviar o mesmo desenho repetidas vezes']
        },
        'Lendárias': {
            do: ['Completar capítulos inteiros do livro (100%)', 'Concluir as maiores conquistas e desafios difíceis', 'Desbloquear segredos e conquistas ocultas'],
            dont: ['Fazer ações comuns do dia a dia', 'Repetir conquistas que você já possui']
        },
        'Lendas-do-Desenho': {
            do: ['Desenhar e pintar o tema exato proposto nas cartas bloqueadas', 'Salvar os desenhos finalizados no perfil', 'Completar o desafio proposto'],
            dont: ['Apenas abrir um desenho e fechar', 'Colorir desenhos livres normais sem desafio']
        }
    };
    
    const regrasBox = document.getElementById('livro-regras-capitulo-box');
    if (regrasBox) {
        const rule = chapterRulesMap[colName];
        if (rule) {
            regrasBox.innerHTML = `
                <div class="livro-regras-title">
                    <i class="fa-solid fa-circle-info" style="color: var(--color-purple); font-size: 0.95rem;"></i>
                    <span>Como avançar no Capítulo ${colName}?</span>
                </div>
                <div class="livro-regras-columns">
                    <div class="livro-regras-col-do">
                        <div style="font-size: 0.7rem; font-weight: 900; color: #2ecc71; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">👍 Conta Progresso</div>
                        <ul style="margin: 0; padding: 0; list-style: none; font-size: 0.8rem; line-height: 1.4; color: #334155;">
                            ${rule.do.map(item => `<li style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 4px;"><span>✅</span> <span>${item}</span></li>`).join('')}
                        </ul>
                    </div>
                    <div class="livro-regras-col-dont">
                        <div style="font-size: 0.7rem; font-weight: 900; color: #e74c3c; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">👎 Não Conta</div>
                        <ul style="margin: 0; padding: 0; list-style: none; font-size: 0.8rem; line-height: 1.4; color: #64748b;">
                            ${rule.dont.map(item => `<li style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 4px;"><span>❌</span> <span>${item}</span></li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            regrasBox.style.display = 'block';
        } else {
            regrasBox.style.display = 'none';
        }
    }
    
    const grid = document.getElementById('livro-descobertas-grid');
    if (grid) {
        grid.innerHTML = '';
        cardsInCol.forEach(c => {
            const hasCard = window.isDiscoveryOwned(c);
            const rarity = c.rarity || 'Comum';
            const cssClass = 'rarity-' + rarity.toLowerCase().replace('á', 'a').replace('é', 'e');
            const cardIdStr = c.id || c.value;
            
            const card = document.createElement('div');
            
            const rarityText = rarity.toUpperCase();

            if (hasCard) {
                card.className = `livro-card-descoberta ${cssClass}`;
                card.onclick = () => showDiscoveryDetails(cardIdStr);
                card.innerHTML = `
                    <div class="livro-card-rarity-tag">${rarityText}</div>
                    <div class="livro-card-img-container">
                        <img src="${c.imageUrl}" class="livro-card-img" alt="${c.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="livro-card-fallback-emoji" style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size:3.5rem; background:linear-gradient(135deg, #a29bfe, #74b9ff); border-radius:8px;">${c.emoji || '🃏'}</div>
                    </div>
                    <div class="livro-card-nome">${c.name}</div>
                `;
            } else {
                const isDrawingChallenge = c.collection && c.collection.includes('Lendas-do-Desenho');
                card.className = `livro-card-descoberta bloqueado ${cssClass}${isDrawingChallenge ? ' desafio-desenho' : ''}`;
                card.onclick = () => showDiscoveryDetails(cardIdStr);
                
                if (isDrawingChallenge) {
                    card.title = `Desenhe um ${c.drawingSubject || 'desenho'} e salve para ganhar este card!`;
                } else {
                    card.title = 'Clique para ver a pista desta descoberta!';
                }
                
                const isMythic = rarity === 'Mítica';
                const lockEmoji = isMythic ? '👑' : '🔒';
                const cardNameText = c.name;
                
                if (isDrawingChallenge) {
                    card.innerHTML = `
                        <div class="livro-card-rarity-tag">${rarityText}</div>
                        <div class="livro-card-img-container">
                            <img src="${c.imageUrl}" class="livro-card-img" alt="${c.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="livro-card-fallback-emoji" style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size:3.5rem; background:linear-gradient(135deg, #ffeaa7, #fdcb6e); border-radius:8px;">${c.emoji || '🎨'}</div>
                            <div class="livro-cadeado-overlay">
                                <span>🎨</span>
                                <span>Desenhe para desbloquear!</span>
                            </div>
                        </div>
                        <div class="livro-card-nome">${cardNameText}</div>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="livro-card-rarity-tag">${rarityText}</div>
                        <div class="livro-card-img-container">
                            <img src="${c.imageUrl}" class="livro-card-img" alt="${c.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="livro-card-fallback-emoji" style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size:3.5rem; background:linear-gradient(135deg, #e2e8f0, #cbd5e1); border-radius:8px;">${c.emoji || '🃏'}</div>
                            <div class="livro-cadeado-overlay">${lockEmoji}</div>
                        </div>
                        <div class="livro-card-nome">${cardNameText}</div>
                    `;
                }
            }
            grid.appendChild(card);
        });
    }

    // Disparar overlay de celebração ao atingir 20/20
    if (owned === total && total > 0) {
        const celebratedKey = `celebrated_chapter_${currentUser.id || currentUser.email || 'anon'}_${colName}`;
        if (!localStorage.getItem(celebratedKey)) {
            showChapterCompletionCelebration(colName);
            localStorage.setItem(celebratedKey, 'true');
        }
    }
};

window.showDiscoveryDetails = function(discoveryId) {
    if (!currentUser) return;
    let c = (window.globalCatalog || []).find(gc => (gc.id === discoveryId) || (gc.value === discoveryId));
    if (!c) return;
    let isOwned = window.isDiscoveryOwned(c);
    
    const rarity = c.rarity || 'Comum';
    const colParts = c.collection ? c.collection.split(' ') : ['Geral', '1/20'];
    const colName = colParts[1] || colParts[0];
    
    let rarityColor = '#00b894';
    if (rarity === 'Rara') rarityColor = '#0984e3';
    else if (rarity === 'Épica') rarityColor = '#6c5ce7';
    else if (rarity === 'Mítica') rarityColor = '#d35400';
    
    const detailsEl = document.getElementById('livro-detalhes-conteudo');
    if (!detailsEl) return;

    const activeTheme = (currentActiveEvent && currentActiveEvent.active && currentActiveEvent.week) ? currentActiveEvent.week.theme : null;
    let hintText = c.unlockHint;
    if (discoveryId === 'expedicao_01' && activeTheme) {
        let themeName = 'Semana de ' + activeTheme;
        if (activeTheme === 'Dinossauros') themeName = 'Semana dos Dinossauros';
        else if (activeTheme === 'Piratas') themeName = 'Semana dos Piratas';
        hintText = `Complete todas as missões da ${themeName}`;
    }

    if (isOwned) {
        const obtidoEm = c.obtidoEm || 'Aventura Mágica';
        const curiosity = c.curiosity || 'Uma grande conquista no KidCanvas!';
        const dateStr = new Date().toLocaleDateString('pt-BR');
        
        detailsEl.innerHTML = `
            <div class="livro-detalhes-container details-rarity-${rarity.toLowerCase().replace('á', 'a').replace('é', 'e')}">
                <div class="livro-detalhes-header">
                    <span style="font-weight:900; color:${rarityColor}; font-size:0.85rem; background:rgba(0,0,0,0.04); padding:4px 10px; border-radius:20px; display:inline-flex; align-items:center; gap:4px;">
                        ${rarity.toUpperCase()}
                    </span>
                    <span style="font-size:0.85rem; font-weight:800; color:#888;">Capítulo ${colName}</span>
                </div>
                
                <div class="livro-detalhes-img-box" style="position: relative; display: flex; align-items: center; justify-content: center; min-height: 150px;">
                    <img src="${c.imageUrl}" alt="${c.name}" class="livro-detalhes-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="livro-card-fallback-emoji" style="display:none; width:100%; height:150px; align-items:center; justify-content:center; font-size:4.5rem; background:linear-gradient(135deg, #a29bfe, #74b9ff); border-radius:12px;">${c.emoji || '🃏'}</div>
                </div>
                
                <h2 style="margin: 0; color:#2d3436; font-size:1.4rem; font-weight:900; font-family:'Fredoka-Variable',sans-serif; text-align:center;">
                    ${c.name}
                </h2>
                
                <div class="livro-detalhes-curiosidade">
                    <div style="font-weight:900; color:#6c5ce7; font-size:0.75rem; margin-bottom:4px; letter-spacing:0.5px;">📚 SABIA QUE?</div>
                    <div>${curiosity}</div>
                </div>
                
                <div style="display:flex; gap:10px; width:100%;">
                    <div class="livro-detalhes-info-card" style="flex:1;">
                        <div class="livro-detalhes-label">🏆 STATUS</div>
                        <div class="livro-detalhes-val" style="font-size:0.85rem; color:#00b894; font-weight:800;">✅ Desbloqueada</div>
                    </div>
                    <div class="livro-detalhes-info-card" style="flex:1;">
                        <div class="livro-detalhes-label">📅 DATA DE DESBLOQUEIO</div>
                        <div class="livro-detalhes-val" style="font-size:0.85rem;">${dateStr}</div>
                    </div>
                </div>
                
                <button class="livro-detalhes-voltar-btn" onclick="voltarParaGrade()">
                    ← Voltar às Descobertas
                </button>
                
                <div class="livro-compartilhar-secao">
                    <h4 class="livro-compartilhar-titulo">🎁 Compartilhar Descoberta</h4>
                    <div class="livro-compartilhar-botoes-grid">
                        <button class="livro-share-btn imprimir" onclick="printDiscovery('${discoveryId}')">
                            <i class="fa-solid fa-print"></i> Imprimir
                        </button>
                        <button class="livro-share-btn baixar" onclick="downloadDiscoveryImage('${discoveryId}')">
                            <i class="fa-solid fa-download"></i> Baixar Imagem
                        </button>
                        <button class="livro-share-btn compartilhar" onclick="openSharePlatformsModal('${discoveryId}')">
                            <i class="fa-solid fa-share-nodes"></i> Compartilhar
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Modo Bloqueado: Ficha de Mistério / Pista
        const cardName = c.name;
        const cardImgStyle = "filter: blur(6px); opacity: 0.4;";
        
        const progress = window.getDiscoveryProgress(c);
        let progressHtml = '';
        if (progress && progress.target > 0) {
            progressHtml = `
                <div class="livro-detalhes-progresso-box" style="margin-top: 15px; background: rgba(0, 0, 0, 0.03); padding: 12px; border-radius: 12px; text-align: center; width: 100%;">
                    <div style="font-weight: 850; color: #555; font-size: 0.82rem; margin-bottom: 5px; letter-spacing: 0.5px; text-transform: uppercase;">Progresso Atual</div>
                    <div style="font-size: 1.35rem; font-weight: 900; color: #6c5ce7; font-family: 'Fredoka-Variable', sans-serif;">
                        ${progress.current} / ${progress.target}
                    </div>
                    <div style="width: 100%; height: 8px; background: #dfe6e9; border-radius: 10px; margin-top: 8px; overflow: hidden;">
                        <div style="width: ${Math.min(100, Math.round((progress.current / progress.target) * 100))}%; height: 100%; background: linear-gradient(90deg, #6c5ce7, #a29bfe); border-radius: 10px;"></div>
                    </div>
                </div>
            `;
        } else if (rarity === 'Mítica') {
            progressHtml = `
                <div class="livro-detalhes-progresso-box" style="margin-top: 15px; background: rgba(0, 0, 0, 0.03); padding: 12px; border-radius: 12px; text-align: center; width: 100%;">
                    <div style="font-weight: 850; color: #555; font-size: 0.82rem; margin-bottom: 5px; letter-spacing: 0.5px; text-transform: uppercase;">Requisito Especial</div>
                    <div style="font-size: 0.95rem; font-weight: 800; color: #d35400; font-family: 'Fredoka-Variable', sans-serif;">
                        Obtenha todas as outras descobertas deste capítulo!
                    </div>
                </div>
            `;
        }
        
        let actionButtonHtml = '';
        if (c.unlockCondition) {
            const condType = c.unlockCondition.type || '';
            const target = c.unlockCondition.category || c.unlockCondition.target || '';
            
            let btnText = '';
            let btnPath = '';
            let onclickAction = '';
            
            if (condType === 'drawing_challenge') {
                btnText = '🎨 Ir Desenhar Agora';
                btnPath = '/pintar-online';
                onclickAction = `startDrawingChallenge('${discoveryId}')`;
            } else if (discoveryId === 'expedicao_01' && activeTheme) {
                btnText = '🗺️ Ver Expedição Atual';
                btnPath = 'expedition';
                onclickAction = `handleDiscoveryActionClick('${btnPath}')`;
            } else if (condType === 'paint_count' || condType === 'categories_painted' || condType === 'paint' || (condType === 'category_paint' && !target) || (condType === 'paint_category' && !target)) {
                btnText = '🎨 Ir Pintar Agora';
                btnPath = '/gerar-desenho';
                onclickAction = `handleDiscoveryActionClick('${btnPath}')`;
            } else if ((condType === 'category_paint' || condType === 'paint_category') && target) {
                btnText = '🎨 Ir Pintar Agora';
                btnPath = `/categoria/${target}`;
                onclickAction = `handleDiscoveryActionClick('${btnPath}')`;
            } else if (condType === 'share_count' || condType === 'hall_count' || condType === 'likes_count' || condType === 'share' || condType === 'paint_category_public') {
                btnText = '🌟 Compartilhar Pintura';
                btnPath = '/hall-da-fama';
                onclickAction = `handleDiscoveryActionClick('${btnPath}')`;
            }
            
            if (btnText && btnPath) {
                actionButtonHtml = `
                    <button class="livro-detalhes-action-btn" onclick="${onclickAction}" style="margin-top: 15px; width: 100%; padding: 12px; background: #6c5ce7; color: white; border: none; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s, background-color 0.2s; box-shadow: 0 4px 6px rgba(108, 92, 231, 0.2);" onmouseover="this.style.background='#5b4bc4'; this.style.transform='scale(1.02)';" onmouseout="this.style.background='#6c5ce7'; this.style.transform='scale(1)';">
                        ${btnText}
                    </button>
                `;
            }
        }
        
        detailsEl.innerHTML = `
            <div class="livro-detalhes-container details-rarity-${rarity.toLowerCase().replace('á', 'a').replace('é', 'e')}">
                <div class="livro-detalhes-header">
                    <span style="font-weight:900; color:${rarityColor}; font-size:0.85rem; background:rgba(0,0,0,0.04); padding:4px 10px; border-radius:20px; display:inline-flex; align-items:center; gap:4px;">
                        🔒 BLOQUEADA (${rarity.toUpperCase()})
                    </span>
                    <span style="font-size:0.85rem; font-weight:800; color:#888;">Capítulo ${colName}</span>
                </div>
                
                <div class="livro-detalhes-img-box" style="position: relative; background: #f1f2f6; display: flex; align-items: center; justify-content: center; min-height: 150px;">
                    <img src="${c.imageUrl}" alt="${c.name}" class="livro-detalhes-img" style="${cardImgStyle}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="livro-card-fallback-emoji" style="display:none; width:100%; height:150px; align-items:center; justify-content:center; font-size:4.5rem; background:linear-gradient(135deg, #ffeaa7, #fdcb6e); border-radius:12px; filter: blur(3px); opacity: 0.5;">${c.emoji || '🎨'}</div>
                    <div style="position: absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:3.5rem; color:#ffffff; text-shadow:0 2px 6px rgba(0,0,0,0.4); pointer-events: none;">🔒</div>
                </div>
                
                <h2 style="margin: 0; color:#7f8c8d; font-size:1.4rem; font-weight:900; font-family:'Fredoka-Variable',sans-serif; text-align:center;">
                    ${cardName}
                </h2>
                
                <div class="livro-detalhes-bloqueado-curiosidade" style="margin-top: 15px; padding: 12px; background: #fff8e1; border: 1px solid #ffe082; border-radius: 12px; width: 100%;">
                    <div class="livro-detalhes-bloqueado-pista-title" style="font-weight: 900; color: #ff8f00; font-size: 0.8rem; margin-bottom: 4px; letter-spacing: 0.5px;">🤔 COMO DESBLOQUEAR</div>
                    <div style="font-weight: 800; color: #5d4037; font-size: 0.95rem;">${hintText}</div>
                </div>

                ${actionButtonHtml}

                ${progressHtml}
                
                <button class="livro-detalhes-voltar-btn" onclick="voltarParaGrade()" style="margin-top:20px; width: 100%;">
                    ← Voltar às Descobertas
                </button>
            </div>
        `;
    }
    
    document.getElementById('livro-grade-conteudo').style.display = 'none';
    detailsEl.style.display = 'flex';
};

window.startDrawingChallenge = async function(discoveryId) {
    if (!currentUser) return;
    
    if (!window.globalCatalog) {
        try {
            const res = await fetch('/api/store/catalog');
            const data = await res.json();
            if (data.success) {
                window.globalCatalog = data.catalog;
            }
        } catch (e) {
            console.error('Erro ao carregar catálogo sob demanda:', e);
        }
    }
    
    if (!window.globalCatalog) {
        showToast('Não foi possível carregar o catálogo de desafios no momento.', 'error');
        return;
    }
    
    const c = window.globalCatalog.find(gc => 
        (gc.id === discoveryId) || 
        (gc.value === discoveryId) || 
        (gc.name === discoveryId)
    );
    if (!c) {
        showToast('Desafio de desenho não encontrado no catálogo.', 'error');
        return;
    }
    
    // Fechar o modal
    if (typeof closeAlbumModal === 'function') {
        closeAlbumModal();
    } else if (typeof window.closeAlbumModal === 'function') {
        window.closeAlbumModal();
    }
    
    // Configurar o desafio ativo
    const subject = (c.unlockCondition && c.unlockCondition.subject) || c.drawingSubject || c.name || '';
    window.activeDrawingChallenge = {
        id: c.id,
        name: c.name,
        subject: subject
    };
    sessionStorage.setItem('kidcanvas_active_challenge', JSON.stringify(window.activeDrawingChallenge));
    
    // Garantir exibição imediata da barra de desafios se estivermos indo para a tela de pintura
    const challengeBar = document.getElementById('paint-challenge-bar');
    const challengeText = document.getElementById('paint-challenge-text');
    if (challengeText) {
        challengeText.textContent = `Desafio ativo: desenhe um ${window.activeDrawingChallenge.subject} para desbloquear ${window.activeDrawingChallenge.name}.`;
    }
    if (challengeBar) {
        challengeBar.style.display = 'flex';
    }
    
    // Iniciar desenho livre
    startFreeHandDrawing();
};

window.cancelActiveDrawingChallenge = function() {
    window.activeDrawingChallenge = null;
    sessionStorage.removeItem('kidcanvas_active_challenge');
    const challengeBar = document.getElementById('paint-challenge-bar');
    if (challengeBar) {
        challengeBar.style.display = 'none';
    }
    showToast('Desafio de desenho cancelado.', 'info');
};

window.handleDiscoveryActionClick = function(targetPath) {
    if (typeof closeAlbumModal === 'function') {
        closeAlbumModal();
    } else if (typeof window.closeAlbumModal === 'function') {
        window.closeAlbumModal();
    }
    
    if (typeof navigate === 'function') {
        navigate(targetPath);
    } else {
        window.location.href = targetPath;
    }
};

window.voltarParaGrade = function() {
    document.getElementById('livro-grade-conteudo').style.display = 'flex';
    document.getElementById('livro-detalhes-conteudo').style.display = 'none';
};

window.closeAlbumModal = function() {
    const overlay = document.getElementById('livro-descobertas-overlay');
    if (overlay) overlay.classList.remove('active');
    if (window.livroDicasInterval) {
        clearInterval(window.livroDicasInterval);
        window.livroDicasInterval = null;
    }
};

window.voltarParaCapitulos = function() {
    const wrap = document.querySelector('.livro-paginas-wrap');
    if (wrap) {
        wrap.scrollTo({ left: 0, behavior: 'smooth' });
    }
};

window.printDiscovery = function(discoveryId) {
    const catalog = window.globalCatalog || [];
    const c = catalog.find(gc => (gc.id === discoveryId) || (gc.value === discoveryId));
    if (!c) {
        showToast('Descoberta não encontrada.', 'error');
        return;
    }
    
    const rarity = c.rarity || 'Comum';
    const colParts = c.collection ? c.collection.split(' ') : ['Geral', '1/20'];
    const colName = colParts[0];
    const explorerName = (currentUser && (currentUser.name || currentUser.email.split('@')[0])) || 'Pequeno Explorador';
    const discoveryDate = new Date().toLocaleDateString('pt-BR');
    
    let rarityColor = '#00b894';
    if (rarity === 'Rara') rarityColor = '#0984e3';
    else if (rarity === 'Épica') rarityColor = '#6c5ce7';
    else if (rarity === 'Mítica') rarityColor = '#d35400';

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
        showToast('Por favor, ative os pop-ups para imprimir seu certificado!', 'warning');
        return;
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Certificado - ${c.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Fredoka', sans-serif;
                margin: 0;
                padding: 40px;
                background-color: #f9f9f5;
                color: #2d3436;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                box-sizing: border-box;
            }
            .certificate-border {
                border: 10px double #fdcb6e;
                border-radius: 20px;
                padding: 30px;
                background: white;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                max-width: 750px;
                width: 100%;
                text-align: center;
                position: relative;
                box-sizing: border-box;
            }
            .certificate-border::before {
                content: '';
                position: absolute;
                top: 5px; left: 5px; right: 5px; bottom: 5px;
                border: 2px solid #fdcb6e;
                border-radius: 14px;
                pointer-events: none;
            }
            .header-title {
                font-family: 'Playfair Display', serif;
                font-size: 2.2rem;
                font-weight: 700;
                color: #d35400;
                margin: 0 0 5px 0;
                letter-spacing: 1px;
            }
            .subtitle {
                font-size: 1rem;
                font-weight: 700;
                color: #7f8c8d;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 25px;
            }
            .badge-rarity {
                display: inline-block;
                padding: 6px 16px;
                border-radius: 20px;
                color: white;
                font-weight: 900;
                font-size: 0.9rem;
                margin-bottom: 25px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .img-container {
                margin: 15px auto;
                width: 320px;
                height: 320px;
                border-radius: 24px;
                overflow: hidden;
                border: 6px solid #f1f2f6;
                box-shadow: 0 6px 18px rgba(0,0,0,0.08);
                background: #fdfdfd;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .img-container img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .card-name {
                font-size: 2rem;
                font-weight: 900;
                color: #2c3e50;
                margin: 10px 0 5px 0;
                font-family: 'Fredoka', sans-serif;
            }
            .chapter-tag {
                font-size: 0.95rem;
                font-weight: 700;
                color: #888;
                margin-bottom: 20px;
            }
            .curiosity-box {
                background: #fdfaf2;
                border-left: 5px solid #fdcb6e;
                border-radius: 8px;
                padding: 18px 24px;
                margin: 20px auto;
                max-width: 600px;
                font-size: 0.95rem;
                line-height: 1.6;
                text-align: left;
                font-style: italic;
                color: #34495e;
            }
            .curiosity-title {
                font-weight: 900;
                color: #d35400;
                font-size: 0.8rem;
                margin-bottom: 6px;
                letter-spacing: 1px;
                font-style: normal;
            }
            .info-section {
                display: flex;
                justify-content: space-around;
                margin-top: 35px;
                border-top: 2px dashed #eee;
                padding-top: 25px;
            }
            .info-block {
                text-align: center;
            }
            .info-label {
                font-size: 0.75rem;
                font-weight: 700;
                color: #95a5a6;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 5px;
            }
            .info-value {
                font-size: 1.1rem;
                font-weight: 700;
                color: #2d3436;
            }
            .signature-line {
                margin-top: 10px;
                border-top: 1px solid #ccc;
                width: 150px;
                margin-left: auto;
                margin-right: auto;
            }
            .footer-branding {
                margin-top: 30px;
                font-size: 0.85rem;
                font-weight: 700;
                color: #bdc3c7;
                letter-spacing: 1px;
            }
            .footer-branding span {
                color: #e17055;
            }
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                .certificate-border {
                    box-shadow: none;
                    border-color: #fdcb6e !important;
                    margin: 0 auto;
                }
                .no-print {
                    display: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="certificate-border">
            <div class="header-title">📖 Livro das Descobertas</div>
            <div class="subtitle">Certificado de Grande Explorador</div>
            
            <div class="badge-rarity" style="background-color: ${rarityColor};">
                ★ Descoberta ${rarity}
            </div>
            
            <div class="img-container">
                <img src="${c.imageUrl}" alt="${c.name}" onerror="this.src='/favicon-64x64.png'">
            </div>
            
            <div class="card-name">${c.name}</div>
            <div class="chapter-tag">Capítulo ${colName}</div>
            
            <div class="curiosity-box">
                <div class="curiosity-title">💡 SABIA QUE?</div>
                "${c.curiosity || 'Uma incrível descoberta catalogada nas aventuras do KidCanvas!'}"
            </div>
            
            <div class="info-section">
                <div class="info-block">
                    <div class="info-label">Explorador Oficial</div>
                    <div class="info-value" style="font-family: 'Playfair Display', serif; font-style: italic; color: #2980b9;">
                        ${explorerName}
                    </div>
                    <div class="signature-line"></div>
                </div>
                <div class="info-block">
                    <div class="info-label">Data da Descoberta</div>
                    <div class="info-value">${discoveryDate}</div>
                </div>
            </div>
            
            <div class="footer-branding">
                KidCanvas<span>.com.br</span>
            </div>
        </div>
        
        <script>
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            };
        </script>
    </body>
    </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

window.downloadDiscoveryImage = function(discoveryId, isChapterComplete = false, isMythicShare = false, chapterName = '') {
    showToast('Preparando sua imagem... 🎨', 'info');
    
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    
    // Configurar o fundo
    let gradient = ctx.createLinearGradient(0, 0, 0, 1350);
    let cardTitle = 'LIVRO DAS DESCOBERTAS';
    let cardSub = '';
    let nameText = '';
    let description = '';
    let imageUrl = '';
    let rarityColor = '#ffeaa7';
    
    if (isChapterComplete) {
        gradient.addColorStop(0, '#f39c12');
        gradient.addColorStop(0.5, '#fdcb6e');
        gradient.addColorStop(1, '#e67e22');
        cardTitle = 'CONQUISTA MÁXIMA 🏆';
        cardSub = `Mestre dos ${chapterName}`;
        nameText = '20/20 Descobertas';
        description = 'Parabéns! Você encontrou todas as descobertas deste capítulo e provou ser um verdadeiro explorador!';
    } else {
        const catalog = window.globalCatalog || [];
        const c = catalog.find(gc => (gc.id === discoveryId) || (gc.value === discoveryId));
        if (!c) {
            showToast('Erro ao carregar card.', 'error');
            return;
        }
        imageUrl = c.imageUrl;
        nameText = c.name;
        description = c.curiosity || 'Uma descoberta misteriosa catalogada nas aventuras do KidCanvas!';
        const rarity = c.rarity || 'Comum';
        cardSub = `Capítulo ${c.collection ? c.collection.split(' ')[0] : 'Geral'}`;
        
        if (isMythicShare || rarity === 'Mítica') {
            gradient.addColorStop(0, '#1e272e');
            gradient.addColorStop(0.5, '#d35400');
            gradient.addColorStop(1, '#1e272e');
            cardTitle = isMythicShare ? 'EU ENCONTREI UMA DESCOBERTA MÍTICA!' : 'DESCOBERTA MÍTICA 👑';
            rarityColor = '#d35400';
        } else if (rarity === 'Épica') {
            gradient.addColorStop(0, '#2c3e50');
            gradient.addColorStop(0.5, '#6c5ce7');
            gradient.addColorStop(1, '#2c3e50');
            cardTitle = 'DESCOBERTA ÉPICA 🟣';
            rarityColor = '#6c5ce7';
        } else if (rarity === 'Rara') {
            gradient.addColorStop(0, '#1e3799');
            gradient.addColorStop(0.5, '#0984e3');
            gradient.addColorStop(1, '#1e3799');
            cardTitle = 'DESCOBERTA RARA 🔵';
            rarityColor = '#0984e3';
        } else {
            // Comum
            gradient.addColorStop(0, '#1b8a5a');
            gradient.addColorStop(0.5, '#00b894');
            gradient.addColorStop(1, '#1b8a5a');
            cardTitle = 'DESCOBERTA ENCONTRADA 🟢';
            rarityColor = '#00b894';
        }
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1350);
    
    // Desenhar Borda Ornamental
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 15;
    ctx.strokeRect(40, 40, 1000, 1270);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 960, 1230);
    
    // Título Superior
    ctx.fillStyle = '#ffffff';
    ctx.font = "900 38px 'Fredoka', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('LIVRO DAS DESCOBERTAS', 540, 120);
    
    // Subtítulo / Rara / Mítica Badge
    ctx.fillStyle = '#ffeaa7';
    ctx.font = "900 28px 'Fredoka', sans-serif";
    ctx.fillText(cardTitle.toUpperCase(), 540, 175);
    
    // Função para finalizar a montagem do card após a imagem estar carregada
    const renderCardContent = (imgSource) => {
        // Quadro de Imagem Central
        const imgX = 140;
        const imgY = 240;
        const imgW = 800;
        const imgH = 600;
        
        // Desenhar Sombra do Quadro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(imgX + 10, imgY + 10, imgW, imgH, 32);
        } else {
            ctx.rect(imgX + 10, imgY + 10, imgW, imgH);
        }
        ctx.fill();
        
        // Fundo do Quadro
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(imgX, imgY, imgW, imgH, 32);
        } else {
            ctx.rect(imgX, imgY, imgW, imgH);
        }
        ctx.fill();
        
        if (imgSource) {
            // Desenhar a imagem recortada com cantos arredondados
            ctx.save();
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(imgX + 12, imgY + 12, imgW - 24, imgH - 24, 24);
            } else {
                ctx.rect(imgX + 12, imgY + 12, imgW - 24, imgH - 24);
            }
            ctx.clip();
            ctx.drawImage(imgSource, imgX + 12, imgY + 12, imgW - 24, imgH - 24);
            ctx.restore();
        } else {
            // Desenhar um grande troféu ou placeholder se for conclusão de capítulo
            ctx.fillStyle = '#fd9644';
            ctx.font = "260px 'Fredoka', sans-serif";
            ctx.fillText('🏆', 540, imgY + 390);
        }
        
        // Nome da Descoberta
        ctx.fillStyle = '#ffffff';
        ctx.font = "900 72px 'Fredoka', sans-serif";
        ctx.fillText(nameText, 540, 930);
        
        // Nome do capítulo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = "700 32px 'Fredoka', sans-serif";
        ctx.fillText(cardSub, 540, 985);
        
        // Caixa de Curiosidade
        const boxX = 140;
        const boxY = 1025;
        const boxW = 800;
        const boxH = 175;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(boxX, boxY, boxW, boxH, 20);
        } else {
            ctx.rect(boxX, boxY, boxW, boxH);
        }
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(boxX, boxY, boxW, boxH, 20);
        } else {
            ctx.rect(boxX, boxY, boxW, boxH);
        }
        ctx.stroke();
        
        // Texto Curiosidade
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        
        ctx.font = "900 24px 'Fredoka', sans-serif";
        ctx.fillStyle = '#ffeaa7';
        ctx.fillText('💡 SABIA QUE?', boxX + 35, boxY + 45);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = "italic 24px 'Fredoka', sans-serif";
        
        // Função de quebra de linha
        const wrapText = (text, x, y, maxWidth, lineHeight) => {
            const words = text.split(' ');
            let line = '';
            let currentY = y;
            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                let testWidth = ctx.measureText(testLine).width;
                if (testWidth > maxWidth && n > 0) {
                    ctx.fillText(line, x, currentY);
                    line = words[n] + ' ';
                    currentY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, currentY);
        };
        
        wrapText(description, boxX + 35, boxY + 88, boxW - 70, 32);
        
        // Rodapé
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = "900 30px 'Fredoka', sans-serif";
        ctx.fillText('🎨 kidcanvas.com.br', 540, 1275);
        
        // Salvar imagem e forçar download
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            const safeName = nameText.toLowerCase().replace(/[^a-z0-9]/g, '_');
            link.download = `kidcanvas_${safeName}.png`;
            link.href = dataUrl;
            link.click();
            showToast('Imagem baixada com sucesso! 🚀', 'success');
        } catch(e) {
            console.error('Erro ao gerar download da imagem:', e);
            showToast('Erro ao converter imagem do canvas.', 'error');
        }
    };
    
    if (imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            renderCardContent(img);
        };
        img.onerror = () => {
            console.error('Erro ao carregar imagem para canvas:', imageUrl);
            renderCardContent(null);
        };
        img.src = imageUrl;
    } else {
        renderCardContent(null);
    }
};

window.activeShareData = { discoveryId: null, isChapterComplete: false, isMythicShare: false, chapterName: '' };

window.openSharePlatformsModal = function(discoveryId, isChapterComplete = false, isMythicShare = false, chapterName = '') {
    window.activeShareData = { discoveryId, isChapterComplete, isMythicShare, chapterName };
    const overlay = document.getElementById('livro-share-platforms-overlay');
    if (overlay) {
        overlay.classList.add('active');
    }
};

window.closeSharePlatformsModal = function() {
    const overlay = document.getElementById('livro-share-platforms-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

window.triggerPlatformShare = async function(platform) {
    const data = window.activeShareData;
    let shareText = '';
    const websiteUrl = 'https://www.kidcanvas.com.br';
    
    const collectionEmojis = {
        'Dinossauros': '🦖',
        'Animais': '🦊',
        'Fantasia': '✨',
        'Veículos': '🚗',
        'Oceano': '🌊',
        'Espaço': '🚀'
    };

    if (data.isChapterComplete) {
        shareText = `🏆 Mestre dos ${data.chapterName}!\n\nAcabei de completar todas as 20/20 descobertas do capítulo de ${data.chapterName} no KidCanvas! 🎉\n\n🎁 Comece sua coleção gratuitamente:\n${websiteUrl}`;
    } else {
        const catalog = window.globalCatalog || [];
        const c = catalog.find(gc => (gc.id === data.discoveryId) || (gc.value === data.discoveryId));
        if (c) {
            const colName = c.collection ? c.collection.split(' ')[0] : 'Geral';
            const emoji = collectionEmojis[colName] || '📖';
            const curiosity = c.curiosity || 'Uma descoberta misteriosa!';
            
            if (data.isMythicShare || c.rarity === 'Mítica') {
                shareText = `👑 Eu encontrei uma Descoberta Mítica no Livro das Descobertas do KidCanvas!\n\n🌌 ${c.name.toUpperCase()}\n\n💡 Sabia que?\n${curiosity}\n\n🎁 Comece sua coleção gratuitamente:\n${websiteUrl}`;
            } else {
                shareText = `📖 Acabei de encontrar uma nova descoberta no Livro das Descobertas do KidCanvas!\n\n${emoji} ${c.name.toUpperCase()}\n\n💡 Sabia que?\n${curiosity}\n\n🎁 Comece sua coleção gratuitamente:\n${websiteUrl}`;
            }
        } else {
            shareText = `📖 Acabei de encontrar uma nova descoberta no Livro das Descobertas do KidCanvas!\n\n🎁 Comece sua coleção gratuitamente:\n${websiteUrl}`;
        }
    }

    // Ações por plataforma
    if (platform === 'whatsapp') {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
    } else if (platform === 'telegram') {
        const url = `https://t.me/share/url?url=${encodeURIComponent(websiteUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
    } else if (platform === 'facebook') {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(websiteUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
    } else if (platform === 'copy') {
        try {
            await navigator.clipboard.writeText(shareText);
            showToast('Mensagem de compartilhamento copiada com sucesso! 📋', 'success');
        } catch (err) {
            console.error('Falha ao copiar:', err);
            showToast('Erro ao copiar link.', 'error');
        }
    }

    closeSharePlatformsModal();

    let shareType = 'painting';
    if (data.discoveryId && data.discoveryId.startsWith('social_05')) {
        shareType = 'story';
    }
    window.recordShare(shareType);
};

window.recordShare = async function(shareType) {
    const sessionToken = localStorage.getItem('kidcanvas_session_token') || (currentUser && currentUser.token);
    if (!sessionToken) return;
    try {
        const res = await fetch('/api/user/record-share', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': sessionToken
            },
            body: JSON.stringify({ shareType })
        });
        const resData = await res.json();
        if (resData.success) {
            if (currentUser) {
                currentUser.shareCount = resData.shareCount;
                currentUser.cards = resData.cards || currentUser.cards;
                if (resData.rewardGiven) {
                    currentUser.stars = resData.stars;
                    showToast('+1 estrela recebida! ⭐', 'success');
                } else {
                    console.log('Recompensa de compartilhamento não concedida (limite diário).');
                }
            }
            
            // Recalcular conquistas localmente
            if (typeof checkAllAchievements === 'function') {
                checkAllAchievements();
            }

            // Exibir animação de revelação para cartas recém desbloqueadas
            if (resData.newlyUnlocked && resData.newlyUnlocked.length > 0) {
                resData.newlyUnlocked.forEach(card => {
                    const colName = card.collection ? card.collection.split(' ')[0] : 'Social';
                    revealCardAnimation(card.name, card.rarity, card.imageUrl, card.curiosity, colName);
                });
            }
        }
    } catch (err) {
        console.error('Erro ao registrar compartilhamento:', err);
    }
};

window.openUnlockGuideModal = function(discoveryId) {
    if (!currentUser || !window.globalCatalog) return;
    const c = window.globalCatalog.find(gc => (gc.id === discoveryId) || (gc.value === discoveryId));
    if (!c) return;

    const rarity = c.rarity || 'Comum';
    const parts = c.id.split('_');
    const type = parts[0];
    const num = parseInt(parts[1], 10);
    const colParts = c.collection ? c.collection.split(' ') : ['Geral', '1/20'];
    const colName = colParts[0];

    const myPaintings = currentUser.myPaintings || [];
    const countPaintingsOfCategory = (cats) => {
        return myPaintings.filter(p => cats.includes(p.originalCategory)).length;
    };

    const dinoCount = countPaintingsOfCategory(['dinossauros']);
    const oceanoCount = countPaintingsOfCategory(['animais-do-mar']);
    const fantasiaCount = countPaintingsOfCategory(['fantasia', 'unicornios', 'contos-de-fada']);
    const animalCount = countPaintingsOfCategory(['animais-selvagens', 'animais-domesticos', 'aves', 'fazenda']);
    const veiculoCount = countPaintingsOfCategory(['veiculos']);
    const espacoCount = countPaintingsOfCategory(['espaco']);

    const totalPaintings = myPaintings.length;
    const totalStories = myPaintings.filter(p => p.category === 'Histórias Mágicas' || p.storyData).length;
    const maxColors = Math.max(0, ...myPaintings.map(p => p.colorsCount || 0));

    const inviteCount = currentUser.referredUsers ? currentUser.referredUsers.length : 0;
    const paintingShares = currentUser.paintingShareCount || 0;
    const storyShares = currentUser.storyShareCount || 0;

    let reqText = '';
    let currentVal = 0;
    let targetVal = 0;
    let label = 'pinturas';
    let tip = '';
    let reward = `Desbloquear carta: <strong>${c.name}</strong>`;

    if (rarity === 'Mítica') {
        reqText = 'Completar todas as 19 descobertas anteriores deste capítulo.';
        targetVal = 19;
        const colCards = window.globalCatalog.filter(gc => gc.collection && gc.collection.startsWith(colName));
        const nonMythic = colCards.filter(gc => gc.rarity !== 'Mítica');
        currentVal = nonMythic.filter(gc => window.isDiscoveryOwned(gc)).length;
        label = 'descobertas';
        tip = 'Continue coletando as outras descobertas deste capítulo!';
    } else if (type === 'social') {
        if (num === 1) {
            reqText = 'Convide 1 amigo para explorar o KidCanvas';
            currentVal = inviteCount;
            targetVal = 1;
            label = 'amigo convidado';
            tip = 'Compartilhe seu código de convite com seus amigos!';
        } else if (num === 2) {
            reqText = 'Convide 3 amigos para explorar o KidCanvas';
            currentVal = inviteCount;
            targetVal = 3;
            label = 'amigos convidados';
            tip = 'Envie o link para amigos jogarem juntos e ganharem estrelas!';
        } else if (num === 3) {
            reqText = 'Compartilhe 3 pinturas com outras pessoas';
            currentVal = paintingShares;
            targetVal = 3;
            label = 'pinturas compartilhadas';
            tip = 'Use o botão de Compartilhar após salvar suas pinturas!';
        } else if (num === 4) {
            reqText = 'Compartilhe 10 pinturas com outras pessoas';
            currentVal = paintingShares;
            targetVal = 10;
            label = 'pinturas compartilhadas';
            tip = 'Mostre sua galeria de arte compartilhando mais desenhos!';
        } else if (num === 5) {
            reqText = 'Compartilhe 5 histórias mágicas criadas';
            currentVal = storyShares;
            targetVal = 5;
            label = 'histórias compartilhadas';
            tip = 'Escreva e compartilhe suas histórias mágicas!';
        }
    } else {
        if (num === 1) {
            reqText = 'Pintar e salvar 1 desenho na galeria';
            currentVal = totalPaintings;
            targetVal = 1;
            label = 'desenho pintado';
            tip = 'Vá para a tela de pintura, escolha um desenho e salve no seu perfil!';
        } else if (num === 2) {
            reqText = 'Pintar e salvar 3 desenhos no total';
            currentVal = totalPaintings;
            targetVal = 3;
            label = 'desenhos pintados';
            tip = 'Pratique colorindo mais desenhos e salve todos eles!';
        } else if (num === 3) {
            reqText = 'Usar 10 cores diferentes em uma única pintura';
            currentVal = maxColors;
            targetVal = 10;
            label = 'cores usadas';
            tip = 'Tente usar mais cores da paleta mágica em sua próxima pintura!';
        } else if (num === 4) {
            reqText = 'Criar sua primeira história mágica com a IA';
            currentVal = totalStories;
            targetVal = 1;
            label = 'história criada';
            tip = 'Pinte um desenho, clique em "Criar História" e use sua imaginação!';
        } else if (num === 19) {
            reqText = 'Completar 18 descobertas deste capítulo';
            targetVal = 18;
            const colCards = window.globalCatalog.filter(gc => gc.collection && gc.collection.startsWith(colName));
            const otherCards = colCards.filter(gc => gc.id !== c.id && gc.rarity !== 'Mítica');
            currentVal = otherCards.filter(gc => window.isDiscoveryOwned(gc)).length;
            label = 'descobertas obtidas';
            tip = 'Colete todas as cartas Comuns e Raras deste capítulo!';
        } else {
            const getCountNeeded = (n) => {
                const mapping = {
                    5: 1, 6: 2, 7: 3, 8: 4, 9: 5, 10: 5, 11: 5,
                    12: 6, 13: 7, 14: 8, 15: 10, 16: 12, 17: 14, 18: 16
                };
                return mapping[n] || (n - 4);
            };

            targetVal = getCountNeeded(num);

            if (type === 'dino') { currentVal = dinoCount; label = 'dinossauros pintados'; reqText = `Pintar ${targetVal} desenhos de Dinossauros`; tip = 'Encontre dinossauros na aba de Desenhos e pinte-os!'; }
            else if (type === 'pais') { currentVal = oceanoCount; label = 'criaturas marinhas pintadas'; reqText = `Pintar ${targetVal} desenhos de Oceano`; tip = 'Explore o fundo do mar colorindo peixes e animais marinhos!'; }
            else if (type === 'fant') { currentVal = fantasiaCount; label = 'desenhos de fantasia pintados'; reqText = `Pintar ${targetVal} desenhos de Fantasia`; tip = 'Pinte castelos, elfos, fadas e unicórnios!'; }
            else if (type === 'carro') { currentVal = veiculoCount; label = 'veículos pintados'; reqText = `Pintar ${targetVal} desenhos de Veículos`; tip = 'Pinte carros de corrida, caminhões, barcos e aviões!'; }
            else if (type === 'aviao') { currentVal = espacoCount; label = 'desenhos do espaço pintados'; reqText = `Pintar ${targetVal} desenhos de Espaço`; tip = 'Pinte planetas, nebulosas, astronautas e foguetes!'; }
            else if (type === 'animal') { currentVal = animalCount; label = 'animais pintados'; reqText = `Pintar ${targetVal} desenhos de Animais`; tip = 'Pinte leões, cachorrinhos, zebras e borboletas!'; }
        }
    }

    const pct = Math.min(100, Math.round((currentVal / targetVal) * 100));

    const bodyEl = document.getElementById('livro-unlock-guide-body');
    if (bodyEl) {
        bodyEl.innerHTML = `
            <div class="livro-unlock-guide-item">
                <div class="livro-unlock-guide-label">🎯 REQUISITO</div>
                <div class="livro-unlock-guide-val">${reqText}</div>
            </div>
            
            <div class="livro-unlock-guide-item">
                <div class="livro-unlock-guide-label">📊 PROGRESSO ATUAL</div>
                <div class="livro-unlock-guide-val">${currentVal} / ${targetVal} ${label}</div>
                <div class="livro-unlock-progress-track">
                    <div class="livro-unlock-progress-fill" style="width: ${pct}%;"></div>
                </div>
            </div>
            
            ${tip ? `
            <div class="livro-unlock-guide-item">
                <div class="livro-unlock-guide-label">💡 DICA</div>
                <div class="livro-unlock-guide-val" style="font-size:0.85rem; color:#57606f; font-style:italic;">${tip}</div>
            </div>
            ` : ''}
            
            <div class="livro-unlock-guide-item" style="margin-top:20px; background:#f1f2f6; padding:10px; border-radius:10px; text-align:center; border: 1px dashed #ced6e0;">
                <div class="livro-unlock-guide-label" style="margin-bottom:2px;">🎁 RECOMPENSA</div>
                <div class="livro-unlock-guide-val" style="font-size:0.9rem;">${reward}</div>
            </div>
        `;
    }

    const overlay = document.getElementById('livro-unlock-guide-overlay');
    if (overlay) overlay.classList.add('active');
};

window.closeUnlockGuideModal = function() {
    const overlay = document.getElementById('livro-unlock-guide-overlay');
    if (overlay) overlay.classList.remove('active');
};

window.showChapterCompletionCelebration = function(colName) {
    const overlay = document.getElementById('livro-celebration-overlay');
    if (!overlay) return;
    
    const nameEl = document.getElementById('livro-celebration-chapter-name');
    if (nameEl) nameEl.innerText = colName.replace(/-/g, ' ');
    
    const badgeTitleEl = document.getElementById('livro-celebration-badge-title');
    const mestreNames = {
        'Dinossauros': 'Selo Mestre dos Dinossauros',
        'Animais': 'Selo Mestre dos Animais',
        'Fantasia': 'Selo Mestre da Fantasia',
        'Veículos': 'Selo Mestre dos Veículos',
        'Espaço': 'Selo Mestre do Espaço',
        'Oceano': 'Selo Mestre do Oceano',
        'Lendas-do-Desenho': 'Selo Lenda do Desenho'
    };
    if (badgeTitleEl) {
        badgeTitleEl.innerText = mestreNames[colName] || `Selo Mestre de ${colName.replace(/-/g, ' ')}`;
    }
    
    overlay.classList.add('active');
    
    // Tocar som de vitória se aplicável
    try {
        const audio = new Audio('/sounds/victory.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
    } catch(e) {}
};

window.closeChapterCelebrationModal = function() {
    const overlay = document.getElementById('livro-celebration-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

window.renderWeeklyExpeditionPage = function() {
    const container = document.getElementById('livro-expedition-conteudo');
    if (!container) return;
    
    if (!currentActiveEvent) {
        container.innerHTML = `
            <div style="padding: 30px; text-align: center; font-family: 'Fredoka-Variable', sans-serif;">
                <span style="font-size: 3rem;">⏳</span>
                <h3 style="margin-top: 15px; color: #7f8c8d; font-weight: 800;">Nenhuma Expedição Mágica ativa no momento!</h3>
                <p style="color: #95a5a6; font-weight: 600;">Volte na sexta-feira para começar uma nova aventura!</p>
            </div>
        `;
        return;
    }
    
    const week = currentActiveEvent.week;
    const progress = currentActiveEvent.progress;
    
    const expeditionEmoji = {
        'Dinossauros': '🦖',
        'Animais': '🦊',
        'Fantasia': '✨',
        'Veículos': '🚗',
        'Oceano': '🌊',
        'Espaço': '🚀',
        'Piratas': '⚓'
    }[week.theme] || '✨';
    
    const expeditionTitle = {
        'Dinossauros': 'Expedição Jurássica',
        'Animais': 'Expedição Animal',
        'Fantasia': 'Expedição Fantástica',
        'Veículos': 'Expedição dos Veículos',
        'Oceano': 'Expedição do Oceano',
        'Espaço': 'Expedição Espacial',
        'Piratas': 'Expedição dos Piratas'
    }[week.theme] || `Expedição Mágica: ${week.theme}`;
    
    const categoryRedirectMapping = {
        'Dinossauros': 'dinossauros',
        'Animais': 'animais-selvagens',
        'Fantasia': 'fantasia',
        'Veículos': 'veiculos',
        'Oceano': 'animais-do-mar',
        'Espaço': 'espaco',
        'Piratas': 'guerreiros-e-lendas'
    };
    
    const categorySlug = categoryRedirectMapping[week.theme] || '';

    // Calculate time left
    const endDate = new Date(week.endDate);
    const updateCountdown = () => {
        const timerEl = document.getElementById('livro-exp-timer-text');
        if (!timerEl) return;
        const now = new Date();
        const diff = endDate - now;
        if (diff <= 0) {
            timerEl.innerHTML = '⏰ Terminou!';
            return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        timerEl.innerHTML = `⏰ Termina em: ${d}d ${h}h ${m}m`;
    };
    
    // Clear and build header
    let html = `
        <div class="livro-expedition-header">
            <h2 class="livro-expedition-titulo">${expeditionEmoji} ${expeditionTitle}</h2>
            <div class="livro-expedition-timer" id="livro-exp-timer-text">⏰ Termina em: --</div>
            <p class="livro-expedition-subtitulo" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <span>Complete os objetivos para ajudar a desvendar as páginas secretas do seu Livro das Descobertas!</span>
                <button onclick="openChapterGuide('expedition'); return false;" style="background: none; border: none; color: #6c5ce7; font-weight: 800; cursor: pointer; text-decoration: underline; padding: 0; font-size: 0.85rem; font-family: inherit; display: inline-flex; align-items: center; gap: 4px;">
                    📖 Dicas e Regras
                </button>
            </p>
        </div>
    `;
    
    // Split missions: 3 main objectives (facil, media, dificil) + 1 final reward (epica)
    const mainMissions = week.missions.filter(m => m.tier !== 'epica');
    const finalMission = week.missions.find(m => m.tier === 'epica');
    
    html += `<div class="livro-expedition-objectives">`;
    
    mainMissions.forEach(m => {
        const p = progress[m.id] || { current: 0, claimed: false };
        const isCompleted = p.current >= m.req;
        const isClaimed = p.claimed;
        const pct = Math.min(100, Math.round((p.current / m.req) * 100));
        
        let rewardText = '';
        if (m.reward.type === 'stars') rewardText = `⭐ +${m.reward.value} estrelas`;
        else if (m.reward.type === 'badge') rewardText = `🏅 Selo especial`;
        else if (m.reward.type === 'card') rewardText = `📖 Nova descoberta`;
        
        let cardClass = 'livro-expedition-card';
        if (isClaimed) cardClass += ' claimed';
        else if (isCompleted) cardClass += ' completed';
        
        let actionBtn = '';
        if (isClaimed) {
            actionBtn = `<span class="livro-expedition-btn-action claimed-check">✅</span>`;
        } else if (isCompleted) {
            actionBtn = `<button class="livro-expedition-btn-action claim" onclick="claimExpeditionMission('${m.id}')">Resgatar!</button>`;
        } else {
            actionBtn = `
                <div class="expedition-action-wrapper">
                    <div class="expedition-tooltip-container">
                        <span class="expedition-info-icon">ℹ️</span>
                        <div class="expedition-tooltip-text">
                            Para contar ponto: pinte e salve o desenho no seu perfil. Apenas visualizar não conta!
                        </div>
                    </div>
                    <button class="livro-expedition-btn-action paint" onclick="goPaintExpedition('${categorySlug}')">🎨 Ir Pintar</button>
                </div>
            `;
        }
        
        html += `
            <div class="${cardClass}">
                <div class="livro-expedition-card-header">
                    <span class="livro-expedition-card-title">${m.title}</span>
                    <span class="livro-expedition-card-progress-text">${p.current} / ${m.req}</span>
                </div>
                <div class="livro-expedition-progress-wrap">
                    <div class="livro-expedition-progress-fill" style="width: ${pct}%;"></div>
                </div>
                <div class="livro-expedition-card-footer">
                    <div class="livro-expedition-reward-badge">
                        🎁 ${rewardText}
                    </div>
                    ${actionBtn}
                </div>
            </div>
        `;
    });
    
    html += `</div>`; // Close objectives
    
    // Render Recompensa Final box
    if (finalMission) {
        const pFinal = progress[finalMission.id] || { current: 0, claimed: false };
        const isClaimedFinal = pFinal.claimed;
        const completedMain = mainMissions.filter(m => progress[m.id] && progress[m.id].current >= m.req).length;
        const totalMain = mainMissions.length;
        const isReadyFinal = completedMain === totalMain;
        
        let rewardListHtml = '';
        if (finalMission.reward.type === 'card') {
            rewardListHtml = `
                <div class="livro-expedition-final-rewards">
                    <div class="livro-expedition-final-reward-item">👑 Descoberta Mítica/Épica</div>
                    <div class="livro-expedition-final-reward-item">⭐ +50 Estrelas</div>
                </div>
            `;
        } else {
            rewardListHtml = `
                <div class="livro-expedition-final-rewards">
                    <div class="livro-expedition-final-reward-item">🏅 Selo de Mestre</div>
                    <div class="livro-expedition-final-reward-item">⭐ Estrelas Extras</div>
                </div>
            `;
        }
        
        let finalActionBtn = '';
        if (isClaimedFinal) {
            finalActionBtn = `
                <div style="font-size: 1.15rem; font-weight: 800; color: #27ae60; margin-top: 5px;">
                    🎉 Expedição Concluída! Você é Mestre!
                </div>
            `;
        } else if (isReadyFinal) {
            finalActionBtn = `
                <button class="livro-expedition-final-btn" onclick="claimExpeditionMission('${finalMission.id}')">
                    🏆 Abrir Recompensa Mágica!
                </button>
            `;
        } else {
            finalActionBtn = `
                <button class="livro-expedition-final-btn locked" disabled>
                    Complete os 3 objetivos para liberar
                </button>
            `;
        }
        
        html += `
            <div class="livro-expedition-final-box">
                <h3 class="livro-expedition-final-title">🎁 RECOMPENSA DA EXPEDIÇÃO</h3>
                <p class="livro-expedition-final-desc">Ao concluir todos os objetivos da semana, você revelará uma nova descoberta e ganhará prêmios especiais para o seu Livro!</p>
                ${rewardListHtml}
                <div style="margin-top: 10px;">
                    ${finalActionBtn}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Run countdown update
    updateCountdown();
    if (window.expeditionTimerInterval) clearInterval(window.expeditionTimerInterval);
    window.expeditionTimerInterval = setInterval(updateCountdown, 1000);
};

window.goPaintExpedition = function(categorySlug) {
    window.closeAlbumModal();
    if (categorySlug) {
        navigate('/categoria/' + categorySlug);
    } else {
        navigate('/');
    }
};

window.claimExpeditionMission = async function(missionId) {
    // Call claimEventMission from the parent scope
    await claimEventMission(missionId);
    // Re-render the page
    window.renderWeeklyExpeditionPage();
    // Update badge in the chapters list
    window.updateExpeditionBadge();
};

window.updateExpeditionBadge = function() {
    if (currentActiveEvent && currentActiveEvent.active) {
        const week = currentActiveEvent.week;
        const progress = currentActiveEvent.progress;
        const mainMissions = week.missions.filter(m => m.tier !== 'epica');
        const completedMain = mainMissions.filter(m => progress[m.id] && progress[m.id].current >= m.req).length;
        const totalMain = mainMissions.length;
        
        const badgeEl = document.getElementById('livro-expedition-progresso-badge');
        if (badgeEl) {
            badgeEl.innerText = `${completedMain}/${totalMain}`;
        }
    }
};

window.openDiscoveriesHelpModal = function() {
    const colName = window.activeChapterName || 'Pinturas';
    
    const chapterRulesMap = {
        'Pinturas': {
            title: '🎨 Capítulo Pinturas',
            desc: 'Desbloqueie descobertas ao pintar e salvar desenhos livres ou temáticos.',
            do: ['Pintar desenhos livres ou temáticos', 'Salvar as pinturas finalizadas no perfil', 'Completar metas de total de pinturas'],
            dont: ['Apenas abrir um desenho e fechar', 'Apenas visualizar desenhos de outros pintores', 'Apenas imprimir desenhos em branco']
        },
        'Dinossauros': {
            title: '🦖 Capítulo Dinossauros',
            desc: 'Desbloqueie descobertas ao colorir e salvar dinossauros.',
            do: ['Pintar desenhos com o tema Dinossauros', 'Salvar as pinturas de dinossauros no perfil', 'Explorar e colorir novas espécies na galeria'],
            dont: ['Pintar desenhos de outros temas (como carros ou princesas)', 'Apenas abrir o desenho de dinossauro sem salvar']
        },
        'Livros': {
            title: '📚 Capítulo Livros',
            desc: 'Desbloqueie descobertas ao criar e ler histórias geradas pela nossa IA.',
            do: ['Criar histórias com nosso gerador de IA', 'Concluir a geração e leitura das histórias', 'Explorar novos temas e capítulos de livros'],
            dont: ['Apenas ler histórias geradas no passado', 'Apenas visualizar as ilustrações sem ler']
        },
        'expedition': {
            title: '🚀 Expedições',
            desc: 'Desbloqueie descobertas da semana ao completar missões e resgatar suas recompensas.',
            do: ['Completar as missões semanais ativas', 'Participar de desafios especiais no tempo certo', 'Concluir os objetivos da expedição atual'],
            dont: ['Pintar desenhos fora do tema da semana', 'Salvar desenhos com a expedição já encerrada']
        },
        'Comunidade': {
            title: '🏆 Capítulo Comunidade',
            desc: 'Desbloqueie descobertas ao interagir com outros amigos e compartilhar no Hall da Fama.',
            do: ['Compartilhar seus desenhos no Hall da Fama', 'Receber reações e curtidas dos amigos', 'Interagir de forma positiva na galeria pública'],
            dont: ['Salvar pinturas de modo privado no perfil', 'Enviar o mesmo desenho repetidas vezes']
        },
        'Lendárias': {
            title: '👑 Capítulo Lendárias',
            desc: 'Desbloqueie descobertas lendárias ao atingir a maestria de exploração.',
            do: ['Completar capítulos inteiros do livro (100%)', 'Concluir as maiores conquistas e desafios difíceis', 'Desbloquear segredos e conquistas ocultas'],
            dont: ['Fazer ações comuns do dia a dia (como pinturas livres)', 'Repetir conquistas que você já possui']
        },
        'Lendas-do-Desenho': {
            title: '🏆 Capítulo Lendas do Desenho',
            desc: 'Desbloqueie cards lendários desenhando à mão livre os temas propostos pelos desafios de IA.',
            do: ['Desenhar o tema proposto na carta bloqueada', 'Salvar o desenho correspondente no perfil', 'Fazer o melhor desenho possível do tema para a IA reconhecer'],
            dont: ['Colorir desenhos pré-prontos da biblioteca', 'Escrever apenas o nome do tema no quadro de desenho']
        }
    };
    
    const rule = chapterRulesMap[colName] || {
        title: 'ℹ️ Como funciona?',
        desc: 'O Livro das Descobertas registra tudo o que você conquista no KidCanvas.',
        do: ['Pintar desenhos, completar expedições, criar histórias e participar do Hall da Fama'],
        dont: ['Apenas abrir os links ou imprimir desenhos sem realizar as ações']
    };
    
    Swal.fire({
        title: rule.title,
        html: `
            <div style="text-align: left; font-size: 0.92rem; line-height: 1.45; color: #2d3436; font-family: 'Fredoka-Variable', sans-serif; padding: 5px;">
                <p style="margin-top:0; font-weight: bold; color: #636e72; font-size: 0.95rem; margin-bottom: 12px;">${rule.desc}</p>
                
                <div style="margin-top: 10px; background: #f4fbf7; padding: 10px; border-radius: 8px; border: 1px solid #d4edda; margin-bottom: 10px;">
                    <div style="font-size: 0.68rem; font-weight: 900; color: #28a745; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px;">👍 CONTA PROGRESSO</div>
                    <ul style="margin: 0; padding: 0; list-style: none; font-size: 0.82rem; color: #155724; line-height: 1.45;">
                        ${rule.do.map(item => `<li style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 4px;"><span>✅</span> <span>${item}</span></li>`).join('')}
                    </ul>
                </div>
                
                <div style="background: #fff5f5; padding: 10px; border-radius: 8px; border: 1px solid #f8d7da;">
                    <div style="font-size: 0.68rem; font-weight: 900; color: #dc3545; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px;">👎 NÃO CONTA</div>
                    <ul style="margin: 0; padding: 0; list-style: none; font-size: 0.82rem; color: #721c24; line-height: 1.45;">
                        ${rule.dont.map(item => `<li style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 4px;"><span>❌</span> <span>${item}</span></li>`).join('')}
                    </ul>
                </div>
            </div>
        `,
        confirmButtonText: 'Entendi!',
        confirmButtonColor: '#6c5ce7',
        customClass: {
            popup: 'swal-kidcanvas-popup'
        }
    });
};

/* ==========================================================================
   PÁGINA DE PERFIL (/perfil) - LÓGICA E INTERAÇÕES
   ========================================================================== */

let nameEditing = false;
let selectedSlotForFeatured = null;

// Iniciar edição de nome com cooldown
window.startEditingName = function() {
    if (currentUser.lastUsernameChangeDate) {
        const lastChange = new Date(currentUser.lastUsernameChangeDate);
        const diffTime = Math.abs(new Date() - lastChange);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
            const daysRemaining = 30 - Math.floor(diffTime / (1000 * 60 * 60 * 24));
            showToast(`Você só pode alterar seu nome uma vez por mês. Próxima troca disponível em ${daysRemaining} dias.`, 'error');
            return;
        }
    }

    nameEditing = true;
    document.getElementById('profile-display-name').style.display = 'none';
    document.getElementById('profile-edit-name-btn').style.display = 'none';
    document.getElementById('profile-username-input-container').style.display = 'flex';
    document.getElementById('profile-username-input').value = currentUser.name || '';
    document.getElementById('profile-username-input').focus();
};

window.cancelEditingName = function() {
    nameEditing = false;
    document.getElementById('profile-display-name').style.display = 'block';
    document.getElementById('profile-edit-name-btn').style.display = 'inline';
    document.getElementById('profile-username-input-container').style.display = 'none';
};

window.saveEditedName = async function() {
    const input = document.getElementById('profile-username-input');
    const newName = input.value.trim();
    
    if (newName.length < 2 || newName.length > 25) {
        showToast('O nome de exibição deve ter entre 2 e 25 caracteres.', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('kidcanvas_session_token') || currentUser.token;
        const res = await fetch('/api/user/update-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': token
            },
            body: JSON.stringify({ name: newName })
        });
        const data = await res.json();
        
        if (data.success) {
            currentUser.name = data.name;
            currentUser.lastUsernameChangeDate = data.lastUsernameChangeDate;
            
            // Atualizar no header
            const shortName = data.name.split(' ')[0];
            const userDisplayName = document.getElementById('user-display-name');
            const dropdownDisplayName = document.getElementById('dropdown-user-display-name');
            if (userDisplayName) userDisplayName.textContent = shortName;
            if (dropdownDisplayName) dropdownDisplayName.textContent = shortName;
            
            renderPerfilView();
            cancelEditingName();
            showToast('Nome de exibição atualizado com sucesso!', 'success');
        } else {
            showToast(data.message || 'Erro ao atualizar nome.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Erro de conexão com o servidor.', 'error');
    }
};

window.saveProfileSettings = async function() {
    const ageInput = document.getElementById('profile-age-input');
    const showAgeToggle = document.getElementById('profile-show-age-toggle');
    const notificationsToggle = document.getElementById('profile-notifications-toggle');
    
    const ageValue = ageInput ? ageInput.value.trim() : '';
    const showAge = showAgeToggle ? showAgeToggle.checked : false;
    const notifications = notificationsToggle ? notificationsToggle.checked : true;

    try {
        const token = localStorage.getItem('kidcanvas_session_token') || currentUser.token;
        const res = await fetch('/api/user/update-profile-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': token
            },
            body: JSON.stringify({
                age: ageValue === '' ? null : parseInt(ageValue, 10),
                showAge,
                notifications
            })
        });
        const data = await res.json();
        
        if (data.success) {
            currentUser.age = data.profileSettings.age;
            currentUser.showAge = data.profileSettings.showAge;
            currentUser.notifications = data.profileSettings.notifications;
            
            showToast('Configurações atualizadas com sucesso!', 'success');
        } else {
            showToast(data.message || 'Erro ao atualizar configurações.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Erro de conexão ao salvar configurações.', 'error');
    }
};

window.clickFeaturedSlot = function(slotIndex) {
    const featured = currentUser.featuredCards || [null, null, null];
    if (featured[slotIndex]) {
        Swal.fire({
            title: 'Selo em Destaque',
            text: 'O que deseja fazer com este selo?',
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'Substituir',
            denyButtonText: 'Remover',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#6c5ce7',
            denyButtonColor: '#e74c3c'
        }).then((result) => {
            if (result.isConfirmed) {
                openFeaturedSelectionModal(slotIndex);
            } else if (result.isDenied) {
                removeFeaturedCard(slotIndex);
            }
        });
    } else {
        openFeaturedSelectionModal(slotIndex);
    }
};

window.openFeaturedSelectionModal = function(slotIndex) {
    selectedSlotForFeatured = slotIndex;
    const modal = document.getElementById('featuredSelectionModal');
    if (!modal) return;

    const grid = document.getElementById('featured-selection-grid');
    grid.innerHTML = '';

    const unlocked = getUnlockedAchievements(currentUser);
    if (unlocked.length === 0) {
        grid.innerHTML = '<div style="text-align:center; padding: 20px; font-weight: bold; color: var(--color-dark-light);">Você ainda não desbloqueou nenhum selo. Pinte e crie histórias para desbloquear! 🎨</div>';
        modal.classList.add('open');
        return;
    }

    const featured = currentUser.featuredCards || [null, null, null];
    const available = unlocked.filter(badge => !featured.includes(badge.id));

    if (available.length === 0) {
        grid.innerHTML = '<div style="text-align:center; padding: 20px; font-weight: bold; color: var(--color-dark-light);">Todos os seus selos desbloqueados já estão em destaque! 🌟</div>';
    } else {
        grid.innerHTML = available.map(badge => {
            const rarity = ACHIEVEMENT_RARITIES[badge.rarity] || { color: '#9e9e9e' };
            return `
                <div onclick="selectFeaturedCard('${badge.id}')" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid ${rarity.color}; border-radius: var(--radius-sm); background: #fffde7; cursor: pointer; transition: all 0.2s;" class="hover-bounce">
                    <span style="font-size: 2.2rem; min-width: 40px; text-align: center;">${badge.emoji}</span>
                    <div style="display: flex; flex-direction: column; text-align: left;">
                        <span style="font-weight: 800; font-size: 0.95rem; color: ${rarity.color};">${badge.name}</span>
                        <span style="font-size: 0.8rem; color: var(--color-dark-light); font-weight: 500;">${badge.desc}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    modal.classList.add('open');
};

window.closeFeaturedSelectionModal = function() {
    const modal = document.getElementById('featuredSelectionModal');
    if (modal) modal.classList.remove('open');
    selectedSlotForFeatured = null;
};

window.selectFeaturedCard = async function(cardId) {
    if (selectedSlotForFeatured === null) return;
    
    const featured = [...(currentUser.featuredCards || [null, null, null])];
    featured[selectedSlotForFeatured] = cardId;

    try {
        const token = localStorage.getItem('kidcanvas_session_token') || currentUser.token;
        const res = await fetch('/api/user/update-featured-cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': token
            },
            body: JSON.stringify({ featuredCards: featured })
        });
        const data = await res.json();
        
        if (data.success) {
            currentUser.featuredCards = data.featuredCards;
            closeFeaturedSelectionModal();
            renderPerfilView();
            showToast('Selo colocado em destaque!', 'success');
        } else {
            showToast(data.message || 'Erro ao destacar selo.', 'error');
        }
    } catch(e) {
        console.error(e);
        showToast('Erro ao atualizar destaques.', 'error');
    }
};

window.removeFeaturedCard = async function(slotIndex) {
    const featured = [...(currentUser.featuredCards || [null, null, null])];
    featured[slotIndex] = null;

    try {
        const token = localStorage.getItem('kidcanvas_session_token') || currentUser.token;
        const res = await fetch('/api/user/update-featured-cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': token
            },
            body: JSON.stringify({ featuredCards: featured })
        });
        const data = await res.json();
        
        if (data.success) {
            currentUser.featuredCards = data.featuredCards;
            renderPerfilView();
            showToast('Selo removido dos destaques.', 'success');
        } else {
            showToast(data.message || 'Erro ao remover destaque.', 'error');
        }
    } catch(e) {
        console.error(e);
        showToast('Erro ao atualizar destaques.', 'error');
    }
};

window.copyProfileInviteLink = function() {
    const input = document.getElementById('profile-invite-link-input');
    if (!input) return;
    
    input.select();
    input.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(input.value)
        .then(() => {
            const msg = document.getElementById('profile-invite-link-copied-msg');
            if (msg) {
                msg.style.display = 'block';
                setTimeout(() => msg.style.display = 'none', 3000);
            }
            showToast('Link de convite copiado com sucesso!', 'success');
        })
        .catch(err => {
            console.error('Erro ao copiar link:', err);
            showToast('Não foi possível copiar o link automaticamente.', 'error');
        });
};

window.openChangePasswordModal = function() {
    document.getElementById('change-pwd-current').value = '';
    document.getElementById('change-pwd-new').value = '';
    document.getElementById('change-pwd-confirm').value = '';
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.classList.add('open');
};

window.closeChangePasswordModal = function() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.classList.remove('open');
};

window.submitChangePassword = async function() {
    const currentPwd = document.getElementById('change-pwd-current').value;
    const newPwd = document.getElementById('change-pwd-new').value;
    const confirmPwd = document.getElementById('change-pwd-confirm').value;

    if (!currentPwd || !newPwd || !confirmPwd) {
        showToast('Preencha todos os campos.', 'error');
        return;
    }
    if (newPwd.length < 6) {
        showToast('A nova senha deve ter no mínimo 6 caracteres.', 'error');
        return;
    }
    if (newPwd !== confirmPwd) {
        showToast('A nova senha e a confirmação não conferem.', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('kidcanvas_session_token') || currentUser.token;
        const res = await fetch('/api/user/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': token
            },
            body: JSON.stringify({
                currentPassword: currentPwd,
                newPassword: newPwd
            })
        });
        const data = await res.json();
        
        if (data.success) {
            closeChangePasswordModal();
            showToast('Senha alterada com sucesso!', 'success');
        } else {
            showToast(data.message || 'Erro ao alterar a senha.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Erro ao conectar com o servidor.', 'error');
    }
};

window.openDeleteAccountModal = function() {
    document.getElementById('delete-account-step-1').style.display = 'block';
    document.getElementById('delete-account-step-2').style.display = 'none';
    document.getElementById('delete-account-password').value = '';
    const modal = document.getElementById('deleteAccountModal');
    if (modal) modal.classList.add('open');
};

window.closeDeleteAccountModal = function() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) modal.classList.remove('open');
};

window.goToDeleteAccountStep2 = function() {
    document.getElementById('delete-account-step-1').style.display = 'none';
    document.getElementById('delete-account-step-2').style.display = 'block';
    document.getElementById('delete-account-password').focus();
};

window.submitDeleteAccount = async function() {
    const password = document.getElementById('delete-account-password').value;
    if (!password) {
        showToast('Senha é necessária para confirmar.', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('kidcanvas_session_token') || currentUser.token;
        const res = await fetch('/api/user/delete-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': token
            },
            body: JSON.stringify({ password })
        });
        const data = await res.json();
        
        if (data.success) {
            closeDeleteAccountModal();
            showToast('Sua conta foi excluída permanentemente. Sentiremos sua falta! 😢', 'success');
            handleHeaderLogout();
        } else {
            showToast(data.message || 'Erro ao excluir conta.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Erro de conexão ao excluir conta.', 'error');
    }
};

window.renderPerfilView = function() {
    document.title = "Meu Perfil 👤 — KidCanvas";
    setMetaDescription("Gerencie sua identidade, visualize suas estatísticas de conquistas, confira selos em destaque e mude suas configurações no KidCanvas.");
    
    const view = document.getElementById('view-perfil');
    if (!view) return;
    view.style.display = 'block';

    if (!currentUser) {
        showToast('Faça login para acessar seu perfil!', 'info');
        openAuthModal();
        navigate('/');
        return;
    }

    // Avatar wrapper
    const wrapper = document.getElementById('my-profile-avatar-wrapper');
    const imgEl = document.getElementById('my-profile-avatar-img');
    const emojiEl = document.getElementById('my-profile-avatar-emoji');
    const avatarVal = currentUser.avatar || 'avatar_default_1';
    
    if (wrapper) {
        // Clear previous rarity or plan classes
        wrapper.className = 'avatar-wrapper';
        wrapper.style.border = '';
        wrapper.style.boxShadow = '';
        wrapper.style.animation = '';
        
        const defaultEmojis = {
            'avatar_default_1': '👦',
            'avatar_default_2': '👧',
            'avatar_default_3': '👦🏽',
            'avatar_default_4': '👧🏽',
            '👦': '👦',
            '👧': '👧',
            '👦🏽': '👦🏽',
            '👧🏽': '👧🏽'
        };
        
        const card = (window.globalCatalog || []).find(c => c.id === avatarVal);
        if (card) {
            const rarity = card.rarity || 'Comum';
            const rarityLower = rarity.toLowerCase().replace('á', 'a').replace('é', 'e').replace('o', 'a');
            wrapper.classList.add(`rarity-border-${rarityLower}`);
            
            if (imgEl) {
                imgEl.src = card.imageUrl;
                imgEl.style.display = 'block';
                imgEl.style.borderRadius = '50%';
            }
            if (emojiEl) emojiEl.style.display = 'none';
        } else {
            // Apply plan border class
            const planName = currentUser.plan || 'Aprendiz';
            if (planName === 'Aprendiz' || planName === 'Grátis') {
                wrapper.classList.add('plan-aprendiz');
            } else if (planName === 'Artista') {
                wrapper.classList.add('plan-artista');
            } else if (planName === 'Mago Criador' || planName === 'Professor' || planName === 'Premium') {
                wrapper.classList.add('plan-mago');
            } else if (planName === 'Lenda KidCanvas' || planName === 'Colégio' || planName === 'Ultra' || planName === 'Lenda') {
                wrapper.classList.add('plan-lenda');
            } else {
                wrapper.classList.add('plan-aprendiz');
            }
            
            const emojiValue = defaultEmojis[avatarVal] || '👦';
            const isUrl = avatarVal.startsWith('http') || avatarVal.startsWith('/');
            if (isUrl) {
                if (imgEl) {
                    imgEl.src = avatarVal;
                    imgEl.style.display = 'block';
                }
                if (emojiEl) emojiEl.style.display = 'none';
            } else {
                if (imgEl) imgEl.style.display = 'none';
                if (emojiEl) {
                    emojiEl.textContent = emojiValue;
                    emojiEl.style.display = 'block';
                }
            }
        }
    }
    
    // Nível do Jogador (baseado na quantidade de descobertas)
    const levelBlock = document.getElementById('profile-player-level');
    if (levelBlock) {
        const userCards = currentUser.cards || [];
        const level = Math.floor(userCards.length / 10) + 1;
        levelBlock.innerHTML = `⭐ NÍVEL ${level}`;
    }

    // Estrelas Totais do Jogador
    const totalStarsVal = document.getElementById('profile-total-stars-val');
    if (totalStarsVal) {
        totalStarsVal.textContent = currentUser.stars || 0;
    }
    
    // Status do Card Equipado
    const statusContainer = document.getElementById('profile-equipped-card-status');
    if (statusContainer) {
        statusContainer.innerHTML = '';
        const userCards = currentUser.cards || [];
        const card = (window.globalCatalog || []).find(c => c.id === avatarVal);
        
        if (userCards.length === 0) {
            statusContainer.innerHTML = `
                <div style="font-weight: 700; color: var(--color-purple); font-size: 0.95rem; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                    <span>🃏</span> Seu primeiro card está esperando por você!
                </div>
                <div style="font-size: 0.82rem; color: var(--color-dark-light); line-height: 1.4; text-align: center; max-width: 260px; margin-bottom: 8px; font-weight: 600;">
                    Pinte e salve desenhos para desbloquear descobertas.
                </div>
                <button class="btn btn-primary btn-sm" onclick="openAlbumModal(); return false;" style="font-size: 0.85rem; padding: 6px 14px; border-radius: var(--radius-sm); font-weight: bold; width: 100%; box-shadow: var(--shadow-button-primary);">
                    🎨 Começar a Explorar
                </button>
            `;
        } else if (!card) {
            statusContainer.innerHTML = `
                <div style="font-weight: 700; color: var(--color-dark-light); font-size: 0.9rem; display: flex; align-items: center; gap: 6px;">
                    <span>🃏</span> Nenhum card equipado
                </div>
                <div style="font-size: 0.8rem; color: var(--color-dark-light); line-height: 1.4; text-align: center; max-width: 240px; margin-bottom: 2px;">
                    Você tem ${userCards.length} card(s) desbloqueado(s). Escolha um card para seu perfil!
                </div>
                <button class="btn btn-secondary btn-outline btn-sm" onclick="openAvatarSelectionModal(); return false;" style="font-size: 0.85rem; padding: 6px 14px; border-radius: var(--radius-sm); font-weight: bold; width: 100%; border: var(--border-thin); background: white; color: var(--color-dark);">
                    Equipar um Card
                </button>
            `;
        } else {
            statusContainer.innerHTML = `
                <div style="font-weight: 700; color: var(--color-purple); font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                    <span>🃏</span> Card Equipado
                </div>
                <div style="font-size: 0.85rem; font-weight: bold; color: var(--color-dark);">
                    ${card.name}
                </div>
                <span class="rarity-badge-mini rarity-color-${card.rarity.toLowerCase().replace('á', 'a').replace('é', 'e')}" style="font-size: 0.72rem; padding: 3px 10px; border-radius: 6px; color: white; font-weight: 800; text-transform: uppercase;">
                    ${card.rarity}
                </span>
            `;
        }
    }

    // Nome
    const nameEl = document.getElementById('profile-display-name');
    if (nameEl) nameEl.textContent = currentUser.name || 'Nome';
    
    // Cooldown
    const cooldownEl = document.getElementById('profile-name-cooldown');
    if (cooldownEl) {
        if (currentUser.lastUsernameChangeDate) {
            const lastChange = new Date(currentUser.lastUsernameChangeDate);
            const diffTime = Math.abs(new Date() - lastChange);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 30) {
                const daysRemaining = 30 - Math.floor(diffTime / (1000 * 60 * 60 * 24));
                cooldownEl.textContent = `Próxima troca de nome disponível em ${daysRemaining} dias`;
            } else {
                cooldownEl.textContent = 'Troca de nome disponível';
            }
        } else {
            cooldownEl.textContent = 'Você pode alterar seu nome uma vez por mês';
        }
    }

    // Membro desde
    let memberSince = "Explorando desde Junho 2025";
    if (currentUser.createdAt) {
        const date = new Date(currentUser.createdAt);
        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        memberSince = `Explorando desde ${months[date.getMonth()]} de ${date.getFullYear()}`;
    }
    const memberSinceEl = document.getElementById('profile-member-since');
    if (memberSinceEl) memberSinceEl.textContent = memberSince;

    // Idade e privacidade
    const ageInput = document.getElementById('profile-age-input');
    const showAgeToggle = document.getElementById('profile-show-age-toggle');
    if (ageInput) ageInput.value = currentUser.age || '';
    if (showAgeToggle) showAgeToggle.checked = !!currentUser.showAge;

    // Estatísticas
    const paintingsCount = currentUser.myPaintings?.length || 0;
    const storiesCount = currentUser.myStories?.length || 0;
    const starsCount = currentUser.stars || 0;
    const streakCount = currentUser.consecutiveDays || 1;
    const creditsCount = currentUser.paginasRestantes || 0;
    const unlockedBadges = getUnlockedAchievements(currentUser).length;
    const totalBadges = ACHIEVEMENTS_CATALOG.length;

    document.getElementById('stat-paintings-count').textContent = paintingsCount;
    document.getElementById('stat-stories-count').textContent = storiesCount;
    document.getElementById('stat-stars-count').textContent = starsCount;
    document.getElementById('stat-badges-count').textContent = `${unlockedBadges}/${totalBadges}`;
    document.getElementById('stat-streak-count').textContent = streakCount;
    document.getElementById('stat-credits-count').textContent = creditsCount;

    // Selos em Destaque
    const featured = currentUser.featuredCards || [null, null, null];
    for (let i = 0; i < 3; i++) {
        const slot = document.getElementById(`featured-slot-${i}`);
        if (!slot) continue;
        
        slot.innerHTML = '';
        slot.className = 'featured-badge-slot';
        
        const cardId = featured[i];
        if (cardId) {
            const badge = ACHIEVEMENTS_CATALOG.find(a => a.id === cardId);
            if (badge) {
                slot.classList.add('filled');
                slot.innerHTML = `
                    <span style="font-size: 2.2rem;">${badge.emoji}</span>
                    <span style="font-size: 0.7rem; font-weight: 800; color: var(--color-dark); margin-top: 4px; text-align: center; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${badge.name}</span>
                    <div class="remove-btn" onclick="event.stopPropagation(); removeFeaturedCard(${i})">&times;</div>
                `;
            } else {
                slot.innerHTML = '<span style="font-size: 1.8rem; color: #bbb;">+</span>';
            }
        } else {
            slot.innerHTML = '<span style="font-size: 1.8rem; color: #bbb;">+</span>';
        }
    }

    // Conquistas Recentes
    const recentList = document.getElementById('profile-recent-achievements-list');
    if (recentList) {
        recentList.innerHTML = '';
        const userBadges = getUnlockedAchievements(currentUser);
        const recent4 = [...userBadges].reverse().slice(0, 4);

        if (recent4.length === 0) {
            recentList.innerHTML = '<div style="text-align: center; padding: 15px; font-weight: bold; color: var(--color-dark-light);">Nenhum selo conquistado ainda. Comece sua aventura! 🚀</div>';
        } else {
            recentList.innerHTML = recent4.map(badge => {
                const rarity = ACHIEVEMENT_RARITIES[badge.rarity] || { color: '#9e9e9e' };
                const userCardObj = currentUser.cards ? currentUser.cards.find(c => c.id === badge.id) : null;
                const unlockDate = userCardObj && userCardObj.unlockedAt 
                    ? new Date(userCardObj.unlockedAt).toLocaleDateString('pt-BR')
                    : new Date(currentUser.createdAt || Date.now()).toLocaleDateString('pt-BR');
                
                return `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: 2.5px solid ${rarity.color}; border-radius: var(--radius-sm); background: #fffdf5;">
                        <span style="font-size: 2.2rem; min-width: 40px; text-align: center;">${badge.emoji}</span>
                        <div style="display: flex; flex-direction: column; text-align: left;">
                            <span style="font-weight: 800; font-size: 0.95rem; color: ${rarity.color};">${badge.name}</span>
                            <span style="font-size: 0.8rem; color: var(--color-dark-light); font-weight: 600;">Desbloqueado em ${unlockDate}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // Convites
    const inviteLinkInput = document.getElementById('profile-invite-link-input');
    if (inviteLinkInput) {
        const hostname = window.location.origin;
        const code = currentUser.inviteCode || currentUser.id || '';
        inviteLinkInput.value = `${hostname}/?ref=${code}`;
    }
    
    const activeFriendsEl = document.getElementById('profile-active-friends-count');
    if (activeFriendsEl) {
        activeFriendsEl.textContent = currentUser.activeReferredUsers || 0;
    }

    // Configurações
    const notificationsToggle = document.getElementById('profile-notifications-toggle');
    if (notificationsToggle) {
        notificationsToggle.checked = currentUser.notifications !== undefined ? !!currentUser.notifications : true;
    }

    // Atualizar resumo dos certificados (Novo)
    const updateCertSummaryUI = () => {
        const unlockedCerts = (currentUser.certificates || []).length;
        const totalCerts = window.certificatesCatalog ? window.certificatesCatalog.length : 59;
        const percentage = totalCerts > 0 ? Math.round((unlockedCerts / totalCerts) * 100) : 0;
        
        const unlockedFractionEl = document.getElementById('profile-cert-unlocked-fraction');
        if (unlockedFractionEl) {
            unlockedFractionEl.textContent = `${unlockedCerts}/${totalCerts}`;
        }
        
        const progressFillEl = document.getElementById('profile-cert-progress-fill');
        if (progressFillEl) {
            progressFillEl.style.width = `${percentage}%`;
        }
        
        const percentTextEl = document.getElementById('profile-cert-percent-text');
        if (percentTextEl) {
            percentTextEl.textContent = `${percentage}% concluído`;
        }
    };

    updateCertSummaryUI();

    if (!window.certificatesCatalog) {
        fetch('/api/certificates/my', {
            headers: { 'X-Session-Token': localStorage.getItem('kidcanvas_session_token') || '' }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.certificatesCatalog = data.catalog;
                updateCertSummaryUI();
            }
        })
        .catch(err => console.error('Error fetching certificates catalog for profile:', err));
    }
};

const CHAPTER_GUIDES = {
    'Pinturas': {
        title: 'Guia do Capítulo Pinturas',
        color: 'var(--color-blue)',
        emoji: '🎨',
        secao1: ['Pintar desenhos livres ou temáticos', 'Salvar as pinturas finalizadas no perfil', 'Completar metas de total de pinturas', 'Continuar explorando o capítulo'],
        secao2: ['Abrir um desenho e fechar', 'Apenas visualizar desenhos', 'Apenas imprimir desenhos', 'Navegar pelo catálogo sem pintar'],
        secao3: ['Salve todas as suas pinturas.', 'Quanto mais você pinta, mais descobertas encontra.', 'Algumas descobertas exigem dedicação e tempo.', 'Experimente diferentes temas para avançar mais rápido.'],
        secao4: ['Novos Cards para o Perfil', 'Estrelas de Conquistas', 'Destaques no Hall da Fama', 'Novas descobertas para sua coleção'],
        secao6: ['Cada descoberta encontrada aproxima você de completar o Livro.', 'Existem 165 descobertas espalhadas pelo universo KidCanvas.']
    },
    'Dinossauros': {
        title: 'Guia do Capítulo Dinossauros',
        color: 'var(--color-green)',
        emoji: '🦖',
        secao1: ['Pintar desenhos com o tema Dinossauros', 'Salvar as pinturas de dinossauros no perfil', 'Explorar e colorir novas espécies na galeria'],
        secao2: ['Pintar desenhos de outros temas', 'Apenas abrir o dinossauro sem salvar', 'Imprimir o dinossauro sem colorir'],
        secao3: ['Pinte apenas dinossauros para avançar neste capítulo.', 'Descobertas raras e lendárias exigem espécies específicas.', 'Você pode ver dicas de qual dinossauro pintar na próxima meta.'],
        secao4: ['Avatar de Dinossauro para o Perfil', 'Estrelas e Selos Especiais', 'Desbloqueio do T-Rex Imperial'],
        secao6: ['Os dinossauros dominaram a terra por milhões de anos!', 'Colorindo dinossauros, você ajuda a desvendar ovos fósseis.']
    },
    'Livros': {
        title: 'Guia do Capítulo Livros',
        color: '#f1c40f',
        emoji: '📚',
        secao1: ['Criar histórias com o robô de IA', 'Concluir a geração e leitura de histórias', 'Explorar novos temas e aventuras', 'Visualizar ilustrações completas'],
        secao2: ['Apenas abrir livros antigos', 'Ler apenas o título sem gerar a história', 'Sair da leitura antes da IA concluir'],
        secao3: ['Você pode criar histórias com qualquer tema ou personagem.', 'Tente criar histórias com dinossauros ou piratas para ver o que acontece.', 'Cada história nova criada gera progresso.'],
        secao4: ['Novos cards de livros mágicos', 'Estrelas extras de leitura', 'Habilidades de contador de histórias'],
        secao6: ['As histórias do KidCanvas são criadas de forma única pela nossa IA!', 'Ler e criar estimula a criatividade e a imaginação.']
    },
    'Expedições': {
        title: 'Guia das Expedições Mágicas',
        color: '#e74c3c',
        emoji: '🚀',
        secao1: ['Completar missões semanais', 'Participar de desafios especiais', 'Concluir objetivos da expedição', 'Resgatar prêmios ativamente'],
        secao2: ['Salvar desenhos fora do tema da semana', 'Pintar após o tempo da expedição expirar', 'Esquecer de resgatar o prêmio no modal'],
        secao3: ['Acompanhe o cronômetro no topo das expedições.', 'Novas expedições começam a cada semana com prêmios novos.', 'Completar todas as missões da semana libera a Recompensa Final.'],
        secao4: ['Descobertas Exclusivas Temporárias', 'Selos Especiais de Expedição', 'Grande quantidade de Estrelas (+50)'],
        secao6: ['As expedições são eventos por tempo limitado!', 'Os exploradores mais dedicados colecionam todos os selos de temporada.']
    },
    'expedition': {
        title: 'Guia das Expedições Mágicas',
        color: '#e74c3c',
        emoji: '🚀',
        secao1: ['Completar missões semanais', 'Participar de desafios especiais', 'Concluir objetivos da expedição', 'Resgatar prêmios ativamente'],
        secao2: ['Salvar desenhos fora do tema da semana', 'Pintar após o tempo da expedição expirar', 'Esquecer de resgatar o prêmio no modal'],
        secao3: ['Acompanhe o cronômetro no topo das expedições.', 'Novas expedições começam a cada semana com prêmios novos.', 'Completar todas as missões da semana libera a Recompensa Final.'],
        secao4: ['Descobertas Exclusivas Temporárias', 'Selos Especiais de Expedição', 'Grande quantidade de Estrelas (+50)'],
        secao6: ['As expedições são eventos por tempo limitado!', 'Os exploradores mais dedicados colecionam todos os selos de temporada.']
    },
    'Comunidade': {
        title: 'Guia do Capítulo Comunidade',
        color: '#9b59b6',
        emoji: '🏆',
        secao1: ['Compartilhar desenhos no Hall da Fama', 'Receber curtidas e reações dos amigos', 'Enviar pinturas originais da galeria', 'Participar ativamente da comunidade'],
        secao2: ['Salvar desenhos privados no perfil', 'Comentários repetidos ou spam', 'Enviar o mesmo desenho várias vezes'],
        secao3: ['Seus desenhos só aparecem para os outros se você compartilhar no Hall da Fama.', 'Dê palmas e reações aos desenhos dos seus amigos.', 'Inspire-se vendo a galeria de outros pintores.'],
        secao4: ['Visualizações do seu perfil público', 'Destaque no Hall da Fama', 'Selo de Membro Popular'],
        secao6: ['O Hall da Fama celebra a criatividade de todos!', 'Compartilhar arte espalha alegria para todos os exploradores.']
    },
    'Lendárias': {
        title: 'Guia do Capítulo Lendárias',
        color: '#f39c12',
        emoji: '👑',
        secao1: ['Completar capítulos inteiros do álbum', 'Concluir grandes conquistas difíceis', 'Desbloquear segredos ocultos', 'Atingir o nível máximo do perfil'],
        secao2: ['Realizar ações comuns diárias', 'Colorir desenhos livres padrão', 'Criar histórias normais de livros'],
        secao3: ['Os cards lendários e míticos são as descobertas mais difíceis do jogo.', 'Eles exigem completar 100% de progresso em outras categorias.', 'Fique de olho nas dicas ocultas das silhuetas com cadeado.'],
        secao4: ['Cards Míticos com borda arco-íris rotativa', 'Borda de Avatar Lendário brilhante', 'Título de Lenda do KidCanvas'],
        secao6: ['Apenas os maiores exploradores completam o Livro das Descobertas!', 'Você está no caminho certo para se tornar uma lenda.']
    },
    'Lendas-do-Desenho': {
        title: 'Guia do Capítulo Lendas do Desenho',
        color: '#f39c12',
        emoji: '🏆',
        secao1: ['Desenhar e pintar o tema exato de cada carta bloqueada', 'Salvar o desenho finalizado no perfil', 'Completar o desafio de desenho proposto'],
        secao2: ['Apenas abrir um desenho e fechar', 'Escrever o nome do tema sem desenhar', 'Colorir desenhos normais sem desafio de desenho'],
        secao3: ['Use a sua criatividade para fazer o melhor desenho possível do tema pedido.', 'Você pode tentar quantas vezes quiser até a IA reconhecer!', 'Passe o mouse ou toque no card bloqueado para ver o que desenhar.'],
        secao4: ['Avatares Lendários Exclusivos do seu desenho', 'Selo de Grande Mestre do Desenho', 'Mais de 1000 estrelas ao completar a coleção'],
        secao6: ['Esta é a maior coleção lendária do KidCanvas!', 'Cada desenho é reconhecido pela nossa inteligência artificial Claude.']
    }
};

window.triggerPageFlipAnimation = function(oldPanel, newPanel, direction) {
    if (!newPanel) return;
    
    // Esconder o painel antigo imediatamente para evitar conflitos de posicionamento
    if (oldPanel && oldPanel !== newPanel) {
        oldPanel.style.display = 'none';
        oldPanel.classList.remove('flip-in-next', 'flip-in-prev');
    }
    
    // Exibir o novo painel
    newPanel.style.display = (window.activeChapterName === 'expedition' && newPanel.id === 'livro-expedition-conteudo') ? 'block' : 'flex';
    
    // Resetar as classes de animação e forçar reflow
    newPanel.classList.remove('flip-in-next', 'flip-in-prev');
    void newPanel.offsetWidth;
    
    // Aplicar a animação correspondente
    if (direction === 'next') {
        newPanel.classList.add('flip-in-next');
    } else {
        newPanel.classList.add('flip-in-prev');
    }
};

window.openChapterGuide = function(colName) {
    const guideEl = document.getElementById('livro-regras-conteudo');
    if (!guideEl) return;
    
    const catalog = window.globalCatalog || [];
    
    // Agrupar e obter dados de progresso reais
    let cardsInCol = [];
    if (colName === 'expedition') {
        if (currentActiveEvent && currentActiveEvent.week) {
            const week = currentActiveEvent.week;
            const progress = currentActiveEvent.progress;
            const mainMissions = week.missions.filter(m => m.tier !== 'epica');
            cardsInCol = mainMissions;
        }
    } else {
        cardsInCol = catalog.filter(c => (c.collection ? c.collection.split(' ')[1] : 'Geral') === colName);
    }
    
    const owned = colName === 'expedition'
        ? (currentActiveEvent ? currentActiveEvent.week.missions.filter(m => m.tier !== 'epica').filter(m => currentActiveEvent.progress[m.id] && currentActiveEvent.progress[m.id].current >= m.req).length : 0)
        : cardsInCol.filter(c => window.isDiscoveryOwned(c)).length;
        
    const total = cardsInCol.length;
    const remaining = total - owned;
    
    const chapterNameMap = {
        'expedition': 'Expedições',
        'Pinturas': 'Capítulo Pinturas',
        'Dinossauros': 'Capítulo Dinossauros',
        'Livros': 'Capítulo Livros',
        'Comunidade': 'Capítulo Comunidade',
        'Lendárias': 'Capítulo Lendárias',
        'Lendas-do-Desenho': 'Capítulo Lendas do Desenho'
    };
    
    const guideData = CHAPTER_GUIDES[colName] || {
        title: `Guia do Capítulo ${colName}`,
        color: 'var(--color-purple)',
        emoji: '📖',
        secao1: ['Realizar atividades do capítulo'],
        secao2: ['Não cumprir os requisitos das metas'],
        secao3: ['Explore novos desenhos e crie hábitos diários.'],
        secao4: ['Novas descobertas para sua coleção'],
        secao6: ['Cada descoberta encontrada aproxima você de completar o Livro das Descobertas.']
    };
    
    guideEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px; height: 100%; overflow-y: auto; padding: 5px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <button onclick="closeChapterGuide(); return false;" class="btn btn-secondary btn-sm hover-bounce" style="border: var(--border-thin); background: white; color: var(--color-dark); font-weight: bold; padding: 6px 14px; border-radius: var(--radius-sm); font-size: 0.85rem;">
                    <i class="fa-solid fa-chevron-left"></i> Voltar ao Capítulo
                </button>
                <span style="font-size: 1.5rem;">${guideData.emoji}</span>
            </div>
            
            <h2 style="font-family: var(--font-heading); font-size: 1.5rem; color: ${guideData.color}; margin: 5px 0 10px 0; border-bottom: 2px dashed rgba(0,0,0,0.1); padding-bottom: 6px; text-align: left;">
                ${guideData.title}
            </h2>
            
            <!-- SEÇÃO 1: Como ganhar descobertas -->
            <div style="background: #f4fbf7; padding: 12px; border-radius: var(--radius-sm); border-left: 5px solid #2ecc71; text-align: left;">
                <h4 style="font-family: var(--font-heading); font-size: 0.95rem; color: #27ae60; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">🎯 Como ganhar descobertas</h4>
                <ul style="margin: 0; padding: 0; list-style: none; font-size: 0.82rem; line-height: 1.5; color: #1e6b3c;">
                    ${guideData.secao1.map(item => `<li style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 6px;"><span>✅</span> <span>${item}</span></li>`).join('')}
                </ul>
            </div>
            
            <!-- SEÇÃO 2: O que não conta -->
            <div style="background: #fff5f5; padding: 12px; border-radius: var(--radius-sm); border-left: 5px solid #e74c3c; text-align: left;">
                <h4 style="font-family: var(--font-heading); font-size: 0.95rem; color: #c0392b; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">❌ O que não conta</h4>
                <ul style="margin: 0; padding: 0; list-style: none; font-size: 0.82rem; line-height: 1.5; color: #78261e;">
                    ${guideData.secao2.map(item => `<li style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 6px;"><span>❌</span> <span>${item}</span></li>`).join('')}
                </ul>
            </div>
            
            <!-- SEÇÃO 3: Dicas -->
            <div style="background: #fffdf5; padding: 12px; border-radius: var(--radius-sm); border-left: 5px solid #f1c40f; text-align: left;">
                <h4 style="font-family: var(--font-heading); font-size: 0.95rem; color: #d68f10; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">💡 Dicas</h4>
                <ul style="margin: 0; padding: 0; list-style: none; font-size: 0.82rem; line-height: 1.5; color: #7e5109;">
                    ${guideData.secao3.map(item => `<li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;"><span>💡</span> <span>${item}</span></li>`).join('')}
                </ul>
            </div>
            
            <!-- SEÇÃO 4: Recompensas -->
            <div style="background: #fdf5ff; padding: 12px; border-radius: var(--radius-sm); border-left: 5px solid #9b59b6; text-align: left;">
                <h4 style="font-family: var(--font-heading); font-size: 0.95rem; color: #8e44ad; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">🃏 Recompensas</h4>
                <div style="font-size: 0.8rem; font-weight: bold; color: #5b2c6f; margin-bottom: 6px;">Ao avançar neste capítulo você desbloqueia:</div>
                <ul style="margin: 0; padding: 0; list-style: none; font-size: 0.82rem; line-height: 1.5; color: #5b2c6f;">
                    ${guideData.secao4.map(item => `<li style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 6px;"><span>🃏</span> <span>${item}</span></li>`).join('')}
                </ul>
            </div>
            
            <!-- SEÇÃO 5: Seu progresso -->
            <div style="background: #f4f7fc; padding: 12px; border-radius: var(--radius-sm); border-left: 5px solid #3498db; text-align: left;">
                <h4 style="font-family: var(--font-heading); font-size: 0.95rem; color: #2980b9; margin: 0 0 6px 0; display: flex; align-items: center; gap: 6px;">📈 Seu progresso</h4>
                <div style="font-size: 0.85rem; font-weight: bold; color: var(--color-dark);">${chapterNameMap[colName]}</div>
                <div style="font-size: 1.15rem; font-weight: 800; color: #2980b9; margin: 4px 0;">${owned} / ${total} descobertas</div>
                <div style="font-size: 0.78rem; color: var(--color-dark-light); font-weight: 600;">
                    ${remaining === 0 ? '🏆 Capítulo 100% completo! Incrível!' : `Faltam ${remaining} descobertas para completar este capítulo.`}
                </div>
            </div>
            
            <!-- SEÇÃO 6: Curiosidade -->
            <div style="border-top: 1px dashed rgba(0,0,0,0.1); padding-top: 12px; margin-top: 5px; font-family: var(--font-heading); text-align: left;">
                <h4 style="font-size: 0.9rem; color: var(--color-dark); margin: 0 0 6px 0; display: flex; align-items: center; gap: 6px;">✨ Curiosidade</h4>
                <ul style="margin: 0; padding: 0; list-style: none; font-size: 0.8rem; line-height: 1.5; color: var(--color-dark-light); font-weight: 600;">
                    ${guideData.secao6.map(item => `<li style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 6px;"><span>🔍</span> <span>${item}</span></li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    // Identificar painel de origem ativo
    const gradeEl = document.getElementById('livro-grade-conteudo');
    const expeditionEl = document.getElementById('livro-expedition-conteudo');
    const originEl = colName === 'expedition' ? expeditionEl : gradeEl;
    
    window.triggerPageFlipAnimation(originEl, guideEl, 'next');
};

/* --- CENTRAL DE CERTIFICADOS --- */

window.getCertificateProgress = function(cert) {
    if (!currentUser) return { current: 0, target: 0 };
    
    const rule = cert.unlockRule;
    if (!rule) return { current: 0, target: 0 };
    
    const myPaintings = currentUser.myPaintings || [];
    const myStories = currentUser.myStories || [];
    const userCards = currentUser.cards || [];
    
    const countPaintingsOfCategory = (catName) => {
        return myPaintings.filter(p => {
            if (p.fromPinturaLivre === true || p.category === 'Mão Livre') return false;
            if (p.originalCategory && p.originalCategory.toLowerCase() === catName.toLowerCase()) return true;
            if (p.category && p.category.toLowerCase() === catName.toLowerCase()) return true;
            return false;
        }).length;
    };
    
    const isCollectionComplete = (colName) => {
        const colCards = (window.globalCatalog || []).filter(c => c.collection && c.collection.toLowerCase().includes(colName.toLowerCase()));
        if (colCards.length === 0) return { current: 0, target: 0 };
        const nonMythic = colCards.filter(c => c.rarity !== 'Mítica');
        if (nonMythic.length === 0) return { current: 0, target: 0 };
        
        const unlocked = nonMythic.filter(c => userCards.some(uc => uc.id === c.id)).length;
        return { current: unlocked, target: nonMythic.length };
    };

    const isCollectionCompleteCards = (categorySlug) => {
        const colCards = (window.globalCatalog || []).filter(c => c.categorySlug && c.categorySlug.toLowerCase() === categorySlug.toLowerCase());
        if (colCards.length === 0) return { current: 0, target: 0 };
        
        const unlocked = colCards.filter(c => userCards.some(uc => uc.id === c.id)).length;
        return { current: unlocked, target: colCards.length };
    };

    switch (rule.type) {
        case 'paint_count':
            return { current: myPaintings.length, target: rule.count };
            
        case 'category_paint':
            return { current: countPaintingsOfCategory(rule.category), target: rule.count };
            
        case 'collection_complete':
            return isCollectionComplete(rule.target);
            
        case 'collection_complete_cards':
            return isCollectionCompleteCards(rule.target);
            
        case 'stars_count':
            return { current: currentUser.stars || 0, target: rule.count };
            
        case 'hall_count':
            return { current: myPaintings.filter(p => p.isPublic && p.fromPinturaLivre !== true && p.category !== 'Mão Livre').length, target: rule.count };
            
        case 'likes_count':
            return { current: currentUser.likesReceived || 0, target: rule.count };
            
        case 'hall_ranking_entry':
            return { current: currentUser.hallRankingEntered ? 1 : 0, target: 1 };
            
        case 'hall_ranking_first':
            return { current: currentUser.hallRankingFirstPlace ? 1 : 0, target: 1 };
            
        case 'invites_sent':
        case 'invites_accepted':
            return { current: (currentUser.referredUsers || []).length, target: rule.count };
            
        case 'create_account':
            return { current: 1, target: 1 };
            
        case 'complete_profile':
            return { current: (currentUser.name && currentUser.avatar && currentUser.avatar !== '👤') ? 1 : 0, target: 1 };
            
        case 'cards_unlocked':
            return { current: userCards.length, target: rule.count };
            
        case 'account_age_years': {
            const diffTime = Math.abs(new Date() - new Date(currentUser.createdAt || Date.now()));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { current: diffDays, target: rule.count * 365 };
        }
        case 'is_founder':
            return { current: currentUser.isFounder ? 1 : 0, target: 1 };
            
        case 'monthly_ranking_position':
            return { current: (currentUser.lastMonthlyRankingPos && currentUser.lastMonthlyRankingPos <= rule.count) ? 1 : 0, target: 1 };
            
        case 'expedition_missions_claimed': {
            let claimedCount = 0;
            if (currentUser.eventProgress && currentUser.eventProgress.missions) {
                claimedCount = Object.values(currentUser.eventProgress.missions).filter(m => m.claimed).length;
            }
            return { current: claimedCount, target: rule.count };
        }
        case 'expedition_count':
            return { current: (currentUser.eventInventory || []).length, target: rule.count };
            
        case 'rarity_card_count':
            return { current: userCards.filter(c => c.rarity && c.rarity.toLowerCase() === rule.rarity.toLowerCase()).length, target: rule.count };
            
        default:
            return { current: 0, target: 0 };
    }
};

window.getCertificateProgressText = function(cert, progress) {
    const rule = cert.unlockRule;
    if (!rule) return '';
    
    switch (rule.type) {
        case 'paint_count':
            return `${progress.current}/${progress.target} desenhos coloridos`;
        case 'category_paint':
            return `${progress.current}/${progress.target} desenhos de ${rule.category}`;
        case 'collection_complete':
            return `${progress.current}/${progress.target} cards de "${rule.target}" desbloqueados`;
        case 'collection_complete_cards':
            return `${progress.current}/${progress.target} cards de "${rule.target}" desbloqueados`;
        case 'stars_count':
            return `${progress.current}/${progress.target} estrelas`;
        case 'hall_count':
            return `${progress.current}/${progress.target} desenhos no Hall da Fama`;
        case 'likes_count':
            return `${progress.current}/${progress.target} curtidas recebidas`;
        case 'hall_ranking_entry':
            return 'Entrar no ranking do Hall da Fama';
        case 'hall_ranking_first':
            return 'Ficar em 1º lugar no Hall da Fama';
        case 'invites_sent':
            return `${progress.current}/${progress.target} convites enviados`;
        case 'invites_accepted':
            return `${progress.current}/${progress.target} amigos cadastrados`;
        case 'create_account':
            return 'Criar uma conta no KidCanvas';
        case 'complete_profile':
            return 'Completar perfil com Nome e Avatar';
        case 'cards_unlocked':
            return `${progress.current}/${progress.target} cards desbloqueados`;
        case 'account_age_years':
            return `${progress.current}/${progress.target} dias de conta`;
        case 'is_founder':
            return 'Ser um usuário fundador';
        case 'monthly_ranking_position':
            if (rule.count === 1) {
                return 'Finalize um mês em primeiro lugar.';
            }
            return `Finalizar o mês no Top ${rule.count} do ranking.`;
        case 'expedition_missions_claimed':
            return `${progress.current}/${progress.target} missões completadas`;
        case 'expedition_count':
            return `${progress.current}/${progress.target} expedições concluídas`;
        case 'rarity_card_count':
            return `${progress.current}/${progress.target} cards de raridade ${rule.rarity} desbloqueados`;
        default:
            return `${progress.current}/${progress.target}`;
    }
};

window.downloadCertDirect = async function(certId) {
    if (!currentUser) return;
    const cert = window.certificatesCatalog ? window.certificatesCatalog.find(c => c.id === certId) : null;
    const unlockData = currentUser.certificates ? currentUser.certificates.find(uc => uc.id === certId) : null;
    if (!cert || !unlockData) {
        showToast('Erro ao carregar dados do certificado.', 'error');
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvas.id = 'temp-cert-canvas';
    document.body.appendChild(canvas);
    canvas.style.display = 'none';
    
    try {
        window.drawCertificateCanvas('temp-cert-canvas', cert, unlockData);
        const filename = `certificado-${cert.id}.png`;
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Certificado baixado com sucesso! 🎉', 'success');
    } catch(e) {
        console.error(e);
        showToast('Erro ao gerar certificado.', 'error');
    } finally {
        canvas.remove();
    }
};

window.printCertDirect = async function(certId) {
    if (!currentUser) return;
    const cert = window.certificatesCatalog ? window.certificatesCatalog.find(c => c.id === certId) : null;
    const unlockData = currentUser.certificates ? currentUser.certificates.find(uc => uc.id === certId) : null;
    if (!cert || !unlockData) {
        showToast('Erro ao carregar dados do certificado.', 'error');
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvas.id = 'temp-cert-canvas-print';
    document.body.appendChild(canvas);
    canvas.style.display = 'none';
    
    try {
        window.drawCertificateCanvas('temp-cert-canvas-print', cert, unlockData);
        const dataUrl = canvas.toDataURL('image/png');
        const windowContent = '<!DOCTYPE html><html><head><title>Imprimir Certificado</title></head><body style="margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fafafa;"><img src="' + dataUrl + '" style="max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;"></body></html>';
        const printWin = window.open('', '', 'width=900,height=700');
        
        if (!printWin) {
            showToast('Por favor, ative os pop-ups para imprimir seu certificado! 📜', 'warning');
            return;
        }

        printWin.document.open();
        printWin.document.write(windowContent);
        printWin.document.close();
        printWin.focus();

        setTimeout(() => {
            printWin.print();
            printWin.close();
        }, 500);
    } catch(e) {
        console.error(e);
        showToast('Erro ao imprimir certificado.', 'error');
    } finally {
        canvas.remove();
    }
};

function renderCertificateMiniature(cert, isLocked = false) {
    let borderMain = '#ffd43b';
    let borderInner = '#ff5e7e';
    
    if (cert.rarity === 'Comum') {
        borderMain = '#10b981';
        borderInner = '#34d399';
    } else if (cert.rarity === 'Raro') {
        borderMain = '#3b82f6';
        borderInner = '#60a5fa';
    } else if (cert.rarity === 'Épico') {
        borderMain = '#8b5cf6';
        borderInner = '#a78bfa';
    } else if (cert.rarity === 'Lendário') {
        borderMain = '#f59e0b';
        borderInner = '#fbbf24';
    } else if (cert.rarity === 'Mítico') {
        borderMain = '#ef4444';
        borderInner = '#f87171';
    } else if (cert.rarity === 'Exclusivo') {
        borderMain = '#ec4899';
        borderInner = '#f472b6';
    }
    
    const filterStyle = isLocked ? 'filter: grayscale(1) opacity(0.6);' : '';
    const centerIcon = isLocked ? '🔒' : '📜';
    
    return `
        <div style="background: #faf8f5; border: 3px solid ${borderMain}; border-radius: 8px; padding: 10px; height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; box-shadow: inset 0 0 10px rgba(0,0,0,0.05); margin-bottom: 12px; overflow: hidden; ${filterStyle}">
            <!-- Mini corner emojis -->
            <span style="position: absolute; top: 4px; left: 4px; font-size: 0.65rem;">🎨</span>
            <span style="position: absolute; top: 4px; right: 4px; font-size: 0.65rem;">🏆</span>
            <span style="position: absolute; bottom: 4px; left: 4px; font-size: 0.65rem;">⭐</span>
            <span style="position: absolute; bottom: 4px; right: 4px; font-size: 0.65rem;">🎉</span>
            
            <!-- Mini Inner border -->
            <div style="position: absolute; top: 4px; bottom: 4px; left: 4px; right: 4px; border: 1px dashed ${borderInner}; border-radius: 6px; pointer-events: none;"></div>
            
            <!-- Center Icon / Emoji -->
            <div style="font-size: 2.2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); margin-bottom: 2px;">${centerIcon}</div>
            <div style="font-size: 0.55rem; font-weight: 800; color: ${borderInner}; text-transform: uppercase; letter-spacing: 0.5px;">DIPLOMA</div>
        </div>
    `;
}

async function renderCertificadosView() {
    document.title = "Central de Certificados 📜 — KidCanvas";
    setMetaDescription("Gerencie seus certificados de conquistas e baixe seus diplomas oficiais KidCanvas.");

    document.querySelectorAll('.page-view').forEach(view => view.style.display = 'none');
    const view = document.getElementById('view-certificados');
    if (view) view.style.display = 'block';

    const listEl = document.getElementById('certificates-categories-list');
    if (!listEl) return;

    listEl.innerHTML = '<div style="text-align: center; padding: 40px; font-weight: bold; color: var(--color-dark-light);"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>Carregando seus certificados mágicos...</div>';

    // Precarregar catálogo de cards global se não houver
    if (!window.globalCatalog) {
        try {
            const res = await fetch('/api/store/catalog');
            const data = await res.json();
            if (data.success) {
                window.globalCatalog = data.catalog;
            }
        } catch(e) {
            console.error('Erro ao carregar catálogo de cards na Central:', e);
        }
    }

    try {
        const res = await fetch('/api/certificates/my', {
            headers: { 'X-Session-Token': localStorage.getItem('kidcanvas_session_token') || '' }
        });
        const data = await res.json();

        if (data.success) {
            window.certificatesCatalog = data.catalog;
            const myCerts = data.certificates;
            const catalog = data.catalog;

            // Progresso Geral
            const unlockedCount = myCerts.length;
            const totalCount = catalog.length;
            const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

            const progressTxt = document.getElementById('certs-general-progress-txt');
            if (progressTxt) progressTxt.textContent = `${unlockedCount}/${totalCount} (${percentage}%)`;
            const progressBar = document.getElementById('certs-general-progress-bar');
            if (progressBar) progressBar.style.width = `${percentage}%`;

            // Agrupar catálogo por categoria
            const categories = {};
            catalog.forEach(cert => {
                if (!categories[cert.category]) {
                    categories[cert.category] = [];
                }
                categories[cert.category].push(cert);
            });

            // Ordenamento e metadados das categorias
            const categoryDisplayMeta = {
                'Pinturas': { title: '🎨 Pinturas', color: 'var(--color-blue)', icon: '🎨' },
                'Conclusões': { title: '📜 Conclusão de Capítulos', color: '#a0aec0', icon: '📜' },
                'Estrelas': { title: '⭐ Estrelas', color: '#feca57', icon: '⭐' },
                'Comunidade': { title: '🏆 Comunidade', color: '#9b59b6', icon: '🏆' },
                'Influencer': { title: '📣 Influencer', color: '#4dabf7', icon: '📣' },
                'Especiais': { title: '🎉 Especiais', color: '#ff6b6b', icon: '🎉' },
                'Top Exploradores do Mês': { title: '🏆 Top Exploradores', color: '#ffa801', icon: '🏆' },
                'Dinossauros': { title: '🦖 Dinossauros', color: 'var(--color-green)', icon: '🦖' },
                'Livros': { title: '📚 Livros', color: '#f1c40f', icon: '📚' },
                'Expedições': { title: '⛺ Expedições', color: '#e74c3c', icon: '⛺' },
                'Lendárias': { title: '👑 Lendárias', color: '#ffb300', icon: '👑' }
            };

            const orderedCategories = [
                'Pinturas',
                'Conclusões',
                'Estrelas',
                'Comunidade',
                'Influencer',
                'Especiais',
                'Top Exploradores do Mês',
                'Dinossauros',
                'Livros',
                'Expedições',
                'Lendárias'
            ];

            listEl.innerHTML = '';

            // Ordenar categorias
            const sortedCategories = Object.entries(categories).sort(([a], [b]) => {
                let idxA = orderedCategories.indexOf(a);
                let idxB = orderedCategories.indexOf(b);
                if (idxA === -1) idxA = 999;
                if (idxB === -1) idxB = 999;
                return idxA - idxB;
            });

            // Renderizar cada categoria
            sortedCategories.forEach(([catName, certs]) => {
                const meta = categoryDisplayMeta[catName] || { title: `📜 ${catName}`, color: 'var(--color-purple)', icon: '📜' };
                
                // Calcular progresso da categoria
                const catUnlocked = certs.filter(c => myCerts.some(uc => uc.id === c.id)).length;
                const catTotal = certs.length;
                const catPercentage = catTotal > 0 ? Math.round((catUnlocked / catTotal) * 100) : 0;

                const catBlock = document.createElement('div');
                catBlock.className = 'cert-category-block';
                
                // Header da categoria
                let headerHtml = `
                    <div class="cert-category-header">
                        <h3 class="cert-category-title">
                            <span>${meta.icon}</span> ${meta.title.replace(/^[^\s]+\s+/, '')}
                        </h3>
                        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: var(--color-dark-light); margin-bottom: 6px;">
                            <span>${catUnlocked}/${catTotal} certificados</span>
                            <span>${catPercentage}%</span>
                        </div>
                        <div style="width: 100%; height: 10px; background: #e9ecef; border-radius: 10px; overflow: hidden; border: 1px solid #cbd5e1;">
                            <div style="width: ${catPercentage}%; height: 100%; background: ${meta.color}; transition: width 0.5s;"></div>
                        </div>
                    </div>
                `;

                // Grid de certificados
                let gridHtml = `<div class="cert-grid">`;
                
                certs.forEach(cert => {
                    const unlockData = myCerts.find(uc => uc.id === cert.id);
                    const isLocked = !unlockData;
                    
                    const rarityColors = {
                        'Comum': 'comum',
                        'Raro': 'raro',
                        'Épico': 'epico',
                        'Lendário': 'lendario',
                        'Mítico': 'mitico',
                        'Exclusivo': 'exclusivo'
                    };
                    const rarityBadges = {
                        'Comum': '🟢 Comum',
                        'Raro': '🔵 Raro',
                        'Épico': '🟣 Épico',
                        'Lendário': '🟠 Lendário',
                        'Mítico': '🔴 Mítico',
                        'Exclusivo': '👑 Exclusivo'
                    };
                    const rarityClass = `cert-rarity-${rarityColors[cert.rarity] || 'comum'}`;

                    if (isLocked) {
                        const progress = window.getCertificateProgress(cert);
                        const progressText = window.getCertificateProgressText(cert, progress);
                        const percent = progress.target > 0 ? Math.min(100, Math.round((progress.current / progress.target) * 100)) : 0;
                        const isOneTime = (progress.target === 1);

                        let progressHtml = '';
                        if (isOneTime) {
                            progressHtml = `
                                <div style="margin-top: 15px; text-align: center; font-size: 0.75rem; font-weight: 700; color: #4b5563; line-height: 1.3;">
                                    ${progressText}
                                </div>
                            `;
                        } else {
                            progressHtml = `
                                <div style="margin-top: 15px;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 0.75rem; font-weight: 700; color: #4b5563; margin-bottom: 6px; text-align: left;">
                                        <span style="line-height: 1.3; flex-grow: 1; padding-right: 8px;">${progressText}</span>
                                        <span style="white-space: nowrap;">${percent}%</span>
                                    </div>
                                    <div style="width: 100%; height: 10px; background-color: #f1f5f9; border-radius: 10px; overflow: hidden; border: 1.5px solid #cbd5e1;">
                                        <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #94a3b8, #cbd5e1); border-radius: 10px;"></div>
                                    </div>
                                </div>
                            `;
                        }

                        gridHtml += `
                            <div class="cert-card locked" title="🔒 Desbloqueie realizando conquistas!">
                                ${renderCertificateMiniature(cert, true)}
                                <div style="display: flex; flex-direction: column; gap: 4px; text-align: center; flex-grow: 1; justify-content: space-between;">
                                    <div>
                                        <h4 style="font-family: var(--font-heading); font-size: 1.15rem; color: #495057; margin: 0; line-height: 1.2;">🔒 ${cert.title}</h4>
                                        <span style="font-size: 0.7rem; color: #94a3b8; font-weight: 700; display: block; margin-top: 2px;">Categoria: ${cert.category}</span>
                                        <span style="font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; background: #cbd5e1; color: #64748b; font-weight: 800; text-transform: uppercase; display: inline-block; margin-top: 4px;">
                                            ${rarityBadges[cert.rarity] || cert.rarity}
                                        </span>
                                        <p style="font-size: 0.72rem; color: #64748b; font-weight: 600; margin: 8px 0 0 0; line-height: 1.3;">${cert.desc}</p>
                                    </div>
                                    
                                    ${progressHtml}
                                </div>
                            </div>
                        `;
                    } else {
                        const dateStr = new Date(unlockData.unlockedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        });

                        let infoHtml = '';
                        if (unlockData.additionalInfo) {
                            infoHtml = `<div style="font-size: 0.68rem; font-style: italic; color: #7b4fa6; margin-top: 4px; font-weight: 700;">${unlockData.additionalInfo}</div>`;
                        }

                        gridHtml += `
                            <div class="cert-card ${rarityClass}">
                                ${renderCertificateMiniature(cert, false)}
                                <div style="display: flex; flex-direction: column; gap: 4px; text-align: center; flex-grow: 1; justify-content: space-between;">
                                    <div>
                                        <h4 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--color-purple); margin: 0; line-height: 1.2;">${cert.title}</h4>
                                        <span style="font-size: 0.7rem; color: #94a3b8; font-weight: 700; display: block; margin-top: 2px;">Categoria: ${cert.category}</span>
                                        <span class="rarity-badge-mini rarity-color-${rarityColors[cert.rarity] || 'comum'}" style="font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; color: white; font-weight: 800; text-transform: uppercase; display: inline-block; margin-top: 4px;">
                                            ${rarityBadges[cert.rarity] || cert.rarity}
                                        </span>
                                        <p style="font-size: 0.72rem; color: #64748b; font-weight: 600; margin: 8px 0 0 0; line-height: 1.3;">${cert.desc}</p>
                                        ${infoHtml}
                                    </div>
                                    
                                    <div style="margin-top: 15px;">
                                        <span style="font-size: 0.65rem; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 8px;">Conquistado em ${dateStr}</span>
                                        <div style="display: flex; flex-direction: column; gap: 6px;">
                                            <button class="btn btn-primary btn-sm" onclick="openCertsViewerModal('${cert.id}')" style="width: 100%; font-size: 0.75rem; padding: 6px; font-weight: 800; border-radius: 6px; box-shadow: var(--shadow-button-primary); display: flex; align-items: center; justify-content: center; gap: 4px;">
                                                👁️ Visualizar
                                            </button>
                                            <div style="display: flex; gap: 6px;">
                                                <button class="btn btn-secondary btn-sm" onclick="printCertDirect('${cert.id}')" style="flex: 1; font-size: 0.7rem; padding: 6px; font-weight: 800; border-radius: 6px; border: var(--border-thin); background: white; color: var(--color-dark); display: flex; align-items: center; justify-content: center; gap: 4px;">
                                                    📄 Baixar PDF
                                                </button>
                                                <button class="btn btn-secondary btn-sm" onclick="downloadCertDirect('${cert.id}')" style="flex: 1; font-size: 0.7rem; padding: 6px; font-weight: 800; border-radius: 6px; border: var(--border-thin); background: white; color: var(--color-dark); display: flex; align-items: center; justify-content: center; gap: 4px;">
                                                    🖼️ Baixar Imagem
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                });

                gridHtml += `</div>`;

                catBlock.innerHTML = headerHtml + gridHtml;
                listEl.appendChild(catBlock);
            });

        } else {
            listEl.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--color-red); font-weight: bold;">Erro ao carregar certificados: ${data.message}</div>`;
        }
    } catch (err) {
        console.error('Erro ao renderizar certificados:', err);
        listEl.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--color-red); font-weight: bold;">Erro de conexão com o servidor.</div>';
    }
}

window.drawCertificateCanvas = function(canvasId, cert, unlockData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // 1. Limpar e cor de fundo
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, w, h);

    // 2. Cores baseadas em raridade
    let borderMain = '#ffd43b';
    let borderInner = '#ff5e7e';
    let nameColor = '#4dabf7';

    if (cert.rarity === 'Comum') {
        borderMain = '#10b981';
        borderInner = '#34d399';
        nameColor = '#10b981';
    } else if (cert.rarity === 'Raro') {
        borderMain = '#3b82f6';
        borderInner = '#60a5fa';
        nameColor = '#2563eb';
    } else if (cert.rarity === 'Épico') {
        borderMain = '#8b5cf6';
        borderInner = '#a78bfa';
        nameColor = '#7c3aed';
    } else if (cert.rarity === 'Lendário') {
        borderMain = '#f59e0b';
        borderInner = '#fbbf24';
        nameColor = '#d97706';
    } else if (cert.rarity === 'Exclusivo') {
        borderMain = '#ec4899';
        borderInner = '#f472b6';
        nameColor = '#db2777';
    }

    // 3. Desenhar bordas
    ctx.lineWidth = 16;
    ctx.strokeStyle = borderMain;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.lineWidth = 3;
    ctx.strokeStyle = borderInner;
    ctx.strokeRect(36, 36, w - 72, h - 72);

    // 4. Desenhar Emojis nas quinas
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎨', 65, 65);
    ctx.fillText('🏆', w - 65, 65);
    ctx.fillText('⭐', 65, h - 65);
    ctx.fillText('🎉', w - 65, h - 65);

    // 5. Título do Certificado
    ctx.fillStyle = borderInner;
    ctx.font = 'bold 38px Fredoka, Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cert.title.toUpperCase(), w / 2, 130);

    // 6. Subtítulo
    ctx.fillStyle = '#495057';
    ctx.font = '20px Quicksand, sans-serif';
    ctx.fillText('Este certificado é concedido com muito orgulho a:', w / 2, 210);

    // 7. Nome do Recipiente
    const childName = (unlockData.recipientName || (currentUser ? currentUser.name : 'Artista')).toUpperCase();
    ctx.fillStyle = nameColor;
    ctx.font = 'bold 44px Fredoka, Quicksand, sans-serif';
    ctx.fillText(childName, w / 2, 290);

    // 8. Linha decorativa
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 200, 330);
    ctx.lineTo(w / 2 + 200, 330);
    ctx.stroke();

    // 9. Descrição / Motivo do Certificado
    ctx.fillStyle = '#495057';
    ctx.font = '18px Quicksand, sans-serif';
    ctx.fillText(cert.desc, w / 2, 380);

    if (unlockData.additionalInfo) {
        ctx.fillStyle = '#7c3aed';
        ctx.font = 'italic 16px Quicksand, sans-serif';
        ctx.fillText(unlockData.additionalInfo, w / 2, 415);
    }

    // 10. Data formatada
    const dateStr = new Date(unlockData.unlockedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    ctx.fillStyle = '#64748b';
    ctx.font = '15px Quicksand, sans-serif';
    ctx.fillText(dateStr, w / 2, 455);

    // 11. Desenhar assinaturas decorativas acima das linhas
    ctx.fillStyle = '#7b4fa6';
    ctx.font = "italic 36px 'Alex Brush', cursive";
    ctx.fillText('Vovó Sônia', w / 2 - 150, 500);

    ctx.fillStyle = '#1971c2';
    ctx.font = "32px 'Gochi Hand', cursive";
    ctx.fillText('Pedrinho', w / 2 + 150, 500);

    // 12. Nomes impressos abaixo das linhas
    ctx.fillStyle = '#868e96';
    ctx.font = 'bold 13px Quicksand, sans-serif';
    ctx.fillText('Vovó Sônia', w / 2 - 150, 530);
    ctx.fillText('Pedrinho', w / 2 + 150, 530);

    // 13. Linhas de assinatura
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 220, 510);
    ctx.lineTo(w / 2 - 80, 510);
    ctx.moveTo(w / 2 + 80, 510);
    ctx.lineTo(w / 2 + 220, 510);
    ctx.stroke();
};

let currentViewerCertId = null;

window.openCertsViewerModal = async function(certId) {
    if (!currentUser) return;
    currentViewerCertId = certId;

    const modal = document.getElementById('certsViewerModal');
    if (!modal) return;

    modal.style.display = 'block';

    const cert = window.certificatesCatalog ? window.certificatesCatalog.find(c => c.id === certId) : null;
    const unlockData = currentUser.certificates ? currentUser.certificates.find(uc => uc.id === certId) : null;

    if (!cert || !unlockData) {
        showToast('Erro ao carregar o certificado.', 'error');
        window.closeCertsViewerModal();
        return;
    }

    const titleEl = document.getElementById('certs-viewer-title');
    if (titleEl) titleEl.textContent = cert.title;

    setTimeout(() => {
        window.drawCertificateCanvas('certs-viewer-canvas', cert, unlockData);
    }, 100);
};

window.closeCertsViewerModal = function() {
    const modal = document.getElementById('certsViewerModal');
    if (modal) modal.style.display = 'none';
    currentViewerCertId = null;
};

window.printCertFromCanvas = function() {
    const canvas = document.getElementById('certs-viewer-canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const windowContent = '<!DOCTYPE html><html><head><title>Imprimir Certificado</title></head><body style="margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fafafa;"><img src="' + dataUrl + '" style="max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;"></body></html>';
    const printWin = window.open('', '', 'width=900,height=700');
    
    if (!printWin) {
        showToast('Por favor, ative os pop-ups para imprimir seu certificado! 📜', 'warning');
        return;
    }

    printWin.document.open();
    printWin.document.write(windowContent);
    printWin.document.close();
    printWin.focus();

    setTimeout(() => {
        printWin.print();
        printWin.close();
    }, 500);
};

window.downloadCertFromCanvas = function() {
    const canvas = document.getElementById('certs-viewer-canvas');
    if (!canvas) return;

    const certId = currentViewerCertId;
    const cert = window.certificatesCatalog ? window.certificatesCatalog.find(c => c.id === certId) : null;
    const filename = cert ? `certificado-${cert.id}.png` : 'certificado.png';

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Certificado baixado com sucesso! 🎉', 'success');
};

let certificatesToCelebrateQueue = [];

window.checkNewlyUnlockedCertificates = function(newlyUnlocked) {
    if (!newlyUnlocked || newlyUnlocked.length === 0) return;
    
    newlyUnlocked.forEach(cert => {
        if (!certificatesToCelebrateQueue.some(c => c.id === cert.id)) {
            certificatesToCelebrateQueue.push(cert);
        }
    });

    const celebrationModal = document.getElementById('certsCelebrationModal');
    if (certificatesToCelebrateQueue.length > 0 && celebrationModal && celebrationModal.style.display !== 'block') {
        window.showNextCertificateCelebration();
    }
};

window.showNextCertificateCelebration = function() {
    if (certificatesToCelebrateQueue.length === 0) return;

    const cert = certificatesToCelebrateQueue.shift();
    const modal = document.getElementById('certsCelebrationModal');
    if (!modal) return;

    // Configurar modal
    const titleEl = document.getElementById('certs-celebrate-title');
    if (titleEl) titleEl.textContent = cert.title;
    const descEl = document.getElementById('certs-celebrate-desc');
    if (descEl) descEl.textContent = cert.desc;

    const badge = document.getElementById('certs-celebrate-rarity-badge');
    if (badge) {
        badge.textContent = cert.rarity;
        
        let badgeColorStyle = 'background-color: #10b981; color: white;';
        if (cert.rarity === 'Raro') badgeColorStyle = 'background-color: #3b82f6; color: white;';
        else if (cert.rarity === 'Épico') badgeColorStyle = 'background-color: #8b5cf6; color: white;';
        else if (cert.rarity === 'Lendário') badgeColorStyle = 'background-color: #f59e0b; color: white;';
        else if (cert.rarity === 'Exclusivo') badgeColorStyle = 'background-color: #ec4899; color: white;';
        
        badge.style = badgeColorStyle + ' position: absolute; top: -12px; left: 50%; transform: translateX(-50%); font-size: 0.85rem; padding: 5px 12px; border-radius: 20px; font-weight: 800; border: var(--border-thin); text-transform: uppercase;';
    }

    modal.style.display = 'block';

    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
        });
    }

    modal.setAttribute('data-current-cert-id', cert.id);
};

window.closeCertsCelebrationModal = function() {
    const modal = document.getElementById('certsCelebrationModal');
    if (modal) modal.style.display = 'none';

    if (certificatesToCelebrateQueue.length > 0) {
        setTimeout(window.showNextCertificateCelebration, 400);
    }
};

window.viewCertFromCelebration = function() {
    const modal = document.getElementById('certsCelebrationModal');
    const certId = modal ? modal.getAttribute('data-current-cert-id') : null;
    window.closeCertsCelebrationModal();
    if (certId) {
        navigate('/certificados');
        setTimeout(() => {
            window.openCertsViewerModal(certId);
        }, 300);
    }
};

window.renderCertificadosView = renderCertificadosView;
