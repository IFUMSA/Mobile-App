import api from "@/lib/api";

// Cart Service - matches mobile app services/cart.js

export interface CartItem {
    productId: {
        _id: string;
        title: string;
        image?: string;
        price: number;
    };
    quantity: number;
    price: number;
}

export interface Cart {
    _id: string;
    items: CartItem[];
    total: number;
}

export const cartService = {
    // Get user's cart
    getCart: async (): Promise<{ cart: Cart }> => {
        const response = await api.get("/api/cart");
        return response.data;
    },

    // Add item to cart
    addToCart: async (productId: string, quantity = 1) => {
        const response = await api.post("/api/cart/add", { productId, quantity });
        return response.data;
    },

    // Update cart item quantity
    updateCartItem: async (productId: string, quantity: number) => {
        const response = await api.put("/api/cart/update", { productId, quantity });
        return response.data;
    },

    // Remove item from cart
    removeFromCart: async (productId: string) => {
        const response = await api.delete(`/api/cart/remove/${productId}`);
        return response.data;
    },

    // Clear cart
    clearCart: async () => {
        const response = await api.delete("/api/cart/clear");
        return response.data;
    },
};
