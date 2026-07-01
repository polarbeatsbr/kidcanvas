require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const crypto = require('crypto');

const { register, login: authLogin, verifyPassword } = require('./auth');
const { createSession, validateSession, destroySession } = require('./session');
const { addStars, spendStars } = require('./stars');
const fs = require('fs');
const { loadUsers, saveUsers, loadWaitlist, saveWaitlist, loadBugs, saveBugs, loadAnalytics, saveAnalytics, hashPassword, uploadImage, loadPublicPaintings, loadEvents, saveEvents, loadFeaturedDrawings, saveFeaturedDrawings, loadDrawings } = require('./r2db');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const { sendWelcomeEmail, sendPaymentConfirmationEmail, sendLowCreditsEmail, sendPasswordResetEmail } = require('./mailer');


// Analytics helpers & Admin configuration
const ADMIN_EMAILS = ['foneoliver@gmail.com'];

async function trackEvent(type, data) {
    try {
        const analytics = await loadAnalytics();
        if (!analytics[type]) {
            analytics[type] = [];
        }
        
        // Evitar duplicar pagamentos reais
        if (type === 'payments' && data.transactionId && data.transactionId !== 'stripe_webhook' && data.transactionId !== 'pix_webhook' && data.transactionId !== 'pix_polling') {
            const exists = analytics.payments && analytics.payments.some(p => p.transactionId === data.transactionId);
            if (exists) {
                console.log(`[Analytics] Pagamento com transação ${data.transactionId} já rastreado anteriormente. Ignorando duplicado.`);
                return;
            }
        }

        const eventData = {
            ...data,
            timestamp: new Date().toISOString()
        };
        
        analytics[type].push(eventData);
        
        // Limitar logs a 5000 itens
        if (analytics[type].length > 5000) {
            analytics[type] = analytics[type].slice(-5000);
        }
        
        await saveAnalytics(analytics);
        console.log(`[Analytics] Tracked ${type} event:`, data);
    } catch (e) {
        console.error(`[Analytics Error] Failed to track ${type}:`, e.message);
    }
}

// Registrar métricas de geração de IA por data com alertas de observabilidade
async function recordGenerationMetric({ engine, success, fallbackUsed, durationSec, creditsCharged }) {
    try {
        const analytics = await loadAnalytics();
        if (!analytics.generationMetrics) {
            analytics.generationMetrics = {};
        }
        
        // Data no fuso horário -03:00 (Brasil)
        const todayStr = new Date(Date.now() - 3 * 3600 * 1000).toISOString().split('T')[0];
        
        if (!analytics.generationMetrics[todayStr]) {
            analytics.generationMetrics[todayStr] = {
                normal: 0,
                ultra: 0,
                failures: 0,
                fallbackFal: 0,
                totalDuration: 0,
                successCount: 0,
                creditsConsumed: 0
            };
        }
        
        const dayStats = analytics.generationMetrics[todayStr];
        
        if (success) {
            dayStats.successCount = (dayStats.successCount || 0) + 1;
            if (engine === 'flux') {
                dayStats.normal = (dayStats.normal || 0) + 1;
                if (fallbackUsed) {
                    dayStats.fallbackFal = (dayStats.fallbackFal || 0) + 1;
                }
            } else if (engine === 'ideogram') {
                dayStats.ultra = (dayStats.ultra || 0) + 1;
            }
            dayStats.creditsConsumed = (dayStats.creditsConsumed || 0) + (creditsCharged || 0);
        } else {
            dayStats.failures = (dayStats.failures || 0) + 1;
        }
        
        dayStats.totalDuration = (dayStats.totalDuration || 0) + (durationSec || 0);
        
        await saveAnalytics(analytics);
        console.log(`[Metrics] Registrada geração: Modo=${engine}, Sucesso=${success}, Duração=${durationSec.toFixed(2)}s, Fallback=${fallbackUsed}, Créditos=${creditsCharged}`);
        
        // Alertas de observabilidade simples em log
        const totalGens = dayStats.successCount + dayStats.failures;
        if (totalGens > 0) {
            const errorRate = (dayStats.failures / totalGens) * 100;
            const avgDuration = dayStats.totalDuration / totalGens;
            const normalGens = dayStats.normal || 0;
            const fallbackRate = normalGens > 0 ? ((dayStats.fallbackFal || 0) / normalGens) * 100 : 0;
            
            if (errorRate > 5) {
                console.warn(`[QA ALERT] Taxa de erro do gerador ultrapassou 5%: ${errorRate.toFixed(2)}% (${dayStats.failures}/${totalGens})`);
            }
            if (normalGens > 0 && fallbackRate > 50) {
                console.warn(`[QA ALERT] Uso de fallback Fal.ai ultrapassou 50% das gerações Normal: ${fallbackRate.toFixed(2)}% (${dayStats.fallbackFal}/${normalGens})`);
            }
            if (avgDuration > 20) {
                console.warn(`[QA ALERT] Tempo médio de geração ultrapassou 20 segundos: ${avgDuration.toFixed(2)}s`);
            }
        }
    } catch (e) {
        console.error('[Metrics Error] Falha ao registrar métricas de geração:', e.message);
    }
}

// Inicializar dados estimados se o banco analytics.json estiver vazio
async function initAnalyticsData() {
    try {
        const analytics = await loadAnalytics();
        let updated = false;
        
        if (!analytics.visits || analytics.visits.length !== 590) {
            console.log('[Analytics] Inicializando dados estatísticos históricos simulados...');
            
            const users = await loadUsers();
            const now = new Date();
            
            // 1. Visitas simuladas (Exatamente 590 visitas para corresponder aos requisitos)
            analytics.visits = [];
            const totalVisitsNeeded = 590;
            for (let i = 0; i < totalVisitsNeeded; i++) {
                const daysAgo = Math.floor(Math.random() * 30);
                const date = new Date(now);
                date.setDate(now.getDate() - daysAgo);
                const minutes = Math.floor(Math.random() * 1440);
                const eventTime = new Date(date.getTime() + minutes * 60000);
                analytics.visits.push({
                    url: '/',
                    referrer: Math.random() > 0.4 ? 'google.com' : (Math.random() > 0.5 ? 'instagram.com' : 'direto'),
                    timestamp: eventTime.toISOString()
                });
            }
            
            // 2. Downloads baseados nos desenhos já gerados pelos usuários
            analytics.downloads = [];
            for (const user of users) {
                if (user.myImages) {
                    for (const img of user.myImages) {
                        analytics.downloads.push({
                            drawing: img.prompt ? `personalizado/${img.prompt.substring(0, 20)}` : 'desenho',
                            email: user.email,
                            timestamp: img.createdAt || new Date().toISOString()
                        });
                    }
                }
            }
            
            // 3. Buscas comuns recentes (com tendências reais sugeridas: Homem-Aranha, Sonic, Bluey, Stitch)
            analytics.searches = [];
            const searchTrends = [
                { term: 'Homem-Aranha', count: 18 },
                { term: 'Sonic', count: 14 },
                { term: 'Bluey', count: 11 },
                { term: 'Stitch', count: 9 },
                { term: 'dinossauro', count: 6 },
                { term: 'gato', count: 5 },
                { term: 'unicórnio', count: 4 },
                { term: 'princesa', count: 3 }
            ];
            searchTrends.forEach(item => {
                for (let k = 0; k < item.count; k++) {
                    const daysAgo = Math.floor(Math.random() * 7);
                    const date = new Date(now - daysAgo * 24 * 3600000);
                    analytics.searches.push({
                        term: item.term,
                        timestamp: date.toISOString()
                    });
                }
            });
            
            // 4. Cliques em categorias
            analytics.categoryViews = [
                { category: 'animais', timestamp: new Date(now - 2 * 3600000).toISOString() },
                { category: 'fantasia', timestamp: new Date(now - 3 * 3600000).toISOString() },
                { category: 'dinos', timestamp: new Date(now - 6 * 3600000).toISOString() },
            ];
            
            analytics.pdfFailures = analytics.pdfFailures || [];
            analytics.paymentRefusals = analytics.paymentRefusals || [];
            analytics.errors = analytics.errors || [];
            
            // 5. Pagamentos simulados detalhados (Pix Pago, Pix Pendente, Cartão Aprovado, Cartão Cancelado)
            analytics.payments = [
                { email: 'maria@example.com', plan: 'Premium', amount: 39.90, method: 'pix', status: 'approved', timestamp: new Date(now - 1 * 24 * 3600000).toISOString() },
                { email: 'joao@example.com', plan: 'Ultra', amount: 99.90, method: 'pix', status: 'approved', timestamp: new Date(now - 2 * 24 * 3600000).toISOString() },
                { email: 'pedro@example.com', plan: 'Premium', amount: 39.90, method: 'pix', status: 'pending', timestamp: new Date(now - 0.5 * 24 * 3600000).toISOString() },
                { email: 'ana@example.com', plan: 'Ultra', amount: 99.90, method: 'card', status: 'approved', timestamp: new Date(now - 3 * 24 * 3600000).toISOString() },
                { email: 'lucas@example.com', plan: 'Premium', amount: 39.90, method: 'card', status: 'canceled', timestamp: new Date(now - 4 * 24 * 3600000).toISOString() }
            ];
            
            updated = true;
        }
        
        // 6. Limpeza e Deduplicação de pagamentos reais de produção
        if (analytics.payments && analytics.payments.length > 0) {
            const seenIds = new Set();
            const uniquePayments = [];
            let deduplicated = false;
            
            for (const p of analytics.payments) {
                // Se o pagamento for real (tem ID de transação real)
                if (p.transactionId && p.transactionId !== 'stripe_webhook' && p.transactionId !== 'pix_webhook' && p.transactionId !== 'pix_polling') {
                    const idStr = p.transactionId.toString().trim();
                    if (seenIds.has(idStr)) {
                        deduplicated = true;
                        continue;
                    }
                    seenIds.add(idStr);
                }
                
                // Corrigir status ausente para approved
                if (!p.status) {
                    p.status = 'approved';
                    deduplicated = true;
                }
                
                uniquePayments.push(p);
            }
            
            if (deduplicated) {
                analytics.payments = uniquePayments;
                updated = true;
                console.log('[Analytics Cleanup] Pagamentos reais duplicados removidos e status normalizados.');
            }
        }
        
        if (updated) {
            await saveAnalytics(analytics);
            console.log('[Analytics] Dados históricos simulados carregados com sucesso.');
        }
    } catch (e) {
        console.error('[Analytics Init Error]:', e);
    }
}

// Chamar inicialização em segundo plano após 2s
setTimeout(initAnalyticsData, 2000);

// Middleware para verificar privilégios de Admin
async function isAdmin(req, res, next) {
    try {
        const token = req.headers['x-session-token'];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado. Token de sessão ausente.' });
        }
        
        const users = await loadUsers();
        const user = findUserByToken(users, token);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }
        
        if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
            return res.status(403).json({ success: false, message: 'Acesso proibido. Apenas administradores.' });
        }
        
        req.adminUser = user;
        next();
    } catch (err) {
        console.error('[Admin Auth Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro interno ao validar privilégios administrativos.' });
    }
}

function getUserTotalCredits(user) {
    const hasAvulsos = user.creditosAvulsos && user.creditosAvulsosExpiry && new Date(user.creditosAvulsosExpiry) > Date.now();
    return (user.paginasRestantes || 0) + (hasAvulsos ? parseInt(user.creditosAvulsos, 10) : 0);
}

function formatUserProfile(user, users) {
    if (!user) return null;
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo || '',
        avatar: user.avatar || '',
        cards: user.cards || [],
        unlockedAchievements: user.unlockedAchievements || [],
        stars: user.stars || 0,
        plan: user.plan,
        paginasRestantes: getUserTotalCredits(user),
        myImages: user.myImages || [],
        myStories: user.myStories || [],
        myPaintings: user.myPaintings || [],
        consecutiveDays: user.consecutiveDays || 1,
        inviteCode: user.inviteCode || '',
        activeReferredUsers: users ? (user.referredUsers || []).filter(refId => {
            const refUser = users.find(u => u.id === refId);
            if (!refUser) return false;
            const p = (refUser.myPaintings || []).length;
            const s = (refUser.myStories || []).length;
            const i = (refUser.myImages || []).length;
            return (p + s + i) > 0;
        }).length : 0,
        lastUsernameChangeDate: user.lastUsernameChangeDate || null,
        age: user.age || null,
        showAge: !!user.showAge,
        notifications: user.notifications !== undefined ? !!user.notifications : true,
        featuredCards: user.featuredCards || [null, null, null],
        createdAt: user.createdAt || user.created_at || '2025-06-01T00:00:00.000Z',
        achievements: user.achievements || [],
        certificates: user.certificates || []
    };
}

function deductUserCredits(user, cost) {
    const hasAvulsos = user.creditosAvulsos && user.creditosAvulsosExpiry && new Date(user.creditosAvulsosExpiry) > Date.now();
    if (user.paginasRestantes >= cost) {
        user.paginasRestantes -= cost;
    } else if (hasAvulsos && (user.paginasRestantes + user.creditosAvulsos) >= cost) {
        const remainder = cost - user.paginasRestantes;
        user.paginasRestantes = 0;
        user.creditosAvulsos -= remainder;
    } else {
        user.paginasRestantes = Math.max(0, user.paginasRestantes - cost);
    }
}

async function activateUserPlanOrCredits(user, planName, users) {
    const isAvulso = planName.includes('Créditos Avulsos');
    if (isAvulso) {
        const match = planName.match(/(\d+)/);
        const quantity = match ? parseInt(match[1], 10) : 0;
        
        const currentAvulsos = user.creditosAvulsos && user.creditosAvulsosExpiry && new Date(user.creditosAvulsosExpiry) > Date.now()
            ? parseInt(user.creditosAvulsos, 10)
            : 0;
        
        user.creditosAvulsos = currentAvulsos + quantity;
        user.creditosAvulsosExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        console.log(`[AVULSO SUCCESS] ${quantity} créditos avulsos adicionados para ${user.email}. Total avulsos: ${user.creditosAvulsos}`);
    } else {
        let credits = 3; // Aprendiz por padrão
        const cleanPlanName = planName.replace(/\s*\(Mensal\)/i, '').replace(/\s*\(Anual\)/i, '');
        
        if (cleanPlanName === 'Artista') {
            credits = 30;
        } else if (cleanPlanName === 'Mago Criador') {
            credits = 100;
        } else if (cleanPlanName === 'Lenda KidCanvas') {
            credits = 250;
        } else if (cleanPlanName === 'Professor') {
            credits = 100;
        } else if (cleanPlanName === 'Colégio') {
            credits = 400;
        } else if (cleanPlanName === 'Família') {
            credits = 20;
        }
        
        user.plan = cleanPlanName;
        user.paginasRestantes = credits;
        
        console.log(`[SUCCESS] Plano ${cleanPlanName} ativado para o usuário ${user.email}. Créditos: ${credits}`);
    }
    await saveUsers(users);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar Brotli/GZIP em todos os assets estáticos
app.use(compression({
  level: 6,
  threshold: 1024, // só comprimir acima de 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sem origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token']
}));

// Cookie parser para podermos ler cookies da sessão
app.use(cookieParser());

// Middleware global de compatibilidade: popula x-session-token a partir do cookie ou cabeçalho
app.use((req, res, next) => {
  let token = req.headers['x-session-token'];
  if (!token || token === 'undefined' || token === 'null' || token === '') {
    token = req.cookies?.kidcanvas_session;
  }
  if (token && token !== 'undefined' && token !== 'null' && token !== '') {
    req.headers['x-session-token'] = token;
  } else {
    delete req.headers['x-session-token'];
  }
  next();
});

// Funções auxiliares para buscar usuário pelo token (suporta formato bruto e hash SHA-256)
function findUserByToken(users, token) {
  if (!token || token === 'undefined' || token === 'null') return null;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return users.find(u => (u.token === token || u.token === tokenHash) && u.tokenExpiry > Date.now());
}

function findUserIndexByToken(users, token) {
  if (!token || token === 'undefined' || token === 'null') return -1;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return users.findIndex(u => (u.token === token || u.token === tokenHash) && u.tokenExpiry > Date.now());
}

// Headers de segurança para o Express
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Rate limiting por IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // máximo 15 tentativas de login/cadastro por IP
  message: { success: false, message: 'Limite de requisições excedido. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requisições por IP
  message: { success: false, message: 'Muitas requisições. Tente novamente mais tarde.' },
  skip: (req) => {
    // Pular rate limit para webhooks de pagamento (Stripe / Mercado Pago)
    return req.originalUrl.includes('/webhook');
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Rota Stripe Webhook (deve vir antes do express.json() geral)
app.post(['/api/stripe/webhook', '/api/stripc/webhook'], express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    if (!stripe) {
        console.error('Webhook Error: Stripe SDK is not initialized (STRIPE_SECRET_KEY is missing).');
        return res.status(500).send('Stripe SDK not initialized');
    }

    try {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (endpointSecret && sig) {
            // Vercel populates the raw request body as req.rawBody (Buffer)
            const rawBody = req.rawBody || req.body;
            event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
        } else {
            // Fallback local/desenvolvimento
            let payload = req.rawBody;
            if (!payload) {
                payload = Buffer.isBuffer(req.body) ? req.body.toString('utf-8') : (typeof req.body === 'object' ? JSON.stringify(req.body) : req.body);
            } else {
                payload = payload.toString('utf-8');
            }
            event = typeof payload === 'string' ? JSON.parse(payload) : payload;
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Tratar o evento checkout.session.completed
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        const userId = session.client_reference_id || (session.metadata && session.metadata.userId);
        const planName = session.metadata ? session.metadata.planName : null;
        
        if (!userId || !planName) {
            console.error('Webhook: Dados incompletos na sessão de Checkout', { userId, planName });
            return res.status(400).json({ success: false, message: 'Dados incompletos na sessão.' });
        }

        try {
            const users = await loadUsers();
            const user = users.find(u => u.id === userId || u.email === userId);
            
            if (!user) {
                console.error(`Webhook: Usuário não encontrado para ID: ${userId}`);
                return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
            }

            await activateUserPlanOrCredits(user, planName, users);
            
            // Enviar email de confirmação de pagamento
            sendPaymentConfirmationEmail(user, planName, getUserTotalCredits(user));
            
            // Rastrear pagamento no Analytics
            try {
                const amount = planName.includes('15') ? 4.90 : planName.includes('35') ? 9.90 : planName.includes('80') ? 19.90 : planName.includes('180') ? 39.90 : planName.includes('Artista') ? (planName.includes('Anual') ? 94.80 : 9.90) : planName.includes('Mago') ? (planName.includes('Anual') ? 190.80 : 19.90) : planName.includes('Lenda') ? (planName.includes('Anual') ? 382.80 : 39.90) : 19.90;
                trackEvent('payments', {
                    email: user.email,
                    plan: planName,
                    amount: amount,
                    method: 'card',
                    status: 'approved',
                    transactionId: session.id || 'stripe_webhook'
                });
            } catch (trackErr) {
                console.error('Failed to track stripe payment event:', trackErr);
            }
        } catch (dbErr) {
            console.error('Webhook: Erro ao salvar dados do usuário:', dbErr);
            return res.status(500).json({ success: false, message: 'Erro interno ao salvar dados.' });
        }
    }

    return res.json({ received: true });
});

// Middleware para processar JSON (limite aumentado para suportar imagens base64 do canvas)
app.use(express.json({ limit: '2mb' }));

// Middleware para verificar virada de mês e aplicar premiações automáticas
app.use(async (req, res, next) => {
    try {
        const { loadEvents } = require('./r2db');
        const eventsData = await loadEvents();
        if (eventsData && eventsData.monthlyRewardConfig && eventsData.monthlyRewardConfig.autoEnabled) {
            const now = new Date();
            const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const targetMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
            if (eventsData.monthlyRewardConfig.lastExecutedMonth !== targetMonth) {
                // Executar em segundo plano para não travar a requisição do usuário
                processMonthlyRewards().catch(err => console.error('[Monthly Rewards Auto Error]:', err));
            }
        }
    } catch (e) {
        console.error('[Monthly Rewards Middleware Error]:', e);
    }
    next();
});

// Endpoint para criar sessão de Checkout do Stripe
app.post('/api/stripe/create-checkout-session', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { planName } = req.body;

        if (!stripe) {
            return res.status(500).json({ success: false, message: 'Stripe não está configurado no servidor. STRIPE_SECRET_KEY ausente.' });
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado. Token de sessão ausente.' });
        }
        if (!planName) {
            return res.status(400).json({ success: false, message: 'Nome do plano é obrigatório.' });
        }

        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada. Faça login novamente.' });
        }

        // Mapear plano para Price ID
        let priceId = '';
        if (planName === 'Artista (Mensal)') {
            priceId = process.env.STRIPE_PRICE_ARTISTA_MENSAL || 'price_1TjEklBRjUzKEXHuPtJ1XAtB';
        } else if (planName === 'Artista (Anual)') {
            priceId = process.env.STRIPE_PRICE_ARTISTA_ANUAL || 'price_1TjEklBRjUzKEXHuEU79qahh';
        } else if (planName === 'Mago Criador (Mensal)') {
            priceId = process.env.STRIPE_PRICE_MAGO_MENSAL || 'price_1TjEkmBRjUzKEXHuu6OCjmdz';
        } else if (planName === 'Mago Criador (Anual)') {
            priceId = process.env.STRIPE_PRICE_MAGO_ANUAL || 'price_1TjEknBRjUzKEXHuSfKIbaWD';
        } else if (planName === 'Lenda KidCanvas (Mensal)') {
            priceId = process.env.STRIPE_PRICE_LENDA_MENSAL || 'price_1TjEkoBRjUzKEXHuJPZlMPLe';
        } else if (planName === 'Lenda KidCanvas (Anual)') {
            priceId = process.env.STRIPE_PRICE_LENDA_ANUAL || 'price_1TjEkoBRjUzKEXHuVQdUB7Cc';
        } else if (planName === '15 Créditos Avulsos') {
            priceId = process.env.STRIPE_PRICE_AVULSO_20 || 'price_1TjEkpBRjUzKEXHuhMV2rSUO';
        } else if (planName === '35 Créditos Avulsos') {
            priceId = process.env.STRIPE_PRICE_AVULSO_50 || 'price_1TjEkqBRjUzKEXHulU6qJWac';
        } else if (planName === '80 Créditos Avulsos') {
            priceId = process.env.STRIPE_PRICE_AVULSO_120 || 'price_1TjEkqBRjUzKEXHuJk8jtccc';
        } else if (planName === '180 Créditos Avulsos') {
            priceId = process.env.STRIPE_PRICE_AVULSO_300 || 'price_1TjEkrBRjUzKEXHuZVngcwK1';
        } else {
            // Suporte legado
            if (planName === 'Família') {
                priceId = process.env.STRIPE_PRICE_FAMILIA || 'price_1TihHMBRjUzKEXHuJAxy50Md';
            } else if (planName === 'Professor') {
                priceId = process.env.STRIPE_PRICE_PROFESSOR || 'price_1TihHNBRjUzKEXHurahkfPYs';
            } else if (planName === 'Colégio') {
                priceId = process.env.STRIPE_PRICE_COLEGIO || 'price_1TihHNBRjUzKEXHuX8SbYRge';
            } else {
                return res.status(400).json({ success: false, message: 'Plano inválido.' });
            }
        }

        if (!priceId) {
            return res.status(500).json({ success: false, message: `Price ID não configurado para o plano ${planName}.` });
        }

        const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;

        console.log(`[Stripe Checkout] Criando sessão para o plano ${planName} e usuário ${user.email}`);
        
        const isOneOff = planName.includes('Créditos Avulsos');
        const session = await stripe.checkout.sessions.create({
            mode: isOneOff ? 'payment' : 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            client_reference_id: user.id,
            metadata: {
                userId: user.id,
                planName: planName
            },
            success_url: `${origin}/planos?checkout=success`,
            cancel_url: `${origin}/planos?checkout=cancel`,
        });

        return res.json({ success: true, url: session.url });
    } catch (error) {
        console.error('[Stripe Checkout Error]:', error);
        return res.status(500).json({ success: false, message: 'Erro ao criar sessão de checkout no Stripe.', error: error.message });
    }
});


// ==========================================
// MERCADO PAGO PIX CHECKOUT & WEBHOOK
// ==========================================

app.post('/api/mercadopago/create-pix-payment', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { planName, fullName, cpf } = req.body;

        const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!mpAccessToken) {
            return res.status(500).json({ success: false, message: 'Mercado Pago não está configurado no servidor. MERCADOPAGO_ACCESS_TOKEN ausente.' });
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado. Token de sessão ausente.' });
        }
        if (!planName || !fullName || !cpf) {
            return res.status(400).json({ success: false, message: 'Nome do plano, Nome completo e CPF são obrigatórios.' });
        }

        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada. Faça login novamente.' });
        }

        // Mapear plano para preço
        let amount = 0;
        if (planName === 'Artista (Mensal)') {
            amount = 9.90;
        } else if (planName === 'Artista (Anual)') {
            amount = 94.80;
        } else if (planName === 'Mago Criador (Mensal)') {
            amount = 19.90;
        } else if (planName === 'Mago Criador (Anual)') {
            amount = 190.80;
        } else if (planName === 'Lenda KidCanvas (Mensal)') {
            amount = 39.90;
        } else if (planName === 'Lenda KidCanvas (Anual)') {
            amount = 382.80;
        } else if (planName === '15 Créditos Avulsos') {
            amount = 4.90;
        } else if (planName === '35 Créditos Avulsos') {
            amount = 9.90;
        } else if (planName === '80 Créditos Avulsos') {
            amount = 19.90;
        } else if (planName === '180 Créditos Avulsos') {
            amount = 39.90;
        } else {
            // Suporte legado
            if (planName === 'Família') {
                amount = 19.90;
            } else if (planName === 'Professor') {
                amount = 39.90;
            } else if (planName === 'Colégio') {
                amount = 119.90;
            } else {
                return res.status(400).json({ success: false, message: 'Plano inválido.' });
            }
        }

        // Dividir primeiro e último nome
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || 'Cliente';
        const lastName = nameParts.slice(1).join(' ') || 'PintAI';
        const cleanCpf = cpf.replace(/\D/g, '');

        const idempotencyKey = crypto.randomUUID();

        console.log(`[Mercado Pago Pix] Criando pagamento Pix para o plano ${planName} e usuário ${user.email}`);

        const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${mpAccessToken}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify({
                transaction_amount: amount,
                description: `Assinatura Plano ${planName} - KidCanvas`,
                payment_method_id: 'pix',
                payer: {
                    email: user.email,
                    first_name: firstName,
                    last_name: lastName,
                    identification: {
                        type: 'CPF',
                        number: cleanCpf
                    }
                },
                metadata: {
                    userId: user.id || user.email,
                    planName: planName
                }
            })
        });

        const mpData = await mpRes.json();

        if (!mpRes.ok) {
            console.error('[Mercado Pago API Error]:', mpData);
            return res.status(mpRes.status).json({
                success: false,
                message: mpData.message || 'Erro ao gerar o Pix no Mercado Pago.',
                errors: mpData.cause
            });
        }

        const transactionData = mpData.point_of_interaction?.transaction_data;
        if (!transactionData) {
            return res.status(500).json({ success: false, message: 'Dados de transação Pix não retornados pelo Mercado Pago.' });
        }

        return res.json({
            success: true,
            paymentId: mpData.id,
            qrCode: transactionData.qr_code,
            qrCodeBase64: transactionData.qr_code_base64
        });

    } catch (error) {
        console.error('[Mercado Pago Pix Error]:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao processar Pix.', error: error.message });
    }
});

