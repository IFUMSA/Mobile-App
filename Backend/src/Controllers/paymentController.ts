import { Request, Response } from "express";
import { Payment } from "../Models/Payment";
import { Cart } from "../Models/Cart";
import { User } from "../Models/User";
import { IPayment, PaymentStatus } from "../Interfaces/payment.interface";
import { createNotification } from "./notificationController";
import crypto from "crypto";

/**
 * Generate unique payment reference
 */
const generateReference = (): string => {
    return `PAY-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

/**
 * Get user's payment history
 */
export const getPaymentHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.session.userId;
        const { status } = req.query;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Build query
        const query: { userId: any; status?: PaymentStatus | { $in: PaymentStatus[] } } = { userId };
        const validStatuses = ["pending", "submitted", "confirmed", "completed", "rejected"];

        if (status && status !== "all") {
            // Handle comma-separated statuses (e.g. "pending,submitted")
            const statusArray = (status as string).split(",").filter(s => validStatuses.includes(s));
            if (statusArray.length === 1) {
                query.status = statusArray[0] as PaymentStatus;
            } else if (statusArray.length > 1) {
                query.status = { $in: statusArray as PaymentStatus[] };
            }
        }

        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.status(200).json({
            payments: payments.map((p) => ({
                id: p._id,
                title: p.title,
                description: p.description,
                amount: p.amount,
                status: p.status,
                reference: p.reference,
                date: p.createdAt,
            })),
        });
    } catch (error) {
        console.error("Get payment history error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get single payment by ID
 */
export const getPaymentById = async (req: Request, res: Response) => {
    try {
        const userId = req.session.userId;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const payment = await Payment.findOne({ _id: id, userId }).lean();

        if (!payment) {
            res.status(404).json({ message: "Payment not found" });
            return;
        }

        res.status(200).json({
            payment: {
                id: payment._id,
                title: payment.title,
                description: payment.description,
                amount: payment.amount,
                status: payment.status,
                reference: payment.reference,
                date: payment.createdAt,
            },
        });
    } catch (error) {
        console.error("Get payment error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Create a new payment (initiate checkout)
 */
export const createPayment = async (req: Request, res: Response) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Get user's cart
        const cart = await Cart.findOne({ userId }).populate("items.productId");

        if (!cart || cart.items.length === 0) {
            res.status(400).json({ message: "Cart is empty" });
            return;
        }

        // Create payment record
        const productTitles = cart.items
            .map((item: any) => item.productId?.title)
            .filter(Boolean)
            .join(", ");

        const payment = await Payment.create({
            userId,
            title: productTitles || "Order",
            description: `${cart.items.length} item(s)`,
            amount: cart.total,
            status: "pending",
            reference: generateReference(),
            productIds: cart.items.map((item) => item.productId),
        });

        res.status(201).json({
            payment: {
                id: payment._id,
                title: payment.title,
                amount: payment.amount,
                status: payment.status,
                reference: payment.reference,
            },
        });
    } catch (error) {
        console.error("Create payment error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Update payment status (webhook callback)
 */
export const updatePaymentStatus = async (req: Request, res: Response) => {
    try {
        const { reference, status, approvalMessage } = req.body;

        if (!reference || !status) {
            res.status(400).json({ message: "Reference and status required" });
            return;
        }

        if (!["pending", "submitted", "confirmed", "completed", "rejected"].includes(status)) {
            res.status(400).json({ message: "Invalid status" });
            return;
        }

        const payment = await Payment.findOneAndUpdate(
            { reference },
            { status },
            { new: true }
        ).populate("userId", "_id email");

        if (!payment) {
            res.status(404).json({ message: "Payment not found" });
            return;
        }

        // Get all admins to notify them on payment submission
        if (status === "submitted") {
            try {
                const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
                const admins = await User.find({ email: { $in: adminEmails } }).select("_id email firstName");

                const notificationTitle = "New Payment Submitted";
                const notificationMessage = `A new payment of amount has been submitted for review.`;

                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #2A996B;">Payment Submitted for Review</h2>
                        <p>Hello Admin,</p>
                        <p>A new payment has been submitted and is awaiting your review.</p>
                        <p><strong>Payment Details:</strong></p>
                        <ul>
                            <li><strong>Reference:</strong> ${payment.reference}</li>
                            <li><strong>Item:</strong> ${payment.title}</li>
                            <li><strong>Amount:</strong> ₦${payment.amount}</li>
                        </ul>
                        <p>Please review the payment proof and approve or reject it.</p>
                        <p>Best regards,<br>IFUMSA System</p>
                    </div>
                `;

                for (const admin of admins) {
                    try {
                        await createNotification(
                            (admin._id as any).toString(),
                            "payment",
                            notificationTitle,
                            notificationMessage,
                            emailHtml,
                            { paymentId: payment._id, itemName: payment.title }
                        );
                    } catch (notifError) {
                        console.error(`Failed to notify admin ${admin._id}:`, notifError);
                    }
                }
            } catch (adminNotifyError) {
                console.error("Error notifying admins about payment:", adminNotifyError);
                // Don't block the response
            }
        }

        // If payment confirmed/completed, notify the user
        if (status === "confirmed" || status === "completed") {
            try {
                const user = payment.userId as any;
                const notificationTitle = "Payment Approved!";
                const defaultMessage = "Your payment has been approved successfully!";
                const userMessage = approvalMessage || defaultMessage;
                const notificationMessage = userMessage;

                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #2A996B;">Payment Approved!</h2>
                        <p>Hello,</p>
                        <p>Great news! Your payment has been approved.</p>
                        <p><strong>Payment Details:</strong></p>
                        <ul>
                            <li><strong>Reference:</strong> ${payment.reference}</li>
                            <li><strong>Item:</strong> ${payment.title}</li>
                            <li><strong>Amount:</strong> ₦${payment.amount}</li>
                        </ul>
                        <p><strong>Next Steps:</strong></p>
                        <p>${userMessage}</p>
                        <p>Thank you for your payment!</p>
                        <p>Best regards,<br>IFUMSA Team</p>
                    </div>
                `;

                await createNotification(
                    user._id.toString(),
                    "payment_approval",
                    notificationTitle,
                    notificationMessage,
                    emailHtml,
                    { paymentId: payment._id, itemName: payment.title, approvalMessage: userMessage }
                );
            } catch (userNotifyError) {
                console.error("Error notifying user about payment approval:", userNotifyError);
                // Don't block the response
            }
        }

        // If payment completed, clear the user's cart
        if (status === "completed") {
            try {
                await Cart.findOneAndUpdate(
                    { userId: payment.userId },
                    { items: [], total: 0 }
                );
            } catch (cartError) {
                console.error("Error clearing cart:", cartError);
                // Don't block the response
            }
        }

        res.status(200).json({
            message: "Payment status updated",
            payment: {
                id: payment._id,
                status: payment.status,
                reference: payment.reference,
            },
        });
        return;
    } catch (error: any) {
        console.error("Update payment status error:", error);

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

/**
 * Submit payment proof for bank transfer
 */
export const submitPaymentProof = async (req: Request, res: Response) => {
    try {
        const userId = req.session.userId;
        const { id } = req.params;
        const { proofImage } = req.body;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!proofImage) {
            res.status(400).json({ message: "Proof image required" });
            return;
        }

        const payment = await Payment.findOne({ _id: id, userId });

        if (!payment) {
            res.status(404).json({ message: "Payment not found" });
            return;
        }

        if (payment.status !== "pending") {
            res.status(400).json({ message: "Payment proof already submitted" });
            return;
        }

        payment.proofImage = proofImage;
        payment.status = "submitted" as PaymentStatus;
        await payment.save();

        // Clear user's cart after submitting proof
        try {
            await Cart.findOneAndUpdate(
                { userId },
                { items: [], total: 0 }
            );
        } catch (cartError) {
            console.error("Error clearing cart after proof submission:", cartError);
            // Don't block response
        }

        res.status(200).json({
            message: "Payment proof submitted successfully",
            payment: {
                id: payment._id,
                status: payment.status,
                reference: payment.reference,
            },
        });
        return;
    } catch (error: any) {
        console.error("Submit payment proof error:", error);

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

/**
 * Get bank account details for transfer
 */
export const getBankDetails = async (req: Request, res: Response) => {
    try {
        // These would typically come from environment variables or database
        res.status(200).json({
            bankName: "Wema Bank",
            accountNumber: "0121231019",
            accountName: "Medical Students Association",
            note: "Please include your payment reference in the transfer description",
        });
    } catch (error) {
        console.error("Get bank details error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Create annual dues payment
 */
export const createAnnualDuesPayment = async (req: Request, res: Response) => {
    try {
        const userId = req.session.userId;
        const { method = "bank" } = req.body;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Annual dues amount - could be from config/database
        const ANNUAL_DUES_AMOUNT = 1000;

        // Check if user already has a pending annual dues payment
        const existingPayment = await Payment.findOne({
            userId,
            title: "Annual Dues",
            status: { $in: ["pending", "submitted"] },
        });

        if (existingPayment) {
            res.status(200).json({
                payment: {
                    id: existingPayment._id,
                    title: existingPayment.title,
                    amount: existingPayment.amount,
                    status: existingPayment.status,
                    reference: existingPayment.reference,
                },
                message: "You have an existing annual dues payment",
            });
            return;
        }

        const payment = await Payment.create({
            userId,
            title: "Annual Dues",
            description: "IFUMSA Annual Membership Dues",
            amount: ANNUAL_DUES_AMOUNT,
            status: "pending",
            reference: generateReference(),
            paymentMethod: method,
        });

        res.status(201).json({
            payment: {
                id: payment._id,
                title: payment.title,
                description: payment.description,
                amount: payment.amount,
                status: payment.status,
                reference: payment.reference,
            },
        });
    } catch (error) {
        console.error("Create annual dues payment error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
