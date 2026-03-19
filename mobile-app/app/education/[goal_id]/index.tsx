import StudyAbroadScreen from "@/components/v2/StudyAbroadScreen";
import { router, useLocalSearchParams } from "expo-router";

export default function EducationDetailRoute() {

    const { goal_id } = useLocalSearchParams<{
        goal_id: string;
    }>();

    const onBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push(`/(tabs)`);
        }
    }

    const onStartPlanning = () => {
        router.push(
            {
                pathname: "/education/[goal_id]/loader",
                params: { goal_id }
            }
        );
    }

    return (
        <StudyAbroadScreen
            onBack={onBack}
            onStartPlanning={onStartPlanning}
        />
    );
}
