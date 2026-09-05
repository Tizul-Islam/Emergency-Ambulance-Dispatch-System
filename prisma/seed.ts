import { PrismaClient, Role, AmbulanceType, AmbulanceStatus, DriverStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  // Delete in reverse order of dependencies to avoid foreign key constraints
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.dispatch.deleteMany();
  await prisma.emergencyRequest.deleteMany();
  await prisma.ambulance.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hospital.deleteMany();

  console.log('Seeding Users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@dispatch.com',
      passwordHash: 'hashed_password_placeholder',
      phone: '1234567890',
      role: Role.ADMIN,
    },
  });

  const dispatchers = await Promise.all(
    Array.from({ length: 2 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `Dispatcher ${i + 1}`,
          email: `dispatcher${i + 1}@dispatch.com`,
          passwordHash: 'hashed_password_placeholder',
          phone: `123456789${i + 1}`,
          role: Role.DISPATCHER,
        },
      }),
    ),
  );

  const callers = await Promise.all(
    Array.from({ length: 3 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `Caller ${i + 1}`,
          email: `caller${i + 1}@dispatch.com`,
          passwordHash: 'hashed_password_placeholder',
          phone: `987654321${i + 1}`,
          role: Role.CALLER,
        },
      }),
    ),
  );

  console.log('Seeding Hospitals...');
  const hospitals = await Promise.all(
    Array.from({ length: 5 }).map((_, i) => {
      const totalBeds = Math.floor(Math.random() * (500 - 50 + 1)) + 50;
      const availableBeds = Math.floor(Math.random() * totalBeds);
      return prisma.hospital.create({
        data: {
          name: `City Hospital ${i + 1}`,
          address: `${i + 1} Main St, City`,
          lat: 40.7128 + i * 0.01,
          lng: -74.006 + i * 0.01,
          totalBeds,
          availableBeds,
        },
      });
    }),
  );

  console.log('Seeding Drivers and Ambulances...');
  const ambulanceTypes = [AmbulanceType.BASIC, AmbulanceType.ICU, AmbulanceType.CARDIAC];
  const driverStatuses = [DriverStatus.AVAILABLE, DriverStatus.OFF_DUTY];
  const ambulanceStatuses = [AmbulanceStatus.AVAILABLE, AmbulanceStatus.MAINTENANCE];

  for (let i = 0; i < 10; i++) {
    // Create Driver
    const driverStatus = driverStatuses[Math.floor(Math.random() * driverStatuses.length)];
    const driver = await prisma.driver.create({
      data: {
        name: `Driver ${i + 1}`,
        phone: `555123456${i}`,
        licenseNo: `LIC${1000 + i}`,
        status: driverStatus,
      },
    });

    // Create Ambulance assigned to driver
    const type = ambulanceTypes[Math.floor(Math.random() * ambulanceTypes.length)];
    // If driver is available, make ambulance available. Otherwise maintenance or available (without driver)
    const ambulanceStatus =
      driverStatus === DriverStatus.AVAILABLE ? AmbulanceStatus.AVAILABLE : ambulanceStatuses[Math.floor(Math.random() * ambulanceStatuses.length)];

    await prisma.ambulance.create({
      data: {
        plateNumber: `AMB-${1000 + i}`,
        type,
        status: ambulanceStatus,
        currentLat: 40.7128 - i * 0.005,
        currentLng: -74.006 - i * 0.005,
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
