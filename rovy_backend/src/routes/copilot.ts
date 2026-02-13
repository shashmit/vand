import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const copilot = new Hono<{ Variables: { user: any } }>();

copilot.use("*", authMiddleware);

const isMutualMatch = async (userId: string, otherId: string) => {
  const [myLike, otherLike] = await Promise.all([
    prisma.swipe.findUnique({
      where: {
        swiperId_targetId: {
          swiperId: userId,
          targetId: otherId,
        },
      },
    }),
    prisma.swipe.findUnique({
      where: {
        swiperId_targetId: {
          swiperId: otherId,
          targetId: userId,
        },
      },
    }),
  ]);

  return myLike?.action === "LIKE" && otherLike?.action === "LIKE";
};

// Get my profile
copilot.get("/me", async (c) => {
  const user = c.get("user");
  const profile = await prisma.coPilotProfile.findUnique({
    where: { userId: user.id },
  });
  return c.json(profile || null);
});

// Create/Update profile
copilot.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const {
    isActive,
    identity,
    seeking,
    relationshipStyle,
    seatBeltRule,
    tagline,
    photos,
    rigPhotos,
    prompts,
  } = body;

  const profile = await prisma.coPilotProfile.upsert({
    where: { userId: user.id },
    update: {
      isActive,
      identity,
      seeking,
      relationshipStyle,
      seatBeltRule,
      tagline,
      photos,
      rigPhotos,
      prompts,
    },
    create: {
      userId: user.id,
      isActive,
      identity: identity || "Male",
      seeking: seeking || "Women",
      relationshipStyle: relationshipStyle || "Monogamous",
      seatBeltRule: seatBeltRule || false,
      tagline,
      photos,
      rigPhotos,
      prompts,
    },
  });

  return c.json(profile);
});

