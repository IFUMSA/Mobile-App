import { Request, Response } from "express";
import { Product } from "../Models/Product";

// Get all products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const filter: { isAvailable: boolean; category?: string } = { isAvailable: true };
    if (category) filter.category = category as string;

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

    res.status(200).json({ products });
    return;
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).lean();

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({ product });
    return;
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Get product categories
export const getProductCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Product.distinct("category", { isAvailable: true });
    res.status(200).json({ categories });
    return;
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Create product (admin only)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, image, category, author, stock } = req.body;

    if (!title || !price || !image || !category) {
      res.status(400).json({ message: "Title, price, image, and category are required" });
      return;
    }

    const product = new Product({
      title,
      description,
      price,
      image,
      category,
      author,
      stock: stock || 0,
      isAvailable: true,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
    return;
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Update product (admin only)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, image, category, author, stock, isAvailable } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(price && { price }),
          ...(image && { image }),
          ...(category && { category }),
          ...(author !== undefined && { author }),
          ...(stock !== undefined && { stock }),
          ...(isAvailable !== undefined && { isAvailable }),
        },
      },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
    return;
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Delete product (admin only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({ message: "Product deleted successfully" });
    return;
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};
