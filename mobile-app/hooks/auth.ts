import { FirebaseAuthTypes, signOut } from "@react-native-firebase/auth";
import { createContext, useContext } from "react";

export const defaultAuthState: AuthState = {
  isLoaded: false,
  isSignedIn: undefined,
  user: undefined,
};

export const FirebaseAuthContext = createContext<AuthState>(defaultAuthState);

export interface AuthState {
  isSignedIn: boolean | undefined;
  isLoaded: boolean;
  user: FirebaseAuthTypes.User | null | undefined;
}

export function useAuth(): AuthState {
  const auth = useContext(FirebaseAuthContext);
  return auth;
}

export function useSignOut() {
  return { signOut };
}
