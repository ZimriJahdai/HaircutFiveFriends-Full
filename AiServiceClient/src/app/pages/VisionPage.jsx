import { useEffect, useRef, useState } from 'react';
import { AR_WS_URL } from '../constants/ar.js';
import { sendOverlayToAr } from '../services/arApi.js';
import { recommendHaircuts } from '../services/visionApi.js';
import { getAuth } from '../utils/authStorage.js';

const FACE_SHAPE_LABELS = {
  OVALADO: 'Ovalado',
  CUADRADO: 'Cuadrado',
  REDONDO: 'Redondo',
  CORAZON: 'Corazon',
  CORAZONADO: 'Corazon',
  TRIANGULAR: 'Triangular',
  CUALQUIERA: 'Cualquiera',
};

const getFaceShapeLabel = (shape) => {
  if (!shape) return '';
  const key = String(shape).toUpperCase();
  return FACE_SHAPE_LABELS[key] || shape;
};

const getHaircutImage = (item) => (
  item?.image ||
  item?.imageUrl ||
  item?.cloudinaryUrl ||
  item?.photo ||
  item?.thumbnail ||
  item?.url ||
  item?.img ||
  ''
);

const getHaircutName = (item, index) => (
  item?.name || item?.nombre || item?.title || item?.style || `Corte ${index + 1}`
);

const toImageDataUrl = (base64) => {
  if (!base64) return '';
  const trimmed = String(base64).trim();
  if (trimmed.startsWith('data:')) return trimmed;
  return `data:image/png;base64,${trimmed}`;
};

const buildFaceSummaryText = (summary) => {
  if (!summary) return '';
  if (typeof summary === 'string') return summary;

  const parts = [
    summary.faceShape && `Forma: ${summary.faceShape}`,
    summary.hairTexture && `Textura: ${summary.hairTexture}`,
    summary.hairColor && `Color: ${summary.hairColor}`,
    summary.facialLines && `Lineas faciales: ${summary.facialLines}`,
    summary.recommendedHaircutStyle && `Estilo sugerido: ${summary.recommendedHaircutStyle}`,
  ].filter(Boolean);

  return parts.join('. ');
};

const cleanMarkdownDecorators = (value) => {
  if (!value) return '';

  return String(value)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*/g, '')
    .replace(/^\s*[-•]\s*/gm, '')
    .trim();
};

const buildSummaryBlocks = (summary) => {
  const raw = cleanMarkdownDecorators(buildFaceSummaryText(summary));
  if (!raw) return [];

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const normalizedLines = lines.length > 1
    ? lines
    : raw
      .split(/\.\s+/)
      .map((line) => line.trim())
      .filter(Boolean);

  return normalizedLines.map((line, index) => {
    const match = line.match(/^([^:]{2,80}):\s*(.+)$/);
    if (!match) {
      return {
        id: `summary-${index}`,
        subtitle: '',
        content: line,
      };
    }

    return {
      id: `summary-${index}`,
      subtitle: match[1].trim(),
      content: match[2].trim(),
    };
  });
};

