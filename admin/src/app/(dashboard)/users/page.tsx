"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    profilePic: string;
    isVerified: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/users`,
                { credentials: "include" }
            );
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Users</h1>
                <p className="text-zinc-500">View all registered app users</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-zinc-500">Loading users...</p>
                    ) : users.length === 0 ? (
                        <p className="text-center py-8 text-zinc-500">No users yet</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Verified</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.profilePic} />
                                                    <AvatarFallback>
                                                        {getInitials(user.firstName, user.lastName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">
                                                    {user.firstName} {user.lastName}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>@{user.userName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.isVerified ? "default" : "secondary"}>
                                                {user.isVerified ? "Verified" : "Unverified"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
