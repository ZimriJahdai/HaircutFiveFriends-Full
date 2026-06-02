
'use strict'

import mongoose from 'mongoose'
import Service from '../src/service/service.model.js'
import Product from '../src/product/product.model.js'

const validateDetail = async function () {
    if (!this.referenceId) {
        throw new Error('Reference ID is required')
    }

    if (!this.detailType) {
        throw new Error('Detail type is required')
    }

    if (!mongoose.Types.ObjectId.isValid(this.referenceId)) {
        throw new Error('Reference ID is invalid')
    }

    let referencePrice = null

    if (this.detailType === 'SERVICE') {
        const service = await Service.findById(this.referenceId).select('price')
        if (!service) {
            throw new Error('Service reference not found')
        }
        referencePrice = service.price
    } else if (this.detailType === 'PRODUCT') {
        const product = await Product.findById(this.referenceId).select('price')
        if (!product) {
            throw new Error('Product reference not found')
        }
        referencePrice = product.price
    } else {
        throw new Error('Invalid detail type')
    }

    if (!this.quantity || this.quantity <= 0) {
        throw new Error('Quantity must be a positive number')
    }

    if (!Number.isInteger(this.quantity)) {
        throw new Error('Quantity must be an integer')
    }

    const computedTotal = Number(referencePrice) * this.quantity
    if (!Number.isFinite(computedTotal) || computedTotal <= 0) {
        throw new Error('Total must be a positive number')
    }

    this.total = computedTotal
}

export default validateDetail