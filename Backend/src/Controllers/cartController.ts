import { Request, Response } from "express";
import { Cart } from "../Models/Cart";
import { Product } from "../Models/Product";

// Get user's cart
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let cart = await Cart.findOne({ userId }).populate("items.productId", "title image price category");

    if (!cart) {
      cart = new Cart({ userId, items: [], total: 0 });
      await cart.save();
    }

    res.status(200).json({ cart });
    return;
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { productId, quantity = 1 } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!productId) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) {
      res.status(404).json({ message: "Product not found or unavailable" });
      return;
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], total: 0 });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price,
      });
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();

    res.status(200).json({
      message: "Item added to cart",
      cart,
    });
    return;
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { productId, quantity } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!productId || quantity === undefined) {
      res.status(400).json({ message: "Product ID and quantity are required" });
      return;
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      res.status(404).json({ message: "Item not found in cart" });
      return;
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();

    res.status(200).json({
      message: "Cart updated",
      cart,
    });
    return;
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { productId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();

    res.status(200).json({
      message: "Item removed from cart",
      cart,
    });
    return;
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    cart.items = [];
    cart.total = 0;

    await cart.save();

    res.status(200).json({
      message: "Cart cleared",
      cart,
    });
    return;
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};
