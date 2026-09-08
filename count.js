const { PrismaClient } = require('./src/generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  console.log('Users count:', count);
}

main().finally(() => prisma.$disconnect());
