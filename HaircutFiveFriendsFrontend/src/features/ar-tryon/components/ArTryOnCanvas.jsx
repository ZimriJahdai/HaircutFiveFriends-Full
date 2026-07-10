import { useCallback, useEffect, useRef } from 'react';
import { useArTryOn } from '../hooks/useArTryOn.js';
import { getHeadPose } from '../../../shared/ar/faceLandmarker.js';

// Vista de selfie: el video se espeja (scaleX(-1)) y la pose se calcula espejada
// para que el corte coincida con lo que el usuario ve como en un espejo.
const MIRROR = true;

export const ArTryOnCanvas = ({ hairAsset, active, onStatusChange }) => {
  const canvasRef = useRef(null);
  const hairRef = useRef(hairAsset);

  useEffect(() => {
    hairRef.current = hairAsset;
  }, [hairAsset]);

  const handleResults = useCallback((result, video) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    const faces = result.faceLandmarks;
    const asset = hairRef.current;
    if (!asset?.bitmap || !faces || faces.length === 0) return;

    const { bitmap: hair, sourcePose } = asset;
    const pose = getHeadPose(faces[0], w, h, MIRROR);

    // Escala real: relacion entre la distancia-entre-sienes en vivo y la
    // medida en la foto generada (en vez de un factor de ancho inventado).
    const scale = pose.templeDist / sourcePose.templeDist;
    const overlayW = hair.width * scale;
    const overlayH = hair.height * scale;
    // Punto de la frente en la foto generada, escalado: es el punto del
    // recorte que se debe alinear con la frente detectada en vivo.
    const anchorX = sourcePose.forehead.x * scale;
    const anchorY = sourcePose.forehead.y * scale;

    ctx.save();
    // Anclar a la frente con un leve desplazamiento horizontal segun el giro.
    ctx.translate(pose.forehead.x + pose.yaw * pose.templeDist * 0.15, pose.forehead.y);
    ctx.rotate(pose.roll);
    // Cizalla horizontal leve para sugerir profundidad al girar la cabeza.
    ctx.transform(1, 0, Math.max(-0.6, Math.min(0.6, pose.yaw * 0.25)), 1, 0, 0);
    ctx.drawImage(hair, -anchorX, -anchorY, overlayW, overlayH);
    ctx.restore();
  }, []);

  const { videoRef, status, error, start, stop } = useArTryOn({ onResults: handleResults });

  useEffect(() => {
    if (active) {
      start();
    } else {
      stop();
    }
    return () => stop();
  }, [active, start, stop]);

  useEffect(() => {
    onStatusChange?.(status, error);
  }, [status, error, onStatusChange]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-[4/3]">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: MIRROR ? 'scaleX(-1)' : 'none' }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />

      {status !== 'running' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm text-zinc-400">
          <i className="ti ti-camera text-2xl text-[#00D2C4]" />
          <span>
            {status === 'loading'
              ? 'Cargando cámara y modelo…'
              : status === 'error'
                ? error || 'No se pudo acceder a la cámara'
                : 'Cámara detenida'}
          </span>
        </div>
      )}

      {status === 'running' && !hairAsset && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-1.5 text-xs text-zinc-300">
          Analiza una foto para superponer el corte
        </div>
      )}
    </div>
  );
};
