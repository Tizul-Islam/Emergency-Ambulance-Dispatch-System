import {
  PrismaClient,
  Role,
  AmbulanceType,
  AmbulanceStatus,
  DriverStatus,
} from '../src/generated/prisma/client';
import bcrypt from 'bcrypt';

import prisma from '../src/utils/prisma';

async function main() {
  console.log('Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.dispatch.deleteMany();
  await prisma.emergencyRequest.deleteMany();
  await prisma.ambulance.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hospital.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  console.log('Seeding Users...');
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@dispatch.com',
      passwordHash,
      phone: '01700000001',
      role: Role.ADMIN,
    },
  });

  await Promise.all(
    Array.from({ length: 2 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `Dispatcher ${i + 1}`,
          email: `dispatcher${i + 1}@dispatch.com`,
          passwordHash,
          phone: `0170000001${i}`,
          role: Role.DISPATCHER,
        },
      }),
    ),
  );

  await Promise.all(
    Array.from({ length: 3 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `Patient ${i + 1}`,
          email: `patient${i + 1}@dispatch.com`,
          passwordHash,
          phone: `0180000001${i}`,
          role: Role.PATIENT,
        },
      }),
    ),
  );

  console.log('Seeding Hospitals...');
  await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.hospital.create({
        data: {
          name: `City Hospital ${i + 1}`,
          address: `${i + 1} Main St, Dhaka`,
          phone: `0190000001${i}`,
          latitude: 23.8103 + i * 0.01,
          longitude: 90.4125 + i * 0.01,
          emergencyAvailable: true,
        },
      }),
    ),
  );

  console.log('Seeding Drivers and Ambulances...');
  const ambulanceTypes = [AmbulanceType.BASIC, AmbulanceType.ICU, AmbulanceType.CARDIAC];

  for (let i = 0; i < 10; i++) {
    const driverStatus = i % 3 === 0 ? DriverStatus.OFF_DUTY : DriverStatus.AVAILABLE;

    const driver = await prisma.driver.create({
      data: {
        name: `Driver ${i + 1}`,
        phone: `0160000001${i}`,
        licenseNumber: `LIC${1000 + i}`,
        status: driverStatus,
      },
    });

    await prisma.ambulance.create({
      data: {
        registrationNumber: `AMB-${1000 + i}`,
        type: ambulanceTypes[i % ambulanceTypes.length],
        status:
          driverStatus === DriverStatus.AVAILABLE
            ? AmbulanceStatus.AVAILABLE
            : AmbulanceStatus.OFFLINE,
        capacity: 2 + (i % 3),
        locationLat: 23.8103 - i * 0.005,
        locationLng: 90.4125 - i * 0.005,
        driverId: driver.id,
      },
    });
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
