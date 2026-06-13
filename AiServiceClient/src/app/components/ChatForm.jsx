export default function ChatForm({ input, onChange, onSubmit, loading, inputRef }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: '10px' }}>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={onChange}
        aria-label="Mensaje para el asistente"
        style={{
          flex: 1,
          padding: '12px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          outline: 'none',
        }}
        placeholder="Consulta sobre servicios, barberos o citas..."
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '12px 25px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {loading ? '...' : 'Enviar'}
      </button>
    </form>
  );
}
