import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const ONBOARDING_SEEN_KEY = "onboarding_seen";

/**
 * Returns whether the onboarding has already been shown to this user.
 *
 * - `seen === null`  → still loading from storage
 * - `seen === false` → first launch, show onboarding
 * - `seen === true`  → already seen, skip straight to sign-in
 */
export function useOnboardingSeen() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_SEEN_KEY).then((value) => {
      setSeen(value === "true");
    });
  }, []);

  const markSeen = async () => {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    setSeen(true);
  };

  return { seen, markSeen };
}
