import { useQuery } from '@tanstack/react-query';
import * as productService from '../../services/product';

// Query keys
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (category) => [...productKeys.lists(), { category }],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
  categories: () => [...productKeys.all, 'categories'],
};

// Get all products
export const useProducts = (category) => {
  return useQuery({
    queryKey: productKeys.list(category),
    queryFn: () => productService.getProducts(category),
  });
};

// Get product categories
export const useProductCategories = () => {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: productService.getCategories,
  });
};

// Get product by ID
export const useProduct = (id) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};
