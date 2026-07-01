const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const supabase = require('./db');

// Caminho do backup local
const LOCAL_USERS_FILE = path.join(__dirname, '..', 'users.json');

let s3Client = null;
const bucketName = process.env.R2_BUCKET_NAME;

if (process.env.R2_ENDPOINT_URL && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    try {
        s3Client = new S3Client({
            endpoint: process.env.R2_ENDPOINT_URL,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
            region: 'auto',
        });
        console.log('[R2DB] Cliente S3 inicializado com sucesso.');
    } catch (e) {
        console.error('[R2DB] Falha ao inicializar o cliente S3:', e.message);
    }
} else {
    console.warn('[R2DB] Credenciais R2 não encontradas no .env. Usando apenas armazenamento local users.json.');
}

// Helper para converter stream em string
function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}

const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_URL.includes('placeholder');

async function loadUsers() {
    if (useSupabase) {
        try {
            console.log(`[R2DB] Lendo banco de dados do Supabase...`);
            const { data: dbUsers, error: usersErr } = await supabase.from('users').select('*');
            if (usersErr) throw usersErr;

            const { data: dbDrawings, error: drawingsErr } = await supabase.from('drawings').select('*');
            if (drawingsErr) throw drawingsErr;

            const { data: dbCards, error: cardsErr } = await supabase.from('cards').select('*');
            if (cardsErr) throw cardsErr;

            const { data: dbAchievements, error: achievementsErr } = await supabase.from('achievements').select('*');
            if (achievementsErr) throw achievementsErr;

            const { data: dbSessions, error: sessionsErr } = await supabase.from('sessions').select('*');
            if (sessionsErr) throw sessionsErr;

            let dbBestiary = [];
            try {
                const { data, error } = await supabase.from('bestiary').select('*');
                if (!error && data) {
                    dbBestiary = data;
                }
            } catch (e) {
                console.warn('[R2DB] Tabela bestiary nao pode ser lida do Supabase (pode nao existir):', e.message);
            }

            const returnUsers = [];
            dbUsers.forEach(dbUser => {
                const drawings = dbDrawings.filter(d => d.user_id === dbUser.id).map(d => ({
                    drawingId: d.id,
                    title: d.title,
                    imageUrl: d.image_url,
                    url: d.image_url,
                    thumbnailUrl: d.thumbnail_url,
                    category: d.category,
                    templateId: d.template_id,
                    createdAt: d.created_at
                }));
                const cards = dbCards.filter(c => c.user_id === dbUser.id).map(c => ({
                    id: c.card_id,
                    name: c.card_name,
                    rarity: c.rarity,
                    obtainedAt: c.obtained_at
                }));
                const achievements = dbAchievements.filter(a => a.user_id === dbUser.id).map(a => a.achievement_id);
                const bestiary = dbBestiary.filter(b => b.user_id === dbUser.id).map(b => ({
                    id: b.id,
                    name: b.name,
                    description: b.description,
                    power: b.power,
                    rarity: b.rarity,
                    imageUrl: b.image_url,
                    ingredient1: b.ingredient_1,
                    ingredient2: b.ingredient_2,
                    createdAt: b.created_at
                }));

                const baseUserObj = {
                    id: dbUser.id,
                    email: dbUser.email,
                    passwordHash: dbUser.password_hash,
                    username: dbUser.username,
                    plan: dbUser.plan,
                    stars: dbUser.stars,
                    avatarUrl: dbUser.avatar_url,
                    myPaintings: drawings,
                    cards: cards,
                    achievements: achievements,
                    bestiary: bestiary,
                    paginasRestantes: dbUser.stars,
                    createdAt: dbUser.created_at,
                    lastLogin: dbUser.updated_at
                };

                const userSessions = dbSessions.filter(s => s.user_id === dbUser.id && new Date(s.expires_at) > new Date());
                if (userSessions.length > 0) {
                    userSessions.forEach(session => {
                        returnUsers.push({
                            ...baseUserObj,
                            token: session.token_hash,
                            tokenExpiry: new Date(session.expires_at).getTime()
                        });
                    });
                } else {
                    returnUsers.push({
                        ...baseUserObj,
                        token: null,
                        tokenExpiry: null
                    });
                }
            });

            return returnUsers;
        } catch (err) {
            console.error('[R2DB] Falha ao carregar dados do Supabase (usando fallback local):', err.message);
        }
    }

    // 2. Fallback: Ler localmente (sincronizando com o R2 se disponível)
    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Lendo users.json do Cloudflare R2...`);
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: 'users.json',
            });
            const response = await s3Client.send(command);
            const dataStr = await streamToString(response.Body);
            try {
                fs.writeFileSync(LOCAL_USERS_FILE, dataStr, 'utf8');
            } catch(e) {}
            return JSON.parse(dataStr);
        } catch (err) {
            if (err.name === 'NoSuchKey' || err.code === 'NoSuchKey' || err.message.includes('NoSuchKey')) {
                console.log('[R2DB] Arquivo users.json não existe no bucket R2. Usando local do build.');
            } else {
                console.error('[R2DB] Erro ao carregar users do R2 (usando fallback local):', err.message);
            }
        }
    }

    if (fs.existsSync(LOCAL_USERS_FILE)) {
        try {
            const dataStr = fs.readFileSync(LOCAL_USERS_FILE, 'utf8');
            return JSON.parse(dataStr);
        } catch (e) {
            console.error('[R2DB] Erro ao ler users.json local:', e.message);
        }
    }
    return [];
}

async function saveUsers(users) {
    if (useSupabase) {
        try {
            console.log(`[R2DB] Salvando dados no Supabase...`);
            const processedIds = new Set();
            for (const user of users) {
                if (processedIds.has(user.id)) continue;
                processedIds.add(user.id);

                // 1. Salvar ou atualizar usuário
                const { error: userErr } = await supabase.from('users').upsert({
                    id: user.id,
                    email: user.email.toLowerCase(),
                    password_hash: user.passwordHash || user.password,
                    username: user.username || user.name || user.email.split('@')[0],
                    plan: user.plan || 'free',
                    stars: user.stars || user.paginasRestantes || 0,
                    avatar_url: user.avatarUrl || user.photo || null
                });
                if (userErr) throw userErr;

                // 2. Sincronizar desenhos (deleta e re-insere)
                await supabase.from('drawings').delete().eq('user_id', user.id);
                const drawings = user.myPaintings || user.drawings || [];
                if (drawings.length > 0) {
                    const dbDrawings = drawings.map(d => ({
                        user_id: user.id,
                        title: d.title || d.prompt || 'Sem título',
                        image_url: d.imageUrl || d.url,
                        thumbnail_url: d.thumbnailUrl || d.url,
                        category: d.category,
                        template_id: d.templateId,
                        created_at: d.createdAt || new Date().toISOString()
                    }));
                    const { error: drwErr } = await supabase.from('drawings').insert(dbDrawings);
                    if (drwErr) throw drwErr;
                }

                // 3. Sincronizar cartas
                await supabase.from('cards').delete().eq('user_id', user.id);
                const cards = user.cards || [];
                if (cards.length > 0) {
                    const dbCards = cards.map(c => ({
                        user_id: user.id,
                        card_id: c.id || c.cardId,
                        card_name: c.name || c.cardName,
                        rarity: c.rarity || 'comum',
                        obtained_at: c.obtainedAt || new Date().toISOString()
                    }));
                    const { error: crdErr } = await supabase.from('cards').insert(dbCards);
                    if (crdErr) throw crdErr;
                }

                // 4. Sincronizar conquistas
                await supabase.from('achievements').delete().eq('user_id', user.id);
                const achievements = user.achievements || [];
                if (achievements.length > 0) {
                    const dbAchievements = achievements.map(a => ({
                        user_id: user.id,
                        achievement_id: a.achievementId || a,
                        unlocked_at: new Date().toISOString()
                    }));
                    const { error: achErr } = await supabase.from('achievements').insert(dbAchievements);
                    if (achErr) throw achErr;
                }

                // 5. Sincronizar sessões ativas criadas de forma legada (se houver token)
                if (user.token) {
                    const tokenHash = user.token.length === 64 ? user.token : crypto.createHash('sha256').update(user.token).digest('hex');
                    const expiresAt = user.tokenExpiry ? new Date(user.tokenExpiry).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                    await supabase.from('sessions').upsert({
                        user_id: user.id,
                        token_hash: tokenHash,
                        expires_at: expiresAt,
                        user_agent: 'legacy_compatibility',
                        ip_address: '127.0.0.1'
                    });
                }

                // 6. Sincronizar bestiário
                try {
                    await supabase.from('bestiary').delete().eq('user_id', user.id);
                    const bestiary = user.bestiary || [];
                    if (bestiary.length > 0) {
                        const dbBestiary = bestiary.map(b => ({
                            id: b.id,
                            user_id: user.id,
                            name: b.name,
                            description: b.description,
                            power: b.power,
                            rarity: b.rarity,
                            image_url: b.imageUrl || b.image_url,
                            ingredient_1: b.ingredient1 || b.ingredient_1,
                            ingredient_2: b.ingredient2 || b.ingredient_2,
                            created_at: b.createdAt || b.created_at || new Date().toISOString()
                        }));
                        const { error: bestiaryErr } = await supabase.from('bestiary').insert(dbBestiary);
                        if (bestiaryErr) throw bestiaryErr;
                    }
                } catch (e) {
                    console.warn('[R2DB] Erro ao sincronizar bestiary no Supabase (pode ser que a tabela nao exista):', e.message);
                }
            }
            console.log('[R2DB] Sincronização com o Supabase concluída com sucesso.');
            return true;
        } catch (err) {
            console.error('[R2DB] Erro ao salvar no Supabase (usando fallback local):', err.message);
        }
    }

    // Fallback: Salvar localmente e no R2
    const dataStr = JSON.stringify(users, null, 2);
    try {
        fs.writeFileSync(LOCAL_USERS_FILE, dataStr, 'utf8');
        console.log('[R2DB] Backup local de users.json gravado com sucesso.');
    } catch (e) {
        console.error('[R2DB] Falha ao gravar cópia local de backup:', e.message);
    }

    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Enviando users.json atualizado para o Cloudflare R2...`);
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: 'users.json',
                Body: dataStr,
                ContentType: 'application/json',
            });
            await s3Client.send(command);
            console.log('[R2DB] Banco de dados users.json persistido no R2.');
            return true;
        } catch (err) {
            console.error('[R2DB] Falha crítica ao persistir users no R2:', err.message);
        }
    }
    return true;
}

