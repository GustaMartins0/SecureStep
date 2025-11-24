import { createClient } from '@supabase/supabase-js';

// TODO: preencha essas variáveis com os valores do seu projeto Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xouvqydpaqngrdhppabc.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvdXZxeWRwYXFuZ3JkaHBwYWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDg2OTcsImV4cCI6MjA3OTAyNDY5N30.E1OoKfaJz86yBAvXrkYUBp0CYuEAZZwg3C4W2CHswRE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
