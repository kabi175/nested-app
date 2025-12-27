import {
  draftNomineesAtom,
  mfaStateAtom,
  nomineeDraftAtom,
  nomineeListAtom,
  pendingActionAtom,
  pendingNomineeIdAtom,
  validationErrorsAtom,
} from "@/atoms/nominee";
import type { NomineeDraft } from "@/types/nominee";
import {
  calculateIsMinor,
  formatDateToYYYYMMDD,
  nomineeToDraft,
} from "@/utils/nominee";
import {
  validateAllocationTotalForDrafts,
  validateNomineeDraftComplete,
} from "@/utils/nomineeValidation";
import { router } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import { useState } from "react";
import { Alert } from "react-native";

const MAX_NOMINEES = 3;

export function useNomineeManagement() {
  const [nomineeList] = useAtom(nomineeListAtom);
  const [draftNominees, setDraftNominees] = useAtom(draftNomineesAtom);
  const [draft, setDraft] = useAtom(nomineeDraftAtom);
  const [pendingNomineeId, setPendingNomineeId] = useAtom(pendingNomineeIdAtom);
  const [validationErrors, setValidationErrors] = useAtom(validationErrorsAtom);
  const setPendingAction = useSetAtom(pendingActionAtom);
  const setMfaState = useSetAtom(mfaStateAtom);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDraftIndex, setEditingDraftIndex] = useState<number | null>(
    null
  );

  const activeNominees = nomineeList;

  const handleAddNominee = () => {
    const totalCount = activeNominees.length + draftNominees.length;
    if (totalCount >= MAX_NOMINEES) {
      Alert.alert(
        "Limit Reached",
        `You can add up to ${MAX_NOMINEES} nominees.`
      );
      return;
    }

    setDraft({
      name: "",
      relationship: "spouse",
      dob: formatDateToYYYYMMDD(new Date()),
      pan: "",
      email: "",
      mobileNumber: "",
      address: {
        address_line: "",
        city: "",
        state: "",
        pin_code: "",
        country: "",
      },
      allocation: 0,
      isMinor: false,
    });
    setEditingDraftIndex(null);
    setPendingNomineeId(null);
    setValidationErrors({});
    setShowFormModal(true);
  };

  const handleEditNominee = (nomineeId: number) => {
    const nominee = nomineeList.find((n) => n.id === nomineeId);
    if (!nominee) return;

    const nomineeDraft = nomineeToDraft(nominee);
    setDraft(nomineeDraft);
    setEditingDraftIndex(null);
    setPendingNomineeId(nomineeId);
    setValidationErrors({});
    setShowFormModal(true);
  };

  const handleEditDraftNominee = (index: number) => {
    const draftNominee = draftNominees[index];
    if (!draftNominee) return;

    setDraft({ ...draftNominee });
    setEditingDraftIndex(index);
    setPendingNomineeId(null);
    setValidationErrors({});
    setShowFormModal(true);
  };

  const handleDeleteDraftNominee = (index: number) => {
    setDraftNominees((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptOutNominee = () => {
    // Set pending action to optOut and navigate to verify screen
    setPendingAction("optOut");
    setPendingNomineeId(null);
    setMfaState("pending");
    router.push("/nominees/verify");
  };

  const handleFieldChange = (field: keyof NomineeDraft, value: any) => {
    if (!draft) return;

    const updatedDraft = { ...draft, [field]: value };

    if (field === "dob") {
      updatedDraft.isMinor = calculateIsMinor(value);
    }

    setDraft(updatedDraft);

    if (validationErrors[field as keyof typeof validationErrors]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field as keyof typeof validationErrors];
      setValidationErrors(newErrors);
    }
  };

  const handleSaveDraft = () => {
    if (!draft) return;

    const errors = validateNomineeDraftComplete(
      draft,
      nomineeList,
      draftNominees,
      editingDraftIndex ?? undefined
    );

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (editingDraftIndex !== null) {
      setDraftNominees((prev) =>
        prev.map((n, idx) => (idx === editingDraftIndex ? draft : n))
      );
    } else {
      setDraftNominees((prev) => [...prev, draft]);
    }

    setDraft(null);
    setEditingDraftIndex(null);
    setValidationErrors({});
    setShowFormModal(false);
  };

  const handleSaveAll = () => {
    if (draftNominees.length === 0) {
      Alert.alert(
        "No Nominees",
        "Please add at least one nominee before saving."
      );
      return;
    }

    const allocationErrors = validateAllocationTotalForDrafts(
      nomineeList,
      draftNominees
    );
    if (Object.keys(allocationErrors).length > 0) {
      Alert.alert(
        "Validation Error",
        allocationErrors._global || "Please fix the validation errors."
      );
      return;
    }

    for (let i = 0; i < draftNominees.length; i++) {
      const draft = draftNominees[i];
      const errors = validateNomineeDraftComplete(
        draft,
        nomineeList,
        draftNominees,
        i
      );
      if (Object.keys(errors).length > 0) {
        Alert.alert(
          "Validation Error",
          `Please fix errors in nominee ${i + 1}.`
        );
        return;
      }
    }

    router.push("/nominees/verify");
  };

  const handleCancelForm = () => {
    setShowFormModal(false);
    setDraft(null);
    setEditingDraftIndex(null);
    setPendingNomineeId(null);
    setValidationErrors({});
  };

  const canAddMore =
    activeNominees.length + draftNominees.length < MAX_NOMINEES;

  return {
    // State
    draft,
    draftNominees,
    activeNominees,
    validationErrors,
    editingDraftIndex,
    pendingNomineeId,
    showFormModal,
    canAddMore,
    // Handlers
    handleAddNominee,
    handleEditNominee,
    handleEditDraftNominee,
    handleDeleteDraftNominee,
    handleOptOutNominee,
    handleFieldChange,
    handleSaveDraft,
    handleSaveAll,
    handleCancelForm,
  };
}
