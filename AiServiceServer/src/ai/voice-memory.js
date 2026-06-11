import mongoose from 'mongoose';

const DEFAULT_MEMORY_ID = 'default';

const DEFAULT_MEMORY = [
  'Guia operativa para citas:',
  '- Siempre confirmar servicio, barbero y fecha/hora antes de agendar.',
  '- Si falta un dato, preguntarlo antes de llamar a la herramienta.',
  '- Verificar disponibilidad con get_barber_availability antes de create_appointment.',
  '- Repetir el resumen de la cita y pedir confirmacion final.',
].join('\n');

const voiceMemorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    memory: { type: String, required: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: 'updated_at' },
    versionKey: false,
  }
);

const VoiceMemory =
  mongoose.models.VoiceMemory ||
  mongoose.model('VoiceMemory', voiceMemorySchema, 'voice_memory');

let warningLogged = false;
const memoryStore = new Map([[DEFAULT_MEMORY_ID, DEFAULT_MEMORY]]);

const logFallbackWarning = (context, error) => {
  if (warningLogged) return;
  warningLogged = true;
  console.warn(
    `[voice-memory] MongoDB no disponible (${context}). Usando memoria temporal en proceso.\n` +
      `Detalle: ${error?.message || error}`
  );
};

const canUseMongo = () => {
  const state = mongoose.connection.readyState;
  return state === 1 || state === 2;
};

const ensureDefaultMemory = async () => {
  if (!canUseMongo()) {
    return;
  }

  await VoiceMemory.findOneAndUpdate(
    { id: DEFAULT_MEMORY_ID },
    { $setOnInsert: { memory: DEFAULT_MEMORY } },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

export const getVoiceMemory = async (id = DEFAULT_MEMORY_ID) => {
  if (!canUseMongo()) {
    return memoryStore.get(id) || '';
  }

  try {
    if (id === DEFAULT_MEMORY_ID) {
      await ensureDefaultMemory();
    }

    const row = await VoiceMemory.findOne({ id }, { memory: 1, _id: 0 }).lean();
    return row?.memory || memoryStore.get(id) || '';
  } catch (error) {
    logFallbackWarning('lectura', error);
    return memoryStore.get(id) || '';
  }
};

export const setVoiceMemory = async (id, memory) => {
  if (!id) return;

  if (!canUseMongo()) {
    memoryStore.set(id, memory);
    return;
  }

  try {
    await VoiceMemory.findOneAndUpdate(
      { id },
      { $set: { memory } },
      { upsert: true, new: true }
    );
  } catch (error) {
    logFallbackWarning('escritura', error);
    memoryStore.set(id, memory);
  }
};
