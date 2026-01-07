import express, { type Router } from "express";
import {
    getActiveAnnouncements,
    getActiveEvents,
    getNextEvent,
} from "../Controllers/contentController";

const contentRouter: Router = express.Router();

// Public routes - no auth required
contentRouter.get("/announcements", getActiveAnnouncements);
contentRouter.get("/events", getActiveEvents);
contentRouter.get("/events/next", getNextEvent);

export = contentRouter;
