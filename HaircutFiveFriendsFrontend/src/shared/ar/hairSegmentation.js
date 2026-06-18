// Segmentacion de pelo en el navegador (MediaPipe ImageSegmenter, modelo
// selfie multiclass). Recibe el retrato opaco que genera /analize y devuelve
// un ImageBitmap SOLO con el pelo (canal alfa). Esto resuelve el bug de
// "sobreponer la foto entera": ahora unicamente se superpone el cabello.
import { ImageSegmenter } from '@mediapipe/tasks-vision';
import { getVisionFileset } from './vision.js';

const SEG_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';

// Categorias del modelo selfie multiclass: 0=fondo, 1=pelo, 2=piel-cuerpo,
// 3=piel-cara, 4=ropa, 5=otros.
const HAIR_CATEGORY = 1;

let segmenterPromise = null;

const getSegmenter = () => {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const fileset = await getVisionFileset();
      return ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: SEG_MODEL_URL, delegate: 'GPU' },
        runningMode: 'IMAGE',
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });
    })();
  }
  return segmenterPromise;
};

const toDataUrl = (base64) => {
  const trimmed = String(base64 || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:')) return trimmed;
  return `data:image/png;base64,${trimmed}`;
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen del corte.'));
    img.src = src;
  });

// Recorta el pelo del retrato (base64 o data URL) y devuelve un ImageBitmap con
// transparencia, a resolucion del retrato original. Se ejecuta UNA vez por
// recomendacion (no por frame) y conviene cachear el resultado.
export const segmentHairToBitmap = async (base64Image) => {
  const src = toDataUrl(base64Image);
  if (!src) return null;

  const img = await loadImage(src);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  const segmenter = await getSegmenter();
  const result = segmenter.segment(img);
  const mask = result.categoryMask;
  if (!mask) return null;

  const maskW = mask.width;
  const maskH = mask.height;
  const categories = mask.getAsUint8Array();

  // Mascara a su resolucion nativa: blanco donde hay pelo, transparente el resto.
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = maskW;
  maskCanvas.height = maskH;
  const mctx = maskCanvas.getContext('2d');
  const maskImage = mctx.createImageData(maskW, maskH);
  for (let i = 0; i < categories.length; i += 1) {
    const isHair = categories[i] === HAIR_CATEGORY;
    const o = i * 4;
    maskImage.data[o] = 255;
    maskImage.data[o + 1] = 255;
    maskImage.data[o + 2] = 255;
    maskImage.data[o + 3] = isHair ? 255 : 0;
  }
  mctx.putImageData(maskImage, 0, 0);
  mask.close?.();

  // Componer: retrato a resolucion completa, recortado por la mascara escalada.
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const octx = out.getContext('2d');
  octx.drawImage(img, 0, 0, w, h);
  octx.globalCompositeOperation = 'destination-in';
  octx.imageSmoothingEnabled = true;
  octx.drawImage(maskCanvas, 0, 0, w, h);

  return createImageBitmap(out);
};
