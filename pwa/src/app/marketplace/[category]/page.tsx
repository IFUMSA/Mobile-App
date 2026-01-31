"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { useProducts, useProductCategories } from "@/hooks/use-products";
import { useAddToCartMutation, useCart } from "@/hooks/use-cart";
import { ShoppingBag, Loader2, ShoppingCart } from "lucide-react";
import Image from "next/image";

export default function CategoryProductsPage() {
    const params = useParams();
    const categoryParam = (params.category as string) || "";

    // Decode URL parameter and use directly (categories come from backend as-is)
    const category = decodeURIComponent(categoryParam);

    // Format for display (capitalize first letter of each word)
    const categoryTitle = category
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

    const { data: productsData, isLoading } = useProducts(category);
    const { data: cartData } = useCart();
    const addToCart = useAddToCartMutation();
    const [addedItems, setAddedItems] = React.useState<Set<string>>(new Set());
    const [mounted, setMounted] = React.useState(false);

    const products = productsData?.products || [];
    const cartItemCount = cartData?.cart?.items?.length || 0;

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-NG").format(price);
    };

    const handleAddToCart = async (productId: string) => {
        if (!addedItems.has(productId)) {
            try {
                await addToCart.mutateAsync({ productId, quantity: 1 });
                setAddedItems((prev) => new Set([...prev, productId]));
            } catch (error) {
                console.error("Failed to add to cart:", error);
            }
        }
    };

    // Prevent hydration mismatch
    if (!mounted || isLoading) {
        return (
            <Container className="min-h-screen">
                <PageHeader title={categoryTitle} />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
                </div>
            </Container>
        );
    }

    return (
        <Container className="min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <PageHeader title={categoryTitle} />
                <Link
                    href="/cart"
                    className="bg-white rounded-full p-3 shadow-md hover:shadow-lg transition-shadow"
                >
                    <div className="relative">
                        <ShoppingCart size={24} className="text-[#2A996B]" />
                        {cartItemCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-[#2A996B] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                {cartItemCount}
                            </div>
                        )}
                    </div>
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-15">
                    <ShoppingBag size={48} className="text-[#C1C1C1]" />
                    <Text variant="body" color="gray" className="mt-3">
                        No products available
                    </Text>
                </div>
            ) : (
                <div className="flex flex-col gap-4 pb-5">
                    {products.map((product) => {
                        const isAdded = addedItems.has(product._id);

                        return (
                            <div
                                key={product._id}
                                className="flex items-center p-3 rounded-lg border border-[#D9D9D9] bg-white"
                            >
                                <div className="w-19.5 h-25 rounded overflow-hidden bg-[#F5F5F5]">
                                    {product.image && (
                                        <Image
                                            src={product.image}
                                            alt={product.title}
                                            width={78}
                                            height={100}
                                            className="object-cover w-full h-full"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 ml-4 mr-3">
                                    <Text variant="body" fontWeight="600" className="mb-2 line-clamp-2">
                                        {product.title}
                                    </Text>
                                    <Text variant="body2" color="textSecondary">
                                        ₦{formatPrice(product.price)}
                                    </Text>
                                </div>
                                <button
                                    className={`px-3 py-2 rounded text-white text-[12px] font-medium border-0 cursor-pointer transition-colors ${isAdded ? "bg-[#C1C1C1]" : "bg-[#2A996B] hover:bg-[#238a5f]"
                                        }`}
                                    onClick={() => handleAddToCart(product._id)}
                                    disabled={isAdded || addToCart.isPending}
                                >
                                    {isAdded ? "Added" : "Add to cart"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </Container>
    );
}
