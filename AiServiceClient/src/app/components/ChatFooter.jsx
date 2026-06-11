export default function ChatFooter({ userId }) {
  return (
    <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#888', textAlign: 'center' }}>
      {userId ? (
        <>Conectado como: <strong>{userId}</strong></>
      ) : (
        <>Sin sesion iniciada</>
      )}
    </div>
  );
}
