# 📋 AIVA Metrics Quick Reference Sheet

> **Purpose:** Quick lookup guide for all metrics, formulas, and technical details  
> **Keep this handy during demos and discussions**

---

## 🧮 FORMULAS BEHIND THE METRICS

| Metric | Formula | Good Range | Excellent |
|--------|---------|------------|-----------|
| **Escalation Rate** | `(Escalated Customers / Total Unique Customers) × 100` | < 15% | < 10% |
| **Resolution Rate** | `100% - Escalation Rate` | > 85% | > 90% |
| **AI Quality Score** | `(Resolution Rate × 0.7) + (Lead Conversion × 2.5)` | 60-80 | 80-100 |
| **Lead Conversion** | `(Leads Generated / Total Unique Customers) × 100` | Varies by campaign | > 5% |
| **Avg Engagement** | `Total Messages / Total Unique Customers` | 3-6 messages | > 5 |

---

## 📊 ALL ANALYTICS AT A GLANCE

### Volume Metrics
| Metric | Unit | Description |
|--------|------|-------------|
| Total Messages | Count | All inbound + outbound combined |
| Total Customers | Count | Unique users (deduplicated by phone/email/session) |
| Inbound | Count | Messages FROM customers |
| Outbound | Count | Messages TO customers |

### Quality Metrics
| Metric | Unit | Description |
|--------|------|-------------|
| AI Quality Index | 0-100 | Composite performance score |
| Resolution Rate | % | Conversations resolved without human |
| Escalation Rate | % | Conversations needing human agent |

### Conversion Metrics
| Metric | Unit | Description |
|--------|------|-------------|
| Output Conversion | % | Users completing high-value actions |
| Total Leads | Count | Forms submitted (quote + contact) |
| Lead Conversion | % | Leads / Total Customers |

### Engagement Metrics
| Metric | Unit | Description |
|--------|------|-------------|
| Avg Engagement | msgs/customer | Average messages per unique user |
| Peak Hours | Hourly distribution | Activity by time of day |
| Intent Distribution | % breakdown | Classification of user intentions |

---

## 🎨 VISUALIZATIONS REFERENCE

| Chart | Type | Data Source | Purpose |
|-------|------|-------------|---------|
| **Message Volume Trend** | Line Chart | Daily counts | Spot trends over time |
| **Top Intents** | Horizontal Bar | Top 5 intents | Understand user needs |
| **Peak Activity Hours** | Area Chart | Hourly counts | Staffing optimization |
| **Message Types** | Donut/Pie | Type distribution | Content breakdown |
| **Quality Trend** | Bar Chart | Daily scores | Quality over time |
| **Mini Sparklines** | Line (inline) | KPI trends | Quick trend indicator |

---

## 🎯 AI QUALITY INDEX BREAKDOWN

### Score Formula
```
AI Quality Score = (Resolution Rate × 0.7) + (Lead Conversion Rate × 2.5)
Max Score: 100 (capped)
```

### Weighting Explanation

| Component | Weight | Rationale |
|-----------|--------|-----------|
| Resolution Rate | 70% | Primary goal: resolve without human |
| Lead Conversion | 250% | Bonus multiplier for business value |

### Status Thresholds

| Status | Score Range | Action Required |
|--------|-------------|-----------------|
| 🟢 Optimal | 80-100 | None - AI performing excellently |
| 🟡 Stable | 60-79 | Monitor - acceptable performance |
| 🔴 Attention | 0-59 | Investigate - review escalations |

---

## 🏷️ INTENT CLASSIFICATIONS

### High-Value Intents (Conversions)

| Intent | Business Value | Follow-up |
|--------|----------------|-----------|
| `New Get-A-Quote Form Submitted in UAE` | 💰 Revenue | Sales contact |
| `New Contact Form Submitted` | 🔥 Lead | Sales contact |

### Support Intents

| Intent | Priority | Type |
|--------|----------|------|
| `Policy Inquiry` | High | Informational |
| `Claims Status` | Critical | Urgent |
| `Renewal` | Medium | Transactional |
| `Technical Support` | Medium | Problem-solving |

