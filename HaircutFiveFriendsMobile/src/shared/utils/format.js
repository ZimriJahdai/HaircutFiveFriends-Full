// Utilidades de formato (es-GT). formatCurrency usa el símbolo "Q" a mano en
// vez de Intl.NumberFormat con currency:'GTQ' porque el soporte de ICU de
// Hermes para monedas poco comunes es inconsistente entre plataformas.

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return 'N/D';
  }
  return `Q${Number(amount).toFixed(2)}`;
};

export const formatDate = (value) => {
  if (!value) return 'N/D';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/D';
  return date.toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const formatDateTime = (value) => {
  if (!value) return 'N/D';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/D';
  return date.toLocaleString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Normaliza para búsqueda: minúsculas, sin acentos, sin espacios.
const DIACRITICS_REGEX = new RegExp('[\\u0300-\\u036f]', 'g');

export const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .toLowerCase()
    .trim();
