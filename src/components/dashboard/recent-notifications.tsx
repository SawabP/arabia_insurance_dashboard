import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: number;
    notification_type: string;
    notified_at: string;
    customer_count?: number;
}

interface RecentNotificationsProps {
    notifications: Notification[];
}

export function RecentNotifications({ notifications }: RecentNotificationsProps) {
    return (
        <div className="space-y-8">
            {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{notification.notification_type}</p>
                        <p className="text-sm text-muted-foreground">
                            {notification.customer_count ? `${notification.customer_count} customers affected` : 'System alert'}
                        </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.notified_at), { addSuffix: true })}
                    </div>
                </div>
            ))}
        </div>
    );
}
