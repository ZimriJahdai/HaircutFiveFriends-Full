'use strict';

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const barberSchema = new mongoose.Schema(
    {
        userId: {
            type: String
        },

        name: {
            type: String,
            required: [true, "Name is required"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true
        },

        password: {
            type: String,
            required: [true, "Contraseña is required"]
        },

        phone: {
            type: String,
            required: [true, "Phone is required"]
        },

        profilePicture: {
            type: String,
            default: null
        },

        schedule: [
            {
                _id: false,
                days: {
                    type: String
                },
                hours: {
                    type: String
                }
            }
        ],

        status: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true,
        versionKey: false
    })

barberSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

barberSchema.index({ userId: 1 });
export default mongoose.model("Barber", barberSchema);