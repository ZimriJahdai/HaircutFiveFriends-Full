'use strict';

import Barber from './barber.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

export const createBarber = async (req, res) => {
    try {
        // Normalizar y validar schedule si viene en body (puede ser JSON string por form-data)
        const payload = { ...req.body };
        if (req.file) {
            payload.profilePicture = req.file.path;
        }
        if (payload.schedule) {
            if (typeof payload.schedule === 'string') {
                try {
                    payload.schedule = JSON.parse(payload.schedule);
                } catch (err) {
                    return res.status(400).json({ success: false, message: 'Invalid schedule JSON' });
                }
            }

            // validar que sea un array de objetos con days y hours strings
            if (!Array.isArray(payload.schedule) || !payload.schedule.every(s => s && typeof s.days === 'string' && typeof s.hours === 'string')) {
                return res.status(400).json({ success: false, message: 'Schedule must be an array of { days: string, hours: string }' });
            }
        }

        const barber = new Barber(payload);
        await barber.save();
        return res.status(201).json({ success: true, data: barber });
    } catch (error) {
        // Eliminar imagen de Cloudinary si falla el guardado
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
                console.log('Imagen eliminada de Cloudinary tras error en create barber:', req.file.filename);
            } catch (destroyErr) {
                console.error('Error al eliminar imagen:', destroyErr);
            }
        }
        // manejo de errores comunes (si aplica)
        if (error && error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Duplicate key error' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getBarbers = async (req, res) => {
    try {
        const barbers = await Barber.find();
        return res.status(200).json({ success: true, data: barbers });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getBarberById = async (req, res) => {
    try {
        const { id } = req.params;
        const barber = await Barber.findById(id);
        if (!barber) return res.status(404).json({ success: false, message: 'Barber not found' });
        return res.status(200).json({ success: true, data: barber });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const updateBarber = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = { ...req.body };
        if (req.file) {
            payload.profilePicture = req.file.path;
        }
        if (payload.schedule) {
            if (typeof payload.schedule === 'string') {
                try {
                    payload.schedule = JSON.parse(payload.schedule);
                } catch (err) {
                    return res.status(400).json({ success: false, message: 'Invalid schedule JSON' });
                }
            }

            if (!Array.isArray(payload.schedule) || !payload.schedule.every(s => s && typeof s.days === 'string' && typeof s.hours === 'string')) {
                return res.status(400).json({ success: false, message: 'Schedule must be an array of { days: string, hours: string }' });
            }
        }

        const updated = await Barber.findByIdAndUpdate(id, payload, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Barber not found' });
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        // Eliminar imagen de Cloudinary si falla la actualización
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
                console.log('Imagen eliminada de Cloudinary tras error en update barber:', req.file.filename);
            } catch (destroyErr) {
                console.error('Error al eliminar imagen:', destroyErr);
            }
        }
        if (error && error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Duplicate key error' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteBarber = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Barber.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Barber not found' });
        return res.status(200).json({ success: true, data: deleted });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
