'use server';

import pool from '@/lib/db';

export async function getNotifications() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
      SELECT * FROM usage_notifications
      ORDER BY notified_at DESC
      LIMIT 100
    `);
        return res.rows;
    } finally {
        client.release();
    }
}
