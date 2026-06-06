/* eslint-disable no-console */
import { PrismaClient, UserRole, SlotStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run prisma/seed.ts');
}

const prisma = new PrismaClient();
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

  // 6. Content catalog
  const faqItems = [
    {
      question: 'How do I book a tutor session?',
      answer:
        'Go to All Tutors, choose a tutor and slot, then confirm your booking from the checkout flow.',
      sortOrder: 1,
    },
    {
      question: 'How do session credits work?',
      answer:
        'Credits are added to your wallet after purchase and are deducted when you join paid sessions.',
      sortOrder: 2,
    },
    {
      question: 'Can I cancel a booking and get a refund?',
      answer:
        'Yes. Refund amount depends on the cancellation window based on platform policy.',
      sortOrder: 3,
    },
  ];

  for (const item of faqItems) {
    const existing = await prisma.faqItem.findFirst({ where: { question: item.question } });
    if (!existing) {
      await prisma.faqItem.create({
        data: {
          question: item.question,
          answer: item.answer,
          sortOrder: item.sortOrder,
          isActive: true,
        },
      });
    }
  }

  const learningResources = [
    {
      category: 'Business English',
      title: 'Business Email Essentials',
      description: 'Templates and structure for clear workplace emails.',
      contentUrl: 'https://example.com/resources/business-email-essentials',
      downloadUrl: 'https://example.com/resources/business-email-essentials.pdf',
      sortOrder: 1,
    },
    {
      category: 'Communicative Grammar',
      title: 'Everyday Tenses in Conversation',
      description: 'How to use common tenses naturally in spoken conversations.',
      contentUrl: 'https://example.com/resources/everyday-tenses',
      downloadUrl: 'https://example.com/resources/everyday-tenses.pdf',
      sortOrder: 2,
    },
    {
      category: 'IELTS Speaking Module',
      title: 'IELTS Part 2 Speaking Prompts',
      description: 'Timed prompts and model structures for part 2.',
      contentUrl: 'https://example.com/resources/ielts-part2-prompts',
      downloadUrl: 'https://example.com/resources/ielts-part2-prompts.pdf',
      sortOrder: 3,
    },
  ];

  for (const resource of learningResources) {
    const existing = await prisma.learningResource.findFirst({
      where: { category: resource.category, title: resource.title },
    });
    if (!existing) {
      await prisma.learningResource.create({
        data: {
          category: resource.category,
          title: resource.title,
          description: resource.description,
          contentUrl: resource.contentUrl,
          downloadUrl: resource.downloadUrl,
          sortOrder: resource.sortOrder,
          isActive: true,
        },
      });
    }
  }

  const readingPassages = [
    {
      cefrLevel: 'A1',
      title: 'My Daily Routine',
      passage:
        'Lucas wakes up at seven every day. He eats breakfast with his family and takes the bus to school.',
      questions: [
        {
          q: 'What time does Lucas wake up?',
          opts: ['Six', 'Seven', 'Eight'],
          ans: 1,
        },
      ],
    },
    {
      cefrLevel: 'B1',
      title: 'Weekend City Walk',
      passage:
        'On Saturday, Mina visits a new part of the city, takes photos, and writes short notes about places she likes.',
      questions: [
        {
          q: 'What does Mina do after taking photos?',
          opts: ['She goes home immediately', 'She writes notes', 'She calls a tutor'],
          ans: 1,
        },
      ],
    },
    {
      cefrLevel: 'C1',
      title: 'Language and Identity',
      passage:
        'Many multilingual speakers report that language choice influences tone, confidence, and how they express personality in social contexts.',
      questions: [
        {
          q: 'What does the passage suggest about language choice?',
          opts: [
            'It only affects vocabulary size',
            'It can influence expression and confidence',
            'It has no social impact',
          ],
          ans: 1,
        },
      ],
    },
  ];

  for (const reading of readingPassages) {
    const existing = await prisma.practiceReadingPassage.findFirst({
      where: { cefrLevel: reading.cefrLevel, title: reading.title },
    });
    if (!existing) {
      await prisma.practiceReadingPassage.create({
        data: {
          cefrLevel: reading.cefrLevel,
          title: reading.title,
          passage: reading.passage,
          questions: reading.questions,
          isActive: true,
        },
      });
    }
  }

  const practiceExerciseContent = [
    {
      mode: 'listening',
      title: 'Coffee Order Listening',
      payload: {
        transcript:
          'Good morning! I would like to order a large coffee with a little milk and no sugar, please.',
        options: ['Tea without milk', 'Large coffee with milk', 'Small black coffee'],
        answerIndex: 1,
      },
      sortOrder: 1,
    },
    {
      mode: 'phonetics',
      title: 'Core Vowel Sounds',
      payload: [
        { ipa: '/iː/', word: 'see', eg: 'tree, feel' },
        { ipa: '/ɪ/', word: 'sit', eg: 'big, hit' },
        { ipa: '/e/', word: 'ten', eg: 'bed, red' },
        { ipa: '/æ/', word: 'cat', eg: 'hat, map' },
        { ipa: '/ɑː/', word: 'car', eg: 'far, dark' },
        { ipa: '/ʌ/', word: 'cup', eg: 'bus, run' },
        { ipa: '/ɜː/', word: 'bird', eg: 'her, word' },
        { ipa: '/ɔː/', word: 'saw', eg: 'four, door' },
      ],
      sortOrder: 1,
    },
    {
      mode: 'word-puzzle',
      title: 'Sentence Ordering',
      payload: {
        words: ['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'],
        answer: 'The quick brown fox jumps over the lazy dog',
      },
      sortOrder: 1,
    },
    {
      mode: 'sentence',
      title: 'Fill in the Blank Basics',
      payload: [
        { s: 'She ___ to school every day.', opts: ['go', 'goes', 'going'], ans: 1 },
        { s: 'They ___ playing football right now.', opts: ['is', 'are', 'was'], ans: 1 },
        { s: 'He has already ___ his homework.', opts: ['finish', 'finishes', 'finished'], ans: 2 },
      ],
      sortOrder: 1,
    },
    {
      mode: 'vocabulary',
      title: 'Core Academic Vocabulary',
      payload: [
        {
          word: 'Eloquent',
          sentence: 'The speaker gave an ___ speech that moved the entire audience.',
          opts: [
            'Angry and emotional',
            'Fluent and persuasive in speaking',
            'Short and unclear',
            'Loud and aggressive',
          ],
          ans: 1,
        },
        {
          word: 'Ambiguous',
          sentence: 'The contract clause was ___ and required legal clarification.',
          opts: [
            'Extremely clear',
            'Having more than one possible meaning',
            'Written in legal terms',
            'Short and simple',
          ],
          ans: 1,
        },
      ],
      sortOrder: 1,
    },
    {
      mode: 'grammar',
      title: 'Grammar Drills',
      payload: {
        'Verb Tenses': [
          {
            s: 'By next year, she ___ at this company for a decade.',
            opts: ['works', 'will have worked', 'has worked'],
            ans: 1,
            exp: 'Future Perfect: action completed before a future point.',
          },
          {
            s: 'He ___ his homework when she called.',
            opts: ['was doing', 'has done', 'did'],
            ans: 0,
            exp: 'Past Continuous: an ongoing action interrupted by another.',
          },
        ],
        Prepositions: [
          {
            s: 'She arrived ___ the airport just in time.',
            opts: ['to', 'at', 'in'],
            ans: 1,
            exp: '"at" is used for specific locations like airports, stations, and schools.',
          },
          {
            s: 'The meeting is scheduled ___ Monday morning.',
            opts: ['in', 'on', 'at'],
            ans: 1,
            exp: '"on" is used with days of the week.',
          },
        ],
        Pronouns: [
          {
            s: '___ is the person who called last night?',
            opts: ['Whom', 'Who', 'Whose'],
            ans: 1,
            exp: '"Who" is a subject pronoun and is the subject of "called".',
          },
          {
            s: 'The results surprised both him and ___.',
            opts: ['I', 'me', 'myself'],
            ans: 1,
            exp: 'In objective position after "and", use the object pronoun "me".',
          },
        ],
        Conditionals: [
          {
            s: 'If she ___ harder, she would pass the exam.',
            opts: ['studies', 'studied', 'had studied'],
            ans: 1,
            exp: 'Type 2 conditional: hypothetical present/future situation.',
          },
          {
            s: 'If it ___ tomorrow, we will cancel the event.',
            opts: ['rains', 'rained', 'had rained'],
            ans: 0,
            exp: 'Type 1 conditional: real or likely future condition.',
          },
        ],
      },
      sortOrder: 1,
    },
    {
      mode: 'dictation',
      title: 'Dictation Sentences',
      payload: [
        { text: 'She studies English every morning before breakfast.', level: 'A2' },
        { text: 'The meeting was postponed due to an unexpected delay.', level: 'B1' },
        { text: 'Despite the heavy rainfall, the outdoor event continued as planned.', level: 'B2' },
      ],
      sortOrder: 1,
    },
  ];

  for (const item of practiceExerciseContent) {
    const existing = await prisma.practiceExerciseContent.findFirst({
      where: { mode: item.mode, title: item.title },
    });

    if (!existing) {
      await prisma.practiceExerciseContent.create({
        data: {
          mode: item.mode,
          title: item.title,
          payload: item.payload,
          sortOrder: item.sortOrder,
          isActive: true,
        },
      });
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
  .finally(() => prisma.$disconnect());
