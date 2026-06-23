import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "./components/ui/sonner";
import { Home, MapPinned, CalendarDays, CheckSquare, Users } from "lucide-react";

import HomePage from "./pages/HomePage";
import RoutePage from "./pages/RoutePage";
import PlanPage from "./pages/PlanPage";
import PackingPage from "./pages/PackingPage";
import FamilyPage from "./pages/FamilyPage";
import ChatWidget from "./components/ChatWidget";

const navItems = [
  { to: "/", icon: Home, label: "Start" },
  { to: "/route", icon: MapPinned, label: "Route" },
  { to: "/planen", icon: CalendarDays, label: "Planen" },
  { to: "/packen", icon: CheckSquare, label: "Packen" },
  { to: "/familie", icon: Users, label: "Familie" },
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
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <div className="app-container paper-texture">
      <BrowserRouter>
        <div className="app-content">
          <AnimatedRoutes />
        </div>
        <Navigation />
        <ChatWidget />
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
