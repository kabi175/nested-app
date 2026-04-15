import SelectChildScreen from "@/components/v2/SelectChildScreen";
import { logStartPlanning } from "@/services/analytics";
import { router } from "expo-router";

export default function SelectChild() {
    return (
        <SelectChildScreen
            onAddChild={() => router.push("/child/create")}
            onContinue={(childID) => {
                logStartPlanning({ child_id: childID });
                router.push(`/child/${childID}/plan`);
            }}
        />
    )
}