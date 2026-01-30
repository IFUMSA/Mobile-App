import express, { type Router } from "express";
import { requireAuth } from "../Middlewares/requireAuth";
import { requireAdmin } from "../Middlewares/requireAdmin";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  sendEventReminder,
} from "../Controllers/notificationController";

const notificationRouter: Router = express.Router();

// User notification routes (require authentication)
notificationRouter.get("/", requireAuth, getUserNotifications);
notificationRouter.put("/:notificationId/read", requireAuth, markNotificationAsRead);
notificationRouter.put("/read-all", requireAuth, markAllAsRead);
notificationRouter.delete("/:notificationId", requireAuth, deleteNotification);

// Admin routes
notificationRouter.post("/admin/send-reminder", requireAdmin, sendEventReminder);

export = notificationRouter;
