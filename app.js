/* ==========================================================================
   LÓGICA PRINCIPAL DO SITE KIDCANVAS.COM.BR
   Roteador SPA, Galeria 100% Grátis, Busca Global, Auto-Sugestões e Downloads
   ========================================================================== */

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
    'anime-ninjas': { name: 'Ninjas Anime', emoji: '🥷', desc: 'Desenhos de Ninjas de anime para colorir e imprimir grátis! Encontre ninjas elementais, ninjas iniciantes, mestres das sombras e ninjas mágicos.' },
    'anime-mechas-e-robos': { name: 'Mechas e Robôs Anime', emoji: '🤖', desc: 'Desenhos de Mechas e Robôs gigantes de anime para colorir grátis! Pinte robôs amigáveis, pilotos de mecha, robôs animais e naves.' },
    'anime-kawaii': { name: 'Desenhos Kawaii', emoji: '🐱', desc: 'Desenhos Kawaii super fofos para colorir grátis! Pinte gatos, cachorros, pandas, capivaras, sorvetes e frutas no estilo kawaii japonês.' },
    'anime-criaturas-misticas': { name: 'Criaturas Místicas Anime', emoji: '🐉', desc: 'Desenhos de Criaturas Místicas de anime para colorir grátis! Baixe imagens de dragões, fênix, raposas mágicas de nove caudas e grifos.' },
    'anime-vida-escolar': { name: 'Vida Escolar Anime', emoji: '🏫', desc: 'Desenhos de Vida Escolar estilo anime para colorir e imprimir! Pinte salas de aula, festivais escolares, clubes de artes e amigos da escola.' },
    'anime-fantasia': { name: 'Fantasia Anime', emoji: '✨', desc: 'Desenhos de Fantasia estilo anime para colorir grátis! Baixe desenhos de reinos mágicos, castelos voadores, cristais e portais encantados.' },
    'anime-futurista': { name: 'Sci-Fi e Futurista Anime', emoji: '🚀', desc: 'Desenhos de Sci-Fi e Futurismo estilo anime para colorir! Pinte cidades futuristas, motos voadoras, naves e estações espaciais.' },
    'anime-gamer': { name: 'Gamer Anime', emoji: '🎮', desc: 'Desenhos Gamer estilo anime para colorir grátis! Encontre avatares de jogadores, guerreiros digitais, monstros de pixel e mundos virtuais.' }
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
    return true;
}

function getRequiredPlanForDrawing(dw) {
    if (dw.index <= 2000) return 'Aprendiz';
    if (dw.index <= 5000) return 'Artista';
    if (dw.index <= 7000) return 'Mago Criador';
    return 'Lenda KidCanvas';
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
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Desenho (2 créditos mágicos)';
    } else {
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Desenho (1 crédito mágico)';
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
        const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credential: response.credential })
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
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
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
    // Intercept Google OAuth redirect token
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
}

