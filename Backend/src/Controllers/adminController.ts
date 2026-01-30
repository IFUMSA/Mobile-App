import { Request, Response } from "express";
import { User } from "../Models/User";
import { Payment } from "../Models/Payment";
import { Product } from "../Models/Product";
import { Quiz } from "../Models/Quiz";
import { Announcement } from "../Models/Announcement";
import { Event } from "../Models/Event";
import { createNotification } from "./notificationController";
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

// Admin login - hybrid approach: checks database role OR env variable
export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Email and password required" });
            return;
        }

        // Find user in database
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        // Hybrid admin check: database role OR env variable
        const adminEmails = getAdminEmails();
        const isAdminInDb = user.role === "admin";
        const isAdminInEnv = adminEmails.includes(email.toLowerCase());

        if (!isAdminInDb && !isAdminInEnv) {
            res.status(403).json({ message: "Not authorized as admin" });
            return;
        }

        // Verify password
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

        // Send notifications to all users about the new event
        try {
            const users = await User.find().select("_id");
            const notificationTitle = `New Event: ${title}`;
            const notificationMessage = `A new event "${title}" has been added. Check it out!`;

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2A996B;">New Event Added</h2>
                    <p>Hello,</p>
                    <p>A new event has been added to IFUMSA!</p>
                    <h3 style="color: #2A996B;">${title}</h3>
                    <p>${description || "Check out this new event on the app for more details."}</p>
                    ${location ? `<p><strong>Location:</strong> ${location}</p>` : ""}
                    ${startDate ? `<p><strong>Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>` : ""}
                    <p>Visit the IFUMSA app to learn more and register for this event.</p>
                    <p>Best regards,<br>IFUMSA Team</p>
                </div>
            `;

            // Send notifications to all users (don't block the response)
            for (const user of users) {
                try {
                    await createNotification(
                        (user._id as unknown as any).toString(),
                        "event",
                        notificationTitle,
                        notificationMessage,
                        emailHtml,
                        { eventId: event._id, eventName: title }
                    );
                } catch (notifError) {
                    console.error(`Failed to notify user ${user._id} about event:`, notifError);
                }
            }
        } catch (notificationError) {
            console.error("Error sending event notifications:", notificationError);
            // Don't fail the event creation if notifications fail
        }

        res.status(201).json({ message: "Event created", event });
        return;
    } catch (error: any) {
        console.error("Create event error:", error);

        // Handle validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors)
                .map((err: any) => err.message)
                .join(", ");
            res.status(400).json({ message: `Validation error: ${messages}` });
            return;
        }

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

// Generate random password
const generatePassword = (length: number = 12): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Send admin credentials email
const sendAdminCredentialsEmail = async (email: string, password: string, firstName: string): Promise<void> => {
    const emailService = require("../Services/emailService");

    try {
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2A996B;">Welcome to IFUMSA Admin Panel</h2>
                <p>Hello ${firstName},</p>
                <p>You have been added as an admin to the IFUMSA platform. Please use the credentials below to log in:</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Password:</strong> <code style="background: white; padding: 5px 10px; border-radius: 3px; font-family: monospace;">${password}</code></p>
                </div>
                
                <p><strong>⚠️ Important:</strong> Please change your password immediately after logging in for security purposes.</p>
                
                <p><a href="${process.env.ADMIN_URL || "http://localhost:3001"}/login" style="display: inline-block; background-color: #2A996B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Log in to Admin Panel</a></p>
                
                <p>If you have any questions, please contact support.</p>
                <p>Best regards,<br>IFUMSA Team</p>
            </div>
        `;

        const result = await emailService.sendEmail({
            to: email,
            subject: "Welcome to IFUMSA Admin Panel - Your Login Credentials",
            html: htmlContent,
        });

        if (!result) {
            throw new Error("Failed to send email");
        }
    } catch (error) {
        console.error("Error sending admin credentials email:", error);
        throw error;
    }
};

