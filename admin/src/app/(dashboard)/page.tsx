"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Package, Users, DollarSign, ArrowRight } from "lucide-react";
import { api, Order } from "@/lib/api";

interface Stats {
    orders: number;
    products: number;
    users: number;
    revenue: number;
    pendingOrders: number;
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    submitted: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
};

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsData, ordersData] = await Promise.all([
                api.getStats(),
                api.getOrders(),
            ]);
            setStats(statsData);
            setRecentOrders(ordersData.orders.slice(0, 5));
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-NG", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Welcome to IFUMSA Admin Panel
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.orders || 0}</div>
                                <p className="text-xs text-zinc-500">
                                    Pending verification: {stats?.pendingOrders || 0}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                        <Package className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.products || 0}</div>
                                <p className="text-xs text-zinc-500">Active listings</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.users || 0}</div>
                                <p className="text-xs text-zinc-500">Registered users</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats?.revenue || 0)}
                                </div>
                                <p className="text-xs text-zinc-500">Total confirmed</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Link
                        href="/orders"
                        className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
                    >
                        View all <ArrowRight className="h-3 w-3" />
                    </Link>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <p className="text-zinc-500 text-sm">
                            No orders yet. Orders will appear here once users make purchases.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <Link
                                    key={order._id}
                                    href={`/orders/${order._id}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">
                                            {order.userId?.firstName} {order.userId?.lastName}
                                        </p>
                                        <p className="text-xs text-zinc-500">{order.title}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm">
                                            {formatCurrency(order.amount)}
                                        </p>
                                        <Badge className={`text-xs ${statusColors[order.status]}`}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
