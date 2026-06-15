require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { loadUsers, saveUsers, hashPassword } = require('./r2db');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para desenvolvimento local se necessário
app.use(cors());

// Middleware para processar JSON
app.use(express.json());

// Servir os arquivos estáticos do frontend da raiz do projeto e da pasta public
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, '..', 'public')));

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

// Endpoint para gerar história personalizada e ilustração SVG usando Gemini 2.0 Flash
app.post('/api/generate-story', async (req, res) => {
    try {
        const { childName, theme } = req.body;
        if (!childName || !theme) {
            return res.status(400).json({
                success: false,
                message: 'Nome da criança e tema são obrigatórios.'
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

        console.log(`[Story Proxy] Gerando história para "${childName}" com tema "${theme}" usando Gemini 2.0 Flash...`);

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

        const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
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
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const rawText = await response.text().catch(() => '');
            console.error('[Google Story API Error Status]:', response.status);
            console.error('[Google Story API Error Response]:', rawText);
            let errMsg = 'Erro na API do Gemini 2.0 Flash.';
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
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResult) {
            return res.status(500).json({
                success: false,
                message: 'O Gemini 2.0 Flash não retornou nenhum texto.'
            });
        }

        let parsedResult;
        try {
            parsedResult = JSON.parse(textResult.trim());
        } catch (e) {
            console.error('[Parse JSON Error] Tentando limpar resposta:', textResult);
            // Fallback se por acaso vier envolto em blocos markdown de json ```json ... ```
            const cleanText = textResult.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
            parsedResult = JSON.parse(cleanText);
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

// Endpoint para gerar livro completo: Capa + N Páginas ilustradas (Gemini + N+1 chamadas Ideogram em paralelo)
app.post('/api/generate-full-story', async (req, res) => {
    try {
        const { characterName, themes, styleType, pageCount, synopsis } = req.body;
        if (!characterName || !themes || !Array.isArray(themes) || themes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Personagem principal e pelo menos um tema são obrigatórios.'
            });
        }

        const numPages = parseInt(pageCount, 10) || 4;
        if (![4, 6, 8, 10].includes(numPages)) {
            return res.status(400).json({
                success: false,
                message: 'Número de páginas inválido. Escolha 4, 6, 8 ou 10.'
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

        if (user.balance < numPages) {
            return res.status(400).json({
                success: false,
                message: `Saldo insuficiente! Esta história requer ${numPages} páginas, mas você possui apenas ${user.balance} página(s) de saldo.`
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
        console.log(`[Full Story V4] Gerando livro (Capa + ${numPages} páginas, estilo: ${isColor ? 'Colorida' : 'P&B'}) para "${characterName}" com os temas: "${themesList}"...`);

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

        const storyPrompt = `Gere uma história infantil personalizada contendo exatamente ${numPages} parágrafos em português brasileiro.
Personagem principal: ${characterName}
Temas selecionados: ${themesList}

${synopsisInstructions}A história deve unir o personagem principal e os temas de forma lúdica, fluida, mágica e adequada para crianças.
Para cada um dos ${numPages} parágrafos, sugira um prompt em inglês altamente descritivo para gerar uma ilustração correspondente no Ideogram. Cada prompt deve descrever a cena exata daquele parágrafo específico, mantendo a consistência física e de visual do personagem principal.
Incorpore obrigatoriamente a seguinte diretiva de estilo no final de cada um dos ${numPages} prompts das páginas: "${styleDescription}".

Além disso, sugira um prompt em inglês altamente detalhado para a capa do livro no Ideogram.
O prompt da capa deve descrever uma cena de capa de livro infantil encantadora combinando o personagem e os temas, e DEVE instruir o Ideogram a renderizar textos na imagem no seguinte estilo:
- Um título principal com tipografia amigável e colorida em destaque que leia exatamente: "O Livro Magico de ${characterName}"
- Um subtítulo em tipografia menor e limpa que leia exatamente: "Uma historia criada especialmente para ${characterName}"
- Um selo redondo no canto inferior contendo o texto "KidCanvas" em destaque e, logo abaixo dele em tipografia menor e discreta, o endereço do site "www.kidcanvas.com.br"
Incorpore obrigatoriamente a seguinte diretiva de estilo no final do prompt da capa: "${styleDescription}".

Retorne a resposta estritamente no formato JSON estruturado com o seguinte esquema (sem marcações de markdown adicionais, apenas o JSON puro):
{
  "cover_prompt": "Prompt em inglês para a capa do livro...",
  "paragraphs": [
    ${paragraphSchema}
  ]
}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        
        const geminiRes = await fetch(geminiUrl, {
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
                                text: storyPrompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if (!geminiRes.ok) {
            const rawText = await geminiRes.text().catch(() => '');
            console.error('[Gemini API Error Status]:', geminiRes.status);
            console.error('[Gemini API Error Response]:', rawText);
            return res.status(geminiRes.status).json({
                success: false,
                message: 'Erro ao gerar o texto da história no Gemini.'
            });
        }

        const geminiData = await geminiRes.json();
        const textResult = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResult) {
            return res.status(500).json({
                success: false,
                message: 'O Gemini não retornou nenhum texto.'
            });
        }

        let parsedGemini;
        try {
            parsedGemini = JSON.parse(textResult.trim());
        } catch (e) {
            console.error('[Parse JSON Error] Tentando limpar resposta:', textResult);
            const cleanText = textResult.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
            parsedGemini = JSON.parse(cleanText);
        }

        if (!parsedGemini.paragraphs || parsedGemini.paragraphs.length !== numPages || !parsedGemini.cover_prompt) {
            return res.status(500).json({
                success: false,
                message: `A resposta do Gemini está mal estruturada ou não contém exatamente ${numPages} parágrafos.`
            });
        }

        // 3. Chamar a API do Ideogram para gerar as N+1 imagens em paralelo com velocidade TURBO
        console.log(`[Full Story V4] Iniciando geração concorrente de ${numPages + 1} imagens no Ideogram (Capa + ${numPages} páginas)...`);
        const ideogramKey = process.env.IDEOGRAM_API_KEY || "RK-CWKSVJ9Jet7vJwHOMmfsYVNHBmGA8jKujDMtQcI5snVW3ThAW_H_Zf_jYjU8be7mYXSOFdO7xLvkBgI7rcQ";

        // Preparar lista de prompts: Capa em primeiro lugar, depois as N páginas
        const promptItems = [
            { type: 'cover', prompt: parsedGemini.cover_prompt },
            ...parsedGemini.paragraphs.map((p, idx) => ({ type: 'page', index: idx, prompt: p.image_prompt }))
        ];

        const imageGenerationPromises = promptItems.map(async (item, i) => {
            try {
                console.log(`[Full Story V4] Gerando imagem ${i + 1}/${numPages + 1} (${item.type === 'cover' ? 'Capa' : 'Pág. ' + (item.index + 1)}) com prompt: "${item.prompt}"...`);
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
            } catch (err) {
                console.error(`Erro ao gerar imagem ${i + 1}:`, err.message);
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

        // Deduce user balance and save
        user.balance -= numPages;
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

    const bibliotecaDir = path.join(__dirname, '..', 'public', 'pintai-biblioteca');
    if (!fs.existsSync(bibliotecaDir)) {
        return res.json({ success: true, drawings: [] });
    }

    try {
        const ratings = loadRatings();
        const creationDates = loadCreationDates();
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
                        
                        // Calcular se o desenho é "Novo" (criado a no máximo 30 dias)
                        const relativePath = `${categoryFolder}/${file}`.toLowerCase();
                        const creationDateStr = creationDates[relativePath];
                        let isNew = false;
                        if (creationDateStr) {
                            const creationDate = new Date(creationDateStr);
                            const currentDate = new Date();
                            const diffTime = currentDate - creationDate;
                            const diffDays = diffTime / (1000 * 60 * 60 * 24);
                            if (diffDays >= 0 && diffDays <= 30) {
                                isNew = true;
                            }
                        }
                        
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
                            votes: ratingData.votes,
                            isNew: isNew
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

// -------------------------------------------------------------
// AUTHENTICATION & PLAN ENDPOINTS
// -------------------------------------------------------------

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
        const newUser = {
            id: crypto.randomUUID(),
            name: name.trim(),
            email: cleanEmail,
            passwordHash: hashPassword(password),
            plan: 'Grátis',
            balance: 1,
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
                plan: newUser.plan,
                balance: newUser.balance
            },
            token: sessionToken
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
                plan: user.plan,
                balance: user.balance
            },
            token: sessionToken
        });
    } catch(err) {
        console.error('Erro no login:', err);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor ao realizar login.' });
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
                plan: user.plan,
                balance: user.balance
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
        user.balance = parseInt(pageAmount, 10);
        
        await saveUsers(users);
        
        return res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                plan: user.plan,
                balance: user.balance
            }
        });
    } catch(err) {
        console.error('Erro no upgrade de plano:', err);
        return res.status(500).json({ success: false, message: 'Erro ao processar upgrade de plano.' });
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
