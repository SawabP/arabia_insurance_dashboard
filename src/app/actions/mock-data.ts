
export function getMockDashboardStats(startDate: Date, endDate: Date) {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // Scale stats based on days (baseline is 30 days)
    const factor = diffDays / 30;

    return {
        totalChats: Math.floor(12450 * factor),
        escalationRate: 15.2, // Keep rate relatively constant
        activeUsers: Math.floor(3420 * factor),
        inbound: Math.floor(8500 * factor),
        outbound: Math.floor(3950 * factor),
        recentNotifications: [
            { id: 1, message: "System usage limits approaching 80%", type: "warning", notified_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
            { id: 2, message: "New user milestone reached: 3000 users", type: "info", notified_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
            { id: 3, message: "Database backup completed successfully", type: "success", notified_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
        ]
    };
}

export function getMockVolumeData(startDate: Date, endDate: Date) {
    const data = [];
    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        // Generate pseudo-random consistent number based on date
        const seed = current.getDate() + current.getMonth() * 30;
        const count = Math.floor(100 + (seed * 7 % 100) + Math.random() * 50);

        data.push({
            date: current.toISOString(),
            count: count
        });
        current.setDate(current.getDate() + 1);
    }
    return data;
}

export const MOCK_INTENT_DATA = [
    { intent: "Policy Inquiry", count: 450 },
    { intent: "Claims Status", count: 320 },
    { intent: "Renewal", count: 280 },
    { intent: "New Quote", count: 210 },
    { intent: "Technical Support", count: 150 },
];

export const MOCK_RECENT_INTERACTIONS = [
    { customer_name: "Ahmed Al-Sayed", customer_phone: "+971501234567", last_message: "I need to renew my car insurance", last_message_time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: "active" },
    { customer_name: "Sarah Jones", customer_phone: "+971559876543", last_message: "What is the status of my claim #123?", last_message_time: new Date(Date.now() - 1000 * 60 * 15).toISOString(), status: "escalated" },
    { customer_name: "Mohammed Ali", customer_phone: "+971523334444", last_message: "Thanks for your help", last_message_time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), status: "closed" },
    { customer_name: "Fatima Hassan", customer_phone: "+971507778888", last_message: "Can I upgrade my policy?", last_message_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), status: "active" },
    { customer_name: "John Smith", customer_phone: "+971561112222", last_message: "How do I file a complaint?", last_message_time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: "escalated" },
];

export const MOCK_CONVERSATIONS = [
    { customer_phone: "+971501234567", customer_name: "Ahmed Al-Sayed", last_message: "I need to renew my car insurance", last_message_time: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { customer_phone: "+971559876543", customer_name: "Sarah Jones", last_message: "What is the status of my claim #123?", last_message_time: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    { customer_phone: "+971523334444", customer_name: "Mohammed Ali", last_message: "Thanks for your help", last_message_time: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { customer_phone: "+971507778888", customer_name: "Fatima Hassan", last_message: "Can I upgrade my policy?", last_message_time: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { customer_phone: "+971561112222", customer_name: "John Smith", last_message: "How do I file a complaint?", last_message_time: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
];

export const MOCK_MESSAGES = [
    // Ahmed Al-Sayed
    { id: 1, customer_phone: "+971501234567", message: "Hello", direction: "inbound", created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), channel: "whatsapp" },
    { id: 2, customer_phone: "+971501234567", message: "Hi Ahmed, how can I help you?", direction: "outbound", created_at: new Date(Date.now() - 1000 * 60 * 9).toISOString(), channel: "whatsapp" },
    { id: 3, customer_phone: "+971501234567", message: "I need to renew my car insurance", direction: "inbound", created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), channel: "whatsapp" },

    // Sarah Jones
    { id: 4, customer_phone: "+971559876543", message: "Hi", direction: "inbound", created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(), channel: "web" },
    { id: 5, customer_phone: "+971559876543", message: "What is the status of my claim #123?", direction: "inbound", created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), channel: "web" },

    // Mohammed Ali
    { id: 6, customer_phone: "+971523334444", message: "Hello, I received a notification about a discount?", direction: "inbound", created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(), channel: "whatsapp" },
    { id: 7, customer_phone: "+971523334444", message: "Yes, we have a 10% discount for renewals this month!", direction: "outbound", created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(), channel: "whatsapp" },
    { id: 8, customer_phone: "+971523334444", message: "Thanks for your help", direction: "inbound", created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), channel: "whatsapp" },

    // Fatima Hassan
    { id: 9, customer_phone: "+971507778888", message: "Can I upgrade my policy?", direction: "inbound", created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), channel: "whatsapp" },

    // John Smith
    { id: 10, customer_phone: "+971561112222", message: "I want to cancel my policy", direction: "inbound", created_at: new Date(Date.now() - 1000 * 60 * 130).toISOString(), channel: "web" },
    { id: 11, customer_phone: "+971561112222", message: "We are sorry to hear that. How do I file a complaint?", direction: "outbound", created_at: new Date(Date.now() - 1000 * 60 * 125).toISOString(), channel: "web" },
    { id: 12, customer_phone: "+971561112222", message: "How do I file a complaint?", direction: "inbound", created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), channel: "web" },
];


