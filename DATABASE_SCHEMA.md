# AIVA Database Schema Documentation

> **Database:** PostgreSQL  
> **Database Name:** `aiva`  
> **Port:** `5433` (Docker container `n8n-postgres_app-1`)  
> **Connection:** `postgresql://arabia_insurance:aivaa%40edata.ae@localhost:5433/aiva`

---

## 📋 Table Overview

| Table | Description | Row Count Estimate |
|-------|-------------|-------------------|
| `Arabia Insurance Chats` | Main table storing all customer-AI conversations | Primary data store |
| `usage_notifications` | System alerts and notification logs | Smaller, config data |

---

## 🗄️ Table 1: Arabia Insurance Chats

**Purpose:** Stores every single message exchanged between customers and the AIVA AI assistant across all channels (WhatsApp, Web Chat, etc.)

### Schema Definition

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `SERIAL` / `INTEGER` | No | Auto-increment | Primary key, unique message identifier |
| `customer_phone` | `VARCHAR` | Yes | NULL | Customer phone number (e.g., +971501234567) |
| `customer_email_address` | `VARCHAR` | Yes | NULL | Customer email (alternative identifier) |
| `session_id` | `VARCHAR` | Yes | NULL | Web session identifier for non-registered users |
| `customer_name` | `VARCHAR` | Yes | NULL | Display name of customer |
| `message` | `TEXT` | Yes | NULL | Message content (text or file URL) |
| `direction` | `VARCHAR` | No | - | Message direction: `inbound` (customer→AI) or `outbound` (AI→customer) |
| `channel` | `VARCHAR` | No | - | Communication channel: `whatsapp`, `web`, etc. |
| `message_type` | `VARCHAR` | Yes | `'text'` | Content type: `text`, `image`, `file`, `audio`, `video`, `location`, `sticker` |
| `intent` | `VARCHAR` | Yes | NULL | AI-classified intent (e.g., "Policy Inquiry") |
| `escalated` | `VARCHAR` / `BOOLEAN` | Yes | `false` | Whether conversation was escalated to human agent |
| `created_at` | `TIMESTAMP` | No | `NOW()` | When message was sent/received |

### Primary Identification Strategy

The app uses **COALESCE** to identify unique customers across different identifier types:

```sql
COALESCE(customer_phone, customer_email_address, session_id)
```

**Priority order:**
1. Phone number (WhatsApp users)
2. Email address (Web chat registered users)
3. Session ID (Anonymous web users)

### Indexes (Recommended)

```sql
-- For performance (if not already present)
CREATE INDEX idx_chats_customer_phone ON "Arabia Insurance Chats"(customer_phone);
CREATE INDEX idx_chats_created_at ON "Arabia Insurance Chats"(created_at);
CREATE INDEX idx_chats_channel ON "Arabia Insurance Chats"(channel);
CREATE INDEX idx_chats_intent ON "Arabia Insurance Chats"(intent);
CREATE INDEX idx_chats_escalated ON "Arabia Insurance Chats"(escalated);
```

### Sample Data

| id | customer_phone | customer_name | message | direction | channel | message_type | intent | escalated | created_at |
|----|----------------|---------------|---------|-----------|---------|--------------|--------|-----------|------------|
| 1 | +971501234567 | Ahmed Al-Sayed | I need to renew my car insurance | inbound | whatsapp | text | Renewal | false | 2024-01-15 10:30:00 |
| 2 | +971501234567 | Ahmed Al-Sayed | Let me help you with that renewal | outbound | whatsapp | text | NULL | false | 2024-01-15 10:30:05 |
| 3 | +971559876543 | Sarah Jones | What is the status of my claim #123? | inbound | web | text | Claims Status | true | 2024-01-15 11:15:00 |

---

## 🗄️ Table 2: usage_notifications

**Purpose:** Stores system-generated notifications, alerts, and milestones

