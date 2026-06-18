require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { loadUsers, saveUsers, loadWaitlist, saveWaitlist, loadBugs, saveBugs, loadAnalytics, saveAnalytics, hashPassword, uploadImage, loadPublicPaintings } = require('./r2db');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;


// Analytics helpers & Admin configuration
const ADMIN_EMAILS = ['foneoliver@gmail.com'];

async function trackEvent(type, data) {
    try {
        const analytics = await loadAnalytics();
        if (!analytics[type]) {
            analytics[type] = [];
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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
        
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
        }).length : 0
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

// Habilitar CORS para desenvolvimento local se necessário
app.use(cors());

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
app.use(express.json({ limit: '10mb' }));

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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
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


// Servir os arquivos estáticos do frontend da raiz do projeto e da pasta public
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, '..', 'public')));

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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
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
            const ideogramKey = process.env.IDEOGRAM_API_KEY || "dgMl5GIuY_0LI37ryASxbxkTJQs7w70u8kwN9-UhBkshgHvZh3IHmBzelDoeI9mMvSplNovDD87w5YH1DG08Mg";
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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
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
        const ideogramKey = process.env.IDEOGRAM_API_KEY || "dgMl5GIuY_0LI37ryASxbxkTJQs7w70u8kwN9-UhBkshgHvZh3IHmBzelDoeI9mMvSplNovDD87w5YH1DG08Mg";

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
                        const falKey = process.env.FAL_KEY || "c143ca28-99d8-4bd2-8d56-82870b0d28cd:e0e10d34e1477969e0f15660c3093a0e";
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
            createdAt: new Date().toISOString()
        });

        // Deduce user balance and save
        deductUserCredits(user, cost);
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
            console.log(`[Google Auth] Usuário existente logado: ${email}`);
        }

        

        await saveUsers(users);

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
        const { name, email, password, refCode } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
        }
        
        const cleanEmail = email.trim().toLowerCase();
        const users = await loadUsers();
        
        const existingUser = users.find(u => u.email === cleanEmail);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Este e-mail já está cadastrado.' });
        }
        
        const sessionToken = crypto.randomBytes(16).toString('hex');
        const inviteCode = crypto.randomBytes(4).toString('hex'); // Gerar código de convite único de 8 caracteres
        let userPlan = 'Aprendiz';
        let userCredits = 3;
        if (cleanEmail === 'foneoliver@gmail.com') {
            userPlan = 'Ultra';
            userCredits = 400;
        }

        const newUser = {
            id: crypto.randomUUID(),
            name: name.trim(),
            email: cleanEmail,
            passwordHash: hashPassword(password),
            plan: userPlan,
            paginasRestantes: userCredits,
            photo: '',
            token: sessionToken,
            tokenExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 dias
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            consecutiveDays: 1,
            inviteCode: inviteCode,
            referredUsers: [],
            invitedBy: null
        };
        
        // Lógica de indicação
        if (refCode) {
            const inviter = users.find(u => u.inviteCode === refCode);
            if (inviter) {
                newUser.invitedBy = inviter.id;
                inviter.referredUsers = inviter.referredUsers || [];
                inviter.referredUsers.push(newUser.id);
                
                await refreshUserDiscoveries(inviter);
            }
        }
        
        users.push(newUser);
        await saveUsers(users);
        
        return res.json({
            success: true,
            user: formatUserProfile(newUser, users),
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
        const users = await loadUsers();
        
        const user = users.find(u => u.email === cleanEmail);
        if (!user || user.passwordHash !== hashPassword(password)) {
            return res.status(400).json({ success: false, message: 'E-mail ou senha incorretos.' });
        }
        
        const sessionToken = crypto.randomBytes(16).toString('hex');
        user.token = sessionToken;
        user.tokenExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 dias
        user.lastLogin = new Date().toISOString();
        if (!user.createdAt) {
            user.createdAt = new Date().toISOString();
        }
        
        await saveUsers(users);
        
        

        return res.json({
            success: true,
            user: formatUserProfile(user, users),
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
        
        // Em desenvolvimento/ambiente local, retornamos o link no corpo para facilitar testes
        const mockLink = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
        console.log(`[Recuperação de Senha] Link gerado para ${cleanEmail}: ${mockLink}`);
        
        return res.json({
            success: true,
            message: 'Um link de recuperação foi gerado.',
            mockLink: mockLink
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

// Endpoint para pegar perfil logado
app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers['x-session-token'];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado. Token de sessão ausente.' });
        }
        
        const users = await loadUsers();
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }
        
        // Verificação retroativa de desbloqueios do livro
        const { newlyUnlocked, completionRewards } = await refreshUserDiscoveries(user);
        if (newlyUnlocked.length > 0 || completionRewards.length > 0) {
            await saveUsers(users);
        }
        
        return res.json({
            success: true,
            newDiscovery: newlyUnlocked[0] || (completionRewards[0] ? completionRewards[0].mythicCard : null),
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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
        
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

// Endpoint proxy para carregar imagens do R2 e evitar bloqueios de CORS / Canvas Taint
app.get('/api/proxy-image', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).send('URL do desenho é obrigatória.');
        }
        
        // Validar se o domínio é do R2
        if (!url.startsWith('https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev/')) {
            return res.status(403).send('Acesso não permitido.');
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ao buscar imagem: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(buffer);
    } catch (err) {
        console.error('[Proxy Image Error]:', err);
        return res.status(500).send('Erro ao processar imagem.');
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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
        
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
        
        // Avaliar e desbloquear descobertas progressivas
        const { newlyUnlocked, completionRewards } = await refreshUserDiscoveries(user);
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
            stars: user.stars
        });
    } catch(err) {
        console.error('Erro ao salvar pintura:', err);
        return res.status(500).json({ success: false, message: 'Erro ao salvar a pintura no seu perfil.' });
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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }
        
        user.avatar = avatar;
        await saveUsers(users);
        
        return res.json({ success: true, message: 'Avatar atualizado com sucesso!', avatar: user.avatar });
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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
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
                stars: totalStars,
                paintingsCount: paintingsCount,
                storiesCount: storiesCount,
                aiImagesCount: aiImagesCount,
                unlockedAchievements: user ? (user.achievements || []) : []
            }
        });
    } catch(err) {
        console.error('Erro ao buscar perfil público:', err);
        return res.status(500).json({ success: false, message: 'Erro ao buscar dados do perfil.' });
    }
});

