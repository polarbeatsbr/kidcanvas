const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// Carregar usuários da base de dados (R2 com fallback local)
async function loadUsers() {
    // 1. Tentar ler do R2 se disponível
    if (s3Client && bucketName) {
        try {
            console.log(`[R2DB] Lendo banco de dados users.json do Cloudflare R2...`);
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: 'users.json',
            });
            const response = await s3Client.send(command);
            const dataStr = await streamToString(response.Body);
            
            // Salvar cópia local de sincronização
            try {
                fs.writeFileSync(LOCAL_USERS_FILE, dataStr, 'utf8');
            } catch(e) {}
            
            return JSON.parse(dataStr);
        } catch (err) {
            // Se o arquivo não existir no bucket (NoSuchKey), retornar array vazio
            if (err.name === 'NoSuchKey' || err.code === 'NoSuchKey' || err.message.includes('NoSuchKey')) {
                console.log('[R2DB] Arquivo users.json não existe no bucket R2. Retornando vazio.');
                return [];
            }
            console.error('[R2DB] Erro ao carregar do R2 (usando fallback local):', err.message);
        }
    }

    // 2. Fallback: Ler localmente
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

// Salvar usuários na base de dados (R2 e local)
async function saveUsers(users) {
    const dataStr = JSON.stringify(users, null, 2);

    // 1. Sempre salvar localmente primeiro como backup
    try {
        fs.writeFileSync(LOCAL_USERS_FILE, dataStr, 'utf8');
        console.log('[R2DB] Backup local de users.json gravado com sucesso.');
    } catch (e) {
        console.error('[R2DB] Falha ao gravar cópia local de backup:', e.message);
    }

    // 2. Enviar para o Cloudflare R2 se disponível
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
            console.error('[R2DB] Falha crítica ao persistir no R2:', err.message);
        }
    }
    return false;
}

// Hashing de senha SHA-256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = {
    loadUsers,
    saveUsers,
    hashPassword
};
