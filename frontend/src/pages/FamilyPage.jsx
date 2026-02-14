import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../App";
import { toast } from "sonner";
import { Plus, X, Edit2, Trash2, Users, Heart, User } from "lucide-react";
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

const emojis = ["👨", "👩", "👦", "👧", "🧒", "👶", "🐕", "🐈", "🧔", "👱‍♀️", "👴", "👵"];
const colors = [
  { name: "Tiefblau", value: "#264653" },
  { name: "Türkis", value: "#2A9D8F" },
  { name: "Gold", value: "#E9C46A" },
  { name: "Orange", value: "#F4A261" },
  { name: "Korall", value: "#E76F51" },
  { name: "Lavendel", value: "#9B5DE5" },
  { name: "Rosa", value: "#F15BB5" },
  { name: "Himmelblau", value: "#00BBF9" },
];

const FamilyPage = () => {
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "child",
    emoji: "👤",
    color: "#264653"
  });

  useEffect(() => {
    fetchFamily();
  }, []);

  const fetchFamily = async () => {
    try {
      const response = await axios.get(`${API}/family`);
      setFamily(response.data);
    } catch (error) {
      console.error("Error fetching family:", error);
      toast.error("Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "child",
      emoji: "👤",
      color: "#264653"
    });
    setEditingMember(null);
  };

  const handleOpenDialog = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        role: member.role,
        emoji: member.emoji,
        color: member.color
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Bitte gib einen Namen ein");
      return;
    }

    try {
      if (editingMember) {
        // For editing, we need to delete and recreate since there's no update endpoint
        await axios.delete(`${API}/family/${editingMember.id}`);
        const response = await axios.post(`${API}/family`, formData);
        setFamily(family.map(m => m.id === editingMember.id ? response.data : m));
        toast.success("Familienmitglied aktualisiert!");
      } else {
        const response = await axios.post(`${API}/family`, formData);
        setFamily([...family, response.data]);
        toast.success("Familienmitglied hinzugefügt!");
      }
      setIsDialogOpen(false);
      resetForm();
      fetchFamily(); // Refresh to get latest
    } catch (error) {
      console.error("Error saving member:", error);
      toast.error("Fehler beim Speichern");
    }
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm("Möchtest du dieses Familienmitglied wirklich entfernen?")) return;
    
    try {
      await axios.delete(`${API}/family/${memberId}`);
      setFamily(family.filter(m => m.id !== memberId));
      toast.success("Familienmitglied entfernt");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  const parents = family.filter(m => m.role === "parent");
  const children = family.filter(m => m.role === "child");

  return (
    <div className="min-h-screen pb-4 bg-[#F9F9F7]" data-testid="family-page">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-[#264653] text-white px-4 py-5 -mx-4 sm:-mx-6 lg:-mx-8 mb-8 text-center">
            <div className="max-w-5xl mx-auto">
              <Heart className="w-8 h-8 mx-auto mb-3 text-[#E9C46A]" />
              <h1 className="font-fraunces text-2xl sm:text-3xl font-bold mb-1">
                Unsere Familie
              </h1>
              <p className="font-nunito text-sm text-white/70">
                Die Abenteurer, die gemeinsam die Welt erkunden.
              </p>
            </div>
          </div>

          {/* Add Member Button */}
          <div className="text-center mb-12">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="btn-primary"
                  onClick={() => handleOpenDialog()}
                  data-testid="add-member-btn"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Familienmitglied hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] bg-white" data-testid="member-dialog">
                <DialogHeader>
                  <DialogTitle className="font-fraunces text-2xl text-[#264653]">
                    {editingMember ? "Mitglied bearbeiten" : "Neues Familienmitglied"}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                  {/* Avatar Preview */}
                  <div className="flex justify-center">
                    <div 
                      className="w-24 h-24 rounded-full flex items-center justify-center text-5xl border-4 border-white shadow-lg transition-all"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.emoji}
                    </div>
                  </div>

                  <div>
                    <label className="font-nunito font-semibold text-[#264653] block mb-2">
                      Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="z.B. Max"
                      className="form-input"
                      data-testid="member-name-input"
                    />
                  </div>

                  <div>
                    <label className="font-nunito font-semibold text-[#264653] block mb-2">
                      Rolle
                    </label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className="form-input" data-testid="member-role-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Elternteil</SelectItem>
                        <SelectItem value="child">Kind</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="font-nunito font-semibold text-[#264653] block mb-2">
                      Avatar
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({ ...formData, emoji })}
                          className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                            formData.emoji === emoji 
                              ? "bg-[#264653] ring-2 ring-[#2A9D8F]" 
                              : "bg-[#F0EFEB] hover:bg-[#E0E0D0]"
                          }`}
                          data-testid={`emoji-${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-nunito font-semibold text-[#264653] block mb-2">
                      Farbe
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`w-10 h-10 rounded-lg transition-all ${
                            formData.color === color.value 
                              ? "ring-2 ring-offset-2 ring-[#264653]" 
                              : ""
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                          data-testid={`color-${color.value}`}
                        />
                      ))}
                    </div>
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
                    >
                      Abbrechen
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 btn-primary"
                      data-testid="member-submit-btn"
                    >
                      {editingMember ? "Speichern" : "Hinzufügen"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Parents Section */}
          {parents.length > 0 && (
            <section className="mb-12" data-testid="parents-section">
              <h2 className="font-fraunces text-2xl font-bold text-[#264653] text-center mb-8">
                Die Eltern
              </h2>
              <div className="flex flex-wrap justify-center gap-8">
                {parents.map((member, idx) => (
                  <motion.div
                    key={member.id}
                    className="text-center group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    data-testid={`parent-${member.id}`}
                  >
                    <div className="relative">
                      <div 
                        className="family-avatar w-32 h-32 mx-auto mb-4 text-6xl"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.emoji}
                      </div>
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-full bg-white"
                          onClick={() => handleOpenDialog(member)}
                          data-testid={`edit-${member.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-full bg-white text-[#E76F51] hover:bg-[#E76F51] hover:text-white"
                          onClick={() => handleDelete(member.id)}
                          data-testid={`delete-${member.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-fraunces text-xl font-bold text-[#264653]">
                      {member.name}
                    </h3>
                    <p className="font-nunito text-[#8D99AE]">Elternteil</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Children Section */}
          {children.length > 0 && (
            <section data-testid="children-section">
              <h2 className="font-fraunces text-2xl font-bold text-[#264653] text-center mb-8">
                Die Kinder
              </h2>
              <div className="flex flex-wrap justify-center gap-8">
                {children.map((member, idx) => (
                  <motion.div
                    key={member.id}
                    className="text-center group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    data-testid={`child-${member.id}`}
                  >
                    <div className="relative">
                      <div 
                        className="family-avatar w-28 h-28 mx-auto mb-4 text-5xl"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.emoji}
                      </div>
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-full bg-white"
                          onClick={() => handleOpenDialog(member)}
                          data-testid={`edit-${member.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-full bg-white text-[#E76F51] hover:bg-[#E76F51] hover:text-white"
                          onClick={() => handleDelete(member.id)}
                          data-testid={`delete-${member.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-fraunces text-lg font-bold text-[#264653]">
                      {member.name}
                    </h3>
                    <p className="font-nunito text-sm text-[#8D99AE]">Kind</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {family.length === 0 && !loading && (
            <div className="text-center py-16" data-testid="family-empty-state">
              <Users className="w-20 h-20 mx-auto text-[#8D99AE] mb-4" />
              <h3 className="font-fraunces text-2xl font-bold text-[#264653] mb-2">
                Noch keine Familienmitglieder
              </h3>
              <p className="font-nunito text-[#8D99AE] mb-6">
                Füge dein erstes Familienmitglied hinzu!
              </p>
            </div>
          )}

          {/* Family Photo Placeholder */}
          <motion.section 
            className="mt-16 glass-panel p-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            data-testid="family-photo-section"
          >
            <h2 className="font-fraunces text-2xl font-bold text-[#264653] mb-4">
              Unser Familienfoto
            </h2>
            <div className="aspect-video max-w-2xl mx-auto rounded-2xl overflow-hidden bg-[#F0EFEB]">
              <img 
                src="https://images.unsplash.com/photo-1769674110189-4a979d15ff03?w=800&q=80"
                alt="Familie auf Reisen"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-nunito text-[#8D99AE] mt-4">
              Gemeinsam die Welt entdecken
            </p>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyPage;
