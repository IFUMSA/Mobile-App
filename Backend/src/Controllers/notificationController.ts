import { Request, Response } from "express";
import { Notification } from "../Models/Notification";
import { User } from "../Models/User";
import { Event } from "../Models/Event";
import { Types } from "mongoose";
import { sendEmail } from "../Services/emailService";

// Create a notification and optionally send email
export const createNotification = async (
  recipientId: string,
  type: "event" | "payment" | "payment_approval" | "reminder",
  title: string,
  message: string,
  emailHtml?: string,
  metadata?: any
): Promise<any> => {
  try {
    // Create notification in database
    const notification = new Notification({
      type,
      recipientId,
      title,
      message,
      metadata,
    });

    await notification.save();

    // Send email if HTML content provided
    if (emailHtml) {
      try {
        const user = await User.findById(recipientId).select("email firstName");
        if (user) {
          await sendEmail({
            to: (user as any).email,
            subject: title,
            html: emailHtml,
          });
        }
      } catch (emailError) {
        console.error("Error sending notification email:", emailError);
        // Continue - notification is still created even if email fails
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get user notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { limit = 20, skip = 0 } = req.query;

    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    res.json({
      notifications,
      unreadCount,
      total: await Notification.countDocuments({ recipientId: userId }),
    });
    return;
  } catch (error: any) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
    return;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { notificationId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!notificationId || !Types.ObjectId.isValid(notificationId)) {
      res.status(400).json({ message: "Invalid notification ID" });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    res.json({ message: "Notification marked as read", notification });
    return;
  } catch (error: any) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Failed to update notification" });
    return;
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
    return;
  } catch (error: any) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: "Failed to update notifications" });
    return;
  }
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { notificationId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!notificationId || !Types.ObjectId.isValid(notificationId)) {
      res.status(400).json({ message: "Invalid notification ID" });
      return;
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId,
    });

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    res.json({ message: "Notification deleted" });
    return;
  } catch (error: any) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Failed to delete notification" });
    return;
  }
};

// Admin: Send reminder to all users about an event
export const sendEventReminder = async (req: Request, res: Response) => {
  try {
    const { eventId, customMessage } = req.body;
    const adminId = req.session.userId;

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }

    // Get the event
    const event = await Event.findById(eventId).select("title description startDate");
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Get all users
    const users = await User.find().select("_id email");
    if (users.length === 0) {
      res.status(404).json({ message: "No users found" });
      return;
    }

    const notificationTitle = `Reminder: ${event.title}`;
    const notificationMessage =
      customMessage || `Don't forget about the upcoming event: ${event.title}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2A996B;">Event Reminder</h2>
        <p>Hello,</p>
        <p><strong>${event.title}</strong></p>
        <p>${customMessage || event.description || "Don't forget about this upcoming event!"}</p>
        ${
          event.startDate
            ? `<p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>`
            : ""
        }
        <p>Best regards,<br>IFUMSA Team</p>
      </div>
    `;

    // Create notifications for all users
    const errors: any[] = [];
    let successCount = 0;

    for (const user of users) {
      try {
        await createNotification(
          (user._id as any).toString(),
          "reminder",
          notificationTitle,
          notificationMessage,
          emailHtml,
          { eventId }
        );
        successCount++;
      } catch (error) {
        console.error(`Failed to notify user ${user._id}:`, error);
        errors.push({ userId: user._id, error: String(error) });
      }
    }

    res.json({
      message: `Reminder sent to ${successCount} users`,
      successCount,
      failedCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
    return;
  } catch (error: any) {
    console.error("Send reminder error:", error);
    res.status(500).json({ message: "Failed to send reminders" });
    return;
  }
};
