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
import { Plus, Pencil, Trash2, Calendar, MapPin } from "lucide-react";
import { api, Event } from "@/lib/api";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: "",
        location: "",
        startDate: "",
        endDate: "",
        isActive: true,
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await api.getEvents();
            setEvents(data.events || []);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            image: "",
            location: "",
            startDate: "",
            endDate: "",
            isActive: true,
        });
        setEditingId(null);
    };

    const openEditDialog = (event: Event) => {
        setFormData({
            title: event.title,
            description: event.description || "",
            image: event.image || "",
            location: event.location || "",
            startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
            endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
            isActive: event.isActive,
        });
        setEditingId(event._id);
        setDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                image: formData.image || undefined,
                location: formData.location,
                startDate: formData.startDate,
                endDate: formData.endDate || undefined,
                isActive: formData.isActive,
            };

            if (editingId) {
                await api.updateEvent(editingId, payload);
            } else {
                await api.createEvent(payload);
            }

            await fetchEvents();
            setDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save event:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            await api.deleteEvent(id);
            setEvents(events.filter((e) => e._id !== id));
        } catch (error) {
            console.error("Failed to delete event:", error);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isUpcoming = (date: string) => new Date(date) > new Date();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Events</h1>
                    <p className="text-zinc-500">Create and manage events</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId ? "Edit Event" : "New Event"}
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
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Main Auditorium"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date *</Label>
                                    <Input
                                        id="startDate"
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Image URL (optional)</Label>
                                <Input
                                    id="image"
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="isActive">Active</Label>
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
                    <CardTitle>All Events</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-zinc-500">Loading...</p>
                    ) : events.length === 0 ? (
                        <p className="text-center py-8 text-zinc-500">
                            No events yet. Create one to display in the app.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div
                                    key={event._id}
                                    className="flex items-start gap-4 p-4 border rounded-lg bg-white dark:bg-zinc-900"
                                >
                                    {event.image && (
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-medium">{event.title}</h3>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <Badge variant={event.isActive ? "default" : "secondary"}>
                                                    {event.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                                {isUpcoming(event.startDate) && (
                                                    <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
                                                )}
                                            </div>
                                        </div>
                                        {event.description && (
                                            <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                                                {event.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(event.startDate)}
                                            </span>
                                            {event.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {event.location}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(event)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(event._id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
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