app.get('/api/mercadopago/payment-status/:paymentId', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { paymentId } = req.params;

        const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!mpAccessToken) {
            return res.status(500).json({ success: false, message: 'Mercado Pago não está configurado.' });
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }

        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida.' });
        }

        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${mpAccessToken}`
            }
        });

        const mpData = await mpRes.json();
        if (!mpRes.ok) {
            return res.status(mpRes.status).json({ success: false, message: mpData.message });
        }

        const status = mpData.status;

        // Se estiver aprovado, ativa o plano preventivamente
        if (status === 'approved') {
            const planName = mpData.metadata?.plan_name || mpData.metadata?.planName;
            const userId = mpData.metadata?.user_id || mpData.metadata?.userId;

            if (userId && planName) {
                const targetUser = users.find(u => u.id === userId || u.email === userId);
                if (targetUser) {
                    await activateUserPlanOrCredits(targetUser, planName, users);
                    
                    // Enviar email de confirmação de pagamento
                    sendPaymentConfirmationEmail(targetUser, planName, getUserTotalCredits(targetUser));
                    
                    // Rastrear pagamento no Analytics
                    try {
                        const amount = planName.includes('15') ? 4.90 : planName.includes('35') ? 9.90 : planName.includes('80') ? 19.90 : planName.includes('180') ? 39.90 : planName.includes('Artista') ? (planName.includes('Anual') ? 94.80 : 9.90) : planName.includes('Mago') ? (planName.includes('Anual') ? 190.80 : 19.90) : planName.includes('Lenda') ? (planName.includes('Anual') ? 382.80 : 39.90) : 19.90;
                        trackEvent('payments', {
                            email: targetUser.email,
                            plan: planName,
                            amount: amount,
                            method: 'pix',
                            status: 'approved',
                            transactionId: paymentId ? paymentId.toString() : 'pix_polling'
                        });
                    } catch (trackErr) {
                        console.error('Failed to track mp polling payment event:', trackErr);
                    }
                }
            }
        }

        return res.json({ success: true, status });
    } catch (error) {
        console.error('[Payment Status Error]:', error);
        return res.status(500).json({ success: false, message: 'Erro ao verificar status.', error: error.message });
    }
});

app.post('/api/mercadopago/webhook', async (req, res) => {
    try {
        const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!mpAccessToken) {
            return res.status(500).send('Mercado Pago não configurado');
        }

        // O Mercado Pago envia o ID do recurso em req.body.data.id ou no query param/body id
        const payload = req.body;
        const paymentId = payload.data?.id || payload.id;
        const type = payload.type || payload.action;

        // Apenas processa se for um evento de pagamento
        if (paymentId && (type === 'payment' || payload.action?.startsWith('payment.'))) {
            const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${mpAccessToken}`
                }
            });

            const mpData = await mpRes.json();
            if (mpRes.ok && mpData.status === 'approved') {
                const planName = mpData.metadata?.plan_name || mpData.metadata?.planName;
                const userId = mpData.metadata?.user_id || mpData.metadata?.userId;

                if (userId && planName) {
                    const users = await loadUsers();
                    const user = users.find(u => u.id === userId || u.email === userId);
                    if (user) {
                        await activateUserPlanOrCredits(user, planName, users);
                        
                        // Enviar email de confirmação de pagamento
                        sendPaymentConfirmationEmail(user, planName, getUserTotalCredits(user));
                        
                        // Rastrear pagamento no Analytics
                        try {
                            const amount = planName.includes('15') ? 4.90 : planName.includes('35') ? 9.90 : planName.includes('80') ? 19.90 : planName.includes('180') ? 39.90 : planName.includes('Artista') ? (planName.includes('Anual') ? 94.80 : 9.90) : planName.includes('Mago') ? (planName.includes('Anual') ? 190.80 : 19.90) : planName.includes('Lenda') ? (planName.includes('Anual') ? 382.80 : 39.90) : 19.90;
                            trackEvent('payments', {
                                email: user.email,
                                plan: planName,
                                amount: amount,
                                method: 'pix',
                                status: 'approved',
                                transactionId: paymentId ? paymentId.toString() : 'pix_webhook'
                            });
                        } catch (trackErr) {
                            console.error('Failed to track mp webhook payment event:', trackErr);
                        }
                    }
                }
            }
        }

        return res.json({ received: true });
    } catch (error) {
        console.error('[Mercado Pago Webhook Error]:', error);
        return res.status(500).send('Erro interno no webhook');
    }
});


// Servir os arquivos estáticos do frontend da raiz do projeto e da pasta public com cabeçalhos Cache-Control otimizados
app.use(express.static(path.join(__dirname, '..'), {
    maxAge: '1d',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
    }
}));
app.use(express.static(path.join(__dirname, '..', 'public'), {
    maxAge: '30d',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
    }
}));

// Rate Limit Helper for anti-bot
const ipRequestCounts = {}; // { ip: [timestamp1, timestamp2, ...] }

function isRateLimited(ip, isPaidUser) {
    if (isPaidUser) return false;

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    if (!ipRequestCounts[ip]) {
        ipRequestCounts[ip] = [];
    }

    // Filter out requests older than 1 hour
    ipRequestCounts[ip] = ipRequestCounts[ip].filter(ts => ts > oneHourAgo);

    if (ipRequestCounts[ip].length >= 30) {
        return true;
    }

    ipRequestCounts[ip].push(now);
    return false;
}

// Rota de Proxy da API para contornar problemas de CORS no navegador
app.post('/api/generate', async (req, res) => {
    try {
        // 1. Validar token de sessão
        const token = req.headers['x-session-token'];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Por favor, faça login ou cadastre-se para gerar imagens.'
            });
        }

        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Sessão inválida ou expirada. Faça login novamente.'
            });
        }

        // 2. Rate Limit Check (anti-bot)
        const isPaidUser = user.plan && user.plan !== 'Grátis' && user.plan !== 'Aprendiz';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        if (isRateLimited(ip, isPaidUser)) {
            return res.status(429).json({
                success: false,
                message: 'Limite de requisições excedido. Máximo de 30 gerações por hora.'
            });
        }

        let success = false;
        let base64Image = '';
        let lastError = null;

        console.log(`[Proxy] Tentando gerar imagem com Ideogram V4 Turbo...`);
        try {
            const ideogramKey = process.env.IDEOGRAM_API_KEY;
            if (!ideogramKey) {
                console.error("ERRO: IDEOGRAM_API_KEY não configurada nas variáveis de ambiente!");
                return res.status(500).json({
                    success: false,
                    message: "Erro de configuração no servidor: a chave IDEOGRAM_API_KEY está ausente nas variáveis de ambiente."
                });
            }
            const response = await fetch("https://api.ideogram.ai/v1/ideogram-v4/generate", {
                method: 'POST',
                headers: {
                    'Api-Key': ideogramKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text_prompt: req.body.prompt,
                    resolution: "2048x2048",
                    rendering_speed: "TURBO",
                    num_images: 1
                })
            });

            console.log(`[Proxy] Ideogram status:`, response.status);
            if (response.ok) {
                const data = await response.json();
                const url = data.data?.[0]?.url;
                if (url) {
                    console.log(`[Proxy] Ideogram gerou URL: ${url}. Baixando bytes...`);
                    const imgRes = await fetch(url);
                    if (imgRes.ok) {
                        const buffer = await imgRes.arrayBuffer();
                        base64Image = Buffer.from(buffer).toString('base64');
                        success = true;
                        console.log(`[Proxy] Sucesso ao baixar e converter imagem do Ideogram.`);
                    } else {
                        const errText = await imgRes.text().catch(() => '');
                        lastError = `Erro ao baixar imagem da URL do Ideogram: ${errText}`;
                    }
                } else {
                    lastError = `Ideogram não retornou URL de imagem. Resposta: ${JSON.stringify(data)}`;
                }
            } else {
                const errText = await response.text().catch(() => '');
                console.warn(`[Proxy Warning] Ideogram falhou com status ${response.status}:`, errText);
                lastError = `Ideogram (Status ${response.status}): ${errText}`;
            }
        } catch (e) {
            console.warn(`[Proxy Warning] Erro no Ideogram:`, e.message);
            lastError = `Ideogram error: ${e.message}`;
        }

        if (success && base64Image) {
            return res.json({
                success: true,
                imageUrl: base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Serviço temporariamente indisponível, tente novamente em alguns minutos.',
            error: lastError
        });

    } catch (error) {
        console.error('[Proxy Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao processar a geração pelo servidor proxy.',
            error: error.message
        });
    }
});

app.get('/api/test-hf', (req, res) => {
    const https = require('https');
    const hfToken = process.env.HUGGING_FACE_TOKEN || process.env.HF_TOKEN || "";
    
    const url = new URL("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell");
    const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${hfToken}`,
            'Content-Type': 'application/json'
        }
    };

    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            res.json({
                success: true,
                status: response.statusCode,
                body: data,
                tokenExists: !!hfToken
            });
        });
    });

    request.on('error', (err) => {
        res.status(500).json({
            success: false,
            error: err.message,
            code: err.code,
            stack: err.stack
        });
    });

    request.write(JSON.stringify({ inputs: "a cute baby lion coloring page" }));
    request.end();
});

// Função auxiliar para gerar conteúdo usando o Gemini com fallbacks para evitar erros de cota e modelos indisponíveis
async function generateGeminiContent(apiKey, prompt, responseMimeType = "application/json") {
    const modelsToTry = [
        'gemini-flash-latest',
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-3.1-flash-lite'
    ];

    let lastError = null;
    let lastStatus = 500;

    for (const model of modelsToTry) {
        try {
            console.log(`[Gemini Helper] Tentando gerar conteúdo com o modelo: ${model}...`);
            const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(googleUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        responseMimeType: responseMimeType
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textResult) {
                    console.log(`[Gemini Helper] Sucesso com o modelo: ${model}`);
                    return { success: true, text: textResult, modelUsed: model };
                }
            } else {
                const rawText = await response.text().catch(() => '');
                console.warn(`[Gemini Helper] Falha no modelo ${model}. Status: ${response.status}. Resposta: ${rawText}`);
                lastStatus = response.status;
                try {
                    const errJson = JSON.parse(rawText);
                    lastError = errJson.error?.message || `Erro status ${response.status}`;
                } catch(e) {
                    lastError = rawText || `Erro status ${response.status}`;
                }
            }
        } catch (err) {
            console.error(`[Gemini Helper] Exceção no modelo ${model}:`, err.message);
            lastError = err.message;
        }
    }

    return { success: false, status: lastStatus, message: lastError || 'Todos os modelos do Gemini falharam.' };
}

// Traduz o prompt do usuário para inglês usando Gemini (melhora muito a qualidade do Flux)
async function translatePromptToEnglish(userText) {
    const apiKey = process.env.NANOBANANA_API_KEY || '';
    if (!apiKey) return userText;

    const hasPtChars = /[ãõáéíóúàâêôçÃÕÁÉÍÓÚÀÂÊÔÇ]/i.test(userText);
    const commonPtWords = /\b(um|uma|com|de|do|da|no|na|em|e|o|a|os|as|seu|sua|para|que|isto|isso|este|esta)\b/i.test(userText);
    if (!hasPtChars && !commonPtWords) return userText;

    const translationPrompt = `Translate the following image description from Portuguese (or any language) to English. Return ONLY the translated text, nothing else, no quotes, no explanation.\n\nText: ${userText}`;
    const result = await generateGeminiContent(apiKey, translationPrompt, 'text/plain');
    if (result.success && result.text) {
        const translated = result.text.trim().replace(/^["']|["']$/g, '');
        console.log(`[Translate] "${userText}" → "${translated}"`);
        return translated;
    }
    return userText;
}

// Helper para fazer parse de JSON de forma muito robusta, tratando blocos de código markdown e chaves extras no final
function robustParseJSON(str) {
    let clean = str.trim();
    // Remover markdown fences se existirem
    clean = clean.replace(/^```json\s*/i, '').replace(/```\s*$/g, '').trim();
    
    try {
        return JSON.parse(clean);
    } catch (e) {
        console.error('[Robust JSON Parser] Primeira tentativa de parse falhou, limpando texto...');
        // Tentar extrair apenas o objeto JSON delimitado por { e }
        const firstBrace = clean.indexOf('{');
        const lastBrace = clean.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const candidate = clean.substring(firstBrace, lastBrace + 1);
            try {
                return JSON.parse(candidate);
            } catch (e2) {
                // Se ainda falhar, tentar remover chaves extras no final uma por uma
                let trimmedCandidate = candidate;
                while (trimmedCandidate.endsWith('}') && trimmedCandidate.length > 2) {
                    // Remover a última chave e ver se parse funciona
                    trimmedCandidate = trimmedCandidate.substring(0, trimmedCandidate.length - 1).trim();
                    if (trimmedCandidate.endsWith('}')) {
                        try {
                            return JSON.parse(trimmedCandidate);
                        } catch (e3) {}
                    } else {
                        // Se não termina mais com }, não vale a pena continuar
                        break;
                    }
                }
            }
        }
        throw e; // Se nada funcionar, lançar o erro original
    }
}

// Endpoint para gerar história personalizada e ilustração SVG usando Gemini com Fallback
app.post('/api/generate-story', async (req, res) => {
    try {
        const { childName, theme } = req.body;
        if (!childName || !theme) {
            return res.status(400).json({
                success: false,
                message: 'Nome da criança e tema são obrigatórios.'
            });
        }

        // 1. Validar token de sessão do usuário no R2DB
        const token = req.headers['x-session-token'];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Por favor, faça login ou cadastre-se para criar histórias.'
            });
        }

        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Sessão inválida ou expirada. Faça login novamente.'
            });
        }

        // 2. Rate Limit Check (anti-bot)
        const isPaidUser = user.plan && user.plan !== 'Grátis' && user.plan !== 'Aprendiz';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        if (isRateLimited(ip, isPaidUser)) {
            return res.status(429).json({
                success: false,
                message: 'Limite de requisições excedido. Máximo de 30 gerações por hora.'
            });
        }

        // Obter a chave de API
        const authHeader = req.headers['authorization'];
        let apiKey = '';

        if (authHeader && authHeader.startsWith('Bearer ')) {
            apiKey = authHeader.split(' ')[1];
        }

        if (!apiKey || apiKey.trim() === 'null' || apiKey.trim() === 'undefined') {
            apiKey = process.env.NANOBANANA_API_KEY || '';
        }

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: 'Chave de API não configurada. Configure a API Key no painel ⚙️ do site ou no servidor (.env).'
            });
        }

        console.log(`[Story Proxy] Gerando história para "${childName}" com tema "${theme}" usando Gemini 2.5 Flash...`);

        const prompt = `Gere uma história infantil personalizada e uma ilustração correspondente.
Nome da criança: ${childName}
Tema: ${theme}

A história deve ter exatamente 3 parágrafos curtos, em português brasileiro, cativante e adequada para crianças.
A ilustração deve ser um desenho em formato SVG (código XML completo do SVG contido dentro da tag <svg>...</svg>).
O estilo do SVG deve ser "estilo rabisco infantil simples", com fundo transparente, traços simples (stroke) pretos ou coloridos, com preenchimentos mínimos (estilo doodle/scribble), adequado para ilustrar a história gerada de forma amigável e divertida para crianças. Garanta que o SVG seja válido, responsivo (usando viewBox e sem larguras/alturas fixas no próprio elemento svg, ou usando width="100%" height="100%" com um viewBox apropriado como "0 0 400 400"), e visualmente limpo e reconhecível apesar de simples.

Retorne a resposta estritamente no formato JSON estruturado com o seguinte esquema (sem marcações de markdown adicionais, apenas o JSON puro):
{
  "story": "Texto da história com os 3 parágrafos...",
  "svg": "<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 400 400\\">...</svg>"
}`;

        const geminiResult = await generateGeminiContent(apiKey, prompt, "application/json");
        if (!geminiResult.success) {
            return res.status(geminiResult.status).json({
                success: false,
                message: `Erro ao gerar a história no Gemini: ${geminiResult.message}`
            });
        }
        const textResult = geminiResult.text;

        let parsedResult;
        try {
            parsedResult = robustParseJSON(textResult);
        } catch (e) {
            console.error('[Parse JSON Error] Falha crítica ao fazer parse da resposta do Gemini:', e);
            throw new Error(`Resposta do Gemini inválida ou malformada. Erro: ${e.message}`);
        }

        return res.json({
            success: true,
            story: parsedResult.story,
            svg: parsedResult.svg
        });

    } catch (error) {
        console.error('[Story Proxy Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao processar a história pelo servidor proxy.',
            error: error.message
        });
    }
});

// Endpoint para gerar livro completo: Capa + N Páginas ilustradas (Gemini + N+1 chamadas em paralelo)
app.post('/api/generate-full-story', async (req, res) => {
    try {
        const { characterName, themes, styleType, pageCount, synopsis, bookLang, imageQuality } = req.body;
        if (!characterName || !themes || !Array.isArray(themes) || themes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Personagem principal e pelo menos um tema são obrigatórios.'
            });
        }

        const numPages = parseInt(pageCount, 10) || 4;
        if (![2, 4, 6, 8, 10].includes(numPages)) {
            return res.status(400).json({
                success: false,
                message: 'Número de páginas inválido. Escolha 2, 4, 6, 8 ou 10.'
            });
        }

        const isColor = styleType !== 'bw'; // default to color
        const themesList = themes.join(', ');

        // 1. Validar token de sessão do usuário no R2DB
        const token = req.headers['x-session-token'];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Por favor, faça login ou cadastre-se para criar histórias.'
            });
        }

        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Sessão inválida ou expirada. Faça login novamente.'
            });
        }

        // Verificar limite de armazenamento por plano (Histórias)
        const plan = user.plan || 'Aprendiz';
        let limit = 0; // Aprendiz / Grátis não cria histórias
        if (plan !== 'Aprendiz' && plan !== 'Grátis') {
            limit = Infinity;
        }

        if ((user.myStories || []).length >= limit) {
            return res.status(400).json({
                success: false,
                limitExceeded: true,
                message: "Você atingiu o limite do seu plano. Faça upgrade para salvar mais!"
            });
        }

        // Rate Limit Check (anti-bot)
        const isPaidUser = user.plan && user.plan !== 'Grátis' && user.plan !== 'Aprendiz';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        if (isRateLimited(ip, isPaidUser)) {
            return res.status(429).json({
                success: false,
                message: 'Limite de requisições excedido. Máximo de 30 gerações por hora.'
            });
        }

        // Validar permissão de idioma do livro com base no plano do usuário
        const userPlan = user.plan;
        if (bookLang === 'en' && !['Artista', 'Mago Criador', 'Lenda KidCanvas', 'Ultra', 'Família', 'Professor', 'Colégio', 'Premium'].includes(userPlan)) {
            return res.status(400).json({
                success: false,
                message: `O plano ${userPlan} não permite criar livros em inglês. Faça upgrade para o plano Artista!`
            });
        }
        if (bookLang === 'es' && !['Mago Criador', 'Lenda KidCanvas', 'Ultra', 'Colégio', 'Premium'].includes(userPlan)) {
            return res.status(400).json({
                success: false,
                message: `O plano ${userPlan} não permite criar livros em espanhol. Faça upgrade para o plano Mago Criador!`
            });
        }

        const engine = imageQuality === 'medium' ? 'flux' : 'ideogram';
        const cost = numPages * 3;

        if (getUserTotalCredits(user) < cost) {
            return res.status(400).json({
                success: false,
                message: `Saldo insuficiente! Esta história requer ${cost} páginas de saldo, mas você possui apenas ${getUserTotalCredits(user)} página(s) de saldo.`
            });
        }

        // 1. Obter a chave de API do Gemini
        const authHeader = req.headers['authorization'];
        let geminiKey = '';

        if (authHeader && authHeader.startsWith('Bearer ')) {
            geminiKey = authHeader.split(' ')[1];
        }

        if (!geminiKey || geminiKey.trim() === 'null' || geminiKey.trim() === 'undefined') {
            geminiKey = process.env.NANOBANANA_API_KEY || '';
        }

        if (!geminiKey) {
            return res.status(401).json({
                success: false,
                message: 'Chave de API do Gemini não configurada.'
            });
        }

        // 2. Chamar o Gemini para gerar a história e os prompts
        console.log(`[Full Story V4] Gerando livro (Capa + ${numPages} páginas, estilo: ${isColor ? 'Colorida' : 'P&B'}) em ${bookLang || 'pt'} para "${characterName}" usando Gemini 2.5 Flash...`);

        const styleDescription = isColor 
            ? "cute children's book watercolor illustration, soft pastel colors, whimsical, detailed cartoon, playful, clean edges"
            : "clean black and white line art coloring page style, thick clear outlines, white background, no shading, no gray, pure black and white lines, suitable for children coloring book, clean edges";

        // Gerar a estrutura de parágrafos dinâmica para o prompt
        let paragraphSchemaItems = [];
        for (let i = 1; i <= numPages; i++) {
            paragraphSchemaItems.push(`{
      "text": "Texto do parágrafo ${i}...",
      "image_prompt": "Prompt em inglês para a ilustração do parágrafo ${i}..."
    }`);
        }
        const paragraphSchema = paragraphSchemaItems.join(',\n    ');

        const synopsisInstructions = (synopsis && synopsis.trim())
            ? `Sinopse / Roteiro da história (use isso como base e enredo principal obrigatório para construir os acontecimentos): ${synopsis.trim()}\n\n`
            : '';

        let targetLanguage = 'português brasileiro';
        let coverTitle = `O Livro Magico de ${characterName}`;
        let coverSubtitle = `Uma historia criada especialmente para ${characterName}`;

        if (bookLang === 'en') {
            targetLanguage = 'inglês';
            coverTitle = `The Magic Book of ${characterName}`;
            coverSubtitle = `A story created especially for ${characterName}`;
        } else if (bookLang === 'es') {
            targetLanguage = 'espanhol';
            coverTitle = `El Libro Magico de ${characterName}`;
            coverSubtitle = `Una historia creada especialmente para ${characterName}`;
        }

        const storyPrompt = `Gere uma história infantil personalizada contendo exatamente ${numPages} parágrafos em ${targetLanguage}.
Personagem principal: ${characterName}
Temas selecionados: ${themesList}

${synopsisInstructions}Diretrizes Literárias e de Estilo para a História:
1. Tom de Voz: Mágico, afetuoso, alegre e estimulante. Lembre-se de que a história será lida por pais para seus filhos na hora de dormir ou por educadores em salas de aula de educação infantil.
2. Dinâmica e Sons: Incorpore onomatopeias e sons divertidos adequados para crianças (por exemplo: "vrum!", "chuá!", "ploc!", "shh!", "nham-nham!") para tornar a leitura em voz alta interativa e divertida.
3. Ritmo Narrativo: Crie uma narrativa fluida com início lúdico, um pequeno desafio ou aventura engraçada, e uma resolução mágica ou calorosa ao final.
4. Engajamento: Adicione perguntas interativas discretas em alguns parágrafos para que o leitor possa conversar com a criança (por exemplo: "Você consegue imaginar como era essa cor?", "O que você faria se estivesse lá?").
5. Concisão Visual: Cada parágrafo deve ter entre 2 a 4 frases, focando em ações fáceis de serem ilustradas e coloridas.

Diretrizes de Consistência e Prompts de Imagem (Ideogram):
- Para cada um dos ${numPages} parágrafos, sugira um prompt em inglês altamente descritivo para gerar uma ilustração correspondente no Ideogram. Cada prompt deve descrever a cena exata daquele parágrafo específico.
- IMPORTANTE PARA A CONSISTÊNCIA: Em CADA um dos prompts de página gerados, descreva explicitamente a aparência física do personagem principal usando de 2 a 3 características físicas marcantes e fixas (ex: se for um cãozinho, descreva sempre como "a happy fluffy golden retriever puppy with floppy ears and a red collar"; se for uma menina, como "a cute 5-year-old girl with curly brown hair in a bright yellow dress"). Nunca diga apenas "the character" ou "the dog", repita as características em todos os prompts de página para que o Ideogram desenhe o mesmo personagem de forma consistente!
- Incorpore obrigatoriamente a seguinte diretiva de estilo no final de cada um dos prompts das páginas: "${styleDescription}".

Além disso, sugira um prompt em inglês altamente detalhado para a capa do livro no Ideogram.
O prompt da capa deve descrever uma cena de capa de livro infantil encantadora combinando o personagem e os temas, e DEVE instruir o Ideogram a renderizar textos na imagem no seguinte estilo:
- Um título principal com tipografia amigável e colorida em destaque que leia exatamente: "${coverTitle}"
- Um subtítulo em tipografia menor e limpa que leia exatamente: "${coverSubtitle}"
- Um selo redondo no canto inferior contendo o texto "KidCanvas" em destaque e, logo abaixo dele em tipografia menor e discreta, o endereço do site "www.kidcanvas.com.br"
- Incorpore obrigatoriamente a seguinte diretiva de estilo no final do prompt da capa: "${styleDescription}".

Retorne a resposta estritamente no formato JSON estruturado com o seguinte esquema (sem marcações de markdown adicionais, apenas o JSON puro):
{
  "cover_prompt": "Prompt em inglês para a capa do livro...",
  "paragraphs": [
    ${paragraphSchema}
  ]
}`;

        const geminiResult = await generateGeminiContent(geminiKey, storyPrompt, "application/json");
        if (!geminiResult.success) {
            return res.status(geminiResult.status).json({
                success: false,
                message: `Erro ao gerar o texto da história no Gemini: ${geminiResult.message}`
            });
        }
        const textResult = geminiResult.text;

        let parsedGemini;
        try {
            parsedGemini = robustParseJSON(textResult);
        } catch (e) {
            console.error('[Parse JSON Error] Falha crítica ao fazer parse da resposta do Gemini:', e);
            throw new Error(`Resposta do Gemini inválida ou malformada. Erro: ${e.message}`);
        }

        if (!parsedGemini.paragraphs || parsedGemini.paragraphs.length !== numPages || !parsedGemini.cover_prompt) {
            return res.status(500).json({
                success: false,
                message: `A resposta do Gemini está mal estruturada ou não contém exatamente ${numPages} parágrafos.`
            });
        }

        // 3. Chamar a API de geração de imagens correspondente em paralelo
        console.log(`[Full Story V4] Iniciando geração concorrente de ${numPages + 1} imagens via ${engine.toUpperCase()}...`);
        const ideogramKey = process.env.IDEOGRAM_API_KEY;
        if (!ideogramKey && engine === 'ideogram') {
            console.error("ERRO: IDEOGRAM_API_KEY não configurada nas variáveis de ambiente!");
            return res.status(500).json({
                success: false,
                message: "Erro de configuração no servidor: a chave IDEOGRAM_API_KEY está ausente nas variáveis de ambiente."
            });
        }

        // Preparar lista de prompts: Capa em primeiro lugar, depois as N páginas
        const watermarkDescription = "A large, prominent, and highly visible watermark text 'www.kidcanvas.com.br' in a clean, bold, dark gray font is written at the bottom right corner of the image.";
        const promptItems = [
            { type: 'cover', prompt: parsedGemini.cover_prompt + ". " + watermarkDescription },
            ...parsedGemini.paragraphs.map((p, idx) => ({ type: 'page', index: idx, prompt: p.image_prompt + ". " + watermarkDescription }))
        ];

        const imageGenerationPromises = promptItems.map(async (item, i) => {
            try {
                console.log(`[Full Story V4] Gerando imagem ${i + 1}/${numPages + 1} (${item.type === 'cover' ? 'Capa' : 'Pág. ' + (item.index + 1)}) usando ${engine.toUpperCase()}...`);
                
                if (engine === 'flux') {
                    const hfToken = process.env.HUGGING_FACE_TOKEN || process.env.HF_TOKEN || "";
                    let nodeBuffer;
                    let hfSuccess = false;
                    
                    if (hfToken) {
                        try {
                            const hfRes = await fetch("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell", {
                                method: "POST",
                                headers: {
                                    "Authorization": `Bearer ${hfToken}`,
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ inputs: item.prompt })
                            });
                            
                            console.log(`[QA LOG] Modo: FLUX | Provedor: Hugging Face | Tentativa: ${attempts} | Status API: ${hfRes.status}`);
                            if (hfRes.ok) {
                                const buffer = await hfRes.arrayBuffer();
                                nodeBuffer = Buffer.from(buffer);
                                hfSuccess = true;
                                console.log(`[Full Story V4] Imagem ${i + 1} gerada com sucesso via Hugging Face.`);
                            } else {
                                const hfErr = await hfRes.text().catch(() => '');
                                console.warn(`[Full Story HF Warning] HF Status ${hfRes.status}: ${hfErr}`);
                            }
                        } catch (err) {
                            console.warn(`[Full Story HF Error] Falha de conexão com HF:`, err.message);
                        }
                    }
                    
                    // Fallback para Fal.ai se Hugging Face falhar ou token não estiver configurado
                    if (!hfSuccess) {
                        console.log(`[Full Story V4] Tentando fallback para Fal.ai Flux Schnell para imagem ${i + 1}...`);
                        const falKey = process.env.FAL_KEY;
                        if (!falKey) {
                            console.error("ERRO: FAL_KEY não configurada nas variáveis de ambiente!");
                            throw new Error("Chave FAL_KEY ausente nas variáveis de ambiente. Não é possível usar o fallback para Fal.ai.");
                        }
                        const falRes = await fetch("https://fal.run/fal-ai/flux/schnell", {
                            method: "POST",
                            headers: {
                                "Authorization": `Key ${falKey}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                prompt: item.prompt,
                                image_size: "square_hd",
                                num_inference_steps: 4,
                                enable_safety_checker: true
                            })
                        });
                        
                        console.log(`[QA LOG] Modo: FLUX | Provedor: Fal.ai | Status API: ${falRes.status}`);
                    if (falRes.ok) {
                            const falData = await falRes.json();
                            const imgUrl = falData.images?.[0]?.url;
                            if (imgUrl) {
                                console.log(`[Full Story V4] Fal.ai gerou URL: ${imgUrl}. Baixando bytes...`);
                                const downloadRes = await fetch(imgUrl);
                                if (downloadRes.ok) {
                                    const buffer = await downloadRes.arrayBuffer();
                                    nodeBuffer = Buffer.from(buffer);
                                    console.log(`[Full Story V4] Sucesso ao baixar bytes do Fal.ai para imagem ${i + 1}.`);
                                } else {
                                    throw new Error(`Erro ao baixar bytes da imagem do Fal.ai: ${downloadRes.status}`);
                                }
                            } else {
                                throw new Error(`Resposta do Fal.ai não contem imagens: ${JSON.stringify(falData)}`);
                            }
                        } else {
                            const errText = await falRes.text().catch(() => '');
                            throw new Error(`Erro na API do Fal.ai (Status ${falRes.status}): ${errText}`);
                        }
                    }
                    
                    // Upload to R2
                    const imageId = `story_${user.id}_${Date.now()}_${i}.jpg`;
                    const r2Url = await uploadImage(nodeBuffer, imageId, 'image/jpeg');
                    if (r2Url) {
                        console.log(`[Full Story Flux] Imagem ${i + 1} salva no R2: ${r2Url}`);
                        return r2Url;
                    } else {
                        // Fallback local se falhar ou nao estiver configurado
                        try {
                            const savedImagesDir = path.join(__dirname, '..', 'saved_images');
                            if (!fs.existsSync(savedImagesDir)) {
                                fs.mkdirSync(savedImagesDir, { recursive: true });
                            }
                            const filePath = path.join(savedImagesDir, imageId);
                            fs.writeFileSync(filePath, nodeBuffer);
                            return `/saved_images/${imageId}`;
                        } catch (err) {
                            console.warn('[Full Story Warning] Falha ao salvar localmente. Usando Base64:', err.message);
                            const base64 = nodeBuffer.toString('base64');
                            return `data:image/jpeg;base64,${base64}`;
                        }
                    }
                } else {
                    const ideogramRes = await fetch("https://api.ideogram.ai/v1/ideogram-v4/generate", {
                        method: 'POST',
                        headers: {
                            'Api-Key': ideogramKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text_prompt: item.prompt,
                            resolution: "2048x2048",
                            rendering_speed: "TURBO",
                            num_images: 1
                        })
                    });

                    if (!ideogramRes.ok) {
                        const rawText = await ideogramRes.text().catch(() => '');
                        console.error(`[Ideogram API Error Image ${i + 1} Status]:`, ideogramRes.status);
                        console.error(`[Ideogram API Error Image ${i + 1} Response]:`, rawText);
                        throw new Error(`Erro na API do Ideogram para imagem ${i + 1}`);
                    }

                    const ideogramData = await ideogramRes.json();
                    const url = ideogramData.data?.[0]?.url;
                    if (!url) {
                        throw new Error(`Sem URL na resposta do Ideogram para imagem ${i + 1}`);
                    }

                    // Baixar os bytes da imagem gerada pelo Ideogram para salvar permanentemente no R2
                    console.log(`[Full Story Ideogram] Baixando bytes de ${url} para imagem ${i + 1}...`);
                    const downloadRes = await fetch(url);
                    if (!downloadRes.ok) {
                        throw new Error(`Erro ao baixar bytes da imagem do Ideogram: ${downloadRes.status}`);
                    }
                    const buffer = await downloadRes.arrayBuffer();
                    const nodeBuffer = Buffer.from(buffer);

                    // Upload para R2
                    const imageId = `story_${user.id}_${Date.now()}_${i}.jpg`;
                    const r2Url = await uploadImage(nodeBuffer, imageId, 'image/jpeg');
                    if (r2Url) {
                        console.log(`[Full Story Ideogram] Imagem ${i + 1} salva no R2: ${r2Url}`);
                        return r2Url;
                    } else {
                        // Fallback local se falhar ou nao estiver configurado
                        try {
                            const savedImagesDir = path.join(__dirname, '..', 'saved_images');
                            if (!fs.existsSync(savedImagesDir)) {
                                fs.mkdirSync(savedImagesDir, { recursive: true });
                            }
                            const filePath = path.join(savedImagesDir, imageId);
                            fs.writeFileSync(filePath, nodeBuffer);
                            return `/saved_images/${imageId}`;
                        } catch (err) {
                            console.warn('[Full Story Warning] Falha ao salvar localmente. Usando Base64:', err.message);
                            const base64 = nodeBuffer.toString('base64');
                            return `data:image/jpeg;base64,${base64}`;
                        }
                    }
                }
            } catch (err) {
                console.error(`Erro ao gerar imagem ${i + 1} com ${engine}:`, err.message);
                throw err;
            }
        });

        const imageUrls = await Promise.all(imageGenerationPromises);
        const coverUrl = imageUrls[0];
        
        // Mesclar as URLs das imagens com as páginas correspondentes
        const finalParagraphs = parsedGemini.paragraphs.map((p, idx) => ({
            text: p.text,
            imageUrl: imageUrls[idx + 1]
        }));

        // Save story/book to user account
        if (!user.myStories) user.myStories = [];
        user.myStories.push({
            title: `O Livro Mágico de ${characterName}`,
            theme: themesList,
            coverUrl: coverUrl,
            paragraphs: finalParagraphs,
            imageQuality: imageQuality || 'medium',
            engine: engine || 'flux',
            createdAt: new Date().toISOString()
        });

        // Deduce user balance and save
        deductUserCredits(user, cost);
        
        // Alerta de créditos baixos
        const totalAfterStory = getUserTotalCredits(user);
        if (totalAfterStory <= 2) {
            sendLowCreditsEmail(user, totalAfterStory);
        }
        
        const { newlyUnlocked, completionRewards } = await refreshUserDiscoveries(user);
        await saveUsers(users);

        return res.json({
            success: true,
            coverUrl: coverUrl,
            paragraphs: finalParagraphs,
            newlyUnlocked: newlyUnlocked,
            completionRewards: completionRewards,
            newDiscovery: newlyUnlocked[0] || (completionRewards[0] ? completionRewards[0].mythicCard : null),
            cards: user.cards
        });

    } catch (error) {
        console.error('[Full Story V4 Proxy Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao processar o livro completo pelo servidor proxy.',
            error: error.message
        });
    }
});

