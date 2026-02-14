import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../App";
import { toast } from "sonner";
import {
  MapPin, Clock, Check, Plus, Sparkles, ChevronDown, ChevronUp,
  Mountain, TreePine, Flame, CalendarDays, Plane
} from "lucide-react";
import { Button } from "../components/ui/button";

const PlanPage = () => {
  const [trips, setTrips] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("plan"); // "plan" | "tipps"

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/trips`),
      axios.get(`${API}/suggestions`),
    ]).then(([t, s]) => {
      setTrips(t.data);
      setSuggestions(s.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggleSuggestion = async (id) => {
    try {
      const res = await axios.patch(`${API}/suggestions/${id}/toggle`);
      setSuggestions(suggestions.map(s =>
        s.id === id ? { ...s, added_to_trip: res.data.added_to_trip } : s
      ));
      const sug = suggestions.find(s => s.id === id);
      toast.success(res.data.added_to_trip
        ? `${sug.title} zur Reise hinzugefugt!`
        : `${sug.title} von der Reise entfernt`
      );
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const getIcon = (title) => {
    if (title.includes("Helens")) return Flame;
    if (title.includes("Leavenworth")) return TreePine;
    return Mountain;
  };

  const trip = trips[0];
  const addedCount = suggestions.filter(s => s.added_to_trip).length;

  // itinerary data
  const itinerary = [
    { day: "1-2", dates: "17.-18. Juli", place: "Las Vegas", info: "Ankunft, Strip, Helikopterflug", color: "#E76F51" },
    { day: "3-5", dates: "19.-21. Juli", place: "Los Angeles & Disneyland", info: "Disneyland, Hollywood, Santa Monica", color: "#E9C46A" },
    { day: "6-7", dates: "22.-23. Juli", place: "Sequoia NP", info: "General Sherman Tree", color: "#2A9D8F" },
    { day: "8-10", dates: "24.-26. Juli", place: "Yosemite NP", info: "El Capitan, Half Dome", color: "#2A9D8F" },
    { day: "11-12", dates: "27.-28. Juli", place: "San Francisco", info: "Cable Car, Alcatraz, Wohnmobil-Ubernahme", color: "#E9C46A" },
    { day: "13-15", dates: "29.-31. Juli", place: "Redwood NP", info: "Avenue of the Giants", color: "#2A9D8F" },
    { day: "16-18", dates: "1.-3. August", place: "Oregon Coast", info: "Cannon Beach", color: "#264653" },
    { day: "19-21", dates: "4.-6. August", place: "Olympic NP", info: "Hoh Rainforest", color: "#2A9D8F" },
    { day: "22-23", dates: "7.-8. August", place: "Alex-Tipps", info: "Mt. St. Helens & Leavenworth", color: "#F4A261" },
    { day: "24-26", dates: "9.-11. August", place: "Seattle", info: "Space Needle, Ende & Ruckflug", color: "#E76F51" },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F7]" data-testid="plan-page">
      {/* Header */}
      <div className="bg-[#264653] text-white px-4 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Plane className="w-4 h-4 text-[#E9C46A]" />
            <span className="font-nunito text-xs text-white/70">USA Westkuste 2026</span>
          </div>
          <h1 className="font-fraunces text-2xl sm:text-3xl font-bold">Reiseplanung</h1>
          {trip && (
            <p className="font-nunito text-sm text-white/70 mt-1">
              {trip.start_date} bis {trip.end_date} &middot; 26 Tage
            </p>
          )}
        </div>
      </div>

      {/* Tab Switch */}
      <div className="px-4 py-3 bg-white border-b border-[#E0E0D0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex gap-2">
          <button
            onClick={() => setActiveTab("plan")}
            className={`flex-1 py-2 rounded-xl font-nunito font-semibold text-sm transition-colors ${
              activeTab === "plan"
                ? "bg-[#264653] text-white"
                : "bg-[#F0EFEB] text-[#264653] hover:bg-[#E0E0D0]"
            }`}
            data-testid="tab-plan"
          >
            <CalendarDays className="w-4 h-4 inline mr-1" /> Reiseplan
          </button>
          <button
            onClick={() => setActiveTab("tipps")}
            className={`flex-1 py-2 rounded-xl font-nunito font-semibold text-sm transition-colors relative ${
              activeTab === "tipps"
                ? "bg-[#E76F51] text-white"
                : "bg-[#F0EFEB] text-[#264653] hover:bg-[#E0E0D0]"
            }`}
            data-testid="tab-tipps"
          >
            <Sparkles className="w-4 h-4 inline mr-1" /> Tipps
            {addedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#2A9D8F] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {addedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="max-w-4xl mx-auto">
          {/* PLAN TAB */}
          {activeTab === "plan" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-fraunces text-lg font-bold text-[#264653] mb-4">Tagesplan</h2>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-[#E0E0D0]" />

                <div className="space-y-3">
                  {itinerary.map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="flex gap-3 items-start relative"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      {/* dot */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 z-[1] border-2 border-white shadow-sm"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.day}
                      </div>
                      {/* content */}
                      <div className="flex-1 bg-white rounded-xl border border-[#E0E0D0] p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-nunito font-semibold text-sm text-[#264653]">{item.place}</h3>
                            <p className="font-nunito text-xs text-[#8D99AE] mt-0.5">{item.info}</p>
                          </div>
                          <span className="font-nunito text-[10px] text-[#8D99AE] flex-shrink-0 ml-2">{item.dates}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Added suggestions indicator */}
              {addedCount > 0 && (
                <div className="mt-6 p-4 bg-[#2A9D8F]/10 rounded-xl border border-[#2A9D8F]/20">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#2A9D8F]" />
                    <span className="font-nunito font-semibold text-sm text-[#2A9D8F]">
                      {addedCount} Tipp{addedCount > 1 ? "s" : ""} eingeplant
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {suggestions.filter(s => s.added_to_trip).map(s => (
                      <span key={s.id} className="px-2 py-1 bg-white rounded-lg text-xs font-nunito text-[#264653]">
                        {s.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TIPPS TAB */}
          {activeTab === "tipps" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E76F51]/10 rounded-full mb-3">
                  <Sparkles className="w-4 h-4 text-[#E76F51]" />
                  <span className="font-nunito font-semibold text-[#E76F51] text-xs">Alex' Empfehlungen</span>
                </div>
                <h2 className="font-fraunces text-xl font-bold text-[#264653] mb-1">
                  Optionale Highlights
                </h2>
                <p className="font-nunito text-sm text-[#8D99AE]">
                  Wahlt aus, was euch interessiert!
                </p>
              </div>

              <div className="space-y-5">
                {suggestions.map((sug, idx) => {
                  const Icon = getIcon(sug.title);
                  const isExpanded = expandedId === sug.id;

                  return (
                    <motion.div
                      key={sug.id}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-colors ${
                        sug.added_to_trip
                          ? "border-[#2A9D8F] shadow-[#2A9D8F]/10"
                          : "border-transparent hover:border-[#E0E0D0]"
                      }`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      data-testid={`suggestion-card-${idx}`}
                    >
                      {/* Image */}
                      <div className="relative">
                        <img
                          src={sug.image_url}
                          alt={sug.title}
                          className="w-full h-44 sm:h-52 object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                          data-testid={`suggestion-image-${idx}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {sug.is_extension && (
                          <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-[#E9C46A] rounded-full">
                            <span className="font-nunito font-bold text-[10px] text-[#264653]">VERLÄNGERUNG</span>
                          </div>
                        )}
                        {sug.added_to_trip && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-[#2A9D8F] rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon className="w-4 h-4 text-[#E9C46A]" />
                            <span className="font-nunito text-xs text-white/80">{sug.location}</span>
                          </div>
                          <h2 className="font-fraunces text-xl font-bold text-white">{sug.title}</h2>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex flex-wrap gap-3 mb-3">
                          <span className="flex items-center gap-1.5 text-[#8D99AE] text-xs">
                            <Clock className="w-3.5 h-3.5" /> {sug.duration}
                          </span>
                          <span className="flex items-center gap-1.5 text-[#8D99AE] text-xs">
                            <MapPin className="w-3.5 h-3.5" /> {sug.location.split(",")[1]?.trim()}
                          </span>
                        </div>

                        <p className="font-nunito text-sm text-[#264653] leading-relaxed mb-3">
                          {sug.description}
                        </p>

                        {/* Expandable Highlights */}
                        {sug.highlights && sug.highlights.length > 0 && (
                          <>
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : sug.id)}
                              className="flex items-center gap-1.5 text-[#8D99AE] hover:text-[#264653] transition-colors mb-3"
                              data-testid={`expand-highlights-${idx}`}
                            >
                              <span className="font-nunito text-xs font-medium">
                                {isExpanded ? "Weniger" : "Highlights"}
                              </span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3 p-3 bg-[#F9F9F7] rounded-xl">
                                    {sug.highlights.map((h, i) => (
                                      <span key={i} className="flex items-center gap-1.5 text-xs text-[#264653]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#2A9D8F]" /> {h}
                                      </span>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        )}

                        {/* Action */}
                        <Button
                          onClick={() => toggleSuggestion(sug.id)}
                          className={`w-full py-2.5 rounded-xl font-nunito font-semibold text-sm transition-all ${
                            sug.added_to_trip
                              ? "bg-[#2A9D8F] hover:bg-[#238b7e] text-white"
                              : "bg-[#264653] hover:bg-[#1d3640] text-white"
                          }`}
                          data-testid={`toggle-suggestion-${idx}`}
                        >
                          {sug.added_to_trip ? (
                            <><Check className="w-4 h-4 mr-1.5" /> Eingeplant</>
                          ) : (
                            <><Plus className="w-4 h-4 mr-1.5" /> Zur Reise hinzufugen</>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {!loading && suggestions.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto text-[#8D99AE] mb-3" />
                  <h3 className="font-fraunces text-lg font-bold text-[#264653]">Keine Vorschlage</h3>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanPage;
