export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  sessionCount: number;
  specialties: string[];
  isFavourite: boolean;
  bio: string;
  tutorSince: number;
  introVideoUrl?: string;
  language: string;
  experience: string;
  pricePerSession: number;
  isAvailable: boolean;
  country: string;
  timezone: string;
}

export interface Session {
  id: string;
  sessionNumber: number;
  topic: string;
  tutorName: string;
  tutorAvatar: string;
  date: string;
  timeSlot: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled' | 'missed' | 'pending';
  hasRecording?: boolean;
  feedbackSubmitted?: boolean;
  score?: number;
  maxScore?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'booking' | 'reminder' | 'system';
}

export interface Resource {
  id: string;
  title: string;
  thumbnail: string;
  description?: string;
  category: 'Business English' | 'Communicative Grammar' | 'IELTS Speaking Module' | 'Interview Prep Modules';
}

export interface CurriculumNote {
  id: string;
  sessionNumber: number;
  date: string;
  topic: string;
  pdfUrl?: string;
}

export interface SubscriptionPlan {
  id: string;
  sessions: number;
  isRecommended?: boolean;
}

export const TUTORS: Tutor[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    avatar: 'PS',
    rating: 4.9,
    sessionCount: 1243,
    specialties: ['Grammar', 'Vocabulary', 'IELTS Speaking'],
    isFavourite: true,
    bio: 'Experienced English tutor with 8+ years helping learners achieve fluency. Specialise in IELTS preparation and business communication.',
    tutorSince: 2016,
    introVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    language: 'English',
    experience: '8 years',
    pricePerSession: 499,
    isAvailable: true,
    country: 'India',
    timezone: 'Asia/Kolkata',
  },
  {
    id: '2',
    name: 'Rahul Verma',
    avatar: 'RV',
    rating: 4.8,
    sessionCount: 987,
    specialties: ['Public Speaking', 'Interview Skills', 'Business English'],
    isFavourite: false,
    bio: 'Corporate trainer turned English coach. Expert in interview preparation and professional communication skills.',
    tutorSince: 2018,
    introVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    language: 'English',
    experience: '6 years',
    pricePerSession: 449,
    isAvailable: true,
    country: 'India',
    timezone: 'Asia/Kolkata',
  },
  {
    id: '3',
    name: 'Anjali Gupta',
    avatar: 'AG',
    rating: 4.7,
    sessionCount: 756,
    specialties: ['Vocabulary', 'Grammar', 'Business English'],
    isFavourite: false,
    bio: 'Passionate about making English accessible to everyone. Specialise in vocabulary building and grammar correction.',
    tutorSince: 2019,
    language: 'French',
    experience: '5 years',
    pricePerSession: 399,
    isAvailable: false,
    country: 'United Kingdom',
    timezone: 'Europe/London',
  },
  {
    id: '4',
    name: 'Vikram Singh',
    avatar: 'VS',
    rating: 4.9,
    sessionCount: 2102,
    specialties: ['IELTS Speaking', 'Public Speaking', 'Interview Skills'],
    isFavourite: true,
    bio: 'IELTS examiner and certified English language trainer. Help students achieve band 7+ consistently.',
    tutorSince: 2015,
    language: 'English',
    experience: '9 years',
    pricePerSession: 549,
    isAvailable: true,
    country: 'Canada',
    timezone: 'America/Toronto',
  },
  {
    id: '5',
    name: 'Meena Patel',
    avatar: 'MP',
    rating: 4.6,
    sessionCount: 543,
    specialties: ['Grammar', 'Vocabulary'],
    isFavourite: false,
    bio: 'Friendly and patient tutor who believes every learner has unique potential. Focus on building confidence.',
    tutorSince: 2020,
    language: 'Spanish',
    experience: '4 years',
    pricePerSession: 349,
    isAvailable: true,
    country: 'Australia',
    timezone: 'Australia/Sydney',
  },
  {
    id: '6',
    name: 'Arjun Nair',
    avatar: 'AN',
    rating: 4.8,
    sessionCount: 1456,
    specialties: ['Business English', 'Interview Skills', 'Public Speaking'],
    isFavourite: false,
    bio: 'MBA graduate and seasoned trainer. Expertise in business communication and career-focused English.',
    tutorSince: 2017,
    language: 'English',
    experience: '7 years',
    pricePerSession: 499,
    isAvailable: false,
    country: 'United States',
    timezone: 'America/New_York',
  },
];

