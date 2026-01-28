import {
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
import { useUser } from "./useUser";

const MAX_NOMINEES = 3;

export function useNomineeManagement() {
  const { data: user } = useUser();
  const [nomineeList, setNomineeList] = useAtom(nomineeListAtom);
  const [draft, setDraft] = useAtom(nomineeDraftAtom);
  const [pendingNomineeId, setPendingNomineeId] = useAtom(pendingNomineeIdAtom);
  const [validationErrors, setValidationErrors] = useAtom(validationErrorsAtom);
  const setPendingAction = useSetAtom(pendingActionAtom);
  const setMfaState = useSetAtom(mfaStateAtom);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Single list containing all nominees (existing with id, new without id)
  const allNominees = nomineeList;

  const handleAddNominee = () => {
    if (allNominees.length >= MAX_NOMINEES) {
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
        address_line: user?.address?.address_line ?? "",
        city: user?.address?.city ?? "",
        state: user?.address?.state ?? "",
        pin_code: user?.address?.pin_code ?? "",
        country: user?.address?.country ?? "in",
      },
      allocation: 0,
      isMinor: false,
    });
    setEditingIndex(null);
    setPendingNomineeId(null);
    setValidationErrors({});
    setShowFormModal(true);
  };

  const handleEditNominee = (index: number) => {
    const nominee = allNominees[index];
    if (!nominee) return;

    const nomineeDraft = nominee.id
      ? nomineeToDraft(nominee as any)
      : (nominee as NomineeDraft);
    setDraft(nomineeDraft);
    setEditingIndex(index);
    setPendingNomineeId(nominee.id || null);
    setValidationErrors({});
    setShowFormModal(true);
  };

  const handleDeleteNominee = (index: number) => {
    setNomineeList((prev) => prev.filter((_, i) => i !== index));
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

    setDraft((prev) => {
      const draft = prev || {} as NomineeDraft;
      const updatedDraft = { ...draft, [field]: value };
      if (field === "dob") {
        updatedDraft.isMinor = calculateIsMinor(value);
      }

      return updatedDraft;
    });

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
      allNominees.filter((n) => n.id !== undefined) as any[],
      allNominees.filter((n) => !n.id) as NomineeDraft[],
      editingIndex ?? undefined,
      pendingNomineeId ?? undefined
    );

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (editingIndex !== null) {
      // Editing an existing nominee (update in place)
      const { isMinor, ...nomineeUpdate } = draft;
      const updatedNominee = pendingNomineeId
        ? { ...nomineeUpdate, id: pendingNomineeId }
        : (draft as any);

      setNomineeList((prev) =>
        prev.map((n, idx) => (idx === editingIndex ? updatedNominee : n))
      );
    } else {
      // Adding a new nominee
      setNomineeList((prev) => [...prev, draft as any]);
    }

    setDraft(null);
    setEditingIndex(null);
    setPendingNomineeId(null);
    setValidationErrors({});
    setShowFormModal(false);
  };

  const handleSaveAll = () => {
    if (allNominees.length === 0) {
      Alert.alert(
        "No Nominees",
        "Please add at least one nominee before saving."
      );
      return;
    }

    const allocationErrors = validateAllocationTotalForDrafts(
      allNominees.filter((n) => n.id !== undefined) as any[],
      allNominees.filter((n) => !n.id) as NomineeDraft[]
    );
    if (Object.keys(allocationErrors).length > 0) {
      Alert.alert(
        "Validation Error",
        allocationErrors._global || "Please fix the validation errors."
      );
      return;
    }

    for (let i = 0; i < allNominees.length; i++) {
      const nominee = allNominees[i];
      const errors = validateNomineeDraftComplete(
        nominee as NomineeDraft,
        allNominees.filter(
          (n) => n.id !== undefined && n.id !== nominee.id
        ) as any[],
        allNominees.filter((n) => !n.id && n !== nominee) as NomineeDraft[],
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
    setEditingIndex(null);
    setPendingNomineeId(null);
    setValidationErrors({});
  };

  const canAddMore = allNominees.length < MAX_NOMINEES;

  return {
    // State
    draft,
    allNominees,
    validationErrors,
    editingIndex,
    pendingNomineeId,
    showFormModal,
    canAddMore,
    // Handlers
    handleAddNominee,
    handleEditNominee,
    handleDeleteNominee,
    handleOptOutNominee,
    handleFieldChange,
    handleSaveDraft,
    handleSaveAll,
    handleCancelForm,
  };
}
