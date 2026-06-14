require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para desenvolvimento local se necessário
app.use(cors());

// Middleware para processar JSON
app.use(express.json());

// Servir os arquivos estáticos do frontend da raiz do projeto
app.use(express.static(path.join(__dirname, '..')));

// Rota de Proxy da API para contornar problemas de CORS no navegador
app.post('/api/generate', async (req, res) => {
    try {
        // 1. Obter a chave de API
        // Prioriza a chave enviada pelo cabeçalho do cliente (Authorization Bearer)
        // Se não houver, busca no .env (para modo SaaS autopilot com chaves próprias do servidor)
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

        // 2. Encaminhar a requisição para a API correspondente
        const isGoogleKey = apiKey.startsWith('AIza') || apiKey.startsWith('AQ.');

        if (isGoogleKey) {
            console.log(`[Proxy] Utilizando API do Google AI Studio (Imagen 4.0)...`);
            const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict`;
            
            const response = await fetch(googleUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    instances: [
                        {
                            prompt: req.body.prompt
                        }
                    ],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: "1:1",
                        outputMimeType: "image/jpeg"
                    }
                })
            });

            if (!response.ok) {
                const rawText = await response.text().catch(() => '');
                console.error('[Google API Error Status]:', response.status);
                console.error('[Google API Error Response]:', rawText);
                let errMsg = 'Erro na API do Google AI Studio.';
                try {
                    const errJson = JSON.parse(rawText);
                    if (errJson.error?.message) {
                        errMsg = errJson.error.message;
                    }
                } catch(e) {}
                return res.status(response.status).json({
                    success: false,
                    message: errMsg
                });
            }

            const data = await response.json();
            const bytesBase64 = data.predictions?.[0]?.bytesBase64Encoded;

            if (!bytesBase64) {
                return res.status(500).json({
                    success: false,
                    message: 'A API do Google AI Studio não retornou os dados do desenho.'
                });
            }

            // Retornar a imagem em Base64 DataURL no formato esperado pelo frontend
            return res.json({
                success: true,
                data: {
                    outputImageUrls: [
                        `data:image/jpeg;base64,${bytesBase64}`
                    ]
                }
            });

        } else {
            // Chamada original para o NanoBanana
            console.log(`[Proxy] Utilizando API do NanoBanana...`);
            const response = await fetch('https://www.nananobanana.com/api/v1/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(req.body)
            });

            const responseData = await response.json();
            return res.status(response.status).json(responseData);
        }

    } catch (error) {
        console.error('[Proxy Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao processar a geração pelo servidor proxy.',
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

// Rota para listar os desenhos processados na pasta 'pintai-biblioteca' divididos por categoria e tier
app.get('/api/drawings', (req, res) => {
    const fs = require('fs');
    const bibliotecaDir = path.join(__dirname, '..', 'pintai-biblioteca');
    if (!fs.existsSync(bibliotecaDir)) {
        return res.json({ success: true, drawings: [] });
    }

    try {
        const ratings = loadRatings();
        const drawings = [];
        
        // Listar as pastas de categorias na biblioteca
        const categories = fs.readdirSync(bibliotecaDir);
        categories.forEach(categoryFolder => {
            const catPath = path.join(bibliotecaDir, categoryFolder);
            const stat = fs.statSync(catPath);
            if (stat.isDirectory()) {
                const files = fs.readdirSync(catPath);
                files.forEach(file => {
                    if (file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
                        const filenameWithoutExt = file.replace(/\.[^/.]+$/, "");
                        
                        // Extrair o índice numérico inicial se houver (ex: "01-")
                        let index = "";
                        let cleanName = filenameWithoutExt;
                        const matchIndex = filenameWithoutExt.match(/^(\d+)-(.*)/);
                        if (matchIndex) {
                            index = matchIndex[1];
                            cleanName = matchIndex[2];
                        }
                        
                        let pt = cleanName;
                        let en = "desenho para colorir";
                        let ptSlug = cleanName;
                        
                        if (cleanName.includes('__')) {
                            const parts = cleanName.split('__');
                            pt = parts[0].replace(/-/g, ' ');
                            ptSlug = parts[0];
                            en = parts[1].replace(/_/g, ' ').replace(/-/g, ' ');
                        } else {
                            pt = pt.replace(/-/g, ' ');
                        }
                        
                        // Formatação dos nomes para exibição
                        pt = pt.charAt(0).toUpperCase() + pt.slice(1);
                        en = en.charAt(0).toUpperCase() + en.slice(1);
                        
                        const idxNum = index ? parseInt(index, 10) : 999;
                        const ratingKey = `${categoryFolder}/${ptSlug}`;
                        const ratingData = ratings[ratingKey] || { totalStars: 0, votes: 0 };
                        const averageRating = ratingData.votes > 0 ? (ratingData.totalStars / ratingData.votes) : 0;
                        
                        drawings.push({
                            index: idxNum,
                            filename: file,
                            url: `/pintai-biblioteca/${categoryFolder}/${file}`,
                            category: categoryFolder,
                            pt: pt,
                            en: en,
                            slug: ptSlug,
                            tier: 'free',
                            rating: averageRating,
                            votes: ratingData.votes
                        });
                    }
                });
            }
        });

        res.json({ success: true, drawings });
    } catch (error) {
        console.error('Erro ao ler pasta biblioteca:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar desenhos.' });
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

app.get('/api/debug-index', (req, res) => {
    const fs = require('fs');
    const indexPath = path.join(__dirname, '..', 'index.html');
    const exists = fs.existsSync(indexPath);
    let stats = null;
    let error = null;
    let contentSnippet = null;
    if (exists) {
        try {
            stats = fs.statSync(indexPath);
            contentSnippet = fs.readFileSync(indexPath, 'utf8').slice(0, 100);
        } catch (e) {
            error = e.message;
        }
    }
    res.json({
        exists,
        indexPath,
        stats,
        contentSnippet,
        error
    });
});

app.get('/api/debug-files', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    try {
        const parentDir = path.join(__dirname, '..');
        const parentFiles = fs.readdirSync(parentDir);
        const apiFiles = fs.readdirSync(__dirname);
        res.json({
            success: true,
            dirname: __dirname,
            apiFiles: apiFiles,
            parentDir: parentDir,
            parentFiles: parentFiles
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
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
