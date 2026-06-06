import apiClient from './apiClient';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface LearningResource {
  id: string;
  category: string;
  title: string;
  description: string | null;
  contentUrl: string | null;
  downloadUrl: string | null;
}

export interface ReadingQuestion {
  q: string;
  opts: string[];
  ans: number;
}

export interface PracticeReadingPassage {
  id: string;
  cefrLevel: string;
  title: string;
  passage: string;
  questions: ReadingQuestion[];
}

export interface PracticeExerciseContentItem {
  id: string;
  mode: string;
  title: string | null;
  payload: unknown;
  sortOrder: number;
}

export async function listFaqItems(): Promise<FaqItem[]> {
  const { data } = await apiClient.get<FaqItem[]>('content/faqs');
  return data;
}

export async function listLearningResources(category?: string): Promise<LearningResource[]> {
  const { data } = await apiClient.get<LearningResource[]>('content/resources', {
    params: {
      ...(category ? { category } : {}),
    },
  });
  return data;
}

export async function listPracticeReadings(level?: string): Promise<PracticeReadingPassage[]> {
  const { data } = await apiClient.get<PracticeReadingPassage[]>('content/practice-readings', {
    params: {
      ...(level ? { level } : {}),
    },
  });
  return data;
}

export async function listPracticeExerciseContent(
  mode?: string,
): Promise<PracticeExerciseContentItem[]> {
  const { data } = await apiClient.get<PracticeExerciseContentItem[]>('content/practice-exercises', {
    params: {
      ...(mode ? { mode } : {}),
    },
  });
  return data;
}
