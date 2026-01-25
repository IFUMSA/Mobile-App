import express, { type Router } from "express";
import {
    getPaymentHistory,
    getPaymentById,
    createPayment,
    updatePaymentStatus,
    submitPaymentProof,
    getBankDetails,
    createAnnualDuesPayment,
} from "../Controllers/paymentController";
import { requireAuth } from "../Middlewares/requireAuth";

const paymentRouter: Router = express.Router();

// Get user's payment history
paymentRouter.get("/history", requireAuth, getPaymentHistory);

// Get bank account details for transfer
paymentRouter.get("/bank-details", requireAuth, getBankDetails);

// Get single payment by ID
paymentRouter.get("/:id", requireAuth, getPaymentById);

// Create new payment (checkout)
paymentRouter.post("/create", requireAuth, createPayment);

// Create annual dues payment
paymentRouter.post("/annual-dues", requireAuth, createAnnualDuesPayment);

// Submit payment proof (bank transfer)
paymentRouter.post("/:id/proof", requireAuth, submitPaymentProof);

// Update payment status (webhook - no auth, uses signature verification)
paymentRouter.post("/webhook", updatePaymentStatus);

export = paymentRouter;
