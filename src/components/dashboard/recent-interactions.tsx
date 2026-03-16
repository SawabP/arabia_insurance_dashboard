
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface RecentInteractionsProps {
    interactions: any[];
}

export function RecentInteractions({ interactions }: RecentInteractionsProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Last Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {interactions.map((interaction, i) => (
                    <TableRow key={i}>
                        <TableCell className="flex items-center gap-3 font-medium">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${interaction.customer_name || 'User'}`} />
                                <AvatarFallback>
                                    {interaction.customer_name ? interaction.customer_name.substring(0, 2).toUpperCase() : 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span>{interaction.customer_name}</span>
                                <span className="text-xs text-muted-foreground">{interaction.identifier}</span>
                            </div>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate text-muted-foreground">
                            {interaction.last_message}
                        </TableCell>
                        <TableCell>
                            <Badge variant={interaction.status === 'escalated' ? 'destructive' : 'secondary'} className="capitalize">
                                {interaction.status || 'Active'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                            {interaction.last_message_time ? formatDistanceToNow(new Date(interaction.last_message_time), { addSuffix: true }) : 'N/A'}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
