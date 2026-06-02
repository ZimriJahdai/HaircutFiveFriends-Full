'use strict';

import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
    {
        clienteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: [true, 'El ID del cliente es obligatorio']
        },
        barberoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Barber',
            required: false
        },
        servicioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: false
        },
        score:{
            type: Number,
            required: [true, 'La puntuación es obligatoria'],
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true,
            required: [true, 'El comentario es obligatorio']
        },


    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Validación personalizada: debe calificar barbero O servicio, no ambos ni ninguno
reviewSchema.pre('save', function () {
    const hasBarbero = this.barberoId != null;
    const hasServicio = this.servicioId != null;

    if (!hasBarbero && !hasServicio) {
        throw new Error('Debe calificar un barbero o un servicio');
    }

    if (hasBarbero && hasServicio) {
        throw new Error('Solo puede calificar un barbero O un servicio, no ambos');
    }
});

export default mongoose.model('Review', reviewSchema)