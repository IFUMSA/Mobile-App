"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api, Announcement } from "@/lib/api";

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        link: "",
        order: "0",
        isActive: true,
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const data = await api.getAnnouncements();
            setAnnouncements(data.announcements || []);
        } catch (error) {
            console.error("Failed to fetch announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            link: "",
            order: "0",
            isActive: true,
        });
        setEditingId(null);
    };

    const openEditDialog = (announcement: Announcement) => {
        setFormData({
            title: announcement.title,
            description: announcement.description || "",
            link: announcement.link || "",
            order: announcement.order.toString(),
            isActive: announcement.isActive,
        });
        setEditingId(announcement._id);
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                link: formData.link,
                order: parseInt(formData.order) || 0,
                isActive: formData.isActive,
            };

            if (editingId) {
                await api.updateAnnouncement(editingId, payload);
            } else {
                await api.createAnnouncement(payload);
            }

            await fetchAnnouncements();
            setDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save announcement:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        try {
            await api.deleteAnnouncement(id);
            setAnnouncements(announcements.filter((a) => a._id !== id));
        } catch (error) {
            console.error("Failed to delete announcement:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Announcements</h1>
                    <p className="text-zinc-500">Manage home carousel announcements</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId ? "Edit Announcement" : "New Announcement"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="link">Link URL (optional)</Label>
                                <Input
                                    id="link"
                                    type="url"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="order">Display Order</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="isActive">Active</Label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={saving}>
                                    {saving ? "Saving..." : editingId ? "Update" : "Create"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-zinc-500">Loading...</p>
                    ) : announcements.length === 0 ? (
                        <p className="text-center py-8 text-zinc-500">
                            No announcements yet. Create one to display on the home carousel.
                        </p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {announcements.map((announcement) => (
                                <div
                                    key={announcement._id}
                                    className="border rounded-lg p-4 bg-white dark:bg-zinc-900"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-medium">{announcement.title}</h3>
                                        <Badge variant={announcement.isActive ? "default" : "secondary"}>
                                            {announcement.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    {announcement.description && (
                                        <p className="text-sm text-zinc-500 mt-2 line-clamp-2">
                                            {announcement.description}
                                        </p>
                                    )}
                                    {announcement.link && (
                                        <p className="text-xs text-blue-500 mt-1 truncate">
                                            {announcement.link}
                                        </p>
                                    )}
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditDialog(announcement)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(announcement._id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
