import { Request, Response } from "express";
import { Payment } from "../Models/Payment";
import { Cart } from "../Models/Cart";
import { IPayment, PaymentStatus } from "../Interfaces/payment.interface";
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
        const { reference, status } = req.body;

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
        );

        if (!payment) {
            res.status(404).json({ message: "Payment not found" });
            return;
        }

        // If payment completed, clear the user's cart
        if (status === "completed") {
            await Cart.findOneAndUpdate(
                { userId: payment.userId },
                { items: [], total: 0 }
            );
        }

        res.status(200).json({
            message: "Payment status updated",
            payment: {
                id: payment._id,
                status: payment.status,
                reference: payment.reference,
            },
        });
    } catch (error) {
        console.error("Update payment status error:", error);
        res.status(500).json({ message: "Server error" });
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

        res.status(200).json({
            message: "Payment proof submitted successfully",
            payment: {
                id: payment._id,
                status: payment.status,
                reference: payment.reference,
            },
        });
    } catch (error) {
        console.error("Submit payment proof error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get bank account details for transfer
 */
export const getBankDetails = async (req: Request, res: Response) => {
    try {
        // These would typically come from environment variables or database
        res.status(200).json({
            bankName: "First Bank of Nigeria",
            accountNumber: "3001234567",
            accountName: "IFUMSA",
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
        const ANNUAL_DUES_AMOUNT = 5000;

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
