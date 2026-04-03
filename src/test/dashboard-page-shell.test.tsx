import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { DashboardPageShell } from '@/components/dashboard/dashboard-page-shell';

const push = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
    useSearchParams: () => mockSearchParams,
}));

describe('DashboardPageShell', () => {
    beforeEach(() => {
        push.mockReset();
        mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
    });

    it('shows dashboard skeletons immediately after a channel click', () => {
        render(
            <DashboardPageShell>
                <div>loaded dashboard content</div>
            </DashboardPageShell>,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Email' }));

        expect(screen.getByTestId('dashboard-content-skeleton')).toBeInTheDocument();
        expect(screen.queryByText('loaded dashboard content')).not.toBeInTheDocument();
    });
});