export const SESSIONS: Session[] = [
  {
    id: 's1',
    sessionNumber: 142,
    topic: "Mind's Symphony",
    tutorName: 'Priya Sharma',
    tutorAvatar: 'PS',
    date: '2026-06-10',
    timeSlot: '9:00 AM – 9:25 AM',
    duration: 25,
    status: 'upcoming',
  },
  {
    id: 's2',
    sessionNumber: 143,
    topic: 'The Art of Persuasion',
    tutorName: 'Rahul Verma',
    tutorAvatar: 'RV',
    date: '2026-06-12',
    timeSlot: '7:00 AM – 7:25 AM',
    duration: 25,
    status: 'upcoming',
  },
  {
    id: 's3',
    sessionNumber: 135,
    topic: 'Daily Conversations',
    tutorName: 'Priya Sharma',
    tutorAvatar: 'PS',
    date: '2026-05-28',
    timeSlot: '9:00 AM – 9:25 AM',
    duration: 25,
    status: 'completed',
    hasRecording: true,
    feedbackSubmitted: true,
    score: 19,
    maxScore: 24,
  },
  {
    id: 's4',
    sessionNumber: 136,
    topic: 'Business Vocabulary',
    tutorName: 'Rahul Verma',
    tutorAvatar: 'RV',
    date: '2026-05-30',
    timeSlot: '7:00 AM – 7:25 AM',
    duration: 25,
    status: 'completed',
    hasRecording: true,
    feedbackSubmitted: false,
    score: 21,
    maxScore: 24,
  },
  {
    id: 's5',
    sessionNumber: 130,
    topic: 'Grammar Essentials',
    tutorName: 'Anjali Gupta',
    tutorAvatar: 'AG',
    date: '2026-05-15',
    timeSlot: '10:00 AM – 10:25 AM',
    duration: 25,
    status: 'cancelled',
  },
  {
    id: 's6',
    sessionNumber: 128,
    topic: 'Presentation Skills',
    tutorName: 'Vikram Singh',
    tutorAvatar: 'VS',
    date: '2026-05-10',
    timeSlot: '8:00 AM – 8:25 AM',
    duration: 25,
    status: 'missed',
  },
  {
    id: 's7',
    sessionNumber: 144,
    topic: 'IELTS Preparation',
    tutorName: 'Vikram Singh',
    tutorAvatar: 'VS',
    date: '2026-06-14',
    timeSlot: '11:00 AM – 11:25 AM',
    duration: 25,
    status: 'pending',
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Session Reminder',
    message: "Your session with Priya Sharma is starting in 60 minutes.",
    time: '10 mins ago',
    isRead: false,
    type: 'reminder',
  },
  {
    id: 'n2',
    title: 'Booking Confirmed',
    message: "Session #143 with Rahul Verma on Jun 12 has been confirmed.",
    time: '2 hours ago',
    isRead: false,
    type: 'booking',
  },
  {
    id: 'n3',
    title: 'Session Reminder',
    message: "Your session with Priya Sharma starts in 10 minutes!",
    time: '1 day ago',
    isRead: true,
    type: 'reminder',
  },
  ...Array.from({ length: 26 }, (_, i) => ({
    id: `n${i + 4}`,
    title: 'System Notification',
    message: `Notification ${i + 4} – keep practicing to earn more points!`,
    time: `${i + 2} days ago`,
    isRead: true,
    type: 'system' as const,
  })),
];

export const RESOURCES: Resource[] = [
  { id: 'r1', title: 'Mastering Business Email Etiquette', thumbnail: '', description: 'Professional email strategies for workplace communication and client management.', category: 'Business English' },
  { id: 'r2', title: 'Negotiation Language Toolkit', thumbnail: '', description: 'Key phrases and strategies to negotiate confidently in business settings.', category: 'Business English' },
  { id: 'r3', title: 'Board Meeting Vocabulary', thumbnail: '', description: 'Essential vocabulary and expressions for leading and participating in meetings.', category: 'Business English' },
  { id: 'r4', title: 'Common Grammar Mistakes to Avoid', thumbnail: '', description: 'A comprehensive guide to the most frequent grammar errors and how to fix them.', category: 'Communicative Grammar' },
  { id: 'r5', title: 'Tenses Quick Reference Guide', thumbnail: '', description: 'Master all 12 English tenses with examples and usage rules at a glance.', category: 'Communicative Grammar' },
  { id: 'r6', title: 'IELTS Speaking Band Descriptors', thumbnail: '', description: 'Understand exactly what examiners look for to achieve Band 7, 8, or 9.', category: 'IELTS Speaking Module' },
  { id: 'r7', title: 'IELTS Part 2 Topic Bank', thumbnail: '', description: '50 curated cue card topics with structured responses and useful vocabulary.', category: 'IELTS Speaking Module' },
  { id: 'r8', title: 'Top 50 Interview Questions & Answers', thumbnail: '', description: 'Model answers for the most commonly asked HR and technical interview questions.', category: 'Interview Prep Modules' },
  { id: 'r9', title: 'STAR Method for Behavioral Questions', thumbnail: '', description: 'Step-by-step guide to structuring compelling stories using the STAR technique.', category: 'Interview Prep Modules' },
];