export default function VisionPage() {
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [fileName, setFileName] = useState('');
  const [haircutName, setHaircutName] = useState('');
  const [haircutDescription, setHaircutDescription] = useState('');
  const [hairLength, setHairLength] = useState('');
  const [hairStyle, setHairStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [faceShape, setFaceShape] = useState('');
  const [faceSummary, setFaceSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [generatedImage, setGeneratedImage] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [streamError, setStreamError] = useState('');
  const fileInputRef = useRef(null);
  const streamUrlRef = useRef('');
  const streamWsRef = useRef(null);
  const summaryBlocks = buildSummaryBlocks(faceSummary);

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && AR_WS_URL.startsWith('ws://')) {
      setStreamError('El modulo AR debe exponerse por WSS cuando usas HTTPS (ngrok).');
      return () => {};
    }

    let ws;
    try {
      ws = new WebSocket(AR_WS_URL);
    } catch (error) {
      setStreamError('No se pudo conectar con el modulo AR.');
      return () => {};
    }
    ws.binaryType = 'arraybuffer';
    streamWsRef.current = ws;

    ws.onopen = () => {
      setStreamError('');
    };

    ws.onmessage = (event) => {
      const blob = new Blob([event.data], { type: 'image/jpeg' });
      const nextUrl = URL.createObjectURL(blob);
      if (streamUrlRef.current) {
        URL.revokeObjectURL(streamUrlRef.current);
      }
      streamUrlRef.current = nextUrl;
      setStreamUrl(nextUrl);
    };

    ws.onerror = () => {
      setStreamError('No se pudo conectar con el modulo AR.');
    };

    ws.onclose = () => {
      if (!streamError) {
        setStreamError('Conexion cerrada con el modulo AR.');
      }
    };

    return () => {
      ws.close();
      if (streamUrlRef.current) {
        URL.revokeObjectURL(streamUrlRef.current);
        streamUrlRef.current = '';
      }
    };
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Selecciona una imagen valida (JPG o PNG).');
      return;
    }

    setError('');
    setFaceShape('');
    setFaceSummary(null);
    setRecommendations([]);
    setGeneratedImage('');
    setFileName(file.name || '');
    setMimeType(file.type || 'image/jpeg');

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      setImageBase64(base64);
    };
    reader.onerror = () => {
      setError('No se pudo leer la imagen.');
      setImageBase64('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError('Selecciona una foto antes de analizar.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const auth = getAuth();
      const data = await recommendHaircuts({
        imageBase64,
        mimeType,
        token: auth?.token,
        haircutName,
        description: haircutDescription,
        length: hairLength,
        style: hairStyle,
      });
      setFaceShape(data?.faceShape || '');
      setFaceSummary(data?.faceSummary || null);
      const haircutBase64 = data?.haircutImageBase64 || '';
      setGeneratedImage(haircutBase64);
      setRecommendations(Array.isArray(data?.recommendations) ? data.recommendations : []);

      if (haircutBase64) {
        sendOverlayToAr({
          imageBase64: haircutBase64,
          mimeType: 'image/png',
          faceSummary: data?.faceSummary || null,
        }).catch(() => {
          setStreamError('No se pudo enviar el corte al modulo AR.');
        });
      }
    } catch (requestError) {
      setError(requestError.message || 'Error al procesar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setError('');
    setFaceShape('');
    setFaceSummary(null);
    setRecommendations([]);
    setGeneratedImage('');
    setImageBase64('');
    setMimeType('');
    setFileName('');
    setHaircutName('');
    setHaircutDescription('');
    setHairLength('');
    setHairStyle('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="page">
      <div className="page-head">
        <h1>Vision facial</h1>
        <p>Sube una foto y obten recomendaciones segun la forma del rostro.</p>
      </div>

      <div className="grid vision-grid">
        <div className="card vision-card">
          <h3>Sube una foto</h3>
          <p className="vision-hint">
            Usa buena luz y mira al frente para mejores resultados.
          </p>
          <div className="vision-upload">
            <label className="ghost-button" htmlFor="vision-file">
              Seleccionar foto
            </label>
            <input
              ref={fileInputRef}
              id="vision-file"
              className="vision-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {fileName && <span className="vision-file-name">{fileName}</span>}
          </div>

          <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
            <input
              type="text"
              className="chat-input"
              placeholder="Nombre del corte (ej: low fade, pompadour)"
              value={haircutName}
              onChange={(event) => setHaircutName(event.target.value)}
            />
            <input
              type="text"
              className="chat-input"
              placeholder="Descripcion opcional del corte"
              value={haircutDescription}
              onChange={(event) => setHaircutDescription(event.target.value)}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select
                className="chat-input"
                value={hairLength}
                onChange={(event) => setHairLength(event.target.value)}
              >
                <option value="">Largo (opcional)</option>
                <option value="short">Corto</option>
                <option value="medium">Medio</option>
                <option value="long">Largo</option>
              </select>
              <select
                className="chat-input"
                value={hairStyle}
                onChange={(event) => setHairStyle(event.target.value)}
              >
                <option value="">Estilo (opcional)</option>
                <option value="classic">Clasico</option>
                <option value="modern">Moderno</option>
                <option value="urban">Urbano</option>
              </select>
            </div>
          </div>

          <div className="vision-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !imageBase64}
            >
              {loading ? 'Analizando...' : 'Analizar foto'}
            </button>
            <button className="ghost-button" type="button" onClick={handleClear}>
              Limpiar
            </button>
          </div>

          <div className="vision-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="Previsualizacion" />
            ) : (
              <span>Sin foto cargada</span>
            )}
          </div>
        </div>

        <div className="card vision-card">
          <h3>Vista en tiempo real</h3>
          <div className="vision-preview">
            {streamUrl ? (
              <img src={streamUrl} alt="Camara en vivo" />
            ) : (
              <span>Conectando camara...</span>
            )}
          </div>
          {streamError && <p className="vision-error">{streamError}</p>}
        </div>

        <div className="card vision-card">
          <h3>Resultado</h3>
          {error && <p className="vision-error">{error}</p>}
          {!error && loading && <p className="vision-loading">Procesando rostro...</p>}
          {!loading && faceShape && (
            <div className="vision-result">
              <span className="status-pill accent">
                Forma detectada: {getFaceShapeLabel(faceShape)}
              </span>
            </div>
          )}

          {!loading && generatedImage && (
            <div className="vision-generated">
              <div className="transcript-label">Vista previa del corte</div>
              <div className="vision-preview">
                <img src={toImageDataUrl(generatedImage)} alt="Corte sugerido" />
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div>
              <div className="transcript-label">Recomendaciones</div>
              <div className="haircut-grid">
                {recommendations.map((item, index) => {
                  const image = getHaircutImage(item);
                  const name = getHaircutName(item, index);
                  return (
                    <div key={item?._id || item?.id || `${name}-${index}`} className="haircut-card">
                      {image ? (
                        <img src={image} alt={name} loading="lazy" />
                      ) : (
                        <div className="haircut-placeholder">Sin imagen</div>
                      )}
                      <div className="haircut-body">
                        <div className="haircut-name">{name}</div>
                        {item?.description && (
                          <div className="haircut-meta">{cleanMarkdownDecorators(item.description)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="card vision-card vision-detail-card">
          <h3>Detalle completo</h3>
          {error && <p className="vision-error">{error}</p>}
          {!error && (
            <div className="vision-detail-text" style={{ display: 'grid', gap: '8px' }}>
              {summaryBlocks.length > 0 ? (
                summaryBlocks.map((block) => (
                  <p key={block.id} style={{ margin: 0 }}>
                    {block.subtitle ? <strong>{block.subtitle}: </strong> : null}
                    <span>{block.content}</span>
                  </p>
                ))
              ) : (
                <p style={{ margin: 0 }}>Sin descripcion disponible.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
