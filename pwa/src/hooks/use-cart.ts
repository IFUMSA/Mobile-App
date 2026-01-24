"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/services/cart";

// Query keys
export const cartKeys = {
    all: ["cart"] as const,
    detail: () => [...cartKeys.all, "detail"] as const,
};

// Get cart
export function useCart() {
    return useQuery({
        queryKey: cartKeys.detail(),
        queryFn: cartService.getCart,
    });
}

// Add to cart mutation
export function useAddToCartMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, quantity = 1 }: { productId: string; quantity?: number }) =>
            cartService.addToCart(productId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

// Update cart item mutation
export function useUpdateCartItemMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
            cartService.updateCartItem(productId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

// Remove from cart mutation
export function useRemoveFromCartMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) => cartService.removeFromCart(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

// Clear cart mutation
export function useClearCartMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cartService.clearCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}
