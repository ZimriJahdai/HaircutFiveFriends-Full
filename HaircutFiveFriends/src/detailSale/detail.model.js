'use strict';

import mongoose from 'mongoose';
import validateDetail from '../../middlewares/validateDetail.js';

const detailSchema = new mongoose  .Schema(
    {
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Reference is required"]
        },

        detailType: {
            type: String,
            enum: ['SERVICE', 'PRODUCT'],
            required: [true, "Detail type is required"]
        },

        quantity: {
            type: Number,
            required: [true, "Quantity is required"]
        },

        paidWithPoints: {
            type: Boolean
        },

        pointsUsed: {
            type: Number
        },

        total: {
            type: Number
        }
    },
    {
        timestamps: true,
        versionKey: false   
    }
)

detailSchema.pre('save', validateDetail)

detailSchema.index({ referenceId: 1});

const Detail = mongoose.model('Detail', detailSchema);

export default Detail;