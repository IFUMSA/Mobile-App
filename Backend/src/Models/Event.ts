import { model, Schema, Types } from "mongoose";

export interface IEvent {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    image?: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
    {
        title: { type: String, required: true },
        description: { type: String },
        image: { type: String },
        location: { type: String },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        isActive: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

EventSchema.index({ startDate: 1, isActive: 1 });

export const Event = model<IEvent>("Event", EventSchema);
