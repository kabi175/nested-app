import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

export default function HoldingsScreen() {
  const { goal_id } = useLocalSearchParams<{ goal_id: string }>();

  useEffect(() => {
    // Redirect to index with holdings tab
    router.replace({
      pathname: `/goal/[goal_id]`,
      params: { goal_id, tab: "holdings" },
    });
  }, [goal_id]);

  return null;
}
