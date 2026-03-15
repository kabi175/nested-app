import StudyAbroadScreen from "@/components/v2/StudyAbroadScreen";
import { router, useLocalSearchParams } from "expo-router";

export default function EducationDetailRoute() {

    const { child_id, education_id } = useLocalSearchParams<{
        child_id: string;
        education_id: string;
    }>();

    const onBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push(`/child/${child_id}/child-path-selection`);
        }
    }

    const onStartPlanning = () => {
        router.push(
            {
                pathname: "/child/[child_id]/education/[education_id]/loader",
                params: { child_id, education_id }
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
