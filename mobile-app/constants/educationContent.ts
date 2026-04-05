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
        keywords: ['Arts & Design'],
        content: {
            headline: 'Arts degrees don\'t come\ncheap anymore',
            subtitle: 'A premier Arts degree that cost ₹5L a decade ago\nnow costs ₹15L today.',
            chartYearStart: '2016',
            chartYearEnd: '2036',
            quote: '"That\'s 3x in 10 years. Arts is a serious career\npath — and with costs set to rise at 10%+ annually,\nit\'s only getting more expensive."',
        },
    },
    {
        keywords: ['Top colleges India'],
        content: {
            headline: 'Top colleges are getting\nharder to afford',
            subtitle: 'A premier UG degree that cost ₹7L a decade ago\nnow costs ₹20L today.',
            chartYearStart: '2016',
            chartYearEnd: '2036',
            quote: '"That\'s 3x in 10 years. Whether it\'s BTech, BArch,\nor any other course — costs are set to rise at 10%+\nannually, and the gap keeps widening."',
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

const DEFAULT_CONTENT: EducationContent = {
    headline: 'Indian college fees have\ntripled in a decade',
    subtitle: 'What cost ₹5L ten years ago now costs ₹15L\n— across colleges in India.',
    chartYearStart: '2016',
    chartYearEnd: '2036',
    quote: '"3x in 10 years, and rising at 10%+ annually.\nStart building a corpus today that\'s ready\nfor tomorrow\'s fees."',
};

export function getEducationContent(name: string | undefined): EducationContent {
    if (!name) return DEFAULT_CONTENT;
    const lower = name.toLowerCase();
    const match = EDUCATION_CONTENT_MAP.find(({ keywords }) =>
        keywords.some((k) => lower.includes(k.toLowerCase()))
    );
    return match?.content ?? DEFAULT_CONTENT;
}
