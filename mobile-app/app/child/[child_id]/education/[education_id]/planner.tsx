import EducationBasedGoalPlanner from "@/components/v2/planner/EducationBasedGoalPlanner";
import { useChild } from "@/hooks/useChildren";
import { useEducation } from "@/hooks/useEducation";
import { useLocalSearchParams } from "expo-router";

export default function GoalPlannerScreen() {
    const { child_id, education_id } = useLocalSearchParams<{
        child_id: string;
        education_id: string;
    }>();

    const { data: child } = useChild(child_id);
    const { data: education } = useEducation(education_id);

    if (!child || !education) {
        return null; // or a loading state
    }

    const targetYear = child.dateOfBirth.getFullYear() + 18; // Assuming the goal is 12 years from now

    return (
        <EducationBasedGoalPlanner
            childName={child.firstName}
            goalYear={targetYear}
            collegeType={education.name}
        />
    )
}