'use strict'

import Product from './product.model.js'

// Crear producto
export const createProduct = async (req, res) => {
    try {
        const data = req.body;
        if (req.file) {
            data.image = req.file.path;
        }

        const product = new Product(data)
        await product.save()

        return res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: product
        })

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'ID de producto ya existe'
            })
        }

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Obtener todos
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()

        return res.status(200).json({
            success: true,
            data: products
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Obtener por ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params

        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            })
        }

        return res.status(200).json({
            success: true,
            data: product
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Actualizar
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (req.file) {
            data.image = req.file.path;
        }

        const product = await Product.findByIdAndUpdate(id, data, { new: true })

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Producto actualizado',
            data: product
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Eliminar
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        const product = await Product.findByIdAndDelete(id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Producto eliminado'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Obtener productos canjeables por puntos
export const getRedeemableProducts = async (req, res) => {
    try {
        const products = await Product.find({
            pointsPrice: { $gt: 0 },
            status: 'active'
        }).select('name description price pointsPrice image category stock')

        return res.status(200).json({
            success: true,
            message: 'Productos canjeables por puntos',
            data: products
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}