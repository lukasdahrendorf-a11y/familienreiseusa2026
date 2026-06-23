import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import localApi from "../localApi";
import { MapPin, Navigation, Route, Clock, Calendar, Car, ExternalLink } from "lucide-react";

const routeStops = [
  { name: "Las Vegas", state: "Nevada", lat: 36.1699, lng: -115.1398, day: "1-2", color: "#E76F51", dates: "17.-18. Juli" },
  { name: "Los Angeles", state: "Kalifornien", lat: 34.0522, lng: -118.2437, day: "3-5", color: "#E9C46A", dates: "19.-21. Juli" },
  { name: "Sequoia NP", state: "Kalifornien", lat: 36.4864, lng: -118.5658, day: "6-7", color: "#2A9D8F", dates: "22.-23. Juli" },
  { name: "Yosemite NP", state: "Kalifornien", lat: 37.8651, lng: -119.5383, day: "8-10", color: "#2A9D8F", dates: "24.-26. Juli" },
  { name: "San Francisco", state: "Kalifornien", lat: 37.7749, lng: -122.4194, day: "11-12", color: "#E9C46A", dates: "27.-28. Juli" },
  { name: "Benbow KOA", state: "Kalifornien", lat: 40.0688, lng: -123.7893, day: "13", color: "#2A9D8F", dates: "29.-30. Juli", accom: "Benbow KOA Holiday, Garberville" },
  { name: "Crescent City KOA", state: "Kalifornien", lat: 41.8028, lng: -124.1637, day: "14-15", color: "#2A9D8F", dates: "30. Jul-1. Aug", accom: "Crescent City/Redwoods KOA" },
  { name: "Waldport KOA", state: "Oregon", lat: 44.4268, lng: -124.0695, day: "16", color: "#264653", dates: "2.-3. Aug", accom: "Waldport/Newport KOA Journey" },
  { name: "Astoria KOA", state: "Oregon", lat: 46.1785, lng: -123.9543, day: "17-18", color: "#264653", dates: "3.-4. Aug", accom: "Astoria/Warrenton/Seaside KOA" },
  { name: "Olympic NP", state: "Washington", lat: 47.8021, lng: -123.6044, day: "19-21", color: "#2A9D8F", dates: "4.-6. Aug" },
  { name: "Seattle", state: "Washington", lat: 47.6062, lng: -122.3321, day: "24-26", color: "#E76F51", dates: "9.-11. Aug" },
];

const optionalStops = [
  { name: "Mt. St. Helens", state: "Washington", lat: 46.1914, lng: -122.1956, day: "22", color: "#F4A261", optional: true, dates: "7. Aug" },
  { name: "Leavenworth", state: "Washington", lat: 47.5962, lng: -120.6615, day: "22-23", color: "#F4A261", optional: true, dates: "7.-8. Aug" },
  { name: "Yellowstone NP", state: "Wyoming", lat: 44.428, lng: -110.5885, day: "+4-5", color: "#E76F51", optional: true, extension: true, dates: "Optional" },
  { name: "Bar J Chuckwagon", state: "Wyoming", lat: 43.4799, lng: -110.8752, day: "Abend", color: "#F4A261", optional: true, dates: "Bei Yellowstone" },
];