function navigate(path, pushState = true) {
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
    } else if (cleanPath.startsWith('/categoria/')) {
        const categorySlug = cleanPath.replace('/categoria/', '');
        if (!currentUser && !FREE_CATEGORIES.includes(categorySlug)) {
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
            
            const isLocked = !currentUser && !FREE_CATEGORIES.includes(slug);
            const card = document.createElement('a');
            
            if (isLocked) {
                card.href = '#';
                card.className = 'category-card locked';
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
    
    // Buscar criações do Hall da Fama para os cards de destaque
    fetch('/api/paintings/public')
        .then(response => response.json())
        .then(result => {
            if (result.success && result.paintings) {
                updateFeaturedHomeCards(result.paintings);
            }
        })
        .catch(err => console.error('Erro ao carregar os destaques da home:', err));
}

// Atualiza os cards de destaque na home baseado nas pinturas do Hall da Fama
function updateFeaturedHomeCards(paintings) {
    if (!paintings || paintings.length === 0) return;

    // 1. Destaque Geral (Mais Votado de todos)
    const sortedAll = [...paintings].sort((a, b) => (b.stars || b.likes || 0) - (a.stars || a.likes || 0));
    const topGeral = sortedAll[0];

    // 2. Campeão de Colorir
    const colorirOnly = paintings.filter(p => p.category !== 'Mão Livre');
    const sortedColorir = [...colorirOnly].sort((a, b) => (b.stars || b.likes || 0) - (a.stars || a.likes || 0));
    const topColorir = sortedColorir[0];

    // 3. Campeão Mão Livre
    const maolivreOnly = paintings.filter(p => p.category === 'Mão Livre');
    const sortedMaoLivre = [...maolivreOnly].sort((a, b) => (b.stars || b.likes || 0) - (a.stars || a.likes || 0));
    const topMaoLivre = sortedMaoLivre[0];

    // Atualizar Card Geral
    if (topGeral) {
        const cardGeral = document.getElementById('featured-card-geral');
        if (cardGeral) {
            const img = cardGeral.querySelector('.featured-img');
            const title = cardGeral.querySelector('.featured-card-title');
            const author = cardGeral.querySelector('p');
            const starsText = (topGeral.stars || topGeral.likes) ? `⭐ ${topGeral.stars || topGeral.likes} estrelas` : '⭐ 0 estrelas';
            
            if (img) {
                img.src = topGeral.url;
                img.alt = topGeral.prompt;
            }
            if (title) title.textContent = topGeral.prompt || 'Desenho sem título';
            if (author) author.innerHTML = `Por: <strong>${topGeral.creatorName || topGeral.userName || 'Artista'}</strong> &bull; ${starsText}`;
        }
    }

    // Atualizar Card Colorir
    if (topColorir) {
        const cardColorir = document.getElementById('featured-card-colorir');
        if (cardColorir) {
            const img = cardColorir.querySelector('.featured-img');
            const title = cardColorir.querySelector('.featured-card-title');
            const author = cardColorir.querySelector('p');
            const starsText = (topColorir.stars || topColorir.likes) ? `⭐ ${topColorir.stars || topColorir.likes} estrelas` : '⭐ 0 estrelas';
            
            if (img) {
                img.src = topColorir.url;
                img.alt = topColorir.prompt;
            }
            if (title) title.textContent = topColorir.prompt || 'Desenho sem título';
            if (author) author.innerHTML = `Por: <strong>${topColorir.creatorName || topColorir.userName || 'Artista'}</strong> &bull; ${starsText}`;
        }
    }

    // Atualizar Card Mão Livre
    if (topMaoLivre) {
        const cardMaoLivre = document.getElementById('featured-card-maolivre');
        if (cardMaoLivre) {
            const img = cardMaoLivre.querySelector('.featured-img');
            const title = cardMaoLivre.querySelector('.featured-card-title');
            const author = cardMaoLivre.querySelector('p');
            const starsText = (topMaoLivre.stars || topMaoLivre.likes) ? `⭐ ${topMaoLivre.stars || topMaoLivre.likes} estrelas` : '⭐ 0 estrelas';
            
            if (img) {
                img.src = topMaoLivre.url;
                img.alt = topMaoLivre.prompt;
            }
            if (title) title.textContent = topMaoLivre.prompt || 'Desenho sem título';
            if (author) author.innerHTML = `Por: <strong>${topMaoLivre.creatorName || topMaoLivre.userName || 'Artista'}</strong> &bull; ${starsText}`;
        }
    }
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
            
            const isLocked = !currentUser && !FREE_CATEGORIES.includes(slug);
            const card = document.createElement('a');
            
            if (isLocked) {
                card.href = '#';
                card.className = 'category-card locked';
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
    document.getElementById('category-detail-icon').textContent = catInfo.emoji;
    document.getElementById('category-detail-title').textContent = catInfo.name;
    document.getElementById('category-detail-desc').textContent = catInfo.desc;
    
    const filteredDrawings = categorySlug === 'novidades'
        ? allDrawings.filter(d => d.isNew)
        : allDrawings.filter(d => d.category === categorySlug);
    const countEl = document.getElementById('category-drawings-count');
    countEl.textContent = `${filteredDrawings.length} desenhos disponíveis`;
    
    const grid = document.getElementById('category-drawings-grid');
    renderDrawingsInGrid(filteredDrawings, grid, 4);
    
    // Configurar busca interna da categoria
    const categorySearchInput = document.getElementById('category-drawings-search');
    if (categorySearchInput) {
        categorySearchInput.value = '';
        categorySearchInput.oninput = () => {
            const val = categorySearchInput.value.trim().toLowerCase();
            const searched = filteredDrawings.filter(d => d.pt.toLowerCase().includes(val) || d.en.toLowerCase().includes(val));
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
                showToast('A legenda bilíngue em inglês está disponível a partir do plano Família! 🚀', 'info');
                return false;
            }
            if (val === 'es' && !hasEs) {
                e.preventDefault();
                // Forçar a seleção de volta para o PT
                document.querySelector('input[name="phrase-lang-mode"][value="pt"]').checked = true;
                showToast('A legenda trilíngue em espanhol está disponível no plano Colégio! 🚀', 'info');
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
                backUrl: `/${categorySlug}/${drawingSlug}`
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
            <div class="card-img-wrapper" style="${isLocked ? 'filter: grayscale(1) opacity(0.85);' : ''}">
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

function openCreditsModal(message) {
    const modal = document.getElementById('creditsModal');
    const msgEl = document.getElementById('creditsModalMessage');
    if (modal) {
        if (msgEl && message) {
            msgEl.textContent = message;
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
    const cost = imageQuality === 'high' ? 2 : 1;
    
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
            
            setupCustomDrawingActionListeners(data.imageUrl);
            
            currentUser.paginasRestantes = data.paginasRestantes;
            updateHeaderAuthDisplay();
            
            showToast('Desenho gerado com sucesso! Divirta-se colorindo! 🎨', 'success');
        } else {
            showToast(data.message || 'Ocorreu um erro ao gerar a imagem.', 'error');
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

function setupCustomDrawingActionListeners(imageUrl) {
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
        const card2 = document.getElementById('card2');
        const card4 = document.getElementById('card4');
        const card6 = document.getElementById('card6');
        const card8 = document.getElementById('card8');
        const card10 = document.getElementById('card10');
        
        const radio2 = document.querySelector('input[name="pageCount"][value="2"]');
        const radio4 = document.querySelector('input[name="pageCount"][value="4"]');
        const radio6 = document.querySelector('input[name="pageCount"][value="6"]');
        const radio8 = document.querySelector('input[name="pageCount"][value="8"]');
        const radio10 = document.querySelector('input[name="pageCount"][value="10"]');
        
        // Resetar bloqueios
        [card2, card4, card6, card8, card10].forEach(card => {
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
            lockCard(card6, radio6, 'Família');
            lockCard(card8, radio8, 'Professor');
            lockCard(card10, radio10, 'Colégio');
        } else if (plan === 'Família') {
            lockCard(card8, radio8, 'Professor');
            lockCard(card10, radio10, 'Colégio');
        } else if (plan === 'Professor') {
            lockCard(card10, radio10, 'Colégio');
        }
        
        // Escutar cliques para interceptar opções bloqueadas
        [card2, card4, card6, card8, card10].forEach(card => {
            if (card) {
                card.onclick = (e) => {
                    if (card.classList.contains('locked-option')) {
                        e.preventDefault();
                        e.stopPropagation();
                        radio4.checked = true;
                        document.querySelectorAll('.page-card').forEach(c => c.classList.remove('active'));
                        card4.classList.add('active');
                        updateGenerateButtonText();
                        
                        const requiredPlan = card === card6 ? 'Família' : (card === card8 ? 'Professor' : 'Colégio');
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
        const pageCount = checkedRadio ? parseInt(checkedRadio.value, 10) : 4;
        const checkedQuality = document.querySelector('input[name="imageQuality"]:checked');
        const imageQuality = checkedQuality ? checkedQuality.value : 'medium';
        const cost = imageQuality === 'high' ? pageCount * 2 : pageCount;
        
        btnGenerate.textContent = `🧙‍♂️ Criar História Ilustrada (${cost} créditos mágicos)`;
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
        const cost = imageQuality === 'high' ? pageCount * 2 : pageCount;
        
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
            
            // reset page count to 4
            pageCards.forEach(c => c.classList.remove('active'));
            document.getElementById('card4').classList.add('active');
            document.querySelector('input[name="pageCount"][value="4"]').checked = true;
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
    }

    function sharePreloadedStoryOnWhatsApp(storyKey) {
        const story = PRELOADED_STORIES[storyKey];
        if (!story) return;
        shareStoryOnWhatsApp(story.characterName);
    }

    function generatePreloadedPDF(storyKey) {
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

// Crayons Paleta (RGB)
const paintCrayons = [
    { hex: '#ff5e7e', rgb: [255, 94, 126], name: 'Rosa' },
    { hex: '#ff8138', rgb: [255, 129, 56], name: 'Laranja' },
    { hex: '#ffd43b', rgb: [255, 212, 59], name: 'Amarelo' },
    { hex: '#40c057', rgb: [64, 192, 87], name: 'Verde' },
    { hex: '#12b886', rgb: [18, 184, 134], name: 'Menta' },
    { hex: '#22b8cf', rgb: [34, 184, 207], name: 'Ciano' },
    { hex: '#4dabf7', rgb: [77, 171, 247], name: 'Azul' },
    { hex: '#7950f2', rgb: [121, 80, 242], name: 'Roxo' },
    { hex: '#e64980', rgb: [230, 73, 128], name: 'Pink' },
    { hex: '#a61e4d', rgb: [166, 30, 77], name: 'Bordô' },
    { hex: '#868e96', rgb: [134, 142, 150], name: 'Cinza' },
    { hex: '#212529', rgb: [33, 37, 41], name: 'Preto' },
    { hex: '#ffffff', rgb: [255, 255, 255], name: 'Branco' }
];

let paintHistory = [];
let paintHistoryIndex = -1;
const maxHistoryStates = 20;

let paintBgCanvas = null;
let paintBgCtx = null;
let paintFgCanvas = null;
let paintFgCtx = null;
let paintBorderImage = null;



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

    // Resetar estado de desenho
    isPaintDrawing = false;
    setPaintTool('bucket');

    // Resetar checkbox público e botão de salvar
    const resetChkPublic = document.getElementById('paint-chk-public');
    const resetBtnSave = document.getElementById('paint-btn-save');
    if (resetChkPublic) {
        resetChkPublic.checked = false;
        if (resetBtnSave) {
            resetBtnSave.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar na Galeria';
            resetBtnSave.style.backgroundColor = 'var(--color-green)';
            resetBtnSave.style.borderColor = 'var(--color-green)';
            resetBtnSave.classList.remove('pulse-button');
        }
    }

    // Carregar imagem de desenho
    const loader = document.getElementById('paint-canvas-loader');
    if (loader) loader.style.display = 'flex';

    const chkPublicWrapper = document.getElementById('paint-chk-public-wrapper');

    if (data.imgUrl === 'blank') {
        if (chkPublicWrapper) chkPublicWrapper.style.display = 'none';
        if (resetChkPublic) resetChkPublic.checked = false;
        
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

    // Configurar Paleta
    const colorsGrid = document.getElementById('paint-colors-grid');
    if (colorsGrid) {
        colorsGrid.innerHTML = '';
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
            
            div.addEventListener('click', () => {
                document.querySelectorAll('#paint-colors-grid .color-crayon').forEach(c => c.classList.remove('selected'));
                div.classList.add('selected');
                selectedPaintColor = crayon.rgb;
            });
            colorsGrid.appendChild(div);
        });
    }

    // Configurar Eventos do Canvas
    paintCanvas.onmousedown = startPaintingDraw;
    paintCanvas.onmousemove = executePaintingDraw;
    paintCanvas.onmouseup = stopPaintingDraw;
    paintCanvas.onmouseleave = stopPaintingDraw;

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

    // Touch support
    paintCanvas.ontouchstart = (e) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        paintCanvas.dispatchEvent(mouseEvent);
    };
    paintCanvas.ontouchmove = (e) => {
        const touch = e.touches[0];
        const rect = paintCanvas.getBoundingClientRect();
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        paintCanvas.dispatchEvent(mouseEvent);
    };
    paintCanvas.ontouchend = () => {
        const mouseEvent = new MouseEvent('mouseup', {});
        paintCanvas.dispatchEvent(mouseEvent);
    };

    // Configurar botões extras
    const btnUndo = document.getElementById('paint-btn-undo');
    if (btnUndo) btnUndo.onclick = undoPaint;

    const btnRedo = document.getElementById('paint-btn-redo');
    if (btnRedo) btnRedo.onclick = redoPaint;

    const btnPrint = document.getElementById('paint-btn-print');
    if (btnPrint) {
        btnPrint.onclick = () => {
            const dataUrl = paintCanvas.toDataURL('image/png');
            printSavedImage(dataUrl);
        };
    }

    const btnPDF = document.getElementById('paint-btn-pdf');
    if (btnPDF) {
        btnPDF.onclick = () => {
            const dataUrl = paintCanvas.toDataURL('image/png');
            downloadSavedDrawingPDF(dataUrl, window.currentPaintingData.name, btnPDF);
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
                const dataUrl = paintCanvas.toDataURL('image/png');
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
                    showToast('Erro ao preparar compartilhamento.', 'error');
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

    const chkPublic = document.getElementById('paint-chk-public');
    if (chkPublic && btnSave) {
        chkPublic.onchange = () => {
            if (chkPublic.checked) {
                btnSave.innerHTML = '<i class="fa-solid fa-rocket"></i> Compartilhar no Hall da Fama!';
                btnSave.style.backgroundColor = 'var(--color-purple)';
                btnSave.style.borderColor = 'var(--color-purple)';
                btnSave.classList.add('pulse-button');
            } else {
                btnSave.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar na Galeria';
                btnSave.style.backgroundColor = 'var(--color-green)';
                btnSave.style.borderColor = 'var(--color-green)';
                btnSave.classList.remove('pulse-button');
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

                    composePaintCanvas();
                    savePaintHistory();
                    showToast('Tela limpa com sucesso! 🖍️', 'success');
                }
            );
        };
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

function composePaintCanvas() {
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
}

function savePaintHistory() {
    if (paintHistoryIndex < paintHistory.length - 1) {
        paintHistory = paintHistory.slice(0, paintHistoryIndex + 1);
    }
    
    const bgData = paintBgCtx.getImageData(0, 0, 800, 600);
    const fgData = paintFgCtx.getImageData(0, 0, 800, 600);
    
    paintHistory.push({ bg: bgData, fg: fgData });
    
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
        paintCanvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' style=\'font-size:22px\'><text y=\'22\'>🪣</text></svg>") 4 22, auto';
    } else if (tool === 'glitter') {
        paintCanvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' style=\'font-size:22px\'><text y=\'22\'>✨</text></svg>") 11 11, auto';
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
    activePaintTool = tool;
    document.querySelectorAll('.paint-tool-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.paint-stamp-btn').forEach(btn => btn.classList.remove('active'));

    const sliderGroup = document.getElementById('paint-slider-group');
    
    if (tool === 'bucket') {
        document.getElementById('paint-tool-bucket').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'none';
    } else if (tool === 'glitter') {
        document.getElementById('paint-tool-glitter').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'none';
    } else if (tool === 'brush') {
        document.getElementById('paint-tool-brush').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'flex';
    } else if (tool === 'brush-magic') {
        document.getElementById('paint-tool-brush-magic').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'flex';
    } else if (tool === 'eraser') {
        document.getElementById('paint-tool-eraser').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'flex';
    } else if (tool === 'text') {
        document.getElementById('paint-tool-text').classList.add('active');
        if (sliderGroup) sliderGroup.style.display = 'flex';
        
        // Auto-preenche o campo de texto se estiver vazio para dar feedback visual imediato no cursor
        const textInput = document.getElementById('paint-text-value');
        if (textInput && textInput.value.trim() === '') {
            textInput.value = 'KidCanvas';
        }
    }
    
    updatePaintCursor(tool);
}

// Configurar Toolbar de Pintura
document.getElementById('paint-tool-bucket').onclick = () => setPaintTool('bucket');
document.getElementById('paint-tool-glitter').onclick = () => setPaintTool('glitter');
document.getElementById('paint-tool-brush-magic').onclick = () => setPaintTool('brush-magic');
document.getElementById('paint-tool-brush').onclick = () => setPaintTool('brush');
document.getElementById('paint-tool-eraser').onclick = () => setPaintTool('eraser');
document.getElementById('paint-tool-text').onclick = () => setPaintTool('text');

// Configurar carimbos
document.querySelectorAll('.paint-stamp-btn').forEach(btn => {
    btn.onclick = () => {
        setPaintTool('stamp');
        document.querySelectorAll('.paint-stamp-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.selectedPaintStamp = btn.getAttribute('data-stamp');
        
        const sliderGroup = document.getElementById('paint-slider-group');
        if (sliderGroup) sliderGroup.style.display = 'flex';
        
        updatePaintCursor('stamp', window.selectedPaintStamp);
    };
});

function getPaintMousePos(evt) {
    const rect = paintCanvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) * (paintCanvas.width / rect.width),
        y: (evt.clientY - rect.top) * (paintCanvas.height / rect.height)
    };
}

function startPaintingDraw(evt) {
    const pos = getPaintMousePos(evt);
    
    if (activePaintTool === 'bucket') {
        executePaintFloodFill(Math.round(pos.x), Math.round(pos.y), false);
    } else if (activePaintTool === 'glitter') {
        executePaintFloodFill(Math.round(pos.x), Math.round(pos.y), true);
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
        }
    }
}

function executePaintingDraw(evt) {
    if (!isPaintDrawing) return;
    const pos = getPaintMousePos(evt);
    const brushSizeInput = document.getElementById('paint-brush-size');
    const brushSizeVal = brushSizeInput ? brushSizeInput.value : 8;

    if (activePaintTool === 'brush-magic') {
        if (!magicBrushTempCanvas) {
            magicBrushTempCanvas = document.createElement('canvas');
        }
        magicBrushTempCanvas.width = paintCanvas.width;
        magicBrushTempCanvas.height = paintCanvas.height;
        magicBrushTempCtx = magicBrushTempCanvas.getContext('2d');
        
        // Limpar canvas temporário
        magicBrushTempCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
        
        // Desenhar traço no canvas temporário
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
        
        // Aplicar máscara do flood fill
        if (magicBrushMaskCanvas) {
            magicBrushTempCtx.save();
            magicBrushTempCtx.globalCompositeOperation = 'destination-in';
            magicBrushTempCtx.drawImage(magicBrushMaskCanvas, 0, 0);
            magicBrushTempCtx.restore();
        }
        
        // Desenhar o traço mascarado no canvas de fundo real
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
    if (isPaintDrawing) {
        isPaintDrawing = false;
        savePaintHistory();
        // Resetar máscaras do pincel mágico
        magicBrushMaskCanvas = null;
        magicBrushMaskCtx = null;
    }
}

function executePaintStamp(x, y) {
    const stamp = window.selectedPaintStamp || '⭐';
    const sizeInput = document.getElementById('paint-brush-size');
    const size = sizeInput ? parseInt(sizeInput.value) * 2.5 : 40;

    if (stamp.startsWith('http') || stamp.startsWith('/') || stamp.startsWith('./')) {
        const img = new Image();
        img.src = stamp;
        img.onload = () => {
            paintFgCtx.save();
            paintFgCtx.translate(x, y);
            paintFgCtx.drawImage(img, -size / 2, -size / 2, size, size);
            paintFgCtx.restore();
            composePaintCanvas();
            savePaintHistory();
        };
    } else {
        paintFgCtx.save();
        paintFgCtx.font = `${size}px Arial, sans-serif`;
        paintFgCtx.textAlign = 'center';
        paintFgCtx.textBaseline = 'middle';
        paintFgCtx.fillText(stamp, x, y);
        paintFgCtx.restore();
        composePaintCanvas();
        savePaintHistory();
    }
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
        return (r < 110 && g < 110 && b < 110 && a > 100);
    }

    if (isOutline(startR, startG, startB, startA)) {
        return;
    }

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
        itemEl.innerHTML = `
            <span class="ranking-position">${medal}</span>
            <img class="ranking-thumb" src="${p.url}" alt="${p.prompt}">
            <div class="ranking-info">
                <h4 class="ranking-title">${p.prompt}</h4>
                <p class="ranking-creator">Por: <strong style="color: var(--color-purple); text-decoration: underline;" onclick="event.stopPropagation(); openPublicProfile('${(p.creatorName || p.userName || 'Artista').replace(/'/g, "\\'")}', '${(p.userEmail || '').replace(/'/g, "\\'")}')">${p.creatorName || p.userName || 'Artista'}</strong></p>
            </div>
            <span class="ranking-stars">⭐ ${p.stars || 0}</span>
        `;
        listEl.appendChild(itemEl);
    });
}
window.renderRankingList = renderRankingList;

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
                
                card.innerHTML = `
                    <div style="aspect-ratio: 4/3; background: #fafafa; border-radius: 4px; overflow: hidden;">
                        <img src="${dw.url}" style="width: 100%; height: 100%; object-fit: contain; cursor: pointer;" onclick="window.open('${dw.url}', '_blank')">
                    </div>
                    <div style="font-size: 0.8rem; line-height: 1.3;">
                        <strong>Título:</strong> ${dw.prompt}<br>
                        <strong>Criador:</strong> ${dw.creatorName || dw.userName || 'Artista'}<br>
                        <strong>Email:</strong> ${dw.userEmail || 'Desconhecido'}<br>
                        <strong>Categoria:</strong> ${dw.category || 'Colorir'}
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: auto;">
                        <button class="btn btn-sm btn-success" onclick="approvePublicPainting('${dw.url}')" style="flex: 1; font-size: 0.75rem; padding: 4px; background-color: #2ecc71; border-color: #2ecc71; color: white; cursor: pointer;">Aprovar ✅</button>
                        <button class="btn btn-sm btn-danger" onclick="deletePublicPainting('${dw.url}')" style="flex: 1; font-size: 0.75rem; padding: 4px; background-color: #e74c3c; border-color: #e74c3c; color: white; cursor: pointer;">Deletar ❌</button>
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

                    // Avatar do criador (emoji ou imagem Google)
                    let avatarHtml = '👤';
                    if (dw.creatorAvatar) {
                        const isUrl = dw.creatorAvatar.startsWith('http') || dw.creatorAvatar.startsWith('/');
                        if (isUrl) {
                            avatarHtml = `<img src="${dw.creatorAvatar}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 4px; display: inline-block; border: 1px solid rgba(0,0,0,0.1);">`;
                        } else {
                            avatarHtml = `<span style="font-size: 1.05rem; vertical-align: middle; margin-right: 4px; display: inline-block; line-height: 1;">${dw.creatorAvatar}</span>`;
                        }
                    } else {
                        avatarHtml = `<span style="font-size: 1.05rem; vertical-align: middle; margin-right: 4px; display: inline-block; line-height: 1;">👤</span>`;
                    }

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

                    if (category === 'Histórias Mágicas') {
                        card.innerHTML = `
                            ${championBadgeHtml}
                            <div style="border: var(--border-thin); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 4px; aspect-ratio: 4/3; background: #fdfdfd; display: flex; align-items: center; justify-content: center; position: relative;">
                                <img src="${dw.url}" alt="${dw.prompt}" style="width: 100%; height: 100%; object-fit: contain; cursor: pointer;" onclick="window.open('${dw.url}', '_blank')">
                                <span style="position: absolute; top: 6px; right: 6px; font-size: 0.7rem; font-weight: 800; padding: 3px 8px; border-radius: 20px; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.4); ${catBadgeColor}">
                                    ${category}
                                </span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 4px; flex-grow: 1;">
                                <span style="font-size: 0.8rem; color: var(--color-dark-light); font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">${avatarHtml} Autor: <strong style="color: var(--color-purple); cursor: pointer; text-decoration: underline;" onclick="openPublicProfile('${(dw.creatorName || dw.userName || 'Artista').replace(/'/g, "\\'")}', '${(dw.userEmail || '').replace(/'/g, "\\'")}')">${dw.creatorName || dw.userName || 'Artista'}</strong></span>
                                <h4 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--color-purple); margin: 0; line-height: 1.2;">📖 ${dw.prompt}</h4>
                                <p style="font-size: 0.75rem; color: var(--color-dark-light); margin: 0;">Publicado ${timeStr}</p>
                                
                                <div style="background: #fdfdfd; border-left: 3px solid var(--color-purple); padding: 6px 10px; margin: 4px 0; font-size: 0.75rem; font-style: italic; color: #555; max-height: 50px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                                    "${dw.firstLines || 'Era uma vez...'}"
                                </div>
                                
                                <button class="btn btn-primary btn-sm" onclick="viewPublicStory('${dw.url}')" style="width: 100%; font-size: 0.8rem; padding: 6px; font-weight: 700; border-radius: 8px; margin-top: auto; background-color: var(--color-purple); border-color: var(--color-purple); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                                    📖 Ler História
                                </button>
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #f0f0f0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <span style="font-weight: 800; color: var(--color-orange); font-size: 1.05rem;">⭐ <span class="like-count">${starsCount}</span></span>
                                    <button class="btn btn-secondary btn-sm like-btn" onclick="likePublicPainting('${dw.url}', this)" style="font-size: 0.8rem; padding: 4px 10px; font-weight: 700; border-radius: 8px; border: var(--border-medium); ${btnStyle} cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 4px;">
                                        ⭐ Dar estrelinha
                                    </button>
                                </div>
                                <div style="display: flex; gap: 6px; width: 100%; align-items: center;">
                                    <button class="btn btn-secondary btn-sm" onclick="printSavedImage('${dw.url}')" style="flex: 1; justify-content: center; font-size: 0.75rem; padding: 4px;" title="Imprimir"><i class="fa-solid fa-print"></i></button>
                                    <button class="btn btn-success btn-sm" onclick="shareSavedDrawingOnWhatsApp('${dw.url}', '${dw.prompt}')" style="flex: 1; justify-content: center; font-size: 0.75rem; padding: 4px; background-color: #25d366; border-color: #25d366; color: white;" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></button>
                                    <a href="#" onclick="reportPublicPainting(event, '${dw.url}')" style="color: #e74c3c; font-size: 0.7rem; font-weight: bold; text-decoration: none; padding: 4px; display: inline-flex; align-items: center; gap: 2px;" title="Denunciar esta história"><i class="fa-solid fa-flag"></i> Denunciar</a>
                                </div>
                            </div>
                        `;
                    } else {
                        let extraContentHtml = '';
                        if (category === 'Criação com IA') {
                            extraContentHtml = `
                                <div style="background: #f7f9fa; border: 1px dashed #ced4da; border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 0.75rem; font-weight: 600; color: var(--color-dark); max-height: 70px; overflow-y: auto;">
                                    <strong>Prompt:</strong> <span style="font-style: italic; color: #495057;">"${dw.prompt}"</span>
                                </div>
                            `;
                        }

                        card.innerHTML = `
                            ${championBadgeHtml}
                            <div style="border: var(--border-thin); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 4px; aspect-ratio: 4/3; background: #fdfdfd; display: flex; align-items: center; justify-content: center; position: relative;">
                                <img src="${dw.url}" alt="${dw.prompt}" style="width: 100%; height: 100%; object-fit: contain; cursor: pointer;" onclick="window.open('${dw.url}', '_blank')">
                                <span style="position: absolute; top: 6px; right: 6px; font-size: 0.7rem; font-weight: 800; padding: 3px 8px; border-radius: 20px; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.4); ${catBadgeColor}">
                                    ${category}
                                </span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                ${extraContentHtml}
                                <span style="font-size: 0.8rem; color: var(--color-dark-light); font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">${avatarHtml} Por: <strong style="color: var(--color-purple); cursor: pointer; text-decoration: underline;" onclick="openPublicProfile('${(dw.creatorName || dw.userName || 'Artista').replace(/'/g, "\\'")}', '${(dw.userEmail || '').replace(/'/g, "\\'")}')">${dw.creatorName || dw.userName || 'Artista'}</strong></span>
                                <h4 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--color-purple); margin: 0;">${dw.prompt}</h4>
                                <p style="font-size: 0.75rem; color: var(--color-dark-light); margin: 0;">Publicado ${timeStr}</p>
                                
                                <!-- Selo Automático -->
                                <div style="margin-top: 4px; min-height: 20px;">
                                    ${renderStarsBadgeHtml(starsCount)}
                                </div>
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: auto; padding-top: 8px; border-top: 1px dashed #f0f0f0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <span style="font-weight: 800; color: var(--color-orange); font-size: 1.05rem;">⭐ <span class="like-count">${starsCount}</span></span>
                                    <button class="btn btn-secondary btn-sm like-btn" onclick="likePublicPainting('${dw.url}', this)" style="font-size: 0.8rem; padding: 4px 10px; font-weight: 700; border-radius: 8px; border: var(--border-medium); ${btnStyle} cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 4px;">
                                        ⭐ Dar estrelinha
                                    </button>
                                </div>
                                <div style="display: flex; gap: 6px; width: 100%; align-items: center;">
                                    <button class="btn btn-secondary btn-sm" onclick="printSavedImage('${dw.url}')" style="flex: 1; justify-content: center; font-size: 0.75rem; padding: 4px;" title="Imprimir"><i class="fa-solid fa-print"></i></button>
                                    <button class="btn btn-success btn-sm" onclick="shareSavedDrawingOnWhatsApp('${dw.url}', '${dw.prompt}')" style="flex: 1; justify-content: center; font-size: 0.75rem; padding: 4px; background-color: #25d366; border-color: #25d366; color: white;" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></button>
                                    <a href="#" onclick="reportPublicPainting(event, '${dw.url}')" style="color: #e74c3c; font-size: 0.7rem; font-weight: bold; text-decoration: none; padding: 4px; display: inline-flex; align-items: center; gap: 2px;" title="Denunciar esta pintura"><i class="fa-solid fa-flag"></i> Denunciar</a>
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
        creatorName = prompt('Qual o nome ou apelido do pequeno artista que criou esta pintura?', currentUser.name || currentUser.email.split('@')[0]);
        if (creatorName === null) {
            return; // Cancelado pelo usuário
        }
        creatorName = creatorName.trim() || currentUser.name || currentUser.email.split('@')[0];
    }

    showToast('Salvando sua pintura na nuvem... ⏳', 'info');

    try {
        const imageBase64 = paintCanvas.toDataURL('image/png');
        const sessionToken = localStorage.getItem('kidcanvas_session_token') || currentUser.token;
        const isCustomAI = data.isCustomAI || false;
        const category = isCustomAI ? 'Criação com IA' : (data.imgUrl === 'blank' ? 'Mão Livre' : 'Colorir');

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
                creatorName: creatorName
            })
        });

        const resData = await response.json();

        if (response.ok && resData.success) {
            currentUser.myPaintings = resData.myPaintings;
            checkNewAchievements();
            if (isPublic) {
                showToast('Pintura enviada para o Hall da Fama! Ela passará por moderação antes de aparecer publicamente. 🎉', 'success');
            } else {
                showToast('Pintura salva com sucesso na sua galeria! 🎉', 'success');
            }
            openCertificateModal(data.name);
        } else {
            showToast(resData.message || 'Erro ao salvar pintura.', 'error');
        }
    } catch(err) {
        console.error(err);
        showToast('Erro ao se conectar ao servidor.', 'error');
    }
}

