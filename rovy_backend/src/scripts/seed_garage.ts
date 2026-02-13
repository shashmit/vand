import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding Garage Pros...");

  // Clear existing entries to avoid duplicates
  await prisma.garagePro.deleteMany({});

  const pros = [
    // SOLAR
    {
      name: "Sparky Solutions",
      title: "Certified Electrician",
      specialty: "Lithium Install Specialist",
      rate: "$60/hr",
      verified: true,
      category: "SOLAR",
      imageUrl:
        "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2940&auto=format&fit=crop",
      phoneNumber: "555-0101",
      email: "contact@sparkysolutions.com",
      website: "www.sparkysolutions.com",
      location: "San Francisco, CA",
    },
    {
      name: "Sun Power",
      title: "Solar",
      specialty: "Panel Installation",
      rate: "$50/hr",
      verified: true,
      category: "SOLAR",
      imageUrl:
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2944&auto=format&fit=crop",
      phoneNumber: "555-0102",
      email: "info@sunpower.com",
      location: "Los Angeles, CA",
    },
    {
      name: "Volt Vans",
      title: "Electrical Engineer",
      specialty: "Complete Power Systems",
      rate: "$90/hr",
      verified: true,
      category: "SOLAR",
      imageUrl:
        "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=2874&auto=format&fit=crop",
      phoneNumber: "555-0103",
      email: "hello@voltvans.com",
      website: "www.voltvans.com",
      location: "Denver, CO",
    },

    // CARPENTRY
    {
      name: "WoodWorks Van Co",
      title: "Carpenter",
      specialty: "Custom Cabinetry",
      rate: "Quote Basis",
      verified: true,
      category: "CARPENTRY",
      imageUrl:
        "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=2739&auto=format&fit=crop",
      phoneNumber: "555-0104",
      email: "build@woodworks.com",
      location: "Portland, OR",
    },
    {
      name: "Nomad Joinery",
      title: "Master Carpenter",
      specialty: "Bed Platforms & Storage",
      rate: "$70/hr",
      verified: false,
      category: "CARPENTRY",
      imageUrl:
        "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2938&auto=format&fit=crop",
      phoneNumber: "555-0105",
      email: "hi@nomadjoinery.com",
      location: "Seattle, WA",
    },

    // MECHANIC
    {
      name: "Mobile Wrench",
      title: "Mechanic",
      specialty: "Diesel Engine Repair",
      rate: "$85/hr",
      verified: false,
      category: "MECHANIC",
      imageUrl:
        "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2940&auto=format&fit=crop",
      phoneNumber: "555-0106",
      email: "help@mobilewrench.com",
      location: "Austin, TX",
    },
    {
      name: "Gearhead Garage",
      title: "Auto Shop",
      specialty: "Sprinter Transmission",
      rate: "$110/hr",
      verified: true,
      category: "MECHANIC",
      imageUrl:
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2832&auto=format&fit=crop",
      phoneNumber: "555-0107",
      email: "service@gearhead.com",
      website: "www.gearhead.com",
      location: "Phoenix, AZ",
    },

    // PLUMBING
    {
      name: "Pipe Dreams",
      title: "Plumber",
      specialty: "Water Systems & Tanks",
      rate: "$75/hr",
      verified: true,
      category: "PLUMBING",
      imageUrl:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2940&auto=format&fit=crop",
      phoneNumber: "555-0108",
      email: "info@pipedreams.com",
      location: "San Diego, CA",
    },
    {
      name: "Flow State",
      title: "Plumbing Specialist",
      specialty: "Showers & Heaters",
      rate: "$65/hr",
      verified: true,
      category: "PLUMBING",
      imageUrl:
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2940&auto=format&fit=crop",
      phoneNumber: "555-0109",
      email: "hello@flowstate.com",
      location: "Salt Lake City, UT",
    },
  ];

  for (const pro of pros) {
    const created = await prisma.garagePro.create({
      data: pro,
    });
    console.log(`Created pro: ${created.name}`);
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
