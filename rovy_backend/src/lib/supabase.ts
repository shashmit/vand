import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Verify a JWT token and return user data
export async function verifyToken(token: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error) {
    throw new Error("Invalid token");
  }

  return data.user;
}
