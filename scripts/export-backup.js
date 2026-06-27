require('dotenv').config();
const { loadUsers, loadWaitlist, loadBugs, loadAnalytics, loadPublicPaintings } = require('../api/r2db');
const fs = require('fs');
const path = require('path');

async function runBackup() {
  console.log('[Backup] Iniciando backup dos dados do Cloudflare R2...');
  
  try {
    const timestamp = Date.now();
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 1. Backup de usuários
    const users = await loadUsers();
    const usersPath = path.join(backupDir, `users-backup-${timestamp}.json`);
    fs.writeFileSync(usersPath, JSON.stringify({ users }, null, 2), 'utf8');
    console.log(`[Backup] Usuários exportados: ${users.length} registros para ${usersPath}`);

    // 2. Backup da Waitlist
    const waitlist = await loadWaitlist();
    const waitlistPath = path.join(backupDir, `waitlist-backup-${timestamp}.json`);
    fs.writeFileSync(waitlistPath, JSON.stringify({ waitlist }, null, 2), 'utf8');
    console.log(`[Backup] Lista de espera exportada: ${waitlist.length} registros para ${waitlistPath}`);

    // 3. Backup de Bugs
    const bugs = await loadBugs();
    const bugsPath = path.join(backupDir, `bugs-backup-${timestamp}.json`);
    fs.writeFileSync(bugsPath, JSON.stringify({ bugs }, null, 2), 'utf8');
    console.log(`[Backup] Bugs exportados: ${bugs.length} registros para ${bugsPath}`);

    // 4. Backup de Pinturas Públicas
    const publicPaintings = await loadPublicPaintings();
    const paintingsPath = path.join(backupDir, `paintings-backup-${timestamp}.json`);
    fs.writeFileSync(paintingsPath, JSON.stringify({ publicPaintings }, null, 2), 'utf8');
    console.log(`[Backup] Pinturas públicas exportadas: ${publicPaintings.length} registros para ${paintingsPath}`);

    console.log('[Backup] Todos os backups foram concluídos com sucesso!');
  } catch (err) {
    console.error('[Backup] Falha crítica ao realizar o backup:', err);
    process.exit(1);
  }
}

runBackup();
