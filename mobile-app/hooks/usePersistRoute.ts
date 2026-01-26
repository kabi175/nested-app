// hooks/usePersistRoute.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalSearchParams, usePathname } from "expo-router";
import { useEffect } from "react";

export const LAST_ROUTE_KEY = "last_active_route";
export const BLOCKED_ROUTES: RegExp[] = [
  /^\/$/,          // "/"
  /^\/login$/,     // "/login"
  /^\/splash$/,    // "/splash"
  /^\/child\/.*$/  // "/child/*"
];

export const isBlocked = (route: string) =>
  BLOCKED_ROUTES.some((regex) => regex.test(route));

export function usePersistRoute() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        if (typeof v === "string") acc[k] = v;
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    if (isBlocked(pathname)) {
      return;
    }

    const fullRoute = query ? `${pathname}?${query}` : pathname;

    console.log("persisting last route", fullRoute);
    AsyncStorage.setItem(LAST_ROUTE_KEY, fullRoute);
  }, [pathname, params]);
}
