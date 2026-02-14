import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../App";
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Hallo! Ich bin euer Reise-Assistent fur die USA Westkuste 2026. Fragt mich alles uber:\n\n- Aktivitaten mit den Jungs\n- Restaurant-Empfehlungen\n- Packlisten-Vorschlage\n- Nationalpark-Infos\n\nWie kann ich helfen?"
      }]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMsg = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);
    try {
      const res = await axios.post(`${API}/chat`, { message: userMsg, session_id: sessionId });
      setSessionId(res.data.session_id);
      setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Entschuldigung, es gab einen Fehler." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle - positioned above bottom nav on mobile */}
      <motion.button
        className="fixed z-[60] w-12 h-12 rounded-full bg-[#2A9D8F] text-white shadow-lg flex items-center justify-center hover:bg-[#238b7e] transition-colors bottom-[88px] right-4 md:bottom-6 md:right-6"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="chat-toggle-btn"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-[60] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#E0E0D0]
              bottom-[108px] right-4 w-[calc(100vw-2rem)] max-w-[360px] h-[400px] max-h-[55vh]
              md:bottom-20 md:right-6"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            data-testid="chat-window"
          >
            {/* Header */}
            <div className="bg-[#264653] text-white p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2A9D8F] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-fraunces font-bold text-sm">Reise-Assistent</h3>
                <p className="text-[10px] text-white/60">USA Westkuste 2026</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#F9F9F7]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-1.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-[#2A9D8F] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-2.5 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#264653] text-white rounded-br-sm"
                      : "bg-white text-[#264653] rounded-bl-sm shadow-sm border border-[#E0E0D0]"
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-[#E9C46A] flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-[#264653]" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-1.5 justify-start">
                  <div className="w-6 h-6 rounded-full bg-[#2A9D8F] flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl rounded-bl-sm shadow-sm border border-[#E0E0D0]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#2A9D8F]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-2.5 bg-white border-t border-[#E0E0D0]">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Frag mich etwas..."
                  className="flex-1 text-sm rounded-full border-[#E0E0D0] focus:border-[#2A9D8F]"
                  disabled={isLoading}
                  data-testid="chat-input"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-9 h-9 rounded-full bg-[#2A9D8F] hover:bg-[#238b7e] p-0"
                  data-testid="chat-send-btn"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
