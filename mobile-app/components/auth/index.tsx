import { useAuth } from "@/hooks/auth";

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
