// ============================================================
// GUIP — CONEXÃO SUPABASE
// ============================================================

const SUPABASE_URL = "https://mjcshuqtqjxtybgytdeu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5JJi4TWoc8_65qW9Q7a-0g_7ukxdELK";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
