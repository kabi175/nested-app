import { defaultAuthState, FirebaseAuthContext, useAuth } from "@/hooks/auth";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
} from "@react-native-firebase/auth";
import { useEffect, useState } from "react";

export function AuthLoaded({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const auth = useAuth(); // to ensure auth is loaded

  if (auth.isLoaded) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function SignedIn({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const auth = useAuth();

  if (auth.isSignedIn) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

export function SignedOut({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const auth = useAuth();

  if (auth.isSignedIn === false) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authState, setAuthState] = useState(defaultAuthState);

  useEffect(() => {
    const subscriber = onAuthStateChanged(
      getAuth(),
      (user: FirebaseAuthTypes.User | null) => {
        setAuthState({
          isLoaded: true,
          isSignedIn: !!user,
          user,
        });
      }
    );
    return subscriber; // unsubscribe on unmount
  }, []);

  return (
    <FirebaseAuthContext value={authState}>{children}</FirebaseAuthContext>
  );
}
