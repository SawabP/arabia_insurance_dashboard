'use server';

import OpenAI from 'openai';
import { Message } from './messages';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAnalysisResult {
    summary: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    sentimentScore: number; // 0 to 10
    actionItems?: string[];
}

export async function analyzeConversation(messages: Message[]): Promise<AIAnalysisResult> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API Key is missing');
    }

    // Format messages for the prompt
    // Sort by date just in case, though they should come sorted
    const sortedMessages = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const transcript = sortedMessages
        .map(m => `[${m.direction === 'inbound' ? 'Customer' : 'Agent'}]: ${m.message}`)
        .join('\n');

    const prompt = `
    Analyze the following conversation transcript between a Customer and an Agent.
    
    Transcript:
    ${transcript}
    
    Please provide:
    1. A concise summary of the conversation (max 3 sentences).
    2. The overall sentiment of the customer (positive, neutral, or negative).
    3. A sentiment score from 0 (very negative) to 10 (very positive).
    4. Any actionable next steps or follow-ups required.

    Return the result in JSON format with the following keys: "summary", "sentiment", "sentimentScore", "actionItems".
  `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful AI assistant analyzing customer service conversations.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error('No content returned from OpenAI');

        const result = JSON.parse(content);

        return {
            summary: result.summary,
            sentiment: result.sentiment?.toLowerCase() || 'neutral',
            sentimentScore: result.sentimentScore || 5,
            actionItems: Array.isArray(result.actionItems) ? result.actionItems : [],
        };
    } catch (error) {
        console.error('Error analyzing conversation:', error);
        throw new Error('Failed to analyze conversation');
    }
}
