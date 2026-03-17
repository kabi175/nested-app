import BuildingNestScreen from "@/components/v2/BuildingNestScreen";
import { useChild } from "@/hooks/useChildren";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";


const TIMEOUT_DURATION = 15 * 1000; // 15 seconds

export default function EducationDetailLoader() {
    const { child_id } = useLocalSearchParams<{

        child_id: string;
    }>();

    const { data: child } = useChild(child_id);

    const onComplete = () => {
        router.push(
            {
                pathname: "/child/[child_id]/preview",
                params: { child_id }

            }
        );
    }

    useEffect(() => {
        const timer = setTimeout(onComplete, TIMEOUT_DURATION);
        return () => clearTimeout(timer);
    }, []);

    return <BuildingNestScreen userName={child?.firstName || "Child"} />;
}