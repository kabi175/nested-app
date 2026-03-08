import ChildPathSelectionScreen from "@/components/v2/ChildPathSelectionScreen";
import ErrorScreen from "@/components/v2/ErrorScreen";
import LoadingScreen from "@/components/v2/LoadingScreen";
import { useChild } from "@/hooks/useChildren";
import { router, useLocalSearchParams } from "expo-router";

export default function ChildPathSelectionRoute() {
  const { child_id } = useLocalSearchParams<{
    child_id: string;
  }>();

  const { data: child, isLoading } = useChild(child_id);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!child) {
    return <ErrorScreen />;
  }

  return (
    <ChildPathSelectionScreen
      childName={child?.firstName}
      onBack={() => router.back()}
      onStartPlanning={(pathId, college) => {
        // Navigate forward with the selected path or college
        router.push({
          pathname: "/goal/create" as any,
          params: { pathId: pathId ?? undefined, college: college ?? undefined },
        });
      }}
      onNotSure={() => {
        // Navigate forward without a specific path
        router.push("/goal/create" as any);
      }}
    />
  );
}
