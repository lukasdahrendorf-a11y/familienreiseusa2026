import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import localApi from "../localApi";
import { toast } from "sonner";
import { 
  Plus, X, Check, CheckSquare, Square, Trash2, Edit2,
  Briefcase, Shirt, Sun, Camera, Baby, Heart, Utensils
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import { Checkbox } from "../components/ui/checkbox";
import { Progress } from "../components/ui/progress";

const categories = [
  { id: "kleidung", name: "Kleidung", icon: Shirt, color: "#2A9D8F" },
  { id: "toilettenartikel", name: "Toilettenartikel", icon: Heart, color: "#E76F51" },
  { id: "elektronik", name: "Elektronik", icon: Camera, color: "#264653" },
  { id: "dokumente", name: "Dokumente", icon: Briefcase, color: "#E9C46A" },
  { id: "kinder", name: "Für die Kinder", icon: Baby, color: "#F4A261" },
  { id: "essen", name: "Snacks & Essen", icon: Utensils, color: "#8D99AE" },
  { id: "sonstiges", name: "Sonstiges", icon: Sun, color: "#264653" },
];

const PackingPage = () => {
  const [packingLists, setPackingLists] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [newItemText, setNewItemText] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("sonstiges");
  
  // Form state for new list
  const [newListTitle, setNewListTitle] = useState("");
  const [newListTripId, setNewListTripId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [listsRes, tripsRes] = await Promise.all([
        localApi.getPackingLists(),
        localApi.getTrips()
      ]);
      setPackingLists(listsRes.data);
      setTrips(tripsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const createList = async () => {
    if (!newListTitle.trim()) {
      toast.error("Bitte gib einen Titel ein");
      return;
    }

    try {
      const response = await localApi.createPackingList({
        title: newListTitle,
        trip_id: newListTripId || null,
        items: []
      });
      setPackingLists([...packingLists, response.data]);
      setNewListTitle("");
      setNewListTripId("");
      setIsDialogOpen(false);
      toast.success("Packliste erstellt!");
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error("Fehler beim Erstellen");
    }
  };

  const deleteList = async (listId) => {
    if (!window.confirm("Möchtest du diese Packliste wirklich löschen?")) return;

    try {
      await localApi.deletePackingList(listId);
      setPackingLists(packingLists.filter(l => l.id !== listId));
      if (selectedList?.id === listId) setSelectedList(null);
      toast.success("Packliste gelöscht");
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  const addItem = async () => {
    if (!selectedList || !newItemText.trim()) return;

    const newItem = {
      id: `item-${Date.now()}`,
      name: newItemText,
      checked: false,
      category: newItemCategory
    };

    const updatedItems = [...selectedList.items, newItem];
    
    try {
      await localApi.updatePackingList(selectedList.id, {
        ...selectedList,
        items: updatedItems
      });

      const updatedList = { ...selectedList, items: updatedItems };
      setSelectedList(updatedList);
      setPackingLists(packingLists.map(l => l.id === selectedList.id ? updatedList : l));
      setNewItemText("");
      toast.success("Artikel hinzugefügt");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Fehler beim Hinzufügen");
    }
  };

  const toggleItem = async (itemId) => {
    if (!selectedList) return;

    try {
      await localApi.togglePackingItem(selectedList.id, itemId);

      const updatedItems = selectedList.items.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      const updatedList = { ...selectedList, items: updatedItems };
      setSelectedList(updatedList);
      setPackingLists(packingLists.map(l => l.id === selectedList.id ? updatedList : l));
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  };

  const removeItem = async (itemId) => {
    if (!selectedList) return;

    const updatedItems = selectedList.items.filter(item => item.id !== itemId);
    
    try {
      await localApi.updatePackingList(selectedList.id, {
        ...selectedList,
        items: updatedItems
      });

      const updatedList = { ...selectedList, items: updatedItems };
      setSelectedList(updatedList);
      setPackingLists(packingLists.map(l => l.id === selectedList.id ? updatedList : l));
      toast.success("Artikel entfernt");
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const getProgress = (list) => {
    if (!list.items || list.items.length === 0) return 0;
    const checked = list.items.filter(i => i.checked).length;
    return Math.round((checked / list.items.length) * 100);
  };

  const getCategoryIcon = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.icon : Sun;
  };

  const getCategoryColor = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : "#264653";
  };

  // Group items by category
  const groupedItems = selectedList?.items?.reduce((acc, item) => {
    const cat = item.category || "sonstiges";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen pb-4 bg-[#F9F9F7]" data-testid="packing-page">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-[#264653] text-white px-4 py-5 -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="font-fraunces text-2xl sm:text-3xl font-bold">
                  Packlisten
                </h1>
                <p className="font-nunito text-sm text-white/70 mt-1">
                  Fur stressfreies Packen mit der Familie
                </p>
              </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="create-list-btn">
                  <Plus className="w-5 h-5 mr-2" />
                  Neue Liste
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] bg-white" data-testid="create-list-dialog">
                <DialogHeader>
                  <DialogTitle className="font-fraunces text-2xl text-[#264653]">
                    Neue Packliste
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="font-nunito font-semibold text-[#264653] block mb-2">
                      Titel *
                    </label>
                    <Input
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="z.B. Sommerurlaub Packliste"
                      className="form-input"
                      data-testid="list-title-input"
                    />
                  </div>

                  <div>
                    <label className="font-nunito font-semibold text-[#264653] block mb-2">
                      Für welche Reise? (optional)
                    </label>
                    <Select value={newListTripId || "none"} onValueChange={(val) => setNewListTripId(val === "none" ? "" : val)}>
                      <SelectTrigger className="form-input" data-testid="list-trip-select">
                        <SelectValue placeholder="Keine Reise ausgewählt" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Keine Reise</SelectItem>
                        {trips.map((trip) => (
                          <SelectItem key={trip.id} value={trip.id}>
                            {trip.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1 btn-outline"
                    >
                      Abbrechen
                    </Button>
                    <Button
                      onClick={createList}
                      className="flex-1 btn-primary"
                      data-testid="create-list-submit"
                    >
                      Erstellen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
            {/* Lists Sidebar */}
            <div className="lg:col-span-1">
              <h2 className="font-fraunces text-xl font-bold text-[#264653] mb-4">
                Meine Listen
              </h2>
              
              {packingLists.length > 0 ? (
                <div className="space-y-3">
                  {packingLists.map((list) => (
                    <motion.div
                      key={list.id}
                      className={`glass-panel p-4 cursor-pointer transition-all ${
                        selectedList?.id === list.id 
                          ? "ring-2 ring-[#2A9D8F]" 
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedList(list)}
                      whileHover={{ y: -2 }}
                      data-testid={`packing-list-${list.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-fraunces font-bold text-[#264653]">
                          {list.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteList(list.id);
                          }}
                          className="text-[#E76F51] hover:bg-[#E76F51]/10 -mr-2"
                          data-testid={`delete-list-${list.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={getProgress(list)} className="flex-1 h-2" />
                        <span className="font-nunito text-sm text-[#8D99AE]">
                          {getProgress(list)}%
                        </span>
                      </div>
                      <p className="font-nunito text-sm text-[#8D99AE]">
                        {list.items?.length || 0} Artikel
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 glass-panel" data-testid="no-lists-message">
                  <CheckSquare className="w-12 h-12 mx-auto text-[#8D99AE] mb-3" />
                  <p className="font-nunito text-[#8D99AE]">
                    Noch keine Packlisten
                  </p>
                </div>
              )}
            </div>

            {/* List Detail */}
            <div className="lg:col-span-2">
              {selectedList ? (
                <motion.div
                  key={selectedList.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel p-6"
                  data-testid="list-detail"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-fraunces text-2xl font-bold text-[#264653]">
                      {selectedList.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="font-nunito text-[#2A9D8F] font-semibold">
                        {getProgress(selectedList)}% gepackt
                      </span>
                    </div>
                  </div>

                  {/* Add Item Form */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-[#F0EFEB] rounded-xl">
                    <Input
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="Neuen Artikel hinzufügen..."
                      className="form-input flex-1"
                      onKeyPress={(e) => e.key === "Enter" && addItem()}
                      data-testid="add-item-input"
                    />
                    <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                      <SelectTrigger className="w-full sm:w-[180px] form-input" data-testid="item-category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addItem} className="btn-primary" data-testid="add-item-btn">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Items grouped by category */}
                  {Object.keys(groupedItems).length > 0 ? (
                    <div className="space-y-6">
                      {categories.map((cat) => {
                        const items = groupedItems[cat.id];
                        if (!items || items.length === 0) return null;
                        
                        const CategoryIcon = cat.icon;
                        
                        return (
                          <div key={cat.id} data-testid={`category-${cat.id}`}>
                            <div className="flex items-center gap-2 mb-3">
                              <CategoryIcon 
                                className="w-5 h-5" 
                                style={{ color: cat.color }} 
                              />
                              <h3 className="font-nunito font-semibold text-[#264653]">
                                {cat.name}
                              </h3>
                              <span className="font-nunito text-sm text-[#8D99AE]">
                                ({items.filter(i => i.checked).length}/{items.length})
                              </span>
                            </div>
                            
                            <AnimatePresence>
                              {items.map((item) => (
                                <motion.div
                                  key={item.id}
                                  className={`packing-item ${item.checked ? "checked" : ""}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  data-testid={`packing-item-${item.id}`}
                                >
                                  <Checkbox
                                    checked={item.checked}
                                    onCheckedChange={() => toggleItem(item.id)}
                                    className="data-[state=checked]:bg-[#2A9D8F] data-[state=checked]:border-[#2A9D8F]"
                                    data-testid={`checkbox-${item.id}`}
                                  />
                                  <span className="flex-1 font-nunito">
                                    {item.name}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.id)}
                                    className="text-[#8D99AE] hover:text-[#E76F51] hover:bg-transparent"
                                    data-testid={`remove-item-${item.id}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid="empty-list-message">
                      <CheckSquare className="w-16 h-16 mx-auto text-[#8D99AE] mb-4" />
                      <p className="font-nunito text-[#8D99AE]">
                        Noch keine Artikel. Füge deinen ersten Artikel hinzu!
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="glass-panel p-12 text-center" data-testid="no-list-selected">
                  <CheckSquare className="w-20 h-20 mx-auto text-[#8D99AE] mb-4" />
                  <h3 className="font-fraunces text-xl font-bold text-[#264653] mb-2">
                    Wähle eine Packliste
                  </h3>
                  <p className="font-nunito text-[#8D99AE]">
                    Klicke auf eine Liste links, um sie zu bearbeiten.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PackingPage;
