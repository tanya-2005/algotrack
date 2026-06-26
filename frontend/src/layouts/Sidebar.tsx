import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Code2,
  BrainCircuit,
  RefreshCcw,
  Bot,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function Sidebar() {
  const { theme, setTheme } = useTheme();

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
          <div className="avatar">T</div>
          <div>
            <h3>Tanya</h3>
            <p>@tanya</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
