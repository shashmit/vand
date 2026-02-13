import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import type { User } from "@supabase/supabase-js";

type Variables = {
  user: User;
};

const buildRoutes = new Hono<{ Variables: Variables }>();

// GET /builds/me - Get my builds (Protected)
// Must be defined BEFORE /:id to avoid conflict
buildRoutes.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");

  try {
    const builds = await prisma.build.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return c.json({ data: builds });
  } catch (error) {
    console.error("Error fetching my builds:", error);
    return c.json({ message: "Failed to fetch my builds" }, 500);
  }
});

// GET /builds - Public access to view all builds
buildRoutes.get("/", async (c) => {
  const excludeUserId = c.req.query("excludeUserId");

  try {
    const where = excludeUserId ? { userId: { not: excludeUserId } } : {};

    const builds = await prisma.build.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({ data: builds });
  } catch (error) {
    console.error("Error fetching builds:", error);
    return c.json({ message: "Failed to fetch builds" }, 500);
  }
});

// GET /builds/:id - Public access to view a single build
buildRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const build = await prisma.build.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            name: true,
            avatarUrl: true,
            bio: true,
            vehicleType: true,
          },
        },
      },
    });

    if (!build) {
      return c.json({ message: "Build not found" }, 404);
    }

    return c.json({ data: build });
  } catch (error) {
    console.error("Error fetching build:", error);
    return c.json({ message: "Failed to fetch build" }, 500);
  }
});

// Protected routes below
buildRoutes.use("*", authMiddleware);

// POST /builds - Create a new build
buildRoutes.post("/", async (c) => {
  const user = c.get("user");

  try {
    const body = await c.req.json();
    const { name, model, imageUrl, description, tags } = body;

    const build = await prisma.build.create({
      data: {
        name,
        model,
        imageUrl,
        description,
        tags: tags || [],
        userId: user.id,
      },
    });

    return c.json({ data: build }, 201);
  } catch (error) {
    console.error("Error creating build:", error);
    return c.json({ message: "Failed to create build" }, 500);
  }
});

export default buildRoutes;
