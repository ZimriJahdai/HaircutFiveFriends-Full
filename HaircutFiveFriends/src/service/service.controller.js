'use strict';

import Service from './service.model.js';

const normalizeDuration = (value) => {
    if (typeof value !== 'string') return value;
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
};

// Crear un nuevo servicio
export const createService = async (req, res) => {
    try {
        const { name, description, price, duration, category, status, points } = req.body;

       

        const service = new Service({
            ...req.body,
            duration: normalizeDuration(duration)
        });
        await service.save();
        
        res.status(201).json({
            success: true,
            message: 'Servicio creado exitosamente',
            data: service
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message,
            
        });
    }
};

// Obtener todos los servicios
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        
        res.status(200).json({
            success: true,
            message: 'Servicios obtenidos exitosamente',
            data: services
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Obtener un servicio por ID
export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({ 
                success: false,
                message: 'Servicio no encontrado' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Servicio obtenido exitosamente',
            data: service
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Actualizar un servicio
export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration, category, status, points } = req.body;

        // Validar que el servicio exista
        let service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({ 
                success: false,
                message: 'Servicio no encontrado' 
            });
        }

        // Actualizar solo los campos que vienen en el request
        if (name) service.name = name;
        if (description) service.description = description;
        if (price) service.price = price;
        if (duration) service.duration = normalizeDuration(duration);
        if (category) service.category = category;
        if (status) service.status = status;
        if (points !== undefined) service.points = points;

        await service.save();

        res.status(200).json({
            success: true,
            message: 'Servicio actualizado exitosamente',
            data: service
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Eliminar un servicio
export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByIdAndDelete(id);

        if (!service) {
            return res.status(404).json({ 
                success: false,
                message: 'Servicio no encontrado' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Servicio eliminado exitosamente',
            data: service
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Obtener servicios por estado
export const getServicesByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        const services = await Service.find({ status });

        if (services.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay servicios con estado '${status}'`,
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: `Servicios con estado '${status}' obtenidos exitosamente`,
            data: services
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Obtener servicios por nombre (categoría)
export const getServicesByName = async (req, res) => {
    try {
        const { name } = req.params;

        const services = await Service.find({ name });

        if (services.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No hay servicios de tipo '${name}'`,
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: `Servicios de tipo '${name}' obtenidos exitosamente`,
            data: services
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Obtener servicios canjeables por puntos
export const getRedeemableServices = async (req, res) => {
    try {
        const services = await Service.find({
            pointsPrice: { $gt: 0 },
            status: 'activo'
        }).select('name description price pointsPrice duration category')

        res.status(200).json({
            success: true,
            message: 'Servicios canjeables por puntos',
            data: services
        })

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        })
    }
}