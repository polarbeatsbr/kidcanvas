/**
 * KidCanvas Mailer Module
 * Envia emails transacionais via Zoho SMTP (SSL porta 465)
 * Todas as funções são fire-and-forget (não bloqueiam o fluxo principal)
 */

const nodemailer = require('nodemailer');

// ============================================
// CONFIGURAÇÃO DO TRANSPORTER
// ============================================

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;
    
    const host = process.env.ZOHO_SMTP_HOST;
    const port = parseInt(process.env.ZOHO_SMTP_PORT || '465', 10);
    const user = process.env.ZOHO_SMTP_USER;
    const pass = process.env.ZOHO_SMTP_PASS;
    
    if (!host || !user || !pass) {
        console.warn('[Mailer] Variáveis SMTP não configuradas. Emails desabilitados.');
        return null;
    }
    
    transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: true, // SSL
        auth: {
            user: user,
            pass: pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    return transporter;
}

// ============================================
// FUNÇÃO GENÉRICA DE ENVIO (fire-and-forget)
// ============================================

async function sendEmail(to, subject, htmlContent) {
    try {
        const transport = getTransporter();
        if (!transport) {
            console.log(`[Mailer] SMTP não configurado. Email "${subject}" para ${to} ignorado.`);
            return false;
        }
        
        const fromAddress = process.env.ZOHO_SMTP_USER || 'noreply@kidcanvas.com.br';
        
        const result = await transport.sendMail({
            from: `"KidCanvas 🎨" <${fromAddress}>`,
            to: to,
            subject: subject,
            html: htmlContent
        });
        
        console.log(`[Mailer] ✅ Email enviado: "${subject}" → ${to} (ID: ${result.messageId})`);
        return true;
    } catch (err) {
        console.error(`[Mailer] ❌ Falha ao enviar "${subject}" para ${to}:`, err.message);
        return false;
    }
}

// ============================================
// TEMPLATE HTML BASE
// ============================================

const SITE_URL = 'https://www.kidcanvas.com.br';

