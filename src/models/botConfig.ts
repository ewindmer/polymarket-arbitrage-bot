import mongoose, { Schema } from 'mongoose';

const botConfigSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true,
        auto: true,
    },
    walletAddress: { type: String, required: true, unique: true },
    privateKey: { type: String, required: true },
    proxyWallet: { type: String, required: false },
    userAddress: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
botConfigSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const BotConfig = mongoose.model('BotConfig', botConfigSchema, 'bot_config');

export default BotConfig;

