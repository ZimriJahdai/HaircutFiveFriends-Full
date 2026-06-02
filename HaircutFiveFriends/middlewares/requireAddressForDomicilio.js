'use strict'

/**
 * Middleware: if saleType is 'DOMICILIO' then addressSale must be provided in body
 */
export default function requireAddressForDomicilio(req, res, next) {
    try {
        const { saleType, addressSale } = req.body || {}

        if (String(saleType).toUpperCase() === 'DOMICILIO') {
            if (!addressSale || String(addressSale).trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'addressSale is required when saleType is DOMICILIO'
                })
            }
        }

        return next()
    } catch (err) {
        console.error('Middleware requireAddressForDomicilio error', err)
        return res.status(500).json({ success: false, message: 'Server error' })
    }
}
