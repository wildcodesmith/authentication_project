import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    
    // 1. NEW: Add the verification flag and creation timestamp
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now } 
});

// 2. NEW: Tell MongoDB to auto-delete unverified accounts after 15 minutes (900 seconds)
accountSchema.index(
    { createdAt: 1 }, 
    { 
        expireAfterSeconds: 900, 
        partialFilterExpression: { isVerified: false } 
    }
);

const Account = mongoose.model('Account', accountSchema);
export default Account;