// Caminho do waitlist local
const LOCAL_WAITLIST_FILE = path.join(__dirname, '..', 'waitlist.json');

async function loadWaitlist() {
    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Lendo waitlist.json do Cloudflare R2...`);
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: 'waitlist.json',
            });
            const response = await s3Client.send(command);
            const dataStr = await streamToString(response.Body);
            try {
                fs.writeFileSync(LOCAL_WAITLIST_FILE, dataStr, 'utf8');
            } catch(e) {}
            return JSON.parse(dataStr);
        } catch (err) {
            if (err.name === 'NoSuchKey' || err.code === 'NoSuchKey' || err.message.includes('NoSuchKey')) {
                console.log('[R2DB] Arquivo waitlist.json não existe no bucket R2. Retornando vazio.');
                return [];
            }
            console.error('[R2DB] Erro ao carregar waitlist do R2 (usando fallback local):', err.message);
        }
    }
    if (fs.existsSync(LOCAL_WAITLIST_FILE)) {
        try {
            const dataStr = fs.readFileSync(LOCAL_WAITLIST_FILE, 'utf8');
            return JSON.parse(dataStr);
        } catch (e) {
            console.error('[R2DB] Erro ao ler waitlist.json local:', e.message);
        }
    }
    return [];
}

async function saveWaitlist(emails) {
    const dataStr = JSON.stringify(emails, null, 2);
    try {
        fs.writeFileSync(LOCAL_WAITLIST_FILE, dataStr, 'utf8');
        console.log('[R2DB] Backup local de waitlist.json gravado com sucesso.');
    } catch (e) {
        console.error('[R2DB] Falha ao gravar cópia local de waitlist:', e.message);
    }
    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Enviando waitlist.json atualizado para o Cloudflare R2...`);
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: 'waitlist.json',
                Body: dataStr,
                ContentType: 'application/json',
            });
            await s3Client.send(command);
            console.log('[R2DB] Banco de dados waitlist.json persistido no R2.');
            return true;
        } catch (err) {
            console.error('[R2DB] Falha crítica ao persistir waitlist no R2:', err.message);
        }
    }
    return false;
}

