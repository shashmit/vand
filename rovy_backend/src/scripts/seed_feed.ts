import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding feed data...");

  // Clear existing news
  await prisma.roadNews.deleteMany();

  const newsItems = [
    {
      type: "alert",
      title: "Road Closure on I-15",
      description: "All lanes closed due to sandstorm. Detour via Hwy 127.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
    },
    {
      type: "traffic",
      title: "Heavy Traffic near Barstow",
      description: "Expect delays of 20-30 minutes due to construction work.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    },
    {
      type: "info",
      title: "New campsite discovered",
      description:
        "A hidden gem near Red Rock Canyon has been added by a community member. Check the map for details.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      type: "info",
      title: "Starlink visibility high tonight",
      description:
        "Clear skies expected in the Mojave desert. Perfect for stargazing and connectivity.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
    {
      type: "alert",
      title: "High Wind Warning",
      description: "Gusts up to 40mph expected in the valley. Secure your awnings!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ];

  for (const item of newsItems) {
    await prisma.roadNews.create({
      data: item,
    });
  }

  console.log("Road News seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
