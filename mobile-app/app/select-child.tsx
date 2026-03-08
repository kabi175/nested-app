import SelectChildScreen from "@/components/v2/SelectChildScreen";
import { router } from "expo-router";

export default function SelectChildRoute() {
  return (
    <SelectChildScreen
      onAddChild={() => {
        // Navigate to the add-child flow
        router.push("/child" as any);
      }}
      onContinue={(childId) => {
        // Navigate forward with the selected child
        router.push({ pathname: "/goal/create" as any, params: { childId } });
      }}
    />
  );
}