// Create a numbered circle marker icon
function createCircleIcon(color, label) {
  const size = 28;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="white" font-size="11" font-weight="bold" font-family="sans-serif">${label}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Create a smaller diamond/arrow icon for optional stops
function createOptionalIcon(color) {
  const size = 22;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <polygon points="${size / 2},2 ${size - 2},${size / 2} ${size / 2},${size - 2} 2,${size / 2}" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="white" font-size="10" font-weight="bold" font-family="sans-serif">*</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Create a small circle icon for suggestion markers
function createSuggestionIcon() {
  const size = 14;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#E9C46A" stroke="white" stroke-width="1.5"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Helper component to fit bounds on mount and handle flyTo
function MapController({ mapRef, flyTarget, onFlyDone }) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
    const bounds = L.latLngBounds(routeStops.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, mapRef]);

  useEffect(() => {
    if (flyTarget) {
      map.flyTo([flyTarget.lat, flyTarget.lng], 8, { duration: 0.8 });
      onFlyDone();
    }
  }, [flyTarget, map, onFlyDone]);

  return null;
}

const RoutePage = () => {
  const [selectedStop, setSelectedStop] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showOptional, setShowOptional] = useState(true);
  const [flyTarget, setFlyTarget] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    localApi.getSuggestions().then(r => setSuggestions(r.data)).catch(console.error);
  }, []);

  const polylinePositions = useMemo(
    () => routeStops.map((s) => [s.lat, s.lng]),
    []
  );

  const scrollToStop = (stop) => {
    setSelectedStop(stop);
    setFlyTarget(stop);
  };

  const addedSuggestions = suggestions.filter((s) => s.added_to_trip);

  // Approximate total distance using haversine
  const { totalDistance, totalDuration } = useMemo(() => {
    let totalKm = 0;
    for (let i = 0; i < routeStops.length - 1; i++) {
      const a = routeStops[i];
      const b = routeStops[i + 1];
      const R = 6371;
      const dLat = ((b.lat - a.lat) * Math.PI) / 180;
      const dLng = ((b.lng - a.lng) * Math.PI) / 180;
      const sinLat = Math.sin(dLat / 2);
      const sinLng = Math.sin(dLng / 2);
      const h =
        sinLat * sinLat +
        Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
      totalKm += R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    }
    // Rough road factor ~1.3x straight-line distance
    const roadKm = Math.round(totalKm * 1.3);
    // Assume ~80 km/h average
    const hours = Math.round(roadKm / 80);
    return {
      totalDistance: `~${roadKm.toLocaleString("de-DE")} km`,
      totalDuration: `~${hours} Std.`,
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9F7]" data-testid="route-page">
      {/* Header */}
      <div className="bg-[#264653] text-white px-4 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Route className="w-4 h-4 text-[#E9C46A]" />
            <span className="font-nunito text-xs text-white/70">USA Westkuste 2026</span>
          </div>
          <h1 className="font-fraunces text-2xl sm:text-3xl font-bold" data-testid="route-title">
            Unsere Route
          </h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#E9C46A]" /> 17. Juli - 11. August
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#E9C46A]" /> {routeStops.length} Stopps
            </span>
            <span className="flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-[#E9C46A]" /> {totalDistance} &middot; {totalDuration}
            </span>
          </div>
          <button
            onClick={() => {
              const origin = `${routeStops[0].lat},${routeStops[0].lng}`;
              const dest = `${routeStops[routeStops.length - 1].lat},${routeStops[routeStops.length - 1].lng}`;
              const waypoints = routeStops.slice(1, -1).map(s => `${s.lat},${s.lng}`).join("|");
              window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&waypoints=${waypoints}&travelmode=driving`, "_blank");
            }}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-full text-xs font-semibold transition-colors"
            data-testid="export-google-maps"
          >
            <ExternalLink className="w-3.5 h-3.5" /> In Google Maps offnen
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2.5 bg-white border-b border-[#E0E0D0]">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E76F51]" /> Start/Ende</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2A9D8F]" /> Nationalparks</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E9C46A]" /> Stadte</span>
          <button
            onClick={() => setShowOptional(!showOptional)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-colors ${showOptional ? "bg-[#F4A261]/20" : "bg-gray-100"}`}
            data-testid="toggle-optional-stops"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#F4A261]" />
            Alex-Tipps {showOptional ? "an" : "aus"}
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="h-[45vh] sm:h-[55vh]" data-testid="leaflet-map">
        <MapContainer
          center={[39.5, -119.5]}
          zoom={5}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController
            mapRef={mapRef}
            flyTarget={flyTarget}
            onFlyDone={() => setFlyTarget(null)}
          />

          {/* Route polyline */}
          <Polyline
            positions={polylinePositions}
            pathOptions={{ color: "#264653", opacity: 0.85, weight: 4 }}
          />

          {/* Main stop markers */}
          {routeStops.map((stop, idx) => (
            <Marker
              key={stop.name}
              position={[stop.lat, stop.lng]}
              icon={createCircleIcon(stop.color, String(idx + 1))}
              eventHandlers={{ click: () => setSelectedStop(stop) }}
            >
              <Popup>
                <div className="p-1.5 min-w-[140px]">
                  <h3 className="font-bold text-[#264653] text-base">{stop.name}</h3>
                  <p className="text-xs text-[#8D99AE]">{stop.state}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-[#2A9D8F]" />
                    <span className="text-[#264653]">{stop.dates || `Tag ${stop.day}`}</span>
                  </div>
                  {stop.accom && (
                    <p className="mt-1.5 text-[10px] text-[#2A9D8F] leading-tight">{stop.accom}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Optional stop markers */}
          {showOptional &&
            optionalStops.map((stop) => (
              <Marker
                key={stop.name}
                position={[stop.lat, stop.lng]}
                icon={createOptionalIcon(stop.color)}
                eventHandlers={{ click: () => setSelectedStop(stop) }}
              >
                <Popup>
                  <div className="p-1.5 min-w-[140px]">
                    <h3 className="font-bold text-[#264653] text-base">{stop.name}</h3>
                    <p className="text-xs text-[#8D99AE]">{stop.state}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-[#2A9D8F]" />
                      <span className="text-[#264653]">{stop.dates || `Tag ${stop.day}`}</span>
                    </div>
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#F4A261]/20 text-[#F4A261] text-[10px] rounded-full font-semibold">
                      Alex-Tipp
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Added suggestion markers */}
          {addedSuggestions.map((s) =>
            s.lat && s.lng ? (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={createSuggestionIcon()}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-[#264653] text-sm">{s.title || s.name}</h3>
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>

      {/* Route List */}
      <div className="px-4 py-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-fraunces text-lg font-bold text-[#264653] mb-3">Reiseverlauf</h2>

          <div className="space-y-1.5">
            {routeStops.map((stop, idx) => (
              <motion.button
                key={stop.name}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                  selectedStop?.name === stop.name
                    ? "bg-[#264653]/5 border-[#264653]/30"
                    : "bg-white border-[#E0E0D0] hover:bg-[#F0EFEB]"
                }`}
                onClick={() => scrollToStop(stop)}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                data-testid={`route-stop-${idx}`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  style={{ backgroundColor: stop.color }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-nunito font-semibold text-sm text-[#264653]">{stop.name}</h3>
                  <p className="text-[11px] text-[#8D99AE]">{stop.state}</p>
                  {stop.accom && (
                    <p className="text-[10px] text-[#2A9D8F] mt-0.5">{stop.accom}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-nunito text-xs font-medium text-[#264653]">{stop.dates}</span>
                  <div className="text-[10px] text-[#8D99AE]">Tag {stop.day}</div>
                </div>
              </motion.button>
            ))}

            {/* Optional Section */}
            {showOptional && (
              <>
                <div className="py-2 text-center">
                  <span className="text-xs text-[#F4A261] font-semibold">-- Alex-Tipps --</span>
                </div>
                {optionalStops.map((stop, idx) => (
                  <motion.button
                    key={stop.name}
                    className="w-full flex items-center gap-3 p-3 bg-[#F4A261]/8 rounded-xl border-2 border-dashed border-[#F4A261]/25 text-left hover:bg-[#F4A261]/15 transition-colors"
                    onClick={() => scrollToStop(stop)}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.08 }}
                    data-testid={`route-optional-${idx}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#F4A261] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      *
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-nunito font-semibold text-sm text-[#264653]">{stop.name}</h3>
                      <p className="text-[11px] text-[#8D99AE]">{stop.state}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-nunito text-xs font-medium text-[#F4A261]">{stop.dates}</span>
                      {stop.extension && <div className="text-[10px] text-[#E76F51]">Verlängerung</div>}
                    </div>
                  </motion.button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePage;
