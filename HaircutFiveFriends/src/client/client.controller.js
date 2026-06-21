'use strict';

import Client from './client.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

export const createClient = async (req, res) => {
    try {
        const payload = { ...req.body };

        if (req.userId) {
            payload.userId = req.userId;
        }

        if (!payload.profilePicture && req.auth?.profilePicture) {
            payload.profilePicture = req.auth.profilePicture;
        }
        if (req.file) {
            payload.profilePicture = req.file.path;
        }

        const client = new Client(payload);
        await client.save();
        return res.status(201).json({ success: true, data: client });
    } catch (error) {
        // Eliminar imagen de Cloudinary si falla el guardado
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
                console.log('Imagen eliminada de Cloudinary tras error en create client:', req.file.filename);
            } catch (destroyErr) {
                console.error('Error al eliminar imagen:', destroyErr);
            }
        }
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getClients = async (req, res) => {
    try {
        const clients = await Client.find();
        return res.status(200).json({ success: true, data: clients });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Devuelve el cliente de Mongo vinculado al usuario autenticado (por userId del token)
export const getMyClient = async (req, res) => {
    try {
        const client = await Client.findOne({ userId: req.userId })
            .select('name email phone points faceshape profilePicture');
        if (!client) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado para el usuario autenticado' });
        }
        return res.status(200).json({ success: true, data: client });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findById(id);
        if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
        return res.status(200).json({ success: true, data: client });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        // Sólo permitir que el cliente edite estos campos
        const allowed = ['name', 'phone', 'email', 'profilePicture', 'faceshape'];
        const updates = {};

        if (req.file) {
            updates.profilePicture = req.file.path;
        }

        allowed.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No editable fields provided' });
        }

        const updated = await Client.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Client not found' });
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        // Eliminar imagen de Cloudinary si falla la actualización
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
                console.log('Imagen eliminada de Cloudinary tras error en update client:', req.file.filename);
            } catch (destroyErr) {
                console.error('Error al eliminar imagen:', destroyErr);
            }
        }
        // Manejar error de índice único (email duplicado)
        if (error && error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Client.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Client not found' });
        return res.status(200).json({ success: true, data: deleted });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getClientPoints = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findById(id).select('name points');
        if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
        return res.status(200).json({ 
            success: true, 
            data: {
                clientId: client._id,
                name: client.name,
                points: client.points || 0
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
