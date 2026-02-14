import { useEffect, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import axios from "axios";
import { motion } from "framer-motion";
import { API } from "../App";
import { MapPin, Calendar, Camera, Navigation, Loader2 } from "lucide-react";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 48.2082,
  lng: 16.3738, // Vienna, Austria as default
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#a3ccff" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f2" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ lightness: 100 }, { visibility: "simplified" }],
    },
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }],
    },
  ],
};

const MapPage = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [map, setMap] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get(`${API}/trips`);
        setTrips(response.data);
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };
    fetchTrips();
  }, []);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getMarkerColor = (status) => {
    switch (status) {
      case "completed":
        return "#2A9D8F";
      case "ongoing":
        return "#E76F51";
      case "planned":
        return "#E9C46A";
      default:
        return "#264653";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Abgeschlossen";
      case "ongoing":
        return "Aktiv";
      case "planned":
        return "Geplant";
      default:
        return status;
    }
  };

  const fitBoundsToTrips = () => {
    if (map && trips.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      trips.forEach((trip) => {
        bounds.extend({ lat: trip.latitude, lng: trip.longitude });
      });
      map.fitBounds(bounds);
    }
  };

  useEffect(() => {
    if (map && trips.length > 0) {
      fitBoundsToTrips();
    }
  }, [map, trips]);

  if (loadError) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center" data-testid="map-error">
        <div className="text-center">
          <MapPin className="w-16 h-16 mx-auto text-[#E76F51] mb-4" />
          <h2 className="font-fraunces text-2xl font-bold text-[#264653] mb-2">
            Karte konnte nicht geladen werden
          </h2>
          <p className="font-nunito text-[#8D99AE]">
            Bitte überprüfen Sie Ihre Internetverbindung.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#F9F9F7]" data-testid="map-page">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="font-fraunces text-3xl sm:text-4xl font-bold text-[#264653]">
                Unsere Weltkarte
              </h1>
              <p className="font-nunito text-[#8D99AE] mt-2">
                {trips.length} Reiseziele markiert
              </p>
            </div>
            
            {trips.length > 0 && (
              <button
                onClick={fitBoundsToTrips}
                className="btn-outline flex items-center gap-2"
                data-testid="fit-bounds-btn"
              >
                <Navigation className="w-4 h-4" />
                Alle anzeigen
              </button>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#2A9D8F]" />
              <span className="font-nunito text-sm text-[#264653]">Abgeschlossen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#E76F51]" />
              <span className="font-nunito text-sm text-[#264653]">Aktiv</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#E9C46A]" />
              <span className="font-nunito text-sm text-[#264653]">Geplant</span>
            </div>
          </div>

          {/* Map Container */}
          <div className="map-container h-[500px] sm:h-[600px] lg:h-[700px]" data-testid="google-map-container">
            {!isLoaded ? (
              <div className="w-full h-full flex items-center justify-center bg-[#F0EFEB]">
                <Loader2 className="w-12 h-12 text-[#264653] animate-spin" />
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={4}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
              >
                {trips.map((trip) => (
                  <Marker
                    key={trip.id}
                    position={{ lat: trip.latitude, lng: trip.longitude }}
                    onClick={() => setSelectedTrip(trip)}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 12,
                      fillColor: getMarkerColor(trip.status),
                      fillOpacity: 1,
                      strokeColor: "#FFFFFF",
                      strokeWeight: 3,
                    }}
                  />
                ))}

                {selectedTrip && (
                  <InfoWindow
                    position={{ lat: selectedTrip.latitude, lng: selectedTrip.longitude }}
                    onCloseClick={() => setSelectedTrip(null)}
                  >
                    <div className="p-2 max-w-xs" data-testid="trip-info-window">
                      <h3 className="font-fraunces text-lg font-bold text-[#264653] mb-1">
                        {selectedTrip.title}
                      </h3>
                      <p className="font-nunito text-sm text-[#8D99AE] flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" />
                        {selectedTrip.location}
                      </p>
                      <p className="font-nunito text-sm text-[#8D99AE] flex items-center gap-1 mb-2">
                        <Calendar className="w-3 h-3" />
                        {selectedTrip.start_date}
                      </p>
                      <span 
                        className={`status-badge status-${selectedTrip.status}`}
                      >
                        {getStatusLabel(selectedTrip.status)}
                      </span>
                      {selectedTrip.description && (
                        <p className="font-nunito text-sm text-[#264653] mt-2">
                          {selectedTrip.description}
                        </p>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </div>

          {/* Trip List Below Map */}
          {trips.length > 0 && (
            <div className="mt-8">
              <h2 className="font-fraunces text-2xl font-bold text-[#264653] mb-6">
                Alle Reiseziele
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trips.map((trip) => (
                  <motion.button
                    key={trip.id}
                    className="glass-panel p-4 text-left hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedTrip(trip);
                      map?.panTo({ lat: trip.latitude, lng: trip.longitude });
                      map?.setZoom(10);
                    }}
                    whileHover={{ y: -2 }}
                    data-testid={`trip-list-item-${trip.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: getMarkerColor(trip.status) }}
                      />
                      <div>
                        <h3 className="font-fraunces font-bold text-[#264653]">{trip.title}</h3>
                        <p className="font-nunito text-sm text-[#8D99AE]">{trip.location}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {trips.length === 0 && isLoaded && (
            <div className="text-center py-12" data-testid="map-empty-state">
              <Camera className="w-16 h-16 mx-auto text-[#8D99AE] mb-4" />
              <h3 className="font-fraunces text-xl font-bold text-[#264653] mb-2">
                Noch keine Reisen
              </h3>
              <p className="font-nunito text-[#8D99AE]">
                Füge deine erste Reise hinzu, um sie auf der Karte zu sehen.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MapPage;