function baseTemplate(content, previewText) {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>KidCanvas</title>
    <!--[if mso]>
    <style>table, td { border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; }</style>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Nunito', 'Segoe UI', Arial, sans-serif;
            background-color: #f0e6ff;
            color: #2d1b4e;
            line-height: 1.6;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(88, 28, 135, 0.15);
        }
        
        .email-header {
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%);
            padding: 32px 24px;
            text-align: center;
        }
        
        .email-header img {
            max-width: 180px;
            height: auto;
        }
        
        .email-header h1 {
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-top: 8px;
            opacity: 0.9;
        }
        
        .email-body {
            padding: 40px 32px;
        }
        
        .email-body h2 {
            font-size: 24px;
            font-weight: 800;
            color: #581c87;
            margin-bottom: 16px;
        }
        
        .email-body p {
            font-size: 16px;
            color: #4a3660;
            margin-bottom: 16px;
            line-height: 1.7;
        }
        
        .highlight-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
            border-radius: 12px;
            padding: 20px 24px;
            margin: 24px 0;
        }
        
        .highlight-box p {
            color: #92400e;
            font-weight: 600;
            margin: 0;
        }
        
        .info-card {
            background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%);
            border-radius: 16px;
            padding: 24px;
            margin: 24px 0;
        }
        
        .info-card .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(139, 92, 246, 0.15);
        }
        
        .info-card .info-row:last-child {
            border-bottom: none;
        }
        
        .info-card .info-label {
            font-size: 14px;
            color: #6b21a8;
            font-weight: 600;
        }
        
        .info-card .info-value {
            font-size: 16px;
            color: #581c87;
            font-weight: 800;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 700;
            text-align: center;
            margin: 24px 0;
            box-shadow: 0 4px 16px rgba(249, 115, 22, 0.4);
        }
        
        .cta-button:hover {
            background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
        }
        
        .cta-center {
            text-align: center;
            margin: 28px 0;
        }
        
        .emoji-feature {
            font-size: 20px;
            margin-right: 8px;
        }
        
        .feature-list {
            list-style: none;
            padding: 0;
            margin: 20px 0;
        }
        
        .feature-list li {
            padding: 10px 0;
            font-size: 15px;
            color: #4a3660;
            border-bottom: 1px solid #f3e8ff;
        }
        
        .feature-list li:last-child {
            border-bottom: none;
        }
        
        .warning-box {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border-left: 4px solid #ef4444;
            border-radius: 12px;
            padding: 20px 24px;
            margin: 24px 0;
        }
        
        .warning-box p {
            color: #991b1b;
            font-weight: 600;
            margin: 0;
        }
        
        .email-footer {
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
            padding: 32px 24px;
            text-align: center;
        }
        
        .email-footer p {
            color: #c4b5fd;
            font-size: 13px;
            margin-bottom: 8px;
        }
        
        .email-footer a {
            color: #a78bfa;
            text-decoration: none;
        }
        
        .divider {
            height: 3px;
            background: linear-gradient(90deg, #7c3aed, #f97316, #eab308);
            margin: 0;
            border: none;
        }
        
        /* Mobile */
        @media only screen and (max-width: 600px) {
            .email-wrapper { border-radius: 0 !important; }
            .email-body { padding: 24px 20px !important; }
            .email-body h2 { font-size: 20px !important; }
            .email-body p { font-size: 15px !important; }
            .cta-button { padding: 14px 28px !important; font-size: 15px !important; }
        }
    </style>
</head>
<body style="margin:0; padding:20px 0; background-color:#f0e6ff;">
    ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding: 20px 16px;">
                <div class="email-wrapper">
                    <!-- Header -->
                    <div class="email-header">
                        <div style="font-size:32px; font-weight:900; color:#ffffff; letter-spacing:1px;">🎨 <span style="color:#fbbf24;">kid</span>canvas<span style="font-size:18px; opacity:0.7;">.com.br</span></div>
                        <h1>Colorir, Criar, Imaginar</h1>
                    </div>
                    
                    <hr class="divider" />
                    
                    <!-- Body -->
                    <div class="email-body">
                        ${content}
                    </div>
                    
                    <!-- Footer -->
                    <div class="email-footer">
                        <p style="font-size:15px; color:#e0d7ff; margin-bottom:12px;">
                            🎨 <a href="${SITE_URL}" style="color:#c4b5fd; font-weight:600;">www.kidcanvas.com.br</a>
                        </p>
                        <p>© ${new Date().getFullYear()} KidCanvas. Todos os direitos reservados.</p>
                        <p style="font-size:11px; color:#8b5cf6; margin-top:12px;">
                            Este email foi enviado automaticamente. Por favor, não responda.
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// ============================================
// EMAIL: BOAS-VINDAS
// ============================================

function sendWelcomeEmail(user) {
    const firstName = (user.name || 'Artista').split(' ')[0];
    
    const content = `
        <h2>Olá, ${firstName}! 🎉</h2>
        <p>Que alegria ter você no <strong>KidCanvas</strong>! Aqui, a imaginação não tem limites.</p>
        
        <div class="highlight-box">
            <p>🎁 Você ganhou <strong>3 créditos gratuitos</strong> para começar a criar agora mesmo!</p>
        </div>
        
        <p>Veja o que você pode fazer:</p>
        
        <ul class="feature-list">
            <li><span class="emoji-feature">🖌️</span> <strong>Colorir desenhos</strong> — centenas de opções para pintar</li>
            <li><span class="emoji-feature">✨</span> <strong>Gerar desenhos com IA</strong> — crie qualquer coisa que imaginar</li>
            <li><span class="emoji-feature">📖</span> <strong>Criar histórias ilustradas</strong> — livros mágicos personalizados</li>
            <li><span class="emoji-feature">🏆</span> <strong>Colecionar selos</strong> — desbloqueie conquistas especiais</li>
            <li><span class="emoji-feature">🌍</span> <strong>Galeria Comunitária</strong> — compartilhe suas obras de arte</li>
        </ul>
        
        <div class="cta-center">
            <a href="${SITE_URL}" class="cta-button">Começar a Criar! 🚀</a>
        </div>
        
        <p style="font-size:14px; color:#7c3aed;">Dica: convide amigos com seu código de convite e ganhe créditos extras! 🤝</p>
    `;
    
    // Fire-and-forget (sem await)
    sendEmail(
        user.email,
        'Bem-vindo ao KidCanvas! 🎨',
        baseTemplate(content, `Olá ${firstName}! Seus 3 créditos gratuitos estão esperando no KidCanvas.`)
    );
}

// ============================================
// EMAIL: CONFIRMAÇÃO DE PAGAMENTO
// ============================================

function sendPaymentConfirmationEmail(user, planName, totalCredits) {
    const firstName = (user.name || 'Artista').split(' ')[0];
    
    // Determinar detalhes do plano
    let planLabel = planName;
    let planEmoji = '⭐';
    
    if (planName.includes('Artista')) { planLabel = 'Artista'; planEmoji = '🎨'; }
    else if (planName.includes('Mago')) { planLabel = 'Mago Criador'; planEmoji = '🧙'; }
    else if (planName.includes('Lenda')) { planLabel = 'Lenda'; planEmoji = '👑'; }
    else if (planName.includes('Créditos Avulsos')) { planLabel = planName; planEmoji = '💎'; }
    
    const content = `
        <h2>Pagamento Confirmado! 🎉</h2>
        <p>${firstName}, seu pagamento foi processado com sucesso. Seus créditos já estão disponíveis!</p>
        
        <div class="info-card">
            <table width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid rgba(139,92,246,0.15);">
                        <span style="font-size:14px; color:#6b21a8; font-weight:600;">Plano</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid rgba(139,92,246,0.15); text-align:right;">
                        <span style="font-size:16px; color:#581c87; font-weight:800;">${planEmoji} ${planLabel}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0;">
                        <span style="font-size:14px; color:#6b21a8; font-weight:600;">Saldo Atual</span>
                    </td>
                    <td style="padding: 10px 0; text-align:right;">
                        <span style="font-size:16px; color:#581c87; font-weight:800;">🌟 ${totalCredits} créditos</span>
                    </td>
                </tr>
            </table>
        </div>
        
        <div class="highlight-box">
            <p>💡 Seus créditos já estão disponíveis para usar agora mesmo!</p>
        </div>
        
        <div class="cta-center">
            <a href="${SITE_URL}" class="cta-button">Criar Agora! ✨</a>
        </div>
        
        <p style="font-size:14px; color:#7c3aed;">Obrigado por apoiar o KidCanvas! Sua criatividade não tem limites. 💜</p>
    `;
    
    // Fire-and-forget
    sendEmail(
        user.email,
        'Pagamento confirmado! Seus créditos estão disponíveis 🌟',
        baseTemplate(content, `${firstName}, seu pagamento do plano ${planLabel} foi confirmado! ${totalCredits} créditos disponíveis.`)
    );
}

// ============================================
// EMAIL: CRÉDITOS BAIXOS
// ============================================

function sendLowCreditsEmail(user, remainingCredits) {
    const firstName = (user.name || 'Artista').split(' ')[0];
    
    // Evitar spam: não enviar se já enviamos recentemente (flag no user)
    if (user._lowCreditEmailSent && Date.now() - user._lowCreditEmailSent < 24 * 60 * 60 * 1000) {
        return; // Já enviou nas últimas 24h
    }
    user._lowCreditEmailSent = Date.now();
    
    const content = `
        <h2>Seus créditos estão acabando! ⚡</h2>
        <p>${firstName}, você tem apenas <strong>${remainingCredits} crédito${remainingCredits !== 1 ? 's' : ''}</strong> restante${remainingCredits !== 1 ? 's' : ''}.</p>
        
        <div class="warning-box">
            <p>⚠️ Com ${remainingCredits} crédito${remainingCredits !== 1 ? 's' : ''}, você pode gerar apenas mais ${remainingCredits} desenho${remainingCredits !== 1 ? 's' : ''} no modo normal.</p>
        </div>
        
        <p>Recarregue agora e continue criando:</p>
        
        <ul class="feature-list">
            <li><span class="emoji-feature">💎</span> <strong>Créditos Avulsos</strong> — a partir de R$ 4,90 (15 créditos)</li>
            <li><span class="emoji-feature">🎨</span> <strong>Plano Artista</strong> — 35 créditos/mês por R$ 9,90</li>
            <li><span class="emoji-feature">🧙</span> <strong>Plano Mago</strong> — 80 créditos/mês por R$ 19,90</li>
            <li><span class="emoji-feature">👑</span> <strong>Plano Lenda</strong> — 180 créditos/mês por R$ 39,90</li>
        </ul>
        
        <div class="cta-center">
            <a href="${SITE_URL}/planos" class="cta-button">Ver Planos 💳</a>
        </div>
        
        <p style="font-size:14px; color:#7c3aed;">Dica: planos anuais têm 20% de desconto! 🤑</p>
    `;
    
    // Fire-and-forget
    sendEmail(
        user.email,
        'Seus créditos estão acabando! ⚡',
        baseTemplate(content, `${firstName}, você tem apenas ${remainingCredits} crédito(s) no KidCanvas. Recarregue agora!`)
    );
}

// ============================================
// EMAIL: REDEFINIÇÃO DE SENHA
// ============================================

async function sendPasswordResetEmail(user, resetLink) {
    const firstName = (user.name || 'Artista').split(' ')[0];
    
    const content = `
        <h2>Redefinir sua Senha 🔐</h2>
        <p>Olá, ${firstName}! Recebemos um pedido para redefinir a senha da sua conta no KidCanvas.</p>
        
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        
        <div class="cta-center">
            <a href="${resetLink}" class="cta-button" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); box-shadow: 0 4px 16px rgba(124,58,237,0.4);">Redefinir Minha Senha 🔑</a>
        </div>
        
        <div class="highlight-box">
            <p>⏰ Este link expira em <strong>1 hora</strong>. Após esse período, será necessário solicitar um novo link.</p>
        </div>
        
        <div class="warning-box">
            <p>🛡️ Se você <strong>não</strong> solicitou esta redefinição, ignore este email. Sua senha permanecerá a mesma.</p>
        </div>
        
        <p style="font-size:13px; color:#9ca3af; margin-top:24px;">
            Link direto (caso o botão não funcione):<br/>
            <a href="${resetLink}" style="color:#7c3aed; word-break:break-all; font-size:12px;">${resetLink}</a>
        </p>
    `;
    
    // Este é o único que usa await (é crítico para o fluxo)
    return await sendEmail(
        user.email,
        'Redefinir senha KidCanvas 🔐',
        baseTemplate(content, `${firstName}, clique no link para redefinir sua senha do KidCanvas.`)
    );
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendPaymentConfirmationEmail,
    sendLowCreditsEmail,
    sendPasswordResetEmail
};
