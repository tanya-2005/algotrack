import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      // Supabase's default session storage is localStorage, which is
      // shared across every tab of the same origin. Logging into a
      // different account in one tab silently overwrites the session a
      // different tab is using, so a stale tab can end up making calls as
      // the WRONG account while still showing old UI ("mixing content of
      // different emails"). sessionStorage scopes the session to this
      // one tab - a page refresh still keeps you logged in, but a new
      // tab correctly starts its own independent session.
      storage: window.sessionStorage,
    },
  }
);