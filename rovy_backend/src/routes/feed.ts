import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const feed = new Hono<{ Variables: { user: any } }>();

feed.use("*", authMiddleware);

feed.get("/", async (c) => {
  const user = c.get("user");
  try {
    const weather = {
      temperature: "72°",
      condition: "Partly Cloudy",
      location: "Mojave Desert, CA",
      alert: "High Wind Warning",
    };

    const [newsItems, caravanProfiles, events] = await Promise.all([
      (prisma as any).roadNews.findMany({
        orderBy: { timestamp: "desc" },
        take: 10,
      }),
      prisma.user.findMany({
        where: {
          id: { not: user.id },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          vehicleType: true,
        },
      }),
      (prisma as any).event.findMany({
        where: {
          startDate: { gte: new Date() },
        },
        include: {
          pins: {
            where: { userId: user.id },
          },
        },
      }),
    ]);

    const news = newsItems.map((item: any) => ({
      id: item.id,
      type: item.type as "alert" | "traffic" | "info",
      title: item.title,
      description: item.description,
      timestamp: formatTimestamp(item.timestamp),
    }));

    const caravans = caravanProfiles.map((u: any) => ({
      id: u.id,
      name: u.name || u.username || "Nomad",
      avatarUrl:
        u.avatarUrl ||
        "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=200",
      distance: "Nearby",
    }));

    const travelersList = await prisma.user.findMany({
      where: {
        id: { notIn: [user.id, ...caravanProfiles.map((c) => c.id)] },
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        vehicleType: true,
      },
    });

    const travelers = travelersList.map((u: any) => ({
      id: u.id,
      name: u.name || u.username || "Traveler",
      avatarUrl:
        u.avatarUrl ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200",
      distance: "Heading to Joshua Tree",
    }));

    const userLat = 33.8734;
    const userLon = -115.901;

    const nearbyEvents = events
      .map((event: any) => {
        const dist = getDistanceFromLatLonInKm(userLat, userLon, event.latitude, event.longitude);
        return { ...event, distanceVal: dist };
      })
      .filter((e: any) => e.distanceVal <= 10)
      .sort((a: any, b: any) => a.startDate.getTime() - b.startDate.getTime())
      .map((e: any) => ({
        id: e.id,
        title: e.title,
        location: e.location,
        distance: `${e.distanceVal.toFixed(1)} km away`,
        date: formatDate(e.startDate),
        imageUrl: e.imageUrl || undefined,
        isPinned: e.pins.length > 0,
      }));

    return c.json({
      weather,
      news,
      caravans,
      travelers,
      nearbyEvents,
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return c.json({ message: "Failed to fetch feed" }, 500);
  }
});

feed.post("/events/:id/pin", async (c) => {
  const eventId = c.req.param("id");
  const user = c.get("user");

  try {
    await (prisma as any).pinnedEvent.upsert({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: eventId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        eventId: eventId,
      },
    });
  } catch (e) {
    console.error("Error pinning event:", e);
    return c.json({ message: "Failed to pin event" }, 500);
  }

  return c.json({ success: true });
});

feed.delete("/events/:id/pin", async (c) => {
  const eventId = c.req.param("id");
  const user = c.get("user");

  try {
    await (prisma as any).pinnedEvent.deleteMany({
      where: {
        userId: user.id,
        eventId: eventId,
      },
    });
  } catch (e) {
    console.error("Error unpinning event:", e);
    return c.json({ message: "Failed to unpin event" }, 500);
  }

  return c.json({ success: true });
});

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function formatDate(date: Date) {
  // Simple format: "Fri, Oct 20 • 6:00 PM"
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default feed;
