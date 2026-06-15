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
    'contos-de-fada': { name: 'Contos de Fada', emoji: '👑', desc: 'Desenhos de Contos de Fada para colorir e imprimir grátis! Pinte castelos mágicos, princesas lindas, fadas e dragões encantados com as crianças.' },
    'espaco': { name: 'Espaço Sideral', emoji: '🚀', desc: 'Desenhos do Espaço Sideral para colorir e imprimir grátis! Viaje pintando foguetes, astronautas, planetas distantes e alienígenas amigáveis.' },
    'natureza': { name: 'Natureza e Flores', emoji: '🌻', desc: 'Desenhos de Natureza e Flores para colorir e imprimir grátis! Baixe imagens de flores sorridentes, borboletas lindas, lagos e florestas encantadoras.' },
    'veiculos': { name: 'Veículos e Carros', emoji: '🚗', desc: 'Desenhos de Veículos e Carros para colorir e imprimir grátis! Pinte carros velozes, aviões no céu, trens nos trilhos e caminhões de bombeiro.' },
    'comidas-e-doces': { name: 'Comidas e Doces', emoji: '🍩', desc: 'Desenhos de Comidas e Doces para colorir e imprimir grátis! Baixe desenhos de sorvetes gostosos, bolos de aniversário e frutas felizes para pintar.' },
    'cotidiano': { name: 'Cotidiano', emoji: '🧸', desc: 'Desenhos do Cotidiano para colorir e imprimir grátis! Pinte brinquedos, parquinhos infantis, atividades divertidas e momentos do dia a dia das crianças.' },
    'fantasia': { name: 'Fantasia', emoji: '🦄', desc: 'Desenhos de Fantasia para colorir e imprimir grátis! Entre no mundo da imaginação com unicórnios mágicos, sereias cantoras e monstros fofos.' },
    'profissoes': { name: 'Profissões', emoji: '👩‍🚒', desc: 'Desenhos de Profissões para colorir e imprimir grátis! Inspire-se colorindo bombeiros corajosos, médicos atenciosos, professores e muito mais.' },
    'unicornios': { name: 'Unicórnios', emoji: '🦄', desc: 'Desenhos de Unicórnios para colorir e imprimir grátis! Lindas imagens de unicórnios mágicos com asas brilhantes, nuvens fofas e arco-íris encantados.' },
    'festa-junina': { name: 'Festa Junina', emoji: '🤠', desc: 'Desenhos de Festa Junina para colorir e imprimir grátis! Celebre pintando fogueiras, pipoca, bandeirinhas coloridas e toda a alegria das festas caipiras.' },
    'datas-comemorativas': { name: 'Datas Comemorativas', emoji: '🎄', desc: 'Desenhos de Datas Comemorativas para colorir e imprimir grátis! Encontre ilustrações especiais para o Natal, Páscoa, Dia das Crianças e datas festivas.' },
    'alfabeto-e-numeros': { name: 'Alfabeto e Números', emoji: '🔤', desc: 'Desenhos do Alfabeto e Números para colorir e imprimir grátis! Letras de A a Z e números de 0 a 9 grandes e vazados para pintar, brincar e aprender.' },
    'futebol': { name: 'Futebol', emoji: '⚽', desc: 'Desenhos de Futebol para colorir e imprimir grátis! Baixe imagens de bolas de futebol, traves, jogadores animados e viva a emoção do esporte.' },
    'princesas': { name: 'Princesas', emoji: '👸', desc: 'Desenhos de Princesas para colorir e imprimir grátis! Imagens de princesas fofas com vestidos bonitos e tiaras brilhantes em reinos mágicos.' },
    'super-herois': { name: 'Super-Heróis', emoji: '🦸', desc: 'Desenhos de Super-Heróis para colorir e imprimir grátis! Baixe ilustrações de super-heróis e super-heroínas corajosos em aventuras incríveis.' },
    'frutas-e-legumes': { name: 'Frutas e Legumes', emoji: '🍎', desc: 'Desenhos de Frutas e Legumes para colorir e imprimir grátis! Desenhos de frutinhas felizes, vegetais saudáveis e comidinhas divertidas para pintar.' },
    'flores': { name: 'Flores', emoji: '🌸', desc: 'Desenhos de Flores para colorir e imprimir grátis! Baixe imagens de flores lindas, jardins floridos, girassóis e rosas encantadoras para pintar.' },
    'paper-doll': { name: 'Bonecas de Papel', emoji: '✂️', desc: 'Desenhos de Bonecas de Papel para colorir e imprimir grátis! Pinte e recorte bonecas de papel fofas com roupas estilosas e acessórios divertidos.' }
};

