import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { supabaseAdmin } from "../lib/supabase";

const authRoutes = new Hono();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  inviteCode: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRoutes.post("/signin", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return c.json({ message: error.message }, 401);
  }

  if (!data.user || !data.session) {
    return c.json({ message: "Login failed" }, 401);
  }

  // Fetch user profile from Prisma
  const userProfile = await prisma.user.findUnique({
    where: { id: data.user.id },
    include: {
      coPilotProfile: {
        select: {
          isActive: true,
        },
      },
    },
  });

  if (!userProfile) {
    return c.json({ message: "User profile not found" }, 404);
  }

  return c.json({
    data: {
      user: userProfile,
      session: data.session,
      profile: {
        id: userProfile.id,
        username: userProfile.username,
        avatarUrl: userProfile.avatarUrl,
        bio: userProfile.bio,
        onboardingCompleted: userProfile.onboardingCompleted,
      },
    },
  });
});

authRoutes.post("/signup", zValidator("json", signupSchema), async (c) => {
  const { email, password, inviteCode } = c.req.valid("json");

  try {
    // 1. Verify invite code
    const validInvite = await prisma.inviteCode.findUnique({
      where: { code: inviteCode },
    });

    if (!validInvite) {
      return c.json({ message: "Invalid invite code" }, 400);
    }

    if (validInvite.isUsed) {
      return c.json({ message: "Invite code already used" }, 400);
    }

    // 2. Create user in Supabase Auth (auto confirm email since they have invite code)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return c.json({ message: createError.message }, 400);
    }

    if (!userData.user) {
      return c.json({ message: "Failed to create user" }, 500);
    }

    const userId = userData.user.id;

    // 3. Create user in Prisma and mark invite code as used (in transaction)
    try {
      const [newUser] = await prisma.$transaction([
        prisma.user.create({
          data: {
            id: userId,
            email: email,
          },
        }),
        prisma.inviteCode.update({
          where: { id: validInvite.id },
          data: {
            isUsed: true,
            usedBy: userId,
          },
        }),
      ]);

      // 5. Log the user in to get a session
      const { data: sessionData, error: sessionError } =
        await supabaseAdmin.auth.signInWithPassword({
          email,
          password,
        });

      if (sessionError || !sessionData.session) {
        // If login fails (shouldn't happen if create succeeded), return success but no session
        // Frontend might handle this as "check email" or "login manually"
        // But since we auto-confirmed, login SHOULD work.
        console.error("Login failed after signup:", sessionError);
        return c.json({ message: "User created, please login." }, 201);
      }

      // 6. Return response matching AuthResponse interface
      return c.json({
        data: {
          user: newUser,
          session: sessionData.session,
          profile: {
            id: newUser.id,
            username: newUser.username,
            avatarUrl: newUser.avatarUrl,
            bio: newUser.bio,
            onboardingCompleted: newUser.onboardingCompleted,
          },
        },
      });
    } catch (dbError) {
      // Rollback supabase user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.error("DB Error:", dbError);
      return c.json({ message: "Failed to create user profile" }, 500);
    }
  } catch (error: any) {
    console.error("Signup error:", error);
    return c.json({ message: error.message || "Internal server error" }, 500);
  }
});

export default authRoutes;
