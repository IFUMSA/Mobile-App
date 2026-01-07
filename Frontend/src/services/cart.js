import api from './api';

/**
 * Cart Service - handles all cart API calls
 */

// Get user's cart
export const getCart = async () => {
  const response = await api.get('/api/cart');
  return response.data;
};

// Add item to cart
export const addToCart = async ({ productId, quantity = 1 }) => {
  const response = await api.post('/api/cart/add', { productId, quantity });
  return response.data;
};

// Update cart item quantity
export const updateCartItem = async ({ productId, quantity }) => {
  const response = await api.put('/api/cart/update', { productId, quantity });
  return response.data;
};

// Remove item from cart
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/api/cart/remove/${productId}`);
  return response.data;
};

// Clear cart
export const clearCart = async () => {
  const response = await api.delete('/api/cart/clear');
  return response.data;
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
