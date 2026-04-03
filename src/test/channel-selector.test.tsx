import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChannelSelector } from '@/components/dashboard/channel-selector';

const push = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
    useSearchParams: () => mockSearchParams,
}));

describe('ChannelSelector', () => {
    beforeEach(() => {
        push.mockReset();
        mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
    });

    it('pushes web when Email is clicked', () => {
        render(<ChannelSelector />);

        fireEvent.click(screen.getByRole('button', { name: 'Email' }));

        expect(push).toHaveBeenCalledWith('?channel=web');
    });

    it('keeps whatsapp unchanged when WhatsApp is clicked', () => {
        render(<ChannelSelector />);

        fireEvent.click(screen.getByRole('button', { name: 'WhatsApp' }));

        expect(push).toHaveBeenCalledWith('?channel=whatsapp');
    });
});
