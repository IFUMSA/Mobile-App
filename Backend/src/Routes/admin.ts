import express, { type Router } from "express";
import { requireAdmin } from "../Middlewares/requireAdmin";
import {
    checkAdminSession,
    adminLogout,
    adminLogin,
    getDashboardStats,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getAllUsers,
    createProduct,
    updateProduct,
    deleteProduct,
    getSharedQuizzes,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
} from "../Controllers/adminController";

const adminRouter: Router = express.Router();

// Auth routes (no middleware required)
adminRouter.post("/login", adminLogin);
adminRouter.get("/session", checkAdminSession);
adminRouter.post("/logout", adminLogout);

// Protected routes - require admin
adminRouter.get("/stats", requireAdmin, getDashboardStats);
adminRouter.get("/orders", requireAdmin, getAllOrders);
adminRouter.get("/orders/:id", requireAdmin, getOrderById);
adminRouter.put("/orders/:id", requireAdmin, updateOrderStatus);
adminRouter.get("/users", requireAdmin, getAllUsers);
adminRouter.post("/products", requireAdmin, createProduct);
adminRouter.put("/products/:id", requireAdmin, updateProduct);
adminRouter.delete("/products/:id", requireAdmin, deleteProduct);
adminRouter.get("/quizzes", requireAdmin, getSharedQuizzes);

// Announcements
adminRouter.get("/announcements", requireAdmin, getAllAnnouncements);
adminRouter.post("/announcements", requireAdmin, createAnnouncement);
adminRouter.put("/announcements/:id", requireAdmin, updateAnnouncement);
adminRouter.delete("/announcements/:id", requireAdmin, deleteAnnouncement);

// Events
adminRouter.get("/events", requireAdmin, getAllEvents);
adminRouter.post("/events", requireAdmin, createEvent);
adminRouter.put("/events/:id", requireAdmin, updateEvent);
adminRouter.delete("/events/:id", requireAdmin, deleteEvent);

export = adminRouter;