// Caminho do bugs local
const LOCAL_BUGS_FILE = path.join(__dirname, '..', 'bugs.json');

async function loadBugs() {
    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Lendo bugs.json do Cloudflare R2...`);
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: 'bugs.json',
            });
            const response = await s3Client.send(command);
            const dataStr = await streamToString(response.Body);
            try {
                fs.writeFileSync(LOCAL_BUGS_FILE, dataStr, 'utf8');
            } catch(e) {}
            return JSON.parse(dataStr);
        } catch (err) {
            if (err.name === 'NoSuchKey' || err.code === 'NoSuchKey' || err.message.includes('NoSuchKey')) {
                console.log('[R2DB] Arquivo bugs.json não existe no bucket R2. Retornando vazio.');
                return [];
            }
            console.error('[R2DB] Erro ao carregar bugs do R2 (usando fallback local):', err.message);
        }
    }
    if (fs.existsSync(LOCAL_BUGS_FILE)) {
        try {
            const dataStr = fs.readFileSync(LOCAL_BUGS_FILE, 'utf8');
            return JSON.parse(dataStr);
        } catch (e) {
            console.error('[R2DB] Erro ao ler bugs.json local:', e.message);
        }
    }
    return [];
}

async function saveBugs(bugs) {
    const dataStr = JSON.stringify(bugs, null, 2);
    try {
        fs.writeFileSync(LOCAL_BUGS_FILE, dataStr, 'utf8');
        console.log('[R2DB] Backup local de bugs.json gravado com sucesso.');
    } catch (e) {
        console.error('[R2DB] Falha ao gravar cópia local de bugs:', e.message);
    }
    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Enviando bugs.json atualizado para o Cloudflare R2...`);
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: 'bugs.json',
                Body: dataStr,
                ContentType: 'application/json',
            });
            await s3Client.send(command);
            console.log('[R2DB] Banco de dados bugs.json persistido no R2.');
            return true;
        } catch (err) {
            console.error('[R2DB] Falha crítica ao persistir bugs no R2:', err.message);
        }
    }
    return false;
}

