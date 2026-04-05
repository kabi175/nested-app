import StudyAbroadScreen from "@/components/v2/StudyAbroadScreen";
import { getEducationContent } from "@/constants/educationContent";
import { useGoal } from "@/hooks/useGoal";
import { router, useLocalSearchParams } from "expo-router";

export default function EducationDetailRoute() {

    const { goal_id } = useLocalSearchParams<{
        goal_id: string;
    }>();

    const { data: goalData } = useGoal(goal_id);

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

    const content = getEducationContent(goalData?.education?.name);

    return (
        <StudyAbroadScreen
            onBack={onBack}
            onStartPlanning={onStartPlanning}
            content={content}
        />
    );
}
