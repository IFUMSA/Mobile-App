"use client";

import React from "react";
import Link from "next/link";
import { Text } from "@/components/ui/text";
import { useProductCategories } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, Loader2, ShoppingCart } from "lucide-react";
import Image from "next/image";

// Map category values to display names and icons
const categoryConfig = [
	{
		key: "Clinical",
		title: "Clinical Essentials",
		icon: (
			<Image
				src="/images/clinical-essentials.png"
				alt="clinical essentials"
				width={200}
				height={100}
				className="rounded-xl"
			/>
		),
	},
	{
		key: "Merchandise",
		title: "Merchandise",
		icon: (
			<Image
				src="/images/merchandise.png"
				alt="merchandise"
				width={200}
				height={100}
				className="rounded-xl"
			/>
		),
	},
	{
		key: "Synopses",
		title: "Synopses",
		icon: (
			<Image
				src="/images/synopsis.png"
				alt="synopsis"
				width={200}
				height={100}
				className="rounded-xl"
			/>
		),
	},
];

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

						{/* Centered 3-column grid */}
						<div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
							{categoryConfig.map((config) => (
								<Link
									key={config.key}
									href={`/marketplace/${config.key.toLowerCase()}`}
									className="flex-1 max-w-37.5 rounded-xl py-4 px-1 bg-white flex flex-col items-center no-underline"
								>
									<div className="w-27 h-27 rounded-2xl bg-[#D9D9D9]/30 flex items-center justify-center mb-3">
										{config.icon}
									</div>
									<Text
										variant="body"
										fontWeight="600"
										align="center"
										className="mt-2 text-sm"
									>
										{config.title}
									</Text>
								</Link>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
