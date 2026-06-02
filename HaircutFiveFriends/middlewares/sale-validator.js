'use strict'

import mongoose from 'mongoose'
import Detail from '../src/detailSale/detail.model.js'
import Product from '../src/product/product.model.js'
import Service from '../src/service/service.model.js'
import Client from '../src/client/client.model.js'

export const validateSaleRequest = async (req, res, next) => {
    try {
        const { detailId, detailIds, itemsWithPoints, clientId } = req.body

        // Normalizar detailIds
        let normalizedDetailIds = detailId || detailIds || []
        if (typeof normalizedDetailIds === 'string') {
            try {
                normalizedDetailIds = JSON.parse(normalizedDetailIds)
            } catch {
                normalizedDetailIds = normalizedDetailIds.split(',').map(id => id.trim()).filter(Boolean)
            }
        }
        if (!Array.isArray(normalizedDetailIds)) {
            normalizedDetailIds = [normalizedDetailIds].filter(Boolean)
        }

        // Validación 1: Que haya al menos un detalle
        if (!normalizedDetailIds || normalizedDetailIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debes agregar al menos un detalle a la venta'
            })
        }

        // Validación 2: Validar que todos los IDs sean ObjectIds válidos
        for (const id of normalizedDetailIds) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: `ID de detalle inválido: ${id}`
                })
            }
        }

        // Validación 3: Verificar que todos los detalles existan
        const details = await Detail.find({ _id: { $in: normalizedDetailIds } })
        if (!details || details.length !== normalizedDetailIds.length) {
            return res.status(404).json({
                success: false,
                message: 'Uno o más detalles no existen'
            })
        }

        // Validación 4: Validar cantidad en cada detalle
        for (const detail of details) {
            if (!detail.quantity || detail.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `La cantidad en detalle ${detail._id} debe ser mayor a 0`
                })
            }
        }

        // Validación 5: Validar itemsWithPoints (si existe)
        let itemsWithPointsMap = {}
        if (itemsWithPoints) {
            if (typeof itemsWithPoints === 'string') {
                try {
                    itemsWithPointsMap = JSON.parse(itemsWithPoints)
                } catch {
                    return res.status(400).json({
                        success: false,
                        message: 'itemsWithPoints debe ser un objeto JSON válido'
                    })
                }
            } else if (typeof itemsWithPoints === 'object') {
                itemsWithPointsMap = itemsWithPoints
            }

            // Validación 5a: Validar que los IDs en itemsWithPoints existan en detailIds
            for (const detailId of Object.keys(itemsWithPointsMap)) {
                if (!normalizedDetailIds.some(id => id.toString() === detailId)) {
                    return res.status(400).json({
                        success: false,
                        message: `El ID ${detailId} en itemsWithPoints no existe en los detalles de la venta`
                    })
                }

                // Validación 5b: Validar que los valores sean booleanos
                const value = itemsWithPointsMap[detailId]
                if (typeof value !== 'boolean') {
                    return res.status(400).json({
                        success: false,
                        message: `itemsWithPoints[${detailId}] debe ser true o false, recibido: ${typeof value}`
                    })
                }
            }
        }

        // Validación 6: Validar que no sea una venta vacía (sin dinero ni puntos)
        let hasMoney = false
        let hasPoints = false

        for (const detail of details) {
            const detailIdStr = detail._id.toString()
            const usePoints = itemsWithPointsMap[detailIdStr] === true

            if (usePoints) {
                hasPoints = true
            } else {
                hasMoney = true
            }
        }

        if (!hasMoney && !hasPoints) {
            return res.status(400).json({
                success: false,
                message: 'La venta debe tener al menos un ítem pagado con dinero o puntos'
            })
        }

        // Validación 7: Validar stock disponible de productos
        for (const detail of details) {
            const detailIdStr = detail._id.toString()
            const usePoints = itemsWithPointsMap[detailIdStr] === true

            if (detail.detailType === 'PRODUCT') {
                const product = await Product.findById(detail.referenceId).select('stock name')
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: `Producto ${detail.referenceId} no encontrado`
                    })
                }

                if (product.stock < detail.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${detail.quantity}`
                    })
                }
            }
        }

        // Validación 8: Validar que el cliente tenga puntos suficientes si usa canje
        if (hasPoints && clientId) {
            const client = await Client.findById(clientId).select('points')
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                })
            }

            let totalPointsNeeded = 0

            for (const detail of details) {
                const detailIdStr = detail._id.toString()
                const usePoints = itemsWithPointsMap[detailIdStr] === true

                if (usePoints) {
                    if (detail.detailType === 'SERVICE') {
                        const service = await Service.findById(detail.referenceId).select('pointsPrice')
                        if (service && service.pointsPrice > 0) {
                            totalPointsNeeded += service.pointsPrice * detail.quantity
                        }
                    } else if (detail.detailType === 'PRODUCT') {
                        const product = await Product.findById(detail.referenceId).select('pointsPrice')
                        if (product && product.pointsPrice > 0) {
                            totalPointsNeeded += product.pointsPrice * detail.quantity
                        }
                    }
                }
            }

            if (totalPointsNeeded > client.points) {
                return res.status(400).json({
                    success: false,
                    message: `Puntos insuficientes. Necesitas ${totalPointsNeeded} puntos pero solo tienes ${client.points}`,
                    pointsNeeded: totalPointsNeeded,
                    pointsAvailable: client.points
                })
            }

            // Validación 9: Validar que cliente nunca tenga puntos negativos
            if (client.points - totalPointsNeeded < 0) {
                return res.status(400).json({
                    success: false,
                    message: `No puedes tener puntos negativos. Tus puntos: ${client.points}, A descontar: ${totalPointsNeeded}`
                })
            }
        }

        next()
    } catch (error) {
        console.error('Error en sale-validator:', error)
        return res.status(500).json({
            success: false,
            message: 'Error validando la venta: ' + error.message
        })
    }
}
