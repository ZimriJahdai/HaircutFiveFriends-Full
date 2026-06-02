'use strict';
import mongoose from 'mongoose';

const normalizeToMinute = (value) => {
    const date = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    date.setSeconds(0, 0);
    return date;
};

const formatDateTime = (value) => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return value;
    const pad = (number) => number.toString().padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
};

const appointmentSchema = new mongoose.Schema(
    {
        clienteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: [true, 'El cliente es obligatorio'],
        },
        barberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Barber',
            required: false,
            default: null,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: [true, 'El servicio es obligatorio']
        },
        appointmentDate: {
            type: Date,
            required: [true, 'La fecha de la cita es obligatoria'],
            set: normalizeToMinute,
            get: formatDateTime
        },
        status: {
            type: String,
            enum: ['PENDIENTE', 'CANCELADA', 'COMPLETADA'],
            default: 'PENDIENTE',
            trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

export default mongoose.model('Appointment', appointmentSchema);