import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

export default function TransactionsScreen() {
  const { goal_id } = useLocalSearchParams<{ goal_id: string }>();

  useEffect(() => {
    // Redirect to index with transactions tab
    router.replace({
      pathname: `/goal/[goal_id]`,
      params: { goal_id, tab: "transactions" },
    });
  }, [goal_id]);

  return null;
}
