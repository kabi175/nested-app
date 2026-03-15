import SelectChildScreen from "@/components/v2/SelectChildScreen";
import { router } from "expo-router";

export default function SelectChild() {
    return (
        <SelectChildScreen
            onAddChild={() => router.push("/child/create")}
            onContinue={(childID) => router.push(`/child/${childID}/child-path-selection`)}
        />
    )
}