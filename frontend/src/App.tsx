import { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Sidebar from "./layouts/Sidebar";
import { supabase } from "./lib/supabase";
import { disableDemoMode, isDemoMode } from "./lib/demoMode";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Questions from "./pages/Questions";
import Patterns from "./pages/Patterns";
import Revision from "./pages/Revision";
import AIChat from "./pages/AIChat";
import PDetails from "./pages/PDetails";

function App() {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      // A real session always wins over a stale demo flag left in this
      // tab's sessionStorage from an earlier "Explore Demo" click.
      if (session) disableDemoMode();
      setIsAuthenticated(!!session);
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) disableDemoMode();
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (location.pathname === "/") {
    // An already-logged-in user landing back on "/" (e.g. clicking the
    // sidebar logo) should stay in the app, not see the Login form again.
    if (authChecked && isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Login />;
  }

  // Demo Mode never creates a Supabase session, so it's allowed through
  // without waiting on the auth check below.
  if (!isDemoMode()) {
    if (!authChecked) {
      return null;
    }

    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/patterns" element={<Patterns />} />
          <Route path="/revision" element={<Revision />} />
          <Route path="/aichat" element={<AIChat />} />
          <Route path="/pdetails" element={<PDetails />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;