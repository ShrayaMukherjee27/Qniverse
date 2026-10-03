import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  BarChart3,
  Network,
  FileText,
  CalendarDays,
  CheckCircle2,
  LogOut
} from "lucide-react";
import { signOut } from "firebase/auth";

import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import {
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const menuItems = [
  {
    name: "Overview",
    path: "/dashboard",
    icon: LayoutDashboard
  },
  {
    name: "Subjects",
    path: "/subjects",
    icon: BookOpen
  },
  {
    name: "Upload PYQs",
    path: "/upload",
    icon: Upload
  },
  {
    name: "Analysis",
    path: "/analysis",
    icon: BarChart3
  },
  {
    name: "Concept Graph",
    path: "/concept-graph",
    icon: Network
  },
  {
    name: "Questions",
    path: "/questions",
    icon: FileText
  },
  {
    name: "Study Planner",
    path: "/planner",
    icon: CalendarDays
  },
  {
    name: "Progress",
    path: "/progress",
    icon: CheckCircle2
  }
];

function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Student";

  const initial =
    displayName.charAt(0).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">
          Q
        </div>

        <div>
          <h2>Qniverse</h2>
          <span>Universe of Questions</span>
        </div>
      </div>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "nav-item active"
                  : "nav-item"
              }
              end={item.path === "/"}
            >
              <Icon
                size={18}
                strokeWidth={2}
              />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <Moon size={16} />
          ) : (
            <Sun size={16} />
          )}

          <span>
            {theme === "light"
              ? "Dark mode"
              : "Light mode"}
          </span>
        </button>

        <div className="profile">
          ...
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
          title="Log out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;