// Hashing de senha SHA-256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Enviar buffer de imagem para o Cloudflare R2
async function uploadImage(buffer, filename, contentType = 'image/jpeg') {
    if (s3Client && bucketName) {
        try {
            const key = `saved_images/${filename}`;
            console.log(`[R2DB] Enviando imagem ${key} para o Cloudflare R2...`);
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: buffer,
                ContentType: contentType,
            });
            await s3Client.send(command);
            const publicUrl = process.env.R2_PUBLIC_URL || 'https://pub-80073e247d7e49e6957cfb54297792ed.r2.dev';
            const url = `${publicUrl}/${key}`;
            console.log(`[R2DB] Imagem enviada com sucesso para o R2: ${url}`);
            return url;
        } catch (err) {
            console.error('[R2DB] Falha ao enviar imagem para o R2:', err.message);
        }
    } else {
        console.warn('[R2DB] Envio R2 ignorado: S3 Client ou Bucket não inicializado.');
    }
    return null;
}


// Caminho do public_paintings local
const LOCAL_PUBLIC_PAINTINGS_FILE = path.join(__dirname, '..', 'public_paintings.json');

async function loadPublicPaintings() {
    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Lendo public_paintings.json do Cloudflare R2...`);
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: 'public_paintings.json',
            });
            const response = await s3Client.send(command);
            const dataStr = await streamToString(response.Body);
            try {
                fs.writeFileSync(LOCAL_PUBLIC_PAINTINGS_FILE, dataStr, 'utf8');
            } catch(e) {}
            return JSON.parse(dataStr);
        } catch (err) {
            if (err.name === 'NoSuchKey' || err.code === 'NoSuchKey' || err.message.includes('NoSuchKey')) {
                console.log('[R2DB] Arquivo public_paintings.json não existe no bucket R2. Retornando vazio.');
                return [];
            }
            console.error('[R2DB] Erro ao carregar public_paintings do R2 (usando fallback local):', err.message);
        }
    }
    if (fs.existsSync(LOCAL_PUBLIC_PAINTINGS_FILE)) {
        try {
            const dataStr = fs.readFileSync(LOCAL_PUBLIC_PAINTINGS_FILE, 'utf8');
            return JSON.parse(dataStr);
        } catch (e) {
            console.error('[R2DB] Erro ao ler public_paintings.json local:', e.message);
        }
    }
    return [];
}

async function savePublicPaintings(paintings) {
    const dataStr = JSON.stringify(paintings, null, 2);
    try {
        fs.writeFileSync(LOCAL_PUBLIC_PAINTINGS_FILE, dataStr, 'utf8');
        console.log('[R2DB] Backup local de public_paintings.json gravado com sucesso.');
    } catch (e) {
        console.error('[R2DB] Falha ao gravar cópia local de public_paintings:', e.message);
    }
    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Enviando public_paintings.json atualizado para o Cloudflare R2...`);
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: 'public_paintings.json',
                Body: dataStr,
                ContentType: 'application/json',
            });
            await s3Client.send(command);
            console.log('[R2DB] Banco de dados public_paintings.json persistido no R2.');
            return true;
        } catch (err) {
            console.error('[R2DB] Falha crítica ao persistir public_paintings no R2:', err.message);
        }
    }
    return false;
}

