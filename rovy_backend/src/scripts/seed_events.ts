import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding events data...");

  // Clear existing events
  await prisma.pinnedEvent.deleteMany();
  await prisma.event.deleteMany();

  // Reference Location: Joshua Tree
  // Lat: 33.8734, Long: -115.9010

  const events = [
    {
      title: "Desert Stargazing Party",
      description: "Join us for a night of astronomy and campfire stories under the Milky Way.",
      location: "Joshua Tree South Entrance",
      latitude: 33.8734 + 0.01, // ~1.1km away
      longitude: -115.901 + 0.01,
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
      imageUrl:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800",
      category: "social",
    },
    {
      title: "Van Life Meetup: Coffee & Rigs",
      description: "Monthly meetup at the local roastery. Bring your rig!",
      location: "Joshua Tree Coffee Co.",
      latitude: 33.8734 - 0.02, // ~2.2km away
      longitude: -115.901 - 0.005,
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
      imageUrl:
        "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800",
      category: "meetup",
    },
    {
      title: "Farmers Market",
      description: "Fresh produce and local crafts.",
      location: "Downtown Joshua Tree",
      latitude: 33.8734 + 0.05, // ~5.5km away (Maybe slightly outside radius depending on calc)
      longitude: -115.901,
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 48), // 2 days from now
      imageUrl:
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800",
      category: "market",
    },
  ];

  for (const evt of events) {
    await prisma.event.create({
      data: evt,
    });
  }

  console.log("Events seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
