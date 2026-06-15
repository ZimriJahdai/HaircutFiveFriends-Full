export default function ChatFooter({ userId }) {
  return (
    <div className="mt-2.5 text-center text-xs text-[var(--muted)]">
      {userId ? (
        <>Conectado como: <strong className="text-[var(--ink)]">{userId}</strong></>
      ) : (
        <>Sin sesion iniciada</>
      )}
    </div>
  );
}
