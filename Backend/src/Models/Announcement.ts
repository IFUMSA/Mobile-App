import { model, Schema, Types } from "mongoose";

export interface IAnnouncement {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    link?: string;
    isActive: boolean;
    order: number;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
    {
        title: { type: String, required: true },
        description: { type: String },
        link: { type: String },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

AnnouncementSchema.index({ isActive: 1, order: 1 });

export const Announcement = model<IAnnouncement>("Announcement", AnnouncementSchema);
