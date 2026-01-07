import { Request, Response } from "express";
import { Announcement } from "../Models/Announcement";
import { Event } from "../Models/Event";

/**
 * Get active announcements for the mobile app home carousel
 * Supports pagination: ?page=1&limit=10
 */
export const getActiveAnnouncements = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
        const skip = (page - 1) * limit;

        const [announcements, total] = await Promise.all([
            Announcement.find({ isActive: true })
                .select("title description link order")
                .sort({ order: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Announcement.countDocuments({ isActive: true })
        ]);

        res.json({
            announcements,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
        });
        return;
    } catch (error) {
        console.error("Get announcements error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

/**
 * Get upcoming/active events for the mobile app
 * Supports pagination: ?page=1&limit=10
 */
export const getActiveEvents = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
        const skip = (page - 1) * limit;
        const now = new Date();
        
        const query = {
            isActive: true,
            $or: [
                { endDate: { $gte: now } },
                { endDate: null, startDate: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
            ]
        };

        const [events, total] = await Promise.all([
            Event.find(query)
                .select("title description image location startDate endDate")
                .sort({ startDate: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Event.countDocuments(query)
        ]);

        res.json({
            events,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
        });
        return;
    } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

/**
 * Get the next upcoming event
 */
export const getNextEvent = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        
        const event = await Event.findOne({
            isActive: true,
            startDate: { $gte: now }
        })
            .select("title description image location startDate endDate")
            .sort({ startDate: 1 })
            .lean();

        res.json({ event: event || null });
        return;
    } catch (error) {
        console.error("Get next event error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};
