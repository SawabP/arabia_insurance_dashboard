# 📊 AIVA Dashboard - Detailed Demo Tour Script

> **For:** Arabia Insurance Virtual Assistant (AIVA) Control Center  
> **Purpose:** Comprehensive walkthrough guide for product demonstrations

---

## 🎯 Opening Statement (30 seconds)

> "Welcome to the **AIVA Control Center** - our AI-powered insurance assistant dashboard. AIVA stands for 'Arabia Insurance Virtual Assistant'. This platform gives us real-time visibility into how our AI is handling customer conversations across WhatsApp, Web Chat, and other channels. Let me walk you through the key capabilities."

---

## 🎛️ 1. HEADER & SYSTEM STATUS

**Navigate to:** Dashboard homepage  
**Point to:** Top header area

### What to Say:
> "At the top, we have our system health indicators. The green pulsing dot shows our database is connected, AI services are healthy, and this percentage shows our **AI Health Score** - a real-time calculation of how well the AI is performing."

### System Indicators:

| Indicator | Visual | Meaning |
|-----------|--------|---------|
| DB: Connected | 🟢 Green pulsing dot | PostgreSQL database live on port 5433 |
| AI Services: Healthy | ✅ Checkmark icon | OpenAI integration active |
| AI Health: XX% | ⚡ Lightning icon | Composite quality score |

### Interactive Filters:

**Date Range Picker**
> "We can filter any data by custom date range - default is last 30 days"

**Channel Selector**
> "Filter by specific channels: WhatsApp, Web Chat, or view all channels combined"

---

## 📈 2. KPI CARDS ROW (9 Statistics Cards)

**Point to:** The 3×3 grid of metric cards

### What to Say:
> "These cards give us instant visibility into conversation volume and AI performance. Each card has a mini sparkline showing trends over the selected period."

---

### Core Volume Metrics (Row 1)

| Card | Icon | What It Measures | Demo Script |
|------|------|-----------------|-------------|
| **TOTAL MESSAGES** | 💬 MessageSquare | All inbound + outbound messages | *"This shows total conversation volume across all channels"* |
| **TOTAL CUSTOMERS** | 👥 Users | Unique users (by phone/email/session) | *"Unique individuals who interacted with AIVA - deduplicated"* |
| **ESCALATION RATE** | ⚠️ AlertTriangle | % escalated to human agents | *"Lower is better - shows AI autonomy"* |

---

### AI Quality Metrics (Row 2)

| Card | Icon | What It Measures | Demo Script |
|------|------|-----------------|-------------|
| **AI QUALITY INDEX** | ⭐ Star | Composite score 0-100 | *"Our proprietary algorithm weighing resolution, engagement, and conversion - like a credit score for AI performance"* |
| **RESOLUTION RATE** | 📊 Percent | 100% - Escalation Rate | *"Conversations resolved without human intervention"* |
| **OUTPUT CONVERSION** | 🎯 Target | Lead generation rate | *"High-intent users who completed quote or contact forms - business value"* |

---

### Direction & Engagement Metrics (Row 3)

| Card | Icon | What It Measures | Demo Script |
|------|------|-----------------|-------------|
| **INBOUND** | ↙️ ArrowDownLeft | Messages FROM customers | *"Questions and requests coming in from customers"* |
| **OUTBOUND** | ↗️ ArrowUpRight | Messages TO customers | *"AI responses and proactive messages going out"* |
| **AVG ENGAGEMENT** | ⚡ Zap | Messages per customer | *"Conversation depth - higher means more engaged users. Industry average is 3-6."* |

---

## 🎯 3. STRATEGIC OUTCOMES SECTION

**Point to:** Middle section with two large cards

### What to Say:
> "This section shows our strategic business outcomes. We don't just track volume - we measure quality and business impact with AI-generated insights."

---

### Outcome Scoring Module (Left Card)

**Components to Highlight:**

| Component | Visual | Description |
|-----------|--------|-------------|
| **AI Quality Index** | Large number /100 | Overall AI performance score |
| **Resolution Rate** | % with trend | How many resolved without human help |
| **Output Conversion** | % + lead count | Business conversion tracking |
| **Quality Trend Bar Chart** | Small bars over time | Visual quality trend |

