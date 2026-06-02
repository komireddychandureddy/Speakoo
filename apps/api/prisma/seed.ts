/* eslint-disable no-console */
import { PrismaClient, UserRole, SlotStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run prisma/seed.ts');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
} as ConstructorParameters<typeof PrismaClient>[0]);
const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('Seeding databaseâ€¦');

  // â”€â”€ 1. Admins â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const adminPw = await bcrypt.hash('Admin@123!', BCRYPT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@speakoo.com' },
    update: { passwordHash: adminPw },
    create: {
      email: 'admin@speakoo.com',
      passwordHash: adminPw,
      role: UserRole.admin,
      isVerified: true,
      profile: { create: { displayName: 'Speakoo Admin', timezone: 'UTC' } },
    },
  });

  const opsPw = await bcrypt.hash('Admin@123!', BCRYPT_ROUNDS);
  const ops = await prisma.user.upsert({
    where: { email: 'ops@speakoo.com' },
    update: { passwordHash: opsPw },
    create: {
      email: 'ops@speakoo.com',
      passwordHash: opsPw,
      role: UserRole.admin,
      isVerified: true,
      profile: { create: { displayName: 'Ops Admin', timezone: 'UTC' } },
    },
  });

  // â”€â”€ 2. Tutors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const tutor1Pw = await bcrypt.hash('Tutor@123!', BCRYPT_ROUNDS);
  const tutor1 = await prisma.user.upsert({
    where: { email: 'priya@speakoo.com' },
    update: { passwordHash: tutor1Pw },
    create: {
      email: 'priya@speakoo.com',
      passwordHash: tutor1Pw,
      role: UserRole.tutor,
      isVerified: true,
      profile: {
        create: {
          displayName: 'Priya Sharma',
          bio: 'Certified English & Hindi tutor with 8 years of experience. CELTA holder.',
          nativeLanguage: 'Hindi',
          countryCode: 'IN',
          timezone: 'Asia/Kolkata',
        },
      },
      tutorProfile: {
        create: {
          languagesTaught: ['English', 'Hindi'],
          hourlyRateCents: 45_00,
          cefrSpecialties: ['A1', 'A2', 'B1', 'B2'],
          isApproved: true,
        },
      },
    },
    include: { tutorProfile: true },
  });

  const tutor2Pw = await bcrypt.hash('Tutor@123!', BCRYPT_ROUNDS);
  const tutor2 = await prisma.user.upsert({
    where: { email: 'rahul@speakoo.com' },
    update: { passwordHash: tutor2Pw },
    create: {
      email: 'rahul@speakoo.com',
      passwordHash: tutor2Pw,
      role: UserRole.tutor,
      isVerified: true,
      profile: {
        create: {
          displayName: 'Rahul Verma',
          bio: 'Native Hindi speaker from Delhi. Business English and IELTS exam prep.',
          nativeLanguage: 'Hindi',
          countryCode: 'IN',
          timezone: 'Asia/Kolkata',
        },
      },
      tutorProfile: {
        create: {
          languagesTaught: ['English', 'Hindi'],
          hourlyRateCents: 50_00,
          cefrSpecialties: ['A1', 'A2', 'B1', 'B2', 'C1'],
          isApproved: true,
        },
      },
    },
    include: { tutorProfile: true },
  });

  // Pending (not yet approved) tutor â€” triggers the admin approval flow
  const tutor3Pw = await bcrypt.hash('Tutor3@speakoo', BCRYPT_ROUNDS);
  const tutor3 = await prisma.user.upsert({
    where: { email: 'ana.garcia@speakoo.com' },
    update: { passwordHash: tutor3Pw },
    create: {
      email: 'ana.garcia@speakoo.com',
      passwordHash: tutor3Pw,
      role: UserRole.tutor,
      isVerified: true,
      profile: {
        create: {
          displayName: 'Ana GarcÃ­a',
          bio: 'Spanish and Portuguese tutor from Madrid. 5 years teaching DELE prep.',
          nativeLanguage: 'Spanish',
          countryCode: 'ES',
          timezone: 'Europe/Madrid',
        },
      },
      tutorProfile: {
        create: {
          languagesTaught: ['Spanish', 'Portuguese'],
          hourlyRateCents: 40_00,
          cefrSpecialties: ['A1', 'A2', 'B1'],
          isApproved: false, // pending approval
        },
      },
    },
    include: { tutorProfile: true },
  });

  // â”€â”€ 3. Learners â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const learner1Pw = await bcrypt.hash('Learn@123!', BCRYPT_ROUNDS);
  const learner1 = await prisma.user.upsert({
    where: { email: 'alice@speakoo.com' },
    update: { passwordHash: learner1Pw },
    create: {
      email: 'alice@speakoo.com',
      passwordHash: learner1Pw,
      role: UserRole.learner,
      isVerified: true,
      profile: {
        create: {
          displayName: 'Alice Chen',
          nativeLanguage: 'English',
          countryCode: 'US',
          timezone: 'America/New_York',
        },
      },
    },
  });

  const learner2Pw = await bcrypt.hash('Learn@123!', BCRYPT_ROUNDS);
  const learner2 = await prisma.user.upsert({
    where: { email: 'bob@speakoo.com' },
    update: { passwordHash: learner2Pw },
    create: {
      email: 'bob@speakoo.com',
      passwordHash: learner2Pw,
      role: UserRole.learner,
      isVerified: true,
      profile: {
        create: {
          displayName: 'Bob MÃ¼ller',
          nativeLanguage: 'German',
          countryCode: 'DE',
          timezone: 'Europe/Berlin',
        },
      },
    },
  });

  // â”€â”€ 4. Availability Slots for approved tutors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const tutor1Profile = await prisma.tutorProfile.findUniqueOrThrow({
    where: { userId: tutor1.id },
  });
  const tutor2Profile = await prisma.tutorProfile.findUniqueOrThrow({
    where: { userId: tutor2.id },
  });

  const now = new Date();
  now.setMinutes(0, 0, 0);

  // Generate 7 days Ã— 3 slots per tutor
  const slotOffsets = [
    { dayOffset: 1, hour: 9 },
    { dayOffset: 1, hour: 14 },
    { dayOffset: 2, hour: 10 },
    { dayOffset: 2, hour: 16 },
    { dayOffset: 3, hour: 11 },
    { dayOffset: 4, hour: 9 },
    { dayOffset: 5, hour: 15 },
  ];

  for (const { dayOffset, hour } of slotOffsets) {
    const start = new Date(now);
    start.setDate(now.getDate() + dayOffset);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1);

    const existing1 = await prisma.availabilitySlot.findFirst({
      where: { tutorId: tutor1Profile.id, startTime: start },
    });
    if (!existing1) {
      await prisma.availabilitySlot.create({
        data: {
          tutorId: tutor1Profile.id,
          startTime: start,
          endTime: end,
          status: SlotStatus.available,
        },
      });
    }

    const start2 = new Date(start);
    start2.setHours(hour + 1);
    const end2 = new Date(start2);
    end2.setHours(hour + 2);

    const existing2 = await prisma.availabilitySlot.findFirst({
      where: { tutorId: tutor2Profile.id, startTime: start2 },
    });
    if (!existing2) {
      await prisma.availabilitySlot.create({
        data: {
          tutorId: tutor2Profile.id,
          startTime: start2,
          endTime: end2,
          status: SlotStatus.available,
        },
      });
    }
  }

  // â”€â”€ 5. Credit Bundles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const bundles = [
    { name: 'Starter â€“ 5 credits', credits: 5, priceCents: 1999 },
    { name: 'Growth â€“ 10 credits', credits: 10, priceCents: 3499 },
    { name: 'Pro â€“ 25 credits', credits: 25, priceCents: 7999 },
  ];

  for (const b of bundles) {
    const existingBundle = await prisma.creditBundle.findFirst({ where: { name: b.name } });
    if (!existingBundle) {
      await prisma.creditBundle.create({ data: { ...b, isActive: true } });
    }
  }

  console.log('Seed complete:', {
    admins: [admin.email, ops.email],
    tutors: [tutor1.email, tutor2.email, tutor3.email],
    learners: [learner1.email, learner2.email],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
