'use server';

import pool from '@/lib/db';

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

export async function getConversations(query?: string, page: number = 1, limit: number = 20) {
  try {
    const client = await pool.connect();
    try {
      const offset = (page - 1) * limit;

      // Base condition for all channels
      let whereClause = "WHERE customer_phone IS NOT NULL";
      const params: any[] = [];

      if (query) {
        whereClause += ` AND (customer_name ILIKE $1 OR customer_phone ILIKE $1)`;
        params.push(`%${query}%`);
      }

      // Get total count first
      const countRes = await client.query(`SELECT COUNT(DISTINCT customer_phone) FROM "Arabia Insurance Chats" ${whereClause}`, params);
      const totalCount = parseInt(countRes.rows[0].count);

      let sql = `
            WITH RankedMessages AS (
                SELECT 
                customer_phone,
                customer_name,
                message,
                created_at,
                ROW_NUMBER() OVER (PARTITION BY customer_phone ORDER BY created_at DESC) as rn
                FROM "Arabia Insurance Chats"
                ${whereClause}
            )
            SELECT 
                customer_phone,
                customer_name,
                message as last_message,
                created_at as last_message_time
            FROM RankedMessages
            WHERE rn = 1
            ORDER BY last_message_time DESC 
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
            `;

      const queryParams = [...params, limit, offset];
      const res = await client.query(sql, queryParams);

      return {
        conversations: res.rows as Conversation[],
        totalCount
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('getConversations Error:', error);
    return { conversations: [], totalCount: 0 };
  }
}

export async function getCustomerMessages(phone: string) {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query(`
            SELECT id, customer_phone, message, direction, created_at, channel, message_type 
            FROM "Arabia Insurance Chats"
            WHERE customer_phone = $1
            ORDER BY created_at ASC
            `, [phone]);
      return res.rows as Message[];
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('getCustomerMessages Error:', error);
    return [];
  }
}
