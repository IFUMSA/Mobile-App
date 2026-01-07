"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, X, Clock, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { api, Order } from "@/lib/api";

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    submitted: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");

    useEffect(() => {
        if (params.id) {
            fetchOrder(params.id as string);
        }
    }, [params.id]);

    const fetchOrder = async (id: string) => {
        try {
            const data = await api.getOrder(id);
            setOrder(data.order);
            setAdminNotes(data.order.adminNotes || "");
        } catch (error) {
            console.error("Failed to fetch order:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (status: string) => {
        if (!order) return;
        setUpdating(true);

        try {
            const data = await api.updateOrder(order._id, { status, adminNotes });
            setOrder(data.order);
        } catch (error) {
            console.error("Failed to update order:", error);
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="space-y-6">
                <Link href="/orders">
                    <Button variant="ghost">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Button>
                </Link>
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="text-zinc-500">Order not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/orders">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Order Details</h1>
                    <p className="text-zinc-500 text-sm">Reference: {order.reference}</p>
                </div>
                <Badge className={`ml-auto ${statusColors[order.status]}`}>
                    {order.status}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-zinc-500">Name</p>
                            <p className="font-medium">
                                {order.userId?.firstName} {order.userId?.lastName}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Email</p>
                            <p className="font-medium">{order.userId?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500">Order Date</p>
                            <p className="font-medium">{formatDate(order.createdAt)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-zinc-500">Title</p>
                            <p className="font-medium">{order.title}</p>
                        </div>
                        {order.description && (
                            <div>
                                <p className="text-sm text-zinc-500">Description</p>
                                <p className="font-medium">{order.description}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-zinc-500">Amount</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(order.amount)}
                            </p>
                        </div>
                        {order.receiptCode && (
                            <div>
                                <p className="text-sm text-zinc-500">Receipt Code</p>
                                <p className="font-mono text-lg font-bold">{order.receiptCode}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {order.productIds && order.productIds.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {order.productIds.map((product) => (
                                    <div
                                        key={product._id}
                                        className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900"
                                    >
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded bg-zinc-200 flex items-center justify-center">
                                                <ImageIcon className="h-6 w-6 text-zinc-400" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium">{product.title}</p>
                                            <p className="text-sm text-zinc-500">
                                                {formatCurrency(product.price)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {order.proofImage && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Proof</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <img
                                src={order.proofImage}
                                alt="Payment proof"
                                className="w-full rounded-lg border"
                            />
                        </CardContent>
                    </Card>
                )}

                {order.verifiedBy && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Verification Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-zinc-500">Verified By</p>
                                <p className="font-medium">
                                    {order.verifiedBy.firstName} {order.verifiedBy.lastName}
                                </p>
                            </div>
                            {order.verifiedAt && (
                                <div>
                                    <p className="text-sm text-zinc-500">Verified At</p>
                                    <p className="font-medium">{formatDate(order.verifiedAt)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Admin Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notes">Admin Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add notes about this order..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {order.status === "submitted" && (
                                <>
                                    <Button
                                        onClick={() => updateStatus("confirmed")}
                                        disabled={updating}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Confirm Payment
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => updateStatus("rejected")}
                                        disabled={updating}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </>
                            )}

                            {order.status === "confirmed" && (
                                <Button
                                    onClick={() => updateStatus("completed")}
                                    disabled={updating}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark as Completed
                                </Button>
                            )}

                            {order.status === "pending" && (
                                <Button
                                    variant="outline"
                                    onClick={() => updateStatus("submitted")}
                                    disabled={updating}
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Mark as Submitted
                                </Button>
                            )}

                            {(order.status === "rejected" || order.status === "completed") && (
                                <p className="text-sm text-zinc-500">
                                    This order has been {order.status}. No further actions available.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