// Caminho do analytics local
const LOCAL_ANALYTICS_FILE = path.join(__dirname, '..', 'analytics.json');

async function loadAnalytics() {
    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Lendo analytics.json do Cloudflare R2...`);
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: 'analytics.json',
            });
            const response = await s3Client.send(command);
            const dataStr = await streamToString(response.Body);
            try {
                fs.writeFileSync(LOCAL_ANALYTICS_FILE, dataStr, 'utf8');
            } catch(e) {}
            return JSON.parse(dataStr);
        } catch (err) {
            if (err.name === 'NoSuchKey' || err.code === 'NoSuchKey' || err.message.includes('NoSuchKey')) {
                console.log('[R2DB] Arquivo analytics.json não existe no bucket R2. Retornando vazio.');
                return { visits: [], downloads: [], searches: [], categoryViews: [], pdfFailures: [], paymentRefusals: [], errors: [], payments: [] };
            }
            console.error('[R2DB] Erro ao carregar analytics do R2 (usando fallback local):', err.message);
        }
    }
    if (fs.existsSync(LOCAL_ANALYTICS_FILE)) {
        try {
            const dataStr = fs.readFileSync(LOCAL_ANALYTICS_FILE, 'utf8');
            return JSON.parse(dataStr);
        } catch (e) {
            console.error('[R2DB] Erro ao ler analytics.json local:', e.message);
        }
    }
    return { visits: [], downloads: [], searches: [], categoryViews: [], pdfFailures: [], paymentRefusals: [], errors: [], payments: [] };
}

async function saveAnalytics(analytics) {
    const dataStr = JSON.stringify(analytics, null, 2);
    try {
        fs.writeFileSync(LOCAL_ANALYTICS_FILE, dataStr, 'utf8');
        console.log('[R2DB] Backup local de analytics.json gravado com sucesso.');
    } catch (e) {
        console.error('[R2DB] Falha ao gravar cópia local de analytics:', e.message);
    }
    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Enviando analytics.json atualizado para o Cloudflare R2...`);
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: 'analytics.json',
                Body: dataStr,
                ContentType: 'application/json',
            });
            await s3Client.send(command);
            console.log('[R2DB] Banco de dados analytics.json persistido no R2.');
            return true;
        } catch (err) {
            console.error('[R2DB] Falha crítica ao persistir analytics no R2:', err.message);
        }
    }
    return false;
}