const TOPICS = [
  "Mind's Symphony", 'The Art of Persuasion', 'Daily Conversations', 'Business Vocabulary',
  'Grammar Essentials', 'Presentation Skills', 'IELTS Preparation', 'Phrasal Verbs in Context',
  'Job Interview Techniques', 'Storytelling in English', 'Active Listening Skills', 'Debating Techniques',
  'Email Writing Mastery', 'Small Talk and Networking', 'Accent Reduction', 'Confidence Building',
];

export const CURRICULUM_NOTES: CurriculumNote[] = Array.from({ length: 16 }, (_, i) => ({
  id: `cn${i + 1}`,
  sessionNumber: 120 + i + 1,
  topic: TOPICS[i],
  date: `2026-0${Math.floor(i / 5) + 1}-${String((i % 5) * 6 + 1).padStart(2, '0')}`,
  pdfUrl: '#',
}));

export const LEADERBOARD_LEVELS = [
  { level: 1, name: 'Rookie', points: 40, maxPoints: 40, completed: true },
  { level: 2, name: 'Seekers', points: 100, maxPoints: 100, completed: true },
  { level: 3, name: 'Explorer', points: 75, maxPoints: 150, completed: false },
  { level: 4, name: 'Achiever', points: 0, maxPoints: 200, completed: false },
  { level: 5, name: 'Champion', points: 0, maxPoints: 300, completed: false },
];

export const RECENT_POINTS = [19, 17, 16, 15, 19, 21, 18];

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  score: number;
  sessions: number;
  isMe?: boolean;
}

export const LEADERBOARD_DATA: LeaderboardUser[] = [
  { id: 'l1', rank: 1, name: 'Sunita Verma', avatar: 'SV', score: 780, sessions: 62 },
  { id: 'l2', rank: 2, name: 'Karan Mehta', avatar: 'KM', score: 720, sessions: 58 },
  { id: 'l3', rank: 3, name: 'Divya Rao', avatar: 'DR', score: 690, sessions: 55 },
  { id: 'l4', rank: 4, name: 'Rohit Joshi', avatar: 'RJ', score: 650, sessions: 52 },
  { id: 'l5', rank: 5, name: 'Neha Singh', avatar: 'NS', score: 610, sessions: 49 },
  { id: 'l6', rank: 6, name: 'Aakash Gupta', avatar: 'AG', score: 590, sessions: 47 },
  { id: 'l7', rank: 7, name: 'Preeti Kumar', avatar: 'PK', score: 560, sessions: 45 },
  { id: 'l8', rank: 8, name: 'Saurabh Patel', avatar: 'SP', score: 530, sessions: 42 },
  { id: 'l9', rank: 9, name: 'Meghna Iyer', avatar: 'MI', score: 510, sessions: 41 },
  { id: 'l10', rank: 10, name: 'Varun Sharma', avatar: 'VS', score: 490, sessions: 39 },
  { id: 'l11', rank: 11, name: 'Tanya Bose', avatar: 'TB', score: 460, sessions: 37 },
  { id: 'l12', rank: 12, name: 'Rahul Mehta', avatar: 'RM', score: 340, sessions: 28, isMe: true },
];

