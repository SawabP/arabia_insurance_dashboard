import { getConversations } from '@/app/actions/messages';
import { ChatInterface } from '@/components/messages/chat-interface';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
    const { conversations, totalCount } = await getConversations();

    return (
        <div className="flex-1 p-4 h-screen">
            <ChatInterface initialConversations={conversations} initialTotalCount={totalCount} />
        </div>
    );
}
