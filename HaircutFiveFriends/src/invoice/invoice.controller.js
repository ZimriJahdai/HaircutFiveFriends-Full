'use strict'

import Invoice from './invoice.model.js'
import generateInvoicePDF from './invoice.pdf.js'
import Sale from '../sale/sale.model.js'
import Detail from '../detailSale/detail.model.js'
import Service from '../service/service.model.js'
import Product from '../product/product.model.js'

export const downloadInvoice = async (req, res) => {
    try {

        const { saleId } = req.params

        // 1️⃣ Buscar venta con cliente
        const sale = await Sale.findById(saleId)
            .populate('clientId')

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            })
        }

        // 2️⃣ Buscar detalles de la venta (puede ser vacío)
        const detailIds = Array.isArray(sale.detailId) ? sale.detailId : (sale.detailId ? [sale.detailId] : [])
        let details = []
        if (detailIds.length > 0) {
            details = await Detail.find({ _id: { $in: detailIds } })
        }

        // enriquecer incluso una lista vacía; el mapa simplemente no iterará
        const enrichedDetails = await Promise.all(
            details.map(async (detail) => {
                if (detail.detailType === 'SERVICE') {
                    const service = await Service.findById(detail.referenceId).select('name price')
                    return { ...detail.toObject(), productId: service }
                }

                if (detail.detailType === 'PRODUCT') {
                    const product = await Product.findById(detail.referenceId).select('name price')
                    return { ...detail.toObject(), productId: product }
                }

                return detail.toObject()
            })
        )

        // 3️⃣ Obtener o crear factura para esa venta
        // siempre recalculamos impuestos/desglose basados en la venta actual
        const taxRate = 0.1 // 10% de IVA
        const subtotal = Number(sale.total || 0)
        const tax = Number((subtotal * taxRate).toFixed(2))
        const totalWithTax = Number((subtotal + tax).toFixed(2))

        let invoice = await Invoice.findOne({ saleId })
        if (invoice) {
            // actualizar si ya existía (para reflejar cambios en total)
            invoice.subtotal = subtotal
            invoice.tax = tax
            invoice.total = totalWithTax
            await invoice.save()
        } else {
            const invoiceNumber = `INV-${Date.now()}`
            invoice = await Invoice.create({
                invoiceNumber,
                saleId: sale._id,
                subtotal,
                tax,
                total: totalWithTax,
                status: 'PAID'
            })
        }
        if (sale.status !== 'COMPLETADO') {
            sale.status = 'COMPLETADO'
            await sale.save()
        }

        // 4️⃣ Generar PDF
        const pdfBuffer = await generateInvoicePDF({
            invoice,
            sale,
            details: enrichedDetails
        })

        // 5️⃣ Enviar PDF como descarga
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=${invoice.invoiceNumber}.pdf`
        })

        return res.send(pdfBuffer)

    } catch (error) {
        console.error('Invoice error:', error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}