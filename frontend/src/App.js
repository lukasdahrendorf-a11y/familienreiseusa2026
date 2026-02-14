import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Map, Compass, Camera, CheckSquare, Users, Home as HomeIcon, Plus, X, MapPin, Calendar } from "lucide-react";

// Pages
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import TripsPage from "./pages/TripsPage";
import PackingPage from "./pages/PackingPage";
import FamilyPage from "./pages/FamilyPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="floating-nav" data-testid="main-navigation">
      <NavLink 
        to="/" 
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        data-testid="nav-home"
      >
        <HomeIcon className="w-4 h-4 inline mr-1" />
        Start
      </NavLink>
      <NavLink 
        to="/map" 
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        data-testid="nav-map"
      >
        <Map className="w-4 h-4 inline mr-1" />
        Karte
      </NavLink>
      <NavLink 
        to="/trips" 
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        data-testid="nav-trips"
      >
        <Camera className="w-4 h-4 inline mr-1" />
        Reisen
      </NavLink>
      <NavLink 
        to="/packing" 
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        data-testid="nav-packing"
      >
        <CheckSquare className="w-4 h-4 inline mr-1" />
        Packlisten
      </NavLink>
      <NavLink 
        to="/family" 
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        data-testid="nav-family"
      >
        <Users className="w-4 h-4 inline mr-1" />
        Familie
      </NavLink>
    </nav>
  );
};

// Page transition wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Animated Routes
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/map" element={<PageWrapper><MapPage /></PageWrapper>} />
        <Route path="/trips" element={<PageWrapper><TripsPage /></PageWrapper>} />
        <Route path="/packing" element={<PageWrapper><PackingPage /></PageWrapper>} />
        <Route path="/family" element={<PageWrapper><FamilyPage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  // Initialize family on app load
  useEffect(() => {
    const initFamily = async () => {
      try {
        await axios.post(`${API}/init-family`);
      } catch (error) {
        console.error("Failed to init family:", error);
      }
    };
    initFamily();
  }, []);

  return (
    <div className="app-container paper-texture">
      <BrowserRouter>
        <Navigation />
        <AnimatedRoutes />
      </BrowserRouter>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default App;
