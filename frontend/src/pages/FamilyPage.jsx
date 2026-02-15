import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { API } from "../App";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Users, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "../components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";

const FAMILY_PHOTO = "https://customer-assets.emergentagent.com/job_2b2386c2-84ba-4ac6-aaff-7fc29c17627e/artifacts/04akxvb9_Familie.jpeg";

const emojis = ["👨", "👩", "👦", "👧", "🧒", "👶", "🐕", "🐈"];
const colors = [
  { name: "Tiefblau", value: "#264653" },
  { name: "Turkis", value: "#2A9D8F" },
  { name: "Gold", value: "#E9C46A" },
  { name: "Orange", value: "#F4A261" },
  { name: "Korall", value: "#E76F51" },
];

const MemberAvatar = ({ member, size = "md" }) => {
  const sizes = { sm: "w-14 h-14", md: "w-24 h-24 sm:w-28 sm:h-28", lg: "w-32 h-32" };
  const cls = sizes[size] || sizes.md;
  if (member.avatar_url) {
    return (
      <div className={`${cls} rounded-full overflow-hidden border-3 border-white shadow-lg flex-shrink-0`}
        style={{ borderColor: member.color }}>
        <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${cls} rounded-full flex items-center justify-center text-4xl border-3 border-white shadow-lg`}
      style={{ backgroundColor: member.color }}>
      {member.emoji}
    </div>
  );
};

const FamilyPage = () => {
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({ name: "", role: "child", emoji: "👤", color: "#264653" });

  useEffect(() => { fetchFamily(); }, []);

  const fetchFamily = async () => {
    try { const r = await axios.get(`${API}/family`); setFamily(r.data); }
    catch { toast.error("Fehler"); }
    finally { setLoading(false); }
  };

  const resetForm = () => { setFormData({ name: "", role: "child", emoji: "👤", color: "#264653" }); setEditingMember(null); };

  const handleOpenDialog = (member = null) => {
    if (member) { setEditingMember(member); setFormData({ name: member.name, role: member.role, emoji: member.emoji, color: member.color }); }
    else resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error("Bitte Name eingeben"); return; }
    try {
      if (editingMember) {
        await axios.delete(`${API}/family/${editingMember.id}`);
        await axios.post(`${API}/family`, formData);
      } else {
        await axios.post(`${API}/family`, formData);
      }
      setIsDialogOpen(false); resetForm(); fetchFamily();
      toast.success(editingMember ? "Aktualisiert!" : "Hinzugefugt!");
    } catch { toast.error("Fehler"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Wirklich entfernen?")) return;
    try { await axios.delete(`${API}/family/${id}`); setFamily(family.filter(m => m.id !== id)); toast.success("Entfernt"); }
    catch { toast.error("Fehler"); }
  };

  const parents = family.filter(m => m.role === "parent");
  const children = family.filter(m => m.role === "child");

  return (
    <div className="min-h-screen pb-4 bg-[#F9F9F7]" data-testid="family-page">
      {/* Header */}
      <div className="bg-[#264653] text-white px-4 py-5 text-center">
        <Heart className="w-6 h-6 mx-auto mb-2 text-[#E9C46A]" />
        <h1 className="font-fraunces text-2xl sm:text-3xl font-bold">Unsere Familie</h1>
        <p className="font-nunito text-sm text-white/80 mt-1">Die Abenteurer</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Add button */}
        <div className="text-center mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary" onClick={() => handleOpenDialog()} data-testid="add-member-btn">
                <Plus className="w-4 h-4 mr-2" /> Mitglied hinzufugen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-white" data-testid="member-dialog">
              <DialogHeader>
                <DialogTitle className="font-fraunces text-xl text-[#264653]">
                  {editingMember ? "Bearbeiten" : "Neues Mitglied"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-3">
                <div>
                  <label className="font-nunito font-semibold text-[#264653] block mb-1 text-sm">Name</label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Name" className="form-input" data-testid="member-name-input" />
                </div>
                <div>
                  <label className="font-nunito font-semibold text-[#264653] block mb-1 text-sm">Rolle</label>
                  <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                    <SelectTrigger className="form-input"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Elternteil</SelectItem>
                      <SelectItem value="child">Kind</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-nunito font-semibold text-[#264653] block mb-1 text-sm">Avatar</label>
                  <div className="flex flex-wrap gap-2">
                    {emojis.map((e) => (
                      <button key={e} type="button" onClick={() => setFormData({ ...formData, emoji: e })}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center ${formData.emoji === e ? "bg-[#264653] ring-2 ring-[#2A9D8F]" : "bg-[#F0EFEB]"}`}>{e}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-nunito font-semibold text-[#264653] block mb-1 text-sm">Farbe</label>
                  <div className="flex gap-2">
                    {colors.map((c) => (
                      <button key={c.value} type="button" onClick={() => setFormData({ ...formData, color: c.value })}
                        className={`w-9 h-9 rounded-lg ${formData.color === c.value ? "ring-2 ring-offset-2 ring-[#264653]" : ""}`}
                        style={{ backgroundColor: c.value }} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }} className="flex-1 btn-outline">Abbrechen</Button>
                  <Button type="submit" className="flex-1 btn-primary" data-testid="member-submit-btn">{editingMember ? "Speichern" : "Hinzufugen"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Parents */}
        {parents.length > 0 && (
          <section className="mb-10" data-testid="parents-section">
            <h2 className="font-fraunces text-xl font-bold text-[#264653] text-center mb-6">Die Eltern</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {parents.map((m, i) => (
                <motion.div key={m.id} className="text-center group" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="relative">
                    <MemberAvatar member={m} size="md" />
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="outline" size="icon" className="w-7 h-7 rounded-full bg-white" onClick={() => handleOpenDialog(m)}><Edit2 className="w-3 h-3" /></Button>
                      <Button variant="outline" size="icon" className="w-7 h-7 rounded-full bg-white text-[#E76F51]" onClick={() => handleDelete(m.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <h3 className="font-fraunces text-lg font-bold text-[#264653] mt-3">{m.name}</h3>
                  <p className="font-nunito text-xs text-[#8D99AE]">Elternteil</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Children */}
        {children.length > 0 && (
          <section data-testid="children-section">
            <h2 className="font-fraunces text-xl font-bold text-[#264653] text-center mb-6">Die Kinder</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {children.map((m, i) => (
                <motion.div key={m.id} className="text-center group" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="relative">
                    <MemberAvatar member={m} size="md" />
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="outline" size="icon" className="w-7 h-7 rounded-full bg-white" onClick={() => handleOpenDialog(m)}><Edit2 className="w-3 h-3" /></Button>
                      <Button variant="outline" size="icon" className="w-7 h-7 rounded-full bg-white text-[#E76F51]" onClick={() => handleDelete(m.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <h3 className="font-fraunces text-lg font-bold text-[#264653] mt-3">{m.name}</h3>
                  <p className="font-nunito text-xs text-[#8D99AE]">Kind</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {family.length === 0 && !loading && (
          <div className="text-center py-12" data-testid="family-empty-state">
            <Users className="w-16 h-16 mx-auto text-[#8D99AE] mb-3" />
            <h3 className="font-fraunces text-xl font-bold text-[#264653]">Noch keine Mitglieder</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyPage;
