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
    'esportes': { name: 'Esportes', emoji: '🏆', desc: 'Desenhos de Esportes para colorir e imprimir grátis! Baixe imagens de futebol, basquete, natação, ginástica e muitas outras modalidades divertidas.' }
};

const POPULAR_SUGGESTIONS = ['unicórnio', 'dinossauro', 'borboleta', 'leão', 'golfinho'];

// --- POOL DE FRASES POR CATEGORIA ---
const CATEGORY_PHRASES = {};

// --- ESTADO GLOBAL DA APLICAÇÃO ---
let allDrawings = [];
let lastSelectedPhrase = "";
let currentDrawingPhrase = "";

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
    if (!currentUser) {
        // Visitante deslogado: só 5 categorias e index <= 2000
        return FREE_CATEGORIES.includes(dw.category) && dw.index <= 2000;
    }
    const plan = currentUser.plan;
    const idx = dw.index;
    if (plan === 'Grátis') {
        return idx <= 2000;
    } else if (plan === 'Família') {
        return idx <= 5000;
    } else if (plan === 'Professor') {
        return idx <= 7000;
    } else if (plan === 'Colégio') {
        return true;
    }
    return idx <= 2000; // fallback
}

function getRequiredPlanForDrawing(dw) {
    if (dw.index <= 2000) return 'Grátis';
    if (dw.index <= 5000) return 'Família';
    if (dw.index <= 7000) return 'Professor';
    return 'Colégio';
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
        const photoUrl = currentUser.photo || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
        if (userAvatarImg) userAvatarImg.src = photoUrl;
        if (dropdownAvatar) dropdownAvatar.src = photoUrl;
        
        // Atualizar Nome (Header e Dropdown)
        const shortName = currentUser.name ? currentUser.name.split(' ')[0] : 'Nome';
        if (userDisplayName) userDisplayName.textContent = shortName;
        if (dropdownDisplayName) dropdownDisplayName.textContent = shortName;
        
        // Atualizar Badge de Plano (Header e Dropdown)
        [userPlanBadge, dropdownPlanBadge].forEach(badge => {
            if (badge) {
                badge.textContent = currentUser.plan;
                if (currentUser.plan === 'Família') {
                    badge.style.backgroundColor = 'var(--color-green)';
                    badge.textContent = 'Família 🏠';
                } else if (currentUser.plan === 'Colégio') {
                    badge.style.backgroundColor = 'var(--color-purple)';
                    badge.textContent = 'Colégio 🏫';
                } else if (currentUser.plan === 'Professor') {
                    badge.style.backgroundColor = 'var(--color-orange)';
                    badge.textContent = 'Professor 🍎';
                } else {
                    badge.style.backgroundColor = 'var(--color-dark-light)';
                    badge.textContent = currentUser.plan || 'Grátis';
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
            let maxCapacity = 4;
            if (currentUser.plan === 'Grátis') {
                maxCapacity = 4;
            } else if (currentUser.plan === 'Premium') {
                maxCapacity = 60;
            } else if (currentUser.plan === 'Família') {
                maxCapacity = 20;
            } else if (currentUser.plan === 'Colégio') {
                maxCapacity = 400;
            } else if (currentUser.plan === 'Ultra') {
                maxCapacity = 400;
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
}

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
    
    if (!tabLogin || !tabRegister || !loginForm || !registerForm) return;
    
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
}

function navigate(path, pushState = true) {
    let cleanPath = path.trim();
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
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
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Roteamento
    if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '') {
        renderHomeView();
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
    } else if (cleanPath === '/minhas-criacoes') {
        renderMinhasCriacoesView();
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
function renderPlanosView() {
    document.title = "KidCanvas — Planos de Assinatura 🎨";
    setMetaDescription("Conheça os planos de assinatura do KidCanvas. Do Grátis ao Família, libere milhares de desenhos exclusivos e histórias mágicas para colorir!");
    
    const view = document.getElementById('view-planos');
    if (view) {
        view.style.display = 'block';
    }
    
    // Atualizar os botões baseados no plano do usuário
    const btnGratis = document.getElementById('btn-plan-gratis');
    const btnFamilia = document.getElementById('btn-plan-familia');
    const btnProfessor = document.getElementById('btn-plan-professor');
    const btnColegio = document.getElementById('btn-plan-colegio');
    
    const cardGratis = document.getElementById('plan-card-gratis');
    const cardFamilia = document.getElementById('plan-card-familia');
    const cardProfessor = document.getElementById('plan-card-professor');
    const cardColegio = document.getElementById('plan-card-colegio');
    
    // Resetar estilos de plano atual
    [cardGratis, cardFamilia, cardProfessor, cardColegio].forEach(card => {
        if (card) card.classList.remove('active-plan');
    });
    
    const plansInfo = [
        { name: 'Grátis', btn: btnGratis, card: cardGratis, credits: 4 },
        { name: 'Família', btn: btnFamilia, card: cardFamilia, credits: 20 },
        { name: 'Professor', btn: btnProfessor, card: cardProfessor, credits: 100 },
        { name: 'Colégio', btn: btnColegio, card: cardColegio, credits: 400 }
    ];

    if (currentUser) {
        const currentPlan = currentUser.plan || 'Grátis';
        
        plansInfo.forEach(p => {
            if (p.card && p.name === currentPlan) {
                p.card.classList.add('active-plan');
            }
            
            if (p.btn) {
                if (p.name === currentPlan) {
                    p.btn.textContent = 'Seu plano atual 🎨';
                    p.btn.disabled = true;
                    p.btn.onclick = null;
                } else {
                    if (p.name === 'Grátis') {
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
        if (btnGratis) {
            btnGratis.textContent = 'Cadastrar Grátis';
            btnGratis.disabled = false;
            btnGratis.onclick = () => {
                openAuthModal();
                switchAuthTab('register');
            };
        }
        
        [
            { name: 'Família', btn: btnFamilia, credits: 20 },
            { name: 'Professor', btn: btnProfessor, credits: 100 },
            { name: 'Colégio', btn: btnColegio, credits: 400 }
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
    const planName = selectedPlanForUpgrade;
    if (!planName) return;
    
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
            window.location.href = data.url;
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
    const planName = selectedPlanForUpgrade;
    
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
    const hasEn = currentUser && ['Família', 'Professor', 'Colégio'].includes(currentUser.plan);
    const hasEs = currentUser && ['Colégio'].includes(currentUser.plan);
    
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
    
    card.innerHTML = `
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
    
    return card;
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
        
        const showTrending = idx < showTrendingFirstN;
        const card = createDrawingCard(dw, null, showTrending);
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
    
    const submitBtn = document.getElementById('btn-submit-custom-drawing');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Desenho (1 c.)';
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
    setMetaDescription("Crie e ilustre livrinhos infantis completos consumindo o saldo do seu plano no KidCanvas!");
    
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
                const res = await fetch(imageUrl);
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

        viewerModalTitle.textContent = `✨ O Livro Mágico de ${story.characterName}`;
        
        let html = `
            <div class="cover-page-card" style="margin-top: 10px;">
                <div class="cover-header">
                    <h2 class="cover-title">O Livro Mágico de ${story.characterName}</h2>
                    <div class="cover-subtitle">Uma história criada especialmente para ${story.characterName}</div>
                </div>
                <div class="cover-art-frame">
                    <img src="${story.coverUrl}" alt="Capa do Livro Mágico">
                </div>
            </div>
            
            <div style="margin-top: 30px; margin-bottom: 20px;">
                <h4 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--color-orange); text-align: center; margin-bottom: 25px;">📖 Páginas do Livro</h4>
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
        
        const hasEn = ['Professor', 'Colégio'].includes(plan);
        const hasEs = ['Colégio'].includes(plan);
        
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
                        alert("A criação de livros em Inglês está disponível a partir do plano Professor!");
                        return false;
                    }
                    if (!isEn && !hasEs) {
                        e.preventDefault();
                        e.stopPropagation();
                        radioPt.checked = true;
                        document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('active'));
                        langCardPt.classList.add('active');
                        alert("A criação de livros em Espanhol está disponível no plano Colégio!");
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
        const checkedRadio = document.querySelector('input[name="pageCount"]:checked');
        const pageCount = checkedRadio ? checkedRadio.value : '4';
        const btnGenerate = document.getElementById('btnGenerate');
        if (btnGenerate) {
            btnGenerate.textContent = `🧙‍♂️ Criar Livro (${pageCount} c.)`;
        }
    }
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
                    if (submitBtnCustomDrawing) {
                        submitBtnCustomDrawing.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Desenho (2 c.)';
                    }
                } else {
                    if (customDrawingRadioMedium) customDrawingRadioMedium.classList.add('active');
                    if (customDrawingRadioHigh) customDrawingRadioHigh.classList.remove('active');
                    if (submitBtnCustomDrawing) {
                        submitBtnCustomDrawing.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Desenho (1 c.)';
                    }
                }
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
            btnGenerate.disabled = !chkCiente.checked;
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
        if (currentUser.paginasRestantes < pageCount) {
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
                    bookLang: bookLang
                })
            });
            
            const result = await response.json();
            
            clearInterval(loadInt);
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Ocorreu um erro ao gerar o livro completo.");
            }
            
            // 3. Sincronizar dados do usuário atualizados do servidor
            await syncUserProfile();
            
            // Populating Cover page
            generatedParagraphs = result.paragraphs;
            generatedCoverUrl = result.coverUrl;
            
            document.getElementById('bookTitle').textContent = `✨ O Livro Mágico de ${characterName}`;
            document.getElementById('coverTitle').textContent = `O Livro Mágico de ${characterName}`;
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
            showError(`Erro ao gerar livro: ${err.message}`);
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
            a.download = `livro-${cleanName}-pagina-${pageNum}.png`;
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
                a.download = `livro-${cleanName}-capa.png`;
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
                    <title>Capa - O Livro Mágico de ${characterName}</title>
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
                <title>Página ${index + 1} - Livro Mágico</title>
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
                    <title>O Livro Mágico de ${characterName}</title>
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
                        <button onclick="window.print()" style="padding: 10px 25px; font-size: 1.1rem; cursor: pointer; background: #2ECC71; color: white; border: none; border-radius: 5px; font-weight: bold;">Imprimir Livro Completo 🖨</button>
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
            alert("Nenhum livro gerado para exportação.");
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
                    <h1 style="font-size: 30px; color: #7B4FA6; margin-bottom: 5px; font-family: 'Fredoka', sans-serif; text-align: center;">O Livro Mágico de ${cleanCharName}</h1>
                    <p style="font-size: 16px; color: #5C4033; font-weight: bold; text-align: center; margin: 0;">Uma história criada especialmente para ${cleanCharName}</p>
                </div>
                <div style="width: 140mm; height: 140mm; border: 4px solid #3D281A; border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #fafbfc; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                    <img src="${coverUrl}" style="width: 100%; height: 100%; object-fit: cover;">
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

            pageDiv.innerHTML = `
                <div style="width: 100%; border-bottom: 2px dashed #E67E22; padding-bottom: 5px; font-weight: bold; color: #7B4FA6; font-size: 16px; display: flex; justify-content: space-between;">
                    <span>O Livro Mágico de ${cleanCharName}</span>
                    <span>Página ${idx + 1}</span>
                </div>
                <div style="width: 130mm; height: 130mm; border: 3px solid #3D281A; border-radius: 15px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #fafbfc; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin: 15px 0;">
                    <img src="${page.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;">
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
            filename: `livro-${cleanCharNameLower}.pdf`,
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

        tempContainer.innerHTML = `
            <div style="width: 100%; border-bottom: 2px dashed #E67E22; padding-bottom: 10px; font-weight: bold; color: #7B4FA6; font-size: 18px; text-align: center; font-family: 'Fredoka', sans-serif;">
                Desenho Mágico — KidCanvas
            </div>
            <div style="width: 160mm; height: 160mm; border: 4px solid #3D281A; border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #fafbfc; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: contain;">
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
        const message = `Criei um livro mágico personalizado chamado "${title}" no KidCanvas! 📖✨\n\nVocê também pode criar histórias personalizadas com ilustrações lindas para seus filhos! Acesse: https://www.kidcanvas.com.br`;
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
                    <h4 style="font-size: 1.3rem; margin-top:10px;">Você ainda não criou livros mágicos!</h4>
                    <p style="color: var(--color-dark-light); font-size: 0.95rem;">Vá em 'Crie seu Livro' para iniciar histórias personalizadas.</p>
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
                        <span class="drawing-card-category">Livro Mágico 📖</span>
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
}

async function downloadSavedImage(url, prompt) {
    const cleanPrompt = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    try {
        const res = await fetch(url);
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
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

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

    tempContainer.innerHTML = `
        <div style="width: 100%; border-bottom: 2px dashed #E67E22; padding-bottom: 10px; font-weight: bold; color: #7B4FA6; font-size: 18px; text-align: center; font-family: 'Fredoka', sans-serif;">
            Desenho Mágico — KidCanvas
        </div>
        <div style="width: 160mm; height: 160mm; border: 4px solid #3D281A; border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #fafbfc; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin: 20px 0;">
            <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: contain;">
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
    container.appendChild(img);
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
                <img src="${story.coverUrl}" alt="Capa do Livro Mágico">
            </div>
        </div>
        
        <div style="margin-top: 30px; margin-bottom: 20px;">
            <h4 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--color-orange); text-align: center; margin-bottom: 25px;">📖 Páginas do Livro</h4>
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
            <button class="btn-generate btn-bottom" style="background-color: var(--color-purple); display: inline-block; width: auto; padding: 12px 30px;" onclick="closeViewer()">Fechar Livro</button>
        </div>
    `;

    viewerContent.innerHTML = html;
    viewerModal.classList.add('open');
}

function switchCreationsTab(tab) {
    const tabDrawings = document.getElementById('tab-my-drawings');
    const tabStories = document.getElementById('tab-my-stories');
    const gridDrawings = document.getElementById('my-drawings-grid');
    const containerStories = document.getElementById('my-stories-container');
    
    if (!tabDrawings || !tabStories || !gridDrawings || !containerStories) return;
    
    if (tab === 'drawings') {
        tabDrawings.style.color = 'var(--color-purple)';
        tabDrawings.style.borderBottomColor = 'var(--color-purple)';
        tabStories.style.color = 'var(--color-dark-light)';
        tabStories.style.borderBottomColor = 'transparent';
        gridDrawings.style.display = 'grid';
        containerStories.style.display = 'none';
    } else {
        tabStories.style.color = 'var(--color-purple)';
        tabStories.style.borderBottomColor = 'var(--color-purple)';
        tabDrawings.style.color = 'var(--color-dark-light)';
        tabDrawings.style.borderBottomColor = 'transparent';
        gridDrawings.style.display = 'none';
        containerStories.style.display = 'block';
    }
}

window.renderMinhasCriacoesView = renderMinhasCriacoesView;
window.downloadSavedImage = downloadSavedImage;
window.printSavedImage = printSavedImage;
window.openSavedStoryViewer = openSavedStoryViewer;
window.switchCreationsTab = switchCreationsTab;

