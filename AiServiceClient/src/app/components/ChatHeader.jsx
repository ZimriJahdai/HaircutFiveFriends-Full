export default function ChatHeader({ onClear }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px',
      }}
    >
      <h2 style={{ margin: 0, color: '#333' }}>TodoGemini - Admin Chat</h2>
      <button
        onClick={onClear}
        style={{
          padding: '8px 15px',
          backgroundColor: '#ff4d4d',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Limpiar Chat (DB)
      </button>
    </div>
  );
}
