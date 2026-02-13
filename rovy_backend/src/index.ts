import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profiles";
import buildRoutes from "./routes/builds";
import garageRoutes from "./routes/garage";
import copilotRoutes from "./routes/copilot";
import uploadRoutes from "./routes/upload";
import searchRoutes from "./routes/search";
import feedRoutes from "./routes/feed";
import eventsRoutes from "./routes/events";
import mapRoutes from "./routes/map";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/", (c) => c.text("Rovy Backend API is running"));

app.route("/auth", authRoutes);
app.route("/profiles", profileRoutes);
app.route("/builds", buildRoutes);
app.route("/garage", garageRoutes);
app.route("/copilot", copilotRoutes);
app.route("/upload", uploadRoutes);
app.route("/search", searchRoutes);
app.route("/feed", feedRoutes);
app.route("/events", eventsRoutes);
app.route("/map", mapRoutes);

export default app;
