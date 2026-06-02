'use strict'

import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },

    pointsPrice: {
      type: Number,
      default: null,
      min: 0
    },

    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: 0
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'SHAMPOO',
        'WAX',
        'GEL',
        'BEARD_OIL',
        'MACHINES',
        'ACCESSORIES'
      ]
    },

    image: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    versionKey: false,

    // 🔥 Esto hace que se muestre id en vez de _id
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        return ret
      }
    }
  }
)

export default mongoose.model('Product', productSchema)