function openCertificateModal(drawingName) {
    const modal = document.getElementById('certificateModal');
    if (!modal) return;

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
        closeCertificateModal();
        navigate('/minhas-criacoes');
        switchCreationsTab('paintings');
    };
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

    cCtx.fillStyle = '#868e96';
    cCtx.font = 'italic 16px Quicksand, sans-serif';
    cCtx.fillText('Vovó Sônia', w / 2 - 150, 525);
    cCtx.fillText('Pedrinho', w / 2 + 150, 525);

    cCtx.strokeStyle = '#cbd5e1';
    cCtx.lineWidth = 1;
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
        backUrl: '/'
    };
    navigate('/pintar-online');
}

window.renderPintarOnlineView = renderPintarOnlineView;
window.closeCertificateModal = closeCertificateModal;
window.startFreeHandDrawing = startFreeHandDrawing;

// ==============================================
// STICKER CONSOLE & CUSTOM DIALOG SYSTEM
// ==============================================

const stickerCategories = {
    top: ['😎', '👑', '🌈', '⭐', '❤️', '🎈', '🦋', '🐶', '🐱', '☀️', '🌙', '🚀', '🏆'],
    acessorios: ['😎', '❤️', '🎀', '🤠', '🏴‍☠️', '🎩', '👔', '💡', '👓', '🕶️', '👒'],
    emocoes: ['😀', '😍', '🤪', '🧔', '👅', '😊', '🤩', '🧐', '😂', '🥳'],
    magicos: ['🪄', '⭐', '✨', '🌈', '☁️', '🌙', '☀️', '🧚', '🧪', '🔮', '🦄', '🪐'],
    animais: ['🐶', '🐱', '🐰', '🦋', '🐞', '🐝', '🦕', '🦄', '🐉', '🐟', '🦁', '🐯'],
    festa: ['🎈', '🎁', '🎂', '🎉', '🎊', '🎆', '🏆', '🏅', '🍭', '🍿'],
    aventura: ['🚀', '🛸', '🏴‍☠️', '🗺️', '⚔️', '🛡️', '🔭', '🧭', '🏎️', '🌋'],
    moda: [
        { name: 'Óculos gigantes', url: '/stickers/oculos_gigantes.png' },
        { name: 'Boné azul', url: '/stickers/bone_azul.png' },
        { name: 'Boné vermelho', url: '/stickers/bone_vermelho.png' },
        { name: 'Coroa dourada', url: '/stickers/coroa_dourada.png' },
        { name: 'Gravata', url: '/stickers/gravata.png' },
        { name: 'Laço rosa', url: '/stickers/laco_rosa.png' },
        { name: 'Relógio', url: '/stickers/relogio.png' },
        { name: 'Fones de ouvido', url: '/stickers/fones_de_ouvido.png' }
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
        const tabNames = ['top', 'acessorios', 'emocoes', 'magicos', 'animais', 'festa', 'aventura', 'moda', 'desbloqueaveis'];
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
    setPaintTool('stamp');
    window.selectedPaintStamp = emoji;
    updatePaintCursor('stamp', emoji);
    closeStickerConsoleModal();
    
    // Remover classe active de todos os botões de carimbo rápidos do sidebar
    document.querySelectorAll('.paint-stamp-btn').forEach(btn => btn.classList.remove('active'));
    
    // Mostrar feedback
    if (emoji.startsWith('http') || emoji.startsWith('/') || emoji.startsWith('./')) {
        const parts = emoji.split('/');
        const filename = parts[parts.length - 1].replace('.png', '').replace(/_/g, ' ');
        const formattedName = filename.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        showToast(`Adesivo "${formattedName}" selecionado! Toque no desenho para colar. ✨`, 'success');
    } else {
        showToast(`Carimbo ${emoji} selecionado! Toque no desenho para colar. ✨`, 'success');
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


// --- SISTEMA DE CONQUISTAS E PERFIL PÚBLICO ---

function checkNewAchievements() {
    if (!currentUser) return;
    const stars = getUserTotalStars();
    const checkedKey = 'checked_stars_' + currentUser.id;
    
    // Inicializar na primeira verificação sem disparar modal retroativo
    if (localStorage.getItem(checkedKey) === null) {
        localStorage.setItem(checkedKey, (stars === 0 ? -1 : stars).toString());
        return;
    }
    
    const lastCheckedStars = parseInt(localStorage.getItem(checkedKey) || '0', 10);
    
    const newlyUnlocked = [];
    unlockableBadges.forEach(badge => {
        if (stars >= badge.stars && lastCheckedStars < badge.stars) {
            newlyUnlocked.push(badge);
        }
    });

    localStorage.setItem(checkedKey, stars.toString());

    if (newlyUnlocked.length > 0) {
        // Exibe o maior selo desbloqueado nesta rodada
        const highestBadge = newlyUnlocked[newlyUnlocked.length - 1];
        showAchievementModal(highestBadge);
    }
}
window.checkNewAchievements = checkNewAchievements;

function showAchievementModal(badge) {
    const modal = document.getElementById('achievementModal');
    if (!modal) return;

    const emojiEl = document.getElementById('achievement-modal-emoji');
    const nameEl = document.getElementById('achievement-modal-badge-name');

    if (emojiEl) emojiEl.textContent = badge.emoji;
    if (nameEl) nameEl.textContent = badge.name;

    modal.classList.add('open');

    // Disparar efeito de confetes
    if (typeof confetti === 'function') {
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#bb0000', '#ffffff', '#ffb300', '#7B4FA6']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#bb0000', '#ffffff', '#ffb300', '#7B4FA6']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
}
window.showAchievementModal = showAchievementModal;

function closeAchievementModal() {
    const modal = document.getElementById('achievementModal');
    if (modal) modal.classList.remove('open');
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
    document.getElementById('profile-modal-stars-text').textContent = 'Carregando...';
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
            if (avatarEl) {
                const avatarVal = profile.avatar || '👤';
                const isUrl = avatarVal.startsWith('http') || avatarVal.startsWith('/');
                if (isUrl) {
                    avatarEl.innerHTML = `<img src="${avatarVal}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: var(--border-medium); display: inline-block;">`;
                } else {
                    avatarEl.innerHTML = avatarVal;
                    avatarEl.style.fontSize = '3.5rem';
                }
            }
            document.getElementById('profile-modal-name').textContent = profile.name;
            document.getElementById('profile-modal-stars-text').textContent = `${profile.stars} estrelas`;
            document.getElementById('profile-modal-paintings').textContent = profile.paintingsCount;
            
            if (storiesEl) storiesEl.textContent = profile.storiesCount;
            if (aiImagesEl) aiImagesEl.textContent = profile.aiImagesCount;
            
            // Renderizar grade de conquistas/selos
            const achievements = profile.achievements || {
                primeira_participacao: false,
                destaque_semana: false,
                campeao_categoria: false,
                lenda_kidcanvas: false
            };

            const list = [
                {
                    key: 'primeira_participacao',
                    title: 'Primeira Participação',
                    desc: 'Primeiro desenho publicado',
                    emoji: '🥉',
                    isUnlocked: achievements.primeira_participacao
                },
                {
                    key: 'destaque_semana',
                    title: 'Destaque da Semana',
                    desc: 'Top 10 semanal',
                    emoji: '🥈',
                    isUnlocked: achievements.destaque_semana
                },
                {
                    key: 'campeao_categoria',
                    title: 'Campeão da Categoria',
                    desc: 'Mais votado do mês',
                    emoji: '🥇',
                    isUnlocked: achievements.campeao_categoria
                },
                {
                    key: 'lenda_kidcanvas',
                    title: 'Lenda KidCanvas',
                    desc: '500 estrelas acumuladas',
                    emoji: '👑',
                    isUnlocked: achievements.lenda_kidcanvas
                }
            ];

            let unlockedCount = 0;
            const gridHtml = list.map(item => {
                if (item.isUnlocked) unlockedCount++;
                const opacity = item.isUnlocked ? '1' : '0.4';
                const filter = item.isUnlocked ? 'none' : 'grayscale(1)';
                const bg = item.isUnlocked ? '#fffde7' : '#fafafa';
                const borderColor = item.isUnlocked ? '#ffe082' : '#e0e0e0';
                const titleColor = item.isUnlocked ? 'var(--color-purple)' : '#757575';
                const descColor = item.isUnlocked ? 'var(--color-dark-light)' : '#9e9e9e';

                return `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: var(--border-thin); border-radius: var(--radius-sm); background: ${bg}; border-color: ${borderColor}; opacity: ${opacity}; filter: ${filter}; transition: all 0.2s ease;">
                        <span style="font-size: 2.2rem; min-width: 40px; text-align: center;">${item.emoji}</span>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-weight: 800; font-size: 0.95rem; color: ${titleColor};">${item.title}</span>
                            <span style="font-size: 0.8rem; color: ${descColor}; font-weight: 500;">${item.desc}</span>
                        </div>
                        <span style="margin-left: auto; font-size: 0.85rem; font-weight: 800; color: ${item.isUnlocked ? '#2e7d32' : '#9e9e9e'};">
                            ${item.isUnlocked ? '✅ Conquistado' : '🔒 Bloqueado'}
                        </span>
                    </div>
                `;
            }).join('');
            
            document.getElementById('profile-modal-badges').textContent = `${unlockedCount}/4`;
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
            generatePDFFromData(matchedStory.title, matchedStory.coverUrl || matchedStory.imageUrl || url, matchedStory.paragraphs, 'btnDownloadPublicPDF');
        };
    }
    
    const btnPrint = document.getElementById('btnPrintPublicBook');
    if (btnPrint) {
        btnPrint.onclick = () => {
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
    
    const grid = document.getElementById('avatar-options-grid');
    if (grid) {
        grid.innerHTML = '';
        const options = ['🧒', '👧', '👦', '🦊', '🐶', '🦄', '🐱', '🦁', '🐯', '🐼', '🐨', '🐰', '🐻', '🐸', '🐵', '🐣', '🦖', '🐉', '🐙', '🐝', '🧚', '🧙', '🧜', '👽', '🤖'];
        options.forEach(emoji => {
            const btn = document.createElement('button');
            btn.textContent = emoji;
            btn.style.fontSize = '2.2rem';
            btn.style.padding = '8px';
            btn.style.border = 'var(--border-thin)';
            btn.style.borderRadius = '12px';
            btn.style.backgroundColor = '#fdfdfd';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.15s ease';
            
            // Estilo selecionado
            if (currentUser && currentUser.avatar === emoji) {
                btn.style.borderColor = 'var(--color-purple)';
                btn.style.backgroundColor = 'rgba(123, 31, 162, 0.08)';
                btn.style.boxShadow = '0 0 0 2px var(--color-purple)';
            }
            
            btn.onmouseover = () => {
                btn.style.transform = 'scale(1.15)';
                btn.style.backgroundColor = '#f3effa';
            };
            btn.onmouseout = () => {
                btn.style.transform = 'scale(1.0)';
                btn.style.backgroundColor = (currentUser && currentUser.avatar === emoji) ? 'rgba(123, 31, 162, 0.08)' : '#fdfdfd';
            };
            btn.onclick = () => selectAvatar(emoji);
            grid.appendChild(btn);
        });
    }
    
    modal.style.display = 'flex';
}
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
        } else {
            showToast(result.message || 'Erro ao salvar avatar.', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Erro ao se conectar ao servidor.', 'error');
    }
}
window.selectAvatar = selectAvatar;

function updateUserAvatarUI(avatar) {
    const userAvatarImg = document.getElementById('user-avatar-img');
    const userAvatarEmoji = document.getElementById('user-avatar-emoji');
    const dropdownAvatar = document.getElementById('dropdown-user-avatar');
    const dropdownAvatarEmoji = document.getElementById('dropdown-user-avatar-emoji');
    
    if (!avatar) {
        avatar = '👤';
    }
    
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
            userAvatarEmoji.textContent = avatar;
            userAvatarEmoji.style.display = 'block';
        }
        
        if (dropdownAvatar) dropdownAvatar.style.display = 'none';
        if (dropdownAvatarEmoji) {
            dropdownAvatarEmoji.textContent = avatar;
            dropdownAvatarEmoji.style.display = 'block';
        }
    }
}
window.updateUserAvatarUI = updateUserAvatarUI;
