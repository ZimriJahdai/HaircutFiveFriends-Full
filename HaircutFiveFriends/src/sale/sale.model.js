'use strict';

import mongoose from 'mongoose';

const saleSchema = new mongoose  .Schema(
    {
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: [true, "Client is required"]
        },

        saleType: {
            type: String,
            enum: ["LOCAL", "DOMICILIO"],
            default: "LOCAL"
        },

        detailId: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Detail",
            // details are optional, a sale may be created without any
            // reference to individual detail documents
        }],

        addressSale: {
            type: String
        },

        saleDate: {
            type: Date,
            required: [true, "Sale date is required"]
        },

        total: {
            type: Number,
            required: [true, "Total is required"]
        },

        totalPointsUsed: {
            type: Number,
            default: 0
        },

        moneyTotal: {
            type: Number,
            default: 0
        },

        pointsMessage: {
            type: String,
            default: null
        },

        paymentMethod: {
            type: String,
            required: [true, "Payment method is required"],
            enum: ["TARJETA", "EFECTIVO"],
            default: "EFECTIVO"
        },

        status: {
            type: String,
            enum: ["COMPLETADO", "CANCELADO", "PENDIENTE"],
            default: "PENDIENTE"
        },
    },
    {
        timestamps: true,
        versionKey: false   
    }
)

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
