'use strict'

import mongoose from 'mongoose'
import Sale from './sale.model.js'
import Detail from '../detailSale/detail.model.js'
import Product from '../product/product.model.js'
import Service from '../service/service.model.js'
import Client from '../client/client.model.js'
import increasePointsForSale from '../../middlewares/pointPerSale.js'

// Adjunta el nombre del producto/servicio a cada detalle (referenceId no tiene ref directa)
const enrichSales = async (sales) => {
    const productIds = new Set()
    const serviceIds = new Set()

    for (const sale of sales) {
        for (const detail of (sale.detailId || [])) {
            if (!detail || !detail.referenceId) continue
            const refId = detail.referenceId.toString()
            if (detail.detailType === 'PRODUCT') productIds.add(refId)
            else if (detail.detailType === 'SERVICE') serviceIds.add(refId)
        }
    }

    const [products, services] = await Promise.all([
        Product.find({ _id: { $in: [...productIds] } }).select('name').lean(),
        Service.find({ _id: { $in: [...serviceIds] } }).select('name').lean(),
    ])

    const nameMap = {}
    products.forEach((p) => { nameMap[p._id.toString()] = p.name })
    services.forEach((s) => { nameMap[s._id.toString()] = s.name })

    for (const sale of sales) {
        for (const detail of (sale.detailId || [])) {
            if (!detail || !detail.referenceId) continue
            const refId = detail.referenceId.toString()
            detail.referenceId = { _id: refId, name: nameMap[refId] || null }
        }
    }

    return sales
}