// Feed
copilot.get("/feed", async (c) => {
  const user = c.get("user");

  // Basic feed: exclude self, swiped users, and messaged users
  // In a real app, we'd add geo-querying here
  const profiles = await prisma.coPilotProfile.findMany({
    where: {
      userId: {
        not: user.id,
      },
      isActive: true,
      user: {
        AND: [
          {
            swipesReceived: {
              none: { swiperId: user.id },
            },
          },
          {
            messagesReceived: {
              none: { senderId: user.id },
            },
          },
        ],
      },
    },
    include: {
      user: {
        select: {
          username: true,
          name: true,
          age: true,
          vehicleType: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Transform for frontend
  const feed = profiles.map((p) => ({
    id: p.userId,
    name: p.user.name || p.user.username || "Nomad",
    age: p.user.age,
    vehicle: p.user.vehicleType || "Van",
    distance: "Nearby", // Mock
    image: p.photos[0] || p.user.avatarUrl || "",
    rigImage: p.rigPhotos[0] || "",
    photos: p.photos,
    vibe: p.tagline,
    // Limited data for card view
  }));

  return c.json(feed);
});

// Swipe Action
copilot.post("/swipe", async (c) => {
  const user = c.get("user");
  const { targetId, action } = await c.req.json(); // action: 'LIKE' | 'PASS'

  if (!targetId || !["LIKE", "PASS"].includes(action)) {
    return c.json({ error: "Invalid request" }, 400);
  }

  // Check if already swiped to avoid duplicates
  const existing = await prisma.swipe.findUnique({
    where: {
      swiperId_targetId: {
        swiperId: user.id,
        targetId,
      },
    },
  });

  if (existing) {
    return c.json({ message: "Already swiped" });
  }

  await prisma.swipe.create({
    data: {
      swiperId: user.id,
      targetId,
      action,
    },
  });

  // Check for match if LIKE
  let isMatch = false;
  if (action === "LIKE") {
    const otherSwipe = await prisma.swipe.findUnique({
      where: {
        swiperId_targetId: {
          swiperId: targetId,
          targetId: user.id,
        },
      },
    });
    if (otherSwipe && otherSwipe.action === "LIKE") {
      isMatch = true;
    }
  }

  return c.json({ success: true, isMatch });
});

// Send Message
copilot.post("/message", async (c) => {
  const user = c.get("user");
  const { targetId, content } = await c.req.json();

  if (!targetId || !content) {
    return c.json({ error: "Missing fields" }, 400);
  }

  const matched = await isMutualMatch(user.id, targetId);
  if (!matched) {
    return c.json({ error: "Not matched" }, 403);
  }

  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId: targetId,
      content,
    },
  });

  return c.json({ success: true, message });
});

// Get Matches (Mutual Likes)
copilot.get("/matches", async (c) => {
  const user = c.get("user");

  // Find users I liked
  const myLikes = await prisma.swipe.findMany({
    where: { swiperId: user.id, action: "LIKE" },
    select: { targetId: true },
  });
  const myLikeIds = myLikes.map((l) => l.targetId);

  // Find users who liked me back
  const matches = await prisma.swipe.findMany({
    where: {
      swiperId: { in: myLikeIds },
      targetId: user.id,
      action: "LIKE",
    },
    include: {
      swiper: {
        // The other user
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return c.json(
    matches.map((m) => ({
      id: m.swiper.id,
      name: m.swiper.name || m.swiper.username,
      avatarUrl: m.swiper.avatarUrl,
      matchedAt: m.createdAt,
    })),
  );
});

// Get Messages
copilot.get("/messages/:userId", async (c) => {
  const user = c.get("user");
  const otherId = c.req.param("userId");

  const matched = await isMutualMatch(user.id, otherId);
  if (!matched) {
    return c.json({ error: "Not matched" }, 403);
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: otherId },
        { senderId: otherId, receiverId: user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return c.json(messages);
});

copilot.get("/inbox", async (c) => {
  const user = c.get("user");

  const messages = await prisma.message.findMany({
    where: { receiverId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  const seen = new Set<string>();
  const inbox = [];

  for (const message of messages) {
    if (seen.has(message.senderId)) continue;
    seen.add(message.senderId);
    inbox.push({
      senderId: message.senderId,
      name: message.sender.name || message.sender.username || "Nomad",
      avatarUrl: message.sender.avatarUrl,
      lastMessage: message.content,
      sentAt: message.createdAt,
      messageId: message.id,
    });
  }

  return c.json(inbox);
});

copilot.get("/chats", async (c) => {
  const user = c.get("user");

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, username: true, avatarUrl: true } },
      receiver: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  });

  const chatMap = new Map<string, any>();

  for (const message of messages) {
    const isSender = message.senderId === user.id;
    const other = isSender ? message.receiver : message.sender;
    if (!chatMap.has(other.id)) {
      chatMap.set(other.id, {
        id: other.id,
        name: other.name || other.username || "Nomad",
        avatarUrl: other.avatarUrl,
        lastMessage: message.content,
        sentAt: message.createdAt,
        type: "message",
      });
    }
  }

  const myLikes = await prisma.swipe.findMany({
    where: { swiperId: user.id, action: "LIKE" },
    select: { targetId: true },
  });
  const myLikeIds = myLikes.map((l) => l.targetId);

  const matches = await prisma.swipe.findMany({
    where: {
      swiperId: { in: myLikeIds },
      targetId: user.id,
      action: "LIKE",
    },
    include: {
      swiper: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  for (const match of matches) {
    if (!chatMap.has(match.swiper.id)) {
      chatMap.set(match.swiper.id, {
        id: match.swiper.id,
        name: match.swiper.name || match.swiper.username || "Nomad",
        avatarUrl: match.swiper.avatarUrl,
        lastMessage: "Start a message",
        sentAt: match.createdAt,
        type: "match",
      });
    }
  }

  const chats = Array.from(chatMap.values()).sort((a, b) => {
    return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
  });

  return c.json(chats);
});

// Deep Dive (Detail)
copilot.get("/:id", async (c) => {
  const id = c.req.param("id");

  const profile = await prisma.coPilotProfile.findUnique({
    where: { userId: id },
    include: {
      user: {
        select: {
          username: true,
          age: true,
          vehicleType: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!profile) return c.json({ error: "Not found" }, 404);

  return c.json({
    id: profile.userId,
    name: profile.user.username || "Nomad",
    age: profile.user.age,
    vehicle: profile.user.vehicleType || "Van",
    distance: "Nearby",
    image: profile.photos[0] || profile.user.avatarUrl || "",
    rigImage: profile.rigPhotos[0] || "",
    photos: profile.photos,
    rigPhotos: profile.rigPhotos,
    vibe: profile.tagline,
    prompts: profile.prompts, // Include full details
    identity: profile.identity,
    relationshipStyle: profile.relationshipStyle,
    seeking: profile.seeking,
  });
});

export default copilot;
