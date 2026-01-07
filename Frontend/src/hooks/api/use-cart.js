import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as cartService from '../../services/cart';

// Query keys
export const cartKeys = {
  all: ['cart'],
  detail: () => [...cartKeys.all, 'detail'],
};

// Get cart
export const useCart = () => {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: cartService.getCart,
  });
};

// Add to cart mutation
export const useAddToCartMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartService.addToCart,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

// Update cart item mutation
export const useUpdateCartItemMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartService.updateCartItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

// Remove from cart mutation
export const useRemoveFromCartMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartService.removeFromCart,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

// Clear cart mutation
export const useClearCartMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};