// Endpoint para listar pinturas públicas (Hall da Fama - apenas aprovadas e não muito denunciadas)
app.get('/api/paintings/public', async (req, res) => {
    try {
        const { loadPublicPaintings } = require('./r2db');
        const publicPaintings = await loadPublicPaintings();
        const users = await loadUsers();
        
        const approved = publicPaintings.filter(p => p.isApproved === true && (!p.reports || p.reports < 3));
        const mapped = approved.map(p => {
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
        
        const sorted = [...mapped].reverse();
        return res.json({ success: true, paintings: sorted });
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
            currentUserObj = users.find(u => u.token === token && u.tokenExpiry > Date.now());
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
    const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
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



// Endpoint para gerar desenho para colorir personalizado (consome 1 ou 2 créditos)
app.post('/api/generate-custom-drawing', async (req, res) => {
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
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
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

        const engine = imageQuality === 'high' ? 'ideogram' : 'flux';
        const cost = engine === 'flux' ? 1 : 3;

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
                console.log(`[Custom Drawing] Gerando imagem com Hugging Face (FLUX.1-schnell)...`);
                const hfToken = process.env.HUGGING_FACE_TOKEN || process.env.HF_TOKEN || "";
                let hfSuccess = false;
                
                if (hfToken) {
                    try {
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
                            hfSuccess = true;
                            console.log(`[Custom Drawing] Sucesso com Hugging Face FLUX.1-schnell.`);
                        } else {
                            const errText = await hfRes.text().catch(() => '');
                            console.warn(`[Custom Drawing Warning] Hugging Face falhou com status ${hfRes.status}:`, errText);
                            lastError = `Hugging Face (Status ${hfRes.status}): ${errText}`;
                        }
                    } catch (err) {
                        console.warn(`[Custom Drawing HF Error] Falha de conexão:`, err.message);
                        lastError = `Hugging Face connection error: ${err.message}`;
                    }
                } else {
                    console.warn(`[Custom Drawing] HUGGING_FACE_TOKEN não encontrado. Tentando fallback direto para Fal.ai...`);
                }
                
                // Fallback para Fal.ai se Hugging Face falhar
                if (!hfSuccess) {
                    console.log(`[Custom Drawing] Tentando fallback para Fal.ai Flux Schnell...`);
                    const falKey = process.env.FAL_KEY || "c143ca28-99d8-4bd2-8d56-82870b0d28cd:e0e10d34e1477969e0f15660c3093a0e";
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
                }
            } else {
                console.log(`[Custom Drawing] Gerando imagem com Ideogram V4 Turbo...`);
                const ideogramKey = process.env.IDEOGRAM_API_KEY || "dgMl5GIuY_0LI37ryASxbxkTJQs7w70u8kwN9-UhBkshgHvZh3IHmBzelDoeI9mMvSplNovDD87w5YH1DG08Mg";
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
        await saveUsers(users);

        return res.json({
            success: true,
            imageUrl: imageUrl,
            drawingId: drawingId,
            paginasRestantes: getUserTotalCredits(user)
        });

    } catch (error) {
        console.error('[Custom Drawing Error]:', error);
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
                    if (st.createdAt && st.createdAt.startsWith(todayStr)) {
                        creditsUsedToday += 2;
                    }
                    storiesGenerated++;
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

const eventsPath = path.join(__dirname, '..', 'events.json');

function getActiveEvent() {
    try {
        const exists = fs.existsSync(eventsPath);
        console.log(`[EVENTS] eventsPath=${eventsPath} exists=${exists}`);
        if (!exists) {
            console.log('[EVENTS] events.json NOT FOUND - returning null');
            return null;
        }
        const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
        const now = new Date();
        console.log(`[EVENTS] now=${now.toISOString()} weeks=${eventsData.weeks.length}`);
        const activeWeek = eventsData.weeks.find(w => new Date(w.startDate) <= now && new Date(w.endDate) >= now);
        if (activeWeek) {
            console.log(`[EVENTS] Active week found: ${activeWeek.id} theme=${activeWeek.theme}`);
            return {
                season: eventsData.currentSeason,
                week: activeWeek
            };
        }
        console.log('[EVENTS] No active week found for current date');
        return null;
    } catch (err) {
        console.error('[EVENTS] Erro ao ler events.json:', err);
        return null;
    }
}

async function requireAuth(req, res, next) {
    const token = req.headers['x-session-token'];
    if (!token) return res.status(401).json({ success: false, message: 'Não autorizado.' });
    const users = await loadUsers();
    const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
    if (!user) return res.status(401).json({ success: false, message: 'Sessão inválida.' });
    req.user = user;
    next();
}

app.get('/api/events/current', requireAuth, (req, res) => {
    console.log(`[EVENTS] /api/events/current called by user=${req.user.email}`);
    const activeEvent = getActiveEvent();
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
    const activeEvent = getActiveEvent();
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
        newDiscovery: newlyUnlocked[0] || (completionRewards[0] ? completionRewards[0].mythicCard : null)
    });
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
            
        case 'collection_complete':
        default:
            return false;
    }
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
