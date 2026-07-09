import type { Session } from "@supabase/supabase-js";

// Prefers the name collected at signup (stored in Supabase Auth's
// user_metadata), falling back to the email's local part for accounts
// created before this field existed.
export function getDisplayName(session: Session | null): string {
  const fullName = (session?.user?.user_metadata as { full_name?: string })
    ?.full_name;
  if (fullName) return fullName;

  const email = session?.user?.email;
  return email ? email.split("@")[0] : "";
}
