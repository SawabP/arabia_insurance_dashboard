export function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5">
            {children}
        </div>
    );
}
