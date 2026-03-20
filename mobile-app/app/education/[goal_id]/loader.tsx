import BuildingNestScreen from "@/components/v2/BuildingNestScreen";
import { useGoal } from "@/hooks/useGoal";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";


const TIMEOUT_DURATION = 10 * 1000; // 15 seconds

export default function EducationDetailLoader() {
    const { goal_id } = useLocalSearchParams<{
        goal_id: string;
    }>();

    const { data: goal } = useGoal(goal_id);



    const onComplete = () => {
        router.push(
            {
                pathname: "/education/[goal_id]/planner",
                params: { goal_id }
            }
        );
    }

    useEffect(() => {
        const timer = setTimeout(onComplete, TIMEOUT_DURATION);
        return () => clearTimeout(timer);
    }, []);

    return <BuildingNestScreen userName={goal?.child.name || "Child"} />;
}