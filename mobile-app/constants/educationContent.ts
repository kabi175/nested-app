export type EducationContent = {
    headline: string;
    subtitle: string;
    chartYearStart: string;
    chartYearEnd: string;
    quote: string;
};

const EDUCATION_CONTENT_MAP: Array<{ keywords: string[]; content: EducationContent }> = [
    {
        keywords: ['abroad'],
        content: {
            headline: 'Studying abroad has\nnever been cheap',
            subtitle: 'A 4-year abroad degree that cost ₹20L in 2010\ncosts ₹75L today.',
            chartYearStart: '2010',
            chartYearEnd: '2037',
            quote: '"That\'s 3.5x in 15 years. Rupee depreciation is steep, \nand costs are growing at 8%+ — and it\'s not slowing down"',
        },
    },
    {
        keywords: ['mba', 'iim'],
        content: {
            headline: 'An IIM MBA now costs\nover 25L',
            subtitle: 'Fees have doubled in the last 8 years alone.',
            chartYearStart: '2018',
            chartYearEnd: '2026',
            quote: '"And that\'s before living costs\nand lost income."',
        },
    },
    {
        keywords: ['mbbs', 'medical'],
        content: {
            headline: 'MBBS fees have tripled\nin 15 years',
            subtitle: '₹4L in 2010 → ₹14L today → ₹38L by 2037',
            chartYearStart: '2010',
            chartYearEnd: '2026',
            quote: '"Private medical seats are rising\nfaster than inflation."',
        },
    },
    {
        keywords: ['iit', 'engineering'],
        content: {
            headline: 'Even IIT fees have quietly\nrisen 8x since 2000',
            subtitle: '₹25K/year in 2000 → ₹2.2L/year today',
            chartYearStart: '2000',
            chartYearEnd: '2026',
            quote: '"Coaching, living costs, and private\nalternatives add up fast."',
        },
    },
];

const DEFAULT_CONTENT: EducationContent = EDUCATION_CONTENT_MAP[0].content;

export function getEducationContent(name: string | undefined): EducationContent {
    if (!name) return DEFAULT_CONTENT;
    const lower = name.toLowerCase();
    const match = EDUCATION_CONTENT_MAP.find(({ keywords }) =>
        keywords.some((k) => lower.includes(k))
    );
    return match?.content ?? DEFAULT_CONTENT;
}