export const FAQS = [
  {
    id: 'f1',
    question: 'How do I book a session?',
    answer: 'Go to "Book a Session" from the dashboard or sidebar. Select a date, choose a time slot, pick a tutor and confirm your booking.',
  },
  {
    id: 'f2',
    question: 'Can I reschedule a session?',
    answer: 'Yes, you can reschedule up to 2 hours before the session start time. Go to My Sessions, find the session, and click "Reschedule".',
  },
  {
    id: 'f3',
    question: 'What is the refund policy?',
    answer: 'If you cancel more than 2 hours before the session, the session is refunded to your subscription. Cancellations within 2 hours are not refunded.',
  },
  {
    id: 'f4',
    question: 'How do I earn points?',
    answer: 'You earn points by attending sessions. Your tutor rates you across 8 performance categories, and the average becomes your session score.',
  },
  {
    id: 'f5',
    question: 'Can I change my tutor?',
    answer: 'Absolutely! You have access to 100+ tutors. You can book sessions with different tutors based on availability and your learning goals.',
  },
  {
    id: 'f6',
    question: 'What are the session timings?',
    answer: 'Sessions are available from 6 AM to 12 AM IST, 7 days a week. Each session is 25 minutes long.',
  },
];

export const FAQ_VIDEOS = [
  { id: 'v1', title: 'How to use Speakoo App?', thumbnailColor: '#E6D7FF' },
  { id: 'v2', title: 'How to Book a Trial Session?', thumbnailColor: '#BBF7D0' },
  { id: 'v3', title: 'How to Subscribe?', thumbnailColor: '#FFF8C8' },
];

// Alias for pages that import FAQ_DATA
export const FAQ_DATA = FAQS;

export const TIME_SLOTS = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM',
];

export const FILTER_CHIPS = [
  'All Tutors', 'Grammar', 'Vocabulary', 'IELTS Speaking',
  'Interview Skills', 'Public Speaking', 'Business English',
];

export const SUBSCRIPTION_DURATIONS = ['1 Month', '2 Month', '3 Month', '6 Month', '12 Month'];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'p1', sessions: 72 },
  { id: 'p2', sessions: 96 },
  { id: 'p3', sessions: 120, isRecommended: true },
];

// ─── Practice ─────────────────────────────────────────────────────────────────

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ExerciseType = 'speaking' | 'reading' | 'listening' | 'phonetics' | 'word-puzzle' | 'sentence';

export interface PracticeSession {
  id: string;
  title: string;
  language: string;
  flag: string;
  level: CEFRLevel;
  scheduledAt: string;
  durationMinutes: number;
  hostName: string;
  hostAvatar: string;
  maxParticipants: number;
  currentParticipants: number;
  creditCost: number;
  topic: string;
  type: ExerciseType;
}

export const PRACTICE_SESSIONS: PracticeSession[] = [
  { id: 'ps1', title: 'Morning English Conversation Circle', language: 'English', flag: '🇬🇧', level: 'B1', scheduledAt: '2026-06-15T06:00:00Z', durationMinutes: 30, hostName: 'Priya Sharma', hostAvatar: 'PS', maxParticipants: 6, currentParticipants: 4, creditCost: 5, topic: 'Daily Life & Routines', type: 'speaking' },
  { id: 'ps2', title: 'French Pronunciation Bootcamp', language: 'French', flag: '🇫🇷', level: 'A2', scheduledAt: '2026-06-15T09:00:00Z', durationMinutes: 25, hostName: 'Anjali Gupta', hostAvatar: 'AG', maxParticipants: 4, currentParticipants: 2, creditCost: 5, topic: 'Nasal Vowels & Silent Letters', type: 'phonetics' },
  { id: 'ps3', title: 'Spanish Storytelling Session', language: 'Spanish', flag: '🇪🇸', level: 'B2', scheduledAt: '2026-06-15T12:00:00Z', durationMinutes: 30, hostName: 'Rahul Verma', hostAvatar: 'RV', maxParticipants: 5, currentParticipants: 5, creditCost: 5, topic: 'Narrating Past Events', type: 'speaking' },
  { id: 'ps4', title: 'German Reading Comprehension', language: 'German', flag: '🇩🇪', level: 'B1', scheduledAt: '2026-06-15T15:00:00Z', durationMinutes: 25, hostName: 'Vikram Singh', hostAvatar: 'VS', maxParticipants: 6, currentParticipants: 1, creditCost: 5, topic: 'News Articles & Opinions', type: 'reading' },
  { id: 'ps5', title: 'Japanese Listening Challenge', language: 'Japanese', flag: '🇯🇵', level: 'A1', scheduledAt: '2026-06-16T04:00:00Z', durationMinutes: 20, hostName: 'Meena Patel', hostAvatar: 'MP', maxParticipants: 8, currentParticipants: 5, creditCost: 5, topic: 'Greetings & Basic Phrases', type: 'listening' },
  { id: 'ps6', title: 'Arabic Script & Sounds', language: 'Arabic', flag: '🇸🇦', level: 'A1', scheduledAt: '2026-06-16T07:00:00Z', durationMinutes: 25, hostName: 'Arjun Nair', hostAvatar: 'AN', maxParticipants: 6, currentParticipants: 3, creditCost: 5, topic: 'Alphabet & Short Vowels', type: 'phonetics' },
];

