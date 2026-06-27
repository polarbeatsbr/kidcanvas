const crypto = require('crypto');
const supabase = require('./db');

const SESSION_DURATION_DAYS = 30;

function generateToken() {
  return crypto.randomBytes(48).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createSession(userId, userAgent, ipAddress) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await supabase.from('sessions').insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
    user_agent: userAgent,
    ip_address: ipAddress,
  });

  return token; // só o token cru vai pro cookie — o hash fica no banco
}

async function validateSession(token) {
  if (!token) return null;
  const tokenHash = hashToken(token);

  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) {
    // Sessão expirada — limpar
    await supabase.from('sessions').delete().eq('token_hash', tokenHash);
    return null;
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, email, username, plan, stars, avatar_url')
    .eq('id', session.user_id)
    .maybeSingle();

  return user;
}

async function destroySession(token) {
  const tokenHash = hashToken(token);
  await supabase.from('sessions').delete().eq('token_hash', tokenHash);
}

module.exports = { createSession, validateSession, destroySession };
