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

const paymentRouter: Router = express.Router();

// Get user's payment history
paymentRouter.get("/history", getPaymentHistory);

// Get bank account details for transfer
paymentRouter.get("/bank-details", getBankDetails);

// Get single payment by ID
paymentRouter.get("/:id", getPaymentById);

// Create new payment (checkout)
paymentRouter.post("/create", createPayment);

// Create annual dues payment
paymentRouter.post("/annual-dues", createAnnualDuesPayment);

// Submit payment proof (bank transfer)
paymentRouter.post("/:id/proof", submitPaymentProof);

// Update payment status (webhook)
paymentRouter.post("/webhook", updatePaymentStatus);

export = paymentRouter;