const LOCAL_DRAWINGS_FILE = path.join(__dirname, '..', 'drawings.json');

async function loadDrawings() {
    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Lendo drawings.json do Cloudflare R2...`);
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: 'drawings.json',
            });
            const response = await s3Client.send(command);
            const dataStr = await streamToString(response.Body);
            try {
                fs.writeFileSync(LOCAL_DRAWINGS_FILE, dataStr, 'utf8');
            } catch(e) {}
            return JSON.parse(dataStr);
        } catch (err) {
            if (err.name === 'NoSuchKey' || err.code === 'NoSuchKey' || err.message.includes('NoSuchKey')) {
                console.log('[R2DB] Arquivo drawings.json não existe no bucket R2. Usando fallback local.');
            } else {
                console.error('[R2DB] Erro ao carregar drawings do R2 (usando fallback local):', err.message);
            }
        }
    }
    if (fs.existsSync(LOCAL_DRAWINGS_FILE)) {
        try {
            const dataStr = fs.readFileSync(LOCAL_DRAWINGS_FILE, 'utf8');
            return JSON.parse(dataStr);
        } catch (e) {
            console.error('[R2DB] Erro ao ler drawings.json local:', e.message);
        }
    }
    return [];
}

async function saveDrawings(drawings) {
    const dataStr = JSON.stringify(drawings, null, 2);
    try {
        fs.writeFileSync(LOCAL_DRAWINGS_FILE, dataStr, 'utf8');
        console.log('[R2DB] Backup local de drawings.json gravado com sucesso.');
    } catch (e) {
        console.error('[R2DB] Falha ao gravar cópia local de drawings:', e.message);
    }
    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Enviando drawings.json atualizado para o Cloudflare R2...`);
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: 'drawings.json',
                Body: dataStr,
                ContentType: 'application/json',
            });
            await s3Client.send(command);
            console.log('[R2DB] Banco de dados drawings.json persistido no R2.');
            return true;
        } catch (err) {
            console.error('[R2DB] Falha crítica ao persistir drawings no R2:', err.message);
        }
    }
    return false;
}

// ========= FEATURED DRAWINGS (Mais Amados) =========
const LOCAL_FEATURED_FILE = path.join(__dirname, '..', 'featured_drawings.json');

