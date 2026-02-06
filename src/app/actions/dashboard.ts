'use server';

import pool from '@/lib/db';

export async function getDashboardStats(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const client = await pool.connect();
        try {
            let whereClause = 'WHERE 1=1';
            const params: any[] = [];
            let paramIndex = 1;

            if (channel !== 'all') {
                whereClause += ` AND LOWER(channel) = $${paramIndex++}`;
                params.push(channel.toLowerCase());
            }

            if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
                whereClause += ` AND created_at BETWEEN $${paramIndex++} AND $${paramIndex++}`;
                params.push(startDate, endDate);
            }

            const sql = `
                SELECT 
                    COUNT(*) as total_chats,
                    COUNT(DISTINCT COALESCE(customer_phone, customer_email_address, session_id)) as total_unique_customers,
                    COUNT(DISTINCT COALESCE(customer_phone, customer_email_address, session_id)) FILTER (WHERE LOWER(escalated) IN ('true', 'yes')) as escalated_customers,
                    COUNT(*) FILTER (WHERE direction = 'inbound') as inbound_count,
                    COUNT(*) FILTER (WHERE direction = 'outbound') as outbound_count
                FROM "Arabia Insurance Chats"
                ${whereClause}
            `;

            const statsRes = await client.query(sql, params);
            const row = statsRes.rows[0];

            const totalChats = parseInt(row.total_chats);
            const totalUniqueCustomers = parseInt(row.total_unique_customers);
            const escalatedCustomers = parseInt(row.escalated_customers);
            const inbound = parseInt(row.inbound_count);
            const outbound = parseInt(row.outbound_count);

            const escalationRate = totalUniqueCustomers > 0 ? ((escalatedCustomers / totalUniqueCustomers) * 100).toFixed(1) : 0;
            const avgMessagesPerCustomer = totalUniqueCustomers > 0 ? (totalChats / totalUniqueCustomers).toFixed(1) : 0;

            const notificationsRes = await client.query(
                'SELECT * FROM usage_notifications ORDER BY notified_at DESC LIMIT 5'
            );

            return {
                totalChats,
                escalationRate,
                activeUsers: totalUniqueCustomers,
                avgMessagesPerCustomer,
                inbound,
                outbound,
                recentNotifications: notificationsRes.rows
            };
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('getDashboardStats Error:', error);
        return {
            totalChats: 0,
            escalationRate: 0,
            activeUsers: 0,
            avgMessagesPerCustomer: 0,
            inbound: 0,
            outbound: 0,
            recentNotifications: [],
            error: error.message
        };
    }
}

export async function getPeakActivityData(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const client = await pool.connect();
        try {
            let whereClause = 'WHERE 1=1';
            const params: any[] = [];
            let paramIndex = 1;

            if (channel !== 'all') {
                whereClause += ` AND LOWER(channel) = $${paramIndex++}`;
                params.push(channel.toLowerCase());
            }

            if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
                whereClause += ` AND created_at BETWEEN $${paramIndex++} AND $${paramIndex++}`;
                params.push(startDate, endDate);
            }

            const res = await client.query(`
                SELECT 
                    EXTRACT(HOUR FROM created_at) as hour,
                    COUNT(*) as count
                FROM "Arabia Insurance Chats"
                ${whereClause}
                GROUP BY hour
                ORDER BY hour ASC
            `, params);

            // Fill missing hours
            const hours = Array.from({ length: 24 }, (_, i) => ({
                hour: `${i}:00`,
                count: 0
            }));

            res.rows.forEach(row => {
                hours[Math.floor(row.hour)].count = parseInt(row.count);
            });

            return hours;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('getPeakActivityData Error:', error);
        return [];
    }
}

export async function getMessageTypeDistribution(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const client = await pool.connect();
        try {
            let whereClause = 'WHERE 1=1';
            const params: any[] = [];
            let paramIndex = 1;

            if (channel !== 'all') {
                whereClause += ` AND LOWER(channel) = $${paramIndex++}`;
                params.push(channel.toLowerCase());
            }

            if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
                whereClause += ` AND created_at BETWEEN $${paramIndex++} AND $${paramIndex++}`;
                params.push(startDate, endDate);
            }

            const res = await client.query(`
                SELECT 
                    COALESCE(message_type, 'text') as type,
                    COUNT(*) as count
                FROM "Arabia Insurance Chats"
                ${whereClause}
                GROUP BY type
                ORDER BY count DESC
            `, params);

            return res.rows.map(row => ({
                name: row.type.charAt(0).toUpperCase() + row.type.slice(1),
                value: parseInt(row.count)
            }));
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('getMessageTypeDistribution Error:', error);
        return [];
    }
}

