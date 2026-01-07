import api from './api';

/**
 * Card Service - handles all card API calls
 */

// Get user's saved cards
export const getCards = async () => {
  const response = await api.get('/api/cards');
  return response.data;
};

// Add a new card
export const addCard = async ({ cardType, cardName, cardNumber, expiryDate }) => {
  const response = await api.post('/api/cards', {
    cardType,
    cardName,
    cardNumber,
    expiryDate,
  });
  return response.data;
};

// Set card as default
export const setDefaultCard = async (cardId) => {
  const response = await api.put(`/api/cards/${cardId}/default`);
  return response.data;
};

// Delete a card
export const deleteCard = async (cardId) => {
  const response = await api.delete(`/api/cards/${cardId}`);
  return response.data;
};

export default {
  getCards,
  addCard,
  setDefaultCard,
  deleteCard,
};