// ─── Community ────────────────────────────────────────────────────────────────

export interface CommunityThread {
  id: string;
  title: string;
  body: string;
  language: string;
  flag: string;
  category: 'question' | 'discussion' | 'tip' | 'resource';
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  replies: number;
  likes: number;
  tags: string[];
}

export interface CommunityReply {
  id: string;
  threadId: string;
  authorName: string;
  authorAvatar: string;
  body: string;
  createdAt: string;
  likes: number;
}

export const COMMUNITY_THREADS: CommunityThread[] = [
  { id: 'ct1', title: "What's the best way to practice the French \"R\" sound?", body: "I've been struggling with the French guttural R for months. Any tips from native speakers or advanced learners?", language: 'French', flag: '🇫🇷', category: 'question', authorName: 'Rahul V.', authorAvatar: 'RV', createdAt: '2026-05-24T10:00:00Z', replies: 12, likes: 34, tags: ['pronunciation', 'phonetics', 'french'] },
  { id: 'ct2', title: 'My 90-day Spanish journey — from A1 to B1', body: "I started learning Spanish in February with zero knowledge. Here's how I structured my daily practice routine and what actually worked...", language: 'Spanish', flag: '🇪🇸', category: 'discussion', authorName: 'Priya S.', authorAvatar: 'PS', createdAt: '2026-05-22T08:30:00Z', replies: 27, likes: 89, tags: ['journey', 'motivation', 'tips'] },
  { id: 'ct3', title: '10 German words English speakers always get wrong', body: 'False friends and common pitfalls for English speakers learning German — gender, cases, and word order traps...', language: 'German', flag: '🇩🇪', category: 'tip', authorName: 'Vikram S.', authorAvatar: 'VS', createdAt: '2026-05-20T14:00:00Z', replies: 8, likes: 56, tags: ['vocabulary', 'common-mistakes', 'german'] },
  { id: 'ct4', title: 'Curated playlist for improving English listening comprehension', body: 'YouTube channels, podcasts, and Netflix shows that helped me jump from B1 to C1 in listening comprehension over 6 months...', language: 'English', flag: '🇬🇧', category: 'resource', authorName: 'Anjali G.', authorAvatar: 'AG', createdAt: '2026-05-18T11:00:00Z', replies: 31, likes: 112, tags: ['listening', 'resources', 'english'] },
  { id: 'ct5', title: 'How do you stay motivated during language learning plateaus?', body: "Hit a wall with my Japanese after 6 months. It feels like I'm not progressing anymore. How do you all handle this feeling?", language: 'Japanese', flag: '🇯🇵', category: 'question', authorName: 'Meena P.', authorAvatar: 'MP', createdAt: '2026-05-16T07:00:00Z', replies: 19, likes: 67, tags: ['motivation', 'plateau', 'mindset'] },
  { id: 'ct6', title: 'Arabic script — is it really that hard for absolute beginners?', body: "Everyone told me Arabic script is impossible. I'm 3 weeks in and it's actually not that bad. Here's my approach and daily routine...", language: 'Arabic', flag: '🇸🇦', category: 'discussion', authorName: 'Arjun N.', authorAvatar: 'AN', createdAt: '2026-05-14T09:30:00Z', replies: 14, likes: 43, tags: ['arabic', 'script', 'writing'] },
];

