import LoadingScreen from "@/components/v2/LoadingScreen";
import StudyAbroadScreen from "@/components/v2/StudyAbroadScreen";
import { EducationContent } from "@/constants/educationContent";
import { useGoal } from "@/hooks/useGoal";
import { router, useLocalSearchParams } from "expo-router";

export default function EducationDetailRoute() {

    const { goal_id } = useLocalSearchParams<{
        goal_id: string;
    }>();

    const { data: goalData, isLoading } = useGoal(goal_id);

    const onBack = () => {
        router.push(`/(tabs)`);
    }

    const onStartPlanning = () => {
        router.push(
            {
                pathname: "/education/[goal_id]/loader",
                params: { goal_id }
            }
        );
    }

    if (isLoading) return <LoadingScreen />;

    const DEFAULT_CONTENT: EducationContent = {
        headline: 'Indian college fees have\ntripled in a decade',
        subtitle: 'What cost ₹5L ten years ago now costs ₹15L\n— across colleges in India.',
        chartYearStart: '2016',
        chartYearEnd: '2036',
        quote: '"3x in 10 years, and rising at 10%+ annually.\nStart building a corpus today that\'s ready\nfor tomorrow\'s fees."',
    };


    return (
        <StudyAbroadScreen
            onBack={onBack}
            onStartPlanning={onStartPlanning}
            content={DEFAULT_CONTENT}
        />
    );
}
