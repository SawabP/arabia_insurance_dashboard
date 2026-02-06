import { getNotifications } from '@/app/actions/notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Users, AlertCircle } from 'lucide-react';

export default async function NotificationsPage() {
    const notifications = await getNotifications();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-1">
                {notifications.map((notification) => (
                    <Card key={notification.id}>
                        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded-full">
                                    <Bell className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-medium">
                                        {notification.notification_type}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.notified_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6 text-sm">
                                {notification.customer_count && (
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{notification.customer_count} Customers Affected</span>
                                    </div>
                                )}
                                {notification.slab_number && (
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        <span>Slab {notification.slab_number}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
