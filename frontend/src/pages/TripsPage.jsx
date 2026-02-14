import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../App";
import { toast } from "sonner";
import { 
  Plus, X, MapPin, Calendar, Camera, Edit2, Trash2, 
  ChevronDown, Filter, Search
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    latitude: 0,
    longitude: 0,
    start_date: "",
    end_date: "",
    status: "planned",
    photos: []
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API}/trips`);
      setTrips(response.data);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Fehler beim Laden der Reisen");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      latitude: 0,
      longitude: 0,
      start_date: "",
      end_date: "",
      status: "planned",
      photos: []
    });
    setStartDate(null);
    setEndDate(null);
    setEditingTrip(null);
  };

  const handleOpenDialog = (trip = null) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        title: trip.title,
        description: trip.description || "",
        location: trip.location,
        latitude: trip.latitude,
        longitude: trip.longitude,
        start_date: trip.start_date,
        end_date: trip.end_date || "",
        status: trip.status,
        photos: trip.photos || []
      });
      if (trip.start_date) setStartDate(new Date(trip.start_date));
      if (trip.end_date) setEndDate(new Date(trip.end_date));
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const tripData = {
      ...formData,
      start_date: startDate ? format(startDate, "yyyy-MM-dd") : "",
      end_date: endDate ? format(endDate, "yyyy-MM-dd") : "",
    };

    try {
      if (editingTrip) {
        await axios.put(`${API}/trips/${editingTrip.id}`, tripData);
        toast.success("Reise aktualisiert!");
      } else {
        await axios.post(`${API}/trips`, tripData);
        toast.success("Neue Reise hinzugefügt!");
      }
      fetchTrips();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving trip:", error);
      toast.error("Fehler beim Speichern");
    }
  };

  const handleDelete = async (tripId) => {
    if (!window.confirm("Möchtest du diese Reise wirklich löschen?")) return;
    
    try {
      await axios.delete(`${API}/trips/${tripId}`);
      toast.success("Reise gelöscht");
      fetchTrips();
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      planned: "status-badge status-planned",
      ongoing: "status-badge status-ongoing",
      completed: "status-badge status-completed"
    };
    const labels = {
      planned: "Geplant",
      ongoing: "Aktiv",
      completed: "Abgeschlossen"
    };
    return <span className={classes[status]}>{labels[status]}</span>;
  };

  // Filter trips
  const filteredTrips = trips.filter(trip => {
    const matchesStatus = filterStatus === "all" || trip.status === filterStatus;
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sample locations for quick selection
  const sampleLocations = [
    { name: "Paris, Frankreich", lat: 48.8566, lng: 2.3522 },
    { name: "Rom, Italien", lat: 41.9028, lng: 12.4964 },
    { name: "Barcelona, Spanien", lat: 41.3851, lng: 2.1734 },
    { name: "Amsterdam, Niederlande", lat: 52.3676, lng: 4.9041 },
    { name: "Wien, Österreich", lat: 48.2082, lng: 16.3738 },
    { name: "München, Deutschland", lat: 48.1351, lng: 11.5820 },
    { name: "Zürich, Schweiz", lat: 47.3769, lng: 8.5417 },
    { name: "Mallorca, Spanien", lat: 39.6953, lng: 3.0176 },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#F9F9F7]" data-testid="trips-page">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="font-fraunces text-3xl sm:text-4xl font-bold text-[#264653]">
                Unsere Reisen
              </h1>
              <p className="font-nunito text-[#8D99AE] mt-2">
                {trips.length} Abenteuer dokumentiert
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="btn-primary"
                  onClick={() => handleOpenDialog()}
                  data-testid="add-trip-btn"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Neue Reise
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white" data-testid="trip-dialog">
                <DialogHeader>
                  <DialogTitle className="font-fraunces text-2xl text-[#264653]">
                    {editingTrip ? "Reise bearbeiten" : "Neue Reise planen"}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div>
                    <label className="font-nunito font-semibold text-[#264653] block mb-2">
                      Titel *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="z.B. Sommerurlaub in Italien"
                      required
                      className="form-input"
                      data-testid="trip-title-input"
                    />
                  </div>

                  <div>
                    <label className="font-nunito font-semibold text-[#264653] block mb-2">
                      Zielort *
                    </label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => {
                        const loc = sampleLocations.find(l => l.name === value);
                        if (loc) {
                          setFormData({ 
                            ...formData, 
                            location: loc.name,
                            latitude: loc.lat,
                            longitude: loc.lng
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="form-input" data-testid="trip-location-select">
                        <SelectValue placeholder="Wähle einen Ort" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleLocations.map((loc) => (
                          <SelectItem key={loc.name} value={loc.name}>
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {loc.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="font-nunito text-xs text-[#8D99AE] mt-1">
                      Oder gib einen eigenen Ort ein:
                    </p>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Eigener Ort"
                      className="form-input mt-2"
                      data-testid="trip-custom-location-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-nunito font-semibold text-[#264653] block mb-2">
                        Breitengrad
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                        className="form-input"
                        data-testid="trip-lat-input"
                      />
                    </div>
                    <div>
                      <label className="font-nunito font-semibold text-[#264653] block mb-2">
                        Längengrad
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                        className="form-input"
                        data-testid="trip-lng-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-nunito font-semibold text-[#264653] block mb-2">
                        Startdatum
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal form-input"
                            data-testid="trip-start-date-btn"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            locale={de}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="font-nunito font-semibold text-[#264653] block mb-2">
                        Enddatum
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal form-input"
                            data-testid="trip-end-date-btn"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            locale={de}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <label className="font-nunito font-semibold text-[#264653] block mb-2">
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="form-input" data-testid="trip-status-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Geplant</SelectItem>
                        <SelectItem value="ongoing">Aktiv</SelectItem>
                        <SelectItem value="completed">Abgeschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="font-nunito font-semibold text-[#264653] block mb-2">
                      Beschreibung
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Erzähle von eurer Reise..."
                      className="form-input min-h-[100px]"
                      data-testid="trip-description-input"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                      className="flex-1 btn-outline"
                      data-testid="trip-cancel-btn"
                    >
                      Abbrechen
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 btn-primary"
                      data-testid="trip-submit-btn"
                    >
                      {editingTrip ? "Speichern" : "Erstellen"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8D99AE]" />
              <Input
                placeholder="Reise suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-10"
                data-testid="trip-search-input"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px] form-input" data-testid="trip-filter-select">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Reisen</SelectItem>
                <SelectItem value="planned">Geplant</SelectItem>
                <SelectItem value="ongoing">Aktiv</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trips Grid */}
          {filteredTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTrips.map((trip, idx) => (
                  <motion.div
                    key={trip.id}
                    className="trip-card overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    data-testid={`trip-card-${trip.id}`}
                  >
                    {/* Image */}
                    <div className="aspect-video bg-[#F0EFEB] relative">
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
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(trip.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-fraunces text-xl font-bold text-[#264653] mb-2">
                        {trip.title}
                      </h3>
                      <p className="font-nunito text-sm text-[#8D99AE] flex items-center gap-1 mb-2">
                        <MapPin className="w-4 h-4" />
                        {trip.location}
                      </p>
                      {trip.start_date && (
                        <p className="font-nunito text-sm text-[#8D99AE] flex items-center gap-1 mb-3">
                          <Calendar className="w-4 h-4" />
                          {trip.start_date}
                          {trip.end_date && ` - ${trip.end_date}`}
                        </p>
                      )}
                      {trip.description && (
                        <p className="font-nunito text-sm text-[#264653] line-clamp-2 mb-4">
                          {trip.description}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(trip)}
                          className="flex-1"
                          data-testid={`edit-trip-${trip.id}`}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Bearbeiten
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(trip.id)}
                          className="text-[#E76F51] border-[#E76F51] hover:bg-[#E76F51]/10"
                          data-testid={`delete-trip-${trip.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="empty-state" data-testid="trips-empty-state">
              <Camera className="w-20 h-20 mx-auto text-[#8D99AE] mb-4" />
              <h3 className="font-fraunces text-2xl font-bold text-[#264653] mb-2">
                {searchQuery || filterStatus !== "all" 
                  ? "Keine Reisen gefunden" 
                  : "Noch keine Reisen"}
              </h3>
              <p className="font-nunito text-[#8D99AE] mb-6">
                {searchQuery || filterStatus !== "all"
                  ? "Versuche eine andere Suche oder Filter."
                  : "Plane eure erste gemeinsame Reise!"}
              </p>
              {!searchQuery && filterStatus === "all" && (
                <Button 
                  className="btn-primary"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Erste Reise planen
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TripsPage;
