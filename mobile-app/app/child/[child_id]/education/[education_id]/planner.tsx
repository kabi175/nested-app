import { CreateGoalRequest } from "@/api/goalApi";
import EducationBasedGoalPlanner from "@/components/v2/planner/EducationBasedGoalPlanner";
import { useChild } from "@/hooks/useChildren";
import { useEducation } from "@/hooks/useEducation";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { calculateFutureCost } from "@/utils/goalForm";
import { useLocalSearchParams } from "expo-router";

export default function GoalPlannerScreen() {
    const { child_id, education_id } = useLocalSearchParams<{
        child_id: string;
        education_id: string;
    }>();

    const { data: child } = useChild(child_id);
    const { data: education } = useEducation(education_id);
    const goalCreation = useGoalCreation();

    if (!child || !education) {
        return null; // or a loading state
    }

    const targetYear = child.dateOfBirth.getFullYear() + 18; // Assuming the goal is 12 years from now

    const targetDate = new Date();
    targetDate.setFullYear(targetYear);

    const goal: CreateGoalRequest = {
        childId: child.id,
        educationId: education.id,
        title: `${child.firstName}'s Graduation`,
        targetAmount: calculateFutureCost(education, targetYear), // This can be calculated based on the education type and target year
        targetDate: targetDate, // This can be set to the target year
    }

    const onBegin = async () => {
        await goalCreation.mutateAsync([goal]);
        // TODO: place order after this
    }

    return (
        <EducationBasedGoalPlanner
            childName={child.firstName}
            goalYear={targetYear}
            collegeType={education.name}
            onBegin={onBegin}
        />
    )
}