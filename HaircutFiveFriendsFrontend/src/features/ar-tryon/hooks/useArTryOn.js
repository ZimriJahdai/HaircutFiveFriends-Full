import { useCallback, useEffect, useRef, useState } from 'react';
import { getFaceLandmarker } from '../../../shared/ar/faceLandmarker';

// Maneja la webcam del NAVEGADOR (getUserMedia) + el loop de deteccion facial.
// Por cada frame nuevo invoca onResults(result, video) para que el componente
// dibuje el overlay. Libera camara y loop al detener/desmontar.
// Estados: 'idle' | 'loading' | 'running' | 'error'.
export const useArTryOn = ({ onResults } = {}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const landmarkerRef = useRef(null);
  const onResultsRef = useRef(onResults);
  const lastVideoTimeRef = useRef(-1);

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    lastVideoTimeRef.current = -1;
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    setError('');
    setStatus('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      // El modelo es un singleton cacheado: no se cierra al desmontar.
      landmarkerRef.current = await getFaceLandmarker();
      setStatus('running');

      // Loop por frame: solo procesa cuando el video avanza de tiempo.
      function renderLoop() {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        if (
          video &&
          landmarker &&
          video.readyState >= 2 &&
          video.currentTime !== lastVideoTimeRef.current
        ) {
          lastVideoTimeRef.current = video.currentTime;
          try {
            const result = landmarker.detectForVideo(video, performance.now());
            if (result) onResultsRef.current?.(result, video);
          } catch {
            // Frame fallido: continuar con el siguiente.
          }
        }
        rafRef.current = requestAnimationFrame(renderLoop);
      }

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(renderLoop);
    } catch (err) {
      setError(err?.message || 'No se pudo acceder a la camara.');
      setStatus('error');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, status, error, start, stop };
};
