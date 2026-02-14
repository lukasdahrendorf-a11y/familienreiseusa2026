import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../App";
import { toast } from "sonner";
import { 
  MapPin, Clock, Check, Plus, Sparkles, ChevronDown, ChevronUp,
  Mountain, TreePine, Flame
} from "lucide-react";
import { Button } from "../components/ui/button";

const SuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${API}/suggestions`);
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestion = async (id) => {
    try {
      const response = await axios.patch(`${API}/suggestions/${id}/toggle`);
      setSuggestions(suggestions.map(s => 
        s.id === id ? { ...s, added_to_trip: response.data.added_to_trip } : s
      ));
      
      const suggestion = suggestions.find(s => s.id === id);
      if (response.data.added_to_trip) {
        toast.success(`${suggestion.title} zur Reise hinzugefügt!`);
      } else {
        toast.info(`${suggestion.title} von der Reise entfernt`);
      }
    } catch (error) {
      console.error("Error toggling suggestion:", error);
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const getIcon = (title) => {
    if (title.includes("Helens")) return Flame;
    if (title.includes("Leavenworth")) return TreePine;
    return Mountain;
  };

  const addedCount = suggestions.filter(s => s.added_to_trip).length;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#F9F9F7]" data-testid="suggestions-page">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E76F51]/10 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-[#E76F51]" />
              <span className="font-nunito font-semibold text-[#E76F51] text-sm">Alex' Empfehlungen</span>
            </div>
            <h1 className="font-fraunces text-3xl sm:text-4xl font-bold text-[#264653] mb-3">
              Optionale Highlights
            </h1>
            <p className="font-nunito text-[#8D99AE] max-w-lg mx-auto">
              Diese Orte könnt ihr in eure USA-Reise einplanen - wählt aus, was euch interessiert!
            </p>
            {addedCount > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#2A9D8F]/10 rounded-full">
                <Check className="w-4 h-4 text-[#2A9D8F]" />
                <span className="font-nunito font-medium text-[#2A9D8F] text-sm">
                  {addedCount} von {suggestions.length} eingeplant
                </span>
              </div>
            )}
          </div>

          {/* Suggestions Grid */}
          <div className="space-y-6">
            <AnimatePresence>
              {suggestions.map((suggestion, idx) => {
                const Icon = getIcon(suggestion.title);
                const isExpanded = expandedId === suggestion.id;
                
                return (
                  <motion.div
                    key={suggestion.id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all ${
                      suggestion.added_to_trip 
                        ? "border-[#2A9D8F] shadow-[#2A9D8F]/10" 
                        : "border-transparent hover:border-[#E0E0D0]"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    data-testid={`suggestion-${suggestion.id}`}
                  >
                    {/* Image & Title */}
                    <div className="relative">
                      <img 
                        src={suggestion.image_url} 
                        alt={suggestion.title}
                        className="w-full h-48 sm:h-56 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Extension Badge */}
                      {suggestion.is_extension && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-[#E9C46A] rounded-full">
                          <span className="font-nunito font-bold text-xs text-[#264653]">
                            VERLÄNGERUNG
                          </span>
                        </div>
                      )}
                      
                      {/* Added Badge */}
                      {suggestion.added_to_trip && (
                        <div className="absolute top-4 right-4 w-10 h-10 bg-[#2A9D8F] rounded-full flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                      
                      {/* Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-5 h-5 text-[#E9C46A]" />
                          <span className="font-nunito text-sm text-white/80">{suggestion.location}</span>
                        </div>
                        <h2 className="font-fraunces text-2xl font-bold text-white">
                          {suggestion.title}
                        </h2>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-2 text-[#8D99AE]">
                          <Clock className="w-4 h-4" />
                          <span className="font-nunito text-sm font-medium">{suggestion.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#8D99AE]">
                          <MapPin className="w-4 h-4" />
                          <span className="font-nunito text-sm">{suggestion.location.split(",")[1]?.trim()}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="font-nunito text-[#264653] text-sm leading-relaxed mb-4">
                        {suggestion.description}
                      </p>

                      {/* Expandable Highlights */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
                        className="flex items-center gap-2 text-[#8D99AE] hover:text-[#264653] transition-colors mb-4"
                      >
                        <span className="font-nunito text-sm font-medium">
                          {isExpanded ? "Weniger anzeigen" : "Highlights anzeigen"}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 p-4 bg-[#F9F9F7] rounded-xl">
                              {suggestion.highlights.map((highlight, hIdx) => (
                                <div key={hIdx} className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-[#2A9D8F]" />
                                  <span className="font-nunito text-sm text-[#264653]">{highlight}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Action Button */}
                      <Button
                        onClick={() => toggleSuggestion(suggestion.id)}
                        className={`w-full py-3 rounded-xl font-nunito font-semibold transition-all ${
                          suggestion.added_to_trip
                            ? "bg-[#2A9D8F] hover:bg-[#238b7e] text-white"
                            : "bg-[#264653] hover:bg-[#1d3640] text-white"
                        }`}
                        data-testid={`toggle-suggestion-${suggestion.id}`}
                      >
                        {suggestion.added_to_trip ? (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            Eingeplant
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5 mr-2" />
                            Zur Reise hinzufügen
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {!loading && suggestions.length === 0 && (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 mx-auto text-[#8D99AE] mb-4" />
              <h3 className="font-fraunces text-xl font-bold text-[#264653] mb-2">
                Keine Vorschläge vorhanden
              </h3>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SuggestionsPage;
