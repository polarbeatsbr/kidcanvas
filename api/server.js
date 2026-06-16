require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { loadUsers, saveUsers, loadWaitlist, saveWaitlist, hashPassword, uploadImage } = require('./r2db');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;


const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para desenvolvimento local se necessário
app.use(cors());

// Rota Stripe Webhook (deve vir antes do express.json() geral)
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
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

            // Definir os créditos baseados no plano
            let credits = 20; // Família por padrão
            if (planName === 'Professor') {
                credits = 100;
            } else if (planName === 'Colégio') {
                credits = 400;
            }

            user.plan = planName;
            user.paginasRestantes = credits;

            await saveUsers(users);
            console.log(`[SUCCESS] Plano ${planName} ativado para o usuário ${user.email}. Créditos: ${credits}`);
        } catch (dbErr) {
            console.error('Webhook: Erro ao salvar dados do usuário:', dbErr);
            return res.status(500).json({ success: false, message: 'Erro interno ao salvar dados.' });
        }
    }

    return res.json({ received: true });
});

// Middleware para processar JSON
app.use(express.json());

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
        if (planName === 'Família') {
            priceId = process.env.STRIPE_PRICE_FAMILIA || 'price_1TihHMBRjUzKEXHuJAxy50Md';
        } else if (planName === 'Professor') {
            priceId = process.env.STRIPE_PRICE_PROFESSOR || 'price_1TihHNBRjUzKEXHurahkfPYs';
        } else if (planName === 'Colégio') {
            priceId = process.env.STRIPE_PRICE_COLEGIO || 'price_1TihHNBRjUzKEXHuX8SbYRge';
        } else {
            return res.status(400).json({ success: false, message: 'Plano inválido.' });
        }

        if (!priceId) {
            return res.status(500).json({ success: false, message: `Price ID não configurado para o plano ${planName}.` });
        }

        const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;

        console.log(`[Stripe Checkout] Criando sessão para o plano ${planName} e usuário ${user.email}`);
        
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
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
        if (planName === 'Família') {
            amount = 19.90;
        } else if (planName === 'Professor') {
            amount = 39.90;
        } else if (planName === 'Colégio') {
            amount = 119.90;
        } else {
            return res.status(400).json({ success: false, message: 'Plano inválido.' });
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
                if (targetUser && targetUser.plan !== planName) {
                    let credits = 20;
                    if (planName === 'Professor') {
                        credits = 100;
                    } else if (planName === 'Colégio') {
                        credits = 400;
                    }
                    targetUser.plan = planName;
                    targetUser.paginasRestantes = credits;
                    await saveUsers(users);
                    console.log(`[SUCCESS - Polling] Plano ${planName} ativado para o usuário ${targetUser.email}.`);
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
                        let credits = 20;
                        if (planName === 'Professor') {
                            credits = 100;
                        } else if (planName === 'Colégio') {
                            credits = 400;
                        }
                        user.plan = planName;
                        user.paginasRestantes = credits;
                        await saveUsers(users);
                        console.log(`[SUCCESS - Webhook MP] Plano ${planName} ativado para ${user.email} via Pix.`);
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
        const isPaidUser = user.plan && user.plan !== 'Grátis';
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
        const isPaidUser = user.plan && user.plan !== 'Grátis';
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

        // Rate Limit Check (anti-bot)
        const isPaidUser = user.plan && user.plan !== 'Grátis';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        if (isRateLimited(ip, isPaidUser)) {
            return res.status(429).json({
                success: false,
                message: 'Limite de requisições excedido. Máximo de 30 gerações por hora.'
            });
        }

        // Validar permissão de idioma do livro com base no plano do usuário
        const userPlan = user.plan;
        if (bookLang === 'en' && !['Professor', 'Colégio', 'Premium', 'Ultra'].includes(userPlan)) {
            return res.status(400).json({
                success: false,
                message: `O plano ${userPlan} não permite criar livros em inglês. Faça upgrade para o plano Professor ou Colégio!`
            });
        }
        if (bookLang === 'es' && !['Colégio', 'Premium', 'Ultra'].includes(userPlan)) {
            return res.status(400).json({
                success: false,
                message: `O plano ${userPlan} não permite criar livros em espanhol. Faça upgrade para o plano Colégio!`
            });
        }

        const engine = imageQuality === 'medium' ? 'flux' : 'ideogram';
        const cost = engine === 'flux' ? numPages : numPages * 2;

        if (user.paginasRestantes < cost) {
            return res.status(400).json({
                success: false,
                message: `Saldo insuficiente! Esta história requer ${cost} páginas de saldo, mas você possui apenas ${user.paginasRestantes} página(s) de saldo.`
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
                    return url;
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
        user.paginasRestantes -= cost;
        await saveUsers(users);

        return res.json({
            success: true,
            coverUrl: coverUrl,
            paragraphs: finalParagraphs
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
app.get('/api/drawings', (req, res) => {
    const fs = require('fs');

    // Se drawings.json existir, use-o para evitar limite de tamanho da função serverless
    if (fs.existsSync(DRAWINGS_JSON_FILE)) {
        try {
            const data = fs.readFileSync(DRAWINGS_JSON_FILE, 'utf8');
            const drawingsList = JSON.parse(data);
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
            console.error('Erro ao ler drawings.json, usando fallback de varredura:', e);
        }
    }
    
    return res.status(500).json({ success: false, message: 'Arquivo drawings.json não encontrado no servidor.' });
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
            let userPlan = 'Grátis';
            let userCredits = 4;
            if (email === 'foneoliver@gmail.com' || email === 'marcofariaddos@gmail.com' || email === 'sergio0014ortiz@hotmail.com') {
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
            // Force Ultra plan upgrade on login if they are marcofariaddos@gmail.com, foneoliver@gmail.com or sergio0014ortiz@hotmail.com
            const ultraEmails = ['marcofariaddos@gmail.com', 'foneoliver@gmail.com', 'sergio0014ortiz@hotmail.com'];
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
        const users = await loadUsers();
        let user = users.find(u => u.email === email);
        const sessionToken = crypto.randomBytes(16).toString('hex');
        const tokenExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 dias

        let isNewUser = false;
        if (!user) {
            // Criar novo usuário
            let userPlan = 'Grátis';
            let userCredits = 4;
            if (email === 'foneoliver@gmail.com' || email === 'marcofariaddos@gmail.com' || email === 'sergio0014ortiz@hotmail.com') {
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
            isNewUser = true;
            console.log(`[Google Auth] Novo usuário criado: ${email}`);
        } else {
            // Update existing user
            user.googleId = googleId;
            user.name = name;
            if (photo) user.photo = photo;
            user.token = sessionToken;
            user.tokenExpiry = tokenExpiry;
            // Force Ultra plan upgrade on login if they are marcofariaddos@gmail.com, foneoliver@gmail.com or sergio0014ortiz@hotmail.com
            const ultraEmails = ['marcofariaddos@gmail.com', 'foneoliver@gmail.com', 'sergio0014ortiz@hotmail.com'];
            if (ultraEmails.includes(email.toLowerCase()) && user.plan !== 'Ultra') {
                user.plan = 'Ultra';
                user.paginasRestantes = 400;
            }
            console.log(`[Google Auth] Usuário existente logado: ${email}`);
        }

        

        await saveUsers(users);

        return res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                photo: user.photo || '',
                plan: user.plan,
                paginasRestantes: user.paginasRestantes
            },
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
        const users = await loadUsers();
        
        const existingUser = users.find(u => u.email === cleanEmail);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Este e-mail já está cadastrado.' });
        }
        
        const sessionToken = crypto.randomBytes(16).toString('hex');
        let userPlan = 'Grátis';
        let userCredits = 4;
        if (cleanEmail === 'foneoliver@gmail.com' || cleanEmail === 'marcofariaddos@gmail.com' || cleanEmail === 'sergio0014ortiz@hotmail.com') {
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
            tokenExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 dias
        };
        
        users.push(newUser);
        await saveUsers(users);
        
        return res.json({
            success: true,
            user: {
                name: newUser.name,
                email: newUser.email,
                photo: newUser.photo || '',
                plan: newUser.plan,
                paginasRestantes: newUser.paginasRestantes
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
        const users = await loadUsers();
        
        const user = users.find(u => u.email === cleanEmail);
        if (!user || user.passwordHash !== hashPassword(password)) {
            return res.status(400).json({ success: false, message: 'E-mail ou senha incorretos.' });
        }
        
        const sessionToken = crypto.randomBytes(16).toString('hex');
        user.token = sessionToken;
        user.tokenExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 dias
        
        await saveUsers(users);
        
        

        return res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                photo: user.photo || '',
                plan: user.plan,
                paginasRestantes: user.paginasRestantes,
                myImages: user.myImages || [],
                myStories: user.myStories || [],
                myPaintings: user.myPaintings || []
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
        
        

        return res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                photo: user.photo || '',
                plan: user.plan,
                paginasRestantes: user.paginasRestantes,
                myImages: user.myImages || [],
                myStories: user.myStories || [],
                myPaintings: user.myPaintings || []
            }
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
            user: {
                name: user.name,
                email: user.email,
                photo: user.photo || '',
                plan: user.plan,
                paginasRestantes: user.paginasRestantes
            }
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
        const { imageBase64, prompt, isPublic } = req.body;
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Não autorizado.' });
        }
        if (!imageBase64 || !prompt) {
            return res.status(400).json({ success: false, message: 'Imagem e nome do desenho são obrigatórios.' });
        }
        
        const users = await loadUsers();
        const user = users.find(u => u.token === token && u.tokenExpiry > Date.now());
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sessão inválida ou expirada.' });
        }
        
        // Fazer upload da pintura (PNG) para o Cloudflare R2
        const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const filename = `painting_${user.id}_${Date.now()}.png`;
        const r2Url = await uploadImage(buffer, filename, 'image/png');
        
        if (!r2Url) {
            return res.status(500).json({ success: false, message: 'Falha ao salvar imagem de pintura no R2.' });
        }
        
        // Salvar metadados no perfil do usuário
        if (!user.myPaintings) user.myPaintings = [];
        const paintingItem = {
            url: r2Url,
            prompt: prompt,
            date: Date.now(),
            isPublic: !!isPublic
        };
        user.myPaintings.push(paintingItem);
        
        await saveUsers(users);
        console.log(`[Save Painting] Pintura para "${prompt}" salva para "${user.email}". URL: ${r2Url} (Public: ${isPublic})`);
        
        // Se for público, salvar na lista do Hall da Fama
        if (isPublic) {
            const { loadPublicPaintings, savePublicPaintings } = require('./r2db');
            const publicPaintings = await loadPublicPaintings();
            publicPaintings.push({
                url: r2Url,
                prompt: prompt,
                date: Date.now(),
                userEmail: user.email,
                userName: user.email.split('@')[0]
            });
            if (publicPaintings.length > 200) {
                publicPaintings.shift();
            }
            await savePublicPaintings(publicPaintings);
        }

        return res.json({
            success: true,
            imageUrl: r2Url,
            myPaintings: user.myPaintings
        });
    } catch(err) {
        console.error('Erro ao salvar pintura:', err);
        return res.status(500).json({ success: false, message: 'Erro ao salvar a pintura no seu perfil.' });
    }
});

// Endpoint para listar pinturas públicas (Hall da Fama)
app.get('/api/paintings/public', async (req, res) => {
    try {
        const { loadPublicPaintings } = require('./r2db');
        const publicPaintings = await loadPublicPaintings();
        const sorted = [...publicPaintings].reverse();
        return res.json({ success: true, paintings: sorted });
    } catch(err) {
        console.error('Erro ao carregar pinturas públicas:', err);
        return res.status(500).json({ success: false, message: 'Erro ao carregar o Hall da Fama.' });
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

        // Rate Limit Check (anti-bot)
        const isPaidUser = user.plan && user.plan !== 'Grátis';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        if (isRateLimited(ip, isPaidUser)) {
            return res.status(429).json({
                success: false,
                message: 'Limite de requisições excedido. Máximo de 30 gerações por hora.'
            });
        }

        const engine = imageQuality === 'high' ? 'ideogram' : 'flux';
        const cost = engine === 'flux' ? 1 : 2;

        if (user.paginasRestantes < cost) {
            return res.status(400).json({
                success: false,
                message: `Saldo insuficiente! Você possui apenas ${user.paginasRestantes} crédito(s) de saldo.`
            });
        }

        console.log(`[Custom Drawing] Gerando desenho para "${user.email}" com prompt: "${userPrompt}" usando ${engine.toUpperCase()} (Estilo: ${styleType || 'bw'})...`);

        // Construir prompt baseado no estilo escolhido (bw ou color)
        const style = styleType || 'bw';
        let finalPrompt = '';
        if (style === 'color') {
            finalPrompt = `Vibrant 2D children's book illustration cartoon style, detailed and colorful. The drawing shows ${userPrompt.trim()}. Centralized and large, clear objects, friendly characters, simple backgrounds suitable for kids, rich colors, soft lighting. No border, no frame. A large, prominent, and highly visible watermark text 'www.kidcanvas.com.br' in a clean, bold, dark gray font is written at the bottom right corner of the image. No text in the image.`;
        } else {
            finalPrompt = `black and white coloring page, thick outlines, no shading, white background. Digital 2D coloring book page for kids, flat vector line art, black contours. The drawing shows ${userPrompt.trim()}. Centralized and large, no busy backgrounds, simple shapes, clean lines, no gradient, no shadows, no paper texture. No border, no frame. A large, prominent, and highly visible watermark text 'www.kidcanvas.com.br' in a clean, bold, dark gray font is written at the bottom right corner of the image. No other text, no titles in the image. Top-down straight view, no perspective.`;
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
        user.myImages.push({
            url: imageUrl,
            prompt: userPrompt,
            styleType: style,
            createdAt: new Date().toISOString()
        });

        // Deduce user credits and save
        user.paginasRestantes -= cost;
        await saveUsers(users);

        return res.json({
            success: true,
            imageUrl: imageUrl,
            paginasRestantes: user.paginasRestantes
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

// Servir historia.html para as rotas de histórias mágicas
app.get(['/historias-magicas', '/historia'], (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'historia.html'));
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
