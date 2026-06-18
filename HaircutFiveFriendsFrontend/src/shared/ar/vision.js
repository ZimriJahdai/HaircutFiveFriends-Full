// Carga compartida del runtime WASM de MediaPipe Tasks Vision.
// Tanto el FaceLandmarker como el ImageSegmenter reutilizan el mismo fileset.
// La version del WASM del CDN DEBE coincidir con la del paquete instalado
// (@mediapipe/tasks-vision) para evitar errores de carga.
import { FilesetResolver } from '@mediapipe/tasks-vision';

export const MEDIAPIPE_VERSION = '0.10.35';
export const MEDIAPIPE_WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;

let filesetPromise = null;

// Devuelve (y cachea) el FilesetResolver de vision. Se resuelve una sola vez.
export const getVisionFileset = () => {
  if (!filesetPromise) {
    filesetPromise = FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
  }
  return filesetPromise;
};