export const COMMUNITY_REPLIES: CommunityReply[] = [
  { id: 'cr1', threadId: 'ct1', authorName: 'Vikram S.', authorAvatar: 'VS', body: 'Try gargling water — it trains the exact muscle group used for the French R. Do it for 5 minutes a day for a week!', createdAt: '2026-05-24T11:30:00Z', likes: 18 },
  { id: 'cr2', threadId: 'ct1', authorName: 'Anjali G.', authorAvatar: 'AG', body: 'The IPA symbol is /ʁ/. Listen to recordings on Forvo.com and slow down the playback to 50%. Mirror the mouth position.', createdAt: '2026-05-24T13:00:00Z', likes: 12 },
  { id: 'cr3', threadId: 'ct1', authorName: 'Priya S.', authorAvatar: 'PS', body: "In Southern France, many people use a tapped R instead of the guttural one — it's totally acceptable! Don't stress about perfection.", createdAt: '2026-05-25T08:00:00Z', likes: 9 },
  { id: 'cr4', threadId: 'ct2', authorName: 'Rahul V.', authorAvatar: 'RV', body: 'Amazing progress! What app did you use for daily vocabulary practice? Was it Anki or something else?', createdAt: '2026-05-22T10:00:00Z', likes: 7 },
  { id: 'cr5', threadId: 'ct2', authorName: 'Meena P.', authorAvatar: 'MP', body: "That's inspiring! I've been stuck at A2 for 4 months. Do you have a specific resource list you can share?", createdAt: '2026-05-23T09:00:00Z', likes: 5 },
];

export const SUBSCRIPTION_PRICES: Record<string, Record<number, number>> = {
  '1 Month': { 72: 2999, 96: 3799, 120: 4599 },
  '2 Month': { 72: 5599, 96: 7199, 120: 8799 },
  '3 Month': { 72: 7999, 96: 10499, 120: 12999 },
  '6 Month': { 72: 13999, 96: 17999, 120: 21999 },
  '12 Month': { 72: 24999, 96: 31999, 120: 38999 },
};

export interface Learner {
  id: string;
  name: string;
  avatar: string;
  email: string;
  sessionsCompleted: number;
  status: 'active' | 'suspended';
  joinedDate: string;
  language: string;
  country: string;
}

export const LEARNERS: Learner[] = [
  { id: 'u1', name: 'Aisha Patel', avatar: 'AP', email: 'aisha@example.com', sessionsCompleted: 24, status: 'active', joinedDate: '2025-01-15', language: 'English', country: 'India' },
  { id: 'u2', name: 'Carlos Ruiz', avatar: 'CR', email: 'carlos@example.com', sessionsCompleted: 12, status: 'active', joinedDate: '2025-03-08', language: 'Spanish', country: 'Mexico' },
  { id: 'u3', name: 'Yuki Tanaka', avatar: 'YT', email: 'yuki@example.com', sessionsCompleted: 36, status: 'active', joinedDate: '2024-11-20', language: 'English', country: 'Japan' },
  { id: 'u4', name: 'Fatima Al-Rashid', avatar: 'FA', email: 'fatima@example.com', sessionsCompleted: 8, status: 'suspended', joinedDate: '2025-05-01', language: 'French', country: 'UAE' },
  { id: 'u5', name: 'James Okonkwo', avatar: 'JO', email: 'james@example.com', sessionsCompleted: 19, status: 'active', joinedDate: '2025-02-14', language: 'English', country: 'Nigeria' },
  { id: 'u6', name: 'Sofia Martinez', avatar: 'SM', email: 'sofia@example.com', sessionsCompleted: 45, status: 'active', joinedDate: '2024-09-10', language: 'German', country: 'Spain' },
  { id: 'u7', name: 'Wei Chen', avatar: 'WC', email: 'wei@example.com', sessionsCompleted: 31, status: 'active', joinedDate: '2024-12-05', language: 'English', country: 'China' },
  { id: 'u8', name: 'Liam Murphy', avatar: 'LM', email: 'liam@example.com', sessionsCompleted: 3, status: 'suspended', joinedDate: '2026-01-22', language: 'Spanish', country: 'Ireland' },
];

// ── Tutor Applications ──────────────────────────────────────────

export type ApplicationStatus = 'pending' | 'approved' | 'amendment_requested' | 'rejected';

export interface TutorApplication {
  id: string;
  refNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  languages: string[];
  proficiency: string;
  certifications: string[];
  yearsExp: string;
  bio: string;
  teachingStyle: string;
  maxSessions: string;
  availability: string[];
  submittedAt: string;
  status: ApplicationStatus;
  adminFeedback?: string;
  reviewedAt?: string;
}

