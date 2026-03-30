import { NomineeForm } from "@/components/nominee/NomineeFormModal";
import { useNomineeAllocations } from "@/hooks/useNomineeAllocations";
import { useNomineeManagement } from "@/hooks/useNomineeManagement";
import {
  editingIndexAtom,
  nomineeDraftAtom,
  nomineeListAtom,
  pendingNomineeIdAtom,
  validationErrorsAtom,
} from "@/atoms/nominee";
import { useAtomValue } from "jotai";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddNomineeScreen() {
  const draft = useAtomValue(nomineeDraftAtom);
  const errors = useAtomValue(validationErrorsAtom);
  const editingIndex = useAtomValue(editingIndexAtom);
  const pendingNomineeId = useAtomValue(pendingNomineeIdAtom);
  const allNominees = useAtomValue(nomineeListAtom);
  const { remainingAllocation } = useNomineeAllocations();

  const { handleFieldChange, handleSaveDraft, handleCancelForm } =
    useNomineeManagement();

  if (!draft) return null;

  // When editing, add back this nominee's current allocation so the user
  // can adjust within their own budget.
  const calculatedRemainingAllocation =
    editingIndex !== null
      ? remainingAllocation + (allNominees[editingIndex]?.allocation || 0)
      : remainingAllocation;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <NomineeForm
        draft={draft}
        errors={errors}
        remainingAllocation={calculatedRemainingAllocation}
        isEditMode={editingIndex !== null}
        isEditingExistingNominee={pendingNomineeId !== null}
        onFieldChange={handleFieldChange}
        onSave={handleSaveDraft}
        onCancel={handleCancelForm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
