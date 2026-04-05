import ErrorScreen from "@/components/v2/ErrorScreen";
import LoadingScreen from "@/components/v2/LoadingScreen";
import WhenNeededScreen from "@/components/v2/WhenNeededScreen";
import { useChild } from "@/hooks/useChildren";
import { useEducation } from "@/hooks/useEducation";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { calculateFutureCost } from "@/utils/goalForm";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function NeedAgeRoute() {
  const { child_id, education_id } = useLocalSearchParams<{ child_id: string, education_id?: string }>();
  const { data: child, isLoading } = useChild(child_id);
  const { data: education } = useEducation(education_id)
  const createGoalMutation = useGoalCreation();

  if (isLoading) return <LoadingScreen />;
  if (!child) return <ErrorScreen />;

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FAFAFA" />
      <WhenNeededScreen
        child={child}
        loading={createGoalMutation.isPending}
        onBack={() => router.back()}
        onStartPlanning={async (selectedAge) => {
          const targetyear = child.dateOfBirth.getFullYear() + selectedAge;

          const targetDate = new Date(child.dateOfBirth);
          targetDate.setFullYear(targetyear)

          const [goal] = await createGoalMutation.mutateAsync([
            {
              childId: child.id,
              educationId: education_id || "",
              title: `${child.firstName}'s Graduation`,
              targetAmount: calculateFutureCost(education, targetyear),
              targetDate,
            },
          ]);

          if (education_id) {
            const gaol_id = goal.id;
            router.push({
              pathname: "/education/[gaol_id]",
              params: { gaol_id },
            });
          } else {
            router.push({
              pathname: "/child/[child_id]/[goal_id]/planner",
              params: { child_id, goal_id: goal.id },
            });
          }
        }}
      />
    </>
  );
}
