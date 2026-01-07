import { Request, Response } from "express";
import { User } from "../Models/User";
import { Payment } from "../Models/Payment";
import { Product } from "../Models/Product";
import { Quiz } from "../Models/Quiz";
import { Announcement } from "../Models/Announcement";
import { Event } from "../Models/Event";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Generate a unique 6-character receipt code
const generateReceiptCode = (): string => {
    return crypto.randomBytes(3).toString("hex").toUpperCase();
};

// Get admin emails from environment
const getAdminEmails = (): string[] => {
    const emails = process.env.ADMIN_EMAILS || "";
    return emails.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
};

// Check admin session - validates if user is still authenticated
export const checkAdminSession = async (req: Request, res: Response) => {
    try {
        const adminEmails = getAdminEmails();
        const userEmail = req.session.userEmail?.toLowerCase();

        if (!req.session.userId || !userEmail || !adminEmails.includes(userEmail)) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const user = await User.findById(req.session.userId).select("firstName lastName email");
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
        return;
    } catch (error) {
        console.error("Session check error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Admin logout
export const adminLogout = async (req: Request, res: Response) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Logout error:", err);
                res.status(500).json({ message: "Logout failed" });
                return;
            }
            res.clearCookie("connect.sid");
            res.json({ message: "Logged out successfully" });
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Admin login - uses regular credentials, checks if email is in admin list
export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Email and password required" });
            return;
        }

        const adminEmails = getAdminEmails();
        if (!adminEmails.includes(email.toLowerCase())) {
            res.status(403).json({ message: "Not authorized as admin" });
            return;
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        // Set session
        req.session.userId = user._id;
        req.session.userEmail = user.email as string;
        req.session.isAdmin = true;
        req.session.isAuthenticated = true;

        res.json({
            message: "Admin login successful",
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
        return;
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [orderCount, productCount, userCount, revenue] = await Promise.all([
            Payment.countDocuments(),
            Product.countDocuments(),
            User.countDocuments(),
            Payment.aggregate([
                { $match: { status: "confirmed" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
        ]);

        const pendingOrders = await Payment.countDocuments({ status: "submitted" });

        res.json({
            orders: orderCount,
            products: productCount,
            users: userCount,
            revenue: revenue[0]?.total || 0,
            pendingOrders,
        });
        return;
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Payment.find()
            .populate("userId", "firstName lastName email")
            .sort({ createdAt: -1 })
            .lean();

        res.json({ orders });
        return;
    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Get single order by ID
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const order = await Payment.findById(id)
            .populate("userId", "firstName lastName email")
            .populate("productIds", "title price image")
            .populate("verifiedBy", "firstName lastName")
            .lean();

        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }

        res.json({ order });
        return;
    } catch (error) {
        console.error("Get order error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const updateData: Record<string, unknown> = {
            status,
            adminNotes,
        };

        // Generate receipt code when confirming payment
        if (status === "confirmed") {
            updateData.verifiedAt = new Date();
            updateData.verifiedBy = req.session.userId;
            
            // Generate unique receipt code
            let receiptCode = generateReceiptCode();
            let attempts = 0;
            while (attempts < 5) {
                const existing = await Payment.findOne({ receiptCode });
                if (!existing) break;
                receiptCode = generateReceiptCode();
                attempts++;
            }
            updateData.receiptCode = receiptCode;
        }

        const order = await Payment.findByIdAndUpdate(id, updateData, { new: true })
            .populate("userId", "firstName lastName email")
            .populate("productIds", "title price image");

        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }

        res.json({ message: "Order updated", order });
        return;
    } catch (error) {
        console.error("Update order error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find()
            .select("-password -verificationToken -resetCode -resetToken")
            .sort({ createdAt: -1 })
            .lean();

        res.json({ users });
        return;
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Create product
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { title, description, price, image, category, author, stock } = req.body;

        const product = new Product({
            title,
            description,
            price,
            image,
            category,
            author,
            stock: stock || 0,
            isAvailable: true,
        });

        await product.save();

        res.status(201).json({ message: "Product created", product });
        return;
    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const product = await Product.findByIdAndUpdate(id, updates, { new: true });

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.json({ message: "Product updated", product });
        return;
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.json({ message: "Product deleted" });
        return;
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Get shared quizzes for moderation
export const getSharedQuizzes = async (req: Request, res: Response) => {
    try {
        const quizzes = await Quiz.find({ isShared: true })
            .populate("createdBy", "firstName lastName email")
            .sort({ sharedAt: -1 })
            .lean();

        res.json({ quizzes });
        return;
    } catch (error) {
        console.error("Get quizzes error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// ============ ANNOUNCEMENTS ============

// Get all announcements
export const getAllAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await Announcement.find()
            .populate("createdBy", "firstName lastName")
            .sort({ order: 1, createdAt: -1 })
            .lean();

        res.json({ announcements });
        return;
    } catch (error) {
        console.error("Get announcements error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Create announcement
export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const { title, description, image, link, isActive, order } = req.body;

        const announcement = new Announcement({
            title,
            description,
            image,
            link,
            isActive: isActive ?? true,
            order: order ?? 0,
            createdBy: req.session.userId,
        });

        await announcement.save();

        res.status(201).json({ message: "Announcement created", announcement });
        return;
    } catch (error) {
        console.error("Create announcement error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Update announcement
export const updateAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const announcement = await Announcement.findByIdAndUpdate(id, updates, { new: true });

        if (!announcement) {
            res.status(404).json({ message: "Announcement not found" });
            return;
        }

        res.json({ message: "Announcement updated", announcement });
        return;
    } catch (error) {
        console.error("Update announcement error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Delete announcement
export const deleteAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const announcement = await Announcement.findByIdAndDelete(id);

        if (!announcement) {
            res.status(404).json({ message: "Announcement not found" });
            return;
        }

        res.json({ message: "Announcement deleted" });
        return;
    } catch (error) {
        console.error("Delete announcement error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// ============ EVENTS ============

// Get all events
export const getAllEvents = async (req: Request, res: Response) => {
    try {
        const events = await Event.find()
            .populate("createdBy", "firstName lastName")
            .sort({ startDate: -1 })
            .lean();

        res.json({ events });
        return;
    } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Create event
export const createEvent = async (req: Request, res: Response) => {
    try {
        const { title, description, image, location, startDate, endDate, isActive } = req.body;

        const event = new Event({
            title,
            description,
            image,
            location,
            startDate,
            endDate,
            isActive: isActive ?? true,
            createdBy: req.session.userId,
        });

        await event.save();

        res.status(201).json({ message: "Event created", event });
        return;
    } catch (error) {
        console.error("Create event error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Update event
export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const event = await Event.findByIdAndUpdate(id, updates, { new: true });

        if (!event) {
            res.status(404).json({ message: "Event not found" });
            return;
        }

        res.json({ message: "Event updated", event });
        return;
    } catch (error) {
        console.error("Update event error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Delete event
export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const event = await Event.findByIdAndDelete(id);

        if (!event) {
            res.status(404).json({ message: "Event not found" });
            return;
        }

        res.json({ message: "Event deleted" });
        return;
    } catch (error) {
        console.error("Delete event error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};
