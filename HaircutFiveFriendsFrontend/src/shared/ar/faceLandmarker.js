// FaceLandmarker (MediaPipe Tasks Vision) para seguimiento facial en vivo en el
// navegador. Corre en WASM + delegate GPU (WebGL); NO captura camara en el
// servidor. Expone landmarks 3D + matriz de transformacion facial (pose).
import { FaceLandmarker } from '@mediapipe/tasks-vision';
import { getVisionFileset } from './vision.js';

const FACE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// Indices de landmarks usados para anclar el corte (malla canonica de 478 pts).
const LM_FOREHEAD = 10; // linea del cabello (frente alta)
const LM_TEMPLE_L = 234; // sien izquierda
const LM_TEMPLE_R = 454; // sien derecha
const LM_NOSE = 1; // punta de la nariz

let landmarkerPromise = null;

// Crea (y cachea) un unico FaceLandmarker en modo VIDEO. Se reutiliza entre
// montajes para no recargar el modelo en cada entrada a la pagina.
export const getFaceLandmarker = async () => {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await getVisionFileset();
      return FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFacialTransformationMatrixes: true,
        outputFaceBlendshapes: false,
      });
    })();
  }
  return landmarkerPromise;
};

// Convierte landmarks normalizados en una pose 2D usable para el overlay.
// `mirror` espeja la X para que coincida con un video tipo selfie (scaleX(-1)).
// Devuelve: ancla en la frente, distancia entre sienes (escala), roll e
// indicador aproximado de giro horizontal (yaw, ~ -1..1).
export const getHeadPose = (landmarks, width, height, mirror = true) => {
  const toPx = (lm) => ({
    x: (mirror ? 1 - lm.x : lm.x) * width,
    y: lm.y * height,
  });

  const forehead = toPx(landmarks[LM_FOREHEAD]);
  const left = toPx(landmarks[LM_TEMPLE_L]);
  const right = toPx(landmarks[LM_TEMPLE_R]);
  const nose = toPx(landmarks[LM_NOSE]);

  const dx = right.x - left.x;
  const dy = right.y - left.y;
  const templeDist = Math.hypot(dx, dy);
  const roll = Math.atan2(dy, dx);
  const center = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
  const yaw = templeDist > 0 ? (nose.x - center.x) / (templeDist / 2) : 0;

  return { forehead, center, templeDist, roll, yaw };
};
