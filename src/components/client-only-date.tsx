'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ClientOnlyDateProps {
    date: string | Date;
}

export function ClientOnlyDate({ date }: ClientOnlyDateProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <>{formatDistanceToNow(new Date(date), { addSuffix: false })}</>
    );
}
