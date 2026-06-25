import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import localApi from "../localApi";
import { MapPin, Navigation, Route, Clock, Calendar, Car, ExternalLink } from "lucide-react";

const routeStops = [
  { name: "Las Vegas – Bellagio", state: "Nevada", lat: 36.1126, lng: -115.1767, day: "1-3", color: "#E76F51", dates: "17.-20. Juli", address: "Bellagio Hotel, 3600 S Las Vegas Blvd, Las Vegas, NV 89109", phone: "888-987-6667", checkin: "15:00", booking: "77L0ZCMSRS" },
  { name: "Los Angeles – Marina Escape", state: "Kalifornien", lat: 33.9802, lng: -118.4517, day: "4-6", color: "#E9C46A", dates: "20.-23. Juli", address: "Marina del Rey, Los Angeles, CA 90292", phone: "+1 818-388-2847", checkin: "15:00", booking: "6920124976" },
  { name: "Sequoia NP – Wuksachi Lodge", state: "Kalifornien", lat: 36.4864, lng: -118.5658, day: "7-8", color: "#2A9D8F", dates: "23.-25. Juli", address: "Wuksachi Lodge, 64740 Wuksachi Way, Sequoia NP, CA 93262", booking: "404SF358498" },
  { name: "Yosemite NP – The Ahwahnee", state: "Kalifornien", lat: 37.7468, lng: -119.5748, day: "9-10", color: "#2A9D8F", dates: "25.-27. Juli", address: "The Ahwahnee, 1 Ahwahnee Dr, Yosemite National Park, CA", checkin: "16:00", booking: "16K3CM" },
  { name: "San Francisco – Argonaut Hotel", state: "Kalifornien", lat: 37.8080, lng: -122.4177, day: "11-12", color: "#E9C46A", dates: "27.-29. Juli", address: "Argonaut Hotel, 495 Jefferson St, San Francisco, CA 94109", booking: "5018972355" },
  { name: "Benbow KOA", state: "Kalifornien", lat: 40.0688, lng: -123.7893, day: "13-17", color: "#2A9D8F", dates: "29. Jul-3. Aug", accom: "Benbow KOA Holiday (Wohnmobil)", address: "7000 Benbow Drive, Garberville, CA 95542", booking: "21208357" },
  { name: "Quileute – La Push", state: "Washington", lat: 47.9076, lng: -124.6353, day: "19", color: "#264653", dates: "4.-5. Aug", accom: "Quileute Oceanside Resort", address: "330 Ocean Front Drive, La Push, WA 98350", booking: "2026018118" },
  { name: "Port Angeles – Crescent Beach", state: "Washington", lat: 48.1614, lng: -123.7211, day: "20-21", color: "#2A9D8F", dates: "5.-7. Aug", accom: "Crescent Beach & RV Park", address: "2860 Crescent Beach Road, Port Angeles, WA 98363", phone: "360-928-3344", checkin: "15:00", booking: "269599" },
  { name: "Seattle – Sound Hotel", state: "Washington", lat: 47.6133, lng: -122.3467, day: "22", color: "#E76F51", dates: "7.-8. Aug", accom: "The Sound Hotel Belltown", address: "2120 4th Avenue, Seattle, WA 98121", phone: "+1 206-441-7456", checkin: "16:00", booking: "6917243789" },
  { name: "Seattle – Hotel 1000", state: "Washington", lat: 47.6050, lng: -122.3380, day: "25", color: "#E76F51", dates: "10.-11. Aug", accom: "Hotel 1000, Hyatt Unbound", address: "1000 1st Avenue, Seattle, WA 98104", phone: "+1 206-957-1000", checkin: "16:00", booking: "6369914287" },
];

const optionalStops = [
  { name: "Leavenworth – Berg Haus", state: "Washington", lat: 47.5962, lng: -120.6615, day: "23-24", color: "#F4A261", optional: true, dates: "8.-9. Aug", address: "18800 Beaver Valley Rd, Leavenworth, WA 98826", phone: "509-763-0180" },
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
              <motion.div
                key={stop.name}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  selectedStop?.name === stop.name
                    ? "bg-[#264653]/5 border-[#264653]/30"
                    : "bg-white border-[#E0E0D0] hover:bg-[#F0EFEB]"
                }`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                data-testid={`route-stop-${idx}`}
              >
                <button
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  style={{ backgroundColor: stop.color }}
                  onClick={() => scrollToStop(stop)}
                >
                  {idx + 1}
                </button>
                <button className="flex-1 min-w-0 text-left" onClick={() => scrollToStop(stop)}>
                  <h3 className="font-nunito font-semibold text-sm text-[#264653]">{stop.name}</h3>
                  <p className="text-[11px] text-[#8D99AE]">{stop.state}</p>
                  {stop.accom && (
                    <p className="text-[10px] text-[#2A9D8F] mt-0.5">{stop.accom}</p>
                  )}
                  {stop.phone && (
                    <p className="text-[10px] text-[#8D99AE] mt-0.5">Check-in: {stop.checkin} Uhr</p>
                  )}
                </button>
                <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                  <span className="font-nunito text-xs font-medium text-[#264653]">{stop.dates}</span>
                  <div className="text-[10px] text-[#8D99AE]">Tag {stop.day}</div>
                  <div className="flex gap-1.5">
                    {stop.phone && (
                      <a
                        href={`tel:${stop.phone}`}
                        className="flex items-center gap-1 px-2 py-1 bg-[#264653]/10 hover:bg-[#264653]/20 rounded-full text-[10px] font-semibold text-[#264653] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Anrufen</span>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address)}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-[#2A9D8F] hover:bg-[#238577] rounded-full text-[10px] font-semibold text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Navi</span>
                    </a>
                  </div>
                </div>
              </motion.div>
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
