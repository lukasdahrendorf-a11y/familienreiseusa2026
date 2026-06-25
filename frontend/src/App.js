import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "./components/ui/sonner";
import { Home, MapPinned, CalendarDays, CheckSquare, Users, BookOpen, LogOut } from "lucide-react";
import { useState, useCallback } from "react";

import HomePage from "./pages/HomePage";
import RoutePage from "./pages/RoutePage";
import PlanPage from "./pages/PlanPage";
import PackingPage from "./pages/PackingPage";
import FamilyPage from "./pages/FamilyPage";
import DiaryPage from "./pages/DiaryPage";
import ChatWidget from "./components/ChatWidget";

const VALID_USER = "Daahrendorf";
const VALID_HASH = "a3f1c2d8e9b4"; // simple hash check

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).slice(0, 12);
}

const LOGIN_KEY = "dahrendorf_auth";

function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user === VALID_USER && simpleHash(pass) === simpleHash("Millenium$007")) {
      localStorage.setItem(LOGIN_KEY, btoa(VALID_USER + ":" + Date.now()));
      onLogin();
    } else {
      setError("Benutzername oder Passwort falsch");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #264653 0%, #2A9D8F 100%)",
      fontFamily: "'Nunito', sans-serif"
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "white", borderRadius: 20, padding: "40px 36px", width: 360,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center"
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>✈️</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: "#264653", marginBottom: 4 }}>
          Familie Dahrendorf
        </h1>
        <p style={{ color: "#8D99AE", fontSize: 14, marginBottom: 24 }}>USA Westküste 2026</p>

        <input
          type="text"
          placeholder="Benutzername"
          value={user}
          onChange={(e) => { setUser(e.target.value); setError(""); }}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #e0e0e0",
            fontSize: 15, marginBottom: 12, boxSizing: "border-box", outline: "none"
          }}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Passwort"
          value={pass}
          onChange={(e) => { setPass(e.target.value); setError(""); }}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #e0e0e0",
            fontSize: 15, marginBottom: 16, boxSizing: "border-box", outline: "none"
          }}
          autoComplete="current-password"
        />

        {error && <p style={{ color: "#E76F51", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button type="submit" style={{
          width: "100%", padding: "12px", borderRadius: 10, border: "none",
          background: "#2A9D8F", color: "white", fontSize: 16, fontWeight: 700,
          cursor: "pointer", fontFamily: "'Nunito', sans-serif"
        }}>
          Anmelden
        </button>
      </form>
    </div>
  );
}

const navItems = [
  { to: "/", icon: Home, label: "Start" },
  { to: "/route", icon: MapPinned, label: "Route" },
  { to: "/planen", icon: CalendarDays, label: "Planen" },
  { to: "/packen", icon: CheckSquare, label: "Packen" },
  { to: "/familie", icon: Users, label: "Familie" },
  { to: "/tagebuch", icon: BookOpen, label: "Tagebuch" },
];

const Navigation = () => {
  const location = useLocation();
  return (
    <nav className="app-nav" data-testid="main-navigation">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) => `app-nav-item ${isActive ? "active" : ""}`}
          data-testid={`nav-${label.toLowerCase()}`}
        >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/route" element={<PageWrapper><RoutePage /></PageWrapper>} />
        <Route path="/planen" element={<PageWrapper><PlanPage /></PageWrapper>} />
        <Route path="/packen" element={<PageWrapper><PackingPage /></PageWrapper>} />
        <Route path="/familie" element={<PageWrapper><FamilyPage /></PageWrapper>} />
        <Route path="/tagebuch" element={<PageWrapper><DiaryPage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    const auth = localStorage.getItem(LOGIN_KEY);
    return !!auth;
  });

  const handleLogout = useCallback(() => {
    localStorage.removeItem(LOGIN_KEY);
    setLoggedIn(false);
  }, []);

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="app-container paper-texture">
      <BrowserRouter>
        <div className="app-content">
          <AnimatedRoutes />
        </div>
        <Navigation />
        <button
          onClick={handleLogout}
          className="fixed top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white border border-[#E0E0D0] rounded-full text-xs text-[#8D99AE] hover:text-[#E76F51] transition-colors shadow-sm"
          title="Abmelden"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Abmelden</span>
        </button>
        <ChatWidget />
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