**Status Indicator Logic:**

| Status | Color | Score Range | Meaning |
|--------|-------|-------------|---------|
| 🟢 Optimal | Green | > 80 | AI performing excellently |
| 🟡 Stable | Amber | 60-80 | Acceptable performance |
| 🔴 Attention | Red | < 60 | Needs investigation |

---

### AI Strategic Insights (Right Card)

**What to Say:**
> "This is where AI meets business intelligence. The system analyzes patterns and generates actionable recommendations automatically."

**Insight Types Generated:**

| Insight Type | Trigger Condition | Example Output |
|--------------|-------------------|----------------|
| **High Autonomy** | Resolution Rate > 85% | *"AI resolving 85%+ queries. Opportunity: Expand knowledge base to edge cases."* |
| **Escalation Spike** | Escalation above norm | *"Escalation rate at X%. Check quote intent for payment friction."* |
| **Lead Performance** | Total Leads > 50 | *"Generated X leads at Y% conversion. Recommendation: A/B test greeting."* |
| **UX Optimization** | Always shown | *"Avg 4.2 messages per customer. Implement Quick Reply buttons for Contact Form intent."* |

**Hover Interaction:**
> "Hover over any insight to see the detailed recommendation..."

---

## 📊 4. CHARTS SECTION (Four Visualizations)

**Point to:** 2×2 grid of charts

### What to Say:
> "These four charts give us different lenses into conversation patterns - volume trends, intent classification, staffing optimization, and content breakdown."

---

### Chart 1: Message Volume Trend

| Property | Value |
|----------|-------|
| **Type** | Line Chart |
| **X-Axis** | Date (last 30 days) |
| **Y-Axis** | Message count |
| **Insight** | Spot trends, spikes, or drops in volume |

**Demo Script:**
> "This shows daily message volume. We can spot seasonal trends, campaign impacts, or anomalies that need investigation."

---

### Chart 2: Top Intents

| Property | Value |
|----------|-------|
| **Type** | Horizontal Bar Chart |
| **Data** | Top 5 user intentions |
| **Colors** | Different color per intent |

**Common Intents to Know:**

| Intent | Priority | Business Impact |
|--------|----------|-----------------|
| Policy Inquiry | High | Existing customer engagement |
| Claims Status | Critical | Customer satisfaction |
| New Get-A-Quote Form | Conversion | Revenue opportunity |
| Contact Form Submitted | Lead | Sales follow-up needed |
| Technical Support | Medium | Retention risk |

**Demo Script:**
> "Our AI automatically classifies every message by intent. These are the top 5 reasons customers reach out."

---

### Chart 3: Peak Activity Hours

| Property | Value |
|----------|-------|
| **Type** | Area Chart (gradient fill) |
| **X-Axis** | Hour of day (0-23) |
| **Y-Axis** | Message count |
| **Use Case** | Staffing optimization |

**Demo Script:**
> "This 24-hour heatmap shows when customers are most active. Use this for staffing decisions and scheduling maintenance windows."

---

### Chart 4: Message Types

| Property | Value |
|----------|-------|
| **Type** | Donut/Pie Chart |
| **Categories** | Text, Image, File, Audio, Video, Location |
| **Legend** | Below the chart |

**Demo Script:**
> "Breakdown of content types. Most are text, but we also handle images, documents, voice messages, and location sharing."

---

## 👥 5. RECENT HUMAN ESCALATIONS

**Point to:** Bottom-left table card

### What to Say:
> "This table shows recent conversations that needed human intervention - our safety net for when AI can't handle complex cases, complaints, or sensitive requests."

### Table Columns:

| Column | Content | Example |
|--------|---------|---------|
| **Customer** | Avatar + Name + Identifier | "Ahmed Al-Sayed +97150..." |
| **Last Message** | Truncated preview | "I need to renew my car insurance..." |
| **Status** | Badge | Active / Escalated / Closed |
| **Time** | Relative | "5 minutes ago" |

