import ChildPathSelectionScreen from "@/components/v2/ChildPathSelectionScreen";
import ErrorScreen from "@/components/v2/ErrorScreen";
import LoadingScreen from "@/components/v2/LoadingScreen";
import { useChild } from "@/hooks/useChildren";
import { useEducation } from "@/hooks/useEducation";
import { router, useLocalSearchParams } from "expo-router";

export default function ChildPathSelectionRoute() {
  const { child_id } = useLocalSearchParams<{
    child_id: string;
  }>();

  const { data: child, isLoading: isChildLoading } = useChild(child_id);
  const {courses, institutions, isLoading: isEducationLoading} = useEducation();

  const isLoading = isChildLoading || isEducationLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!child) {
    return <ErrorScreen />;
  }

  return (
    <ChildPathSelectionScreen
      childName={child?.firstName}
      courses={courses}
      institutions={institutions}
      onBack={() => router.back()}
      onStartPlanning={(pathId, college) => {
        
        const education = college
          ? institutions?.find((i) => i.name === college)
          : courses?.find((c) => c.name === pathId);

        if (!education) return;
        router.push({
          pathname: "/child/[child_id]/education/[education_id]",
          params: { child_id, education_id: education.id },
        });
      }}
      onNotSure={() => {
        // Navigate forward without a specific path
        router.push("/goal/create" as any);
      }}
    />
  );
}