### Schema Definition

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `SERIAL` / `INTEGER` | No | Auto-increment | Primary key |
| `message` | `TEXT` | No | - | Notification text content |
| `notification_type` | `VARCHAR` | No | - | Category: `warning`, `info`, `success` |
| `customer_count` | `INTEGER` | Yes | NULL | Number of customers affected (if applicable) |
| `slab_number` | `INTEGER` | Yes | NULL | Tier/slab identifier (usage-based billing) |
| `notified_at` | `TIMESTAMP` | No | `NOW()` | When notification was generated |

### Sample Data

| id | message | notification_type | customer_count | slab_number | notified_at |
|----|---------|-------------------|----------------|-------------|-------------|
| 1 | System usage limits approaching 80% | warning | NULL | 2 | 2024-01-15 09:00:00 |
| 2 | New user milestone reached: 3000 users | info | 3000 | NULL | 2024-01-14 14:30:00 |
| 3 | Database backup completed successfully | success | NULL | NULL | 2024-01-13 02:00:00 |

---

## 🔗 Entity Relationships

```
┌─────────────────────────┐         ┌─────────────────────────┐
│  Arabia Insurance Chats │         │   usage_notifications   │
│                         │         │                         │
│  - Core conversation    │         │  - System alerts        │
│    data                 │         │  - Milestones           │
│  - Customer messages    │         │  - Usage warnings       │
│  - AI responses         │         │                         │
│  - Metadata & intents   │         │                         │
└─────────────────────────┘         └─────────────────────────┘
           │                                   │
           │         No direct FK              │
           │         relationship              │
           ▼                                   ▼
    Referenced by app                    Referenced by app
    for all analytics                    for notifications
```

**Note:** No foreign key relationships exist between tables. They are independent entities queried separately by the application.

---

## 📝 Common Query Patterns

### 1. Get Dashboard Statistics

```sql
SELECT 
    COUNT(*) as total_chats,
    COUNT(DISTINCT COALESCE(customer_phone, customer_email_address, session_id)) as total_unique_customers,
    COUNT(DISTINCT COALESCE(customer_phone, customer_email_address, session_id)) 
        FILTER (WHERE LOWER(escalated) IN ('true', 'yes')) as escalated_customers,
    COUNT(*) FILTER (WHERE direction = 'inbound') as inbound_count,
    COUNT(*) FILTER (WHERE direction = 'outbound') as outbound_count
FROM "Arabia Insurance Chats"
WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31'
  AND LOWER(channel) = 'whatsapp';
```

### 2. Get Recent Conversations (with latest message per customer)

```sql
WITH RankedMessages AS (
    SELECT 
        customer_phone,
        customer_name,
        message,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY COALESCE(customer_phone, customer_email_address, session_id) 
            ORDER BY created_at DESC
        ) as rn
    FROM "Arabia Insurance Chats"
    WHERE customer_phone IS NOT NULL
)
SELECT 
    customer_phone,
    customer_name,
    message as last_message,
    created_at as last_message_time
FROM RankedMessages
WHERE rn = 1
ORDER BY last_message_time DESC
LIMIT 20;
```

### 3. Get Hourly Activity Distribution

```sql
SELECT 
    EXTRACT(HOUR FROM created_at) as hour,
    COUNT(*) as count
FROM "Arabia Insurance Chats"
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;
```

### 4. Get Top Intents

```sql
SELECT 
    intent, 
    COUNT(*) as count
FROM "Arabia Insurance Chats"
WHERE intent IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY intent
ORDER BY count DESC
LIMIT 5;
```

### 5. Get Customer Message History

```sql
SELECT 
    id, 
    customer_phone, 
    message, 
    direction, 
    created_at, 
    channel, 
    message_type
FROM "Arabia Insurance Chats"
WHERE customer_phone = '+971501234567'
ORDER BY created_at ASC;
```

### 6. Get Quality Trends (Daily Resolution Rate)

