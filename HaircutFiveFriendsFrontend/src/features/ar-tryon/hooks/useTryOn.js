import { useTryOnStore } from '../store/useTryOnStore';

// Acceso al analisis IA del corte (resumen del rostro + imagen generada).
export const useTryOn = () => {
  const faceSummary = useTryOnStore((s) => s.faceSummary);
  const haircutImageBase64 = useTryOnStore((s) => s.haircutImageBase64);
  const loading = useTryOnStore((s) => s.loading);
  const error = useTryOnStore((s) => s.error);
  const analyze = useTryOnStore((s) => s.analyze);
  const reset = useTryOnStore((s) => s.reset);

  return { faceSummary, haircutImageBase64, loading, error, analyze, reset };
};
