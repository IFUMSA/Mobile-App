import api from "@/lib/api";

// Product service - matches mobile app services/product.js

export interface Product {
    _id: string;
    title: string;
    price: number;
    image?: string;
    category: string;
    description?: string;
}

export const productService = {
    getProducts: async (category?: string): Promise<{ products: Product[] }> => {
        const params = category ? { category } : {};
        const response = await api.get("/api/products", { params });
        return response.data;
    },

    getProduct: async (id: string): Promise<{ product: Product }> => {
        const response = await api.get(`/api/products/${id}`);
        return response.data;
    },

    getCategories: async (): Promise<{ categories: string[] }> => {
        const response = await api.get("/api/products/categories");
        return response.data;
    },
};
