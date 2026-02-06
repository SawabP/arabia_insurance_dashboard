import { getConversations } from '@/app/actions/messages';
import { ChatInterface } from '@/components/messages/chat-interface';

export default async function MessagesPage({
    searchParams,
}: {
    searchParams?: {
        query?: string;
    };
}) {
    const query = searchParams?.query || '';
    const { conversations, totalCount } = await getConversations(query);

    return (
        <div className="flex-1 p-4 h-screen">
            <ChatInterface initialConversations={conversations} initialTotalCount={totalCount} />
        </div>
    );
}
