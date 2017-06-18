import mongoose, { Schema } from 'mongoose';

const saleSchema = new Schema({
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    items: [{
        name: String,
        price: Number,
        amount: Number,
        discount: Number
    }],
    total: Number,
    fromTab: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Sale', saleSchema);
