import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const eventsRoutes = new Hono<{ Variables: { user: any } }>();

eventsRoutes.use("*", authMiddleware);

eventsRoutes.get("/me", async (c) => {
  const user = c.get("user");

  try {
    const events = await (prisma as any).event.findMany({
      where: { hostUserId: user.id },
      orderBy: { startDate: "asc" },
    });

    return c.json({ data: events });
  } catch (error) {
    console.error("Error fetching my events:", error);
    return c.json({ message: "Failed to fetch my events" }, 500);
  }
});

eventsRoutes.post("/", async (c) => {
  const user = c.get("user");

  try {
    const body = await c.req.json();
    const {
      title,
      description,
      location,
      latitude,
      longitude,
      startDate,
      endDate,
      imageUrl,
      category,
    } = body;

    if (!title || !location || latitude === undefined || longitude === undefined || !startDate) {
      return c.json({ message: "Missing required fields" }, 400);
    }

    const parsedStartDate = new Date(startDate);
    if (Number.isNaN(parsedStartDate.getTime())) {
      return c.json({ message: "Invalid startDate" }, 400);
    }

    const parsedEndDate = endDate ? new Date(endDate) : null;
    if (endDate && Number.isNaN(parsedEndDate?.getTime())) {
      return c.json({ message: "Invalid endDate" }, 400);
    }

    const created = await (prisma as any).event.create({
      data: {
        title,
        description,
        location,
        latitude: Number(latitude),
        longitude: Number(longitude),
        startDate: parsedStartDate,
        endDate: parsedEndDate ?? undefined,
        imageUrl,
        category,
        hostUserId: user.id,
      },
    });

    return c.json({ data: created }, 201);
  } catch (error) {
    console.error("Error creating event:", error);
    return c.json({ message: "Failed to create event" }, 500);
  }
});

eventsRoutes.get("/nearby", async (c) => {
  const lat = c.req.query("lat");
  const lon = c.req.query("lon");
  const radiusKmRaw = c.req.query("radiusKm");

  if (!lat || !lon) {
    return c.json({ message: "Missing lat or lon" }, 400);
  }

  const latitude = Number(lat);
  const longitude = Number(lon);
  const radiusKm = radiusKmRaw ? Number(radiusKmRaw) : 25;

  if (Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(radiusKm)) {
    return c.json({ message: "Invalid coordinates or radius" }, 400);
  }

  try {
    const events = await (prisma as any).event.findMany({
      where: {
        startDate: { gte: new Date() },
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    const nearby = events
      .map((event: any) => {
        const distanceKm = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          event.latitude,
          event.longitude,
        );
        return { ...event, distanceKm };
      })
      .filter((event: any) => event.distanceKm <= radiusKm)
      .sort((a: any, b: any) => a.startDate.getTime() - b.startDate.getTime())
      .map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        latitude: event.latitude,
        longitude: event.longitude,
        startDate: event.startDate,
        endDate: event.endDate,
        imageUrl: event.imageUrl,
        category: event.category,
        distanceKm: Number(event.distanceKm.toFixed(1)),
        host: event.host,
      }));

    return c.json({ data: nearby });
  } catch (error) {
    console.error("Error fetching nearby events:", error);
    return c.json({ message: "Failed to fetch nearby events" }, 500);
  }
});

eventsRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  try {
    const event = await (prisma as any).event.findUnique({
      where: { id },
      select: { id: true, hostUserId: true },
    });

    if (!event) {
      return c.json({ message: "Event not found" }, 404);
    }

    if (event.hostUserId !== user.id) {
      return c.json({ message: "Forbidden" }, 403);
    }

    await (prisma as any).event.delete({ where: { id } });
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return c.json({ message: "Failed to delete event" }, 500);
  }
});

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default eventsRoutes;
