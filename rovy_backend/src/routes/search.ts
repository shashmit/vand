import { Hono } from "hono";
import { prisma } from "../lib/prisma";

const searchRoutes = new Hono();

searchRoutes.get("/", async (c) => {
  const query = c.req.query("q");

  if (!query || query.trim() === "") {
    return c.json({ data: [] });
  }

  const normalizedQuery = query.trim();

  try {
    // 1. Search Users (CoPilot Profiles)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: normalizedQuery, mode: "insensitive" } },
          { name: { contains: normalizedQuery, mode: "insensitive" } },
        ],
        onboardingCompleted: true,
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
      },
      take: 5,
    });

    // 2. Search Builds
    const builds = await prisma.build.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: "insensitive" } },
          { model: { contains: normalizedQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        model: true,
        imageUrl: true,
      },
      take: 5,
    });

    // 3. Search Garage Pros
    const garagePros = await prisma.garagePro.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: "insensitive" } },
          { title: { contains: normalizedQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        title: true,
        imageUrl: true,
      },
      take: 5,
    });

    // Transform to unified format matching frontend expectations
    const formattedUsers = users.map((u) => ({
      id: u.id,
      type: "user",
      title: u.name || u.username || "Nomad",
      subtitle: u.username ? `@${u.username}` : "",
      image: u.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    }));

    const formattedBuilds = builds.map((b) => ({
      id: b.id,
      type: "build",
      title: b.name,
      subtitle: b.model,
      image: b.imageUrl || "https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=200",
    }));

    const formattedGarage = garagePros.map((g) => ({
      id: g.id,
      type: "garage",
      title: g.name,
      subtitle: g.title,
      image: g.imageUrl || "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200",
    }));

    const results = [...formattedUsers, ...formattedBuilds, ...formattedGarage];

    return c.json({ data: results });
  } catch (error) {
    console.error("Search error:", error);
    return c.json({ message: "Search failed" }, 500);
  }
});

export default searchRoutes;
