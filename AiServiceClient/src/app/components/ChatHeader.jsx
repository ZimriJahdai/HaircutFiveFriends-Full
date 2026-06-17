export default function ChatHeader({ onClear }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-3">
      <h2 className="m-0 font-display text-lg font-bold text-ink">TodoGemini - Admin Chat</h2>
      <button
        onClick={onClear}
        className="cursor-pointer rounded-xl border border-warm/40 bg-warm/10 px-4 py-2 font-semibold text-[#fca5a5] transition hover:bg-warm/20"
      >
        Limpiar Chat (DB)
      </button>
    </div>
  );
}
