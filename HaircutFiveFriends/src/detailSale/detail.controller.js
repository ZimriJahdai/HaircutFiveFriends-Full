'use strict'

import Detail from './detail.model.js'
import Sale from '../sale/sale.model.js'

export const createDetail = async (req, res) => {
    try {
        const detailData = { ...(req.body || {}) }

        const saleId = detailData.saleId
        if (saleId) {
            const sale = await Sale.findById(saleId)
            if (!sale) {
                return res.status(404).json({ success: false, message: 'Sale not found' })
            }
        }

        const detail = new Detail(detailData)
        await detail.save()

        // si el cliente nos dio un saleId, enlazamos el detalle y actualizamos
        if (saleId) {
            await Sale.findByIdAndUpdate(saleId, {
                $addToSet: { detailId: detail._id }
            })

            const saleWithDetails = await Sale.findById(saleId).select('detailId')
            const linkedDetails = await Detail.find({ _id: { $in: saleWithDetails.detailId } }).select('total')
            const recalculatedTotal = linkedDetails.reduce((acc, current) => acc + Number(current.total || 0), 0)

            await Sale.findByIdAndUpdate(saleId, {
                total: recalculatedTotal
            })
        }

        return res.status(201).json({
            success: true,
            message: 'Detail created successfully',
            detail
        })

    } catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

export const getDetails = async (req, res) => {
    try {
        const details = await Detail.find()
            .populate('productId')
        return res.status(200).json({ success: true, details })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error getting details', err })
    }
}

export const getDetailsBySale = async (req, res) => {
    try {
        const { saleId } = req.params
        if (!saleId) {
            return res.status(400).json({ success: false, message: 'Sale ID is required' })
        }

        const sale = await Sale.findById(saleId)
        if (!sale || !sale.detailId || sale.detailId.length === 0) {
            return res.status(404).json({ success: false, message: 'Sale detail not found' })
        }

        const details = await Detail.find({ _id: { $in: sale.detailId } })
            .populate('productId')
        if (!details || details.length === 0) {
            return res.status(404).json({ success: false, message: 'Sale detail not found' })
        }

        return res.status(200).json({ success: true, details })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error getting details', err })
    }
}

export const getDetailById = async (req, res) => {
    try {
        const { id } = req.params
        const detail = await Detail.findById(id)
            .populate('productId')
        if (!detail) {
            return res.status(404).json({ success: false, message: 'Detail not found' })
        }
        return res.status(200).json({ success: true, detail })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error getting detail', err })
    }
}

export const updateDetail = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = { ...(req.body || {}) }

        const detail = await Detail.findByIdAndUpdate(id, updateData, { new: true })
        if (!detail) {
            return res.status(404).json({ success: false, message: 'Detail not found' })
        }
        return res.status(200).json({ success: true, message: 'Detail updated', detail })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error updating detail', err })
    }
}

export const deleteDetail = async (req, res) => {
    try {
        const { id } = req.params
        const detail = await Detail.findByIdAndDelete(id)
        if (!detail) {
            return res.status(404).json({ success: false, message: 'Detail not found' })
        }
        return res.status(200).json({ success: true, message: 'Detail deleted' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Error deleting detail', err })
    }
}
