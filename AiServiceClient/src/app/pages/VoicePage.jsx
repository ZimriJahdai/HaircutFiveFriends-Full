import { useEffect, useRef, useState } from 'react';
import { useVoiceSession } from '../hooks/useVoiceSession.js';

const STATUS_LABELS = {
  idle: 'Idle',
  connecting: 'Connecting',
  connected: 'Connected',
  recording: 'Recording',
  error: 'Error',
};

const ACTIVITY_LABELS = {
  idle: 'Idle',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
};

export default function VoicePage() {
  const [showLogs, setShowLogs] = useState(false);
  const [pendingMic, setPendingMic] = useState(false);
  const modelScrollRef = useRef(null);
  const modelEndRef = useRef(null);
  const {
    status,
    activity,
    logs,
    connect,
    disconnect,
    startRecording,
    stopRecording,
  } = useVoiceSession();

  const isRecording = status === 'recording';
  const isConnected = status === 'connected' || status === 'recording';
  const isConnecting = status === 'connecting';

  useEffect(() => {
    if (pendingMic && isConnected && !isRecording) {
      startRecording();
      setPendingMic(false);
    }
  }, [pendingMic, isConnected, isRecording, startRecording]);

  const handleToggleMic = () => {
    if (isRecording) {
      setPendingMic(false);
      stopRecording();
      return;
    }

    setPendingMic(true);
    if (!isConnected && !isConnecting) {
      connect();
    }
    if (isConnected) {
      startRecording();
      setPendingMic(false);
    }
  };

  const handleCloseChat = () => {
    setPendingMic(false);
    disconnect();
  };

  const userTranscript = logs
    .filter((entry) => entry.role === 'user')
    .map((entry) => entry.text)
    .slice(-6);

  const modelTranscript = logs
    .filter((entry) => entry.role === 'model')
    .map((entry) => entry.text)
    .slice(-6);

  useEffect(() => {
    if (!modelScrollRef.current) return;
    const container = modelScrollRef.current;
    const targetTop = modelEndRef.current
      ? modelEndRef.current.offsetTop
      : container.scrollHeight;
    const end = Math.max(targetTop - container.clientHeight + 8, 0);
    const start = container.scrollTop;
    const duration = 450;
    let startTime;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = progress * (2 - progress);
      container.scrollTop = start + (end - start) * eased;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [modelTranscript.length]);

  return (
    <section className="page">
      <div className="page-head">
        <h1>Voz en tiempo real</h1>
        <p>Conexion Live API para llamadas y transcripcion.</p>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Estado de sesion</h3>
          <p>
            Estado actual: <strong>{STATUS_LABELS[status]}</strong>
          </p>
          <div className="status-chip">
            <span className={`status-dot ${activity}`} />
            <span>Actividad: {ACTIVITY_LABELS[activity]}</span>
          </div>
          <div className="button-row">
            <button
              className={`ghost-button mic-button${isRecording ? ' active' : ''}${
                isConnecting || pendingMic ? ' pending' : ''
              }`}
              type="button"
              onClick={handleToggleMic}
              aria-label={
                isRecording
                  ? 'Apagar microfono'
                  : isConnecting || pendingMic
                    ? 'Encendiendo microfono'
                    : 'Encender microfono'
              }
              title={
                isRecording
                  ? 'Apagar microfono'
                  : isConnecting || pendingMic
                    ? 'Encendiendo microfono...'
                    : 'Encender microfono'
              }
            >
              <svg
                className="mic-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 1 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Zm6-3.5a.75.75 0 0 0-1.5 0 4.5 4.5 0 0 1-9 0 .75.75 0 0 0-1.5 0 6 6 0 0 0 5.25 5.97V20a.75.75 0 0 0 1.5 0v-3.03A6 6 0 0 0 18 11Z" />
              </svg>
            </button>
            <button className="ghost-button" type="button" onClick={handleCloseChat}>
              Cerrar chat
            </button>
          </div>
          <div className="voice-note">
            Este modulo responde por audio. Si necesitas ver detalles tecnicos,
            activa el panel de eventos.
          </div>
          <button
            className="ghost-button"
            type="button"
            onClick={() => setShowLogs((prev) => !prev)}
          >
            {showLogs ? 'Ocultar eventos' : 'Mostrar eventos'}
          </button>
        </div>

        <div className="card">
          <h3>Transcripcion</h3>
          <div className="transcript-panel">
            <div className="transcript-section">
              <div className="transcript-label">Tu voz</div>
              {userTranscript.length === 0 ? (
                <p className="transcript-empty">Sin transcripcion por ahora.</p>
              ) : (
                <div className="transcript-lines">
                  {userTranscript.map((line, index) => (
                    <div key={`user-${index}`} className="transcript-line user">
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="transcript-section">
              <div className="transcript-label">Modelo</div>
              {modelTranscript.length === 0 ? (
                <p className="transcript-empty">Sin respuesta por ahora.</p>
              ) : (
                <div className="transcript-lines transcript-scroll" ref={modelScrollRef}>
                  {modelTranscript.map((line, index) => (
                    <div key={`model-${index}`} className="transcript-line model">
                      {line}
                    </div>
                  ))}
                  <div ref={modelEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>

        {showLogs && (
          <div className="card">
            <h3>Eventos y transcripciones</h3>
            <div className="log-panel">
              {logs.length === 0 && <p>Sin eventos por ahora.</p>}
              {logs.map((entry, index) => (
                <div key={`${entry.role}-${index}`} className={`log-line ${entry.role}`}>
                  <span className="log-role">{entry.role}</span>
                  <span className="log-text">{entry.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