```sql
SELECT 
    DATE(created_at) as date,
    (100 - (
        COUNT(DISTINCT COALESCE(customer_phone, customer_email_address, session_id)) 
        FILTER (WHERE LOWER(escalated) IN ('true', 'yes'))::float / 
        NULLIF(COUNT(DISTINCT COALESCE(customer_phone, customer_email_address, session_id)), 0) * 100
    )) as quality_score
FROM "Arabia Insurance Chats"
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

### 7. Get Lead Conversion Data

```sql
SELECT 
    DATE(created_at) as date,
    COUNT(*) as count
FROM "Arabia Insurance Chats"
WHERE intent IN ('New Get-A-Quote Form Submitted in UAE', 'New Contact Form Submitted')
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

---

## 📊 Intent Classifications Used

### High-Value Intents (Conversion Events)

| Intent | Business Value | Typical Follow-up |
|--------|----------------|-------------------|
| `New Get-A-Quote Form Submitted in UAE` | 🔥 Hot Lead | Sales contact within 24h |
| `New Contact Form Submitted` | 🔥 Warm Lead | Sales queue |

### Support Intents

| Intent | Priority | Category |
|--------|----------|----------|
| `Policy Inquiry` | High | Informational |
| `Claims Status` | Critical | Urgent issue |
| `Renewal` | Medium | Transactional |
| `Technical Support` | Medium | Problem-solving |

### Other Possible Intents

- `Agent Needs Assistance` (escalation trigger)
- `Greeting` / `Welcome`
- `Farewell` / `Goodbye`
- `Unknown` (unclassified)

---

## 📈 Data Growth Patterns

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| Messages per customer | 3-6 | Average conversation depth |
| Daily volume | Varies | Depends on marketing campaigns |
| Peak hours | 9 AM - 6 PM GST | Dubai business hours |
| Channel split | ~70% WhatsApp, ~30% Web | Varies by campaign |

---

## 🔒 Security Considerations

| Aspect | Implementation |
|--------|----------------|
| PII Storage | Phone numbers and emails stored in plaintext |
| Encryption | Not encrypted at rest (consider pgcrypto) |
| Access | Controlled via PostgreSQL user `arabia_insurance` |
| Backups | Regular backups recommended (see notifications table) |

---

## 🛠️ Maintenance Commands

```sql
-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('"Arabia Insurance Chats"'));

-- Count rows (fast estimate)
SELECT reltuples::BIGINT AS estimate FROM pg_class WHERE relname = 'Arabia Insurance Chats';

-- Exact count
SELECT COUNT(*) FROM "Arabia Insurance Chats";

-- Vacuum and analyze
VACUUM ANALYZE "Arabia Insurance Chats";

-- Check for missing indexes
SELECT 
    schemaname, tablename, attname as column,
    n_tup_read, n_tup_fetch
FROM pg_stats 
WHERE tablename = 'Arabia Insurance Chats'
ORDER BY n_tup_read DESC;
```

---

## 📤 Export Data to CSV

```bash
# Full table
psql -h localhost -p 5433 -U arabia_insurance -d aiva \
  -c "\COPY \"Arabia Insurance Chats\" TO '/tmp/arabia_chats.csv' WITH (FORMAT CSV, HEADER);"

# Specific columns
psql -h localhost -p 5433 -U arabia_insurance -d aiva \
  -c "\COPY (SELECT id, customer_phone, customer_name, message, direction, intent, created_at FROM \"Arabia Insurance Chats\") TO '/tmp/arabia_chats_export.csv' WITH (FORMAT CSV, HEADER);"

# Date range
psql -h localhost -p 5433 -U arabia_insurance -d aiva \
  -c "\COPY (SELECT * FROM \"Arabia Insurance Chats\" WHERE created_at >= '2024-01-01') TO '/tmp/arabia_chats_2024.csv' WITH (FORMAT CSV, HEADER);"
```

---

**Last Updated:** February 2024  
**Maintained by:** DevOps Team
