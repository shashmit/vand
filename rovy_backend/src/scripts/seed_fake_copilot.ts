import { prisma } from "../lib/prisma";

async function main() {
  const fakeId = crypto.randomUUID();
  const fakeEmail = `fake_copilot_${Date.now()}@example.com`;

  console.log(`Creating fake user with ID: ${fakeId}`);

  // Create User
  const user = await prisma.user.create({
    data: {
      id: fakeId,
      email: fakeEmail,
      username: `nomad_${Math.floor(Math.random() * 10000)}`,
      name: "Alex Wanderer",
      age: 28,
      gender: "Non-Binary",
      vehicleType: "Sprinter Van",
      buildStatus: "Complete",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      bio: "Living the van life dream! Seeking adventure and good vibes.",
      onboardingCompleted: true,

      // Create CoPilot Profile immediately
      coPilotProfile: {
        create: {
          isActive: true,
          identity: "Non-Binary",
          seeking: "Everyone",
          relationshipStyle: "Monogamous",
          tagline: "Chasing sunsets and wifi signals",
          seatBeltRule: true,
          photos: [
            "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
          ],
          rigPhotos: [
            "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
          ],
          prompts: [
            { question: "My golden rule", answer: "Leave no trace" },
            { question: "I bet you can't", answer: "Beat me at Mario Kart" },
          ],
        },
      },
    },
  });

  console.log(`Created fake user: ${user.name} (${user.email})`);
  console.log("Co-Pilot profile created successfully.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
