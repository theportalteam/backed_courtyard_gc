const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.portalRate.findFirst();
  if (existing) {
    console.log("PortalRate already exists:", existing);
    return;
  }
  // Seed initial rate: 1 PORTAL = $0.05 USD
  const rate = await prisma.portalRate.create({
    data: { rate: 0.05 },
  });
  console.log("Created PortalRate:", rate);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
