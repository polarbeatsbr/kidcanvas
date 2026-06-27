const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Migration] ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configuradas no .env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateUsers(backupFilePath) {
  const absolutePath = path.resolve(backupFilePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`[Migration] Arquivo de backup não encontrado: ${absolutePath}`);
    process.exit(1);
  }

  const backup = require(absolutePath);
  const users = backup.users || [];

  console.log(`[Migration] Iniciando migração de ${users.length} usuários para o Supabase...`);

  let success = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      const cleanEmail = user.email.toLowerCase();

      // Verificar se já existe no banco
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existing) {
        console.log(`[Migration] SKIP: ${cleanEmail} já existe no banco.`);
        skipped++;
        continue;
      }

      // Inserir usuário mantendo o hash antigo (SHA-256)
      // O upgrade automático para bcrypt ocorrerá no próximo login.
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: cleanEmail,
          password_hash: user.passwordHash || user.password, // aceita hashes legados
          username: user.name || user.username || cleanEmail.split('@')[0],
          plan: user.plan || 'free',
          stars: user.stars || user.paginasRestantes || 0,
          created_at: user.createdAt || new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError) {
        console.error(`[Migration] ERRO ao criar usuário ${cleanEmail}:`, insertError.message);
        continue;
      }

      success++;
      console.log(`[Migration] OK: ${cleanEmail} inserido com ID ${insertedUser.id}`);

      // Migrar desenhos (myPaintings) do usuário
      const drawings = user.myPaintings || user.drawings || [];
      if (drawings.length > 0) {
        console.log(`[Migration]   Migrando ${drawings.length} desenhos para ${cleanEmail}...`);
        const dbDrawings = drawings.map(d => ({
          user_id: insertedUser.id,
          title: d.title || d.prompt || 'Sem título',
          image_url: d.imageUrl || d.url,
          thumbnail_url: d.thumbnailUrl || d.url,
          category: d.category,
          template_id: d.templateId,
          created_at: d.createdAt || d.savedAt || new Date().toISOString(),
        }));

        const { error: drawingsError } = await supabase
          .from('drawings')
          .insert(dbDrawings);

        if (drawingsError) {
          console.error(`[Migration]   ERRO ao migrar desenhos de ${cleanEmail}:`, drawingsError.message);
        }
      }

      // Migrar cartas (cards) do usuário
      const cards = user.cards || [];
      if (cards.length > 0) {
        console.log(`[Migration]   Migrando ${cards.length} cartas para ${cleanEmail}...`);
        const dbCards = cards.map(c => ({
          user_id: insertedUser.id,
          card_id: c.id || c.cardId,
          card_name: c.name || c.cardName,
          rarity: c.rarity || 'comum',
          obtained_at: c.obtainedAt || new Date().toISOString(),
        }));

        const { error: cardsError } = await supabase
          .from('cards')
          .insert(dbCards);

        if (cardsError) {
          console.error(`[Migration]   ERRO ao migrar cartas de ${cleanEmail}:`, cardsError.message);
        }
      }

      // Migrar conquistas (achievements) do usuário
      const achievements = user.achievements || [];
      if (achievements.length > 0) {
        console.log(`[Migration]   Migrando ${achievements.length} conquistas para ${cleanEmail}...`);
        const dbAchievements = achievements.map(a => ({
          user_id: insertedUser.id,
          achievement_id: a.achievementId || a,
          unlocked_at: a.unlockedAt || new Date().toISOString(),
        }));

        const { error: achievementsError } = await supabase
          .from('achievements')
          .insert(dbAchievements);

        if (achievementsError) {
          console.error(`[Migration]   ERRO ao migrar conquistas de ${cleanEmail}:`, achievementsError.message);
        }
      }

    } catch (err) {
      console.error(`[Migration] EXCEÇÃO ao migrar usuário ${user.email}:`, err.message);
    }
  }

  console.log(`\n[Migration] Concluído! Sucesso: ${success}, Ignorados: ${skipped}`);
}

const backupFile = process.argv[2];
if (!backupFile) {
  console.error('Uso: node scripts/migrate-users.js <caminho-do-backup.json>');
  process.exit(1);
}

migrateUsers(backupFile);