**Demo Script:**
> "Click any row to see the full conversation thread in the Messages section."

---

## 🔔 6. SYSTEM EVENTS

**Point to:** Bottom-right card

### What to Say:
> "System-level notifications like usage limits, user milestones, or database maintenance events."

### Notification Types:

| Type | Example |
|------|---------|
| Warning | "System usage limits approaching 80%" |
| Info | "New user milestone reached: 3000 users" |
| Success | "Database backup completed successfully" |

---

## 📱 7. MESSAGES PAGE

**Navigate to:** `/messages`

### What to Say:
> "Now let's look at the Messages section - our conversation inspector for drilling into individual customer interactions."

---

### Left Sidebar (Conversation List)

| Feature | Description |
|---------|-------------|
| **Search Box** | Search by customer name or phone number |
| **Conversation List** | Avatar, name, last message preview, timestamp |
| **Pagination** | Navigate through all conversations |
| **Auto-refresh** | List updates every 500ms when searching |

**Demo Script:**
> "We can search for specific customers or browse through paginated conversation history."

---

### Right Panel (Chat Window)

**When No Selection:**
> "Welcome screen - select a conversation to begin"

**When Conversation Selected:**

**Message Types Supported:**

| Type | Visual | Interaction |
|------|--------|-------------|
| **Text** | Speech bubble | Plain text display |
| **Image** | Thumbnail | Click to open full size |
| **File** | File icon + name | Click to download |
| **Audio** | Play icon | Click to play (opens URL) |
| **Video** | Video icon | Click to view |
| **Location** | Map pin | Click to open Google Maps |
| **Sticker** | Small image | Thumbnail display |

**Demo Script:**
> "We support all major message types - not just text. Images are clickable, files downloadable, locations open in Google Maps."

---

### AI Analysis Feature

**How to Demo:**
1. Select any conversation with multiple messages
2. Click **"AI Analyze"** button (top right)
3. Show the overlay animation
4. Reveal the analysis results

**Analysis Components:**

| Component | Description |
|-----------|-------------|
| **Summary** | 2-3 sentence conversation recap |
| **Sentiment** | Positive / Neutral / Negative badge |
| **Sentiment Score** | 0-10 numerical rating |
| **Action Items** | Bullet list of recommended follow-ups |

**Demo Script:**
> "Here's something powerful - we can analyze any conversation with AI. It reads the entire thread and provides a summary, sentiment analysis, and actionable recommendations. This is powered by OpenAI GPT."

---

## 🔔 8. NOTIFICATIONS PAGE

**Navigate to:** `/notifications`

### What to Say:
> "All system notifications centralized in one view - usage alerts, customer count milestones, and tier-based notifications."

### Notification Card Layout:

| Element | Content |
|---------|---------|
| **Icon** | Bell icon in circle |
| **Title** | Notification type |
| **Timestamp** | "2 hours ago", "Yesterday", etc. |
| **Metadata** | Customer count affected, Slab number |

**Demo Script:**
> "These are time-ordered system events. We can see historical notifications and their impact."

---

## 🏁 Closing Statement

> "That's AIVA - a complete command center for our AI assistant. From high-level KPIs to individual conversation analysis, we have full visibility and control. The system not only tracks performance but also generates AI-powered insights for continuous improvement. Any questions?"

---

## 💡 Pro Tips for Demo

| Tip | Why |
|-----|-----|
| **Change date range** | Shows filtering capability |
| **Switch channels** | Demonstrates multi-channel support |
| **Hover on insights** | Reveals hidden recommendations |
| **Click AI Analyze** | Most impressive feature |
| **Show image/file handling** | Proves rich media support |
| **Check mobile responsive** | Shows technical quality |

---

## ⚠️ Demo Safety Checklist

- [ ] Database is running on localhost:5433
- [ ] Date range has data (use last 30 days)
- [ ] OpenAI API key is configured (for AI Analysis)
- [ ] At least one conversation has multiple messages
- [ ] Browser zoom at 100% for optimal layout

---

**Good luck with your demo! 🚀**