export const TUTOR_APPLICATIONS: TutorApplication[] = [
  { id: 'app1', refNumber: 'TUT-A3K9X', firstName: 'Aisha', lastName: 'Mahmood', email: 'aisha.m@example.com', phone: '+91 98765 43210', country: 'India', city: 'Mumbai', languages: ['English', 'Hindi'], proficiency: 'Native', certifications: ['CELTA'], yearsExp: '4', bio: 'Passionate English educator with 4 years teaching corporate professionals.', teachingStyle: 'Conversational and task-based approach', maxSessions: '20', availability: ['Monday', 'Wednesday', 'Friday'], submittedAt: '2026-05-20T09:15:00Z', status: 'pending' },
  { id: 'app2', refNumber: 'TUT-B7M2P', firstName: 'Carlos', lastName: 'Fuentes', email: 'carlos.f@example.com', phone: '+52 55 1234 5678', country: 'Mexico', city: 'Mexico City', languages: ['Spanish', 'English'], proficiency: 'Native', certifications: ['TEFL', "Bachelor's in Education"], yearsExp: '7', bio: 'Experienced Spanish teacher with TEFL certification. Taught in schools across Latin America.', teachingStyle: 'Immersive and structured grammar-based', maxSessions: '30', availability: ['Tuesday', 'Thursday', 'Saturday'], submittedAt: '2026-05-18T14:30:00Z', status: 'approved', adminFeedback: 'Excellent profile. Strong certifications and solid experience.', reviewedAt: '2026-05-19T10:00:00Z' },
  { id: 'app3', refNumber: 'TUT-C1Q4Z', firstName: 'Mei', lastName: 'Zhang', email: 'mei.zhang@example.com', phone: '+86 138 0000 1234', country: 'China', city: 'Shanghai', languages: ['Mandarin', 'English'], proficiency: 'Advanced', certifications: ["Master's Degree"], yearsExp: '3', bio: 'Mandarin tutor with a Masters in Linguistics. Specialise in business Mandarin for professionals.', teachingStyle: 'Structured with focus on tones and writing systems', maxSessions: '15', availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], submittedAt: '2026-05-22T08:00:00Z', status: 'amendment_requested', adminFeedback: 'Please upload your degree certificate and add an intro video link. Also clarify your availability timezone (CST or IST).', reviewedAt: '2026-05-23T11:30:00Z' },
  { id: 'app4', refNumber: 'TUT-D5R8W', firstName: 'Olumide', lastName: 'Adeyemi', email: 'olumide@example.com', phone: '+234 80 1234 5678', country: 'Nigeria', city: 'Lagos', languages: ['English', 'Yoruba'], proficiency: 'Native', certifications: ['TESOL'], yearsExp: '2', bio: 'Enthusiastic new teacher eager to help learners build conversational English confidence.', teachingStyle: 'Relaxed conversational sessions with real-world examples', maxSessions: '10', availability: ['Saturday', 'Sunday'], submittedAt: '2026-05-24T17:45:00Z', status: 'pending' },
  { id: 'app5', refNumber: 'TUT-E9T6L', firstName: 'Sophie', lastName: 'Dubois', email: 'sophie.d@example.com', phone: '+33 6 12 34 56 78', country: 'France', city: 'Paris', languages: ['French', 'English'], proficiency: 'Native', certifications: ['CELTA', 'PhD'], yearsExp: '12', bio: 'PhD in French Literature with 12 years teaching French as a foreign language at university level.', teachingStyle: 'Academic and immersive, literature-grounded', maxSessions: '25', availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'], submittedAt: '2026-05-15T11:00:00Z', status: 'rejected', adminFeedback: 'We cannot onboard additional French tutors at this time due to supply. Please reapply in 3 months.', reviewedAt: '2026-05-16T09:00:00Z' },
  { id: 'app6', refNumber: 'TUT-F2V0K', firstName: 'Yusuf', lastName: 'Al-Farsi', email: 'yusuf.af@example.com', phone: '+971 50 123 4567', country: 'UAE', city: 'Dubai', languages: ['Arabic', 'English'], proficiency: 'Native', certifications: ["Bachelor's in Education", 'TEFL'], yearsExp: '5', bio: 'Arabic language educator with 5 years in both online and classroom settings across the Gulf.', teachingStyle: 'Systematic grammar with cultural and dialectal context', maxSessions: '20', availability: ['Tuesday', 'Thursday', 'Friday', 'Sunday'], submittedAt: '2026-05-23T13:20:00Z', status: 'pending' },
];

// ── Credits & Pricing ────────────────────────────────────────────

export const PLATFORM_FEE_PERCENT = 5;

/** Base session prices in INR by duration (minutes) */
export const BASE_SESSION_PRICES: Record<number, number> = { 30: 99, 45: 149, 60: 199, 90: 299 };

export const MOCK_CREDIT_BALANCE = 350;

