import { motion } from "framer-motion";
import { BookOpen, Download, Printer } from "lucide-react";
import { Button } from "../components/ui/button";

const children = [
  { name: "Louie", emoji: "👦", color: "#2A9D8F", avatar: "https://customer-assets.emergentagent.com/job_2b2386c2-84ba-4ac6-aaff-7fc29c17627e/artifacts/qweag9iu_Louie.jpg" },
  { name: "Levi", emoji: "👦", color: "#E9C46A", avatar: "https://customer-assets.emergentagent.com/job_2b2386c2-84ba-4ac6-aaff-7fc29c17627e/artifacts/jneoby5a_Levi.jpeg" },
  { name: "Noah", emoji: "👦", color: "#F4A261", avatar: "https://customer-assets.emergentagent.com/job_2b2386c2-84ba-4ac6-aaff-7fc29c17627e/artifacts/y6swu8gc_Noah.jpg" },
];

const DiaryPage = () => {
  return (
    <div className="min-h-screen pb-4 bg-[#F9F9F7]" data-testid="diary-page">
      <div className="bg-[#264653] text-white px-4 py-5 text-center">
        <BookOpen className="w-6 h-6 mx-auto mb-2 text-[#E9C46A]" />
        <h1 className="font-fraunces text-2xl sm:text-3xl font-bold">Reisetagebuch</h1>
        <p className="font-nunito text-sm text-white/80 mt-1">
          Zum Ausdrucken und Reinschreiben
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <p className="font-nunito text-[#264653] text-sm leading-relaxed max-w-lg mx-auto">
            Jedes Kind bekommt sein eigenes Reisetagebuch mit 26 Tagesseiten,
            Witzen, Aufgaben, Platz zum Malen und Schreiben.
            Klicke auf ein Kind, um das PDF zu erstellen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {children.map((child, idx) => (
            <motion.div
              key={child.name}
              className="glass-panel p-6 text-center hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div
                className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-lg mx-auto mb-4"
                style={{ borderColor: child.color }}
              >
                <img src={child.avatar} alt={child.name} className="w-full h-full object-cover" />
              </div>

              <h2 className="font-fraunces text-xl font-bold text-[#264653] mb-1">
                {child.name}
              </h2>
              <p className="font-nunito text-xs text-[#8D99AE] mb-4">
                26 Tage Reisetagebuch
              </p>

              <Button
                onClick={() => window.open(`/reisetagebuch.html?name=${child.name}`, '_blank')}
                className="w-full py-3 rounded-xl font-nunito font-semibold text-sm transition-all"
                style={{ backgroundColor: child.color }}
                data-testid={`diary-${child.name.toLowerCase()}`}
              >
                <Printer className="w-4 h-4 mr-2" />
                PDF erstellen
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 p-5 bg-[#E9C46A]/10 rounded-2xl border border-[#E9C46A]/20">
          <h3 className="font-fraunces text-lg font-bold text-[#264653] mb-2">
            So druckst du das Tagebuch:
          </h3>
          <ol className="font-nunito text-sm text-[#264653] space-y-2 list-decimal list-inside">
            <li>Klicke oben auf den Button des Kindes</li>
            <li>Es öffnet sich eine neue Seite mit dem Tagebuch</li>
            <li>Klicke dort auf <strong>"Als PDF drucken"</strong></li>
            <li>Wähle: <strong>Querformat (Landscape)</strong>, <strong>A4</strong>, <strong>Ränder: Keine</strong></li>
            <li>Speichere als PDF oder drucke direkt aus</li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <p className="font-nunito text-xs text-[#8D99AE]">
            Jedes Buch enthält: Routenübersicht zum Ankreuzen, Wetter-Check,
            Smiley-Bewertung, Foto-Platz, Witz des Tages, Rätsel und Schreiblinien
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiaryPage;
