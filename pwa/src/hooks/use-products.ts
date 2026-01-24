"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product";

// Query keys
export const productKeys = {
    all: ["products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    list: (category?: string) => [...productKeys.lists(), { category }] as const,
    details: () => [...productKeys.all, "detail"] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
    categories: () => [...productKeys.all, "categories"] as const,
};

// Get all products
export function useProducts(category?: string) {
    return useQuery({
        queryKey: productKeys.list(category),
        queryFn: () => productService.getProducts(category),
    });
}

// Get product by ID
export function useProduct(id: string) {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => productService.getProduct(id),
        enabled: !!id,
    });
}

// Get product categories
export function useProductCategories() {
    return useQuery({
        queryKey: productKeys.categories(),
        queryFn: productService.getCategories,
    });
}
