export default function ChatHeader({ onClear }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
      <h2 className="m-0 text-lg font-bold text-[var(--ink)]">TodoGemini - Admin Chat</h2>
      <button
        onClick={onClear}
        className="cursor-pointer rounded-xl border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-2 font-semibold text-[#b42318] transition hover:bg-[#dc2626]/20"
      >
        Limpiar Chat (DB)
      </button>
    </div>
  );
}
