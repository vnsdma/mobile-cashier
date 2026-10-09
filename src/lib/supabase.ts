import { createClient } from "@supabase/supabase-js";
import { safeStorage } from "./storage-adapter";

export const SUPABASE_URL = "https://mitkblmftejogdxmewet.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pdGtibG1mdGVqb2dkeG1ld2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzIzMDYsImV4cCI6MjA2Mjc0ODMwNn0.7zYkzKWXMios1IJ_rz8UA5Jm63xz59A-qi2EqsqB9-E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
