import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Code2,
  BrainCircuit,
  RefreshCcw,
  Bot,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";
import { disableDemoMode, isDemoMode } from "../lib/demoMode";
import { signOut } from "../services/auth";
import { getDisplayName } from "../lib/userDisplay";

function Sidebar() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const demoMode = isDemoMode();

  useEffect(() => {
    if (demoMode) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setName(getDisplayName(session));
      setEmail(session?.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setName(getDisplayName(session));
        setEmail(session?.user?.email ?? null);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [demoMode]);

  const handleSignOut = async () => {
    if (demoMode) {
      disableDemoMode();
    } else {
      await signOut();
    }
    navigate("/");
  };

  const displayName = demoMode ? "Demo User" : name || "Loading...";
  const displaySubtext = demoMode ? "Exploring demo data" : email ?? "";
  const avatarLetter = demoMode
    ? "D"
    : (displayName?.[0] ?? "?").toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Link to="/" className="logo">
          <div className="logo-circle">🧠</div>

          <div>
            <h2>DSA Memory</h2>
            <p>Memory OS</p>
          </div>
        </Link>

        <div className="menu">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/questions"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <Code2 size={20} />
            <span>Questions</span>
          </NavLink>

          <NavLink
            to="/patterns"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <BrainCircuit size={20} />
            <span>Patterns</span>
          </NavLink>

          <NavLink
            to="/revision"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <RefreshCcw size={20} />
            <span>Revision</span>
          </NavLink>

          <NavLink
            to="/aichat"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <Bot size={20} />
            <span>AI Coach</span>
          </NavLink>
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="theme-toggle">
          <span className="theme-toggle-label">Theme</span>
          <button
            type="button"
            className={`theme-toggle-btn ${theme === "dark" ? "active" : ""}`}
            onClick={() => setTheme("dark")}
          >
            <Moon size={18} />
            Dark Mode
          </button>
          <button
            type="button"
            className={`theme-toggle-btn ${theme === "light" ? "active" : ""}`}
            onClick={() => setTheme("light")}
          >
            <Sun size={18} />
            Light Mode
          </button>
        </div>

        <div className="profile">
          <div className="avatar">{avatarLetter}</div>
          <div className="profile-info">
            <h3>{displayName}</h3>
            <p>{displaySubtext}</p>
          </div>
          <button
            type="button"
            className="logout-btn"
            title={demoMode ? "Exit Demo" : "Sign Out"}
            onClick={handleSignOut}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
