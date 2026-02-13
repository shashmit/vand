import { prisma } from "../lib/prisma";

async function main() {
  const code = process.argv[2] || "ROVY-DEV";

  try {
    const invite = await prisma.inviteCode.upsert({
      where: { code },
      update: {
        isUsed: false,
        usedBy: null,
      },
      create: {
        code,
      },
    });
    console.log(`Invite code ${invite.code} is ready and unused.`);
  } catch (error) {
    console.error("Error creating invite code:", error);
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
