import express, { type Router } from "express";
import {
  getCards,
  addCard,
  setDefaultCard,
  deleteCard,
} from "../Controllers/cardController";

const cardRouter: Router = express.Router();

// Get user's saved cards
cardRouter.get("/", getCards);

// Add a new card
cardRouter.post("/", addCard);

// Set card as default
cardRouter.put("/:id/default", setDefaultCard);

// Delete a card
cardRouter.delete("/:id", deleteCard);

export = cardRouter;
