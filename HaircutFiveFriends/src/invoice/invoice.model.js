import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: [true, 'Invoice number is required'],
        unique: true
    },
    saleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sale',
        required: [true, 'Sale ID is required']
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required']
    },
    tax: {
        type: Number,
        required: [true, 'Tax is required']
    },
    total: {
        type: Number,
        required: [true, 'Total is required']
    },
    status: {
        type: String,
        enum: ['PAID', 'CANCELLED'],
        default: 'PAID'
    }
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice; // 👈 ESTO ES LO IMPORTANTE