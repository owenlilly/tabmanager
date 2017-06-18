import mongoose, { Schema } from 'mongoose';

const tabSchema = new Schema({
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    balance: Number,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Tab', tabSchema);