export interface CreditPack {
  id: string;
  credits: number;
  priceInr: number;
  bonusCredits?: number;
  label: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'cp1', credits: 500, priceInr: 500, label: 'Starter' },
  { id: 'cp2', credits: 1050, priceInr: 1000, bonusCredits: 50, label: 'Popular' },
  { id: 'cp3', credits: 2750, priceInr: 2500, bonusCredits: 250, label: 'Pro' },
  { id: 'cp4', credits: 5750, priceInr: 5000, bonusCredits: 750, label: 'Max' },
];

// ─── Levelled Reading Passages (Lingua.com-inspired) ─────────────────────────

export interface LeveledReading {
  level: CEFRLevel;
  title: string;
  passage: string;
  questions: { q: string; opts: string[]; ans: number }[];
}

export const LEVELED_READINGS: LeveledReading[] = [
  {
    level: 'A1',
    title: 'My Family',
    passage: 'I have a small family. I have a mother, a father, and one sister. My mother is a teacher. My father is a doctor. My sister is seven years old. We live in a house with a garden. We have a cat. Her name is Luna.',
    questions: [
      { q: 'How many people are in the family?', opts: ['Two', 'Three', 'Four'], ans: 2 },
      { q: "What is the father's job?", opts: ['Teacher', 'Doctor', 'Engineer'], ans: 1 },
      { q: "What is the cat's name?", opts: ['Luna', 'Sunny', 'Bella'], ans: 0 },
    ],
  },
  {
    level: 'A2',
    title: 'A Day at School',
    passage: "Lucas goes to school every day. He wakes up at seven o'clock. He eats breakfast with his family. Then he takes the bus to school. His favourite subject is mathematics. He has lunch with his friends. After school, he does his homework.",
    questions: [
      { q: 'What time does Lucas wake up?', opts: ["Six o'clock", "Seven o'clock", "Eight o'clock"], ans: 1 },
      { q: 'How does Lucas get to school?', opts: ['By car', 'By bus', 'On foot'], ans: 1 },
      { q: "What is Lucas's favourite subject?", opts: ['Science', 'English', 'Mathematics'], ans: 2 },
    ],
  },
  {
    level: 'B1',
    title: 'Working from Home',
    passage: 'Remote work has transformed the modern workplace. Since 2020, millions of professionals found that working from home can be as productive as office work — sometimes more so. Companies are rethinking space requirements while employees save on commuting costs and gain back personal time.',
    questions: [
      { q: 'What has transformed the modern workplace?', opts: ['Social media', 'Remote work', 'Automation'], ans: 1 },
      { q: 'Since when did this shift accelerate?', opts: ['2015', '2020', '2023'], ans: 1 },
      { q: 'What benefit do employees enjoy?', opts: ['Higher salaries', 'Saved commuting time', 'Bigger offices'], ans: 1 },
    ],
  },
  {
    level: 'B2',
    title: 'The Golden Gate Bridge',
    passage: "The Golden Gate Bridge is one of the most recognisable structures in the world. Completed in 1937, it spans the strait connecting San Francisco Bay to the Pacific Ocean. At the time of its opening, it was the longest suspension bridge in the world. Its distinctive International Orange colour was chosen to make it visible through San Francisco's famous fog.",
    questions: [
      { q: 'When was the Golden Gate Bridge completed?', opts: ['1927', '1937', '1947'], ans: 1 },
      { q: 'What does the bridge span?', opts: ['Two cities', 'San Francisco Bay to the Pacific', 'California to Nevada'], ans: 1 },
      { q: 'Why was International Orange chosen?', opts: ['It was cheapest', 'Visibility in fog', 'Government requirement'], ans: 1 },
    ],
  },
  {
    level: 'C1',
    title: 'Climate Change',
    passage: 'Climate change represents one of the most complex and pressing challenges of our era. Rising global temperatures, driven predominantly by the combustion of fossil fuels and deforestation, are altering ecosystems at an unprecedented rate. Policymakers, scientists, and civil society must collaborate to implement ambitious mitigation strategies before irreversible tipping points are reached.',
    questions: [
      { q: 'What primarily drives rising temperatures?', opts: ['Ocean currents', 'Fossil fuels and deforestation', 'Solar activity'], ans: 1 },
      { q: 'What is being altered at an unprecedented rate?', opts: ['Economies', 'Ecosystems', 'Political systems'], ans: 1 },
      { q: 'What must happen before tipping points are reached?', opts: ['Economic growth', 'Ambitious mitigation strategies', 'Technology investment'], ans: 1 },
    ],
  },
];
