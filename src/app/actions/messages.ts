'use server';

import {
  type ConversationListResponse,
  type ConversationMessagesResponse,
  backendRequest,
} from '@/lib/backend-api';

export interface Conversation {
  conversationKey: string;
  contactName: string | null;
  latestMessage: string | null;
  latestMessageAt: string;
  messageCount?: number | null;
  channel?: string | null;
}

export interface Message {
  id: number;
  message: string | null;
  direction: 'inbound' | 'outbound';
  createdAt: string;
  channel: string | null;
  messageType: 'text' | 'file' | 'image' | 'audio' | 'video' | 'location' | 'sticker' | string | null;
}

export async function getConversations(page: number = 1, limit: number = 20) {
  try {
    const offset = (page - 1) * limit;
    const response = await backendRequest<ConversationListResponse>('/api/v1/conversations', {
      searchParams: {
        limit,
        offset,
      },
    });

    return {
      conversations: response.items.map((item) => ({
        conversationKey: item.conversation_key,
        contactName: item.contact_name || null,
        latestMessage: item.latest_message || null,
        latestMessageAt: item.latest_message_at,
        messageCount: item.message_count ?? null,
        channel: item.channel || null,
      })) as Conversation[],
      totalCount: response.total,
    };
  } catch (error) {
    console.error('getConversations Error:', error);
    return { conversations: [], totalCount: 0 };
  }
}

export async function getConversationMessages(conversationKey: string) {
  try {
    const response = await backendRequest<ConversationMessagesResponse>(
      `/api/v1/conversations/${encodeURIComponent(conversationKey)}/messages`,
    );

    return response.messages.map((message) => ({
      id: message.id,
      message: message.message || null,
      direction: message.direction,
      createdAt: message.created_at,
      channel: message.channel || null,
      messageType: message.message_type || 'text',
    })) as Message[];
  } catch (error) {
    console.error('getConversationMessages Error:', error);
    return [];
  }
}
