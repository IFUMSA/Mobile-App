"use client";

import React from "react";
import Link from "next/link";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { useProductCategories } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, BookOpen, Loader2, ShoppingCart } from "lucide-react";
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

	const getCategoryDisplay = (category: string) => {
		const config =
			categoryConfig.find((c) => c.key === category) || {
				key: category,
				title: category,
				icon: (
					<Image
						src="/images/synopsis.png"
						alt="synopsis"
						width={150}
						height={100}
						className="rounded-xl"
					/>
				),
			};
		return config;
	};

	// Prevent hydration mismatch by not rendering until client is mounted
	if (!mounted || isLoading) {
		return (
			<Container className="min-h-screen">
				<PageHeader title="Marketplace" />
				<div className="flex-1 flex items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
				</div>
			</Container>
		);
	}

	return (
		<>
			<div className="relative w-full h-screen/2 bg-linear-to-b from-gray-100 to-white overflow-hidden">
				<Image
					src="/images/marketplace-banner.png"
					alt="marketplace banner"
					width={400}
					height={200}
					className="object-contain"
					priority
				/>
				{/* Cart Icon */}
				<Link
					href="/cart"
					className="absolute top-6 right-6 bg-white rounded-full p-3 shadow-md hover:shadow-lg transition-shadow"
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
				<div className="absolute bottom-8 left-0 right-0 px-6">
					<p className="text-white font-bold text-center text-lg">
						One-Stop Shop for You :<br />
						Essentials, Merch and More
					</p>
				</div>
			</div>
			<Container className="h-screen/2 mt-0 pt-6">
				{/* <PageHeader title="Marketplace" /> */}

				{categories.length === 0 ? (
					<div className="flex-1 flex flex-col items-center justify-center py-15">
						<ShoppingBag size={48} className="text-[#C1C1C1]" />
						<Text variant="body" color="gray" className="mt-3">
							No products available yet
						</Text>
					</div>
				) : (
					<div className="flex justify-center gap-1 py-0">
						{categoryConfig.map((config) => {
							return (
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
							);
						})}
					</div>
				)}
			</Container>
		</>
	);
}
