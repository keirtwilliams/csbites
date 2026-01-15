import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ----- CREATE 5 RIDER USERS -----
  const riders = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.user.create({
        data: {
          email: `rider${i + 1}@test.com`,
          password: "123456",
          role: Role.RIDER,
        },
      })
    )
  );

  // ----- CREATE RIDER PROFILES -----
  for (const user of riders) {
    await prisma.rider.create({
      data: {
        userId: user.id,
        latitude: 0,
        longitude: 0,
        isActive: true,
      },
    });
  }

  console.log("✅ 5 riders created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
