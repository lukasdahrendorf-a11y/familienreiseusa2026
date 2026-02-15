import { useEffect, useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from "@react-google-maps/api";
import axios from "axios";
import { motion } from "framer-motion";
import { API } from "../App";
import { MapPin, Navigation, Loader2, Route, Clock, Calendar, Car, ExternalLink } from "lucide-react";

const mapContainerStyle = { width: "100%", height: "100%" };

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

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#a3ccff" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f2" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
  ],
};

const RoutePage = () => {
  const [selectedStop, setSelectedStop] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showOptional, setShowOptional] = useState(true);
  const [directions, setDirections] = useState(null);
  const [totalDistance, setTotalDistance] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    axios.get(`${API}/suggestions`).then(r => setSuggestions(r.data)).catch(console.error);
  }, []);

  // Calculate route using Directions API
  const calculateRoute = useCallback(() => {
    if (!isLoaded || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    const origin = { lat: routeStops[0].lat, lng: routeStops[0].lng };
    const destination = { lat: routeStops[routeStops.length - 1].lat, lng: routeStops[routeStops.length - 1].lng };
    const waypoints = routeStops.slice(1, -1).map(s => ({
      location: { lat: s.lat, lng: s.lng },
      stopover: true,
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
          // Calculate totals
          const legs = result.routes[0].legs;
          const distKm = legs.reduce((sum, l) => sum + l.distance.value, 0);
          const durSec = legs.reduce((sum, l) => sum + l.duration.value, 0);
          setTotalDistance(`${Math.round(distKm / 1000).toLocaleString("de-DE")} km`);
          setTotalDuration(`${Math.round(durSec / 3600)} Std.`);
        }
      }
    );
  }, [isLoaded]);

  const onLoad = useCallback(
    (mapInstance) => {
      mapRef.current = mapInstance;
      const bounds = new window.google.maps.LatLngBounds();
      routeStops.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
      mapInstance.fitBounds(bounds, { padding: 50 });
      // trigger route calculation
      calculateRoute();
    },
    [calculateRoute]
  );

  const scrollToStop = (stop) => {
    setSelectedStop(stop);
    mapRef.current?.panTo({ lat: stop.lat, lng: stop.lng });
    mapRef.current?.setZoom(8);
  };

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto text-[#E76F51] mb-3" />
          <h2 className="font-fraunces text-lg font-bold text-[#264653]">Karte nicht verfugbar</h2>
        </div>
      </div>
    );
  }

  const addedSuggestions = suggestions.filter((s) => s.added_to_trip);

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
            {totalDistance && (
              <span className="flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-[#E9C46A]" /> {totalDistance} &middot; {totalDuration}
              </span>
            )}
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
      <div className="h-[45vh] sm:h-[55vh]" data-testid="google-map">
        {!isLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-[#F0EFEB]">
            <Loader2 className="w-8 h-8 text-[#264653] animate-spin" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: 39.5, lng: -119.5 }}
            zoom={5}
            onLoad={onLoad}
            options={mapOptions}
          >
            {/* Directions Route */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: "#264653",
                    strokeOpacity: 0.85,
                    strokeWeight: 4,
                  },
                }}
              />
            )}

            {/* Main Markers */}
            {routeStops.map((stop, idx) => (
              <Marker
                key={stop.name}
                position={{ lat: stop.lat, lng: stop.lng }}
                onClick={() => setSelectedStop(stop)}
                label={{ text: String(idx + 1), color: "#fff", fontWeight: "bold", fontSize: "11px" }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 14,
                  fillColor: stop.color,
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 2,
                }}
              />
            ))}

            {/* Optional Markers */}
            {showOptional &&
              optionalStops.map((stop) => (
                <Marker
                  key={stop.name}
                  position={{ lat: stop.lat, lng: stop.lng }}
                  onClick={() => setSelectedStop(stop)}
                  icon={{
                    path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    scale: 6,
                    fillColor: stop.color,
                    fillOpacity: 1,
                    strokeColor: "#fff",
                    strokeWeight: 2,
                  }}
                />
              ))}

            {/* Info Window */}
            {selectedStop && (
              <InfoWindow position={{ lat: selectedStop.lat, lng: selectedStop.lng }} onCloseClick={() => setSelectedStop(null)}>
                <div className="p-1.5 min-w-[140px]">
                  <h3 className="font-bold text-[#264653] text-base">{selectedStop.name}</h3>
                  <p className="text-xs text-[#8D99AE]">{selectedStop.state}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-[#2A9D8F]" />
                    <span className="text-[#264653]">{selectedStop.dates || `Tag ${selectedStop.day}`}</span>
                  </div>
                  {selectedStop.accom && (
                    <p className="mt-1.5 text-[10px] text-[#2A9D8F] leading-tight">{selectedStop.accom}</p>
                  )}
                  {selectedStop.optional && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#F4A261]/20 text-[#F4A261] text-[10px] rounded-full font-semibold">
                      Alex-Tipp
                    </span>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
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
