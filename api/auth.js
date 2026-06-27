const bcrypt = require('bcrypt');
const crypto = require('crypto');
const supabase = require('./db');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  // Suporte temporário a hashes antigos SHA-256 (migração gradual)
  const oldHash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash === oldHash) {
    // Hash antigo — atualizar para bcrypt automaticamente
    return { valid: true, needsUpgrade: true };
  }
  const valid = await bcrypt.compare(password, hash);
  return { valid, needsUpgrade: false };
}

async function register(email, password, username) {
  // Verificar se email já existe
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (existing) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const password_hash = await hashPassword(password);

  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password_hash,
      username,
    })
    .select('id, email, username, plan, stars')
    .single();

  if (error) throw error;
  return data;
}

async function login(email, password) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, username, password_hash, plan, stars, avatar_url')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error || !user) throw new Error('INVALID_CREDENTIALS');

  const { valid, needsUpgrade } = await verifyPassword(password, user.password_hash);

  if (!valid) throw new Error('INVALID_CREDENTIALS');

  // Upgrade automático de SHA-256 → bcrypt
  if (needsUpgrade) {
    const newHash = await hashPassword(password);
    await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', user.id);
  }

  // Não retornar o hash para o cliente
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

module.exports = { register, login, hashPassword, verifyPassword };
