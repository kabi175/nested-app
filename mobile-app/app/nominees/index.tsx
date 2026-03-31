import { nomineeListAtom } from "@/atoms/nominee";
import { MfaModal } from "@/components/nominee/MfaModal";
import { NomineeEmptyState } from "@/components/nominee/NomineeEmptyState";
import { NomineeFooter } from "@/components/nominee/NomineeFooter";
import { NomineeList } from "@/components/nominee/NomineeList";
import { NomineeScreenHeader } from "@/components/nominee/NomineeScreenHeader";
import { useNomineeAllocations } from "@/hooks/useNomineeAllocations";
import { useNomineeManagement } from "@/hooks/useNomineeManagement";
import { useNominees } from "@/hooks/useNominees";
import { useUpsertNominees } from "@/hooks/useUpsertNominees";
import { draftToPayload } from "@/utils/nominee";
import { Layout, Spinner, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NomineesScreen() {
  const { data: nominees, isLoading } = useNominees();
  const [nomineeList, setNomineeList] = useAtom(nomineeListAtom);
  const upsertNomineesMutation = useUpsertNominees();

  const {
    allNominees,
    canAddMore,
    showVerifyModal,
    handleAddNominee,
    handleEditNominee,
    handleDeleteNominee,
    handleOptOutNominee,
    handleSaveAll,
    handleCancelVerify,
  } = useNomineeManagement();

  const { totalAllocation } = useNomineeAllocations();

  // Sync nominees from query to atom (merge server data with local changes)
  useEffect(() => {
    if (nominees) {
      setNomineeList((prev) => {
        const localById = new Map(
          prev.filter((n) => n.id).map((n) => [n.id, n])
        );
        const localWithoutId = prev.filter((n) => !n.id);
        nominees.forEach((n) => {
          if (n.id) localById.set(n.id, n);
        });
        return [...Array.from(localById.values()), ...localWithoutId];
      });
    }
  }, [nominees, setNomineeList]);

  const handleVerify = async (_otp: string) => {
    const payloads = nomineeList.map((n) => {
      const payload = draftToPayload(n as any);
      return n.id ? { ...payload, id: n.id } : payload;
    });
    await upsertNomineesMutation.mutateAsync(payloads);
    setNomineeList([]);
    router.replace("/nominees/success");
  };

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

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Layout style={styles.layout} level="1">
        <NomineeScreenHeader
          onAddPress={handleAddNominee}
          showAddMoreButton={false}
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
              canAddMore={canAddMore}
              onSave={handleSaveAll}
              onAdd={handleAddNominee}
            />
          </>
        )}
      </Layout>

      <MfaModal
        visible={showVerifyModal}
        action="save"
        onVerify={handleVerify}
        onCancel={handleCancelVerify}
      />
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
