import { prisma } from "../lib/prisma";

const FAKE_USERS = [
  {
    name: "Sarah Chen",
    username: "sarah_vanlife",
    age: 29,
    gender: "Female",
    vehicle: "Ford Transit",
    bio: "Digital nomad & UI Designer. Exploring the PNW.",
    tagline: "Coffee, Code, and Campfires",
    photos: [
      "https://images.unsplash.com/photo-1517154596051-c636f31f9076?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    ],
    rigPhotos: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Mike Ross",
    username: "mike_climbs",
    age: 31,
    gender: "Male",
    vehicle: "Skoolie",
    bio: "Converting a bus into a tiny home. Climber.",
    tagline: "Always looking for the next crag",
    photos: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1bcfb0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    ],
    rigPhotos: [
      "https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Emma & Tom",
    username: "et_travels",
    age: 27,
    gender: "Couple",
    vehicle: "Sprinter 170",
    bio: "Traveling couple with a golden retriever.",
    tagline: "Two humans and a dog",
    photos: [
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
    ],
    rigPhotos: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9e38f4?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "David Kim",
    username: "dave_outdoors",
    age: 34,
    gender: "Male",
    vehicle: "Truck Camper",
    bio: "Photographer chasing light.",
    tagline: "Adventure is out there",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    ],
    rigPhotos: [
      "https://images.unsplash.com/photo-1519003300449-42442392a353?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Jessica Lee",
    username: "jess_nomad",
    age: 25,
    gender: "Female",
    vehicle: "Promaster",
    bio: "Solo female traveler. Yoga teacher.",
    tagline: "Namaste in the van",
    photos: [
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
    ],
    rigPhotos: [
      "https://images.unsplash.com/photo-1495562569060-2eec283878fa?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

async function main() {
  console.log("Seeding fake users...");

  for (const fake of FAKE_USERS) {
    const fakeId = crypto.randomUUID();
    const fakeEmail = `${fake.username}_${Date.now()}@example.com`;

    const user = await prisma.user.create({
      data: {
        id: fakeId,
        email: fakeEmail,
        username: fake.username + Math.floor(Math.random() * 1000),
        name: fake.name,
        age: fake.age,
        gender: fake.gender,
        vehicleType: fake.vehicle,
        buildStatus: "Complete",
        avatarUrl: fake.photos[0],
        bio: fake.bio,
        onboardingCompleted: true,

        coPilotProfile: {
          create: {
            isActive: true,
            identity: fake.gender,
            seeking: "Everyone",
            relationshipStyle: "Monogamous",
            tagline: fake.tagline,
            seatBeltRule: Math.random() > 0.5,
            photos: fake.photos,
            rigPhotos: fake.rigPhotos,
            prompts: [
              { question: "My golden rule", answer: "Leave no trace" },
              { question: "On Sunday mornings I am", answer: "Making pancakes" },
            ],
          },
        },
      },
    });
    console.log(`Created ${fake.name}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
