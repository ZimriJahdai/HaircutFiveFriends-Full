'use strict'

import mongoose from 'mongoose'
import Detail from '../src/detailSale/detail.model.js'
import Product from '../src/product/product.model.js'
import Service from '../src/service/service.model.js'
import Client from '../src/client/client.model.js'

export const validateSaleRequest = async (req, res, next) => {
    try {
        const { detailId, detailIds, itemsWithPoints, clientId } = req.body

        // Parsear itemsWithPoints (puede venir como string o como objeto)
        let itemsWithPointsParsed = {}
        if (itemsWithPoints) {
            if (typeof itemsWithPoints === 'string') {
                try {
                    itemsWithPointsParsed = JSON.parse(itemsWithPoints)
                } catch {
                    return res.status(400).json({
                        success: false,
                        message: 'itemsWithPoints debe ser un objeto JSON válido'
                    })
                }
            } else if (typeof itemsWithPoints === 'object') {
                itemsWithPointsParsed = itemsWithPoints
            }
        }

        // ── CASO B: el front envía "details" (objetos a crear) en vez de IDs existentes ──
        let inlineDetails = req.body.details
        if (typeof inlineDetails === 'string') {
            try { inlineDetails = JSON.parse(inlineDetails) } catch { inlineDetails = null }
        }

        if (Array.isArray(inlineDetails) && inlineDetails.length > 0) {
            let hasMoney = false
            let hasPoints = false
            let totalPointsNeeded = 0

            for (const item of inlineDetails) {
                const refId = item.referenceId
                const quantity = Number(item.quantity)

                if (!refId || !mongoose.Types.ObjectId.isValid(refId)) {
                    return res.status(400).json({ success: false, message: `Referencia inválida: ${refId}` })
                }
                if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
                    return res.status(400).json({ success: false, message: 'La cantidad debe ser un entero mayor a 0' })
                }

                const usePoints = itemsWithPointsParsed[refId] === true

                if (item.detailType === 'PRODUCT') {
                    const product = await Product.findById(refId).select('name price pointsPrice stock')
                    if (!product) {
                        return res.status(404).json({ success: false, message: `Producto ${refId} no encontrado` })
                    }
                    if (product.stock < quantity) {
                        return res.status(400).json({
                            success: false,
                            message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${quantity}`
                        })
                    }
                    if (usePoints) {
                        if (!product.pointsPrice || product.pointsPrice <= 0) {
                            return res.status(400).json({ success: false, message: `El producto "${product.name}" no tiene precio en puntos` })
                        }
                        totalPointsNeeded += product.pointsPrice * quantity
                        hasPoints = true
                    } else {
                        hasMoney = true
                    }
                } else if (item.detailType === 'SERVICE') {
                    const service = await Service.findById(refId).select('name price pointsPrice')
                    if (!service) {
                        return res.status(404).json({ success: false, message: `Servicio ${refId} no encontrado` })
                    }
                    if (usePoints) {
                        if (!service.pointsPrice || service.pointsPrice <= 0) {
                            return res.status(400).json({ success: false, message: `El servicio "${service.name}" no tiene precio en puntos` })
                        }
                        totalPointsNeeded += service.pointsPrice * quantity
                        hasPoints = true
                    } else {
                        hasMoney = true
                    }
                } else {
                    return res.status(400).json({ success: false, message: 'Tipo de detalle inválido (usa PRODUCT o SERVICE)' })
                }
            }

            if (!hasMoney && !hasPoints) {
                return res.status(400).json({ success: false, message: 'La venta debe tener al menos un ítem pagado con dinero o puntos' })
            }

            if (hasPoints && clientId && mongoose.Types.ObjectId.isValid(clientId)) {
                const client = await Client.findById(clientId).select('points')
                if (client && totalPointsNeeded > client.points) {
                    return res.status(400).json({
                        success: false,
                        message: `Puntos insuficientes. Necesitas ${totalPointsNeeded} puntos pero solo tienes ${client.points}`
                    })
                }
            }

            return next()
        }

        // ── CASO A: detailId / detailIds con IDs de detalles ya existentes ──
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
