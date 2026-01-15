import { useAuth0, User } from "react-native-auth0";

export interface AuthState {
  isSignedIn: boolean | undefined;
  isLoaded: boolean;
  user: User | null | undefined;
}

export function useAuth(): AuthState {
  const { isLoading, user } = useAuth0();
  return {
    isLoaded: isLoading,
    isSignedIn: !!user,
    user: user,
  };
}

export function useSignOut() {
  const { clearSession } = useAuth0();
  return {
    signOut: async function () {
      await clearSession({
        returnToUrl: "nested://sign-in",
      });
    },
  };
}
