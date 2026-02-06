import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Message {
    id: string | number;
    customer_name: string;
    customer_phone: string;
    message: string;
    channel: string;
    escalated: string;
    created_at: string;
    intent: string;
}

interface MessagesTableProps {
    messages: Message[];
}

export function MessagesTable({ messages }: MessagesTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Intent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {messages.map((msg) => (
                        <TableRow key={msg.id}>
                            <TableCell className="font-medium">
                                <div>{msg.customer_name || 'Unknown'}</div>
                                <div className="text-xs text-muted-foreground">{msg.customer_phone}</div>
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate">{msg.message}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{msg.channel}</Badge>
                            </TableCell>
                            <TableCell>{msg.intent}</TableCell>
                            <TableCell>
                                {(msg.escalated === 'true' || msg.escalated === 'Yes') && (
                                    <Badge variant="destructive">Escalated</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                                {msg.created_at ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }) : '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
