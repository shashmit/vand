import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import type { User } from "@supabase/supabase-js";

type Variables = {
  user: User;
};

const profileRoutes = new Hono<{ Variables: Variables }>();

profileRoutes.use("*", authMiddleware);

profileRoutes.get("/me", async (c) => {
  const user = c.get("user");

  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        coPilotProfile: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!profile) {
      return c.json({ message: "Profile not found" }, 404);
    }

    return c.json({ data: profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return c.json({ message: "Failed to fetch profile" }, 500);
  }
});

profileRoutes.post("/onboarding/complete", async (c) => {
  const user = c.get("user");

  try {
    let body;
    try {
      body = await c.req.json();
    } catch (e) {
      body = {};
    }

    const {
      name,
      age,
      gender,
      vehicleType,
      buildStatus,
      avatarUrl,
      rigPhotoUrl,
      username,
      enableCoPilot,
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        name,
        age,
        gender,
        vehicleType,
        buildStatus,
        avatarUrl,
        rigPhotoUrl,
        onboardingCompleted: true,
      },
    });

    if (enableCoPilot) {
      await prisma.coPilotProfile.upsert({
        where: { userId: user.id },
        update: { isActive: true },
        create: {
          userId: user.id,
          isActive: true,
          identity: gender || "Male",
          seeking: "Everyone", // Default
          relationshipStyle: "Monogamous", // Default
          tagline: "Just joined Rovy!",
          photos: avatarUrl ? [avatarUrl] : [],
          rigPhotos: rigPhotoUrl ? [rigPhotoUrl] : [],
        },
      });
    }

    return c.json({ data: updatedUser });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return c.json({ message: "Failed to update profile" }, 500);
  }
});

export default profileRoutes;
