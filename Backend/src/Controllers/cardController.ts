import { Request, Response } from "express";
import { Card, ICard } from "../Models/Card";

/**
 * Get user's saved cards
 */
export const getCards = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const cards = await Card.find({ userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      cards: cards.map((card) => ({
        id: card._id,
        cardType: card.cardType,
        cardName: card.cardName,
        lastFourDigits: card.lastFourDigits,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        isDefault: card.isDefault,
      })),
    });
  } catch (error) {
    console.error("Get cards error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Add a new card
 */
export const addCard = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { cardType, cardName, cardNumber, expiryDate } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!cardName || !cardNumber || !expiryDate) {
      res.status(400).json({ message: "Card name, number, and expiry date are required" });
      return;
    }

    // Extract last 4 digits from card number
    const cleanedNumber = cardNumber.replace(/\s/g, "");
    const lastFourDigits = cleanedNumber.slice(-4);

    // Parse expiry date (MM/YY format)
    const [expiryMonth, expiryYear] = expiryDate.split("/");

    if (!expiryMonth || !expiryYear) {
      res.status(400).json({ message: "Invalid expiry date format" });
      return;
    }

    // Check if this is the first card (make it default)
    const existingCards = await Card.countDocuments({ userId });
    const isDefault = existingCards === 0;

    const card = await Card.create({
      userId,
      cardType: cardType || "other",
      cardName,
      lastFourDigits,
      expiryMonth,
      expiryYear,
      isDefault,
    });

    res.status(201).json({
      message: "Card added successfully",
      card: {
        id: card._id,
        cardType: card.cardType,
        cardName: card.cardName,
        lastFourDigits: card.lastFourDigits,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        isDefault: card.isDefault,
      },
    });
  } catch (error) {
    console.error("Add card error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Set a card as default
 */
export const setDefaultCard = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Remove default from all cards
    await Card.updateMany({ userId }, { isDefault: false });

    // Set the selected card as default
    const card = await Card.findOneAndUpdate(
      { _id: id, userId },
      { isDefault: true },
      { new: true }
    );

    if (!card) {
      res.status(404).json({ message: "Card not found" });
      return;
    }

    res.status(200).json({
      message: "Default card updated",
      card: {
        id: card._id,
        cardType: card.cardType,
        cardName: card.cardName,
        lastFourDigits: card.lastFourDigits,
        isDefault: card.isDefault,
      },
    });
  } catch (error) {
    console.error("Set default card error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete a card
 */
export const deleteCard = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const card = await Card.findOneAndDelete({ _id: id, userId });

    if (!card) {
      res.status(404).json({ message: "Card not found" });
      return;
    }

    // If deleted card was default, make another card default
    if (card.isDefault) {
      await Card.findOneAndUpdate(
        { userId },
        { isDefault: true },
        { sort: { createdAt: -1 } }
      );
    }

    res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Delete card error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
