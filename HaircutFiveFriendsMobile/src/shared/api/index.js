// Barril de la capa API.
export { default as authClient } from './authClient';
export { default as apiClient } from './apiClient';
export { buildFormData, guessImagePart } from './buildFormData';
export { unwrap, getId } from './normalize';

// Devuelve el mensaje legible adjuntado por los interceptores (o un fallback).
export const getApiError = (error, fallback = 'Ocurrió un error') =>
  error?.readableMessage ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;
