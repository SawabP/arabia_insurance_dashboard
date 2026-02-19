'use server';

import { ChatRecord, loadChats } from '@/lib/json-db';

export interface Conversation {
  customer_phone: string;
  customer_name: string;
  last_message: string;
  last_message_time: string;
  unread_count?: number;
}

export interface Message {
  id: number;
  customer_phone: string;
  message: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  channel: string;
  message_type: 'text' | 'file' | 'image' | 'audio' | 'video' | 'location' | 'sticker' | string | null;
}

function getTimestamp(value?: string | null): number {
  if (!value) return Number.NaN;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.NaN : timestamp;
}

function getSortableTimestamp(value?: string | null): number {
  const timestamp = getTimestamp(value);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function toLower(value?: string | null): string {
  return (value ?? '').toLowerCase();
}

function getLatestByPhone(chats: ChatRecord[]): Map<string, ChatRecord> {
  const latestByPhone = new Map<string, ChatRecord>();

  chats.forEach((chat) => {
    if (!chat.customer_phone) return;

    const existing = latestByPhone.get(chat.customer_phone);
    if (!existing) {
      latestByPhone.set(chat.customer_phone, chat);
      return;
    }

    const existingTime = getSortableTimestamp(existing.created_at);
    const currentTime = getSortableTimestamp(chat.created_at);
    if (currentTime > existingTime) {
      latestByPhone.set(chat.customer_phone, chat);
    }
  });

  return latestByPhone;
}

export async function getConversations(query?: string, page: number = 1, limit: number = 20) {
  try {
    const chats = await loadChats();
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const offset = (safePage - 1) * safeLimit;

    let filtered = chats.filter((chat) => Boolean(chat.customer_phone));

    if (query && query.trim()) {
      const search = query.trim().toLowerCase();
      filtered = filtered.filter((chat) =>
        toLower(chat.customer_name).includes(search) ||
        toLower(chat.customer_phone).includes(search)
      );
    }

    const totalCount = new Set(
      filtered
        .map((chat) => chat.customer_phone)
        .filter((phone): phone is string => Boolean(phone))
    ).size;

    const conversations = Array.from(getLatestByPhone(filtered).values())
      .sort((a, b) => getSortableTimestamp(b.created_at) - getSortableTimestamp(a.created_at))
      .slice(offset, offset + safeLimit)
      .map((chat) => ({
        customer_phone: chat.customer_phone ?? '',
        customer_name: chat.customer_name ?? '',
        last_message: chat.message ?? '',
        last_message_time: chat.created_at,
      }));

    return {
      conversations: conversations as Conversation[],
      totalCount,
    };
  } catch (error) {
    console.error('getConversations Error:', error);
    return { conversations: [], totalCount: 0 };
  }
}

export async function getCustomerMessages(phone: string) {
  try {
    const chats = await loadChats();
    const messages = chats
      .filter((chat) => chat.customer_phone === phone)
      .map((chat) => ({
        id: typeof chat.id === 'number' ? chat.id : Number(chat.id) || 0,
        customer_phone: chat.customer_phone ?? '',
        message: chat.message ?? '',
        direction: chat.direction === 'outbound' ? 'outbound' : 'inbound',
        created_at: chat.created_at,
        channel: chat.channel ?? 'unknown',
        message_type: chat.message_type ?? null,
      }))
      .sort((a, b) => getSortableTimestamp(a.created_at) - getSortableTimestamp(b.created_at));

    return messages as Message[];
  } catch (error) {
    console.error('getCustomerMessages Error:', error);
    return [];
  }
}
