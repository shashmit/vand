import { prisma } from "../lib/prisma";

async function main() {
  // Find the first user or a specific one
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log("No users found. Please sign up in the app first.");
    return;
  }

  console.log(`Found user: ${user.email} (${user.id})`);
  console.log(`Enabling Co-Pilot...`);

  await prisma.coPilotProfile.upsert({
    where: { userId: user.id },
    update: { isActive: true },
    create: {
      userId: user.id,
      isActive: true,
      identity: "Male",
      seeking: "Everyone",
      relationshipStyle: "Monogamous",
      tagline: "Seeded via script",
      photos: [
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
      ],
      rigPhotos: [],
    },
  });

  console.log("Co-Pilot enabled successfully.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
