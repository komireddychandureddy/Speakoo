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
    language: 'English',
    experience: '5 years',
    pricePerSession: 399,
    isAvailable: false,
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
    language: 'English',
    experience: '4 years',
    pricePerSession: 349,
    isAvailable: true,
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

export const SUBSCRIPTION_PRICES: Record<string, Record<number, number>> = {
  '1 Month': { 72: 2999, 96: 3799, 120: 4599 },
  '2 Month': { 72: 5599, 96: 7199, 120: 8799 },
  '3 Month': { 72: 7999, 96: 10499, 120: 12999 },
  '6 Month': { 72: 13999, 96: 17999, 120: 21999 },
  '12 Month': { 72: 24999, 96: 31999, 120: 38999 },
};
