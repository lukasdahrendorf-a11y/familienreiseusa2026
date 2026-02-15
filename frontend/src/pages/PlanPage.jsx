import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../App";
import { toast } from "sonner";
import {
  MapPin, Clock, Check, Plus, Sparkles, ChevronDown, ChevronUp,
  Mountain, TreePine, Flame, CalendarDays, Plane, Beef,
  Hotel, Tent, Car, Caravan, Ticket, Phone, Mail, Hash,
  GripVertical, Trash2, RotateCcw
} from "lucide-react";
import { Button } from "../components/ui/button";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ============ DATA ============

const accommodations = [
  { type: "hotel", name: "Bellagio Las Vegas", address: "3600 Las Vegas Blvd South, Las Vegas, NV 89109", dates: "17.-20. Juli 2026", nights: "3 Nachte", conf: "77L0ZCMSRS", phone: "888.987.6667", detail: "Fountain View Two Queen, MGM Rewards" },
  { type: "hotel", name: "Marina Escape 2BR Townhouse", address: "13924 Marquesas Way, Los Angeles, CA 90292", dates: "20.-23. Juli 2026", nights: "3 Nachte", conf: "6920124976", phone: "+1 818-388-2847", detail: "2-Schlafzimmer Apartment, Kostenlos Parken" },
  { type: "hotel", name: "Wuksachi Lodge", address: "64740 Wuksachi Way, Sequoia NP, CA 93262", dates: "23.-25. Juli 2026", nights: "2 Nachte", conf: "404SF358498", phone: "866-762-1325", detail: "Superior Room Two Queen Beds" },
  { type: "hotel", name: "The Ahwahnee", address: "1 Ahwahnee Dr., Yosemite NP, CA 95389", dates: "25.-27. Juli 2026", nights: "2 Nachte", conf: "100058968 / 16K3CM", detail: "Prime View Double" },
  { type: "hotel", name: "Argonaut Hotel", address: "495 Jefferson St, Fisherman's Wharf, San Francisco, CA 94109", dates: "27.-29. Juli 2026", nights: "2 Nachte", conf: "5018972355", phone: "+1 415-563-0800", detail: "Room with 2 Queen Beds" },
  { type: "camp", name: "Benbow KOA Holiday", address: "7000 Benbow Drive, Garberville, CA 95542", dates: "29.-30. Juli 2026", nights: "1 Nacht", conf: "21208357", phone: "1-707-923-2777", email: "koabenbow@gmail.com", detail: "Premium Pull Thru, 55', Full Hookups" },
  { type: "camp", name: "Crescent City/Redwoods KOA Holiday", address: "4241 Highway 101 North, Crescent City, CA 95531", dates: "30. Jul-1. Aug 2026", nights: "2 Nachte", phone: "1-707-464-5744", email: "info@crescentcitykoa.com", detail: "RV Sites" },
  { type: "camp", name: "Waldport/Newport KOA Journey", address: "1330 NW Pacific Coast Hwy, Waldport, OR 97394", dates: "2.-3. Aug 2026", nights: "1 Nacht", phone: "1-800-562-3443", email: "guestservices@waldportkoa.com", detail: "All Sites" },
  { type: "camp", name: "Astoria/Warrenton/Seaside KOA Resort", address: "1100 NW Ridge Road, Hammond, OR 97121", dates: "3.-4. Aug 2026", nights: "1 Nacht", detail: "RV Sites" },
  { type: "hotel", name: "Residence Inn by Marriott Seattle", address: "1815 Terry Avenue, Belltown, Seattle, WA 98101", dates: "9.-11. Aug 2026", nights: "2 Nachte", conf: "5439641356", phone: "+1 206-388-1000", detail: "Suite 2 Queen Beds + Sofa Bed, Fruhstuck inkl." },
];

