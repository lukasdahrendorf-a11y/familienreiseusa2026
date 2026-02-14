import { useEffect, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from "@react-google-maps/api";
import axios from "axios";
import { motion } from "framer-motion";
import { API } from "../App";
import { MapPin, Navigation, Loader2, Route, Clock, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Route waypoints for USA West Coast 2026
const routeStops = [
  { name: "Las Vegas", state: "Nevada", lat: 36.1699, lng: -115.1398, day: "1-2", color: "#E76F51" },
  { name: "Los Angeles", state: "Kalifornien", lat: 34.0522, lng: -118.2437, day: "3-5", color: "#E9C46A" },
  { name: "Sequoia NP", state: "Kalifornien", lat: 36.4864, lng: -118.5658, day: "6-7", color: "#2A9D8F" },
  { name: "Yosemite NP", state: "Kalifornien", lat: 37.8651, lng: -119.5383, day: "8-10", color: "#2A9D8F" },
  { name: "San Francisco", state: "Kalifornien", lat: 37.7749, lng: -122.4194, day: "11-12", color: "#E9C46A" },
  { name: "Redwood NP", state: "Kalifornien", lat: 41.2132, lng: -124.0046, day: "13-15", color: "#2A9D8F" },
  { name: "Oregon Coast", state: "Oregon", lat: 45.8918, lng: -123.9615, day: "16-18", color: "#264653" },
  { name: "Olympic NP", state: "Washington", lat: 47.8021, lng: -123.6044, day: "19-21", color: "#2A9D8F" },
  { name: "Seattle", state: "Washington", lat: 47.6062, lng: -122.3321, day: "24-26", color: "#E76F51" },
];

// Optional stops (Alex suggestions)
const optionalStops = [
  { name: "Mt. St. Helens", state: "Washington", lat: 46.1914, lng: -122.1956, day: "22", color: "#F4A261", optional: true },
  { name: "Leavenworth", state: "Washington", lat: 47.5962, lng: -120.6615, day: "22-23", color: "#F4A261", optional: true },
  { name: "Yellowstone NP", state: "Wyoming", lat: 44.4280, lng: -110.5885, day: "+4-5", color: "#E76F51", optional: true, extension: true },
];

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#a3ccff" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f2" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#c9c9c9" }] },
  ],
};

