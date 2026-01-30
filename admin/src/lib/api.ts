const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Helper to determine if endpoint should use local proxy (for admin routes)
function getApiUrl(endpoint: string): string {
    // Admin routes go through local proxy to handle cookies properly
    if (endpoint.startsWith("/api/admin/")) {
        return endpoint; // Use local Next.js proxy
    }
    // Non-admin routes (like /api/products) go directly to backend
    return `${API_URL}${endpoint}`;
}

export async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = getApiUrl(endpoint);
    const res = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || "Request failed");
    }

    return res.json();
}

export const api = {
    // Auth
    login: (email: string, password: string) =>
        fetchAPI<{ user: { id: string; email: string; firstName: string; lastName: string } }>(
            "/api/admin/login",
            { method: "POST", body: JSON.stringify({ email, password }) }
        ),

    // Dashboard
    getStats: () =>
        fetchAPI<{
            orders: number;
            products: number;
            users: number;
            revenue: number;
            pendingOrders: number;
        }>("/api/admin/stats"),

    // Orders
    getOrders: () =>
        fetchAPI<{ orders: Order[] }>("/api/admin/orders"),

    getOrder: (id: string) =>
        fetchAPI<{ order: Order }>(`/api/admin/orders/${id}`),

    updateOrder: (id: string, data: { status: string; adminNotes?: string }) =>
        fetchAPI<{ order: Order; message: string }>(`/api/admin/orders/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    // Products
    getProducts: () =>
        fetchAPI<{ products: Product[] }>("/api/products"),

    getProduct: (id: string) =>
        fetchAPI<{ product: Product }>(`/api/products/${id}`),

    createProduct: (data: Partial<Product>) =>
        fetchAPI<{ product: Product; message: string }>("/api/admin/products", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    updateProduct: (id: string, data: Partial<Product>) =>
        fetchAPI<{ product: Product; message: string }>(`/api/admin/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    deleteProduct: (id: string) =>
        fetchAPI<{ message: string }>(`/api/admin/products/${id}`, {
            method: "DELETE",
        }),

    // Users
    getUsers: () =>
        fetchAPI<{ users: User[] }>("/api/admin/users"),

    // Quizzes
    getQuizzes: () =>
        fetchAPI<{ quizzes: Quiz[] }>("/api/admin/quizzes"),

    // Announcements
    getAnnouncements: () =>
        fetchAPI<{ announcements: Announcement[] }>("/api/admin/announcements"),

    createAnnouncement: (data: Partial<Announcement>) =>
        fetchAPI<{ announcement: Announcement; message: string }>("/api/admin/announcements", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    updateAnnouncement: (id: string, data: Partial<Announcement>) =>
        fetchAPI<{ announcement: Announcement; message: string }>(`/api/admin/announcements/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    deleteAnnouncement: (id: string) =>
        fetchAPI<{ message: string }>(`/api/admin/announcements/${id}`, {
            method: "DELETE",
        }),

    // Events
    getEvents: () =>
        fetchAPI<{ events: Event[] }>("/api/admin/events"),

    createEvent: (data: Partial<Event>) =>
        fetchAPI<{ event: Event; message: string }>("/api/admin/events", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    updateEvent: (id: string, data: Partial<Event>) =>
        fetchAPI<{ event: Event; message: string }>(`/api/admin/events/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    deleteEvent: (id: string) =>
        fetchAPI<{ message: string }>(`/api/admin/events/${id}`, {
            method: "DELETE",
        }),
};

// Types
export interface Order {
    _id: string;
    userId: { _id: string; firstName: string; lastName: string; email: string };
    title: string;
    description?: string;
    amount: number;
    status: "pending" | "submitted" | "confirmed" | "completed" | "rejected";
    reference: string;
    productIds?: { _id: string; title: string; price: number; image: string }[];
    proofImage?: string;
    verifiedBy?: { _id: string; firstName: string; lastName: string };
    verifiedAt?: string;
    receiptCode?: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    _id: string;
    title: string;
    description?: string;
    price: number;
    image: string;
    category: string;
    author?: string;
    isAvailable: boolean;
    stock: number;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    profilePic?: string;
    isVerified: boolean;
    createdAt: string;
}

export interface Quiz {
    _id: string;
    title: string;
    description?: string;
    questions: unknown[];
    createdBy: { _id: string; firstName: string; lastName: string; email: string };
    isShared: boolean;
    sharedAt?: string;
    createdAt: string;
}

export interface Announcement {
    _id: string;
    title: string;
    description?: string;
    link?: string;
    isActive: boolean;
    order: number;
    createdBy?: { _id: string; firstName: string; lastName: string };
    createdAt: string;
    updatedAt: string;
}

export interface Event {
    _id: string;
    title: string;
    description?: string;
    image?: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    createdBy?: { _id: string; firstName: string; lastName: string };
    createdAt: string;
    updatedAt: string;
}
