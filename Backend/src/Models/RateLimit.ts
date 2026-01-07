import { Schema, model, Types } from "mongoose";

export interface IRateLimit {
    userId: Types.ObjectId;
    action: string;
    count: number;
    windowStart: Date;
    lastUsed: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        action: {
            type: String,
            required: true,
            index: true,
        },
        count: {
            type: Number,
            required: true,
            default: 0,
        },
        windowStart: {
            type: Date,
            required: true,
            default: () => new Date(),
        },
        lastUsed: {
            type: Date,
            required: true,
            default: () => new Date(),
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient lookups
RateLimitSchema.index({ userId: 1, action: 1 }, { unique: true });

export const RateLimit = model<IRateLimit>("RateLimit", RateLimitSchema);
