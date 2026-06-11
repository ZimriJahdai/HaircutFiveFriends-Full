import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema(
    {
        role: { type: String, required: true },
        parts: { type: [mongoose.Schema.Types.Mixed], default: [] },
        channel: { type: String, enum: ['text', 'voice'], default: 'text' },
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);

const ChatSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, unique: true },
        messages: { type: [ChatMessageSchema], default: [] },
    },
    { timestamps: true }
);

export const Chat = mongoose.model('Chat', ChatSchema);
