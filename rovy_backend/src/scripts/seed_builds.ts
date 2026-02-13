import { prisma } from "../lib/prisma";

async function main() {
  // 1. Find a user to attach builds to
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error("No user found! Please create a user first (e.g., sign up in the app).");
    // If no user, let's create a dummy one for testing purposes if safe, but better to warn.
    // Actually, let's create a dummy user if none exists to ensure the script works.
    console.log("Creating a dummy user...");
    const newUser = await prisma.user.create({
      data: {
        id: "dummy-user-" + Date.now(),
        email: "test@example.com",
        name: "Test User",
        username: "testuser",
        avatarUrl: "https://github.com/shadcn.png",
      },
    });
    console.log(`Created dummy user: ${newUser.id}`);
    await seedBuilds(newUser.id);
    return;
  }

  console.log(`Seeding builds for user: ${user.email} (${user.id})`);
  await seedBuilds(user.id);
}

async function seedBuilds(userId: string) {
  // 2. Create dummy builds
  const builds = [
    {
      name: "The Nomad Sprinter",
      model: "Mercedes-Benz Sprinter 144",
      description: "My cozy home on wheels for weekend getaways.",
      imageUrl:
        "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?q=80&w=2948&auto=format&fit=crop",
      tags: ["Off-grid", "4x4", "Cozy"],
      userId: userId,
    },
    {
      name: "Desert Roamer",
      model: "Ford Transit AWD",
      description: "Built for the desert heat and cold nights.",
      imageUrl:
        "https://images.unsplash.com/photo-1626388484968-3e580e047710?q=80&w=2940&auto=format&fit=crop",
      tags: ["Solar", "AWD", "Minimalist"],
      userId: userId,
    },
    {
      name: "Mountain Beast",
      model: "Ram Promaster",
      description: "High roof beast for ski trips.",
      imageUrl:
        "https://images.unsplash.com/photo-1699516625807-623c214088a2?q=80&w=2832&auto=format&fit=crop",
      tags: ["Insulated", "Heater", "Storage"],
      userId: userId,
    },
  ];

  for (const build of builds) {
    const created = await prisma.build.create({
      data: build,
    });
    console.log(`Created build: ${created.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