const activities = [
  { name: "Universal Studios Hollywood VIP Tour", date: "22. Juli 2026, 09:30", location: "1000 Universal Studios Blvd, North Hollywood, CA 91602", conf: "GYGVN3HA5MNH", detail: "5 Personen, Treffpunkt: VIP-Empfang rechts vom Haupteingang, Ankunft 09:10, Gratis Parken: Frankenstein Valet Garage", phone: "+1 800 864 8377" },
];

const transport = [
  { type: "car", name: "Mietwagen - Hertz (BSP Auto)", vehicle: "GMC Yukon oder ahnlich, Full Size SUV, 7-Sitze", dates: "17.-29. Juli 2026", pickup: "Las Vegas Airport Harry Reid (LAS)", dropoff: "Pleasanton, Hopyard Rd & Stoneridge Dr, CA 94588", conf: "928654200445", detail: "Vollkasko ohne Selbstbeteiligung, unbegrenzte km" },
  { type: "rv", name: "Wohnmobil - TUI Camper (ADAC)", vehicle: "Wohnmobil, 12 Tage", dates: "29. Juli - 9. Aug 2026", pickup: "Pleasanton/San Francisco Bereich", dropoff: "Seattle Bereich", conf: "C1001879", detail: "Online Check-in erforderlich, ADAC Tel: +49 89 7676 2447" },
];

const itinerary = [
  { day: "1-3", dates: "17.-20. Juli", place: "Las Vegas", info: "Ankunft, Strip, Helikopterflug", color: "#E76F51", accom: "Bellagio Las Vegas", lat: 36.1699, lng: -115.1398 },
  { day: "4-6", dates: "20.-23. Juli", place: "Los Angeles & Disneyland", info: "Disneyland, Hollywood, Santa Monica", color: "#E9C46A", accom: "Marina Escape Townhouse", lat: 34.0522, lng: -118.2437 },
  { day: "6", dates: "22. Juli", place: "Universal Studios VIP Tour", info: "Ganztagesausflug, 09:30 Uhr", color: "#E9C46A", activity: true, lat: 34.1381, lng: -118.3534 },
  { day: "7-8", dates: "23.-25. Juli", place: "Sequoia NP", info: "General Sherman Tree", color: "#2A9D8F", accom: "Wuksachi Lodge", lat: 36.4864, lng: -118.5658 },
  { day: "9-10", dates: "25.-27. Juli", place: "Yosemite NP", info: "El Capitan, Half Dome", color: "#2A9D8F", accom: "The Ahwahnee", lat: 37.8651, lng: -119.5383 },
  { day: "11-12", dates: "27.-29. Juli", place: "San Francisco", info: "Cable Car, Alcatraz, Wohnmobil-Ubernahme", color: "#E9C46A", accom: "Argonaut Hotel", lat: 37.7749, lng: -122.4194 },
  { day: "13", dates: "29.-30. Juli", place: "Redwood NP - Sud", info: "Avenue of the Giants", color: "#2A9D8F", accom: "Benbow KOA Holiday, Garberville", lat: 40.0688, lng: -123.7893 },
  { day: "14-15", dates: "30. Jul-1. Aug", place: "Redwood NP - Nord", info: "Redwood Nationalpark", color: "#2A9D8F", accom: "Crescent City/Redwoods KOA", lat: 41.8028, lng: -124.1637 },
  { day: "16", dates: "2.-3. Aug", place: "Oregon Coast - Sud", info: "Waldport/Newport", color: "#264653", accom: "Waldport/Newport KOA Journey", lat: 44.4268, lng: -124.0695 },
  { day: "17-18", dates: "3.-4. Aug", place: "Oregon Coast - Nord", info: "Astoria, Cannon Beach", color: "#264653", accom: "Astoria/Seaside KOA Resort", lat: 46.1785, lng: -123.9543 },
  { day: "19-21", dates: "4.-6. Aug", place: "Olympic NP", info: "Hoh Rainforest", color: "#2A9D8F", lat: 47.8021, lng: -123.6044 },
  { day: "24-26", dates: "9.-11. Aug", place: "Seattle", info: "Space Needle, Ende & Ruckflug", color: "#E76F51", accom: "Residence Inn Marriott", lat: 47.6062, lng: -122.3321 },
];

