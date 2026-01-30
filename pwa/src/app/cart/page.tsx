"use client";

import React from "react";
import Link from "next/link";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { useCart, useUpdateCartItemMutation, useRemoveFromCartMutation } from "@/hooks/use-cart";
import { ShoppingCart, Minus, Plus, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";

export default function CartPage() {
    const { data: cartData, isLoading } = useCart();
    const updateItem = useUpdateCartItemMutation();
    const removeItem = useRemoveFromCartMutation();

    const items = cartData?.cart?.items || [];
    const total = cartData?.cart?.total || 0;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-NG").format(price);
    };

    const handleUpdateQuantity = (productId: string, currentQuantity: number, delta: number) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity <= 0) {
            removeItem.mutate(productId);
        } else {
            updateItem.mutate({ productId, quantity: newQuantity });
        }
    };

    if (isLoading) {
        return (
            <Container className="min-h-screen">
                <PageHeader title="Cart" />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
                </div>
            </Container>
        );
    }

    return (
        <Container className="min-h-screen flex flex-col">
            <PageHeader title="Cart" />

            {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-[60px]">
                    <ShoppingCart size={48} className="text-[#C1C1C1]" />
                    <Text variant="body" color="gray" className="mt-3 mb-6">
                        Your cart is empty
                    </Text>
                    <Link href="/marketplace">
                        <Button variant="secondary" className="px-8">
                            Browse Marketplace
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    {/* Cart Items */}
                    <div className="flex-1 flex flex-col gap-3 pb-5">
                        {items.map((item, index) => {
                            const product = item.productId;

                            return (
                                <div
                                    key={product?._id || index}
                                    className="flex p-3 rounded-lg border border-[#D9D9D9] bg-white"
                                >
                                    <div className="w-[70px] h-[90px] rounded overflow-hidden bg-[#F5F5F5]">
                                        {product?.image && (
                                            <Image
                                                src={product.image}
                                                alt={product.title}
                                                width={70}
                                                height={90}
                                                className="object-cover w-full h-full"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 ml-3">
                                        <Text variant="body" fontWeight="600" className="line-clamp-2">
                                            {product?.title || "Product"}
                                        </Text>
                                        <Text variant="body2" color="textSecondary" className="mt-1">
                                            ₦{formatPrice(item.price)}
                                        </Text>
                                        <div className="flex items-center mt-2">
                                            <button
                                                className="w-7 h-7 rounded border border-[#D9D9D9] flex items-center justify-center bg-white cursor-pointer"
                                                onClick={() => handleUpdateQuantity(product?._id, item.quantity, -1)}
                                            >
                                                <Minus size={16} className="text-[#1F382E]" />
                                            </button>
                                            <Text variant="body" className="mx-3">
                                                {item.quantity}
                                            </Text>
                                            <button
                                                className="w-7 h-7 rounded border border-[#D9D9D9] flex items-center justify-center bg-white cursor-pointer"
                                                onClick={() => handleUpdateQuantity(product?._id, item.quantity, 1)}
                                            >
                                                <Plus size={16} className="text-[#1F382E]" />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        className="p-2 flex items-center justify-center bg-transparent border-0 cursor-pointer"
                                        onClick={() => removeItem.mutate(product?._id)}
                                    >
                                        <Trash2 size={20} className="text-[#F84F4F]" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 pb-6 border-t border-[#D9D9D9]">
                        <div className="flex justify-between items-center mb-4">
                            <Text variant="body" color="gray">
                                Total
                            </Text>
                            <Text variant="heading2" fontWeight="700">
                                ₦{formatPrice(total)}
                            </Text>
                        </div>
                        <Link href="/payment/method">
                            <Button variant="secondary" fullWidth>
                                Proceed to Checkout
                            </Button>
                        </Link>
                    </div>
                </>
            )}
        </Container>
    );
}