async function loadFeaturedDrawings() {
    if (s3Client && bucketName) {
        try {
            console.log('[R2DB] Lendo featured_drawings.json do Cloudflare R2...');
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: 'featured_drawings.json',
            });
            const response = await s3Client.send(command);
            const dataStr = await streamToString(response.Body);
            try {
                fs.writeFileSync(LOCAL_FEATURED_FILE, dataStr, 'utf8');
            } catch(e) {}
            return JSON.parse(dataStr);
        } catch (err) {
            if (err.name === 'NoSuchKey' || err.code === 'NoSuchKey' || (err.message && err.message.includes('NoSuchKey'))) {
                console.log('[R2DB] featured_drawings.json não existe no R2. Tentando local...');
            } else {
                console.error('[R2DB] Erro ao ler featured_drawings.json do R2:', err.message);
            }
        }
    }
    // Fallback local
    if (fs.existsSync(LOCAL_FEATURED_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(LOCAL_FEATURED_FILE, 'utf8'));
        } catch(e) {
            console.error('[R2DB] Erro ao ler featured_drawings.json local:', e.message);
        }
    }
    return null;
}

async function saveFeaturedDrawings(featuredData) {
    const dataStr = JSON.stringify(featuredData, null, 2);
    try {
        fs.writeFileSync(LOCAL_FEATURED_FILE, dataStr, 'utf8');
        console.log('[R2DB] Backup local de featured_drawings.json gravado.');
    } catch(e) {
        console.error('[R2DB] Falha ao gravar featured_drawings.json local:', e.message);
    }
    if (s3Client && bucketName) {
        try {
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: 'featured_drawings.json',
                Body: dataStr,
                ContentType: 'application/json',
            });
            await s3Client.send(command);
            console.log('[R2DB] featured_drawings.json persistido no R2.');
            return true;
        } catch(err) {
            console.error('[R2DB] Falha ao persistir featured_drawings.json no R2:', err.message);
        }
    }
    return false;
}

// ========= EVENTS (Expedições) =========
const LOCAL_EVENTS_FILE = path.join(__dirname, '..', 'events.json');

async function loadEvents() {
    if (s3Client && bucketName) {
        try {
            console.log('[R2DB] Lendo events.json do Cloudflare R2...');
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: 'events.json',
            });
            const response = await s3Client.send(command);
            const dataStr = await streamToString(response.Body);
            try {
                fs.writeFileSync(LOCAL_EVENTS_FILE, dataStr, 'utf8');
            } catch(e) {}
            return JSON.parse(dataStr);
        } catch (err) {
            if (err.name === 'NoSuchKey' || err.code === 'NoSuchKey' || (err.message && err.message.includes('NoSuchKey'))) {
                console.log('[R2DB] events.json não existe no R2. Tentando local...');
            } else {
                console.error('[R2DB] Erro ao ler events.json do R2:', err.message);
            }
        }
    }
    // Fallback local
    if (fs.existsSync(LOCAL_EVENTS_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(LOCAL_EVENTS_FILE, 'utf8'));
        } catch(e) {
            console.error('[R2DB] Erro ao ler events.json local:', e.message);
        }
    }
    return null;
}

async function saveEvents(eventsData) {
    const dataStr = JSON.stringify(eventsData, null, 2);
    try {
        fs.writeFileSync(LOCAL_EVENTS_FILE, dataStr, 'utf8');
        console.log('[R2DB] Backup local de events.json gravado.');
    } catch(e) {
        console.error('[R2DB] Falha ao gravar events.json local:', e.message);
    }
    if (s3Client && bucketName) {
        try {
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: 'events.json',
                Body: dataStr,
                ContentType: 'application/json',
            });
            await s3Client.send(command);
            console.log('[R2DB] events.json persistido no R2.');
            return true;
        } catch(err) {
            console.error('[R2DB] Falha ao persistir events.json no R2:', err.message);
        }
    }
    return false;
}

module.exports = {
    loadUsers,
    loadPublicPaintings,
    savePublicPaintings,
    saveUsers,
    loadWaitlist,
    saveWaitlist,
    loadBugs,
    saveBugs,
    loadAnalytics,
    saveAnalytics,
    hashPassword,
    uploadImage,
    loadDrawings,
    saveDrawings,
    loadEvents,
    saveEvents,
    loadFeaturedDrawings,
    saveFeaturedDrawings
};

