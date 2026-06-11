import { useEffect, useRef } from 'react';
import { getMessageText, isTextMessage } from '../utils/messageUtils.js';

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

  return (
    <div
      ref={containerRef}
      style={{
        height: '500px',
        overflowY: 'auto',
        border: '1px solid #ddd',
        margin: '20px 0',
        padding: '15px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      {messages.length === 0 && (
        <p style={{ textAlign: 'center', color: '#888' }}>
          No hay mensajes. Inicia una conversacion.
        </p>
      )}

      {messages.filter(isTextMessage).map((msg, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: '15px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}
        >
          <div
            style={{
              maxWidth: '80%',
              padding: '10px 15px',
              borderRadius: '15px',
              backgroundColor: msg.role === 'user' ? '#007bff' : '#f1f1f1',
              color: msg.role === 'user' ? 'white' : '#333',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            <strong style={{ display: 'block', fontSize: '0.8em', marginBottom: '5px' }}>
              {msg.role === 'user' ? 'Tu' : 'Gemini'}
            </strong>
            <span style={{ whiteSpace: 'pre-wrap' }}>{getMessageText(msg)}</span>
          </div>
        </div>
      ))}

      {loading && <div style={{ color: '#888', fontStyle: 'italic' }}>Gemini esta pensando...</div>}
      <div ref={bottomRef} />
    </div>
  );
}
