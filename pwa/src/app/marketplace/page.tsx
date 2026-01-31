"use client";

import React from "react";
import Link from "next/link";
import { Text } from "@/components/ui/text";
import { useProductCategories } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, Loader2, ShoppingCart, Package } from "lucide-react";
import Image from "next/image";

// Optional: Map category keys to custom images (fallback to icon if not found)
const categoryImages: Record<string, string> = {
	clinical: "/images/clinical-essentials.png",
	merchandise: "/images/merchandise.png",
	synopses: "/images/synopsis.png",
};

// Format category name for display
const formatCategoryName = (category: string) => {
	return category
		.split(/[-_]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

export default function MarketplacePage() {
	const { data: categoriesData, isLoading } = useProductCategories();
	const { data: cartData } = useCart();
	const [mounted, setMounted] = React.useState(false);
	const categories = categoriesData?.categories || [];
	const cartItemCount = cartData?.cart?.items?.length || 0;

	React.useEffect(() => {
		setMounted(true);
	}, []);

	// Prevent hydration mismatch by not rendering until client is mounted
	if (!mounted || isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col bg-white">
			{/* Full-screen Hero Image - takes ~50% of screen height */}
			<div className="relative w-full h-[50vh] min-h-[300px]">
				<Image
					src="/images/marketplace-banner.png"
					alt="marketplace banner"
					fill
					className="object-cover"
					priority
				/>

				{/* Cart Icon - positioned top right */}
				<Link
					href="/cart"
					className="absolute top-6 right-6 bg-white rounded-full p-3 shadow-md hover:shadow-lg transition-shadow z-10"
				>
					<div className="relative">
						<ShoppingCart size={24} className="text-[#2A996B]" />
						{cartItemCount > 0 && (
							<div className="absolute -top-2 -right-2 bg-[#2A996B] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
								{cartItemCount}
							</div>
						)}
					</div>
				</Link>

				{/* Gradient overlay for text readability */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

				{/* Hero text at bottom of image */}
				<div className="absolute bottom-8 left-0 right-0 px-6 text-center">
					<p className="text-white font-bold text-xl drop-shadow-lg">
						One-Stop Shop for You:
					</p>
					<p className="text-white/90 text-lg drop-shadow-md mt-1">
						Essentials, Merch and More
					</p>
				</div>
			</div>

			{/* Categories Section */}
			<div className="flex-1 px-6 py-8">
				{categories.length === 0 ? (
					<div className="flex-1 flex flex-col items-center justify-center py-16">
						<ShoppingBag size={48} className="text-[#C1C1C1]" />
						<Text variant="body" color="gray" className="mt-3">
							No products available yet
						</Text>
					</div>
				) : (
					<>
						<Text variant="body" className="text-center text-gray-500 mb-6">
							Browse Categories
						</Text>

						{/* Dynamic grid based on category count */}
						<div className={`grid gap-4 max-w-md mx-auto ${categories.length === 1 ? "grid-cols-1" :
								categories.length === 2 ? "grid-cols-2" :
									"grid-cols-3"
							}`}>
							{categories.map((category: string) => {
								const categoryKey = category.toLowerCase();
								const hasCustomImage = categoryImages[categoryKey];

								return (
									<Link
										key={category}
										href={`/marketplace/${encodeURIComponent(category)}`}
										className="flex-1 rounded-xl py-4 px-2 bg-white flex flex-col items-center no-underline hover:bg-gray-50 transition-colors"
									>
										<div className="w-24 h-24 rounded-2xl bg-[#D9D9D9]/30 flex items-center justify-center mb-3 overflow-hidden">
											{hasCustomImage ? (
												<Image
													src={categoryImages[categoryKey]}
													alt={category}
													width={96}
													height={96}
													className="rounded-xl object-cover"
												/>
											) : (
												<Package size={40} className="text-[#2A996B]" />
											)}
										</div>
										<Text
											variant="body"
											fontWeight="600"
											align="center"
											className="mt-2 text-sm"
										>
											{formatCategoryName(category)}
										</Text>
									</Link>
								);
							})}
						</div>
					</>
				)}
			</div>
		</div>
	);
}

