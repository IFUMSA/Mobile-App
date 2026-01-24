"use client";

import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { useProducts } from "@/hooks/use-products";
import { useAddToCartMutation } from "@/hooks/use-cart";
import { Book, Loader2 } from "lucide-react";
import Image from "next/image";

export default function SynopsesPage() {
    const { data: productsData, isLoading } = useProducts("Synopsis");
    const addToCart = useAddToCartMutation();
    const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

    const products = productsData?.products || [];

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

    if (isLoading) {
        return (
            <Container className="min-h-screen">
                <PageHeader title="Synopses" />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
                </div>
            </Container>
        );
    }

    return (
        <Container className="min-h-screen">
            <PageHeader title="Synopses" />

            {products.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-[60px]">
                    <Book size={48} className="text-[#C1C1C1]" />
                    <Text variant="body" color="gray" className="mt-3">
                        No synopses available
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
                                <div className="w-[78px] h-[100px] rounded overflow-hidden bg-[#F5F5F5]">
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
