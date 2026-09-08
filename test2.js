const { PrismaClient } = require('./src/generated/prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    await prisma.driver.create({
      data: { name: 'Test1', phone: '1111111111', licenseNumber: 'LIC99991' },
    });
    console.log('Driver 1 created');
    await prisma.driver.create({
      data: { name: 'Test2', phone: '2222222222', licenseNumber: 'LIC99992' },
    });
    console.log('Driver 2 created');
  } catch (e) {
    console.error(e.code, e.meta);
  } finally {
    await prisma.$disconnect();
  }
}
run();
