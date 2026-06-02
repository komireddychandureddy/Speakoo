import { PrismaClient, UserRole, SlotStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('Seeding database…');

  // ── 1. Admin ──────────────────────────────────────────────────────────
  const adminPw = await bcrypt.hash('Admin@speakoo1', BCRYPT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@speakoo.com' },
    update: {},
    create: {
      email: 'admin@speakoo.com',
      passwordHash: adminPw,
      role: UserRole.admin,
      isVerified: true,
      profile: { create: { displayName: 'Admin', timezone: 'UTC' } },
    },
  });

  // ── 2. Tutors ─────────────────────────────────────────────────────────
  const tutor1Pw = await bcrypt.hash('Tutor1@speakoo', BCRYPT_ROUNDS);
  const tutor1 = await prisma.user.upsert({
    where: { email: 'priya.sharma@speakoo.com' },
    update: {},
    create: {
      email: 'priya.sharma@speakoo.com',
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

  const tutor2Pw = await bcrypt.hash('Tutor2@speakoo', BCRYPT_ROUNDS);
  const tutor2 = await prisma.user.upsert({
    where: { email: 'marc.dupont@speakoo.com' },
    update: {},
    create: {
      email: 'marc.dupont@speakoo.com',
      passwordHash: tutor2Pw,
      role: UserRole.tutor,
      isVerified: true,
      profile: {
        create: {
          displayName: 'Marc Dupont',
          bio: 'Native French speaker from Paris. Business French and DELF exam prep.',
          nativeLanguage: 'French',
          countryCode: 'FR',
          timezone: 'Europe/Paris',
        },
      },
      tutorProfile: {
        create: {
          languagesTaught: ['French'],
          hourlyRateCents: 55_00,
          cefrSpecialties: ['A1', 'A2', 'B1', 'B2', 'C1'],
          isApproved: true,
        },
      },
    },
    include: { tutorProfile: true },
  });

  // Pending (not yet approved) tutor — triggers the admin approval flow
  const tutor3Pw = await bcrypt.hash('Tutor3@speakoo', BCRYPT_ROUNDS);
  const tutor3 = await prisma.user.upsert({
    where: { email: 'ana.garcia@speakoo.com' },
    update: {},
    create: {
      email: 'ana.garcia@speakoo.com',
      passwordHash: tutor3Pw,
      role: UserRole.tutor,
      isVerified: true,
      profile: {
        create: {
          displayName: 'Ana García',
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

  // ── 3. Learners ───────────────────────────────────────────────────────
  const learner1Pw = await bcrypt.hash('Learner1@speakoo', BCRYPT_ROUNDS);
  const learner1 = await prisma.user.upsert({
    where: { email: 'alex.johnson@example.com' },
    update: {},
    create: {
      email: 'alex.johnson@example.com',
      passwordHash: learner1Pw,
      role: UserRole.learner,
      isVerified: true,
      profile: {
        create: {
          displayName: 'Alex Johnson',
          nativeLanguage: 'English',
          countryCode: 'US',
          timezone: 'America/New_York',
        },
      },
    },
  });

  const learner2Pw = await bcrypt.hash('Learner2@speakoo', BCRYPT_ROUNDS);
  const learner2 = await prisma.user.upsert({
    where: { email: 'yuki.tanaka@example.com' },
    update: {},
    create: {
      email: 'yuki.tanaka@example.com',
      passwordHash: learner2Pw,
      role: UserRole.learner,
      isVerified: true,
      profile: {
        create: {
          displayName: 'Yuki Tanaka',
          nativeLanguage: 'Japanese',
          countryCode: 'JP',
          timezone: 'Asia/Tokyo',
        },
      },
    },
  });

  // ── 4. Availability Slots for approved tutors ─────────────────────────
  const tutor1Profile = await prisma.tutorProfile.findUniqueOrThrow({
    where: { userId: tutor1.id },
  });
  const tutor2Profile = await prisma.tutorProfile.findUniqueOrThrow({
    where: { userId: tutor2.id },
  });

  const now = new Date();
  now.setMinutes(0, 0, 0);

  // Generate 7 days × 3 slots per tutor
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
        data: { tutorId: tutor1Profile.id, startTime: start, endTime: end, status: SlotStatus.available },
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
        data: { tutorId: tutor2Profile.id, startTime: start2, endTime: end2, status: SlotStatus.available },
      });
    }
  }

  // ── 5. Credit Bundles ──────────────────────────────────────────────────
  const bundles = [
    { name: 'Starter – 5 credits', credits: 5, priceCents: 1999 },
    { name: 'Growth – 10 credits', credits: 10, priceCents: 3499 },
    { name: 'Pro – 25 credits', credits: 25, priceCents: 7999 },
  ];

  for (const b of bundles) {
    const existingBundle = await prisma.creditBundle.findFirst({ where: { name: b.name } });
    if (!existingBundle) {
      await prisma.creditBundle.create({ data: { ...b, isActive: true } });
    }
  }

  console.log('Seed complete:', {
    admin: admin.email,
    tutors: [tutor1.email, tutor2.email, tutor3.email],
    learners: [learner1.email, learner2.email],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
