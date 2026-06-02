'use strict';

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const clientSchema = new mongoose.Schema(
    {
        userId: {
            type: String
        },

        name:{
            type: String,
            required: [true, "Name is required"]
        },

        phone:{
            type: String,
            required: [true, "Phone is required"]
        },

        email:{
            type: String,
            required: [true, "Email is required"],
            unique: true
        },

         password:{
            type: String,
            required: [true, "Contraseña is required"]
        },

        profilePicture:{
            type: String,
            default: null
        },

        faceshape: {
            type: String
        },

        points: {
            type: Number,
            default: 0,
            min: [0, 'Los puntos no pueden ser negativos']
        },

        status:{
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
)

clientSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

clientSchema.index({ userId: 1});
export default mongoose.model("Client", clientSchema);