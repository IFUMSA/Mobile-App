import api from './api';

/**
 * Product Service - handles all product API calls
 */

// Get all products
export const getProducts = async (category) => {
  const params = category ? { category } : {};
  const response = await api.get('/api/products', { params });
  return response.data;
};

// Get product categories
export const getCategories = async () => {
  const response = await api.get('/api/products/categories');
  return response.data;
};

// Get product by ID
export const getProductById = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

export default {
  getProducts,
  getCategories,
  getProductById,
};
