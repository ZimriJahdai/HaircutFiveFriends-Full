export default function ChatForm({ input, onChange, onSubmit, loading, inputRef }) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2.5">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={onChange}
        aria-label="Mensaje para el asistente"
        className="flex-1 rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 disabled:opacity-60"
        placeholder="Consulta sobre servicios, barberos o citas..."
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer rounded-xl bg-[var(--accent)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? '...' : 'Enviar'}
      </button>
    </form>
  );
}
