import { Fragment, useEffect, useRef } from 'react';
import { getMessageText, isTextMessage } from '../utils/messageUtils.js';

const ONE_HOUR_MS = 60 * 60 * 1000;

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// "Hoy, 14:35" / "Ayer, 18:20" / "12 jun 2026, 09:10"
const formatDateBadge = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const time = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  if (isSameDay(date, now)) return `Hoy, ${time}`;
  if (isSameDay(date, yesterday)) return `Ayer, ${time}`;

  const day = date.toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return `${day}, ${time}`;
};

// Muestra badge si es el primer mensaje o si pasó más de 1h desde el anterior.
const shouldShowBadge = (prevTimestamp, currTimestamp) => {
  if (!currTimestamp) return false;
  if (!prevTimestamp) return true;
  const diff = new Date(currTimestamp).getTime() - new Date(prevTimestamp).getTime();
  return Number.isFinite(diff) && diff > ONE_HOUR_MS;
};

export default function ChatWindow({ messages, loading }) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      return;
    }
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages.length, loading]);

  const textMessages = messages.filter(isTextMessage);

  return (
    <div
      ref={containerRef}
      className="my-5 h-[clamp(420px,calc(100dvh-340px),880px)] overflow-y-auto scroll-smooth rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-[inset_0_2px_8px_rgba(20,20,25,0.06)]"
    >
      {textMessages.length === 0 && (
        <p className="grid h-full place-items-center text-center text-[var(--muted)]">
          No hay mensajes. Inicia una conversacion.
        </p>
      )}

      {textMessages.map((msg, idx) => {
        const isUser = msg.role === 'user';
        const prev = textMessages[idx - 1];
        const showBadge = shouldShowBadge(prev?.timestamp, msg.timestamp);
        const badgeText = showBadge ? formatDateBadge(msg.timestamp) : '';

        return (
          <Fragment key={idx}>
            {badgeText && (
              <div className="my-3 flex justify-center">
                <span className="rounded-full bg-[rgba(27,27,31,0.06)] px-3 py-1 text-[0.7rem] font-medium text-[var(--muted)]">
                  {badgeText}
                </span>
              </div>
            )}

            <div className={`mb-4 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={[
                  'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm',
                  isUser
                    ? 'bg-[var(--accent)] text-white rounded-br-sm'
                    : 'bg-[rgba(27,27,31,0.05)] text-[var(--ink)] rounded-bl-sm',
                ].join(' ')}
              >
                <strong
                  className={`mb-1 block text-[0.7rem] font-semibold uppercase tracking-[0.08em] ${
                    isUser ? 'text-white/80' : 'text-[var(--muted)]'
                  }`}
                >
                  {isUser ? 'Tu' : 'Gemini'}
                </strong>
                <span className="whitespace-pre-wrap break-words leading-relaxed">
                  {getMessageText(msg)}
                </span>
              </div>
            </div>
          </Fragment>
        );
      })}

      {loading && (
        <div className="mb-4 flex items-start" aria-live="polite" aria-label="Gemini esta escribiendo">
          <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-[rgba(27,27,31,0.05)] px-4 py-3">
            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:-0.3s] motion-reduce:animate-none" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:-0.15s] motion-reduce:animate-none" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--muted)] motion-reduce:animate-none" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
