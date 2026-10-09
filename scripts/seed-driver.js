const { PrismaClient } = require('../src/generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  const driver = await prisma.driver.create({
    data: {
      name: 'Driver Rahim',
      phone: '01687654321',
      licenseNumber: 'LIC-5001',
      status: 'AVAILABLE'
    }
  });
  console.log('Driver created:', driver);
}
main().catch(console.error).finally(() => prisma.$disconnect());