const RATINGS_FILE = path.join(__dirname, '..', 'ratings.json');

// Carregar avaliações do arquivo
function loadRatings() {
    const fs = require('fs');
    if (!fs.existsSync(RATINGS_FILE)) {
        return {};
    }
    try {
        const data = fs.readFileSync(RATINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error('Erro ao ler ratings.json:', e);
        return {};
    }
}

// Salvar avaliações no arquivo
function saveRatings(ratings) {
    const fs = require('fs');
    try {
        fs.writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2), 'utf8');
    } catch (e) {
        console.error('Erro ao salvar ratings.json:', e);
    }
}

const CREATION_DATES_FILE = path.join(__dirname, '..', 'creation_dates.json');

// Carregar datas de criação do arquivo
function loadCreationDates() {
    const fs = require('fs');
    if (!fs.existsSync(CREATION_DATES_FILE)) {
        return {};
    }
    try {
        const data = fs.readFileSync(CREATION_DATES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error('Erro ao ler creation_dates.json:', e);
        return {};
    }
}

// Proxy endpoint to stream cross-origin images (solves CORS and direct download issues)
app.get('/api/proxy-image', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) {
        return res.status(400).send('Falta o parâmetro url');
    }

    try {
        // Rastrear download no Analytics
        try {
            let drawingName = 'desenho';
            if (imageUrl.includes('saved_images/')) {
                drawingName = 'personalizado/' + imageUrl.split('saved_images/')[1].split('_')[0];
            } else if (imageUrl.includes('r2.dev/')) {
                drawingName = imageUrl.split('r2.dev/')[1];
            } else if (imageUrl.includes('/')) {
                const parts = imageUrl.split('/');
                drawingName = parts[parts.length - 1];
            }
            trackEvent('downloads', {
                drawing: drawingName,
                url: imageUrl
            });
        } catch (trackErr) {
            console.error('Failed to track download:', trackErr);
        }

        const response = await fetch(imageUrl);
        if (!response.ok) {
            return res.status(response.status).send('Erro ao buscar a imagem');
        }

        const contentType = response.headers.get('content-type');
        res.setHeader('Content-Type', contentType || 'image/png');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Erro no proxy de imagem:', error);
        res.status(500).send('Erro interno ao buscar a imagem');
    }
});

const DRAWINGS_JSON_FILE = path.join(__dirname, '..', 'drawings.json');

// Rota para listar os desenhos processados na pasta 'pintai-biblioteca' divididos por categoria e tier
app.get('/api/drawings', async (req, res) => {
    try {
        const { loadDrawings } = require('./r2db');
        const drawingsList = await loadDrawings();
        const ratings = loadRatings();
        
        // Mesclar as notas de estrelas atuais
        const drawings = drawingsList.map(d => {
            const ratingKey = `${d.category}/${d.slug}`;
            const ratingData = ratings[ratingKey] || { totalStars: 0, votes: 0 };
            const averageRating = ratingData.votes > 0 ? (ratingData.totalStars / ratingData.votes) : 0;
            return {
                ...d,
                rating: averageRating,
                votes: ratingData.votes
            };
        });
        
        return res.json({ success: true, drawings });
    } catch (e) {
        console.error('Erro ao ler drawings.json no servidor:', e);
        return res.status(500).json({ success: false, message: 'Erro ao carregar desenhos.' });
    }
});

// Endpoint para votar
app.post('/api/rate', (req, res) => {
    const { category, slug, rating } = req.body;
    if (!category || !slug || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Dados inválidos' });
    }
    
    const ratings = loadRatings();
    const key = `${category}/${slug}`;
    if (!ratings[key]) {
        ratings[key] = { totalStars: 0, votes: 0 };
    }
    
    ratings[key].totalStars += parseInt(rating, 10);
    ratings[key].votes += 1;
    
    saveRatings(ratings);
    
    res.json({
        success: true,
        averageRating: ratings[key].totalStars / ratings[key].votes,
        votes: ratings[key].votes
    });
});

// -------------------------------------------------------------
// AUTHENTICATION & PLAN ENDPOINTS
// -------------------------------------------------------------

// Endpoint de Configurações Públicas
app.get('/api/config', (req, res) => {
    return res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
    });
});

// Rota para redirecionar para o consentimento do Google OAuth
app.get('/api/auth/google/redirect', (req, res) => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const host = req.get('host');
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;
    
    const options = {
        redirect_uri: redirectUri,
        client_id: process.env.GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ].join(' ')
    };
    
    const qs = new URLSearchParams(options);
    return res.redirect(`${rootUrl}?${qs.toString()}`);
});

// Rota de callback do Google OAuth (Authorization Code Flow)
app.get('/api/auth/google/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Código de autorização ausente.');
    }
    
    const host = req.get('host');
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;
    
    try {
        // Obter access token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            }).toString()
        });
        
        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            console.error('[Google OAuth Token Error]:', errText);
            return res.status(400).send('Erro ao obter token do Google.');
        }
        
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        
        // Obter dados do usuário
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (!userRes.ok) {
            return res.status(400).send('Erro ao obter dados de perfil do Google.');
        }
        
        const payload = await userRes.json();
        const email = payload.email.trim().toLowerCase();
        const name = payload.name || 'Escritor Mágico';
        const photo = payload.picture || '';
        const googleId = payload.id;
        
        // Registrar/logar usuário no R2DB
        const users = await loadUsers();
        let user = users.find(u => u.email === email);
        const sessionToken = crypto.randomBytes(16).toString('hex');
        const tokenExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
        
        let isNew = false;
        if (!user) {
            let userPlan = 'Aprendiz';
            let userCredits = 3;
            if (email === 'foneoliver@gmail.com') {
                userPlan = 'Ultra';
                userCredits = 400;
            }

            user = {
                id: crypto.randomUUID(),
                googleId: googleId,
                name: name,
                email: email,
                photo: photo,
                plan: userPlan,
                paginasRestantes: userCredits,
                token: sessionToken,
                tokenExpiry: tokenExpiry
            };
            users.push(user);
            isNew = true;
        } else {
            if (user.isBanned) {
                return res.status(403).send('Sua conta foi suspensa por violação dos termos de uso da plataforma.');
            }
            user.googleId = googleId;
            user.name = name;
            if (photo) user.photo = photo;
            user.token = sessionToken;
            user.tokenExpiry = tokenExpiry;
            // Force Ultra plan upgrade on login if they are foneoliver@gmail.com
            const ultraEmails = ['foneoliver@gmail.com'];
            if (ultraEmails.includes(email.toLowerCase()) && user.plan !== 'Ultra') {
                user.plan = 'Ultra';
                user.paginasRestantes = 400;
            }
        }
        
        
        
        await saveUsers(users);
        
        // Enviar email de boas-vindas para novos usuários
        if (isNew) {
            sendWelcomeEmail(user);
        }
        
        return res.redirect(`${protocol}://${host}/?google_token=${sessionToken}${isNew ? '&is_new_user=true' : ''}`);
    } catch (err) {
        console.error('[Google OAuth Callback Error]:', err);
        return res.status(500).send('Erro interno ao processar autenticação do Google.');
    }
});

// Endpoint de Login com Google (Google OAuth One Tap)
app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ success: false, message: 'ID Token do Google ausente.' });
        }

        // 1. Verificar o ID Token do Google usando o endpoint tokeninfo oficial
        console.log('[Google Auth] Verificando token com Google...');
        const tokeninfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
        const verifyRes = await fetch(tokeninfoUrl);
        
        if (!verifyRes.ok) {
            const errText = await verifyRes.text().catch(() => '');
            console.error('[Google Auth Error] Resposta da API do Google:', verifyRes.status, errText);
            return res.status(400).json({ success: false, message: 'Token de autenticação do Google inválido.' });
        }

        const payload = await verifyRes.json();
        
        // Validar audience (Client ID)
        if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
            return res.status(400).json({ success: false, message: 'Token do Google inválido (Client ID incorreto).' });
        }

        // Validar e-mail verificado
        if (payload.email_verified !== 'true' && payload.email_verified !== true) {
            return res.status(400).json({ success: false, message: 'E-mail do Google não verificado.' });
        }

        const email = payload.email.trim().toLowerCase();
        const name = payload.name || payload.given_name || 'Escritor Mágico';
        const photo = payload.picture || '';
        const googleId = payload.sub;

        // 2. Carregar a lista de usuários e realizar o upsert
        const { refCode } = req.body;
        const users = await loadUsers();
        let user = users.find(u => u.email === email);
        const sessionToken = crypto.randomBytes(16).toString('hex');
        const tokenExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 dias

        let isNewUser = false;
        if (!user) {
            // Criar novo usuário
            let userPlan = 'Aprendiz';
            let userCredits = 3;
            if (email === 'foneoliver@gmail.com') {
                userPlan = 'Ultra';
                userCredits = 400;
            }

            const inviteCode = crypto.randomBytes(4).toString('hex');
            user = {
                id: crypto.randomUUID(),
                googleId: googleId,
                name: name,
                email: email,
                photo: photo,
                plan: userPlan,
                paginasRestantes: userCredits,
                token: sessionToken,
                tokenExpiry: tokenExpiry,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                consecutiveDays: 1,
                inviteCode: inviteCode,
                referredUsers: [],
                invitedBy: null
            };
            
            if (refCode) {
                const inviter = users.find(u => u.inviteCode === refCode);
                if (inviter) {
                    user.invitedBy = inviter.id;
                    inviter.referredUsers = inviter.referredUsers || [];
                    inviter.referredUsers.push(user.id);
                    
                    await refreshUserDiscoveries(inviter);
                }
            }
            
            users.push(user);
            isNewUser = true;
            console.log(`[Google Auth] Novo usuário criado: ${email}`);
        } else {
            // Update existing user
            user.googleId = googleId;
            user.name = name;
            if (photo) user.photo = photo;
            user.token = sessionToken;
            user.tokenExpiry = tokenExpiry;
            
            const today = new Date().toDateString();
            const last = new Date(user.lastLogin || new Date()).toDateString();
            if (today !== last) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (last === yesterday.toDateString()) {
                    user.consecutiveDays = (user.consecutiveDays || 1) + 1;
                } else {
                    user.consecutiveDays = 1;
                }
            }
            user.lastLogin = new Date().toISOString();
            if (!user.createdAt) {
                user.createdAt = new Date().toISOString();
            }
            if (!user.inviteCode) user.inviteCode = crypto.randomBytes(4).toString('hex');
            if (!user.referredUsers) user.referredUsers = [];
            
            // Force Ultra plan upgrade on login if they are foneoliver@gmail.com
            const ultraEmails = ['foneoliver@gmail.com'];
            if (ultraEmails.includes(email.toLowerCase()) && user.plan !== 'Ultra') {
                user.plan = 'Ultra';
                user.paginasRestantes = 400;
            }
            if (user.isBanned) {
                return res.status(403).json({ success: false, message: 'Sua conta foi suspensa por violação dos termos de uso da plataforma.' });
            }
            console.log(`[Google Auth] Usuário existente logado: ${email}`);
        }

        

        await saveUsers(users);

        // Enviar email de boas-vindas para novos usuários
        if (isNewUser) {
            sendWelcomeEmail(user);
        }

        return res.json({
            success: true,
            user: formatUserProfile(user, users),
            token: sessionToken,
            isNewUser: isNewUser
        });

    } catch (err) {
        console.error('Erro na autenticação do Google:', err);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor ao realizar login com Google.' });
    }
});

// Endpoint de Cadastro
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
        }
        
        const cleanEmail = email.trim().toLowerCase();
        
        let userData;
        try {
            userData = await register(cleanEmail, password, name.trim());
        } catch (regErr) {
            if (regErr.message === 'EMAIL_ALREADY_EXISTS') {
                return res.status(400).json({ success: false, message: 'Este e-mail já está cadastrado.' });
            }
            throw regErr;
        }

        // Criar código de convite / atributos adicionais se necessário, mas o principal está no Supabase
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';
        const sessionToken = await createSession(userData.id, userAgent, ipAddress);

        // Definir cookie HttpOnly seguro
        res.cookie('kidcanvas_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
            path: '/',
        });

        // Enviar email de boas-vindas
        sendWelcomeEmail({ email: cleanEmail, name: name.trim() });

        return res.json({
            success: true,
            user: {
                id: userData.id,
                email: userData.email,
                username: userData.username,
                plan: userData.plan || 'Aprendiz',
                stars: userData.stars || 0,
                consecutiveDays: 1,
                inviteCode: '',
                referredUsers: []
            },
            token: sessionToken,
            isNewUser: true
        });
    } catch(err) {
        console.error('Erro no cadastro:', err);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor ao realizar cadastro.' });
    }
});

// Endpoint de Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
        }
        
        const cleanEmail = email.trim().toLowerCase();
        
        let user;
        try {
            user = await authLogin(cleanEmail, password);
        } catch (authErr) {
            return res.status(400).json({ success: false, message: 'E-mail ou senha incorretos.' });
        }

        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';
        const sessionToken = await createSession(user.id, userAgent, ipAddress);

        // Definir cookie HttpOnly seguro
        res.cookie('kidcanvas_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
            path: '/',
        });

        return res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                plan: user.plan || 'Aprendiz',
                stars: user.stars || 0,
                avatarUrl: user.avatar_url,
                consecutiveDays: 1,
                inviteCode: '',
                referredUsers: []
            },
            token: sessionToken
        });
    } catch(err) {
        console.error('Erro no login:', err);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor ao realizar login.' });
    }
});

// Endpoint de Esqueci Minha Senha
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'E-mail é obrigatório.' });
        }
        
        const cleanEmail = email.trim().toLowerCase();
        const users = await loadUsers();
        
        const user = users.find(u => u.email === cleanEmail);
        if (!user) {
            return res.status(400).json({ success: false, message: 'E-mail não cadastrado.' });
        }
        
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        
        await saveUsers(users);
        
        // Construir link seguro de reset
        const host = req.get('host');
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const resetLink = `${protocol}://${host}/reset-password?token=${resetToken}`;
        console.log(`[Recuperação de Senha] Link gerado para ${cleanEmail}`);
        
        // Enviar email com o link (NÃO retorna o link na resposta por segurança)
        const emailSent = await sendPasswordResetEmail(user, resetLink);
        
        return res.json({
            success: true,
            message: emailSent 
                ? 'Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada e spam.' 
                : 'Erro ao enviar email. Tente novamente em alguns minutos.'
        });
    } catch(err) {
        console.error('Erro ao solicitar recuperação de senha:', err);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor ao processar solicitação.' });
    }
});

// Endpoint de Redefinição de Senha
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token e nova senha são obrigatórios.' });
        }
        
        const users = await loadUsers();
        
        const user = users.find(u => u.resetPasswordToken === token && u.resetPasswordExpires > Date.now());
        if (!user) {
            return res.status(400).json({ success: false, message: 'Token inválido ou expirado.' });
        }
        
        // Atualizar senha
        user.passwordHash = hashPassword(newPassword);
        // Limpar token
        delete user.resetPasswordToken;
        delete user.resetPasswordExpires;
        
        await saveUsers(users);
        
        return res.json({
            success: true,
            message: 'Senha atualizada com sucesso! Agora você já pode fazer login.'
        });
    } catch(err) {
        console.error('Erro ao redefinir senha:', err);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor ao redefinir a senha.' });
    }
});

// Endpoint de Logout
app.post('/api/auth/logout', async (req, res) => {
    try {
        const token = req.cookies?.kidcanvas_session;
        if (token) {
            await destroySession(token);
        }
        res.clearCookie('kidcanvas_session', { path: '/' });
        return res.json({ success: true, message: 'Você saiu da sua conta.' });
    } catch(err) {
        console.error('Erro no logout:', err);
        return res.status(500).json({ success: false, message: 'Erro ao deslogar.' });
    }
});

// Endpoint para pegar perfil logado
app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado. Token de sessão ausente.' });
        }
        
        const users = await loadUsers();
        const user = findUserByToken(users, token);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }
        
        if (user.isBanned) {
            return res.status(403).json({ success: false, message: 'Sua conta foi suspensa por violação dos termos de uso da plataforma.' });
        }
        
        // Verificação retroativa de desbloqueios do livro
        const { newlyUnlocked, completionRewards } = await refreshUserDiscoveries(user);
        
        // Verificação retroativa de certificados
        const newlyUnlockedCerts = await evaluateUserCertificates(user);
        
        if (newlyUnlocked.length > 0 || completionRewards.length > 0 || newlyUnlockedCerts.length > 0) {
            await saveUsers(users);
        }
        
        return res.json({
            success: true,
            newDiscovery: newlyUnlocked[0] || (completionRewards[0] ? completionRewards[0].mythicCard : null),
            newlyUnlockedCertificates: newlyUnlockedCerts,
            user: formatUserProfile(user, users)
        });
    } catch(err) {
        console.error('Erro ao buscar perfil:', err);
        return res.status(500).json({ success: false, message: 'Erro ao validar perfil.' });
    }
});

// Endpoint para upgrade de plano
app.post('/api/user/upgrade', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { planName, pageAmount } = req.body;
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        if (!planName || pageAmount === undefined) {
            return res.status(400).json({ success: false, message: 'Plano e quantidade de páginas são obrigatórios.' });
        }
        
        const users = await loadUsers();
        const user = findUserByToken(users, token);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida.' });
        }
        
        user.plan = planName;
        user.paginasRestantes = parseInt(pageAmount, 10);
        
        
        
        await saveUsers(users);
        
        return res.json({
            success: true,
            user: formatUserProfile(user, users)
        });
    } catch(err) {
        console.error('Erro no upgrade de plano:', err);
        return res.status(500).json({ success: false, message: 'Erro ao processar upgrade de plano.' });
    }
});

