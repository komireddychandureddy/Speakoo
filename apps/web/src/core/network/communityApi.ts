import apiClient from './apiClient';

export type CommunityCategory = 'question' | 'discussion' | 'tip' | 'resource';

export interface CommunityThread {
  id: string;
  language: string;
  title: string;
  body: string;
  category: CommunityCategory;
  tags: string[];
  likesCount: number;
  replyCount: number;
  createdAt: string;
  author: {
    id: string;
    profile?: {
      displayName?: string | null;
      avatarUrl?: string | null;
      countryCode?: string | null;
    } | null;
  };
}

export interface CommunityReply {
  id: string;
  threadId: string;
  body: string;
  likesCount: number;
  createdAt: string;
  author: {
    id: string;
    profile?: {
      displayName?: string | null;
      avatarUrl?: string | null;
      countryCode?: string | null;
    } | null;
  };
}

export interface CommunityThreadDetail extends CommunityThread {
  replies: CommunityReply[];
}

export async function listCommunityThreads(params?: {
  language?: string;
  category?: CommunityCategory;
}): Promise<CommunityThread[]> {
  const { data } = await apiClient.get<CommunityThread[]>('community/threads', {
    params: {
      ...(params?.language ? { language: params.language } : {}),
      ...(params?.category ? { category: params.category } : {}),
    },
  });
  return data;
}

export async function getCommunityThread(id: string): Promise<CommunityThreadDetail> {
  const { data } = await apiClient.get<CommunityThreadDetail>(`community/threads/${id}`);
  return data;
}

export async function createCommunityThread(payload: {
  language: string;
  title: string;
  body: string;
  category: CommunityCategory;
  tags?: string[];
}): Promise<CommunityThread> {
  const { data } = await apiClient.post<CommunityThread>('community/threads', payload);
  return data;
}

export async function addCommunityReply(threadId: string, body: string): Promise<CommunityReply> {
  const { data } = await apiClient.post<CommunityReply>(`community/threads/${threadId}/replies`, {
    body,
  });
  return data;
}

export async function likeCommunityThread(threadId: string): Promise<CommunityThread> {
  const { data } = await apiClient.post<CommunityThread>(`community/threads/${threadId}/like`);
  return data;
}
