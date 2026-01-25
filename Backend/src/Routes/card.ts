import express, { type Router } from "express";
import {
  getCards,
  addCard,
  setDefaultCard,
  deleteCard,
} from "../Controllers/cardController";
import { requireAuth } from "../Middlewares/requireAuth";

const cardRouter: Router = express.Router();

// Get user's saved cards
cardRouter.get("/", requireAuth, getCards);

// Add a new card
cardRouter.post("/", requireAuth, addCard);

// Set card as default
cardRouter.put("/:id/default", requireAuth, setDefaultCard);

// Delete a card
cardRouter.delete("/:id", requireAuth, deleteCard);

export = cardRouter;
