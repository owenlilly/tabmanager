import mongoose, { Schema } from 'mongoose';

const clerkSchema = new Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    salt: String,
    createdAt: { type: Date, default: Date.now }
});

const Clerk = mongoose.model('Clerk', clerkSchema);

export default Clerk;