const RoutePage = () => {
  const [map, setMap] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showOptional, setShowOptional] = useState(true);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(`${API}/suggestions`);
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };
    fetchSuggestions();
  }, []);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    // Fit bounds to show all stops
    const bounds = new window.google.maps.LatLngBounds();
    routeStops.forEach(stop => bounds.extend({ lat: stop.lat, lng: stop.lng }));
    mapInstance.fitBounds(bounds, { padding: 50 });
  }, []);

  const onUnmount = useCallback(() => setMap(null), []);

  // Create route path
  const routePath = routeStops.map(stop => ({ lat: stop.lat, lng: stop.lng }));

  // Get added suggestions
  const addedSuggestions = suggestions.filter(s => s.added_to_trip);

  if (loadError) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 mx-auto text-[#E76F51] mb-4" />
          <h2 className="font-fraunces text-xl font-bold text-[#264653]">Karte konnte nicht geladen werden</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7]" data-testid="route-page">
      {/* Header */}
      <div className="pt-20 pb-4 px-4 bg-[#264653] text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Route className="w-5 h-5 text-[#E9C46A]" />
            <span className="font-nunito text-sm text-white/70">USA Westküste 2026</span>
          </div>
          <h1 className="font-fraunces text-2xl sm:text-3xl font-bold mb-2">
            Unsere Route
          </h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E9C46A]" />
              <span>17. Juli - 11. August</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E9C46A]" />
              <span>{routeStops.length} Stopps</span>
            </div>
            {addedSuggestions.length > 0 && (
              <div className="flex items-center gap-2 text-[#F4A261]">
                <span>+ {addedSuggestions.length} Extras</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-white border-b border-[#E0E0D0]">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E76F51]" />
            <span className="text-[#264653]">Start/Ende</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2A9D8F]" />
            <span className="text-[#264653]">Nationalparks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E9C46A]" />
            <span className="text-[#264653]">Städte</span>
          </div>
          <button 
            onClick={() => setShowOptional(!showOptional)}
            className={`flex items-center gap-2 px-2 py-1 rounded-full transition-colors ${showOptional ? 'bg-[#F4A261]/20' : 'bg-gray-100'}`}
          >
            <div className="w-3 h-3 rounded-full bg-[#F4A261]" />
            <span className="text-[#264653]">Alex-Tipps {showOptional ? '✓' : ''}</span>
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="h-[50vh] sm:h-[60vh]" data-testid="google-map">
        {!isLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-[#F0EFEB]">
            <Loader2 className="w-10 h-10 text-[#264653] animate-spin" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: 39.5, lng: -119.5 }}
            zoom={5}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
          >
            {/* Route Line */}
            <Polyline
              path={routePath}
              options={{
                strokeColor: "#264653",
                strokeOpacity: 0.8,
                strokeWeight: 3,
              }}
            />

            {/* Main Route Markers */}
            {routeStops.map((stop, idx) => (
              <Marker
                key={stop.name}
                position={{ lat: stop.lat, lng: stop.lng }}
                onClick={() => setSelectedStop(stop)}
                label={{
                  text: String(idx + 1),
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 14,
                  fillColor: stop.color,
                  fillOpacity: 1,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 2,
                }}
              />
            ))}

            {/* Optional Markers (Alex Tips) */}
            {showOptional && optionalStops.map((stop) => (
              <Marker
                key={stop.name}
                position={{ lat: stop.lat, lng: stop.lng }}
                onClick={() => setSelectedStop(stop)}
                icon={{
                  path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                  scale: 6,
                  fillColor: stop.color,
                  fillOpacity: 1,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 2,
                }}
              />
            ))}

            {/* Info Window */}
            {selectedStop && (
              <InfoWindow
                position={{ lat: selectedStop.lat, lng: selectedStop.lng }}
                onCloseClick={() => setSelectedStop(null)}
              >
                <div className="p-2 min-w-[150px]">
                  <h3 className="font-fraunces text-lg font-bold text-[#264653]">{selectedStop.name}</h3>
                  <p className="text-sm text-[#8D99AE]">{selectedStop.state}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <Clock className="w-4 h-4 text-[#2A9D8F]" />
                    <span className="text-[#264653]">Tag {selectedStop.day}</span>
                  </div>
                  {selectedStop.optional && (
                    <span className="inline-block mt-2 px-2 py-1 bg-[#F4A261]/20 text-[#F4A261] text-xs rounded-full font-medium">
                      Alex-Tipp
                    </span>
                  )}
                  {selectedStop.extension && (
                    <span className="inline-block mt-1 px-2 py-1 bg-[#E76F51]/20 text-[#E76F51] text-xs rounded-full font-medium">
                      Verlängerung
                    </span>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>

      {/* Route List */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-fraunces text-xl font-bold text-[#264653] mb-4">Reiseverlauf</h2>
          
          <div className="space-y-2">
            {routeStops.map((stop, idx) => (
              <motion.div
                key={stop.name}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E0E0D0]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: stop.color }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-nunito font-semibold text-[#264653]">{stop.name}</h3>
                  <p className="text-xs text-[#8D99AE]">{stop.state}</p>
                </div>
                <div className="text-right">
                  <span className="font-nunito text-sm font-medium text-[#264653]">Tag {stop.day}</span>
                </div>
              </motion.div>
            ))}

            {/* Optional Stops */}
            {showOptional && (
              <>
                <div className="py-2 text-center">
                  <span className="text-xs text-[#F4A261] font-medium">── Alex-Tipps ──</span>
                </div>
                {optionalStops.map((stop, idx) => (
                  <motion.div
                    key={stop.name}
                    className="flex items-center gap-3 p-3 bg-[#F4A261]/10 rounded-xl border-2 border-dashed border-[#F4A261]/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#F4A261] flex items-center justify-center text-white">
                      ★
                    </div>
                    <div className="flex-1">
                      <h3 className="font-nunito font-semibold text-[#264653]">{stop.name}</h3>
                      <p className="text-xs text-[#8D99AE]">{stop.state}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-nunito text-sm font-medium text-[#F4A261]">
                        {stop.extension ? stop.day : `Tag ${stop.day}`}
                      </span>
                    </div>
                  </motion.div>
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