export async function getKpiTrends(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const client = await pool.connect();
        try {
            let whereClause = 'WHERE 1=1';
            const params: any[] = [];
            let paramIndex = 1;

            if (channel !== 'all') {
                whereClause += ` AND LOWER(channel) = $${paramIndex++}`;
                params.push(channel.toLowerCase());
            }

            if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
                whereClause += ` AND created_at BETWEEN $${paramIndex++} AND $${paramIndex++}`;
                params.push(startDate, endDate);
            }

            const sql = `
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as total,
                    COUNT(DISTINCT COALESCE(customer_phone, customer_email_address, session_id)) as active,
                    COUNT(*) FILTER (WHERE direction = 'inbound') as inbound,
                    COUNT(*) FILTER (WHERE direction = 'outbound') as outbound,
                    COUNT(DISTINCT COALESCE(customer_phone, customer_email_address, session_id)) FILTER (WHERE LOWER(escalated) IN ('true', 'yes')) as escalated
                FROM "Arabia Insurance Chats"
                ${whereClause}
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) ASC
            `;

            const res = await client.query(sql, params);
            return res.rows.map(row => ({
                date: row.date,
                total: parseInt(row.total),
                active: parseInt(row.active),
                inbound: parseInt(row.inbound),
                outbound: parseInt(row.outbound),
                escalated: parseInt(row.escalated)
            }));
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('getKpiTrends Error:', error);
        return [];
    }
}

export async function getAIQualityMetrics(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const stats = await getDashboardStats(startDate, endDate, channel);
        const intentDistribution = await getIntentDistribution(startDate, endDate, channel);

        // 1. Resolution Rate (AI Success vs Human Handover)
        const resolutionRate = (100 - parseFloat(stats.escalationRate.toString())).toFixed(1);

        // 2. Conversion/Lead Rate (Intents that imply business value)
        const leadIntents = ['New Get-A-Quote Form Submitted in UAE', 'New Contact Form Submitted'];
        const totalLeads = intentDistribution
            .filter(i => leadIntents.includes(i.intent))
            .reduce((acc, curr) => acc + parseInt(curr.count), 0);

        const leadConversionRate = stats.activeUsers > 0
            ? ((totalLeads / stats.activeUsers) * 100).toFixed(1)
            : 0;

        // 3. AI Quality Score (Aggregate weighing resolution, leads, and engagement)
        // Adjusted: Resolution Rate provides the baseline (0.7 weight = up to 70 points).
        // Adjusted: Lead Conversion acts as a "Bonus" (2.0 weight) to push score higher.
        const resWeight = parseFloat(resolutionRate) * 0.7;
        const leadWeight = parseFloat(leadConversionRate.toString()) * 2.5;
        const qualityScore = Math.min(100, resWeight + leadWeight).toFixed(0);

        return {
            resolutionRate,
            leadConversionRate,
            qualityScore,
            totalLeads,
            status: parseFloat(qualityScore) > 80 ? 'Optimal' : parseFloat(qualityScore) > 60 ? 'Stable' : 'Attention'
        };
    } catch (error) {
        console.error('getAIQualityMetrics Error:', error);
        return { resolutionRate: 0, leadConversionRate: 0, qualityScore: 0, totalLeads: 0, status: 'Unknown' };
    }
}

export async function getQualityTrends(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const client = await pool.connect();
        try {
            let whereClause = 'WHERE 1=1';
            const params: any[] = [];
            let paramIndex = 1;

            if (channel !== 'all') {
                whereClause += ` AND LOWER(channel) = $${paramIndex++}`;
                params.push(channel.toLowerCase());
            }

            if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
                whereClause += ` AND created_at BETWEEN $${paramIndex++} AND $${paramIndex++}`;
                params.push(startDate, endDate);
            }

            // Quality per day: percentage of non-escalated chats
            const sql = `
                SELECT 
                    DATE(created_at) as date,
                    (100 - (COUNT(DISTINCT COALESCE(customer_phone, customer_email_address, session_id)) FILTER (WHERE LOWER(escalated) IN ('true', 'yes'))::float / NULLIF(COUNT(DISTINCT COALESCE(customer_phone, customer_email_address, session_id)), 0) * 100)) as score
                FROM "Arabia Insurance Chats"
                ${whereClause}
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) ASC
            `;

            const res = await client.query(sql, params);
            return res.rows.map(row => ({
                date: row.date,
                score: parseFloat(row.score || 0).toFixed(1)
            }));
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('getQualityTrends Error:', error);
        return [];
    }
}