// ============ SORTABLE ITEM ============

const SortableStop = ({ item, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-start relative">
      <button {...attributes} {...listeners} className="mt-3 p-1 text-[#8D99AE] hover:text-[#264653] cursor-grab active:cursor-grabbing touch-none flex-shrink-0" data-testid={`drag-${item.id}`}>
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 border-2 border-white shadow-sm mt-1" style={{ backgroundColor: item.color }}>
        {item.day}
      </div>
      <div className={`flex-1 rounded-xl border p-3 ${item.activity ? "bg-[#E9C46A]/10 border-[#E9C46A]/30" : "bg-white border-[#E0E0D0]"}`}>
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <h3 className="font-nunito font-semibold text-sm text-[#264653]">
              {item.activity && <Ticket className="w-3.5 h-3.5 inline mr-1 text-[#E9C46A]" />}
              {item.place}
            </h3>
            <p className="font-nunito text-xs text-[#8D99AE] mt-0.5">{item.info}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <span className="font-nunito text-[10px] text-[#8D99AE]">{item.dates}</span>
            <button onClick={() => onDelete(item.id)} className="p-1 text-[#8D99AE] hover:text-[#E76F51] transition-colors" data-testid={`delete-stop-${item.id}`}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {item.accom && (
          <div className="mt-2 pt-2 border-t border-[#E0E0D0]/60 flex items-start gap-1.5">
            <MapPin className="w-3 h-3 text-[#2A9D8F] mt-0.5 flex-shrink-0" />
            <span className="font-nunito text-[11px] text-[#2A9D8F] leading-tight">{item.accom}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ COMPONENT ============

const STORAGE_KEY = "dahrendorf_itinerary";
const DEFAULT_ITINERARY = itinerary.map((item, idx) => ({ ...item, id: `stop-${idx}` }));

const PlanPage = () => {
  const [trips, setTrips] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("plan");

  // Draggable itinerary state
  const [stops, setStops] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_ITINERARY;
    } catch { return DEFAULT_ITINERARY; }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const saveStops = useCallback((newStops) => {
    setStops(newStops);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStops));
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = stops.findIndex(s => s.id === active.id);
      const newIndex = stops.findIndex(s => s.id === over.id);
      saveStops(arrayMove(stops, oldIndex, newIndex));
      toast.success("Route aktualisiert");
    }
  }, [stops, saveStops]);

  const deleteStop = useCallback((id) => {
    saveStops(stops.filter(s => s.id !== id));
    toast.success("Stopp entfernt");
  }, [stops, saveStops]);

  const resetStops = useCallback(() => {
    saveStops(DEFAULT_ITINERARY);
    toast.success("Route zuruckgesetzt");
  }, [saveStops]);

  const addTipToRoute = useCallback((sug) => {
    const exists = stops.some(s => s.place === sug.title);
    if (exists) { toast.info(`${sug.title} ist bereits in der Route`); return; }
    const newStop = {
      id: `tip-${sug.id}`,
      day: "*",
      dates: sug.duration,
      place: sug.title,
      info: sug.location,
      color: "#F4A261",
      isTip: true,
      lat: sug.latitude,
      lng: sug.longitude,
    };
    // Insert before Seattle (last stop)
    const newStops = [...stops];
    newStops.splice(newStops.length - 1, 0, newStop);
    saveStops(newStops);
    toast.success(`${sug.title} zur Route hinzugefugt!`);
  }, [stops, saveStops]);

  const isTipInRoute = useCallback((title) => {
    return stops.some(s => s.place === title);
  }, [stops]);

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
      toast.success(res.data.added_to_trip ? `${sug.title} eingeplant!` : `${sug.title} entfernt`);
    } catch { toast.error("Fehler"); }
  };

  const getIcon = (title) => {
    if (title.includes("Helens")) return Flame;
    if (title.includes("Leavenworth")) return TreePine;
    if (title.includes("Chuckwagon") || title.includes("Bar J")) return Beef;
    return Mountain;
  };

  const trip = trips[0];
  const addedCount = suggestions.filter(s => s.added_to_trip).length;

  const tabs = [
    { id: "plan", label: "Tagesplan", icon: CalendarDays },
    { id: "accom", label: "Unterkunfte", icon: Hotel },
    { id: "activities", label: "Aktivitaten", icon: Ticket },
    { id: "transport", label: "Fortbewegung", icon: Car },
    { id: "tipps", label: "Tipps", icon: Sparkles },
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

      {/* Tabs - horizontal scroll on mobile */}
      <div className="bg-white border-b border-[#E0E0D0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-nunito font-semibold text-xs whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === t.id
                  ? t.id === "tipps" ? "bg-[#E76F51] text-white" : "bg-[#264653] text-white"
                  : "bg-[#F0EFEB] text-[#264653] hover:bg-[#E0E0D0]"
              }`}
              data-testid={`tab-${t.id}`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
              {t.id === "tipps" && addedCount > 0 && (
                <span className="w-4 h-4 bg-[#2A9D8F] text-white text-[9px] font-bold rounded-full flex items-center justify-center ml-0.5">
                  {addedCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="max-w-4xl mx-auto">

          {/* ========== TAGESPLAN ========== */}
          {activeTab === "plan" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-fraunces text-lg font-bold text-[#264653]">Tagesplan</h2>
                <div className="flex gap-2">
                  <button onClick={resetStops} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-nunito font-semibold text-[#8D99AE] hover:text-[#264653] bg-[#F0EFEB] rounded-lg transition-colors" data-testid="reset-stops">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
              </div>
              <p className="font-nunito text-xs text-[#8D99AE] mb-3">Stopps per Drag & Drop verschieben oder loschen</p>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {stops.map((item) => (
                      <SortableStop key={item.id} item={item} onDelete={deleteStop} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {stops.length === 0 && (
                <div className="text-center py-8">
                  <p className="font-nunito text-sm text-[#8D99AE]">Alle Stopps entfernt.</p>
                  <button onClick={resetStops} className="mt-2 text-[#2A9D8F] font-semibold text-sm">Route zurucksetzen</button>
                </div>
              )}

              {addedCount > 0 && (
                <div className="mt-5 p-4 bg-[#2A9D8F]/10 rounded-xl border border-[#2A9D8F]/20">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#2A9D8F]" />
                    <span className="font-nunito font-semibold text-sm text-[#2A9D8F]">
                      {addedCount} Tipp{addedCount > 1 ? "s" : ""} eingeplant
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {suggestions.filter(s => s.added_to_trip).map(s => (
                      <span key={s.id} className="px-2 py-1 bg-white rounded-lg text-xs font-nunito text-[#264653]">{s.title}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ========== UNTERKÜNFTE ========== */}
          {activeTab === "accom" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-fraunces text-lg font-bold text-[#264653] mb-4">Unterkunfte</h2>
              <div className="space-y-3">
                {accommodations.map((a, idx) => (
                  <motion.div key={idx}
                    className="bg-white rounded-xl border border-[#E0E0D0] p-4"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    data-testid={`accom-${idx}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${a.type === "camp" ? "bg-[#2A9D8F]/15" : "bg-[#264653]/10"}`}>
                        {a.type === "camp" ? <Tent className="w-4.5 h-4.5 text-[#2A9D8F]" /> : <Hotel className="w-4.5 h-4.5 text-[#264653]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-nunito font-bold text-sm text-[#264653]">{a.name}</h3>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${a.type === "camp" ? "bg-[#2A9D8F]/15 text-[#2A9D8F]" : "bg-[#264653]/10 text-[#264653]"}`}>
                            {a.type === "camp" ? "CAMPING" : "HOTEL"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <CalendarDays className="w-3 h-3 text-[#E9C46A]" />
                          <span className="font-nunito text-xs font-medium text-[#264653]">{a.dates}</span>
                          <span className="text-[10px] text-[#8D99AE]">({a.nights})</span>
                        </div>
                        <div className="flex items-start gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-[#8D99AE] mt-0.5 flex-shrink-0" />
                          <span className="font-nunito text-[11px] text-[#8D99AE] leading-tight">{a.address}</span>
                        </div>
                        <p className="font-nunito text-[11px] text-[#264653] mt-1.5">{a.detail}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                          {a.conf && (
                            <span className="flex items-center gap-1 text-[10px] text-[#8D99AE]">
                              <Hash className="w-2.5 h-2.5" /> {a.conf}
                            </span>
                          )}
                          {a.phone && (
                            <span className="flex items-center gap-1 text-[10px] text-[#8D99AE]">
                              <Phone className="w-2.5 h-2.5" /> {a.phone}
                            </span>
                          )}
                          {a.email && (
                            <span className="flex items-center gap-1 text-[10px] text-[#8D99AE]">
                              <Mail className="w-2.5 h-2.5" /> {a.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ========== AKTIVITÄTEN ========== */}
          {activeTab === "activities" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-fraunces text-lg font-bold text-[#264653] mb-4">Aktivitaten</h2>
              <div className="space-y-3">
                {activities.map((a, idx) => (
                  <motion.div key={idx}
                    className="bg-white rounded-xl border border-[#E0E0D0] p-4"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    data-testid={`activity-${idx}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#E9C46A]/15 flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-4.5 h-4.5 text-[#E9C46A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-nunito font-bold text-sm text-[#264653]">{a.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <CalendarDays className="w-3 h-3 text-[#E9C46A]" />
                          <span className="font-nunito text-xs font-medium text-[#264653]">{a.date}</span>
                        </div>
                        <div className="flex items-start gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-[#8D99AE] mt-0.5 flex-shrink-0" />
                          <span className="font-nunito text-[11px] text-[#8D99AE] leading-tight">{a.location}</span>
                        </div>
                        <p className="font-nunito text-[11px] text-[#264653] mt-1.5">{a.detail}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                          {a.conf && <span className="flex items-center gap-1 text-[10px] text-[#8D99AE]"><Hash className="w-2.5 h-2.5" /> {a.conf}</span>}
                          {a.phone && <span className="flex items-center gap-1 text-[10px] text-[#8D99AE]"><Phone className="w-2.5 h-2.5" /> {a.phone}</span>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ========== FORTBEWEGUNG ========== */}
          {activeTab === "transport" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-fraunces text-lg font-bold text-[#264653] mb-4">Fortbewegung</h2>
              <div className="space-y-3">
                {transport.map((t, idx) => (
                  <motion.div key={idx}
                    className="bg-white rounded-xl border border-[#E0E0D0] p-4"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                    data-testid={`transport-${idx}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${t.type === "rv" ? "bg-[#F4A261]/15" : "bg-[#264653]/10"}`}>
                        {t.type === "rv" ? <Caravan className="w-4.5 h-4.5 text-[#F4A261]" /> : <Car className="w-4.5 h-4.5 text-[#264653]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-nunito font-bold text-sm text-[#264653]">{t.name}</h3>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${t.type === "rv" ? "bg-[#F4A261]/15 text-[#F4A261]" : "bg-[#264653]/10 text-[#264653]"}`}>
                            {t.type === "rv" ? "WOHNMOBIL" : "MIETWAGEN"}
                          </span>
                        </div>
                        <p className="font-nunito text-xs text-[#8D99AE] mt-0.5">{t.vehicle}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <CalendarDays className="w-3 h-3 text-[#E9C46A]" />
                          <span className="font-nunito text-xs font-medium text-[#264653]">{t.dates}</span>
                        </div>
                        <div className="mt-2 space-y-1.5 bg-[#F9F9F7] rounded-lg p-2.5">
                          <div className="flex items-start gap-1.5">
                            <span className="text-[10px] font-bold text-[#2A9D8F] mt-0.5">ANMIETUNG</span>
                            <span className="font-nunito text-[11px] text-[#264653]">{t.pickup}</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <span className="text-[10px] font-bold text-[#E76F51] mt-0.5">ABGABE</span>
                            <span className="font-nunito text-[11px] text-[#264653] ml-[13px]">{t.dropoff}</span>
                          </div>
                        </div>
                        <p className="font-nunito text-[11px] text-[#264653] mt-1.5">{t.detail}</p>
                        {t.conf && (
                          <span className="flex items-center gap-1 text-[10px] text-[#8D99AE] mt-1.5">
                            <Hash className="w-2.5 h-2.5" /> {t.conf}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ========== TIPPS ========== */}
          {activeTab === "tipps" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E76F51]/10 rounded-full mb-3">
                  <Sparkles className="w-4 h-4 text-[#E76F51]" />
                  <span className="font-nunito font-semibold text-[#E76F51] text-xs">Alex' Empfehlungen</span>
                </div>
                <h2 className="font-fraunces text-xl font-bold text-[#264653] mb-1">Optionale Highlights</h2>
                <p className="font-nunito text-sm text-[#8D99AE]">Wahlt aus, was euch interessiert!</p>
              </div>
              <div className="space-y-5">
                {suggestions.map((sug, idx) => {
                  const Icon = getIcon(sug.title);
                  const isExpanded = expandedId === sug.id;
                  return (
                    <motion.div key={sug.id}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-colors ${sug.added_to_trip ? "border-[#2A9D8F] shadow-[#2A9D8F]/10" : "border-transparent hover:border-[#E0E0D0]"}`}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                      data-testid={`suggestion-card-${idx}`}>
                      <div className="relative">
                        <img src={sug.image_url} alt={sug.title} className="w-full h-44 sm:h-52 object-cover" loading="lazy"
                          onError={(e) => { e.target.style.display = "none"; }} data-testid={`suggestion-image-${idx}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {sug.is_extension && (
                          <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-[#E9C46A] rounded-full">
                            <span className="font-nunito font-bold text-[10px] text-[#264653]">VERLANGERUNG</span>
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
                      <div className="p-4">
                        <div className="flex flex-wrap gap-3 mb-3">
                          <span className="flex items-center gap-1.5 text-[#8D99AE] text-xs"><Clock className="w-3.5 h-3.5" /> {sug.duration}</span>
                          <span className="flex items-center gap-1.5 text-[#8D99AE] text-xs"><MapPin className="w-3.5 h-3.5" /> {sug.location.split(",")[1]?.trim()}</span>
                        </div>
                        <p className="font-nunito text-sm text-[#264653] leading-relaxed mb-3">{sug.description}</p>
                        {sug.highlights && sug.highlights.length > 0 && (
                          <>
                            <button onClick={() => setExpandedId(isExpanded ? null : sug.id)}
                              className="flex items-center gap-1.5 text-[#8D99AE] hover:text-[#264653] transition-colors mb-3">
                              <span className="font-nunito text-xs font-medium">{isExpanded ? "Weniger" : "Highlights"}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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
                        <Button onClick={() => toggleSuggestion(sug.id)}
                          className={`w-full py-2.5 rounded-xl font-nunito font-semibold text-sm transition-all ${sug.added_to_trip ? "bg-[#2A9D8F] hover:bg-[#238b7e] text-white" : "bg-[#264653] hover:bg-[#1d3640] text-white"}`}
                          data-testid={`toggle-suggestion-${idx}`}>
                          {sug.added_to_trip ? <><Check className="w-4 h-4 mr-1.5" /> Eingeplant</> : <><Plus className="w-4 h-4 mr-1.5" /> Zur Reise hinzufugen</>}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
                {!loading && suggestions.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 mx-auto text-[#8D99AE] mb-3" />
                    <h3 className="font-fraunces text-lg font-bold text-[#264653]">Keine Vorschlage</h3>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default PlanPage;