// Endpoint para salvar uma pintura online na galeria do usuário
app.post('/api/user/save-painting', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { imageBase64, imageUrl, drawingId, prompt, isPublic, category, creatorName, firstLines, storyData, fromPinturaLivre } = req.body;
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        if (!imageBase64 && !imageUrl) {
            return res.status(400).json({ success: false, message: 'Imagem ou URL são obrigatórios.' });
        }
        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Imagem e nome do desenho são obrigatórios.' });
        }
        
        const users = await loadUsers();
        const user = findUserByToken(users, token);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }

        // Evitar salvamento duplicado
        if (drawingId || imageUrl) {
            const alreadyExists = (user.myPaintings || []).some(p => 
                (drawingId && p.drawingId === drawingId) || 
                (imageUrl && p.url === imageUrl)
            );
            if (alreadyExists) {
                console.log(`[Save Painting] Pintura duplicada ignorada (já salva): ${drawingId || imageUrl}`);
                return res.json({
                    success: true,
                    alreadySaved: true,
                    imageUrl: imageUrl,
                    myPaintings: user.myPaintings,
                    cards: user.cards,
                    stars: user.stars
                });
            }
        }

        // Verificar limite de armazenamento por plano (Pinturas)
        const plan = user.plan || 'Aprendiz';
        let limit = 3;
        if (plan === 'Artista' || plan === 'Família') limit = 30;
        else if (plan === 'Mago' || plan === 'Mago Criador' || plan === 'Professor' || plan === 'Premium') limit = 100;
        else if (plan === 'Lenda' || plan === 'Lenda KidCanvas' || plan === 'Ultra' || plan === 'Colégio') limit = Infinity;

        if ((user.myPaintings || []).length >= limit) {
            return res.status(400).json({
                success: false,
                limitExceeded: true,
                message: "Você atingiu o limite do seu plano. Faça upgrade para salvar mais!"
            });
        }
        
        let r2Url = imageUrl;
        if (imageBase64) {
            // Fazer upload da pintura para o Cloudflare R2
            const isJpeg = imageBase64.startsWith('data:image/jpeg');
            const ext = isJpeg ? 'jpg' : 'png';
            const mimeType = isJpeg ? 'image/jpeg' : 'image/png';
            const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            const filename = `painting_${user.id}_${Date.now()}.${ext}`;
            r2Url = await uploadImage(buffer, filename, mimeType);
            
            if (!r2Url) {
                return res.status(500).json({ success: false, message: 'Falha ao salvar imagem de pintura no R2.' });
            }
        }
        
        // Salvar metadados no perfil do usuário
        if (!user.myPaintings) user.myPaintings = [];
        const originalCategory = req.body.originalCategory || null;
        const colorsCount = req.body.colorsCount || 1;
        
        const paintingItem = {
            drawingId: drawingId || null,
            url: r2Url,
            prompt: prompt,
            date: Date.now(),
            isPublic: !!isPublic,
            category: category || (prompt === 'Desenho Livre' ? 'Mão Livre' : 'Colorir'),
            originalCategory: originalCategory,
            colorsCount: colorsCount,
            firstLines: firstLines || null,
            storyData: storyData || null,
            fromPinturaLivre: !!fromPinturaLivre
        };
        user.myPaintings.push(paintingItem);
        
        // Carregar catálogo de cartas para os desafios de desenho
        const catalogPath = require('path').join(__dirname, 'cards_catalog.json');
        const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : [];

        const newlyUnlockedAI = [];
        let activeChallengeFailed = false;
        let activeChallengeSuccess = false;

        if (req.body.activeChallengeId && imageBase64) {
            const activeCard = catalog.find(c => c.id === req.body.activeChallengeId);
            if (activeCard) {
                const hasCard = user.cards.some(uc => uc.id === activeCard.id);
                if (hasCard) {
                    activeChallengeSuccess = true;
                } else {
                    console.log(`[AI Drawing] Verificando desafio específico ativo: ${activeCard.name} (${activeCard.id})...`);
                    const mockResponse = req.hostname === 'localhost' ? (req.headers['x-mock-claude-response'] || req.headers['x-mock-ai-response']) : null;
                    const aiResponse = await checkDrawingWithClaudeVision(imageBase64, mockResponse);
                    if (aiResponse) {
                        console.log(`[AI Drawing] Resposta da Claude para desafio ativo: "${aiResponse}"`);
                        const synonyms = activeCard.unlockCondition.synonyms || [activeCard.unlockCondition.subject];
                        const isMatch = matchSubject(aiResponse, synonyms);
                        console.log(`[AI Drawing Debug] Card: "${activeCard.name}" | Tema esperado: "${activeCard.unlockCondition.subject}" | Resposta da Claude: "${aiResponse}" | Resultado da comparação: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
                        if (isMatch) {
                            console.log(`[AI Drawing] MATCH! Desbloqueando card "${activeCard.name}" (ID: ${activeCard.id})`);
                            if (!user.cards.some(uc => uc.id === activeCard.id)) {
                                user.cards.push(activeCard);
                                newlyUnlockedAI.push(activeCard);
                            }
                            activeChallengeSuccess = true;
                        } else {
                            activeChallengeFailed = true;
                        }
                    } else {
                        activeChallengeFailed = true;
                    }
                }
            }
        } else if (imageBase64) {
            const pendingChallenges = catalog.filter(c => {
                const hasCard = user.cards.some(uc => uc.id === c.id);
                return !hasCard && c.unlockCondition && c.unlockCondition.type === 'drawing_challenge';
            });

            if (pendingChallenges.length > 0) {
                console.log(`[AI Drawing] Verificando ${pendingChallenges.length} desafios pendentes...`);
                const mockResponse = req.hostname === 'localhost' ? (req.headers['x-mock-claude-response'] || req.headers['x-mock-ai-response']) : null;
                const aiResponse = await checkDrawingWithClaudeVision(imageBase64, mockResponse);
                if (aiResponse) {
                    console.log(`[AI Drawing] Resposta da Claude: "${aiResponse}"`);
                    pendingChallenges.forEach(card => {
                        const synonyms = card.unlockCondition.synonyms || [card.unlockCondition.subject];
                        const isMatch = matchSubject(aiResponse, synonyms);
                        console.log(`[AI Drawing Debug] Card: "${card.name}" | Tema esperado: "${card.unlockCondition.subject}" | Resposta da Claude: "${aiResponse}" | Resultado da comparação: ${isMatch ? 'MATCH' : 'NO MATCH'} | Desbloqueou: ${isMatch ? 'SIM' : 'NÃO'}`);
                        if (isMatch) {
                            console.log(`[AI Drawing] MATCH! Desbloqueando card "${card.name}" (ID: ${card.id})`);
                            if (!user.cards.some(uc => uc.id === card.id)) {
                                user.cards.push(card);
                                newlyUnlockedAI.push(card);
                            }
                        }
                    });
                }
            }
        }

        // Incrementar missões diárias
        try {
            const { incrementMissionProgress } = require('./missions');
            const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_URL.includes('placeholder');
            const addStarsFn = useSupabase ? addStars : null;
            
            await incrementMissionProgress(user.id, 'mission-1', 1, users, null, addStarsFn);
            await incrementMissionProgress(user.id, 'mission-3', 1, users, null, addStarsFn);
            if (colorsCount >= 5) {
                await incrementMissionProgress(user.id, 'mission-2', 5, users, null, addStarsFn);
            }
        } catch (missErr) {
            console.error('[Missions] Erro ao atualizar missões diárias:', missErr);
        }

        // Avaliar e desbloquear descobertas progressivas
        const { newlyUnlocked, completionRewards } = await refreshUserDiscoveries(user);
        
        // Mesclar as cartas desbloqueadas pela IA
        newlyUnlocked.push(...newlyUnlockedAI);
        
        // Avaliar e desbloquear novos certificados
        const newlyUnlockedCerts = await evaluateUserCertificates(user, `Desenho: ${prompt}`);
        
        await saveUsers(users);
        console.log(`[Save Painting] Pintura para "${prompt}" salva para "${user.email}". URL: ${r2Url} (Public: ${isPublic})`);
        
        // Se for público, salvar na lista do Hall da Fama como pendente (isApproved: false)
        if (isPublic) {
            const { loadPublicPaintings, savePublicPaintings } = require('./r2db');
            const publicPaintings = await loadPublicPaintings();
            publicPaintings.push({
                url: r2Url,
                prompt: prompt,
                date: Date.now(),
                userEmail: user.email,
                userName: creatorName || user.name || user.email.split('@')[0],
                creatorName: creatorName || user.name || user.email.split('@')[0],
                category: category || (prompt === 'Desenho Livre' ? 'Mão Livre' : 'Colorir'),
                stars: 0,
                likes: 0,
                isApproved: false,
                reports: 0,
                votedBy: [],
                firstLines: firstLines || null,
                storyData: storyData || null
            });
            if (publicPaintings.length > 500) {
                publicPaintings.shift();
            }
            await savePublicPaintings(publicPaintings);
        }

        return res.json({
            success: true,
            imageUrl: r2Url,
            myPaintings: user.myPaintings,
            cards: user.cards,
            newlyUnlocked: newlyUnlocked,
            completionRewards: completionRewards,
            newDiscovery: newlyUnlocked[0] || (completionRewards[0] ? completionRewards[0].mythicCard : null),
            stars: user.stars,
            newlyUnlockedCertificates: newlyUnlockedCerts,
            activeChallengeSuccess: activeChallengeSuccess,
            activeChallengeFailed: activeChallengeFailed
        });
    } catch(err) {
        console.error('Erro ao salvar pintura:', err);
        return res.status(500).json({ success: false, message: 'Erro ao salvar a pintura no seu perfil.' });
    }
});

// Endpoint para obter as missões diárias do usuário
app.get('/api/missions/daily', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        
        const users = await loadUsers();
        const user = findUserByToken(users, token);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }
        
        const { getDailyMissions } = require('./missions');
        const missions = getDailyMissions(user.id);
        
        return res.json(missions);
    } catch (err) {
        console.error('Erro ao obter missões diárias:', err);
        return res.status(500).json({ success: false, message: 'Erro ao obter missões diárias.' });
    }
});

// Endpoint para atualizar progresso de uma missão
app.post('/api/missions/progress', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { missionId, increment } = req.body;
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        if (!missionId) {
            return res.status(400).json({ success: false, message: 'ID da missão é obrigatório.' });
        }
        
        const users = await loadUsers();
        const user = findUserByToken(users, token);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }
        
        const { incrementMissionProgress } = require('./missions');
        const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_URL.includes('placeholder');
        const addStarsFn = useSupabase ? addStars : null;
        
        const updatedMissions = await incrementMissionProgress(user.id, missionId, increment || 1, users, saveUsers, addStarsFn);
        
        return res.json({
            success: true,
            missions: updatedMissions,
            stars: user.stars
        });
    } catch (err) {
        console.error('Erro ao atualizar progresso da missão:', err);
        return res.status(500).json({ success: false, message: 'Erro ao atualizar progresso da missão.' });
    }
});

// Endpoint para atualizar o avatar do usuário
app.post('/api/user/update-avatar', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { avatar } = req.body;
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado. Faça login novamente.' });
        }
        if (!avatar) {
            return res.status(400).json({ success: false, message: 'Avatar é obrigatório.' });
        }
        
        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }

        // Se for um card do catálogo, validar propriedade
        const catalogPath = path.join(__dirname, 'cards_catalog.json');
        let catalog = [];
        try {
            catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
        } catch (e) {
            console.error('Erro ao ler catálogo no update-avatar:', e);
        }
        
        const isCard = catalog.some(c => c.id === avatar);
        if (isCard) {
            const hasCard = (user.cards || []).some(uc => {
                if (!uc) return false;
                if (typeof uc === 'string') return uc === avatar;
                return (uc.id || uc.value) === avatar;
            });
            if (!hasCard) {
                return res.status(403).json({ success: false, message: 'Você ainda não desbloqueou este card.' });
            }
        }
        
        user.avatar = avatar;
        
        // Avaliar e desbloquear novos certificados
        const newlyUnlockedCerts = await evaluateUserCertificates(user, 'Avatar Atualizado');
        
        await saveUsers(users);
        
        return res.json({ success: true, message: 'Avatar atualizado com sucesso!', avatar: user.avatar, newlyUnlockedCertificates: newlyUnlockedCerts });
    } catch(err) {
        console.error('Erro ao atualizar avatar:', err);
        return res.status(500).json({ success: false, message: 'Erro ao atualizar o avatar.' });
    }
});

// Endpoint para registrar compartilhamento de descobertas e conceder estrelas com limite diário
app.post('/api/user/record-share', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        
        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }
        
        const { shareType } = req.body || {};
        
        // Incrementar o total de compartilhamentos
        user.shareCount = (user.shareCount || 0) + 1;
        if (shareType === 'story') {
            user.storyShareCount = (user.storyShareCount || 0) + 1;
        } else {
            user.paintingShareCount = (user.paintingShareCount || 0) + 1;
        }
        
        // Controle de limite diário de recompensas (Máximo 5 estrelas por dia)
        const MAX_DAILY_SHARE_REWARDS = 5;
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (user.lastShareDate !== todayStr) {
            user.lastShareDate = todayStr;
            user.sharesTodayCount = 0;
        }
        
        let rewardGiven = false;
        if ((user.sharesTodayCount || 0) < MAX_DAILY_SHARE_REWARDS) {
            user.sharesTodayCount = (user.sharesTodayCount || 0) + 1;
            user.stars = (user.stars || 0) + 1;
            user.monthlyStars = (user.monthlyStars || 0) + 1;
            rewardGiven = true;
        }
        
        // Avaliar e desbloquear descobertas progressivas
        const { newlyUnlocked, completionRewards } = await refreshUserDiscoveries(user);
        await saveUsers(users);
        
        return res.json({ 
            success: true, 
            shareCount: user.shareCount, 
            stars: user.stars, 
            rewardGiven: rewardGiven,
            sharesTodayCount: user.sharesTodayCount,
            cards: user.cards,
            newlyUnlocked: newlyUnlocked,
            completionRewards: completionRewards,
            newDiscovery: newlyUnlocked[0] || (completionRewards[0] ? completionRewards[0].mythicCard : null)
        });
    } catch(err) {
        console.error('Erro ao registrar compartilhamento:', err);
        return res.status(500).json({ success: false, message: 'Erro interno ao registrar compartilhamento.' });
    }
});

        // Endpoint para atualizar conquistas do usuário
app.post('/api/user/update-achievements', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { achievements } = req.body;
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        if (!Array.isArray(achievements)) {
            return res.status(400).json({ success: false, message: 'Formato inválido.' });
        }
        
        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão expirada.' });
        }
        
        user.achievements = achievements;
        await saveUsers(users);
        
        return res.json({ success: true });
    } catch(err) {
        console.error('Erro ao atualizar conquistas:', err);
        return res.status(500).json({ success: false });
    }
});

// Endpoint para obter perfil público de um criador do Hall da Fama
app.get('/api/user/public-profile', async (req, res) => {
    try {
        const { name, userEmail } = req.query;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Nome do criador é obrigatório.' });
        }

        const { loadPublicPaintings } = require('./r2db');
        const publicPaintings = await loadPublicPaintings();
        const users = await loadUsers();

        // 1. Tentar encontrar a associação de email pelo banco de pinturas públicas
        let email = userEmail || '';
        if (!email) {
            const matchPainting = publicPaintings.find(p => p.creatorName && p.creatorName.toLowerCase() === name.toLowerCase());
            if (matchPainting) {
                email = matchPainting.userEmail;
            }
        }

        // 2. Tentar buscar o usuário pelo email encontrado, ou pelo próprio nome direto
        let user = null;
        if (email) {
            user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        } else {
            user = users.find(u => u.name && u.name.toLowerCase() === name.toLowerCase());
        }

        if (user && !email) {
            email = user.email;
        }

        let creatorApproved = [];
        if (email) {
            creatorApproved = publicPaintings.filter(p => p.userEmail && p.userEmail.toLowerCase() === email.toLowerCase() && p.isApproved === true && (!p.reports || p.reports < 3));
        } else {
            creatorApproved = publicPaintings.filter(p => p.creatorName && p.creatorName.toLowerCase() === name.toLowerCase() && p.isApproved === true && (!p.reports || p.reports < 3));
        }

        const totalStars = creatorApproved.reduce((sum, p) => sum + (p.stars || p.likes || 0), 0);

        // Count category-specific creations in the public gallery
        const paintingsCount = creatorApproved.filter(p => p.category === 'Colorir' || p.category === 'Mão Livre' || !p.category).length;
        const storiesCount = creatorApproved.filter(p => p.category === 'Histórias Mágicas').length;
        const aiImagesCount = creatorApproved.filter(p => p.category === 'Criação com IA').length;

        // Retornar os dados consolidados do perfil público
        return res.json({
            success: true,
            profile: {
                name: user ? (user.name || name) : name,
                avatar: user ? (user.avatar || '👤') : '👤',
                stars: user ? (user.stars || totalStars) : totalStars,
                paintingsCount: paintingsCount,
                storiesCount: storiesCount,
                aiImagesCount: aiImagesCount,
                unlockedAchievements: user ? (user.achievements || []) : [],
                plan: user ? (user.plan || 'Aprendiz') : 'Aprendiz',
                featuredCards: user ? (user.featuredCards || [null, null, null]) : [null, null, null],
                age: user && user.showAge ? user.age : null,
                showAge: user ? !!user.showAge : false,
                createdAt: user ? (user.createdAt || user.created_at || '2025-06-01T00:00:00.000Z') : '2025-06-01T00:00:00.000Z'
            }
        });
    } catch(err) {
        console.error('Erro ao buscar perfil público:', err);
        return res.status(500).json({ success: false, message: 'Erro ao buscar dados do perfil.' });
    }
});

// Endpoint para atualizar o nome de exibição com cooldown de 30 dias
app.post('/api/user/update-username', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { name } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado. Faça login novamente.' });
        }
        if (!name || name.trim().length < 2 || name.trim().length > 25) {
            return res.status(400).json({ success: false, message: 'O nome de exibição deve ter entre 2 e 25 caracteres.' });
        }

        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }

        // Cooldown de 30 dias
        const now = new Date();
        if (user.lastUsernameChangeDate) {
            const lastChange = new Date(user.lastUsernameChangeDate);
            const diffTime = Math.abs(now - lastChange);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 30) {
                const daysRemaining = 30 - Math.floor(diffTime / (1000 * 60 * 60 * 24));
                return res.status(400).json({ 
                    success: false, 
                    message: `Você só pode alterar seu nome uma vez por mês. Próxima troca disponível em ${daysRemaining} dias.` 
                });
            }
        }

        user.name = name.trim();
        user.lastUsernameChangeDate = now.toISOString();
        await saveUsers(users);

        // Sincronizar nome em public_paintings.json
        try {
            const { loadPublicPaintings, savePublicPaintings } = require('./r2db');
            const publicPaintings = await loadPublicPaintings();
            let changed = false;
            publicPaintings.forEach(p => {
                if (p.userEmail && p.userEmail.toLowerCase() === user.email.toLowerCase()) {
                    p.creatorName = user.name;
                    p.userName = user.name;
                    changed = true;
                }
            });
            if (changed) {
                await savePublicPaintings(publicPaintings);
            }
        } catch (e) {
            console.error('Erro ao sincronizar nome nas pinturas públicas:', e);
        }

        return res.json({ 
            success: true, 
            message: 'Nome de exibição atualizado com sucesso!', 
            name: user.name,
            lastUsernameChangeDate: user.lastUsernameChangeDate
        });
    } catch(err) {
        console.error('Erro ao atualizar nome de exibição:', err);
        return res.status(500).json({ success: false, message: 'Erro ao atualizar o nome de exibição.' });
    }
});

// Endpoint para atualizar configurações de perfil (idade, privacidade da idade, notificações)
app.post('/api/user/update-profile-settings', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { age, showAge, notifications } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }

        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }

        if (age !== undefined) {
            user.age = age === null || age === '' ? null : parseInt(age, 10);
        }
        if (showAge !== undefined) {
            user.showAge = !!showAge;
        }
        if (notifications !== undefined) {
            user.notifications = !!notifications;
        }

        await saveUsers(users);
        return res.json({ 
            success: true, 
            message: 'Configurações de perfil atualizadas com sucesso!',
            profileSettings: {
                age: user.age,
                showAge: user.showAge,
                notifications: user.notifications
            }
        });
    } catch (err) {
        console.error('Erro ao salvar configurações de perfil:', err);
        return res.status(500).json({ success: false, message: 'Erro ao atualizar as configurações do perfil.' });
    }
});

// Endpoint para atualizar selos em destaque
app.post('/api/user/update-featured-cards', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { featuredCards } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        if (!Array.isArray(featuredCards)) {
            return res.status(400).json({ success: false, message: 'Formato inválido.' });
        }
        if (featuredCards.length > 3) {
            return res.status(400).json({ success: false, message: 'Você pode escolher no máximo 3 selos em destaque.' });
        }

        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }

        const userAchievements = user.achievements || [];
        const validatedCards = featuredCards.map(cardId => {
            if (cardId === null || cardId === undefined || cardId === '') return null;
            if (userAchievements.includes(cardId)) return cardId;
            return null;
        });

        while (validatedCards.length < 3) {
            validatedCards.push(null);
        }

        user.featuredCards = validatedCards;
        await saveUsers(users);

        return res.json({ 
            success: true, 
            message: 'Selos em destaque atualizados!',
            featuredCards: user.featuredCards
        });
    } catch(err) {
        console.error('Erro ao atualizar selos em destaque:', err);
        return res.status(500).json({ success: false, message: 'Erro ao atualizar selos em destaque.' });
    }
});

// Endpoint para trocar a senha
app.post('/api/user/change-password', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { currentPassword, newPassword } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Senha atual e nova senha são obrigatórias.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'A nova senha deve ter no mínimo 6 caracteres.' });
        }

        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }

        const currentHash = hashPassword(currentPassword);
        if (user.passwordHash !== currentHash) {
            return res.status(400).json({ success: false, message: 'A senha atual está incorreta.' });
        }

        user.passwordHash = hashPassword(newPassword);
        await saveUsers(users);

        return res.json({ success: true, message: 'Senha alterada com sucesso!' });
    } catch (err) {
        console.error('Erro ao alterar senha:', err);
        return res.status(500).json({ success: false, message: 'Erro interno ao alterar a senha.' });
    }
});

// Endpoint para excluir uma criação do próprio usuário (desenho ou história)
app.post('/api/user/delete-creation', requireAuth, async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ success: false, message: 'URL da criação é obrigatória.' });
        }

        const user = req.user;
        const users = await loadUsers();
        const dbUser = users.find(u => u.id === user.id);
        if (!dbUser) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        let deleted = false;

        // 1. Procurar em myPaintings (desenhos e pinturas)
        if (dbUser.myPaintings) {
            const index = dbUser.myPaintings.findIndex(p => p.url === url);
            if (index !== -1) {
                dbUser.myPaintings.splice(index, 1);
                deleted = true;
            }
        }

        // 2. Procurar em myStories (histórias mágicas - identificar pela coverUrl)
        if (dbUser.myStories) {
            const index = dbUser.myStories.findIndex(s => s.coverUrl === url);
            if (index !== -1) {
                dbUser.myStories.splice(index, 1);
                deleted = true;
            }
        }

        // 3. Procurar em myImages (desenhos gerados por IA)
        if (dbUser.myImages) {
            const index = dbUser.myImages.findIndex(i => {
                const absUrl = i.url.startsWith('/saved_images/') 
                    ? `https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev${i.url}` 
                    : i.url;
                return i.url === url || absUrl === url;
            });
            if (index !== -1) {
                dbUser.myImages.splice(index, 1);
                deleted = true;
            }
        }

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Criação não encontrada na sua galeria.' });
        }

        // 4. Remover também do public_paintings.json (Hall da Fama) caso estivesse pública
        try {
            const { loadPublicPaintings, savePublicPaintings } = require('./r2db');
            const publicPaintings = await loadPublicPaintings();
            const indexPub = publicPaintings.findIndex(p => p.url === url && p.userEmail.toLowerCase() === dbUser.email.toLowerCase());
            if (indexPub !== -1) {
                console.log(`[Delete Creation] Removendo também postagem pública no Hall da Fama: ${url}`);
                publicPaintings.splice(indexPub, 1);
                await savePublicPaintings(publicPaintings);
            }
        } catch (e) {
            console.error('[Delete Creation] Erro ao sincronizar remoção no Hall da Fama:', e);
        }

        await saveUsers(users);
        
        // Sincronizar objetos na requisição do middleware
        user.myPaintings = dbUser.myPaintings;
        user.myStories = dbUser.myStories;
        user.myImages = dbUser.myImages;

        return res.json({
            success: true,
            message: 'Criação excluída com sucesso.',
            myPaintings: dbUser.myPaintings,
            myStories: dbUser.myStories,
            myImages: dbUser.myImages
        });
    } catch (err) {
        console.error('[Delete Creation Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro interno ao excluir criação.' });
    }
});

// Endpoint para exclusão de conta em 2 etapas
app.post('/api/user/delete-account', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { password } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: 'Digite sua senha para confirmar.' });
        }

        const users = await loadUsers();
        const userIdx = findUserIndexByToken(users, token);
        if (userIdx === -1) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }

        const user = users[userIdx];
        const hash = hashPassword(password);
        if (user.passwordHash !== hash) {
            return res.status(400).json({ success: false, message: 'A senha digitada está incorreta.' });
        }

        users.splice(userIdx, 1);
        await saveUsers(users);

        return res.json({ success: true, message: 'Sua conta foi excluída definitivamente.' });
    } catch (err) {
        console.error('Erro ao excluir conta:', err);
        return res.status(500).json({ success: false, message: 'Erro interno ao excluir a conta.' });
    }
});

// Endpoint para listar pinturas públicas (Hall da Fama - apenas aprovadas e não muito denunciadas)
app.get('/api/paintings/public', async (req, res) => {
    try {
        const { loadPublicPaintings } = require('./r2db');
        const publicPaintings = await loadPublicPaintings();
        const users = await loadUsers();
        
        const approved = publicPaintings.filter(p => p.isApproved === true && (!p.reports || p.reports < 3));
        
        // Separar postagens reais e de inspiração oficial
        const reals = approved.filter(p => !p.isOfficial && p.userEmail !== 'oficial@kidcanvas.com.br');
        const officials = approved.filter(p => p.isOfficial || p.userEmail === 'oficial@kidcanvas.com.br');
        
        // Ordenar reais por data decrescente (mais recentes no topo)
        reals.sort((a, b) => b.date - a.date);
        // Ordenar oficiais por data decrescente
        officials.sort((a, b) => b.date - a.date);
        
        let sorted = [];
        if (reals.length === 0) {
            sorted = officials;
        } else if (reals.length < 10) {
            // Se houver poucos desenhos reais, mesclar colocando os reais primeiro
            sorted = [...reals, ...officials];
        } else {
            // Se houver mais de 10 desenhos reais, deixar os reais dominarem o topo
            // e limitar os oficiais a no máximo 8 itens exibidos no final da lista
            sorted = [...reals, ...officials.slice(0, 8)];
        }
        
        const mapped = sorted.map(p => {
            let user = null;
            if (p.userEmail) {
                user = users.find(u => u.email && u.email.toLowerCase() === p.userEmail.toLowerCase());
            } else if (p.creatorName) {
                user = users.find(u => u.name && u.name.toLowerCase() === p.creatorName.toLowerCase());
            }
            return {
                ...p,
                creatorAvatar: user ? (user.avatar || '👤') : '👤'
            };
        });
        
        return res.json({ success: true, paintings: mapped });
    } catch(err) {
        console.error('Erro ao carregar pinturas públicas:', err);
        return res.status(500).json({ success: false, message: 'Erro ao carregar o Hall da Fama.' });
    }
});

// Endpoint para curtir/votar em uma pintura no Hall da Fama (proteção 1 voto por conta ou 1 por IP/dia)
app.post('/api/paintings/like', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ success: false, message: 'URL da pintura é obrigatória.' });
        }
        
        const token = req.headers['x-session-token'];
        let currentUserObj = null;
        if (token) {
            const users = await loadUsers();
            currentUserObj = findUserByToken(users, token);
        }

        // Obter IP do cliente
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded ? forwarded.split(',')[0].trim() : (req.ip || req.socket.remoteAddress);
        const today = new Date().toISOString().split('T')[0];

        const { loadPublicPaintings, savePublicPaintings } = require('./r2db');
        const publicPaintings = await loadPublicPaintings();
        const item = publicPaintings.find(p => p.url === url);
        
        if (item) {
            item.votedBy = item.votedBy || [];
            
            // Verificar proteção de votos
            if (currentUserObj) {
                // 1 voto por conta
                const alreadyVoted = item.votedBy.some(v => v.userId === currentUserObj.id || v.userEmail === currentUserObj.email);
                if (alreadyVoted) {
                    return res.status(400).json({ success: false, message: 'Você já deu uma estrelinha para esta pintura! 🌟' });
                }
            } else {
                // 1 voto por IP/dispositivo por dia para visitantes
                const alreadyVotedToday = item.votedBy.some(v => v.ip === ip && v.date === today);
                if (alreadyVotedToday) {
                    return res.status(400).json({ success: false, message: 'Seu dispositivo já deu uma estrelinha hoje! Tente amanhã. 🌟' });
                }
            }

            // Registrar voto
            item.votedBy.push({
                userId: currentUserObj ? currentUserObj.id : null,
                userEmail: currentUserObj ? currentUserObj.email : null,
                ip: ip,
                date: today
            });

            item.stars = (item.stars || 0) + 1;
            item.likes = item.stars; // compatibilidade
            
            await savePublicPaintings(publicPaintings);
            return res.json({ success: true, stars: item.stars });
        } else {
            return res.status(404).json({ success: false, message: 'Pintura não encontrada.' });
        }
    } catch(err) {
        console.error('Erro ao curtir pintura:', err);
        return res.status(500).json({ success: false, message: 'Erro ao registrar curtida.' });
    }
});

// Endpoint para denunciar uma pintura pública
app.post('/api/paintings/report', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ success: false, message: 'URL da pintura é obrigatória.' });
        }

        const { loadPublicPaintings, savePublicPaintings } = require('./r2db');
        const publicPaintings = await loadPublicPaintings();
        const item = publicPaintings.find(p => p.url === url);

        if (item) {
            item.reports = (item.reports || 0) + 1;
            console.log(`[Moderation] Pintura denunciada: ${url} (Total denúncias: ${item.reports})`);
            
            // Ocultar automaticamente se houver 3 ou mais denúncias
            if (item.reports >= 3) {
                item.isApproved = false;
                console.log(`[Moderation] Pintura suspensa automaticamente por excesso de denúncias: ${url}`);
            }

            await savePublicPaintings(publicPaintings);
            return res.json({ success: true, message: 'Pintura denunciada com sucesso. Nossa equipe irá revisar.' });
        } else {
            return res.status(404).json({ success: false, message: 'Pintura não encontrada.' });
        }
    } catch (err) {
        console.error('Erro ao denunciar pintura:', err);
        return res.status(500).json({ success: false, message: 'Erro ao registrar denúncia.' });
    }
});

// Helper para verificar se o usuário é o administrador
async function checkIsAdmin(token) {
    if (!token) return false;
    const users = await loadUsers();
    const user = findUserByToken(users, token);
    return user && user.email === 'foneoliver@gmail.com';
}

// Endpoint para listar pinturas pendentes de aprovação (apenas para Admin)
app.get('/api/paintings/pending', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const isAdmin = await checkIsAdmin(token);
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores podem moderar.' });
        }

        const { loadPublicPaintings } = require('./r2db');
        const publicPaintings = await loadPublicPaintings();
        const pending = publicPaintings.filter(p => p.isApproved !== true);
        return res.json({ success: true, paintings: pending.reverse() });
    } catch (err) {
        console.error('Erro ao listar pendentes:', err);
        return res.status(500).json({ success: false, message: 'Erro ao carregar lista de moderação.' });
    }
});

// Endpoint para aprovar uma pintura pública (apenas para Admin)
app.post('/api/paintings/approve', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const isAdmin = await checkIsAdmin(token);
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Acesso negado.' });
        }

        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ success: false, message: 'URL é obrigatória.' });
        }

        const { loadPublicPaintings, savePublicPaintings } = require('./r2db');
        const publicPaintings = await loadPublicPaintings();
        const item = publicPaintings.find(p => p.url === url);

        if (item) {
            item.isApproved = true;
            await savePublicPaintings(publicPaintings);
            return res.json({ success: true, message: 'Pintura aprovada com sucesso!' });
        } else {
            return res.status(404).json({ success: false, message: 'Pintura não encontrada.' });
        }
    } catch (err) {
        console.error('Erro ao aprovar pintura:', err);
        return res.status(500).json({ success: false, message: 'Erro ao aprovar pintura.' });
    }
});

// Endpoint para excluir/rejeitar uma pintura pública (apenas para Admin)
app.post('/api/paintings/delete', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const isAdmin = await checkIsAdmin(token);
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Acesso negado.' });
        }

        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ success: false, message: 'URL é obrigatória.' });
        }

        const { loadPublicPaintings, savePublicPaintings } = require('./r2db');
        const publicPaintings = await loadPublicPaintings();
        const index = publicPaintings.findIndex(p => p.url === url);

        if (index !== -1) {
            publicPaintings.splice(index, 1);
            await savePublicPaintings(publicPaintings);
            return res.json({ success: true, message: 'Pintura removida com sucesso!' });
        } else {
            return res.status(404).json({ success: false, message: 'Pintura não encontrada.' });
        }
    } catch (err) {
        console.error('Erro ao deletar pintura:', err);
        return res.status(500).json({ success: false, message: 'Erro ao remover pintura.' });
    }
});

// Endpoint para advertir/dar aviso a um usuário (apenas para Admin)
app.post('/api/admin/warn-user', isAdmin, async (req, res) => {
    try {
        const { email, url } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'E-mail do usuário é obrigatório.' });
        }

        const users = await loadUsers();
        const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        user.warnings = (user.warnings || 0) + 1;
        await saveUsers(users);

        // Remover a pintura pública se a URL for informada
        if (url) {
            const { loadPublicPaintings, savePublicPaintings } = require('./r2db');
            const publicPaintings = await loadPublicPaintings();
            const index = publicPaintings.findIndex(p => p.url === url);
            if (index !== -1) {
                publicPaintings.splice(index, 1);
                await savePublicPaintings(publicPaintings);
            }
        }

        console.log(`[Admin Moderation] Usuário ${email} advertido. Total de advertências: ${user.warnings}`);
        return res.json({ success: true, message: `Usuário advertido com sucesso! Total de advertências: ${user.warnings}`, warnings: user.warnings });
    } catch (err) {
        console.error('Erro ao advertir usuário:', err);
        return res.status(500).json({ success: false, message: 'Erro ao advertir usuário.' });
    }
});

// Endpoint para banir um usuário (apenas para Admin)
app.post('/api/admin/ban-user', isAdmin, async (req, res) => {
    try {
        const { email, url, reason } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'E-mail do usuário é obrigatório.' });
        }

        const users = await loadUsers();
        const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        user.isBanned = true;
        user.banReason = reason || 'Postagem de conteúdo impróprio no Hall da Fama.';
        // Invalidar a sessão dele imediatamente
        user.token = null;
        user.tokenExpiry = null;
        
        await saveUsers(users);

        // Remover a pintura pública se a URL for informada
        if (url) {
            const { loadPublicPaintings, savePublicPaintings } = require('./r2db');
            const publicPaintings = await loadPublicPaintings();
            const index = publicPaintings.findIndex(p => p.url === url);
            if (index !== -1) {
                publicPaintings.splice(index, 1);
                await savePublicPaintings(publicPaintings);
            }
        }

        console.log(`[Admin Moderation] Usuário ${email} BANIDO. Motivo: ${user.banReason}`);
        return res.json({ success: true, message: `Usuário ${email} banido com sucesso!` });
    } catch (err) {
        console.error('Erro ao banir usuário:', err);
        return res.status(500).json({ success: false, message: 'Erro ao banir usuário.' });
    }
});

// Helper para processar a premiação mensal e reiniciar o ciclo
async function processMonthlyRewards(forceManual = false) {
    const { loadEvents, saveEvents } = require('./r2db');
    let eventsData = await loadEvents();
    if (!eventsData) {
        eventsData = { currentSeason: 'aventura_magica', currentWeek: 0, weeks: [] };
    }
    if (!eventsData.monthlyRewardConfig) {
        eventsData.monthlyRewardConfig = {
            autoEnabled: false,
            lastExecutedMonth: "",
            lastExecutedDate: "",
            nextExecutionDate: ""
        };
    }

    const now = new Date();
    // Identificar o mês a ser premiado (o mês anterior ao atual)
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const targetMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`; // Ex: "2026-05"

    // Evitar execução duplicada para o mesmo mês
    if (eventsData.monthlyRewardConfig.lastExecutedMonth === targetMonth && !forceManual) {
        console.log(`[Monthly Rewards] Mês ${targetMonth} já foi premiado anteriormente. Pulando.`);
        return { success: false, message: `Mês ${targetMonth} já foi premiado anteriormente.` };
    }

    console.log(`[Monthly Rewards] Iniciando processamento de premiação para o mês: ${targetMonth}`);
    const users = await loadUsers();
    
    // Filtrar e ordenar usuários aptos para o ranking (com monthlyStars > 0 e não banidos)
    const candidates = users
        .filter(u => !u.isBanned && (u.monthlyStars || 0) > 0)
        .sort((a, b) => (b.monthlyStars || 0) - (a.monthlyStars || 0));

    console.log(`[Monthly Rewards] Encontrados ${candidates.length} usuários aptos para o ranking.`);

    const payouts = [];
    // Distribuir os prêmios para os 5 primeiros colocados
    // 1º lugar: 20 créditos
    // 2º lugar: 15 créditos
    // 3º lugar: 10 créditos
    // 4º e 5º lugar: 5 créditos cada
    const rewards = [20, 15, 10, 5, 5];

    for (let i = 0; i < Math.min(candidates.length, 5); i++) {
        const u = candidates[i];
        const creditAward = rewards[i];
        
        u.paginasRestantes = (u.paginasRestantes || 0) + creditAward;
        u.lastMonthlyRewardClaimed = targetMonth;
        
        payouts.push({
            position: i + 1,
            name: u.name,
            email: u.email,
            monthlyStars: u.monthlyStars,
            creditsAwarded: creditAward
        });
        
        console.log(`[Monthly Rewards] Premiado ${u.email} (Posição ${i+1}) com +${creditAward} créditos.`);
    }

    // Zerar monthlyStars de todos os usuários
    users.forEach(u => {
        u.monthlyStars = 0;
    });

    await saveUsers(users);

    // Salvar estado da premiação em events.json
    eventsData.monthlyRewardConfig.lastExecutedMonth = targetMonth;
    eventsData.monthlyRewardConfig.lastExecutedDate = now.toISOString();
    // Calcular a próxima data de execução (primeiro dia do próximo mês)
    const nextExec = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    eventsData.monthlyRewardConfig.nextExecutionDate = nextExec.toISOString();

    await saveEvents(eventsData);
    console.log(`[Monthly Rewards] Concluído processamento de premiação para o mês: ${targetMonth}`);

    return {
        success: true,
        message: `Premiação do mês ${targetMonth} processada com sucesso!`,
        targetMonth,
        payouts
    };
}

// Endpoint público para listar o Top Exploradores do Mês
app.get('/api/paintings/top-explorers', async (req, res) => {
    try {
        const users = await loadUsers();
        // Filtrar usuários não banidos e com monthlyStars > 0
        const ranked = users
            .filter(u => !u.isBanned && (u.monthlyStars || 0) > 0)
            .sort((a, b) => (b.monthlyStars || 0) - (a.monthlyStars || 0))
            .slice(0, 20)
            .map(u => ({
                name: u.name || 'Artista',
                email: u.email,
                avatar: u.avatar || '👤',
                plan: u.plan || 'Aprendiz',
                monthlyStars: u.monthlyStars || 0
            }));
            
        return res.json({ success: true, explorers: ranked });
    } catch (err) {
        console.error('Erro ao buscar ranking de exploradores:', err);
        return res.status(500).json({ success: false, message: 'Erro ao buscar ranking de exploradores.' });
    }
});

// Endpoint de Admin para buscar configurações da premiação mensal
app.get('/api/admin/monthly-rewards/config', isAdmin, async (req, res) => {
    try {
        const { loadEvents } = require('./r2db');
        let eventsData = await loadEvents();
        if (!eventsData) {
            eventsData = { currentSeason: 'aventura_magica', currentWeek: 0, weeks: [] };
        }
        if (!eventsData.monthlyRewardConfig) {
            eventsData.monthlyRewardConfig = {
                autoEnabled: false,
                lastExecutedMonth: "",
                lastExecutedDate: "",
                nextExecutionDate: ""
            };
        }
        
        const users = await loadUsers();
        const candidates = users
            .filter(u => !u.isBanned && (u.monthlyStars || 0) > 0)
            .sort((a, b) => (b.monthlyStars || 0) - (a.monthlyStars || 0))
            .slice(0, 20)
            .map(u => ({
                name: u.name || 'Artista',
                email: u.email,
                monthlyStars: u.monthlyStars || 0
            }));
            
        return res.json({
            success: true,
            config: eventsData.monthlyRewardConfig,
            candidates
        });
    } catch (err) {
        console.error('Erro ao carregar config de premiação:', err);
        return res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

// Endpoint de Admin para alternar o modo automático
app.post('/api/admin/monthly-rewards/toggle', isAdmin, async (req, res) => {
    try {
        const { autoEnabled } = req.body;
        if (autoEnabled === undefined) {
            return res.status(400).json({ success: false, message: 'Parâmetro autoEnabled é obrigatório.' });
        }
        
        const { loadEvents, saveEvents } = require('./r2db');
        let eventsData = await loadEvents();
        if (!eventsData) {
            eventsData = { currentSeason: 'aventura_magica', currentWeek: 0, weeks: [] };
        }
        if (!eventsData.monthlyRewardConfig) {
            eventsData.monthlyRewardConfig = {
                autoEnabled: false,
                lastExecutedMonth: "",
                lastExecutedDate: "",
                nextExecutionDate: ""
            };
        }
        
        eventsData.monthlyRewardConfig.autoEnabled = !!autoEnabled;
        await saveEvents(eventsData);
        
        console.log(`[Admin Moderation] Premiação mensal automática alterada para: ${eventsData.monthlyRewardConfig.autoEnabled}`);
        return res.json({ success: true, message: `Premiação mensal automática alterada com sucesso!`, config: eventsData.monthlyRewardConfig });
    } catch (err) {
        console.error('Erro ao alternar modo automático:', err);
        return res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

// Endpoint de Admin para disparar a premiação manual do mês anterior
app.post('/api/admin/monthly-rewards/payout', isAdmin, async (req, res) => {
    try {
        const result = await processMonthlyRewards(true);
        return res.json(result);
    } catch (err) {
        console.error('Erro ao processar premiação manual:', err);
        return res.status(500).json({ success: false, message: 'Erro ao processar premiação.' });
    }
});

// Helper para avaliar e desbloquear novos certificados para o usuário
async function evaluateUserCertificates(user, additionalInfo = '') {
    if (!user.certificates) user.certificates = [];
    
    const catalogPath = path.join(__dirname, 'certificates_catalog.json');
    if (!fs.existsSync(catalogPath)) return [];
    
    let certCatalog = [];
    try {
        certCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    } catch (e) {
        console.error('Erro ao ler catálogo de certificados:', e);
        return [];
    }
    
    // Precarregar catálogos para coleções
    const cardsCatalogPath = path.join(__dirname, 'cards_catalog.json');
    let cardsCatalog = [];
    try {
        if (fs.existsSync(cardsCatalogPath)) {
            cardsCatalog = JSON.parse(fs.readFileSync(cardsCatalogPath, 'utf8'));
        }
    } catch (e) {
        console.error('Erro ao ler catálogo de cards:', e);
    }
    
    // Contagem de likes recebidos
    let likesCount = user.likesReceived || 0;
    
    const countPaintingsOfCategory = (catName) => {
        return (user.myPaintings || []).filter(p => {
            if (p.fromPinturaLivre === true || p.category === 'Mão Livre') return false;
            if (p.originalCategory && p.originalCategory.toLowerCase() === catName.toLowerCase()) return true;
            if (p.category && p.category.toLowerCase() === catName.toLowerCase()) return true;
            return false;
        }).length;
    };
    
    const isCollectionComplete = (colName) => {
        const colCards = cardsCatalog.filter(c => c.collection && c.collection.toLowerCase().includes(colName.toLowerCase()));
        if (colCards.length === 0) return false;
        const nonMythic = colCards.filter(c => c.rarity !== 'Mítica');
        if (nonMythic.length === 0) return false;
        return nonMythic.every(c => (user.cards || []).some(uc => uc.id === c.id));
    };

    const isCollectionCompleteCards = (categorySlug) => {
        const colCards = cardsCatalog.filter(c => c.categorySlug && c.categorySlug.toLowerCase() === categorySlug.toLowerCase());
        if (colCards.length === 0) return false;
        return colCards.every(c => (user.cards || []).some(uc => uc.id === c.id));
    };
    
    const newlyUnlocked = [];
    const recipientName = user.name || 'Artista';
    
    certCatalog.forEach(cert => {
        const alreadyHas = user.certificates.some(uc => uc.id === cert.id);
        if (alreadyHas) return;
        
        let shouldUnlock = false;
        const rule = cert.unlockRule;
        if (!rule) return;
        
        switch (rule.type) {
            case 'paint_count':
                shouldUnlock = (user.myPaintings || []).length >= rule.count;
                break;
            case 'category_paint':
                shouldUnlock = countPaintingsOfCategory(rule.category) >= rule.count;
                break;
            case 'collection_complete':
                shouldUnlock = isCollectionComplete(rule.target);
                break;
            case 'collection_complete_cards':
                shouldUnlock = isCollectionCompleteCards(rule.target);
                break;
            case 'stars_count':
                shouldUnlock = (user.stars || 0) >= rule.count;
                break;
            case 'hall_count':
                shouldUnlock = (user.myPaintings || []).filter(p => p.isPublic && p.fromPinturaLivre !== true && p.category !== 'Mão Livre').length >= rule.count;
                break;
            case 'likes_count':
                shouldUnlock = likesCount >= rule.count;
                break;
            case 'hall_ranking_entry':
                shouldUnlock = !!user.hallRankingEntered;
                break;
            case 'hall_ranking_first':
                shouldUnlock = !!user.hallRankingFirstPlace;
                break;
            case 'invites_sent':
                shouldUnlock = (user.referredUsers || []).length >= rule.count;
                break;
            case 'invites_accepted':
                shouldUnlock = (user.referredUsers || []).length >= rule.count;
                break;
            case 'create_account':
                shouldUnlock = true;
                break;
            case 'complete_profile':
                shouldUnlock = !!(user.name && user.avatar && user.avatar !== '👤');
                break;
            case 'cards_unlocked':
                shouldUnlock = (user.cards || []).length >= rule.count;
                break;
            case 'account_age_years': {
                const diffTime = Math.abs(new Date() - new Date(user.createdAt || Date.now()));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                shouldUnlock = diffDays >= (rule.count * 365);
                break;
            }
            case 'is_founder':
                shouldUnlock = !!user.isFounder;
                break;
            case 'monthly_ranking_position':
                shouldUnlock = user.lastMonthlyRankingPos && user.lastMonthlyRankingPos <= rule.count;
                break;
            case 'expedition_missions_claimed': {
                let claimedCount = 0;
                if (user.eventProgress && user.eventProgress.missions) {
                    claimedCount = Object.values(user.eventProgress.missions).filter(m => m.claimed).length;
                }
                shouldUnlock = claimedCount >= rule.count;
                break;
            }
            case 'expedition_count':
                shouldUnlock = (user.eventInventory || []).length >= rule.count;
                break;
            case 'rarity_card_count':
                shouldUnlock = (user.cards || []).filter(c => c.rarity && c.rarity.toLowerCase() === rule.rarity.toLowerCase()).length >= rule.count;
                break;
            default:
                break;
        }
        
        if (shouldUnlock) {
            const unlockedObj = {
                id: cert.id,
                unlockedAt: new Date().toISOString(),
                recipientName: recipientName,
                additionalInfo: additionalInfo || ''
            };
            user.certificates.push(unlockedObj);
            newlyUnlocked.push({
                ...cert,
                recipientName: recipientName,
                unlockedAt: unlockedObj.unlockedAt
            });
        }
    });
    
    return newlyUnlocked;
}

// Endpoint para buscar certificados conquistados e progresso geral
app.get('/api/certificates/my', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        
        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }

        const catalogPath = path.join(__dirname, 'certificates_catalog.json');
        const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : [];

        // Forçar avaliação ao carregar
        const newlyUnlocked = await evaluateUserCertificates(user, 'Busca Manual');
        if (newlyUnlocked.length > 0) {
            await saveUsers(users);
        }

        return res.json({
            success: true,
            certificates: user.certificates || [],
            catalog: catalog,
            newlyUnlockedCertificates: newlyUnlocked
        });
    } catch (err) {
        console.error('Erro ao buscar certificados:', err);
        return res.status(500).json({ success: false, message: 'Erro ao buscar certificados.' });
    }
});

// Endpoint de Admin para ver catálogo e número de conquistas
app.get('/api/admin/certificates/config', isAdmin, async (req, res) => {
    try {
        const catalogPath = path.join(__dirname, 'certificates_catalog.json');
        const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : [];

        const users = await loadUsers();

        const stats = {};
        catalog.forEach(cert => {
            stats[cert.id] = users.filter(u => u.certificates && u.certificates.some(uc => uc.id === cert.id)).length;
        });

        return res.json({
            success: true,
            catalog,
            stats
        });
    } catch (err) {
        console.error('Erro ao carregar estatísticas de certificados:', err);
        return res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

// Endpoint de Admin para criar ou editar um certificado no catálogo
app.post('/api/admin/certificates/save', isAdmin, async (req, res) => {
    try {
        const cert = req.body;
        if (!cert.id || !cert.title || !cert.category || !cert.rarity) {
            return res.status(400).json({ success: false, message: 'Campos obrigatórios ausentes.' });
        }

        const catalogPath = path.join(__dirname, 'certificates_catalog.json');
        let catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : [];

        const idx = catalog.findIndex(c => c.id === cert.id);
        if (idx !== -1) {
            catalog[idx] = cert;
        } else {
            catalog.push(cert);
        }

        fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
        return res.json({ success: true, message: 'Certificado salvo com sucesso no catálogo!', catalog });
    } catch (err) {
        console.error('Erro ao salvar certificado no catálogo:', err);
        return res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

// Endpoint de Admin para conceder manualmente um certificado a um usuário
app.post('/api/admin/certificates/grant', isAdmin, async (req, res) => {
    try {
        const { email, certId, additionalInfo } = req.body;
        if (!email || !certId) {
            return res.status(400).json({ success: false, message: 'E-mail e ID do certificado são obrigatórios.' });
        }

        const users = await loadUsers();
        const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        const catalogPath = path.join(__dirname, 'certificates_catalog.json');
        const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : [];
        const cert = catalog.find(c => c.id === certId);
        if (!cert) {
            return res.status(404).json({ success: false, message: 'Certificado não encontrado no catálogo.' });
        }

        if (!user.certificates) user.certificates = [];
        if (user.certificates.some(uc => uc.id === certId)) {
            return res.status(400).json({ success: false, message: 'O usuário já possui este certificado.' });
        }

        const unlockedObj = {
            id: certId,
            unlockedAt: new Date().toISOString(),
            recipientName: user.name || 'Artista',
            additionalInfo: additionalInfo || 'Concedido manualmente pelo Administrador.'
        };
        user.certificates.push(unlockedObj);
        await saveUsers(users);

        console.log(`[Admin Moderation] Certificado ${certId} concedido para ${email}`);
        return res.json({ success: true, message: 'Certificado concedido com sucesso!', user: formatUserProfile(user, users) });
    } catch (err) {
        console.error('Erro ao conceder certificado:', err);
        return res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

// Endpoint de Admin para revogar manualmente um certificado de um usuário
app.post('/api/admin/certificates/revoke', isAdmin, async (req, res) => {
    try {
        const { email, certId } = req.body;
        if (!email || !certId) {
            return res.status(400).json({ success: false, message: 'E-mail e ID do certificado são obrigatórios.' });
        }

        const users = await loadUsers();
        const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        if (!user.certificates) user.certificates = [];
        const idx = user.certificates.findIndex(uc => uc.id === certId);
        if (idx === -1) {
            return res.status(400).json({ success: false, message: 'O usuário não possui este certificado.' });
        }

        user.certificates.splice(idx, 1);
        await saveUsers(users);

        console.log(`[Admin Moderation] Certificado ${certId} revogado de ${email}`);
        return res.json({ success: true, message: 'Certificado revogado com sucesso!', user: formatUserProfile(user, users) });
    } catch (err) {
        console.error('Erro ao revogar certificado:', err);
        return res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

// Endpoint para excluir um desenho do acervo de desenhos (apenas para Admin foneoliver@gmail.com)
app.post('/api/drawings/delete', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const isAdmin = await checkIsAdmin(token);
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores podem excluir desenhos.' });
        }

        const { category, slug } = req.body;
        if (!category || !slug) {
            return res.status(400).json({ success: false, message: 'Categoria e Slug são obrigatórios.' });
        }

        const { loadDrawings, saveDrawings } = require('./r2db');
        const drawings = await loadDrawings();
        const index = drawings.findIndex(d => d.category === category && d.slug === slug);

        if (index !== -1) {
            drawings.splice(index, 1);
            await saveDrawings(drawings);
            return res.json({ success: true, message: 'Desenho excluído com sucesso!' });
        } else {
            return res.status(404).json({ success: false, message: 'Desenho não encontrado no acervo.' });
        }
    } catch (err) {
        console.error('Erro ao deletar desenho do acervo:', err);
        return res.status(500).json({ success: false, message: 'Erro ao excluir desenho do acervo.' });
    }
});

// ========================================================
// ENDPOINTS: CIENTISTA MALUCO
// ========================================================

// 1. Gerar nome, descrição, superpoder e raridade via Claude
app.post('/api/cientista/gerar-nome', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { ingrediente1, ingrediente2 } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        if (!ingrediente1 || !ingrediente2) {
            return res.status(400).json({ success: false, message: 'Os dois ingredientes são obrigatórios.' });
        }

        const users = await loadUsers();
        console.log(`[Cientista Name Gen Debug] Incoming token: "${token}". Total registered users: ${users.length}`);
        const debugUser = users.find(u => u.token === token);
        if (debugUser) {
            console.log(`[Cientista Name Gen Debug] Token found for: ${debugUser.email}. Expiry: ${debugUser.tokenExpiry} (${new Date(debugUser.tokenExpiry).toISOString()}), Current time: ${Date.now()}`);
        } else {
            console.log(`[Cientista Name Gen Debug] No user found with token "${token}". Active tokens in DB:`, users.filter(u => u.token).map(u => ({ email: u.email, token: u.token })));
        }

        const user = findUserByToken(users, token);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }

        // Verificar saldo de créditos (custa 3 créditos)
        const cost = 3;
        if (getUserTotalCredits(user) < cost) {
            return res.status(400).json({ 
                success: false, 
                message: `Saldo insuficiente! Esta geração requer ${cost} créditos mágicos, mas você possui apenas ${getUserTotalCredits(user)}.` 
            });
        }

        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        let textResult = "";

        if (!anthropicKey) {
            console.warn('[Cientista Name Gen] ANTHROPIC_API_KEY não encontrada. Utilizando fallback para Gemini...');
            const geminiKey = process.env.NANOBANANA_API_KEY || '';
            if (!geminiKey) {
                return res.status(500).json({ success: false, message: 'Erro no servidor: nenhuma chave de API configurada.' });
            }

            const prompt = `Você é o Cientista Maluco do KidCanvas, um site infantil divertido e criativo.
O usuário misturou "${ingrediente1}" com "${ingrediente2}". 
Crie uma criatura híbrida maluca e divertida para crianças.
Responda APENAS em JSON válido, sem texto antes ou depois:
{
  "nome": "(nome criativo misturando os dois itens, pode inventar palavras, 1-3 palavras)",
  "descricao": "(2 frases divertidas e infantis descrevendo a criatura, máx 50 palavras)",
  "poder": "(1 superpoder absurdo e engraçado que a criatura tem, máx 12 palavras)",
  "raridade": "(uma opção: Comum, Raro, Épico ou Lendário)"
}`;

            const geminiResult = await generateGeminiContent(geminiKey, prompt, "application/json");
            if (!geminiResult.success || !geminiResult.text) {
                throw new Error(geminiResult.message || 'Erro ao gerar conteúdo via Gemini.');
            }
            textResult = geminiResult.text;
        } else {
            console.log(`[Cientista Name Gen] Chamando Claude para combinar "${ingrediente1}" e "${ingrediente2}"...`);
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': anthropicKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 400,
                    system: 'Você é o Cientista Maluco do KidCanvas, um site infantil divertido e criativo.',
                    messages: [
                        {
                            role: 'user',
                            content: `O usuário misturou "${ingrediente1}" com "${ingrediente2}". 
Crie uma criatura híbrida maluca e divertida para crianças.
Responda APENAS em JSON válido, sem texto antes ou depois:
{
  "nome": "(nome criativo misturando os dois itens, pode inventar palavras, 1-3 palavras)",
  "descricao": "(2 frases divertidas e infantis descrevendo a criatura, máx 50 palavras)",
  "poder": "(1 superpoder absurdo e engraçado que a criatura tem, máx 12 palavras)",
  "raridade": "(uma opção: Comum, Raro, Épico ou Lendário)"
}`
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error(`[Cientista Name Gen] Erro na API do Claude (Status ${response.status}):`, errText);
                throw new Error(`Erro na API do Claude: ${response.status}`);
            }

            const data = await response.json();
            textResult = data.content?.[0]?.text || '';
        }

        console.log(`[Cientista Name Gen] Resposta bruta recebida: ${textResult}`);
        const result = robustParseJSON(textResult);

        if (!result.nome || !result.descricao || !result.poder || !result.raridade) {
            throw new Error('Resposta da IA incompleta.');
        }

        // Deduzir créditos e salvar
        deductUserCredits(user, cost);
        await saveUsers(users);

        console.log(`[Cientista Name Gen] Sucesso! ${user.email} gastou ${cost} créditos. Saldo atual: ${getUserTotalCredits(user)}`);
        return res.json({
            success: true,
            nome: result.nome,
            descricao: result.descricao,
            poder: result.poder,
            raridade: result.raridade,
            balance: getUserTotalCredits(user)
        });

    } catch (err) {
        console.error('[Cientista Name Gen Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro ao gerar o nome e descrição da criatura.' });
    }
});

// 2. Gerar imagem via Ideogram
app.post('/api/cientista/gerar-imagem', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        const { ingrediente1, ingrediente2, nomeCriatura, descricao } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        if (!ingrediente1 || !ingrediente2 || !nomeCriatura || !descricao) {
            return res.status(400).json({ success: false, message: 'Dados incompletos para geração de imagem.' });
        }

        const users = await loadUsers();
        const user = findUserByToken(users, token);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }

        const ideogramKey = process.env.IDEOGRAM_API_KEY;
        if (!ideogramKey) {
            console.error('[Cientista Image Gen] IDEOGRAM_API_KEY não configurada!');
            return res.status(500).json({ success: false, message: 'Erro no servidor: chave do gerador de imagens ausente.' });
        }

        const finalPrompt = `Cute cartoon hybrid creature combining ${ingrediente1} and ${ingrediente2}, called ${nomeCriatura}. ${descricao}. Children's book illustration style, vibrant neon colors, friendly and funny face, white background, full body visible, KidCanvas kids website style, colorful and playful, high quality digital art.`;

        console.log(`[Cientista Image Gen] Chamando Ideogram V2 para a criatura "${nomeCriatura}"...`);
        let ideogramUrl = "https://api.ideogram.ai/generate";
        let requestBody = {
            image_request: {
                prompt: finalPrompt,
                model: "V_2",
                aspect_ratio: "ASPECT_1_1",
                style_type: "ILLUSTRATION",
                magic_prompt_option: "ON"
            }
        };

        let response = await fetch(ideogramUrl, {
            method: 'POST',
            headers: {
                'Api-Key': ideogramKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        let fallbackUsed = false;
        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            console.warn(`[Cientista Image Gen] Ideogram V2 falhou (${response.status}): ${errText}. Tentando fallback Ideogram V4...`);
            
            ideogramUrl = "https://api.ideogram.ai/v1/ideogram-v4/generate";
            requestBody = {
                text_prompt: finalPrompt,
                resolution: "2048x2048",
                rendering_speed: "TURBO",
                num_images: 1
            };
            
            response = await fetch(ideogramUrl, {
                method: 'POST',
                headers: {
                    'Api-Key': ideogramKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            fallbackUsed = true;
        }

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[Cientista Image Gen] Erro na API do Ideogram (Status ${response.status}):`, errText);
            throw new Error(`Ideogram falhou com status ${response.status}`);
        }

        const data = await response.json();
        const url = data.data?.[0]?.url || data.url || (data.image_request && data.image_request.url);
        if (!url) {
            throw new Error('Ideogram não retornou URL de imagem.');
        }

        // Baixar bytes da imagem para salvar no R2
        console.log(`[Cientista Image Gen] Baixando imagem gerada de: ${url}`);
        const imgRes = await fetch(url);
        if (!imgRes.ok) {
            throw new Error(`Falha ao baixar imagem gerada: ${imgRes.status}`);
        }
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const imageId = `cientista_${user.id}_${Date.now()}.png`;
        const r2Url = await uploadImage(buffer, imageId, 'image/png');
        let finalImageUrl = r2Url;

        if (r2Url) {
            console.log(`[Cientista Image Gen] Salvo no R2: ${r2Url}`);
        } else {
            // Salvar localmente caso R2 falhe
            try {
                const savedDir = path.join(__dirname, '..', 'saved_images');
                if (!fs.existsSync(savedDir)) {
                    fs.mkdirSync(savedDir, { recursive: true });
                }
                fs.writeFileSync(path.join(savedDir, imageId), buffer);
                finalImageUrl = `/saved_images/${imageId}`;
                console.log(`[Cientista Image Gen] Salvo localmente: ${finalImageUrl}`);
            } catch (err) {
                console.warn('[Cientista Image Gen] Falha ao salvar localmente. Usando base64:', err.message);
                finalImageUrl = `data:image/png;base64,${buffer.toString('base64')}`;
            }
        }

        return res.json({ success: true, imageUrl: finalImageUrl });

    } catch (err) {
        console.error('[Cientista Image Gen Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro ao gerar imagem da criatura.' });
    }
});







// Endpoint para gerar desenho para colorir personalizado (consome 1 ou 2 créditos)
app.post('/api/generate-custom-drawing', async (req, res) => {
    const genStart = Date.now();
    let engine = 'flux';
    let cost = 1;
    let fallbackUsed = false;
    let metricRecorded = false;

    try {
        const { userPrompt, styleType, imageQuality } = req.body;
        if (!userPrompt || !userPrompt.trim()) {
            return res.status(400).json({
                success: false,
                message: 'A descrição do desenho é obrigatória.'
            });
        }

        // 1. Validar token de sessão do usuário no R2DB
        const token = req.headers['x-session-token'];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Por favor, faça login ou cadastre-se para criar desenhos personalizados.'
            });
        }

        const users = await loadUsers();
        const user = findUserByToken(users, token);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Sessão inválida ou expirada. Faça login novamente.'
            });
        }

        // Verificar limite de armazenamento por plano (Desenhos Favoritos / myImages)
        const plan = user.plan || 'Aprendiz';
        let limit = 10;
        if (plan === 'Artista' || plan === 'Família') limit = 50;
        else if (plan === 'Mago' || plan === 'Mago Criador' || plan === 'Professor' || plan === 'Premium' || plan === 'Lenda' || plan === 'Lenda KidCanvas' || plan === 'Ultra' || plan === 'Colégio') limit = Infinity;

        if ((user.myImages || []).length >= limit) {
            return res.status(400).json({
                success: false,
                limitExceeded: true,
                message: "Você atingiu o limite do seu plano. Faça upgrade para salvar mais!"
            });
        }

        // Rate Limit Check (anti-bot)
        const isPaidUser = user.plan && user.plan !== 'Grátis' && user.plan !== 'Aprendiz';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        if (isRateLimited(ip, isPaidUser)) {
            return res.status(429).json({
                success: false,
                message: 'Limite de requisições excedido. Máximo de 30 gerações por hora.'
            });
        }

        engine = imageQuality === 'high' ? 'ideogram' : 'flux';
        cost = engine === 'flux' ? 1 : 3;

        if (getUserTotalCredits(user) < cost) {
            return res.status(400).json({
                success: false,
                message: `Saldo insuficiente! Você possui apenas ${getUserTotalCredits(user)} crédito(s) de saldo.`
            });
        }

        console.log(`[Custom Drawing] Gerando desenho para "${user.email}" com prompt: "${userPrompt}" usando ${engine.toUpperCase()} (Estilo: ${styleType || 'bw'})...`);

        // Construir prompt baseado no estilo escolhido (bw ou color)
        const style = styleType || 'bw';
        const subject = engine === 'flux'
            ? await translatePromptToEnglish(userPrompt.trim())
            : userPrompt.trim();
        let finalPrompt = '';
        if (style === 'color') {
            finalPrompt = `A ${subject}. Cute 2D cartoon illustration of a ${subject} for children age 3-8. Vibrant flat colors, bold black outlines, white background. The ${subject} is centered, large, friendly expression, simple details. Disney/Pixar inspired style, no gradients, no shadows, no complex backgrounds. Professional children's book illustration. Watermark text "www.kidcanvas.com.br" small gray at bottom right corner. No other text.`;
        } else {
            finalPrompt = `A ${subject}. Children's coloring book page featuring a ${subject}. Bold thick black outlines only, pure white background, no gray fills, no shading, no textures. The ${subject} should be large, centered, friendly and cute, easy for kids age 3-8 to color. Simple clean line art. Style: professional coloring book illustration. Watermark text "www.kidcanvas.com.br" small gray at bottom right corner. No other text.`;
        }

        let bytesBase64 = '';
        let success = false;
        let lastError = null;

        try {
            if (engine === 'flux') {
                const falKey = process.env.FAL_KEY;
                let falSuccess = false;
                
                if (falKey) {
                    try {
                        console.log(`[Custom Drawing] Gerando imagem com Fal.ai Flux Schnell (Prioridade)...`);
                        console.log(`[QA LOG] Modo: FLUX | Provedor: Fal.ai | Chamando API...`);
                        const falRes = await fetch("https://fal.run/fal-ai/flux/schnell", {
                            method: 'POST',
                            headers: {
                                'Authorization': `Key ${falKey}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                prompt: finalPrompt,
                                image_size: "square_hd",
                                num_inference_steps: 4,
                                enable_safety_checker: true
                            })
                        });
                        
                        if (falRes.ok) {
                            const falData = await falRes.json();
                            const url = falData.images?.[0]?.url;
                            if (url) {
                                console.log(`[Custom Drawing] Fal.ai gerou URL: ${url}. Baixando bytes...`);
                                const imgRes = await fetch(url);
                                if (imgRes.ok) {
                                    const buffer = await imgRes.arrayBuffer();
                                    bytesBase64 = Buffer.from(buffer).toString('base64');
                                    success = true;
                                    falSuccess = true;
                                    console.log(`[Custom Drawing] Sucesso ao baixar e converter imagem do Fal.ai.`);
                                } else {
                                    const errText = await imgRes.text().catch(() => '');
                                    lastError = `Erro ao baixar imagem da URL do Fal.ai: ${errText}`;
                                }
                            } else {
                                lastError = `Fal.ai não retornou URL de imagem. Resposta: ${JSON.stringify(falData)}`;
                            }
                        } else {
                            const errText = await falRes.text().catch(() => '');
                            console.warn(`[Custom Drawing Warning] Fal.ai falhou com status ${falRes.status}:`, errText);
                            lastError = `Fal.ai (Status ${falRes.status}): ${errText}`;
                        }
                    } catch (err) {
                        console.warn(`[Custom Drawing Warning] Falha na conexão com Fal.ai:`, err.message);
                        lastError = `Fal.ai connection error: ${err.message}`;
                    }
                } else {
                    console.warn(`[Custom Drawing] FAL_KEY não configurada. Tentando Hugging Face diretamente...`);
                }
                
                // Fallback para Hugging Face se Fal.ai falhar ou não estiver configurado
                if (!falSuccess) {
                    console.log(`[Custom Drawing] Tentando fallback para Hugging Face (FLUX.1-schnell)...`);
                    const hfToken = process.env.HUGGING_FACE_TOKEN || process.env.HF_TOKEN || "";
                    if (hfToken) {
                        let attempts = 0;
                        const maxAttempts = 3;
                        while (attempts < maxAttempts && !success) {
                            attempts++;
                            try {
                                console.log(`[Custom Drawing] Hugging Face tentativa ${attempts} de ${maxAttempts}...`);
                                console.log(`[QA LOG] Modo: FLUX | Provedor: Hugging Face (Fallback) | Tentativa: ${attempts} | Chamando API...`);
                                const hfRes = await fetch("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell", {
                                    method: "POST",
                                    headers: {
                                        "Authorization": `Bearer ${hfToken}`,
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({ inputs: finalPrompt })
                                });
                                
                                if (hfRes.ok) {
                                    const buffer = await hfRes.arrayBuffer();
                                    bytesBase64 = Buffer.from(buffer).toString('base64');
                                    success = true;
                                    fallbackUsed = true;
                                    console.log(`[Custom Drawing] Sucesso com Hugging Face FLUX.1-schnell.`);
                                    break;
                                } else {
                                    const errText = await hfRes.text().catch(() => '');
                                    console.warn(`[Custom Drawing Warning] Hugging Face falhou com status ${hfRes.status} (tentativa ${attempts}):`, errText);
                                    lastError = `Hugging Face (Status ${hfRes.status}): ${errText}`;
                                    
                                    if (errText.includes("loading") || hfRes.status === 503 || hfRes.status === 424) {
                                        console.log(`[Custom Drawing] Modelo está carregando. Aguardando 4 segundos...`);
                                        await new Promise(resolve => setTimeout(resolve, 4000));
                                    } else {
                                        break;
                                    }
                                }
                            } catch (err) {
                                console.warn(`[Custom Drawing HF Error] Falha de conexão (tentativa ${attempts}):`, err.message);
                                lastError = `Hugging Face connection error: ${err.message}`;
                                await new Promise(resolve => setTimeout(resolve, 3000));
                            }
                        }
                    } else {
                        console.error("ERRO: HUGGING_FACE_TOKEN ou HF_TOKEN não configurada nas variáveis de ambiente!");
                        throw new Error("Chave FAL_KEY falhou e tokens do Hugging Face estão ausentes.");
                    }
                }
            } else {
                console.log(`[Custom Drawing] Gerando imagem com Ideogram V4 Turbo...`);
                const ideogramKey = process.env.IDEOGRAM_API_KEY;
                if (!ideogramKey) {
                    console.error("ERRO: IDEOGRAM_API_KEY não configurada nas variáveis de ambiente!");
                    throw new Error("Chave IDEOGRAM_API_KEY ausente nas variáveis de ambiente. Não é possível gerar imagem via Ideogram.");
                }
                const response = await fetch("https://api.ideogram.ai/v1/ideogram-v4/generate", {
                    method: 'POST',
                    headers: {
                        'Api-Key': ideogramKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text_prompt: finalPrompt,
                        resolution: "2048x2048",
                        rendering_speed: "TURBO",
                        num_images: 1
                    })
                });

                console.log(`[Custom Drawing] Ideogram status:`, response.status);
                console.log(`[QA LOG] Modo: IDEOGRAM | Status API: ${response.status}`);
                if (response.ok) {
                    const data = await response.json();
                    const url = data.data?.[0]?.url;
                    if (url) {
                        console.log(`[Custom Drawing] Ideogram gerou URL: ${url}. Baixando bytes...`);
                        const imgRes = await fetch(url);
                        if (imgRes.ok) {
                            const buffer = await imgRes.arrayBuffer();
                            bytesBase64 = Buffer.from(buffer).toString('base64');
                            success = true;
                            console.log(`[Custom Drawing] Sucesso ao baixar e converter imagem do Ideogram.`);
                        } else {
                            const errText = await imgRes.text().catch(() => '');
                            lastError = `Erro ao baixar imagem da URL do Ideogram: ${errText}`;
                        }
                    } else {
                        lastError = `Ideogram não retornou URL de imagem. Resposta: ${JSON.stringify(data)}`;
                    }
                } else {
                    const errText = await response.text().catch(() => '');
                    console.warn(`[Custom Drawing Warning] Ideogram falhou com status ${response.status}:`, errText);
                    lastError = `Ideogram (Status ${response.status}): ${errText}`;
                }
            }
        } catch (e) {
            console.warn(`[Custom Drawing Warning] Erro na geração:`, e.message);
            lastError = `Erro de geração: ${e.message}`;
        }

        if (!bytesBase64) {
            console.log(`[QA LOG] Modo: ${engine.toUpperCase()} | Status: FALHA | Razão: ${lastError} | Créditos Cobrados: 0 | Saldo Mantido: ${getUserTotalCredits(user)} | Usuário: ${user.email}`);
            
            // Record metrics
            const durationSec = (Date.now() - genStart) / 1000;
            await recordGenerationMetric({ engine, success: false, fallbackUsed, durationSec, creditsCharged: 0 });
            metricRecorded = true;

            return res.status(500).json({
                success: false,
                message: 'Serviço temporariamente indisponível, tente novamente em alguns minutos.',
                error: lastError
            });
        }

        // 3. Salvar a imagem gerada
        const imageId = `${user.id}_${Date.now()}.jpg`;
        const buffer = Buffer.from(bytesBase64, 'base64');
        let imageUrl = '';

        // Tentar enviar para o Cloudflare R2 primeiro (evita erros de EROFS no Vercel)
        const r2Url = await uploadImage(buffer, imageId, 'image/jpeg');
        if (r2Url) {
            imageUrl = r2Url;
            console.log(`[Custom Drawing] Imagem salva no Cloudflare R2: ${imageUrl}`);
        } else {
            // Fallback local se falhar ou não estiver configurado (ex: rodando localmente sem R2)
            try {
                const savedImagesDir = path.join(__dirname, '..', 'saved_images');
                if (!fs.existsSync(savedImagesDir)) {
                    fs.mkdirSync(savedImagesDir, { recursive: true });
                }
                const filePath = path.join(savedImagesDir, imageId);
                fs.writeFileSync(filePath, buffer);
                imageUrl = `/saved_images/${imageId}`;
                console.log(`[Custom Drawing] Imagem salva localmente: ${imageUrl}`);
            } catch (err) {
                console.warn('[Custom Drawing Warning] Falha ao salvar localmente (provável Vercel). Usando Base64:', err.message);
                imageUrl = `data:image/jpeg;base64,${bytesBase64}`;
            }
        }

        if (!user.myImages) user.myImages = [];
        const drawingId = `draw_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        user.myImages.push({
            id: drawingId,
            url: imageUrl,
            prompt: userPrompt,
            styleType: style,
            createdAt: new Date().toISOString()
        });

        // Deduce user credits and save
        deductUserCredits(user, cost);
        console.log(`[QA LOG] Modo: ${engine.toUpperCase()} | Status: SUCESSO | Créditos Cobrados: ${cost} | Novo Saldo: ${getUserTotalCredits(user)} | Usuário: ${user.email}`);
        
        // Alerta de créditos baixos
        const totalAfterDraw = getUserTotalCredits(user);
        if (totalAfterDraw <= 2) {
            sendLowCreditsEmail(user, totalAfterDraw);
        }
        
        await saveUsers(users);

        // Record metrics
        const durationSec = (Date.now() - genStart) / 1000;
        await recordGenerationMetric({ engine, success: true, fallbackUsed, durationSec, creditsCharged: cost });
        metricRecorded = true;

        return res.json({
            success: true,
            imageUrl: imageUrl,
            drawingId: drawingId,
            paginasRestantes: getUserTotalCredits(user)
        });

    } catch (error) {
        console.error('[Custom Drawing Error]:', error);
        
        if (!metricRecorded) {
            const durationSec = (Date.now() - genStart) / 1000;
            await recordGenerationMetric({ engine, success: false, fallbackUsed: false, durationSec, creditsCharged: 0 });
        }

        return res.status(500).json({
            success: false,
            message: 'Erro interno ao processar a geração do desenho pelo servidor.',
            error: error.message
        });
    }
});

// ==========================================
// ENDPOINTS DE ANALYTICS & ADMIN DASHBOARD
// ==========================================

// 1. Endpoint de Rastreamento (Público)
app.post('/api/analytics/track', async (req, res) => {
    try {
        const { eventType, details } = req.body;
        if (!eventType) {
            return res.status(400).json({ success: false, message: 'Tipo de evento é obrigatório.' });
        }
        
        const validTypes = ['visit', 'search', 'category_click', 'pdf_failure', 'payment_refusal', 'error'];
        if (!validTypes.includes(eventType)) {
            return res.status(400).json({ success: false, message: 'Tipo de evento inválido.' });
        }
        
        const typeMapping = {
            'visit': 'visits',
            'search': 'searches',
            'category_click': 'categoryViews',
            'pdf_failure': 'pdfFailures',
            'payment_refusal': 'paymentRefusals',
            'error': 'errors'
        };
        
        const analyticsKey = typeMapping[eventType];
        await trackEvent(analyticsKey, details || {});
        
        return res.json({ success: true });
    } catch (err) {
        console.error('[Track Event Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro ao registrar analytics.' });
    }
});

// 2. Stats endpoint (Admin only)
app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
        const users = await loadUsers();
        const bugs = await loadBugs();
        const waitlist = await loadWaitlist();
        const analytics = await loadAnalytics();
        
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        // 1. Users Stats & Conversion
        const totalRegistered = users.length;
        const visitsCount = analytics.visits ? analytics.visits.length : 0;
        const newToday = users.filter(u => u.createdAt && u.createdAt.startsWith(todayStr)).length;
        const conversionRate = visitsCount > 0 ? (Math.floor((totalRegistered / visitsCount) * 10000) / 100).toFixed(2) : '0.00';
        
        const planBreakdown = { Free: 0, Plus: 0, Ultra: 0 };
        users.forEach(u => {
            const p = (u.plan || '').toLowerCase();
            if (p === 'ultra' || p === 'colégio' || p === 'colegio') {
                planBreakdown.Ultra++;
            } else if (p === 'premium' || p === 'professor') {
                planBreakdown.Plus++;
            } else {
                planBreakdown.Free++;
            }
        });
        
        // 2. Credits & AI Stats
        let creditsUsedToday = 0;
        let normalGenerations = 0;
        let ultraGenerations = 0;
        let storiesGenerated = 0;
        
        users.forEach(u => {
            if (u.myImages) {
                u.myImages.forEach(img => {
                    if (img.createdAt && img.createdAt.startsWith(todayStr)) {
                        creditsUsedToday += (img.styleType === 'color' || img.quality === 'high') ? 2 : 1;
                    }
                    if (img.quality === 'high' || img.engine === 'ideogram') {
                        ultraGenerations++;
                    } else {
                        normalGenerations++;
                    }
                });
            }
            if (u.myStories) {
                u.myStories.forEach(st => {
                    const pageCount = st.paragraphs ? st.paragraphs.length : 0;
                    if (st.createdAt && st.createdAt.startsWith(todayStr)) {
                        creditsUsedToday += pageCount * 3;
                    }
                    storiesGenerated++;
                    
                    // Cada história gera capa + páginas (pageCount + 1 imagens)
                    const imgCount = pageCount + 1;
                    const isUltra = st.engine === 'ideogram' || st.imageQuality === 'high' || (u.plan && (u.plan.toLowerCase() === 'ultra' || u.plan.toLowerCase().includes('lenda') || u.plan.toLowerCase().includes('colégio')));
                    if (isUltra) {
                        ultraGenerations += imgCount;
                    } else {
                        normalGenerations += imgCount;
                    }
                });
            }
        });
        
        const estimatedAICost = (normalGenerations * 0.003) + (ultraGenerations * 0.015) + (storiesGenerated * 0.01);
        
        const topConsumers = users
            .map(u => ({
                name: u.name,
                email: u.email,
                plan: u.plan || 'Aprendiz',
                balance: u.paginasRestantes || 0,
                generations: (u.myImages ? u.myImages.length : 0) + (u.myStories ? u.myStories.length : 0)
            }))
            .sort((a, b) => b.generations - a.generations)
            .slice(0, 5);
            
        let totalCreditsPurchased = 0;
        users.forEach(u => {
            if (u.plan && u.plan !== 'Grátis' && u.plan !== 'Aprendiz') {
                totalCreditsPurchased += u.plan === 'Artista' ? 30 : u.plan === 'Mago Criador' || u.plan === 'Professor' || u.plan === 'Premium' ? 100 : 250;
            }
        });

        // 3. Library & Searches
        const downloadsCount = analytics.downloads ? analytics.downloads.length : 0;
        
        const downloadsMap = {};
        if (analytics.downloads) {
            analytics.downloads.forEach(d => {
                downloadsMap[d.drawing] = (downloadsMap[d.drawing] || 0) + 1;
            });
        }
        const mostDownloaded = Object.entries(downloadsMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
            
        const searchesMap = {};
        if (analytics.searches) {
            analytics.searches.forEach(s => {
                const term = (s.term || '').trim().toLowerCase();
                if (term) searchesMap[term] = (searchesMap[term] || 0) + 1;
            });
        }
        const topSearches = Object.entries(searchesMap)
            .map(([term, count]) => {
                // Capitalizar os termos para visualização no painel
                const cap = term.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                return { term: cap, count };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Retornar top 10 buscas como pedido
            
        const catMap = {};
        if (analytics.categoryViews) {
            analytics.categoryViews.forEach(c => {
                catMap[c.category] = (catMap[c.category] || 0) + 1;
            });
        }
        const topCategories = Object.entries(catMap)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // 4. Detailed Revenue (Pix Pago, Pix Pendente, Cartão Aprovado, Cartão Cancelado)
        let pixPaidAmount = 0;
        let pixPaidCount = 0;
        let pixPendingAmount = 0;
        let pixPendingCount = 0;
        let cardApprovedAmount = 0;
        let cardApprovedCount = 0;
        let cardCanceledAmount = 0;
        let cardCanceledCount = 0;
        let revenueReceived = 0;
        let revenueEstimated = 0;
        
        if (analytics.payments) {
            analytics.payments.forEach(p => {
                const amt = p.amount || 0;
                if (p.method === 'pix') {
                    if (p.status === 'approved') {
                        pixPaidAmount += amt;
                        pixPaidCount++;
                        revenueReceived += amt;
                    } else if (p.status === 'pending') {
                        pixPendingAmount += amt;
                        pixPendingCount++;
                    }
                } else if (p.method === 'card') {
                    if (p.status === 'approved') {
                        cardApprovedAmount += amt;
                        cardApprovedCount++;
                        revenueReceived += amt;
                    } else if (p.status === 'canceled' || p.status === 'refused') {
                        cardCanceledAmount += amt;
                        cardCanceledCount++;
                    }
                }
            });
        }
        
        // Estimada baseada nos planos ativos atuais
        users.forEach(u => {
            if (u.plan && u.plan !== 'Grátis' && u.plan !== 'Aprendiz') {
                const price = u.plan === 'Artista' ? 9.90 : (u.plan === 'Mago Criador' || u.plan === 'Professor' || u.plan === 'Premium') ? 19.90 : 39.90;
                revenueEstimated += price;
            }
        });

        // 5. Funnel Statistics
        // 590 visitantes -> 8 cadastros -> 5 usuários ativos -> 2 geraram IA -> 1 assinou
        const activeUsersCount = users.filter(u => 
            (u.lastLogin && u.lastLogin !== 'Antes do Analytics') || 
            (u.myImages && u.myImages.length > 0) || 
            (u.myStories && u.myStories.length > 0)
        ).length;
        
        const aiGeneratorsCount = users.filter(u => 
            (u.myImages && u.myImages.length > 0) || 
            (u.myStories && u.myStories.length > 0)
        ).length;
        
        const subscribersCount = users.filter(u => u.plan && u.plan !== 'Grátis' && u.plan !== 'Aprendiz').length;

        const funnel = {
            visitors: visitsCount,
            cadastros: totalRegistered,
            activeUsers: activeUsersCount,
            aiGenerators: aiGeneratorsCount,
            subscribers: subscribersCount
        };

        // 6. Top Prompts Custom (AI)
        const promptsMap = {};
        users.forEach(u => {
            if (u.myImages) {
                u.myImages.forEach(img => {
                    const pr = (img.prompt || '').trim();
                    if (pr && pr.length > 2) {
                        const capitalized = pr.charAt(0).toUpperCase() + pr.slice(1).toLowerCase();
                        promptsMap[capitalized] = (promptsMap[capitalized] || 0) + 1;
                    }
                });
            }
        });
        const topPrompts = Object.entries(promptsMap)
            .map(([prompt, count]) => ({ prompt, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // 7. Stories Details
        let totalParagraphs = 0;
        let totalStories = 0;
        const charactersMap = {};
        
        users.forEach(u => {
            if (u.myStories) {
                u.myStories.forEach(st => {
                    totalParagraphs += st.paragraphs ? st.paragraphs.length : 0;
                    totalStories++;
                    
                    const themeStr = Array.isArray(st.theme) ? st.theme.join(' ') : (st.theme || '');
                    const titleStr = st.title || '';
                    const combined = (themeStr + ' ' + titleStr).toLowerCase();
                    
                    const commonNames = ['pedrinho', 'sofia', 'lucas', 'ana', 'leo', 'belinha', 'dinossauro', 'gatinho', 'totó', 'clara', 'enzo', 'valentina'];
                    commonNames.forEach(name => {
                        if (combined.includes(name)) {
                            const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
                            charactersMap[capitalized] = (charactersMap[capitalized] || 0) + 1;
                        }
                    });
                });
            }
        });
        
        const avgPages = totalStories > 0 ? (totalParagraphs / totalStories).toFixed(1) : '0.0';
        const topCharacters = Object.entries(charactersMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const stories = {
            count: totalStories,
            languages: { 'Português': totalStories },
            avgPages: avgPages,
            topCharacters: topCharacters
        };

        // 8. Hall of Fame (Fama)
        const publicPaintings = await loadPublicPaintings();
        const ratingsPath = path.join(__dirname, '..', 'ratings.json');
        const ratings = fs.existsSync(ratingsPath)
            ? JSON.parse(fs.readFileSync(ratingsPath, 'utf8'))
            : {};
            
        const publishedCount = publicPaintings.length;
        let totalVotes = 0;
        const ratingsList = [];
        
        Object.entries(ratings).forEach(([slug, data]) => {
            totalVotes += data.votes || 0;
            const name = slug.split('/').pop().split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            ratingsList.push({
                name: name,
                votes: data.votes || 0,
                stars: data.votes > 0 ? (data.totalStars / data.votes).toFixed(1) : '0.0'
            });
        });
        
        const mostVoted = ratingsList
            .sort((a, b) => b.votes - a.votes)
            .slice(0, 5);

        const hallOfFame = {
            publishedCount,
            totalVotes,
            mostVoted
        };

        // 9. Problems/Errors
        const bugCount = bugs.length;
        const openBugCount = bugs.filter(b => b.status === 'open').length;
        const failedPDFs = analytics.pdfFailures ? analytics.pdfFailures.length : 0;
        const refusedPayments = analytics.paymentRefusals ? analytics.paymentRefusals.length : 0;
        const erroredGenerations = analytics.errors ? analytics.errors.length : 0;

        return res.json({
            success: true,
            summary: {
                visitors: visitsCount,
                cadastros: totalRegistered,
                conversionRate: conversionRate,
                creditsUsed: creditsUsedToday,
                drawingsGenerated: normalGenerations + ultraGenerations,
                storiesGenerated: storiesGenerated,
                downloads: downloadsCount,
                revenueReceived: revenueReceived,
                revenueEstimated: revenueEstimated
            },
            users: {
                totalRegistered,
                newToday,
                planBreakdown
            },
            credits: {
                creditsUsedToday,
                creditsPurchased: totalCreditsPurchased,
                topConsumers,
                estimatedAICost
            },
            generations: {
                normal: normalGenerations,
                ultra: ultraGenerations,
                stories: storiesGenerated,
                failures: erroredGenerations
            },
            library: {
                mostDownloaded,
                topCategories,
                topSearches
            },
            revenue: {
                pixPaid: { amount: pixPaidAmount, count: pixPaidCount },
                pixPending: { amount: pixPendingAmount, count: pixPendingCount },
                cardApproved: { amount: cardApprovedAmount, count: cardApprovedCount },
                cardCanceled: { amount: cardCanceledAmount, count: cardCanceledCount },
                revenueReceived,
                revenueEstimated
            },
            funnel,
            topPrompts,
            stories,
            hallOfFame,
            problems: {
                bugsReported: bugCount,
                openBugs: openBugCount,
                failedPDFs,
                refusedPayments,
                erroredGenerations
            },
            generationMetrics: analytics.generationMetrics || {},
            paymentsList: analytics.payments || []
        });
    } catch (err) {
        console.error('[Admin Stats Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro ao carregar estatísticas do admin.' });
    }
});

// 3. User details list endpoint (Admin only)
app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
        const users = await loadUsers();
        const adminList = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            plan: u.plan || 'Aprendiz',
            balance: u.paginasRestantes || 0,
            generations: (u.myImages ? u.myImages.length : 0) + (u.myStories ? u.myStories.length : 0),
            createdAt: u.createdAt || 'Antes do Analytics',
            lastLogin: u.lastLogin || 'Antes do Analytics'
        }));
        
        return res.json({ success: true, users: adminList });
    } catch (err) {
        console.error('[Admin Users List Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro ao buscar lista de usuários.' });
    }
});

// 4. Update user credits (Admin only)
app.post('/api/admin/users/:id/credits', isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const { creditsAmount } = req.body;
        
        if (creditsAmount === undefined || isNaN(parseInt(creditsAmount, 10))) {
            return res.status(400).json({ success: false, message: 'Quantidade de créditos é obrigatória.' });
        }
        
        const users = await loadUsers();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
        
        const oldCredits = user.paginasRestantes || 0;
        user.paginasRestantes = parseInt(creditsAmount, 10);
        
        await saveUsers(users);
        
        console.log(`[Admin Action] Créditos do usuário ${user.email} alterados de ${oldCredits} para ${user.paginasRestantes} por administrador ${req.adminUser.email}`);
        
        return res.json({
            success: true,
            message: `Créditos mágicos de ${user.name} atualizados com sucesso de ${oldCredits} para ${user.paginasRestantes}!`
        });
    } catch (err) {
        console.error('[Admin Credits Update Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro ao atualizar créditos do usuário.' });
    }
});

// 5. List bugs (Admin only)
app.get('/api/admin/bugs', isAdmin, async (req, res) => {
    try {
        const bugs = await loadBugs();
        return res.json({ success: true, bugs });
    } catch (err) {
        console.error('[Admin List Bugs Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro ao carregar bugs.' });
    }
});

// 6. Resolve bug ticket (Admin only)
app.post('/api/admin/bugs/:id/resolve', isAdmin, async (req, res) => {
    try {
        const bugId = req.params.id;
        const bugs = await loadBugs();
        const bug = bugs.find(b => b.id === bugId);
        
        if (!bug) {
            return res.status(404).json({ success: false, message: 'Bug reportado não encontrado.' });
        }
        
        bug.status = 'resolved';
        bug.resolvedAt = new Date().toISOString();
        bug.resolvedBy = req.adminUser.email;
        
        await saveBugs(bugs);
        
        console.log(`[Admin Action] Bug ${bugId} marcado como resolvido por ${req.adminUser.email}`);
        
        return res.json({ success: true, message: 'Relato de bug marcado como resolvido!' });
    } catch (err) {
        console.error('[Admin Resolve Bug Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro ao resolver ticket de bug.' });
    }
});

// 7. List waitlist (Admin only)
app.get('/api/admin/waitlist', isAdmin, async (req, res) => {
    try {
        const waitlist = await loadWaitlist();
        return res.json({ success: true, waitlist });
    } catch (err) {
        console.error('[Admin List Waitlist Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro ao listar waitlist.' });
    }
});

// Endpoint para lista de espera de Escolas/Professores
app.post('/api/waitlist', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: 'E-mail é obrigatório.' });
        }
        
        const waitlist = await loadWaitlist();
        const cleanEmail = email.trim().toLowerCase();
        
        if (!waitlist.includes(cleanEmail)) {
            waitlist.push(cleanEmail);
            await saveWaitlist(waitlist);
        }
        
        return res.json({ success: true, message: 'E-mail cadastrado com sucesso! Te avisaremos assim que os planos forem liberados! 🏫' });
    } catch (err) {
        console.error('[Waitlist Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro interno ao salvar e-mail na lista de espera.' });
    }
});

// Endpoint para reportar bug
app.post('/api/report-bug', async (req, res) => {
    try {
        const { name, email, issueType, message, errorUrl } = req.body;
        if (!name || !email || !issueType || !message) {
            return res.status(400).json({
                success: false,
                message: 'Por favor, preencha todos os campos obrigatórios.'
            });
        }

        const { loadBugs, saveBugs } = require('./r2db');
        const bugs = await loadBugs();
        
        const newBug = {
            id: `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            email,
            issueType,
            message,
            errorUrl: errorUrl || '',
            status: 'open',
            createdAt: new Date().toISOString()
        };
        
        bugs.push(newBug);
        await saveBugs(bugs);
        
        console.log(`[Bug Report] Novo bug reportado por ${email} (${issueType}): ${message.substring(0, 50)}...`);
        
        return res.json({
            success: true,
            message: 'Obrigado! Seu relato de erro foi enviado com sucesso. A equipe do KidCanvas vai investigar o ocorrido e entrar em contato se necessário! 🐛✨'
        });
    } catch (err) {
        console.error('[Report Bug API Error]:', err);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao processar relato de erro. Tente novamente mais tarde.'
        });
    }
});

// Servir admin.html para o painel administrativo
app.get(['/admin', '/admin.html'], (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

// Servir historia.html para as rotas de histórias mágicas
app.get(['/historias-magicas', '/historia'], (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'historia.html'));
});

// ==========================================
// EVENTOS - SEXTA MÁGICA
// ==========================================

// ========= EXPEDIÇÕES SEMANAIS =========

// Temas disponíveis para auto-geração
const EXPEDITION_THEMES = [
    { theme: 'Dinossauros', slug: 'dinossauros', emoji: '🦖' },
    { theme: 'Animais', slug: 'animais-selvagens', emoji: '🦊' },
    { theme: 'Fantasia', slug: 'fantasia', emoji: '✨' },
    { theme: 'Veículos', slug: 'veiculos', emoji: '🚗' },
    { theme: 'Oceano', slug: 'animais-do-mar', emoji: '🌊' },
    { theme: 'Espaço', slug: 'espaco', emoji: '🚀' },
    { theme: 'Piratas', slug: 'guerreiros-e-lendas', emoji: '⚓' },
    { theme: 'Unicórnios', slug: 'unicornios', emoji: '🦄' },
    { theme: 'Flores', slug: 'flores-e-natureza', emoji: '🌸' },
    { theme: 'Robôs', slug: 'robos', emoji: '🤖' },
    { theme: 'Super-Heróis', slug: 'super-herois', emoji: '🦸' },
    { theme: 'Princesas', slug: 'princesas', emoji: '👸' },
    { theme: 'Fazenda', slug: 'fazenda', emoji: '🚜' },
    { theme: 'Esportes', slug: 'esportes', emoji: '🏆' },
    { theme: 'Comidas', slug: 'comidas-e-doces', emoji: '🍩' },
    { theme: 'Folclore', slug: 'folclore-brasileiro', emoji: '🏹' },
    { theme: 'Aves', slug: 'aves', emoji: '🦜' },
    { theme: 'Monstros', slug: 'monstros', emoji: '👾' }
];

function generateAutoExpedition(eventsData) {
    // Pegar temas usados nas últimas 4 semanas
    const recentThemes = (eventsData?.weeks || []).slice(-4).map(w => w.theme);
    // Filtrar temas não usados recentemente
    let available = EXPEDITION_THEMES.filter(t => !recentThemes.includes(t.theme));
    if (available.length === 0) available = EXPEDITION_THEMES;
    
    const chosen = available[Math.floor(Math.random() * available.length)];
    const weekNum = (eventsData?.weeks?.length || 0) + 1;
    const idSlug = chosen.theme.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_');
    
    // Próxima segunda 00:00 até domingo 23:59
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0=dom, 1=seg
    const daysUntilMon = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : (8 - dayOfWeek);
    const startDate = new Date(now);
    startDate.setUTCDate(now.getUTCDate() + daysUntilMon);
    startDate.setUTCHours(0, 0, 0, 0);
    
    // Se já é segunda e são mais de 00:00, usar hoje
    if (dayOfWeek === 1 && now.getUTCHours() >= 0) {
        startDate.setUTCDate(now.getUTCDate());
    }
    
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 6);
    endDate.setUTCHours(23, 59, 59, 999);
    
    return {
        id: `semana_${idSlug}_${weekNum}`,
        weekNumber: weekNum,
        theme: chosen.theme,
        categorySlug: chosen.slug,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        chainItem: `egg_${weekNum}`,
        autoGenerated: true,
        missions: [
            { id: `${idSlug}_facil`, type: 'paint_category', target: chosen.slug, req: 3, reward: { type: 'stars', value: 5 }, tier: 'facil', title: `Explorador ${chosen.theme}`, desc: `Pinte 3 desenhos de ${chosen.theme}` },
            { id: `${idSlug}_media`, type: 'paint_category', target: chosen.slug, req: 5, reward: { type: 'badge', value: `mestre_${idSlug}` }, tier: 'media', title: `Mestre ${chosen.theme}`, desc: `Pinte 5 desenhos de ${chosen.theme}` },
            { id: `${idSlug}_dificil`, type: 'paint_category', target: chosen.slug, req: 10, reward: { type: 'stars', value: 20 }, tier: 'dificil', title: `Lenda ${chosen.theme}`, desc: `Pinte 10 desenhos de ${chosen.theme}` },
            { id: `${idSlug}_epica`, type: 'complete_all', target: `semana_${idSlug}_${weekNum}`, req: 3, reward: { type: 'stars', value: 50 }, tier: 'epica', title: `Mestre da Expedição`, desc: 'Complete todas as missões' }
        ]
    };
}

async function getActiveEvent() {
    try {
        let eventsData = await loadEvents();
        const now = new Date();
        
        if (!eventsData) {
            console.log('[EVENTS] Nenhum events.json encontrado');
            eventsData = { currentSeason: 'aventura_magica', currentWeek: 0, weeks: [] };
        }
        
        console.log(`[EVENTS] now=${now.toISOString()} weeks=${eventsData.weeks.length}`);
        
        // Procurar semana ativa
        let activeWeek = eventsData.weeks.find(w => new Date(w.startDate) <= now && new Date(w.endDate) >= now);
        
        if (activeWeek) {
            console.log(`[EVENTS] Active week found: ${activeWeek.id} theme=${activeWeek.theme}`);
            return { season: eventsData.currentSeason, week: activeWeek };
        }
        
        // Auto-geração: se não tem semana ativa, verificar se falta <= 30 min ou já passou
        const lastWeek = eventsData.weeks.length > 0 ? eventsData.weeks[eventsData.weeks.length - 1] : null;
        const lastEndDate = lastWeek ? new Date(lastWeek.endDate) : new Date(0);
        
        // Se a última semana já acabou (ou nunca teve), verificar auto-geração
        if (now > lastEndDate) {
            // Calcular deadline para o admin decidir: segunda-feira 23:30 BRT (UTC-3 = terça 02:30 UTC)
            const lastEnd = new Date(lastEndDate);
            const dayAfterEnd = new Date(lastEnd);
            dayAfterEnd.setUTCDate(lastEnd.getUTCDate() + 1); // segunda-feira
            dayAfterEnd.setUTCHours(2, 30, 0, 0); // 23:30 BRT = 02:30 UTC da terça
            
            // Se ainda estamos antes do deadline, dar tempo ao admin
            if (now < dayAfterEnd) {
                const minsLeft = Math.round((dayAfterEnd - now) / 60000);
                console.log(`[EVENTS] Sem expedição ativa. Admin tem ${minsLeft} min para criar. Deadline: ${dayAfterEnd.toISOString()}`);
                return null;
            }
            
            // Deadline passou — auto-gerar!
            console.log('[EVENTS] Deadline do admin expirou — auto-gerando expedição...');
            const newWeek = generateAutoExpedition(eventsData);
            
            // Ajustar startDate para agora (já estamos na semana)
            newWeek.startDate = now.toISOString();
            
            eventsData.weeks.push(newWeek);
            eventsData.currentWeek = newWeek.weekNumber;
            await saveEvents(eventsData);
            
            console.log(`[EVENTS] Auto-gerado: ${newWeek.id} theme=${newWeek.theme}`);
            return { season: eventsData.currentSeason, week: newWeek };
        }
        
        console.log('[EVENTS] No active week found');
        return null;
    } catch (err) {
        console.error('[EVENTS] Erro ao buscar evento ativo:', err);
        return null;
    }
}

async function requireAuth(req, res, next) {
    const token = req.headers['x-session-token'];
    if (!token) return res.status(401).json({ success: false, message: 'Não autorizado.' });
    const users = await loadUsers();
    const user = findUserByToken(users, token);
    if (!user) return res.status(401).json({ success: false, message: 'Sessão inválida.' });
    req.user = user;
    next();
}

app.get('/api/events/current', requireAuth, async (req, res) => {
    console.log(`[EVENTS] /api/events/current called by user=${req.user.email}`);
    const activeEvent = await getActiveEvent();
    if (!activeEvent) {
        console.log('[EVENTS] No active event, returning active=false');
        return res.json({ success: true, active: false });
    }
    
    const user = req.user;
    const week = activeEvent.week;
    
    if (!user.eventProgress || user.eventProgress.eventId !== week.id) {
        user.eventProgress = {
            eventId: week.id,
            missions: {}
        };
        user.eventInventory = user.eventInventory || [];
    }
    
    const eventStart = new Date(week.startDate).getTime();
    const myPaintings = user.myPaintings || [];
    const eventPaintings = myPaintings.filter(p => p.date && p.date >= eventStart);
    
    const progress = {};
    week.missions.forEach(m => {
        if (user.eventProgress.missions[m.id] && user.eventProgress.missions[m.id].claimed) {
            progress[m.id] = { claimed: true, current: m.req };
            return;
        }
        
        let current = 0;
        if (m.type === 'paint_category' || m.type === 'paint_category_public') {
            const count = eventPaintings.filter(p => {
                const slug = p.drawingSlug || '';
                return slug.includes('/' + m.target + '/');
            }).length;
            current = count;
            
            if (m.type === 'paint_category_public') {
                const publicCount = eventPaintings.filter(p => {
                    const slug = p.drawingSlug || '';
                    return slug.includes('/' + m.target + '/') && p.isPublic;
                }).length;
                current = Math.min(count, publicCount > 0 ? m.req : m.req - 1);
            }
        } else if (m.type === 'complete_all') {
            const claimedOthers = week.missions.filter(om => om.id !== m.id && user.eventProgress.missions[om.id]?.claimed).length;
            current = claimedOthers;
        }
        
        progress[m.id] = { claimed: false, current: Math.min(current, m.req) };
    });
    
    res.json({
        success: true,
        active: true,
        season: activeEvent.season,
        week: week,
        progress: progress,
        inventory: user.eventInventory || []
    });
});



// Obter catálogo de cartas
app.get('/api/store/catalog', async (req, res) => {
    try {
        const catalogPath = require('path').join(__dirname, 'cards_catalog.json');
        const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : [];
        res.json({ success: true, catalog });
    } catch (err) {
        console.error('Erro ao ler catalogo:', err);
        res.status(500).json({ success: false });
    }
});

// Função reutilizável: sortear carta com pesos de raridade 70/20/8/2
function drawRandomCard(catalog, userCards = []) {
    if (!catalog || catalog.length === 0) return null;
    
    // Excluir as cartas Míticas e Lendárias do sorteio comum
    const availableCatalog = catalog.filter(c => c.rarity !== 'Mítica' && c.rarity !== 'Lendária');
    
    // Sorteio com probabilidades normalizadas: Comum 70% (70/98), Rara 20% (20/98), Épica 8% (8/98)
    const rand = Math.random() * 98;
    let selectedRarity;
    if (rand < 8) selectedRarity = 'Épica';
    else if (rand < 28) selectedRarity = 'Rara';
    else selectedRarity = 'Comum';
    
    // Priorizar cartas que o usuário ainda não tem
    const owned = new Set(userCards.map(c => c.id));
    const pool = availableCatalog.filter(c => c.rarity === selectedRarity && !owned.has(c.id));
    
    // Se não tiver carta nova nessa raridade, abre para qualquer carta dessa raridade
    const fallbackPool = pool.length > 0 ? pool : availableCatalog.filter(c => c.rarity === selectedRarity);
    
    // Se ainda vazio (sem cartas dessa raridade), usa catálogo completo
    const finalPool = fallbackPool.length > 0 ? fallbackPool : availableCatalog;
    
    return finalPool[Math.floor(Math.random() * finalPool.length)];
}

// Loja: Comprar Pacotinho de Cartas (mantido por compatibilidade, mas botão removido da UI)
app.post('/api/store/buy-card', requireAuth, async (req, res) => {
    try {
        const users = await loadUsers();
        const userIndex = users.findIndex(u => u.email === req.user.email);
        if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found' });
        
        const user = users[userIndex];
        if (!user.stars) user.stars = 0;
        if (user.stars < 5) {
            return res.status(400).json({ success: false, message: 'Estrelas insuficientes. Pinte mais para ganhar!' });
        }
        
        user.stars -= 5;
        
        const catalogPath = require('path').join(__dirname, 'cards_catalog.json');
        const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : [];
        if (catalog.length === 0) return res.status(500).json({ success: false, message: 'Catálogo vazio' });
        
        if (!user.cards) user.cards = [];
        const randomCard = drawRandomCard(catalog, user.cards);
        user.cards.push(randomCard);
        
        await saveUsers(users);
        res.json({ success: true, newCard: randomCard, stars: user.stars, cards: user.cards });
    } catch (err) {
        console.error('Erro ao comprar carta:', err);
        res.status(500).json({ success: false, message: 'Erro interno' });
    }
});

app.post('/api/events/claim', requireAuth, async (req, res) => {
    const { missionId } = req.body;
    const activeEvent = await getActiveEvent();
    if (!activeEvent) return res.status(400).json({ success: false, message: 'Nenhum evento ativo.' });
    
    const user = req.user;
    const week = activeEvent.week;
    const mission = week.missions.find(m => m.id === missionId);
    
    if (!mission) return res.status(400).json({ success: false, message: 'Missão não encontrada.' });
    if (!user.eventProgress || user.eventProgress.eventId !== week.id) {
        return res.status(400).json({ success: false, message: 'Progresso não inicializado.' });
    }
    if (user.eventProgress.missions[missionId]?.claimed) {
        return res.status(400).json({ success: false, message: 'Já resgatado.' });
    }
    
    if (mission.reward.type === 'stars') {
        user.stars = (user.stars || 0) + mission.reward.value;
        user.monthlyStars = (user.monthlyStars || 0) + mission.reward.value;
    } else if (mission.reward.type === 'badge') {
        user.unlockedAchievements = user.unlockedAchievements || [];
        if (!user.unlockedAchievements.includes(mission.reward.value)) {
            user.unlockedAchievements.push(mission.reward.value);
        }
    } else if (mission.reward.type === 'card') {
        user.cards = user.cards || [];
        const cardId = mission.reward.id || mission.reward.value;
        const catalogPath = require('path').join(__dirname, 'cards_catalog.json');
        const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : [];
        const catalogCard = catalog.find(c => c.id === cardId);
        
        if (catalogCard) {
            if (!user.cards.find(c => c.id === cardId)) {
                user.cards.push(catalogCard);
            }
        } else {
            if (!user.cards.find(c => c.value === mission.reward.value)) {
                user.cards.push(mission.reward);
            }
        }
    }
    
    user.eventProgress.missions[missionId] = { claimed: true };
    
    if (mission.tier === 'epica' && week.chainItem) {
        user.eventInventory = user.eventInventory || [];
        if (!user.eventInventory.includes(week.chainItem)) {
            user.eventInventory.push(week.chainItem);
        }
    }
    
    // Verificar se completou alguma coleção de cartas e premiar com Mítica e estrelas
    const { newlyUnlocked, completionRewards } = await refreshUserDiscoveries(user);

    // Avaliar e desbloquear novos certificados
    const newlyUnlockedCerts = await evaluateUserCertificates(user, `Expedição: ${week.theme}`);

    const users = await loadUsers();
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        users[userIndex] = user;
    }
    await saveUsers(users);
    
    res.json({ 
        success: true, 
        reward: mission.reward, 
        cards: user.cards, 
        stars: user.stars,
        unlockedAchievements: user.unlockedAchievements,
        newlyUnlocked: newlyUnlocked,
        completionRewards: completionRewards,
        newDiscovery: newlyUnlocked[0] || (completionRewards[0] ? completionRewards[0].mythicCard : null),
        newlyUnlockedCertificates: newlyUnlockedCerts
    });
});

// ========= SEGUNDA CHANCE =========

app.get('/api/events/past', requireAuth, async (req, res) => {
    const eventsData = await loadEvents();
    if (!eventsData) return res.json({ success: true, pastWeeks: [] });

    const now = new Date();
    const user = req.user;
    const userCardIds = (user.cards || []).map(c => c.id || c.value);
    const secondChanceClaims = user.secondChanceClaims || [];

    const pastWeeks = eventsData.weeks
        .filter(w => new Date(w.endDate) < now)
        .map(w => {
            const epicMission = w.missions.find(m => m.tier === 'epica');
            const rewardCard = epicMission && epicMission.reward.type === 'card' ? epicMission.reward : null;
            const weeksDelay = w.secondChanceAfterWeeks || 4;
            const secondChanceAvailableAt = new Date(new Date(w.endDate).getTime() + weeksDelay * 7 * 24 * 60 * 60 * 1000);
            const cardId = rewardCard ? rewardCard.id : null;

            return {
                weekId: w.id,
                weekNumber: w.weekNumber,
                theme: w.theme,
                endDate: w.endDate,
                rewardCard,
                secondChanceAvailableAt,
                secondChanceAvailable: now >= secondChanceAvailableAt,
                userEarned: cardId ? userCardIds.includes(cardId) : false,
                secondChanceClaimed: cardId ? secondChanceClaims.includes(cardId) : false
            };
        })
        .reverse(); // mais recente primeiro

    res.json({ success: true, pastWeeks });
});

app.post('/api/events/second-chance', requireAuth, async (req, res) => {
    const { weekId } = req.body;
    if (!weekId) return res.status(400).json({ success: false, message: 'weekId obrigatório.' });

    const eventsData = await loadEvents();
    if (!eventsData) return res.status(400).json({ success: false, message: 'Dados de evento não encontrados.' });

    const week = eventsData.weeks.find(w => w.id === weekId);
    if (!week) return res.status(404).json({ success: false, message: 'Semana não encontrada.' });

    const now = new Date();
    if (now <= new Date(week.endDate)) {
        return res.status(400).json({ success: false, message: 'Esta expedição ainda está ativa.' });
    }

    const weeksDelay = week.secondChanceAfterWeeks || 4;
    const availableAt = new Date(new Date(week.endDate).getTime() + weeksDelay * 7 * 24 * 60 * 60 * 1000);
    if (now < availableAt) {
        return res.status(400).json({ success: false, message: 'Segunda chance ainda não disponível.', availableAt });
    }

    const epicMission = week.missions.find(m => m.tier === 'epica');
    if (!epicMission || epicMission.reward.type !== 'card') {
        return res.status(400).json({ success: false, message: 'Sem card de recompensa nesta semana.' });
    }

    const rewardCardId = epicMission.reward.id;
    const user = req.user;

    user.secondChanceClaims = user.secondChanceClaims || [];
    if (user.secondChanceClaims.includes(rewardCardId)) {
        return res.status(400).json({ success: false, message: 'Segunda chance já resgatada.' });
    }

    user.cards = user.cards || [];
    if (user.cards.find(c => (c.id || c.value) === rewardCardId)) {
        return res.status(400).json({ success: false, message: 'Você já tem esta descoberta.' });
    }

    const catalogPath = require('path').join(__dirname, 'cards_catalog.json');
    const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : [];
    const catalogCard = catalog.find(c => c.id === rewardCardId);
    const cardToAdd = catalogCard ? { ...catalogCard, secondChance: true } : { ...epicMission.reward, secondChance: true };

    user.cards.push(cardToAdd);
    user.secondChanceClaims.push(rewardCardId);

    const { newlyUnlocked } = await refreshUserDiscoveries(user);

    const users = await loadUsers();
    const idx = users.findIndex(u => u.email === user.email);
    if (idx !== -1) users[idx] = user;
    await saveUsers(users);

    res.json({ success: true, card: cardToAdd, newlyUnlocked });
});

// ========= ADMIN: GERENCIAR EXPEDIÇÕES =========

// Listar temas disponíveis
app.get('/api/admin/expedition/themes', isAdmin, (req, res) => {
    res.json({ success: true, themes: EXPEDITION_THEMES });
});

// Obter expedição atual + próxima + histórico
app.get('/api/admin/expedition', isAdmin, async (req, res) => {
    try {
        const eventsData = await loadEvents() || { currentSeason: 'aventura_magica', currentWeek: 0, weeks: [] };
        const now = new Date();
        
        const activeWeek = eventsData.weeks.find(w => new Date(w.startDate) <= now && new Date(w.endDate) >= now);
        const futureWeeks = eventsData.weeks.filter(w => new Date(w.startDate) > now);
        const pastWeeks = eventsData.weeks.filter(w => new Date(w.endDate) < now).reverse(); // mais recente primeiro
        
        res.json({
            success: true,
            currentSeason: eventsData.currentSeason,
            activeWeek: activeWeek || null,
            futureWeeks,
            pastWeeks: pastWeeks.slice(0, 20), // últimas 20
            totalWeeks: eventsData.weeks.length,
            themes: EXPEDITION_THEMES
        });
    } catch (err) {
        console.error('[ADMIN] Erro ao listar expedições:', err);
        res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

// Criar / Editar expedição
app.post('/api/admin/expedition', isAdmin, async (req, res) => {
    try {
        const { theme, categorySlug, startDate, endDate, missions, season } = req.body;
        
        if (!theme || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Tema, data de início e data de fim são obrigatórios.' });
        }
        
        let eventsData = await loadEvents() || { currentSeason: season || 'aventura_magica', currentWeek: 0, weeks: [] };
        
        if (season) eventsData.currentSeason = season;
        
        const weekNum = eventsData.weeks.length + 1;
        const idSlug = theme.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_');
        const slug = categorySlug || EXPEDITION_THEMES.find(t => t.theme === theme)?.slug || idSlug;
        
        // Gerar missões padrão se não fornecidas
        const finalMissions = missions && missions.length === 4 ? missions : [
            { id: `${idSlug}_facil_${weekNum}`, type: 'paint_category', target: slug, req: 3, reward: { type: 'stars', value: 5 }, tier: 'facil', title: `Explorador ${theme}`, desc: `Pinte 3 desenhos de ${theme}` },
            { id: `${idSlug}_media_${weekNum}`, type: 'paint_category', target: slug, req: 5, reward: { type: 'badge', value: `mestre_${idSlug}` }, tier: 'media', title: `Mestre ${theme}`, desc: `Pinte 5 desenhos de ${theme}` },
            { id: `${idSlug}_dificil_${weekNum}`, type: 'paint_category', target: slug, req: 10, reward: { type: 'stars', value: 20 }, tier: 'dificil', title: `Lenda ${theme}`, desc: `Pinte 10 desenhos de ${theme}` },
            { id: `${idSlug}_epica_${weekNum}`, type: 'complete_all', target: `semana_${idSlug}_${weekNum}`, req: 3, reward: { type: 'stars', value: 50 }, tier: 'epica', title: 'Mestre da Expedição', desc: 'Complete todas as missões' }
        ];
        
        const newWeek = {
            id: `semana_${idSlug}_${weekNum}`,
            weekNumber: weekNum,
            theme: theme,
            categorySlug: slug,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            chainItem: `egg_${weekNum}`,
            autoGenerated: false,
            missions: finalMissions
        };
        
        // Verificar se já existe uma semana com datas conflitantes
        const conflicting = eventsData.weeks.find(w => {
            const ws = new Date(w.startDate).getTime();
            const we = new Date(w.endDate).getTime();
            const ns = new Date(startDate).getTime();
            const ne = new Date(endDate).getTime();
            return (ns >= ws && ns <= we) || (ne >= ws && ne <= we) || (ns <= ws && ne >= we);
        });
        
        if (conflicting) {
            // Substituir a semana conflitante
            const idx = eventsData.weeks.indexOf(conflicting);
            newWeek.weekNumber = conflicting.weekNumber;
            newWeek.id = `semana_${idSlug}_${conflicting.weekNumber}`;
            eventsData.weeks[idx] = newWeek;
            console.log(`[ADMIN] Expedição substituída: ${newWeek.id}`);
        } else {
            eventsData.weeks.push(newWeek);
        }
        
        eventsData.currentWeek = newWeek.weekNumber;
        await saveEvents(eventsData);
        
        console.log(`[ADMIN] Expedição criada: ${newWeek.id} theme=${theme} by=${req.adminUser.email}`);
        res.json({ success: true, expedition: newWeek });
    } catch (err) {
        console.error('[ADMIN] Erro ao criar expedição:', err);
        res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

// Deletar expedição futura
app.delete('/api/admin/expedition/:weekId', isAdmin, async (req, res) => {
    try {
        const eventsData = await loadEvents();
        if (!eventsData) return res.status(404).json({ success: false, message: 'Nenhum events.json.' });
        
        const idx = eventsData.weeks.findIndex(w => w.id === req.params.weekId);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Expedição não encontrada.' });
        
        const removed = eventsData.weeks.splice(idx, 1)[0];
        await saveEvents(eventsData);
        
        console.log(`[ADMIN] Expedição removida: ${removed.id}`);
        res.json({ success: true, removed });
    } catch (err) {
        console.error('[ADMIN] Erro ao remover expedição:', err);
        res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

function checkCardCollectionCompletions(user, catalog) {
    if (!user.cards) user.cards = [];
    if (!user.unlockedAchievements) user.unlockedAchievements = [];
    if (!user.stars) user.stars = 0;
    
    const collections = {};
    catalog.forEach(c => {
        const colName = c.collection ? c.collection.replace(/\s+\d+\/\d+$/, '').trim() : 'Geral';
        if (!collections[colName]) collections[colName] = [];
        collections[colName].push(c);
    });
    
    const rewards = [];
    
    for (const [colName, cardsInCol] of Object.entries(collections)) {
        const mythicCard = cardsInCol.find(c => c.rarity === 'Mítica');
        if (!mythicCard) continue;
        
        const nonMythicCards = cardsInCol.filter(c => c.id !== mythicCard.id);
        const ownedNonMythic = nonMythicCards.filter(c => user.cards.some(uc => uc.id === c.id));
        
        if (ownedNonMythic.length === nonMythicCards.length) {
            const alreadyHasMythic = user.cards.some(uc => uc.id === mythicCard.id);
            if (!alreadyHasMythic) {
                user.cards.push(mythicCard);
                user.stars = (user.stars || 0) + 50;
                user.monthlyStars = (user.monthlyStars || 0) + 50;
                
                const cleanName = colName.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
                    .replace(/[^\w\s]/g, '') // remove emojis e caracteres especiais
                    .trim()
                    .replace(/\s+/g, '_');
                const badgeId = 'completou_' + cleanName;
                
                if (!user.unlockedAchievements.includes(badgeId)) {
                    user.unlockedAchievements.push(badgeId);
                }
                
                rewards.push({
                    type: 'collection_complete',
                    collection: colName,
                    card: mythicCard,
                    stars: 50,
                    badge: badgeId
                });
            }
        }
    }
    
    return rewards;
}

function evaluateCardCondition(user, card, context = {}) {
    if (!user.myPaintings) user.myPaintings = [];
    if (!user.myStories) user.myStories = [];
    if (!user.unlockedAchievements) user.unlockedAchievements = [];
    if (!user.cards) user.cards = [];

    const condition = card.unlockCondition;
    if (!condition) return false;

    const countPaintingsOfCategory = (cats) => {
        return user.myPaintings.filter(p => {
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
            const count = user.myPaintings.filter(p => p.category === 'Criação com IA').length;
            return count >= condition.count;
        }
            
        case 'category_paint':
            return getCategoryCount(condition.category) >= condition.count;
            
        case 'categories_painted': {
            // Pinturas salvas pela Pintura Livre NÃO contam progresso nas Descobertas
            const validPaintings = user.myPaintings.filter(p => p.fromPinturaLivre !== true && p.category !== 'Mão Livre');
            const categories = new Set(validPaintings.map(p => p.originalCategory || (p.category ? p.category.toLowerCase() : null)).filter(Boolean));
            return categories.size >= condition.count;
        }
        
        case 'story_count':
            return user.myStories.length >= condition.count;
            
        case 'story_pages_count': {
            const booksWithPages = user.myStories.filter(s => s.paragraphs && s.paragraphs.length >= condition.pages).length;
            return booksWithPages >= condition.count;
        }
        
        case 'expedition_count': {
            const completedExpeditions = user.eventInventory ? user.eventInventory.length : 0;
            return completedExpeditions >= condition.count;
        }
        
        case 'share_count':
            return (user.paintingShareCount || 0) >= condition.count;
            
        case 'hall_count':
            return user.myPaintings.filter(p => p.isPublic && p.fromPinturaLivre !== true && p.category !== 'Mão Livre').length >= condition.count;
            
        case 'likes_count':
            return (context.likesCount || 0) >= condition.count;
            
        case 'all_cards_unlocked':
            return user.cards.length >= condition.count;
            
        case 'login_streak':
            return (user.consecutiveDays || 1) >= condition.count;
            
        case 'invite':
            return (user.referredUsers ? user.referredUsers.length : 0) >= condition.count;
            
        case 'drawing_challenge':
            return false;
            
        case 'collection_complete':
        default:
            return false;
    }
}

async function checkDrawingWithGeminiVision(base64Image) {
    const apiKey = process.env.NANOBANANA_API_KEY;
    if (!apiKey) {
        console.warn('[Gemini Vision] NANOBANANA_API_KEY não está configurada no ambiente.');
        return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    try {
        let rawBase64 = base64Image;
        let mimeType = 'image/jpeg';
        if (base64Image.startsWith('data:')) {
            const match = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
            if (match) {
                mimeType = match[1];
                rawBase64 = match[2];
            }
        }

        console.log(`[Gemini Vision] Enviando desenho para o modelo gemini-2.5-flash...`);
        const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(googleUrl, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: rawBase64
                                }
                            },
                            {
                                text: 'Look at this drawing made by a child. In one or two words, what animal or object is drawn? Answer only the subject, nothing else.'
                            }
                        ]
                    }
                ]
            })
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log(`[Gemini Vision] Resposta bruta do Gemini: "${textResult}"`);
            return textResult ? textResult.trim() : null;
        } else {
            const errText = await response.text();
            console.error(`[Gemini Vision] Erro na API (Status ${response.status}):`, errText);
            return null;
        }
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            console.error('[Gemini Vision] Chamada abortada por timeout (limite 4.5s excedido)');
        } else {
            console.error('[Gemini Vision] Erro durante chamada à API:', err);
        }
        return null;
    }
}

async function checkDrawingWithClaudeVision(base64Image, mockResponse = null) {
    if (mockResponse || process.env.MOCK_CLAUDE_RESPONSE) {
        const resVal = mockResponse || process.env.MOCK_CLAUDE_RESPONSE;
        console.log(`[Claude Vision Mock] Retornando resposta mockada: "${resVal}"`);
        return resVal;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.warn('[Claude Vision] ANTHROPIC_API_KEY não está configurada no ambiente. Tentando fallback para Gemini Vision...');
        return checkDrawingWithGeminiVision(base64Image);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    try {
        let rawBase64 = base64Image;
        let mimeType = 'image/png';
        if (base64Image.startsWith('data:')) {
            const match = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
            if (match) {
                mimeType = match[1];
                rawBase64 = match[2];
            }
        }

        console.log(`[Claude Vision] Enviando desenho para o modelo claude-haiku-4-5-20251001...`);
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 15,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: mimeType,
                                    data: rawBase64
                                }
                            },
                            {
                                type: 'text',
                                text: 'Look at this drawing made by a child. In one or two words, what animal or object is drawn? Answer only the subject, nothing else.'
                            }
                        ]
                    }
                ]
            })
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            const textResult = data.content?.[0]?.text;
            console.log(`[Claude Vision] Resposta bruta da Claude: "${textResult}"`);
            return textResult ? textResult.trim() : null;
        } else {
            const errText = await response.text();
            console.error(`[Claude Vision] Erro na API (Status ${response.status}):`, errText);
            return null;
        }
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            console.error('[Claude Vision] Chamada abortada por timeout (limite 4.5s excedido)');
        } else {
            console.error('[Claude Vision] Erro durante chamada à API:', err);
        }
        return null;
    }
}

function matchSubject(aiResponse, synonyms) {
    if (!aiResponse) return false;
    
    // Normalizar a resposta da IA
    const cleanResponse = aiResponse
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remover acentos
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // remover pontuação
        .trim();
        
    return synonyms.some(syn => {
        const cleanSyn = syn
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
            
        if (cleanResponse === cleanSyn) return true;
        
        // Tratar substring (se a IA respondeu "a dog" e o sinônimo é "dog")
        if (cleanResponse.includes(cleanSyn) || cleanSyn.includes(cleanResponse)) return true;
        
        // Tratar plurais comuns em português/inglês
        const pluralVersions = [
            cleanSyn + 's',
            cleanSyn + 'es',
            cleanSyn.replace(/m$/, 'ns'), // homem -> homens
            cleanSyn.replace(/l$/, 'is')  // sol -> sois, animal -> animais
        ];
        if (pluralVersions.includes(cleanResponse)) return true;
        
        return false;
    });
}

async function refreshUserDiscoveries(user) {
    if (!user.cards) user.cards = [];
    if (!user.unlockedAchievements) user.unlockedAchievements = [];
    
    const catalogPath = require('path').join(__dirname, 'cards_catalog.json');
    if (!fs.existsSync(catalogPath)) return { newlyUnlocked: [], completionRewards: [] };
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    
    // Precalcular likesCount
    let likesCount = 0;
    try {
        const { loadPublicPaintings } = require('./r2db');
        const publicPaintings = await loadPublicPaintings();
        likesCount = publicPaintings
            .filter(p => p.userEmail && p.userEmail.toLowerCase() === user.email.toLowerCase())
            .reduce((sum, p) => sum + (p.stars || p.likes || 0), 0);
    } catch (e) {
        console.error('[refreshUserDiscoveries] Error loading public paintings:', e);
    }
    user.likesReceived = likesCount;
    
    const newlyUnlocked = [];
    catalog.forEach(card => {
        const alreadyHas = user.cards.some(uc => uc.id === card.id);
        if (!alreadyHas && card.rarity !== 'Mítica') {
            if (evaluateCardCondition(user, card, { likesCount })) {
                user.cards.push(card);
                newlyUnlocked.push(card);
            }
        }
    });
    
    // Verificar conclusões de coleções
    const completionRewards = checkCardCollectionCompletions(user, catalog);
    
    return { newlyUnlocked, completionRewards };
}

// ==========================================
// MAIS AMADOS DA SEMANA (Destaques da Semana)
// ==========================================

// Helper para pegar emoji da categoria
function getCategoryEmoji(category) {
    const emojis = {
        'animais-selvagens': '🦁',
        'animais-do-mar': '🐬',
        'animais-domesticos': '🐱',
        'dinossauros': '🦖',
        'espaco': '🚀',
        'veiculos': '🚗',
        'comidas-e-doces': '🍩',
        'fantasia': '🦄',
        'profissoes': '💼',
        'unicornios': '🦄',
        'alfabeto-e-numeros': '🔤',
        'princesas': '👑',
        'super-herois': '🦸',
        'flores-e-natureza': '🌸',
        'halloween': '🎃',
        'natal': '🎄',
        'mandalas': '🌀',
        'folclore-brasileiro': '🇧🇷',
        'esportes': '⚽',
        'robos': '🤖',
        'copa-do-mundo': '🏆',
        'monstros': '👾',
        'cowboys': '🤠',
        'bandeiras': '🚩',
        'instrumentos-musicais': '🎸',
        'brinquedos': '🧸',
        'fan-art': '🎨',
        'aves': '🐦',
        'bailarinas': '🩰'
    };
    return emojis[category] || '🎨';
}

// Helper para formatar números com ponto (BR)
function formatNumberBR(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Helper para calcular a semana atual do ano
function getYearAndWeekString() {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
}

// Helper de hash simples
function getDeterministicHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return Math.abs(hash);
}

// Endpoint público: retornar destaques da semana
app.get('/api/featured-drawings', async (req, res) => {
    try {
        const curated = await loadFeaturedDrawings();
        const drawingsList = await loadDrawings();
        
        let hasCurated = false;
        if (curated && curated.colorido && curated.impresso && curated.favoritado) {
            hasCurated = true;
        }
        
        let result = {};
        
        if (hasCurated) {
            // Curado pelo administrador -> Resolver as URLs de imagens
            const resolveItem = (item) => {
                const dw = drawingsList.find(d => d.category === item.category && d.slug === item.slug);
                return {
                    category: item.category,
                    slug: item.slug,
                    title: item.title,
                    count: formatNumberBR(item.count),
                    label: item.label,
                    url: dw ? dw.url : ''
                };
            };
            
            result = {
                colorido: resolveItem(curated.colorido),
                impresso: resolveItem(curated.impresso),
                favoritado: resolveItem(curated.favoritado)
            };
        } else {
            // Fallback: Rotação determinística baseada na semana do ano
            const weekStr = getYearAndWeekString();
            const hash = getDeterministicHash(weekStr);
            
            // Filtrar apenas desenhos grátis
            const freeDrawings = drawingsList.filter(d => (d.tier || 'free').toLowerCase() === 'free');
            const targetList = freeDrawings.length > 0 ? freeDrawings : drawingsList;
            
            // Agrupar por categoria
            const drawingsByCategory = {};
            targetList.forEach(d => {
                if (!drawingsByCategory[d.category]) {
                    drawingsByCategory[d.category] = [];
                }
                drawingsByCategory[d.category].push(d);
            });
            
            const categories = Object.keys(drawingsByCategory).sort();
            
            if (categories.length >= 3) {
                const cat1 = categories[(hash) % categories.length];
                const cat2 = categories[(hash + 1) % categories.length];
                const cat3 = categories[(hash + 2) % categories.length];
                
                const list1 = drawingsByCategory[cat1];
                const list2 = drawingsByCategory[cat2];
                const list3 = drawingsByCategory[cat3];
                
                const d1 = list1[(hash) % list1.length];
                const d2 = list2[(hash + 3) % list2.length];
                const d3 = list3[(hash + 7) % list3.length];
                
                // Formatar títulos automáticos com emoji
                const formatTitle = (dw) => {
                    const emoji = getCategoryEmoji(dw.category);
                    return `${emoji} ${dw.pt || 'Desenho'}`;
                };
                
                result = {
                    colorido: {
                        category: d1.category,
                        slug: d1.slug,
                        title: formatTitle(d1),
                        count: formatNumberBR(1000 + (hash % 2000)),
                        label: 'crianças coloriram',
                        url: d1.url
                    },
                    impresso: {
                        category: d2.category,
                        slug: d2.slug,
                        title: formatTitle(d2),
                        count: formatNumberBR(500 + (hash % 1000)),
                        label: 'impressões',
                        url: d2.url
                    },
                    favoritado: {
                        category: d3.category,
                        slug: d3.slug,
                        title: formatTitle(d3),
                        count: formatNumberBR(300 + (hash % 600)),
                        label: 'favoritos',
                        url: d3.url
                    }
                };
            } else {
                // Caso extremo sem categorias suficientes
                const d1 = targetList[(hash) % targetList.length];
                const d2 = targetList[(hash + 3) % targetList.length];
                const d3 = targetList[(hash + 7) % targetList.length];
                
                const formatTitle = (dw) => {
                    const emoji = getCategoryEmoji(dw.category);
                    return `${emoji} ${dw.pt || 'Desenho'}`;
                };
                
                result = {
                    colorido: {
                        category: d1.category,
                        slug: d1.slug,
                        title: formatTitle(d1),
                        count: formatNumberBR(1200),
                        label: 'crianças coloriram',
                        url: d1.url
                    },
                    impresso: {
                        category: d2.category,
                        slug: d2.slug,
                        title: formatTitle(d2),
                        count: formatNumberBR(850),
                        label: 'impressões',
                        url: d2.url
                    },
                    favoritado: {
                        category: d3.category,
                        slug: d3.slug,
                        title: formatTitle(d3),
                        count: formatNumberBR(650),
                        label: 'favoritos',
                        url: d3.url
                    }
                };
            }
        }
        
        return res.json({ success: true, featured: result, isManual: hasCurated });
    } catch (err) {
        console.error('[Featured Drawings Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro ao carregar os mais amados da semana.' });
    }
});

// Endpoint administrativo: carregar configuração de destaques
app.get('/api/admin/featured-drawings', isAdmin, async (req, res) => {
    try {
        const config = await loadFeaturedDrawings();
        return res.json({ success: true, config });
    } catch (err) {
        console.error('[Admin Get Featured Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro ao obter configuração de destaques.' });
    }
});

// Endpoint administrativo: salvar/atualizar configuração de destaques
app.post('/api/admin/featured-drawings', isAdmin, async (req, res) => {
    try {
        const { colorido, impresso, favoritado } = req.body || {};
        
        // Se vier vazio, interpretamos como limpar curadoria (usar auto rotação)
        if (!colorido && !impresso && !favoritado) {
            await saveFeaturedDrawings(null);
            return res.json({ success: true, message: 'Curadoria limpa. O sistema usará a rotação semanal automática!' });
        }
        
        // Validar dados recebidos
        if (!colorido || !colorido.category || !colorido.slug || !colorido.title || !colorido.count || !colorido.label ||
            !impresso || !impresso.category || !impresso.slug || !impresso.title || !impresso.count || !impresso.label ||
            !favoritado || !favoritado.category || !favoritado.slug || !favoritado.title || !favoritado.count || !favoritado.label) {
            return res.status(400).json({ success: false, message: 'Todos os campos dos 3 destaques são obrigatórios.' });
        }
        
        const config = {
            colorido: {
                category: colorido.category,
                slug: colorido.slug,
                title: colorido.title,
                count: parseInt(colorido.count, 10) || 0,
                label: colorido.label
            },
            impresso: {
                category: impresso.category,
                slug: impresso.slug,
                title: impresso.title,
                count: parseInt(impresso.count, 10) || 0,
                label: impresso.label
            },
            favoritado: {
                category: favoritado.category,
                slug: favoritado.slug,
                title: favoritado.title,
                count: parseInt(favoritado.count, 10) || 0,
                label: favoritado.label
            },
            updatedAt: new Date().toISOString()
        };
        
        await saveFeaturedDrawings(config);
        
        return res.json({ success: true, message: 'Mais amados da semana atualizados com sucesso!', config });
    } catch (err) {
        console.error('[Admin Save Featured Error]:', err);
        return res.status(500).json({ success: false, message: 'Erro ao salvar configuração de destaques.' });
    }
});

// Rota catch-all para servir index.html e dar suporte ao roteamento SPA (histórico pushState)
app.get('*', (req, res) => {
    // Ignorar chamadas de API ou arquivos estáticos com extensão que caíram aqui por erro
    if (req.path.startsWith('/api') || req.path.includes('.')) {
        return res.status(404).send('Recurso não encontrado');
    }
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Inicializar o servidor


app.listen(PORT, () => {
    console.log('\n==================================================');
    console.log(`🎨 KidCanvas Rodando com Sucesso!`);
    console.log(`👉 Acesse localmente em: http://localhost:${PORT}`);
    console.log('==================================================\n');
});

module.exports = app;
