import axios from "axios";
import { useAuthStore } from "../../features/auth/store/authStore";
import { handleRefreshToken } from "./api";

// Cliente para AiServiceServer (puerto 3007). El JWT lo emite AuthService y se
// valida en todos los backends con el mismo JWT_SECRET, asi que reutilizamos el
// token del store. Timeout alto porque la generacion con Gemini tarda.
const axiosAI = axios.create({
    baseURL: import.meta.env.VITE_AI_URL,
    timeout: 60000,
    headers: {
        "Content-Type": "application/json"
    }
});

axiosAI.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosAI.interceptors.response.use((res) => res, handleRefreshToken);

// Analiza el rostro y genera la imagen del corte recomendado.
// Respuesta: { success, faceSummary, haircutImageBase64, haircutParams }
export const analyzeHaircut = ({
    imageBase64,
    mimeType,
    haircutName,
    description,
    length,
    style,
} = {}) => {
    return axiosAI.post("/api/ai-haircut/analyze", {
        imageBase64,
        mimeType: mimeType || "image/jpeg",
        haircutName: haircutName || undefined,
        description: description || undefined,
        length: length || undefined,
        style: style || undefined,
    });
};

export { axiosAI };
