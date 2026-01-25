import express, { type Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../Controllers/cartController";
import { requireAuth } from "../Middlewares/requireAuth";

const cartRouter: Router = express.Router();

// Get user's cart
cartRouter.get("/", requireAuth, getCart);

// Add item to cart
cartRouter.post("/add", requireAuth, addToCart);

// Update cart item quantity
cartRouter.put("/update", requireAuth, updateCartItem);

// Remove item from cart
cartRouter.delete("/remove/:productId", requireAuth, removeFromCart);

// Clear cart
cartRouter.delete("/clear", requireAuth, clearCart);

export = cartRouter;
