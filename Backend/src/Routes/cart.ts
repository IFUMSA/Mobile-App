import express, { type Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../Controllers/cartController";

const cartRouter: Router = express.Router();

// Get user's cart
cartRouter.get("/", getCart);

// Add item to cart
cartRouter.post("/add", addToCart);

// Update cart item quantity
cartRouter.put("/update", updateCartItem);

// Remove item from cart
cartRouter.delete("/remove/:productId", removeFromCart);

// Clear cart
cartRouter.delete("/clear", clearCart);

export = cartRouter;