// Add new admin
export const addNewAdmin = async (req: Request, res: Response) => {
    try {
        const { email, firstName, lastName } = req.body;
        const currentUserEmail = req.session.userEmail?.toLowerCase();
        const adminEmails = getAdminEmails();

        // Validate current user is admin
        if (!req.session.userId || !currentUserEmail || !adminEmails.includes(currentUserEmail)) {
            res.status(401).json({ message: "You do not have permission to add admins" });
            return;
        }

        // Validate input
        if (!email || !firstName || !lastName) {
            res.status(400).json({ message: "Email, first name, and last name are required" });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: "Invalid email format" });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({ message: "User with this email already exists" });
            return;
        }

        // Generate username from email (take part before @)
        const baseUserName = email.split("@")[0];
        let userName = baseUserName;
        let counter = 1;

        // Ensure username is unique
        while (await User.findOne({ userName })) {
            userName = `${baseUserName}${counter}`;
            counter++;
        }

        // Generate password and hash it
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin user
        const newAdmin = new User({
            email: email.toLowerCase(),
            userName,
            firstName,
            lastName,
            password: hashedPassword,
            isVerified: true,
            role: "admin",
        });

        await newAdmin.save();

        // Send credentials email (don't fail if email fails)
        try {
            await sendAdminCredentialsEmail(email, password, firstName);
        } catch (emailError) {
            console.error("Failed to send admin credentials email:", emailError);
            // Continue anyway - admin was created successfully
        }

        res.status(201).json({
            message: "Admin created successfully. Credentials have been sent to their email.",
            admin: {
                id: newAdmin._id,
                email: newAdmin.email,
                firstName: newAdmin.firstName,
                lastName: newAdmin.lastName,
            },
        });
        return;
    } catch (error: any) {
        console.error("Add new admin error:", error);

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors)
                .map((err: any) => err.message)
                .join(", ");
            res.status(400).json({ message: `Validation error: ${messages}` });
            return;
        }

        // Handle Mongoose duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            res.status(409).json({ message: `${field} already exists` });
            return;
        }

        // Handle other errors
        res.status(500).json({ message: "Server error, try again" });
        return;
    }
};

// Get all admins
export const getAllAdmins = async (req: Request, res: Response) => {
    try {
        const currentUserEmail = req.session.userEmail?.toLowerCase();
        const adminEmails = getAdminEmails();

        // Validate current user is admin
        if (!req.session.userId || !currentUserEmail || !adminEmails.includes(currentUserEmail)) {
            res.status(401).json({ message: "You do not have permission to view admins" });
            return;
        }

        const admins = await User.find({ role: "admin" }).select("_id email firstName lastName createdAt").sort({ createdAt: -1 });

        res.json({ admins });
        return;
    } catch (error) {
        console.error("Get admins error:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
};

// Remove admin
export const removeAdmin = async (req: Request, res: Response) => {
    try {
        const { adminId } = req.body;
        const currentUserEmail = req.session.userEmail?.toLowerCase();
        const adminEmails = getAdminEmails();

        // Validate current user is admin
        if (!req.session.userId || !currentUserEmail || !adminEmails.includes(currentUserEmail)) {
            res.status(401).json({ message: "You do not have permission to remove admins" });
            return;
        }

        // Validate input
        if (!adminId) {
            res.status(400).json({ message: "Admin ID is required" });
            return;
        }

        // Check if user exists and is admin
        const adminToRemove = await User.findById(adminId);
        if (!adminToRemove) {
            res.status(404).json({ message: "Admin not found" });
            return;
        }

        if (adminToRemove.role !== "admin") {
            res.status(400).json({ message: "This user is not an admin" });
            return;
        }

        // Prevent removing yourself
        if (adminToRemove._id && adminToRemove._id.toString() === req.session.userId) {
            res.status(400).json({ message: "You cannot remove yourself as an admin" });
            return;
        }

        // Remove admin role
        adminToRemove.role = "user";
        await adminToRemove.save();

        res.json({
            message: "Admin removed successfully",
            user: {
                id: adminToRemove._id,
                email: adminToRemove.email,
                firstName: adminToRemove.firstName,
            },
        });
        return;
    } catch (error) {
        console.error("Remove admin error:", error);
        res.status(500).json({ message: "Server error, try again" });
        return;
    }
};
