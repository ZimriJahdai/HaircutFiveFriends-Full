export default function ChatForm({ input, onChange, onSubmit, loading, inputRef }) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2.5">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={onChange}
        aria-label="Mensaje para el asistente"
        className="flex-1 rounded-xl border border-line bg-surface px-3.5 py-3 text-ink outline-none transition placeholder:text-muted focus:border-white/50 disabled:opacity-60"
        placeholder="Consulta sobre servicios, barberos o citas..."
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer rounded-xl bg-accent px-6 py-3 font-semibold text-[#0a0a0a] transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? '...' : 'Enviar'}
      </button>
    </form>
  );
}
