import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { API } from "../App";
import { MapPinned, CalendarDays, CheckSquare, Users, Plane, ArrowRight, Sparkles } from "lucide-react";

const HomePage = () => {
  const [family, setFamily] = useState([]);
  const [trips, setTrips] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/family`),
      axios.get(`${API}/trips`),
      axios.get(`${API}/suggestions`),
    ]).then(([f, t, s]) => {
      setFamily(f.data);
      setTrips(t.data);
      setSuggestions(s.data);
    }).catch(console.error);
  }, []);

  const trip = trips[0];
  const addedTips = suggestions.filter(s => s.added_to_trip).length;

  // countdown
  const daysUntil = trip
    ? Math.max(0, Math.ceil((new Date(trip.start_date) - new Date()) / 86400000))
    : null;

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero */}
      <section className="hero-section" data-testid="hero-section">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=1920&q=80')" }}
        />
        <div className="hero-overlay" />
        <motion.div
          className="hero-content text-white"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Plane className="w-12 h-12 mx-auto mb-4 text-[#E9C46A] animate-float" />
          <h1 className="font-fraunces text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 tracking-tight">
            Familie Dahrendorf
          </h1>
          <h2 className="font-fraunces text-lg sm:text-xl font-light text-[#E9C46A] mb-6">
            USA Westkuste 2026
          </h2>

          {daysUntil !== null && (
            <motion.div
              className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="font-fraunces text-3xl sm:text-4xl font-bold text-[#E9C46A]">{daysUntil}</span>
              <span className="font-nunito text-sm text-white/90 text-left leading-tight">
                Tage bis<br />zum Abflug
              </span>
            </motion.div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/route" data-testid="cta-route">
              <button className="btn-primary flex items-center gap-2 bg-[#2A9D8F] hover:bg-[#238b7e]">
                <MapPinned className="w-4 h-4" />
                Route ansehen
              </button>
            </Link>
            <Link to="/planen" data-testid="cta-plan">
              <button className="btn-outline border-white text-white hover:bg-white/15">
                <CalendarDays className="w-4 h-4 inline mr-1" />
                Reiseplan
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Quick Stats */}
      <section className="py-10 px-4" data-testid="quick-stats">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: CalendarDays, label: "26 Tage", sub: "Roadtrip", color: "#264653" },
            { icon: MapPinned, label: "11 Stopps", sub: "Hauptroute", color: "#2A9D8F" },
            { icon: Sparkles, label: `${addedTips}/${suggestions.length}`, sub: "Tipps eingeplant", color: "#E76F51" },
            { icon: Users, label: `${family.length}`, sub: "Abenteurer", color: "#E9C46A" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="glass-panel p-4 text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
              <div className="font-fraunces text-xl font-bold text-[#264653]">{stat.label}</div>
              <div className="font-nunito text-xs text-[#8D99AE]">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trip Overview */}
      {trip && (
        <section className="px-4 pb-10" data-testid="trip-overview">
          <div className="max-w-4xl mx-auto glass-panel p-6">
            <h2 className="font-fraunces text-xl font-bold text-[#264653] mb-1">{trip.title}</h2>
            <p className="font-nunito text-sm text-[#8D99AE] mb-4">
              {trip.start_date} bis {trip.end_date}
            </p>
            <p className="font-nunito text-sm text-[#264653] whitespace-pre-line leading-relaxed">
              {trip.description}
            </p>
            <Link to="/route" className="inline-flex items-center gap-1 mt-4 text-[#2A9D8F] font-nunito font-semibold text-sm hover:underline">
              Route auf der Karte <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Family Preview */}
      <section className="px-4 pb-10" data-testid="family-preview">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-fraunces text-lg font-bold text-[#264653] mb-4 text-center">
            Die Abenteurer
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {family.map((m, i) => (
              <motion.div
                key={m.id}
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.05 * i, type: "spring" }}
              >
                {m.avatar_url ? (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-md mx-auto mb-1">
                    <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl border-2 border-white shadow-md mx-auto mb-1"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.emoji}
                  </div>
                )}
                <span className="font-nunito text-xs font-semibold text-[#264653]">{m.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 pb-12" data-testid="quick-links">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { to: "/packen", icon: CheckSquare, title: "Packliste", desc: "Nichts vergessen", color: "#2A9D8F" },
            { to: "/planen", icon: Sparkles, title: "Tipps & Planen", desc: "Alex' Empfehlungen", color: "#E76F51" },
            { to: "/familie", icon: Users, title: "Familie", desc: "Alle Mitglieder", color: "#264653" },
          ].map((link, i) => (
            <Link key={i} to={link.to}>
              <motion.div
                className="glass-panel p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
                whileHover={{ y: -2 }}
                data-testid={`quick-link-${link.title.toLowerCase()}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${link.color}15` }}>
                  <link.icon className="w-5 h-5" style={{ color: link.color }} />
                </div>
                <div>
                  <div className="font-nunito font-semibold text-sm text-[#264653]">{link.title}</div>
                  <div className="font-nunito text-xs text-[#8D99AE]">{link.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8D99AE] ml-auto" />
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
