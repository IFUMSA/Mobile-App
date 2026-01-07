import express, { type Router } from "express";
import {
  getProducts,
  getProductById,
  getProductCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../Controllers/productController";

const productRouter: Router = express.Router();

// Get product categories
productRouter.get("/categories", getProductCategories);

// Get all products
productRouter.get("/", getProducts);

// Get product by ID
productRouter.get("/:id", getProductById);

// Create product (admin)
productRouter.post("/", createProduct);

// Update product (admin)
productRouter.put("/:id", updateProduct);

// Delete product (admin)
productRouter.delete("/:id", deleteProduct);

export = productRouter;
