import React from 'react';
import { render, screen } from '@testing-library/react';
import { listMonitoringConversations } from '@/app/actions/monitoring';
import { ConversationTable } from '@/components/monitoring/conversation-table';
import { GradePanel } from '@/components/monitoring/grade-panel';
import { backendRequest } from '@/lib/backend-api';

vi.mock('@/lib/backend-api', () => ({
    backendRequest: vi.fn(),
}));

describe('monitoring frustration regression', () => {
    it('preserves the requested sort direction when sorting by frustration score', async () => {
        vi.mocked(backendRequest).mockResolvedValueOnce({} as never);

        await listMonitoringConversations({ sort_by: 'frustration_score', sort_direction: 'asc' });

        expect(backendRequest).toHaveBeenCalledWith(
            '/api/v1/monitoring/conversations',
            expect.objectContaining({
                searchParams: expect.objectContaining({
                    sort_by: 'frustration_score',
                    sort_direction: 'asc',
                }),
            }),
        );
    });

    it('shows the raw frustration score and label in the monitoring grade panel', () => {
        render(
            <GradePanel
                panel={{
                    ai_performance: {},
                    conversation_health: {},
                    user_signals: {
                        frustration_score: 2.5,
                        frustration_reasoning: 'Customer was clearly annoyed.',
                    },
                    escalation: {},
                    intent: {},
                }}
            />,
        );

        expect(screen.getByText('Frustration')).toBeInTheDocument();
        expect(screen.getByText('2.5/10')).toBeInTheDocument();
    });

    it('renders the monitoring table with the raw frustration column and values', () => {
        render(
            <ConversationTable
                items={[
                    {
                        grade_id: 'grade-1',
                        grade_date: '2026-03-15T00:00:00Z',
                        conversation_key: 'conv-1',
                        contact_name: 'Nadia',
                        latest_message_preview: null,
                        latest_message_at: null,
                        message_count: 0,
                        intent_code: 'complaint',
                        intent_label: 'Complaint',
                        intent_category: 'Support',
                        resolution: false,
                        escalation_type: 'Failure',
                        frustration_score: 3,
                        accuracy_score: 8,
                        highlights: [],
                    },
                ]}
                selectedGradeId={null}
                onSelect={() => {}}
                total={1}
                page={1}
                limit={50}
                onPageChange={() => {}}
            />,
        );

        expect(screen.getByText('Frust.')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });
});
