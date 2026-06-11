import { useEffect, useRef } from 'react';
import ChatFooter from '../components/ChatFooter.jsx';
import ChatForm from '../components/ChatForm.jsx';
import ChatHeader from '../components/ChatHeader.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import { useChat } from '../hooks/useChat.js';

export default function ChatPage() {
  const {
    userId,
    messages,
    input,
    loading,
    setInput,
    sendMessage,
    clearChat,
  } = useChat();

  const inputRef = useRef(null);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  return (
    <section className="page">
      <div className="page-head">
        <h1>Chat operativo</h1>
        <p>Gestiona conversaciones y herramientas de la barberia.</p>
      </div>

      <div className="card chat-card">
        <ChatHeader onClear={clearChat} />
        <ChatWindow messages={messages} loading={loading} />
        <ChatForm
          input={input}
          onChange={(event) => setInput(event.target.value)}
          onSubmit={sendMessage}
          loading={loading}
          inputRef={inputRef}
        />
        <ChatFooter userId={userId} />
      </div>
    </section>
  );
}
