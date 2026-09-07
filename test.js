const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const models = ['user', 'ambulance', 'driver', 'hospital', 'emergencyRequest', 'dispatch', 'trip', 'payment', 'auditLog', 'notification', 'refreshToken'];
  for (const m of models) {
    try {
      await prisma[m].findFirst();
      console.log(m + ' OK');
    } catch(e) {
      console.log(m + ' ERROR: ' + e.message);
    }
  }
}

main().finally(() => prisma.$disconnect());
