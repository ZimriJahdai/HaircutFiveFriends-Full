import { useCallback, useEffect, useRef, useState } from 'react';
import { VOICE_WS_URL } from '../constants/voice.js';
import { getAuth } from '../utils/authStorage.js';

const MAX_LOGS = 200;
const TARGET_SAMPLE_RATE = 16000;
const SPEAKING_RESET_MS = 1600;
const THINKING_RESET_MS = 8000;
const OUTPUT_SAMPLE_RATE = 24000;

const downsampleBuffer = (buffer, sampleRate, outRate) => {
  if (outRate === sampleRate) {
    return floatTo16BitPCM(buffer);
  }

  const sampleRateRatio = sampleRate / outRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Int16Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let sum = 0;
    let count = 0;

    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i += 1) {
      sum += buffer[i];
      count += 1;
    }

    const averaged = sum / count;
    result[offsetResult] = Math.max(-1, Math.min(1, averaged)) * 0x7fff;
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
};

const floatTo16BitPCM = (float32Array) => {
  const output = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, float32Array[i]));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
};

const encodeBase64 = (int16Array) => {
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const decodeBase64ToInt16 = (base64) => {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Int16Array(buffer);
};

const int16ToFloat32 = (int16Array) => {
  const float32 = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i += 1) {
    float32[i] = int16Array[i] / 0x8000;
  }
  return float32;
};

const getSampleRateFromMime = (mimeType) => {
  if (!mimeType) return OUTPUT_SAMPLE_RATE;
  const match = mimeType.match(/rate=(\d+)/i);
  if (match) return Number(match[1]);
  return OUTPUT_SAMPLE_RATE;
};

const extractText = (message) => {
  const modelParts = message?.serverContent?.modelTurn?.parts || [];
  const modelText = modelParts
    .map((part) => part.text)
    .filter(Boolean)
    .join(' ')
    .trim();

  if (modelText) return { role: 'model', text: modelText };

  const inputText = message?.serverContent?.inputTranscription?.text;
  if (inputText) return { role: 'user', text: inputText };

  const outputText = message?.serverContent?.outputTranscription?.text;
  if (outputText) return { role: 'model', text: outputText };

  return null;
};