export async function getLeadTrends(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const client = await pool.connect();
        try {
            let whereClause = "WHERE intent IN ('New Get-A-Quote Form Submitted in UAE', 'New Contact Form Submitted')";
            const params: any[] = [];
            let paramIndex = 1;

            if (channel !== 'all') {
                whereClause += ` AND LOWER(channel) = $${paramIndex++}`;
                params.push(channel.toLowerCase());
            }

            if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
                whereClause += ` AND created_at BETWEEN $${paramIndex++} AND $${paramIndex++}`;
                params.push(startDate, endDate);
            }

            const sql = `
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as count
                FROM "Arabia Insurance Chats"
                ${whereClause}
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) ASC
            `;

            const res = await client.query(sql, params);
            return res.rows.map(row => ({
                date: row.date,
                count: parseInt(row.count)
            }));
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('getLeadTrends Error:', error);
        return [];
    }
}

export async function getChatVolumeData(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const client = await pool.connect();
        try {
            let whereClause = "WHERE 1=1";
            const params: any[] = [];
            let paramIndex = 1;

            if (channel !== 'all') {
                whereClause += ` AND LOWER(channel) = $${paramIndex++}`;
                params.push(channel.toLowerCase());
            }

            if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
                whereClause += ` AND created_at BETWEEN $${paramIndex++} AND $${paramIndex++}`;
                params.push(startDate, endDate);
            } else {
                whereClause += ` AND created_at >= NOW() - INTERVAL '30 days'`;
            }

            const res = await client.query(`
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM "Arabia Insurance Chats"
                ${whereClause}
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) ASC
            `, params);
            return res.rows;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('getChatVolumeData Error:', error);
        return [];
    }
}

export async function getIntentDistribution(startDate?: Date, endDate?: Date, channel: string = 'all') {
    try {
        const client = await pool.connect();
        try {
            let whereClause = "WHERE intent IS NOT NULL";
            const params: any[] = [];
            let paramIndex = 1;

            if (channel !== 'all') {
                whereClause += ` AND LOWER(channel) = $${paramIndex++}`;
                params.push(channel.toLowerCase());
            }

            if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
                whereClause += ` AND created_at BETWEEN $${paramIndex++} AND $${paramIndex++}`;
                params.push(startDate, endDate);
            }

            const res = await client.query(`
                SELECT intent, COUNT(*) as count
                FROM "Arabia Insurance Chats"
                ${whereClause}
                GROUP BY intent
                ORDER BY count DESC
                LIMIT 5
            `, params);
            return res.rows;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('getIntentDistribution Error:', error);
        return [];
    }
}

export async function getRecentInteractions(channel: string = 'all') {
    try {
        const client = await pool.connect();
        try {
            let whereClause = "WHERE COALESCE(customer_phone, customer_email_address, session_id) IS NOT NULL";
            const params: any[] = [];
            let paramIndex = 1;

            if (channel !== 'all') {
                whereClause += ` AND LOWER(channel) = $${paramIndex++}`;
                params.push(channel.toLowerCase());
            }

            const sql = `
                WITH RankedMessages AS (
                    SELECT 
                    customer_phone,
                    customer_email_address,
                    session_id,
                    customer_name,
                    message,
                    created_at,
                    ROW_NUMBER() OVER (PARTITION BY COALESCE(customer_phone, customer_email_address, session_id) ORDER BY created_at DESC) as rn
                    FROM "Arabia Insurance Chats"
                    ${whereClause}
                )
                SELECT 
                    COALESCE(customer_name, customer_email_address, customer_phone, 'Anonymous') as customer_name,
                    COALESCE(customer_phone, customer_email_address, session_id) as identifier,
                    message as last_message,
                    created_at as last_message_time
                FROM RankedMessages
                WHERE rn = 1
                ORDER BY last_message_time DESC LIMIT 5
            `;
            const res = await client.query(sql, params);
            return res.rows;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('getRecentInteractions Error:', error);
        return [];
    }
}
