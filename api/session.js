const crypto = require('crypto');
const supabase = require('./db');
const r2db = require('./r2db');

const SESSION_DURATION_DAYS = 30;

const useSupabase = process.env.SUPABASE_URL && 
                    process.env.SUPABASE_SERVICE_ROLE_KEY && 
                    !process.env.SUPABASE_URL.includes('placeholder');

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

  if (useSupabase) {
    await supabase.from('sessions').insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      user_agent: userAgent,
      ip_address: ipAddress,
    });
  } else {
    const users = await r2db.loadUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.token = tokenHash;
      user.tokenExpiry = expiresAt.getTime();
      await r2db.saveUsers(users);
    }
  }

  return token;
}

async function validateSession(token) {
  if (!token) return null;
  const tokenHash = hashToken(token);

  if (useSupabase) {
    const { data: session } = await supabase
      .from('sessions')
      .select('user_id, expires_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (!session) return null;
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('sessions').delete().eq('token_hash', tokenHash);
      return null;
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, email, username, plan, stars, avatar_url')
      .eq('id', session.user_id)
      .maybeSingle();

    return user;
  } else {
    const users = await r2db.loadUsers();
    const user = users.find(u => u.token === tokenHash && u.tokenExpiry > Date.now());
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      plan: user.plan,
      stars: user.stars || user.paginasRestantes || 0,
      avatar_url: user.avatarUrl
    };
  }
}

async function destroySession(token) {
  const tokenHash = hashToken(token);
  if (useSupabase) {
    await supabase.from('sessions').delete().eq('token_hash', tokenHash);
  } else {
    const users = await r2db.loadUsers();
    const user = users.find(u => u.token === tokenHash);
    if (user) {
      user.token = null;
      user.tokenExpiry = null;
      await r2db.saveUsers(users);
    }
  }
}

module.exports = { createSession, validateSession, destroySession };