---

## 📱 SUPPORTED MESSAGE TYPES

| Type | Icon | Handler |
|------|------|---------|
| Text | 💬 | Plain display |
| Image | 🖼️ | Thumbnail + lightbox |
| File | 📄 | Download link |
| Audio | 🔊 | Play in browser |
| Video | 🎬 | Open player |
| Location | 📍 | Google Maps link |
| Sticker | 😊 | Small image display |

---

## 🛠️ TECHNICAL SPECIFICATIONS

### Architecture

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Radix UI + Custom |
| Charts | Recharts |

### Database

| Property | Value |
|----------|-------|
| Type | PostgreSQL |
| Host | localhost |
| Port | 5433 (non-standard) |
| Database | aiva |
| Driver | pg (node-postgres) |
| ORM | None (raw SQL) |
| Connection | Pool-based |

### External Services

| Service | Purpose |
|---------|---------|
| OpenAI API | Conversation analysis (GPT-3.5) |
| DiceBear API | Avatar generation |

---

## 🎛️ FILTERING OPTIONS

### Date Range
- Default: Last 30 days
- Custom: Any start/end date combination
- Impact: All metrics and charts recalculate

### Channel Filter
- Options: `all`, `whatsapp`, `web`
- Default: `all`
- Impact: All queries include `WHERE LOWER(channel) = $1`

---

## 📈 AI ANALYSIS OUTPUT

### Sentiment Classification

| Sentiment | Score Range | Color |
|-----------|-------------|-------|
| Positive | 7-10 | 🟢 Green |
| Neutral | 4-6 | ⚪ Gray |
| Negative | 0-3 | 🔴 Red |

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `summary` | String | 2-3 sentence recap |
| `sentiment` | Enum | positive/neutral/negative |
| `sentimentScore` | Number | 0-10 rating |
| `actionItems` | Array | Recommended follow-ups |

---

## ⚡ QUICK TROUBLESHOOTING

| Issue | Check | Fix |
|-------|-------|-----|
| No data showing | Date range filter | Expand to last 90 days |
| Empty charts | Channel filter | Switch to "all" channels |
| AI Analysis fails | API key | Check OPENAI_API_KEY env var |
| Slow loading | Database connection | Verify PostgreSQL on port 5433 |
| Missing conversations | Pagination | Check page number |

---

## 🗄️ DATABASE TABLES

### Primary Table: `Arabia Insurance Chats`

| Column | Type | Used For |
|--------|------|----------|
| `id` | Integer | Primary key |
| `customer_phone` | String | User identification |
| `customer_email_address` | String | Alternative ID |
| `session_id` | String | Web session tracking |
| `customer_name` | String | Display name |
| `message` | Text | Content |
| `direction` | Enum | inbound/outbound |
| `channel` | String | whatsapp/web |
| `message_type` | Enum | text/image/file/etc |
| `intent` | String | AI classification |
| `escalated` | Boolean | Human handover flag |
| `created_at` | Timestamp | Time tracking |

### Secondary Table: `usage_notifications`

| Column | Type | Purpose |
|--------|------|---------|
| `id` | Integer | Primary key |
| `message` | String | Notification text |
| `notification_type` | String | Category |
| `customer_count` | Integer | Impact size |
| `slab_number` | Integer | Tier |
| `notified_at` | Timestamp | When occurred |

---

## 🎤 DEMO TALKING POINTS

### Key Phrases to Use

> "Real-time visibility into AI performance"

> "Business intelligence, not just metrics"

> "AI analyzing AI - meta insights"

> "Multi-channel support - WhatsApp, Web, more"

> "From high-level KPIs to individual conversations"

### Numbers to Memorize

| Metric | Good | Excellent |
|--------|------|-----------|
| Escalation Rate | < 15% | < 10% |
| Resolution Rate | > 85% | > 90% |
| AI Quality Score | 60-80 | 80-100 |
| Avg Engagement | 3-6 | > 5 |

---

**Print this sheet and keep it visible during your demo! 📄**
