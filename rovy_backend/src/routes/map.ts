import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const mapRoutes = new Hono<{ Variables: { user: any } }>();

mapRoutes.use("*", authMiddleware);

mapRoutes.post("/location", async (c) => {
  const user = c.get("user");
  try {
    const body = await c.req.json();
    const { latitude, longitude } = body ?? {};
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return c.json({ message: "Invalid coordinates" }, 400);
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLatitude: lat,
        lastLongitude: lon,
        lastLocationAt: new Date(),
      },
    });
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating location:", error);
    return c.json({ message: "Failed to update location" }, 500);
  }
});

mapRoutes.get("/nearby", async (c) => {
  const lat = c.req.query("lat");
  const lon = c.req.query("lon");
  const radiusKmRaw = c.req.query("radiusKm");
  const includeRaw = c.req.query("include") ?? "EVENTS,PEOPLE,WORK,SAFETY";

  if (!lat || !lon) {
    return c.json({ message: "Missing lat or lon" }, 400);
  }

  const latitude = Number(lat);
  const longitude = Number(lon);
  const radiusKm = radiusKmRaw ? Number(radiusKmRaw) : 25;

  if (Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(radiusKm)) {
    return c.json({ message: "Invalid coordinates or radius" }, 400);
  }

  const include = includeRaw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  try {
    const [events, people, work, safety] = await Promise.all([
      include.includes("EVENTS")
        ? (prisma as any).event.findMany({
            where: { startDate: { gte: new Date() } },
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
          })
        : Promise.resolve([]),
      include.includes("PEOPLE")
        ? prisma.user.findMany({
            where: {
              id: { not: c.get("user").id },
              onboardingCompleted: true,
              lastLatitude: { not: null },
              lastLongitude: { not: null },
            },
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              vehicleType: true,
              lastLatitude: true,
              lastLongitude: true,
            },
          })
        : Promise.resolve([]),
      include.includes("WORK")
        ? prisma.garagePro.findMany({
            where: {
              latitude: { not: null },
              longitude: { not: null },
            },
            select: {
              id: true,
              name: true,
              title: true,
              specialty: true,
              rate: true,
              latitude: true,
              longitude: true,
            },
          })
        : Promise.resolve([]),
      include.includes("SAFETY")
        ? (prisma as any).roadNews.findMany({
            where: {
              latitude: { not: null },
              longitude: { not: null },
            },
            orderBy: { timestamp: "desc" },
            take: 50,
          })
        : Promise.resolve([]),
    ]);

    const nearbyEvents = (events as any[])
      .map((event) => {
        const distanceKm = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          event.latitude,
          event.longitude,
        );
        return { ...event, distanceKm };
      })
      .filter((event) => event.distanceKm <= radiusKm)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .map((event) => ({
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

    const nearbyPeople = (people as any[])
      .map((person) => {
        const distanceKm = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          person.lastLatitude,
          person.lastLongitude,
        );
        return { ...person, distanceKm };
      })
      .filter((person) => person.distanceKm <= radiusKm)
      .map((person) => ({
        id: person.id,
        name: person.name || person.username || "Nomad",
        username: person.username,
        avatarUrl: person.avatarUrl,
        vehicleType: person.vehicleType,
        latitude: person.lastLatitude,
        longitude: person.lastLongitude,
        distanceKm: Number(person.distanceKm.toFixed(1)),
      }));

    const nearbyWork = (work as any[])
      .map((item) => {
        const distanceKm = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          item.latitude,
          item.longitude,
        );
        return { ...item, distanceKm };
      })
      .filter((item) => item.distanceKm <= radiusKm)
      .map((item) => ({
        id: item.id,
        name: item.name,
        title: item.title,
        specialty: item.specialty,
        rate: item.rate,
        latitude: item.latitude,
        longitude: item.longitude,
        distanceKm: Number(item.distanceKm.toFixed(1)),
      }));

    const nearbySafety = (safety as any[])
      .map((item) => {
        const distanceKm = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          item.latitude,
          item.longitude,
        );
        return { ...item, distanceKm };
      })
      .filter((item) => item.distanceKm <= radiusKm)
      .map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        latitude: item.latitude,
        longitude: item.longitude,
        timestamp: item.timestamp,
        distanceKm: Number(item.distanceKm.toFixed(1)),
      }));

    return c.json({
      data: {
        events: nearbyEvents,
        people: nearbyPeople,
        work: nearbyWork,
        safety: nearbySafety,
      },
    });
  } catch (error) {
    console.error("Error fetching map data:", error);
    return c.json({ message: "Failed to fetch map data" }, 500);
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

export default mapRoutes;
