import { nomineeListAtom } from "@/atoms/nominee";
import { NomineeEmptyState } from "@/components/nominee/NomineeEmptyState";
import { NomineeFooter } from "@/components/nominee/NomineeFooter";
import { NomineeFormModal } from "@/components/nominee/NomineeFormModal";
import { NomineeList } from "@/components/nominee/NomineeList";
import { NomineeScreenHeader } from "@/components/nominee/NomineeScreenHeader";
import { useNomineeAllocations } from "@/hooks/useNomineeAllocations";
import { useNomineeManagement } from "@/hooks/useNomineeManagement";
import { useNominees } from "@/hooks/useNominees";
import { Layout, Spinner, Text } from "@ui-kitten/components";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Nominee Management Screen
 * Main screen for managing investment nominees
 */
export default function NomineesScreen() {
  const { data: nominees, isLoading } = useNominees();
  const [, setNomineeList] = useAtom(nomineeListAtom);

  const {
    draft,
    allNominees,
    validationErrors,
    editingIndex,
    pendingNomineeId,
    showFormModal,
    canAddMore,
    handleAddNominee,
    handleEditNominee,
    handleDeleteNominee,
    handleOptOutNominee,
    handleFieldChange,
    handleSaveDraft,
    handleSaveAll,
    handleCancelForm,
  } = useNomineeManagement();

  const { totalAllocation, remainingAllocation } = useNomineeAllocations();

  // Sync nominees from query to atom (merge server data with local changes)
  useEffect(() => {
    if (nominees) {
      setNomineeList((prev) => {
        // Merge: keep local changes (by id), add/update server nominees
        const localById = new Map(
          prev.filter((n) => n.id).map((n) => [n.id, n])
        );
        const localWithoutId = prev.filter((n) => !n.id);

        // Update existing or add new server nominees
        nominees.forEach((n) => {
          if (n.id) {
            localById.set(n.id, n);
          }
        });

        return [...Array.from(localById.values()), ...localWithoutId];
      });
    }
  }, [nominees, setNomineeList]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Layout style={styles.loadingContainer} level="1">
          <Spinner size="large" status="primary" />
          <Text category="s1" style={styles.loadingText}>
            Loading nominees...
          </Text>
        </Layout>
      </SafeAreaView>
    );
  }

  const hasNominees = allNominees.length > 0;
  const calculatedRemainingAllocation =
    editingIndex !== null
      ? remainingAllocation + (allNominees[editingIndex]?.allocation || 0)
      : remainingAllocation;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Layout style={styles.layout} level="1">
        <NomineeScreenHeader
          onAddPress={handleAddNominee}
          showAddMoreButton={hasNominees && canAddMore}
        />

        {!hasNominees ? (
          <NomineeEmptyState
            onAddPress={handleAddNominee}
            onOptOut={handleOptOutNominee}
          />
        ) : (
          <>
            <NomineeList
              nominees={allNominees}
              onEditNominee={handleEditNominee}
              onDeleteNominee={handleDeleteNominee}
            />

            <NomineeFooter
              totalAllocation={totalAllocation}
              draftNomineesCount={allNominees.length}
              onSave={handleSaveAll}
            />
          </>
        )}

        {draft && (
          <NomineeFormModal
            visible={showFormModal}
            draft={draft}
            errors={validationErrors}
            remainingAllocation={calculatedRemainingAllocation}
            isEditMode={editingIndex !== null}
            isEditingExistingNominee={pendingNomineeId !== null}
            onFieldChange={handleFieldChange}
            onSave={handleSaveDraft}
            onCancel={handleCancelForm}
            isSubmitting={false}
          />
        )}
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  layout: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
  },
});
