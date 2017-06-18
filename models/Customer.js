import mongoose, { Schema } from 'mongoose';

const customerSchema = new Schema({
    firstname: String,
    lastname: String,
    email: String,
    createdAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;