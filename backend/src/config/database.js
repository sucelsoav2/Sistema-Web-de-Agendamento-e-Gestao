const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO: SUPABASE_URL e SUPABASE_KEY são obrigatórios nas variáveis de ambiente.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Conexão com Supabase configurada com sucesso.');

module.exports = supabase;

