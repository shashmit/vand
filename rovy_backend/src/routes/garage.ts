import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import type { User } from "@supabase/supabase-js";

type Variables = {
  user: User;
};

const garageRoutes = new Hono<{ Variables: Variables }>();

// GET /garage/me - Get my garage profile (Protected)
// Must be defined BEFORE /:id
garageRoutes.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");

  try {
    const pro = await prisma.garagePro.findUnique({
      where: { userId: user.id },
    });

    if (!pro) {
      return c.json({ message: "Garage profile not found" }, 404);
    }

    return c.json({ data: pro });
  } catch (error) {
    console.error("Error fetching my garage profile:", error);
    return c.json({ message: "Failed to fetch my garage profile" }, 500);
  }
});

// GET /garage - Public access to view all garage pros (with optional category filter)
garageRoutes.get("/", async (c) => {
  const category = c.req.query("category");
  const excludeUserId = c.req.query("excludeUserId");

  try {
    const where: any = {};
    if (category && category !== "ALL") {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }
    if (excludeUserId) {
      where.userId = { not: excludeUserId };
    }

    const pros = await prisma.garagePro.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return c.json({ data: pros });
  } catch (error) {
    console.error("Error fetching garage pros:", error);
    return c.json({ message: "Failed to fetch garage pros" }, 500);
  }
});

// GET /garage/:id - Public access to view a single pro
garageRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const pro = await prisma.garagePro.findUnique({
      where: { id },
    });

    if (!pro) {
      return c.json({ message: "Pro not found" }, 404);
    }

    return c.json({ data: pro });
  } catch (error) {
    console.error("Error fetching pro:", error);
    return c.json({ message: "Failed to fetch pro" }, 500);
  }
});

// Protected routes below
garageRoutes.use("*", authMiddleware);

// POST /garage - Create a new pro (Protected)
garageRoutes.post("/", async (c) => {
  const user = c.get("user");

  try {
    const body = await c.req.json();
    const {
      name,
      title,
      specialty,
      rate,
      category,
      imageUrl,
      phoneNumber,
      email,
      website,
      location,
    } = body;

    // Check if user already has a profile
    const existing = await prisma.garagePro.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return c.json({ message: "User already has a garage profile" }, 400);
    }

    const pro = await prisma.garagePro.create({
      data: {
        name,
        title,
        specialty,
        rate,
        verified: false, // Default to false
        category,
        imageUrl,
        phoneNumber,
        email,
        website,
        location,
        userId: user.id,
      },
    });

    return c.json({ data: pro }, 201);
  } catch (error) {
    console.error("Error creating pro:", error);
    return c.json({ message: "Failed to create pro" }, 500);
  }
});

// PUT /garage/:id - Update existing pro (Protected)
garageRoutes.put("/:id", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  try {
    const body = await c.req.json();

    // Verify ownership
    const existing = await prisma.garagePro.findUnique({
      where: { id },
    });

    if (!existing) {
      return c.json({ message: "Profile not found" }, 404);
    }

    if (existing.userId !== user.id) {
      return c.json({ message: "Unauthorized to update this profile" }, 403);
    }

    const pro = await prisma.garagePro.update({
      where: { id },
      data: {
        name: body.name,
        title: body.title,
        specialty: body.specialty,
        rate: body.rate,
        category: body.category,
        imageUrl: body.imageUrl,
        phoneNumber: body.phoneNumber,
        email: body.email,
        website: body.website,
        location: body.location,
      },
    });

    return c.json({ data: pro });
  } catch (error) {
    console.error("Error updating pro:", error);
    return c.json({ message: "Failed to update pro" }, 500);
  }
});

export default garageRoutes;
