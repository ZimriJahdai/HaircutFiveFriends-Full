'use strict';

import mongoose from 'mongoose';

const serviceSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del servicio es obligatorio'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'La descripción del servicio es obligatoria'],
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'El precio del servicio es obligatorio'],
            min: 0
        },
        pointsPrice: {
            type: Number,
            default: null,
            min: 0
        },
        duration: {
            type: String,
            required: [true, 'La duración del servicio es obligatoria'],
            trim: true,
            match: [/^\d+\s?min$/i, 'La duración debe tener formato como 30min o 30 min']
        },
        category: {
            type: String,
            required: [true, 'La categoría del servicio es obligatoria'],
            trim: true,
            enum: [
                'CORTE_DE_CABELLO',
                'AFEITADO',
                'RECORTES_DE_BARBA',
                'ARREGLO_DE_CABELLO',
                'TRATAMIENTOS_CAPILARES', 
                'TRATAMIENTOS_FACIALES',
            ]
        },
        status: {
            type: String,
            required: [true, 'El estado del servicio es obligatorio'],
            enum: ['activo', 'inactivo'],
            default: 'activo'
        }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { 
            transform: function(doc, ret) {
                ret.price = `Q${Number(doc.price).toFixed(2)}`;
                return ret;
            }
        },
        toObject: { virtuals: true }
    }
);

export default mongoose.model('Service', serviceSchema);