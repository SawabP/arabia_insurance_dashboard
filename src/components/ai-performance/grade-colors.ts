// Semantic color palette from the dashboard spec (section 5).

export const GRADE_COLORS = {
    blue: '#378ADD',
    green: '#1D9E75',
    red: '#E24B4A',
    amber: '#EF9F27',
    coral: '#D85A30',
    teal: '#5DCAA5',
    gray: '#888780',
    darkRed: '#A32D2D',
    darkGreen: '#0F6E56',
    darkAmber: '#854F0B',
} as const;

// Escalation strip colors by type.
export const ESCALATION_COLORS: Record<string, string> = {
    None: '#B4B2A9',
    Natural: GRADE_COLORS.teal,
    Failure: '#F09595',
};

// Funnel step colors (from broad to narrow).
export const FUNNEL_COLORS = ['#B4B2A9', GRADE_COLORS.amber, GRADE_COLORS.coral, GRADE_COLORS.red, GRADE_COLORS.darkRed];

// Frustration histogram bucket colors (low -> high frustration).
export const FRUSTRATION_COLORS = ['#C0DD97', '#9FE1CB', '#FAC775', '#F7C1C1', GRADE_COLORS.red];

// Heatmap: avg satisfaction -> { bg, text } (spec section 5.3).
export function heatColor(v: number): { bg: string; text: string } {
    if (v >= 7.5) return { bg: '#C0DD97', text: '#27500A' };
    if (v >= 6.0) return { bg: '#9FE1CB', text: '#085041' };
    if (v >= 4.5) return { bg: '#FAEEDA', text: '#633806' };
    if (v >= 3.0) return { bg: '#F7C1C1', text: '#791F1F' };
    return { bg: '#F09595', text: '#791F1F' };
}

// Hourly heatmap: resolution rate -> cell color (spec section 5.4).
export function resColor(rate: number): string {
    if (rate < 50) return '#FCEBEB';
    if (rate < 60) return '#FAC775';
    if (rate < 70) return '#9FE1CB';
    if (rate < 80) return '#5DCAA5';
    return '#1D9E75';
}

// Severity -> tailwind-friendly class mapping for attention/story cards.
export const SEVERITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    critical: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    info: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
};