export const useVoiceSession = () => {
  const [status, setStatus] = useState('idle');
  const [activity, setActivity] = useState('idle');
  const [logs, setLogs] = useState([]);
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const outputAudioRef = useRef(null);
  const playbackTimeRef = useRef(0);
  const workletRef = useRef(null);
  const streamRef = useRef(null);
  const activityTimerRef = useRef(null);
  const pendingStartRef = useRef(false);
  const readyRef = useRef(false);

  const appendLog = useCallback((entry) => {
    setLogs((prev) => [...prev, entry].slice(-MAX_LOGS));
  }, []);

  const cleanupAudio = useCallback(() => {
    if (workletRef.current) {
      workletRef.current.port.onmessage = null;
      workletRef.current.disconnect();
      workletRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (outputAudioRef.current) {
      outputAudioRef.current.close();
      outputAudioRef.current = null;
      playbackTimeRef.current = 0;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const playAudioChunk = useCallback((base64, mimeType) => {
    if (!base64) return;
    const sampleRate = getSampleRateFromMime(mimeType);
    const int16Data = decodeBase64ToInt16(base64);
    const float32 = int16ToFloat32(int16Data);

    if (!outputAudioRef.current) {
      outputAudioRef.current = new AudioContext({ sampleRate });
      playbackTimeRef.current = outputAudioRef.current.currentTime;
    }

    if (outputAudioRef.current.state === 'suspended') {
      outputAudioRef.current.resume();
    }

    const context = outputAudioRef.current;
    const buffer = context.createBuffer(1, float32.length, sampleRate);
    buffer.copyToChannel(float32, 0);

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);

    const startTime = Math.max(context.currentTime, playbackTimeRef.current);
    source.start(startTime);
    playbackTimeRef.current = startTime + buffer.duration;
  }, []);

  const clearActivityTimer = useCallback(() => {
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
      activityTimerRef.current = null;
    }
  }, []);

  const scheduleActivityReset = useCallback((ms) => {
    clearActivityTimer();
    activityTimerRef.current = setTimeout(() => {
      setActivity('idle');
      activityTimerRef.current = null;
    }, ms);
  }, [clearActivityTimer]);

  const startRecordingNow = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    if (status === 'recording') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      await audioContext.resume();
      audioContextRef.current = audioContext;

      await audioContext.audioWorklet.addModule(
        new URL('../worklets/pcm-worklet.js', import.meta.url)
      );

      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'pcm-worklet');
      workletRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const inputData = event.data;
        const downsampled = downsampleBuffer(
          inputData,
          audioContext.sampleRate,
          TARGET_SAMPLE_RATE
        );
        const payload = {
          audio: {
            mimeType: 'audio/pcm;rate=16000',
            data: encodeBase64(downsampled),
          },
        };

        wsRef.current.send(JSON.stringify(payload));
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);
      setStatus('recording');
      setActivity('listening');
      appendLog({ role: 'system', text: 'Microfono activo.' });
    } catch (error) {
      setStatus('connected');
      setActivity('idle');
      appendLog({ role: 'system', text: 'No se pudo acceder al microfono.' });
    }
  }, [appendLog, status]);

  const disconnect = useCallback(() => {
    cleanupAudio();
    clearActivityTimer();
    pendingStartRef.current = false;
    readyRef.current = false;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('idle');
    setActivity('idle');
  }, [cleanupAudio, clearActivityTimer]);

  const connect = useCallback(() => {
    if (wsRef.current) return;

    setStatus('connecting');
    readyRef.current = false;
    const ws = new WebSocket(VOICE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      setActivity('idle');
      appendLog({ role: 'system', text: 'WebSocket conectado.' });

      const auth = getAuth();
      if (auth?.token) {
        ws.send(JSON.stringify({ auth: { token: auth.token } }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.setupComplete) {
          readyRef.current = true;
          if (pendingStartRef.current) {
            pendingStartRef.current = false;
            startRecordingNow();
          }
          return;
        }
        const parts = data?.serverContent?.modelTurn?.parts || [];
        parts.forEach((part) => {
          if (part?.inlineData?.data) {
            playAudioChunk(part.inlineData.data, part.inlineData.mimeType);
          }
        });

        const hasModelOutput = Boolean(
          data?.serverContent?.modelTurn ||
            data?.serverContent?.outputTranscription?.text
        );

        if (hasModelOutput) {
          setActivity('speaking');
          scheduleActivityReset(SPEAKING_RESET_MS);
        } else if (data?.serverContent?.inputTranscription?.text) {
          setActivity('listening');
        }

        const parsed = extractText(data);
        if (parsed) {
          appendLog(parsed);
        } else {
          appendLog({ role: 'event', text: JSON.stringify(data) });
        }
      } catch (error) {
        appendLog({ role: 'event', text: String(event.data) });
      }
    };

    ws.onerror = () => {
      setStatus('error');
      setActivity('idle');
      appendLog({ role: 'system', text: 'Error de WebSocket.' });
    };

    ws.onclose = () => {
      cleanupAudio();
      wsRef.current = null;
      readyRef.current = false;
      setStatus('idle');
      setActivity('idle');
      appendLog({ role: 'system', text: 'WebSocket cerrado.' });
    };
  }, [appendLog, cleanupAudio, scheduleActivityReset, startRecordingNow]);

  const startRecording = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      pendingStartRef.current = true;
      connect();
      return;
    }

    if (!readyRef.current) {
      pendingStartRef.current = true;
      return;
    }

    startRecordingNow();
  }, [connect, startRecordingNow]);

  const stopRecording = useCallback(() => {
    if (status !== 'recording') return;
    pendingStartRef.current = false;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ audioStreamEnd: true }));
    }
    cleanupAudio();
    setStatus('connected');
    setActivity('thinking');
    scheduleActivityReset(THINKING_RESET_MS);
    appendLog({ role: 'system', text: 'Microfono detenido.' });
  }, [appendLog, cleanupAudio, scheduleActivityReset, status]);

  useEffect(() => () => {
    cleanupAudio();
    clearActivityTimer();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [cleanupAudio, clearActivityTimer]);

  return {
    status,
    activity,
    logs,
    connect,
    disconnect,
    startRecording,
    stopRecording,
  };
};
