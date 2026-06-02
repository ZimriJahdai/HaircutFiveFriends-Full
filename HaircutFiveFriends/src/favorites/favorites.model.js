'use strict';

import mongoose from 'mongoose';

const favoritesSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: [true, "Client ID is required"]
    },
    typeFavorite:{
        type: String,
        required: [true, "Tipo de favorito is required"],
        enum: ["PRODUCT", "SERVICE", "HAIRCUT", "BARBER"]
    },
    referenceId:{
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Reference ID is required"]
    }
}, {
    timestamps: true,
    versionKey: false
});

favoritesSchema.index({ clientId: 1, typeFavorite: 1, referenceId: 1 }, { unique: true });
favoritesSchema.index({ referenceId: 1 });
export default mongoose.model("Favorites", favoritesSchema);