const POPULAR_SUGGESTIONS = ['unicórnio', 'dinossauro', 'borboleta', 'leão', 'golfinho'];

// --- POOL DE FRASES POR CATEGORIA ---
const CATEGORY_PHRASES = {};

// --- ESTADO GLOBAL DA APLICAÇÃO ---
let allDrawings = [];
let lastSelectedPhrase = "";
let currentDrawingPhrase = "";

// --- LISTA DE CATEGORIAS DISPONÍVEIS PARA VISITANTES ---
const FREE_CATEGORIES = ['animais-selvagens', 'dinossauros', 'fantasia', 'natureza', 'veiculos'];

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
    const userAvatar = document.getElementById('user-avatar-img');
    const userDisplayName = document.getElementById('user-display-name');
    const userPlanBadge = document.getElementById('user-plan-badge');
    const userCreditsBadge = document.getElementById('user-credits-badge');
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
        
        if (userAvatar) userAvatar.src = currentUser.photo || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
        if (userDisplayName) userDisplayName.textContent = currentUser.name.split(' ')[0];
        
        if (userPlanBadge) {
            userPlanBadge.textContent = currentUser.plan;
            if (currentUser.plan === 'Família') {
                userPlanBadge.style.backgroundColor = 'var(--color-green)';
                userPlanBadge.textContent = 'Família 🏠';
            } else {
                userPlanBadge.style.backgroundColor = 'var(--color-purple)';
            }
        }

        const credits = currentUser.paginasRestantes;
        
        // Pílula de moedas no header
        const headerUserCoins = document.getElementById('header-user-coins');
        const headerCreditsCount = document.getElementById('header-credits-count');
        if (headerUserCoins && headerCreditsCount) {
            headerCreditsCount.textContent = credits;
            if (credits === 0) {
                headerUserCoins.classList.add('zero-credits');
            } else {
                headerUserCoins.classList.remove('zero-credits');
            }
        }

        // Cor do raio baseada nos novos thresholds
        let boltColor = '#95A5A6'; // Cinza (0)
        if (credits >= 400) {
            boltColor = '#FFD700'; // Amarelo (400+)
        } else if (credits >= 200) {
            boltColor = '#E67E22'; // Laranja (200 a 399)
        } else if (credits >= 1) {
            boltColor = '#E74C3C'; // Vermelho (1 a 199)
        }

        if (userCreditsBadge) {
            userCreditsBadge.innerHTML = `${credits} c. <span style="color: ${boltColor}; font-weight: bold; text-shadow: 0 0 2px rgba(0,0,0,0.5);">⚡</span>`;
        }

        if (creatorPanel) {
            creatorPanel.style.display = 'block';
            if (creatorLoggedIn) creatorLoggedIn.style.display = 'block';
            if (creatorLoggedOut) creatorLoggedOut.style.display = 'none';
            if (creatorName) creatorName.textContent = currentUser.name.split(' ')[0];
            if (creatorCredits) {
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

        // Esconder pílula de moedas se não estiver logado
        const headerUserCoins = document.getElementById('header-user-coins');
        if (headerUserCoins) {
            headerUserCoins.style.display = 'none';
        }

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
    } else if (cleanPath === '/planos') {
        renderPlanosView();
    } else if (cleanPath === '/gerar-desenho') {
        renderGerarDesenhoView();
    } else if (cleanPath === '/historias-magicas' || cleanPath === '/historia') {
        renderHistoriasMagicasView();
    } else if (cleanPath === '/politica-de-privacidade') {
        renderPoliticaPrivacidadeView();
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
    
    if (currentUser) {
        const plan = currentUser.plan;
        
        if (plan === 'Grátis') {
            if (btnGratis) { btnGratis.textContent = 'Seu plano atual 🎨'; btnGratis.disabled = true; }
            if (btnFamilia) { btnFamilia.textContent = 'Assinar Agora'; btnFamilia.disabled = false; btnFamilia.onclick = () => handlePlanUpgrade('Família', 20); }
            if (cardGratis) cardGratis.classList.add('active-plan');
        } else if (plan === 'Família') {
            if (btnGratis) { btnGratis.textContent = 'Mudar para Grátis'; btnGratis.disabled = false; btnGratis.onclick = () => handlePlanUpgrade('Grátis', 4); }
            if (btnFamilia) { btnFamilia.textContent = 'Seu plano atual 🎨'; btnFamilia.disabled = true; }
            if (cardFamilia) cardFamilia.classList.add('active-plan');
        } else if (plan === 'Professor') {
            if (btnProfessor) { btnProfessor.textContent = 'Seu plano atual 🎨'; btnProfessor.disabled = true; }
            if (cardProfessor) cardProfessor.classList.add('active-plan');
        } else if (plan === 'Colégio') {
            if (btnColegio) { btnColegio.textContent = 'Seu plano atual 🎨'; btnColegio.disabled = true; }
            if (cardColegio) cardColegio.classList.add('active-plan');
        }
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
        if (btnFamilia) {
            btnFamilia.textContent = 'Assinar Agora';
            btnFamilia.disabled = false;
            btnFamilia.onclick = () => handlePlanUpgrade('Família', 20);
        }
    }
}

async function handlePlanUpgrade(planName, pageAmount) {
    if (!currentUser) {
        // Armazenar intenção de upgrade para depois do login/cadastro
        localStorage.setItem("kidcanvas_pending_upgrade", JSON.stringify({ planName, pageAmount }));
        showToast('Faça login ou cadastre-se grátis para assinar o plano! 🚀', 'info');
        openAuthModal();
        return;
    }
    
    try {
        showToast(`Processando atualização para plano ${planName}... 💳`, 'info');
        const res = await fetch('/api/user/upgrade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify({ planName, pageAmount })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            currentUser = data.user;
            updateHeaderAuthDisplay();
            showToast(`Plano atualizado para ${planName}! Saldo de ${pageAmount} páginas ativado. 🚀`, 'success');
            renderPlanosView();
            
            // Recarregar os desenhos para aplicar novos filtros
            await loadDrawings();
            
            // Se estiver logando e redirecionando, limpa
            localStorage.removeItem("kidcanvas_pending_upgrade");
        } else {
            showToast(`Erro ao atualizar plano: ${data.message}`, 'error');
            if (res.status === 401 || (data.message && (data.message.includes('Sessão inválida') || data.message.includes('Sessão expirada') || data.message.includes('Faça login novamente')))) {
                setTimeout(() => {
                    handleHeaderLogout();
                }, 1500);
            }
        }
    } catch(err) {
        console.error(err);
        showToast("Erro de conexão ao processar upgrade de plano.", 'error');
    }
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
                const enText = drawing.en.toUpperCase();
                renderHollowPhraseText(`${ptText} / ${enText}`, 'en');
            } else if (mode === 'es') {
                if (!hasEs) return;
                phraseBox.style.display = 'flex';
                const ptText = drawing.pt.toUpperCase();
                const enText = drawing.en.toUpperCase();
                const esText = getSpanishWord(drawing.en).toUpperCase();
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
    if (cat === 'natureza' || cat === 'flores') {
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
    
    if (!currentUser) {
        showToast('Cadastre-se grátis para criar desenhos mágicos! 🎨', 'info');
        openAuthModal();
        switchAuthTab('register');
        return;
    }
    
    if (currentUser.paginasRestantes < 1) {
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
            body: JSON.stringify({ userPrompt })
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
    const printBtn = document.getElementById('btn-print-custom');
    
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = imageUrl;
            let extension = 'jpg';
            if (imageUrl.startsWith('data:image/png')) {
                extension = 'png';
            } else if (imageUrl.startsWith('data:image/svg+xml')) {
                extension = 'svg';
            } else if (imageUrl.startsWith('data:image/webp')) {
                extension = 'webp';
            }
            a.download = `desenho-magico-kidcanvas.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('Download iniciado! ⬇️', 'success');
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
            coverUrl: "https://ideogram.ai/api/images/ephemeral/zHb235_nWmeW0QQRmND2bw.png?exp=1781586012&sig=f79d91c4d1dfbb3278f2a32fd1e6d7917b98a125063c419ad23636b943fab0e5",
            paragraphs: [
                {
                    text: "Pedrinho mal podia esperar para visitar a casa da Vovó Sônia, pois lá o aguardava uma dupla inseparável e cheia de personalidade: os cachorrinhos Lhasa Apso, Perigo e Tequila. Perigo, com seu pelo fofo e olhos espertos, era um verdadeiro traquinas, sempre pronto para uma nova aventura e aprontando as mais divertidas bagunças. Já Tequila, sua irmãzinha, era a doçura em pessoa, adorando receber carinhos e distribuir lambidinhas carinhosas, com seu rabinho abanando sem parar.",
                    imageUrl: "https://ideogram.ai/api/images/ephemeral/UqovhlbPUvaAXmw3gWllYA.png?exp=1781586009&sig=3b32d274fcfc0a5f923717af787c2fc0867eedc4761880280f69a72281941b2f"
                },
                {
                    text: "Assim que Pedrinho chegou, Perigo, fiel ao seu nome e à sua fama de arteiro, logo o chamou para brincar. Ele pegou uma meia colorida da vovó que estava no varal e começou a correr pelo quintal, convidando Pedrinho para uma perseguição cheia de risadas. Pedrinho, rindo muito, correu atrás dele, tentando pegar a meia, enquanto Perigo desviava com agilidade, fazendo piruetas engraçadas. Era uma verdadeira aventura com Perigo, onde a diversão era garantida a cada pulo e a cada fuga do cachorrinho fujão.",
                    imageUrl: "https://ideogram.ai/api/images/ephemeral/MwjVVTKFVD-POyquNSUEoQ.png?exp=1781586009&sig=95927acea8e50fa8e3a86ce28753c0261e5498aca95a711eaa305fe2bf5241e6"
                },
                {
                    text: "Depois de muita correria e travessuras, Perigo finalmente soltou a meia e se aconchegou perto de Pedrinho para um merecido descanso. Foi a vez de Tequila, com sua delicadeza, aproximar-se e deitar a cabeça no colo do menino. Pedrinho acariciou seu pelo macio, sentindo o calor e o carinho da cachorrinha. Ela fechou os olhinhos, relaxada, enquanto Pedrinho sussurrava segredos em seu ouvido, criando um momento de pura magia e conexão.",
                    imageUrl: "https://ideogram.ai/api/images/ephemeral/DsQErABlWDCPtKgZ8Mkddg.png?exp=1781586007&sig=29396ac5fad485e3d660fbe4cea1d94a953c67f4f9024935cc616b36d0a58207"
                },
                {
                    text: "A tarde na casa da Vovó Sônia passou voando, cheia de brincadeiras e abraços apertados. Pedrinho, Perigo e Tequila formavam um trio perfeito, onde a alegria das traquinagens de um se equilibrava com a doçura e o aconchego do outro. Ao final do dia, Pedrinho se despediu com a promessa de voltar em breve para mais aventuras e carinhos com seus amigos peludos, levando no coração a certeza de que a casa da vovó era um lugar mágico, repleto de amor e diversão sem fim.",
                    imageUrl: "https://ideogram.ai/api/images/ephemeral/HD4-ArS7Uai7n7q4-EZrEw.png?exp=1781586008&sig=3b32f53ece9ffb83a7f1d0c49bd3226f8b04d72f66fabb3c2a21d596b8a1cc38"
                }
            ]
        },
        story2: {
            characterName: "Vovó Sônia e Pedrinho",
            themes: ["Tarde de brincadeiras e amor entre avó e neto"],
            pageCount: 6,
            coverUrl: "https://ideogram.ai/api/images/ephemeral/KJYwdOmmUZe98re-xAQnWQ.png?exp=1781585005&sig=eefa85cbdfc071442714bc103879436bfee6aa361b698f8ef176e659f499487c",
            paragraphs: [
                {
                    text: "O sol da tarde entrava pela janela da casa da Vovó Sônia, pintando o tapete da sala com listras douradas. Pedrinho, com seus olhos cheios de brilho, acabava de chegar. \"Vovó Sônia!\", ele exclamou, correndo para abraçar sua avó, que já o esperava com um sorriso caloroso e um abraço apertado. Vovó Sônia, com seus cabelos branquinhos e seu avental florido, sabia que aquela seria mais uma tarde repleta de magia.",
                    imageUrl: "https://ideogram.ai/api/images/ephemeral/5ux-WgF2XWOxXqodUShnLA.png?exp=1781585001&sig=af37933cbebe4bdd30629e778ca917409e6b62cdc19da19c1ca7971bf70152df"
                },
                {
                    text: "\"O que vamos fazer hoje, vovó?\", perguntou Pedrinho, ansioso. Vovó Sônia piscou. \"Hoje, meu pequeno explorador, vamos viajar sem sair do lugar!\" Ela pegou um lençol antigo e, juntos, construíram uma cabana aconchegante no meio da sala, transformando-a em uma nave espacial com almofadas de planetas e um cobertor estrelado. Pedrinho ria enquanto eles fingiam voar entre cometas coloridos e luas sorridentes.",
                    imageUrl: "https://ideogram.ai/api/images/ephemeral/Hr0p1CM2VGiuNWvm4PtD-w.png?exp=1781585003&sig=435458dea330def899f026cb61af3eef4cbcb6b7c0625f29134b54b72d7d4700"
                },
                {
                    text: "Dentro da \"nave\", Vovó Sônia tirou de um baú mágico um livro de histórias que brilhava suavemente. \"Este não é um livro comum, Pedrinho\", ela sussurrou. \"Cada palavra que lemos, vira um brinquedo de verdade!\" Eles começaram a ler sobre um dragão amigável, e de repente, um pequeno dragão de pelúcia, com olhos verdes cintilantes, apareceu no colo de Pedrinho, acenando sua cauda.",
                    imageUrl: "https://ideogram.ai/api/images/ephemeral/KN1n8CCtXpmOTmXXRXauhw.png?exp=1781585001&sig=06476f1919ed08d225043e8a435498024c5eae1093c66459ea6da719382e9f6f"
                },
                {
                    text: "Em seguida, leram sobre um jardim encantado, e a sala se encheu de bolhas de sabão que pareciam flores flutuantes, girando e dançando ao redor deles. Pedrinho tentava pegá-las com as mãos, e cada bolha estourada liberava um cheirinho doce de jasmim e camomila, deixando o ambiente ainda mais acolhedor e mágico. Vovó Sônia sorria, feliz com a imaginação do neto.",
                    imageUrl: "https://ideogram.ai/api/images/ephemeral/44mvlnlOWIqA8yYWokcEyw.png?exp=1781585003&sig=d54a78af8d64f441372f2123ac3fdbae34ade2de91a88cf00c69ca189d0306d3"
                },
                {
                    text: "Quando as bolhas desapareceram, Vovó Sônia e Pedrinho se aninharam, o dragão de pelúcia entre eles. Vovó Sônia alisou os cabelos de Pedrinho. \"Você sabe, meu amor, a maior magia de todas é o tempo que passamos juntos.\" Pedrinho olhou para ela com carinho. \"Sim, vovó. É a melhor magia do mundo!\" O abraço deles era tão quente quanto o sol que se punha lá fora.",
                    imageUrl: "https://ideogram.ai/api/images/ephemeral/hEaF30EqUzWGer4KnypERw.png?exp=1781585001&sig=d6d9614c6c4c20a80bb38cb78613fbf1e47ca33f283faced1f3873c95ab1b59b"
                },
                {
                    text: "Com o anoitecer se aproximando e as estrelas começando a aparecer na janela, era hora de Pedrinho ir. Ele deu um último abraço apertado em sua Vovó Sônia, o coração cheio de alegria e a mente repleta de aventuras fantásticas. \"Até a próxima, vovó! Mal posso esperar pela nossa próxima viagem mágica!\" Vovó Sônia acenou, seu amor por Pedrinho brilhando mais forte que qualquer estrela, sabendo que cada tarde juntos era um tesouro.",
                    imageUrl: "https://ideogram.ai/api/images/ephemeral/Bz4-JYelX-Ce4Yk_NF1L0g.png?exp=1781585000&sig=ce1dc29281dd42331de57c8e76f3136c1af8b4aa9352658d8f01d86c4cc3da72"
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
            <div style="text-align: center; margin-top: 40px; margin-bottom: 10px;">
                <button class="btn-generate btn-bottom" style="background-color: var(--color-purple); display: inline-block; width: auto; padding: 16px 40px;" onclick="scrollToFormAndClose()">✨ Criar a sua história agora! ✨</button>
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

        // Create a temporary element to hold the print-friendly pages
        const tempContainer = document.createElement('div');
        tempContainer.style.width = '210mm'; // Width of A4 in portrait
        tempContainer.style.background = '#FFFFFF';
        tempContainer.style.color = '#3D281A';
        tempContainer.style.fontFamily = 'sans-serif';

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
        
        const rawCharName = document.getElementById('characterName').value.trim() || 'Crianca';
        const cleanCharName = capitalizeFirstLetter(rawCharName);
        
        coverPage.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 10mm 0;">
                <div>
                    <h1 style="font-size: 30px; color: #7B4FA6; margin-bottom: 5px; font-family: 'Fredoka', sans-serif; text-align: center;">O Livro Mágico de ${cleanCharName}</h1>
                    <p style="font-size: 16px; color: #5C4033; font-weight: bold; text-align: center; margin: 0;">Uma história criada especialmente para ${cleanCharName}</p>
                </div>
                <div style="width: 140mm; height: 140mm; border: 4px solid #3D281A; border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #fafbfc; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                    <img src="${generatedCoverUrl}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 15px; font-weight: bold; color: #7B4FA6;">KidCanvas</div>
                    <div style="font-size: 12px; color: #5C4033;">www.kidcanvas.com.br</div>
                </div>
            </div>
        `;
        tempContainer.appendChild(coverPage);

        // 2. Inner Pages
        generatedParagraphs.forEach((page, idx) => {
            const pageDiv = document.createElement('div');
            pageDiv.style.width = '210mm';
            pageDiv.style.height = '297mm';
            pageDiv.style.pageBreakAfter = (idx === generatedParagraphs.length - 1) ? 'avoid' : 'always';
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

        // Generate PDF
        const cleanCharNameLower = cleanCharName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const opt = {
            margin: 0,
            filename: `livro-${cleanCharNameLower}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const btnPDF = document.getElementById('btnDownloadPDF');
        const oldText = btnPDF.textContent;
        btnPDF.textContent = "⏳ Gerando PDF...";
        btnPDF.disabled = true;

        html2pdf().from(tempContainer).set(opt).save().then(() => {
            btnPDF.textContent = oldText;
            btnPDF.disabled = false;
        }).catch(err => {
            console.error("Erro ao gerar PDF:", err);
            btnPDF.textContent = oldText;
            btnPDF.disabled = false;
            alert("Erro ao exportar PDF. Tente novamente.");
        });
    }


// === HISTORIAS MAGICAS WINDOW BINDINGS ===
window.openViewer = openViewer;
window.closeViewer = closeViewer;
window.scrollToFormAndClose = scrollToFormAndClose;
window.printSinglePage = printSinglePage;
window.downloadImage = downloadImage;
window.generatePDF = generatePDF;
window.resetForm = resetForm;
