import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { API } from "../App";
import { MapPin, Camera, Users, ArrowRight, Plane } from "lucide-react";

const HomePage = () => {
  const [family, setFamily] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [familyRes, tripsRes] = await Promise.all([
          axios.get(`${API}/family`),
          axios.get(`${API}/trips`)
        ]);
        setFamily(familyRes.data);
        setTrips(tripsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedTrips = trips.filter(t => t.status === "completed").length;
  const plannedTrips = trips.filter(t => t.status === "planned").length;

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-section" data-testid="hero-section">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1769674109636-5d7e503e77d7?w=1920&q=80')`,
          }}
        />
        <div className="hero-overlay" />
        
        <motion.div 
          className="hero-content text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mb-6"
          >
            <Plane className="w-16 h-16 mx-auto text-[#E9C46A] animate-float" />
          </motion.div>
          
          <h1 className="font-fraunces text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
            Lukas & Laura's
          </h1>
          <h2 className="font-fraunces text-3xl sm:text-4xl font-light mb-6 text-[#E9C46A]">
            Familien-Reisetagebuch
          </h2>
          <p className="font-nunito text-lg sm:text-xl max-w-xl mx-auto mb-8 opacity-90">
            Unsere gemeinsamen Abenteuer, Erinnerungen und Pläne – alles an einem Ort.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/trips" data-testid="cta-trips">
              <button className="btn-primary flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Reisen entdecken
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link to="/map" data-testid="cta-map">
              <button className="btn-outline bg-white/10 border-white text-white hover:bg-white/20">
                <MapPin className="w-5 h-5 inline mr-2" />
                Weltkarte
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F9F9F7]" data-testid="stats-section">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Family Members */}
            <div className="glass-panel p-8 text-center" data-testid="stat-family">
              <div className="flex justify-center mb-4">
                {family.slice(0, 5).map((member, idx) => (
                  <motion.div
                    key={member.id}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl -ml-2 first:ml-0 border-2 border-white shadow-md"
                    style={{ backgroundColor: member.color, zIndex: 5 - idx }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {member.emoji}
                  </motion.div>
                ))}
              </div>
              <h3 className="font-fraunces text-4xl font-bold text-[#264653]">{family.length}</h3>
              <p className="font-nunito text-[#8D99AE]">Familienmitglieder</p>
            </div>

            {/* Completed Trips */}
            <div className="glass-panel p-8 text-center" data-testid="stat-completed">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2A9D8F] flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-fraunces text-4xl font-bold text-[#264653]">{completedTrips}</h3>
              <p className="font-nunito text-[#8D99AE]">Abgeschlossene Reisen</p>
            </div>

            {/* Planned Trips */}
            <div className="glass-panel p-8 text-center" data-testid="stat-planned">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E9C46A] flex items-center justify-center">
                <MapPin className="w-8 h-8 text-[#264653]" />
              </div>
              <h3 className="font-fraunces text-4xl font-bold text-[#264653]">{plannedTrips}</h3>
              <p className="font-nunito text-[#8D99AE]">Geplante Abenteuer</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recent Trips Preview */}
      {trips.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F0EFEB]" data-testid="recent-trips-section">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="font-fraunces text-3xl sm:text-4xl font-bold text-[#264653] text-center mb-12">
                Unsere letzten Abenteuer
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trips.slice(0, 3).map((trip, idx) => (
                  <motion.div
                    key={trip.id}
                    className="memory-card"
                    initial={{ opacity: 0, rotate: idx % 2 === 0 ? 2 : -2 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    data-testid={`trip-preview-${idx}`}
                  >
                    <div className="aspect-[4/3] bg-[#F0EFEB] rounded-lg mb-4 overflow-hidden">
                      {trip.photos && trip.photos.length > 0 ? (
                        <img 
                          src={trip.photos[0].url} 
                          alt={trip.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-12 h-12 text-[#8D99AE]" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-fraunces text-xl font-bold text-[#264653]">{trip.title}</h3>
                    <p className="font-nunito text-sm text-[#8D99AE] flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {trip.location}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/trips">
                  <button className="btn-outline" data-testid="view-all-trips">
                    Alle Reisen anzeigen
                    <ArrowRight className="w-4 h-4 inline ml-2" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Family Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#264653]" data-testid="family-preview-section">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-fraunces text-3xl sm:text-4xl font-bold text-white mb-6">
              Die Abenteurer
            </h2>
            <p className="font-nunito text-lg text-white/80 mb-12">
              Lukas, Laura und ihre drei Kinder erkunden gemeinsam die Welt.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {family.map((member, idx) => (
                <motion.div
                  key={member.id}
                  className="text-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, type: "spring" }}
                >
                  <div 
                    className="family-avatar mx-auto mb-3"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.emoji}
                  </div>
                  <p className="font-nunito font-semibold text-white">{member.name}</p>
                  <p className="font-nunito text-sm text-white/60">
                    {member.role === "parent" ? "Elternteil" : "Kind"}
                  </p>
                </motion.div>
              ))}
            </div>

            <Link to="/family">
              <button className="btn-primary bg-[#E9C46A] text-[#264653] hover:bg-[#E9C46A]/90" data-testid="manage-family">
                <Users className="w-5 h-5 inline mr-2" />
                Familie verwalten
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#F9F9F7] border-t border-[#E0E0D0]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-nunito text-[#8D99AE]">
            Made with love for the family
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
