import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import NavbarClient from '../../client/components/NavbarClient.jsx';
import { ArTryOnCanvas } from '../components/ArTryOnCanvas.jsx';
import { useTryOn } from '../hooks/useTryOn.js';
import { segmentHairToBitmap } from '../../../shared/ar/hairSegmentation.js';

const FACE_SHAPE_LABELS = {
  OVALADO: 'Ovalado',
  CUADRADO: 'Cuadrado',
  REDONDO: 'Redondo',
  CORAZON: 'Corazón',
  CORAZONADO: 'Corazón',
  TRIANGULAR: 'Triangular',
  CUALQUIERA: 'Cualquiera',
};

const faceShapeLabel = (shape) => {
  if (!shape) return '';
  return FACE_SHAPE_LABELS[String(shape).toUpperCase()] || shape;
};

const inputClass =
  'w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-[#00D2C4]/60 transition-colors';

export const ProbarCorte = () => {
  const { faceSummary, haircutImageBase64, loading, error, analyze, reset } = useTryOn();

  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [length, setLength] = useState('');
  const [style, setStyle] = useState('');

  const [hairAsset, setHairAsset] = useState(null);
  const [segmenting, setSegmenting] = useState(false);
  const [arActive, setArActive] = useState(false);

  // Espejo en ref para liberar el ImageBitmap actual al desmontar sin recrear efectos.
  const hairAssetRef = useRef(null);
  useEffect(() => {
    hairAssetRef.current = hairAsset;
  }, [hairAsset]);
  useEffect(() => () => hairAssetRef.current?.bitmap?.close?.(), []);

  // Limpia el object URL de la previsualizacion al cambiar/desmontar.
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const replaceHairAsset = (asset) => {
    setHairAsset((prev) => {
      if (prev && prev.bitmap !== asset?.bitmap) prev.bitmap?.close?.();
      return asset;
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona una imagen válida (JPG o PNG).');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setMimeType(file.type || 'image/jpeg');

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const result = String(fileReader.result || '');
      setImageBase64(result.includes(',') ? result.split(',')[1] : result);
    };
    fileReader.onerror = () => toast.error('No se pudo leer la imagen.');
    fileReader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      toast.error('Sube una foto antes de analizar.');
      return;
    }
    try {
      const data = await analyze({ imageBase64, mimeType, length, style });
      toast.success('Análisis completado.');

      // Recortar el pelo del retrato (una sola vez) para superponer solo el cabello.
      if (data?.haircutImageBase64) {
        setSegmenting(true);
        try {
          const asset = await segmentHairToBitmap(data.haircutImageBase64);
          replaceHairAsset(asset);
        } catch {
          toast.error('No se pudo recortar el cabello del corte.');
        } finally {
          setSegmenting(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error al analizar la imagen.');
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setImageBase64('');
    setMimeType('image/jpeg');
    setLength('');
    setStyle('');
    setArActive(false);
    replaceHairAsset(null);
    reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <NavbarClient />

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="font-['Bebas_Neue'] text-4xl tracking-wider text-white">
            Probar corte en vivo
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Sube una foto, genera el corte recomendado y pruébatelo en tiempo real con tu cámara.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda: foto, opciones y resultado del analisis */}
          <section className="space-y-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-[#00D2C4]/50 transition-colors"
            >
              <i className="ti ti-photo-up text-3xl text-[#00D2C4]" />
              <p className="mt-2 text-sm font-semibold text-zinc-200">Sube una foto tuya</p>
              <p className="text-xs text-zinc-500">Buena luz y mirando al frente</p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Foto original"
                className="w-full max-h-72 object-contain rounded-xl border border-white/5 bg-black/30"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-zinc-400 mb-1.5 block">Largo</span>
                <select className={inputClass} value={length} onChange={(e) => setLength(e.target.value)}>
                  <option value="">Cualquiera</option>
                  <option value="short">Corto</option>
                  <option value="medium">Medio</option>
                  <option value="long">Largo</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-zinc-400 mb-1.5 block">Estilo</span>
                <select className={inputClass} value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option value="">Cualquiera</option>
                  <option value="classic">Clásico</option>
                  <option value="modern">Moderno</option>
                  <option value="urban">Urbano</option>
                </select>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || !imageBase64}
                className="flex-1 px-4 py-2.5 bg-[#00D2C4] hover:bg-[#00b9ad] disabled:bg-white/10 disabled:text-zinc-500 text-[#062b29] font-bold rounded-xl transition-colors"
              >
                {loading ? 'Analizando…' : 'Generar corte'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2.5 border border-white/10 hover:bg-white/[0.04] text-zinc-300 rounded-xl transition-colors"
              >
                Limpiar
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {faceSummary && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-zinc-500">Rostro</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#00D2C4]/10 text-[#00D2C4] text-xs font-semibold">
                    {faceShapeLabel(faceSummary.faceShape)}
                  </span>
                </div>
                {faceSummary.hairTexture && <p className="text-zinc-300"><span className="text-zinc-500">Textura:</span> {faceSummary.hairTexture}</p>}
                {faceSummary.hairColor && <p className="text-zinc-300"><span className="text-zinc-500">Color:</span> {faceSummary.hairColor}</p>}
                {faceSummary.recommendedHaircutStyle && <p className="text-zinc-300"><span className="text-zinc-500">Sugerido:</span> {faceSummary.recommendedHaircutStyle}</p>}
              </div>
            )}
          </section>

          {/* Columna derecha: AR en vivo + retrato generado */}
          <section className="space-y-4">
            <ArTryOnCanvas hairAsset={hairAsset} active={arActive} />

            <button
              type="button"
              onClick={() => setArActive((v) => !v)}
              className={`w-full px-4 py-2.5 font-bold rounded-xl transition-colors ${arActive
                ? 'bg-red-500/90 hover:bg-red-500 text-white'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10'
                }`}
            >
              {arActive ? (
                <><i className="ti ti-player-stop mr-1" /> Detener cámara</>
              ) : (
                <><i className="ti ti-camera mr-1" /> Probar en vivo (AR)</>
              )}
            </button>

            {segmenting && (
              <p className="text-xs text-zinc-400 text-center">Recortando el cabello del corte…</p>
            )}

            {haircutImageBase64 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Corte generado</p>
                <img
                  src={`data:image/png;base64,${haircutImageBase64}`}
                  alt="Corte recomendado"
                  className="w-full max-h-72 object-contain rounded-xl border border-white/5 bg-black/30"
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