export const createSale = async (req, res) => {
    try {
        const saleData = { ...(req.body || {}) }

        // allow client to send detailIds or an array of detail objects
        if (saleData.detailIds && !saleData.detailId) {
            saleData.detailId = saleData.detailIds
        }

        // if the request includes full detail objects, create them first
        if (Array.isArray(saleData.details) && saleData.details.length > 0) {
            const createdDetails = await Detail.insertMany(saleData.details)
            saleData.detailId = createdDetails.map(d => d._id)
        }

        const normalizeDetailIds = (input) => {
            if (!input) return []

            if (Array.isArray(input)) {
                return input.flatMap((item) => normalizeDetailIds(item))
            }

            if (typeof input === 'string') {
                const trimmed = input.trim()
                if (!trimmed) return []

                try {
                    const parsed = JSON.parse(trimmed)
                    return normalizeDetailIds(parsed)
                } catch (error) {
                    return trimmed
                        .split(',')
                        .map((value) => value.replace(/[\[\]"'{}]/g, '').trim())
                        .filter(Boolean)
                }
            }

            return [input]
        }

        if (typeof saleData.clientId === 'string') {
            saleData.clientId = saleData.clientId.replace(/[,\s]+$/g, '').trim()
        }

        // Resolver el cliente aceptando el _id de Mongo, el userId de auth o el token
        let client = null
        const rawClientId = saleData.clientId
        if (rawClientId && mongoose.Types.ObjectId.isValid(rawClientId)) {
            client = await Client.findById(rawClientId)
        }
        if (!client && rawClientId) {
            client = await Client.findOne({ userId: rawClientId })
        }
        if (!client && req.userId) {
            client = await Client.findOne({ userId: req.userId })
        }
        if (!client) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' })
        }
        saleData.clientId = client._id

        const detailIds = normalizeDetailIds(saleData.detailId)
        saleData.detailId = detailIds

        // Mapa de items que se pagarán con puntos (viene del request)
        // Formato: { detailId: true/false }
        let itemsWithPoints = {}
        if (saleData.itemsWithPoints) {
            if (typeof saleData.itemsWithPoints === 'string') {
                try {
                    itemsWithPoints = JSON.parse(saleData.itemsWithPoints)
                } catch (error) {
                    console.log('Error parseando itemsWithPoints:', error)
                    itemsWithPoints = {}
                }
            } else if (typeof saleData.itemsWithPoints === 'object') {
                itemsWithPoints = saleData.itemsWithPoints
            }
        }

        // if there is at least one id, attempt to load and calculate a total
        let moneyTotal = 0
        let totalPointsNeeded = 0

        if (detailIds && detailIds.length > 0) {
            const details = await Detail.find({ _id: { $in: detailIds } })
            if (!details || details.length === 0) {
                return res.status(404).json({ success: false, message: 'Details not found' })
            }

            for (const detail of details) {
                const quantity = Number(detail.quantity) || 0
                if (quantity <= 0) continue

                const detailId = detail._id.toString()
                const refId = detail.referenceId?.toString()
                const usePoints = itemsWithPoints[detailId] === true || (refId && itemsWithPoints[refId] === true)

                if (detail.detailType === 'SERVICE') {
                    const service = await Service.findById(detail.referenceId).select('price pointsPrice')
                    if (!service) {
                        return res.status(404).json({ success: false, message: 'Service reference not found' })
                    }

                    if (usePoints) {
                        if (!service.pointsPrice || service.pointsPrice <= 0) {
                            return res.status(400).json({
                                success: false,
                                message: `El servicio "${service.name || 'desconocido'}" no tiene precio en puntos definido`
                            })
                        }
                        totalPointsNeeded += Number(service.pointsPrice) * quantity
                        detail.paidWithPoints = true
                        detail.pointsUsed = Number(service.pointsPrice) * quantity
                        detail.total = 0
                    } else {
                        moneyTotal += Number(service.price) * quantity
                        detail.paidWithPoints = false
                        detail.pointsUsed = 0
                        detail.total = Number(service.price) * quantity
                    }
                    await detail.save()

                } else if (detail.detailType === 'PRODUCT') {
                    const product = await Product.findById(detail.referenceId).select('price pointsPrice')
                    if (!product) {
                        return res.status(404).json({ success: false, message: 'Product reference not found' })
                    }

                    if (usePoints) {
                        if (!product.pointsPrice || product.pointsPrice <= 0) {
                            return res.status(400).json({
                                success: false,
                                message: `El producto "${product.name || 'desconocido'}" no tiene precio en puntos definido`
                            })
                        }
                        totalPointsNeeded += Number(product.pointsPrice) * quantity
                        detail.paidWithPoints = true
                        detail.pointsUsed = Number(product.pointsPrice) * quantity
                        detail.total = 0
                    } else {
                        moneyTotal += Number(product.price) * quantity
                        detail.paidWithPoints = false
                        detail.pointsUsed = 0
                        detail.total = Number(product.price) * quantity
                    }
                    await detail.save()

                } else {
                    return res.status(400).json({ success: false, message: 'Invalid detail type' })
                }
            }

            // Verificar que el cliente tenga suficientes puntos
            if (totalPointsNeeded > 0 && client.points < totalPointsNeeded) {
                return res.status(400).json({
                    success: false,
                    message: `Puntos insuficientes. Necesitas ${totalPointsNeeded} puntos pero solo tienes ${client.points}`
                })
            }

            // Restar los puntos del cliente si se usaron
            if (totalPointsNeeded > 0) {
                await Client.findByIdAndUpdate(
                    saleData.clientId,
                    { $inc: { points: -totalPointsNeeded } },
                    { new: true }
                )
            }

        } else {
            // no details provided; allow total to be supplied or fall back to 0
            moneyTotal = Number(saleData.total) || 0
        }

        saleData.total = moneyTotal
        saleData.moneyTotal = moneyTotal
        saleData.totalPointsUsed = totalPointsNeeded

        // Solo dar puntos por el monto pagado en dinero, no por items canjeados
        const pointsToAdd = Number((moneyTotal * 0.1).toFixed(2))

        if (totalPointsNeeded > 0) {
            saleData.pointsMessage = `Canjeaste ${totalPointsNeeded} puntos. `
            if (pointsToAdd > 0) {
                saleData.pointsMessage += `Se te agregaron ${pointsToAdd} puntos por tu compra.`
            }
        } else {
            saleData.pointsMessage = `Se te agregaron ${pointsToAdd} puntos a tu cuenta`
        }

        const sale = new Sale(saleData)
        await sale.save()

        // Solo sumar puntos si hubo pago en dinero
        if (moneyTotal > 0) {
            await increasePointsForSale({
                clientId: sale.clientId,
                detailIds: sale.detailId,
                saleTotal: moneyTotal
            })
        }

        return res.status(201).json({
            success: true,
            message: 'Sale created successfully',
            sale,
            pointsUsed: totalPointsNeeded,
            clientPointsRemaining: client.points
        })

    } catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

export const getSales = async (req, res) => {
    try {
        const sales = await Sale.find()
            .populate('clientId', 'name email phone points')
            .populate('detailId')
            .lean()
        return res.status(200).json({ success: true, sales: await enrichSales(sales) })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error getting sales', err })
    }
}

export const getMySales = async (req, res) => {
    try {
        const userId = req.userId
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }

        // El token trae el id de auth; el cliente de Mongo se vincula por userId
        const client = await Client.findOne({ userId })
        if (!client) {
            return res.status(200).json({ success: true, sales: [] })
        }

        const sales = await Sale.find({ clientId: client._id })
            .populate('clientId', 'name email phone points')
            .populate('detailId')
            .lean()
        return res.status(200).json({ success: true, sales: await enrichSales(sales) })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error getting sales', err })
    }
}

export const getSaleById = async (req, res) => {
    try {
        const { id } = req.params
        const sale = await Sale.findById(id)
            .populate('clientId', 'name email phone points')
            .populate('detailId')
            .lean()
        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale not found' })
        }
        const [enriched] = await enrichSales([sale])
        return res.status(200).json({ success: true, sale: enriched })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error getting sale', err })
    }
}

export const addDetailsToSale = async (req, res) => {
    try {
        const { id } = req.params
        const payload = req.body || {}

        const normalizeDetailIds = (input) => {
            if (!input) return []

            if (Array.isArray(input)) {
                return input.flatMap((item) => normalizeDetailIds(item))
            }

            if (typeof input === 'string') {
                const trimmed = input.trim()
                if (!trimmed) return []

                try {
                    const parsed = JSON.parse(trimmed)
                    return normalizeDetailIds(parsed)
                } catch (error) {
                    return trimmed
                        .split(',')
                        .map((value) => value.replace(/[\[\]"'{}]/g, '').trim())
                        .filter(Boolean)
                }
            }

            return [input]
        }

        const detailIds = normalizeDetailIds(payload.detailId || payload.detailIds)
        if (detailIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Detail IDs are required' })
        }

        const currentSale = await Sale.findById(id).select('detailId')
        if (!currentSale) {
            return res.status(404).json({ success: false, message: 'Sale not found' })
        }

        const details = await Detail.find({ _id: { $in: detailIds } })
        if (!details || details.length === 0 || details.length !== detailIds.length) {
            return res.status(404).json({ success: false, message: 'Details not found' })
        }

        const mergedDetailIds = [
            ...new Set([
                ...(currentSale.detailId || []).map((item) => item.toString()),
                ...detailIds.map((item) => item.toString())
            ])
        ]

        const allLinkedDetails = await Detail.find({ _id: { $in: mergedDetailIds } }).select('total')
        const recalculatedTotal = allLinkedDetails.reduce((acc, current) => acc + Number(current.total || 0), 0)

        const sale = await Sale.findByIdAndUpdate(
            id,
            {
                detailId: mergedDetailIds,
                total: recalculatedTotal
            },
            { new: true }
        ).populate('clientId').populate('detailId')

        return res.status(200).json({
            success: true,
            message: 'Details added to sale successfully',
            sale
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error adding details to sale', err })
    }
}

export const updateSale = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = { ...(req.body || {}) }

        // Normalizar detailId igual que en createSale
        const normalizeDetailIds = (input) => {
            if (!input) return []

            if (Array.isArray(input)) {
                return input.flatMap((item) => normalizeDetailIds(item))
            }

            if (typeof input === 'string') {
                const trimmed = input.trim()
                if (!trimmed) return []

                try {
                    const parsed = JSON.parse(trimmed)
                    return normalizeDetailIds(parsed)
                } catch (error) {
                    return trimmed
                        .split(',')
                        .map((value) => value.replace(/[\[\]"'{}]/g, '').trim())
                        .filter(Boolean)
                }
            }

            return [input]
        }

        // Si detailId viene en los datos, normalizarlo
        if (updateData.detailId) {
            updateData.detailId = normalizeDetailIds(updateData.detailId)
        }

        const sale = await Sale.findByIdAndUpdate(id, updateData, { new: true })
        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale not found' })
        }
        return res.status(200).json({ success: true, message: 'Sale updated', sale })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error updating sale', err })
    }
}

export const deleteSale = async (req, res) => {
    try {
        const { id } = req.params
        const sale = await Sale.findByIdAndDelete(id)
        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale not found' })
        }
        return res.status(200).json({ success: true, message: 'Sale deleted' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error deleting sale', err })
    }
}

// Cancela una venta. El cliente (USER_ROLE) solo puede cancelar las suyas;
// ADMIN/EMPLOYEE pueden cancelar cualquiera.
export const cancelSale = async (req, res) => {
    try {
        const { id } = req.params
        const sale = await Sale.findById(id)
        if (!sale) {
            return res.status(404).json({ success: false, message: 'Compra no encontrada' })
        }

        if (req.userRole === 'USER_ROLE') {
            const client = await Client.findOne({ userId: req.userId })
            if (!client || sale.clientId.toString() !== client._id.toString()) {
                return res.status(403).json({ success: false, message: 'No puedes cancelar esta compra' })
            }
        }

        if (sale.status === 'CANCELADO') {
            return res.status(400).json({ success: false, message: 'La compra ya está cancelada' })
        }

        sale.status = 'CANCELADO'
        await sale.save()

        return res.status(200).json({ success: true, message: 'Compra cancelada', sale })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error al cancelar la compra', err })
    }
}