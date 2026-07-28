import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import NavbarClient from '../../client/components/NavbarClient.jsx';
import { clearChatHistory, fetchChatHistory, sendChatMessage } from '../../../shared/api/aiChat.js';
import { useAuthStore } from '../../auth/store/authStore.js';

export function AIChatPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const userId = useMemo(() => user?._id || user?.id || user?.email || 'client', [user]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (!token || !userId) return;
      try {
        const res = await fetchChatHistory(userId);
        setMessages(res.data?.messages || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'No se pudo cargar el historial del chat.');
      }
    };
    load();
  }, [token, userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const onSubmit = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const optimistic = { role: 'user', parts: [{ text }] };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage({ userId, input: text });
      if (Array.isArray(res.data?.updatedHistory)) {
        setMessages(res.data.updatedHistory);
      } else if (res.data?.response) {
        setMessages((prev) => [...prev, { role: 'model', parts: [{ text: res.data.response }] }]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo enviar el mensaje.');
      setMessages((prev) => [...prev, { role: 'model', parts: [{ text: 'Error al procesar el mensaje.' }] }]);
    } finally {
      setLoading(false);
    }
  };

  const onClear = async () => {
    if (!window.confirm('¿Limpiar historial del chat IA?')) return;
    try {
      await clearChatHistory(userId);
      setMessages([]);
      toast.success('Historial limpiado.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'No se pudo limpiar el historial.');
    }
  };

  const getText = (message) => message?.parts?.map((part) => part?.text || '').join(' ').trim();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <NavbarClient />

      <main className="max-w-[1100px] mx-auto px-6 py-10">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-['Bebas_Neue'] text-4xl tracking-wider text-white">Chat IA</h1>
            <p className="text-sm text-zinc-400 mt-1">Sesión unificada con tu cuenta actual.</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="px-4 py-2 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/[0.05] transition-colors"
          >
            Limpiar historial
          </button>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#111] min-h-[60vh] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-zinc-500">Comienza escribiendo tu primera consulta.</p>
            ) : (
              messages.map((message, index) => {
                const text = getText(message);
                const isUser = message.role === 'user';
                return (
                  <div key={`${message.role}-${index}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${isUser
                        ? 'bg-[#00D2C4] text-[#052a26] font-semibold'
                        : 'bg-white/[0.05] border border-white/10 text-zinc-200'
                        }`}
                    >
                      {text || '...'}
                    </div>
                  </div>
                );
              })
            )}
            {loading && <p className="text-xs text-zinc-500">Generando respuesta…</p>}
            <div ref={endRef} />
          </div>

          <form onSubmit={onSubmit} className="p-4 border-t border-white/10 flex items-center gap-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu mensaje…"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-[#00D2C4]/60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-[#00D2C4] text-[#052a26] font-bold disabled:bg-white/10 disabled:text-zinc-500"
            >
              Enviar
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
