const { createClient } = require('@supabase/supabase-js');

// O cliente Supabase é inicializado com a Service Role Key para permitir operações
// administrativas seguras (ignorar RLS para tarefas do backend).
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[Supabase] ATENÇÃO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não estão definidas no ambiente!');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseServiceKey || 'placeholder-key'
);

module.exports = supabase;
