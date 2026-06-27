const supabase = require('./db');

async function addStars(userId, amount, reason) {
  // Usar RPC para garantir atomicidade — sem race condition
  const { data, error } = await supabase.rpc('add_stars', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
  });

  if (error) throw error;
  return data;
}

async function spendStars(userId, amount, reason) {
  const { data, error } = await supabase.rpc('spend_stars', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
  });

  if (error) throw error;
  if (!data.success) throw new Error('INSUFFICIENT_STARS');
  return data;
}

module.exports = { addStars, spendStars };
