"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Megaphone,
    Calendar,
    FileQuestion,
    LogOut,
    Shield,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationBell } from "@/components/notification-bell";

const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/" },
    { title: "Orders", icon: ShoppingCart, href: "/orders" },
    { title: "Products", icon: Package, href: "/products" },
    { title: "Users", icon: Users, href: "/users" },
    { title: "Admins", icon: Shield, href: "/admins" },
    { title: "Announcements", icon: Megaphone, href: "/announcements" },
    { title: "Events", icon: Calendar, href: "/events" },
    { title: "Quizzes", icon: FileQuestion, href: "/quizzes" },
];

function AdminSidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-6 py-4">
                <h1 className="text-xl font-bold text-emerald-600">IFUMSA Admin</h1>
                {user && (
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                )}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <Skeleton className="h-8 w-32" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AdminSidebar />
                <main className="flex-1 bg-zinc-50 dark:bg-zinc-950">
                    {/* Header with Notifications */}
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <div className="flex items-center gap-4">
                            <Link href="/notifications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                View All
                            </Link>
                            <NotificationBell />
                        </div>
                    </div>
                    {/* Main Content */}
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
