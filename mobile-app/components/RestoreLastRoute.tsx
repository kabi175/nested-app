// components/RestoreLastRoute.tsx
import SplashScreenComponent from "@/components/v2/SplashScreen";
import { isBlocked, LAST_ROUTE_KEY } from "@/hooks/usePersistRoute";
import { useRouteRestored } from "@/providers/RouteRestoredProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";


export default function RestoreLastRoute() {
    const [target, setTarget] = useState<string | null>(null);
    const { markRestored } = useRouteRestored();

    useEffect(() => {
        async function load() {
            const fullRoute = await AsyncStorage.getItem(LAST_ROUTE_KEY);
            if (
                fullRoute &&
                fullRoute !== "/" &&
                !isBlocked(fullRoute)
            ) {
                console.log("restoring last route", fullRoute);
                setTarget(fullRoute);
            } else {
                console.log("no last route found, redirecting to (tabs)");
                setTarget("/(tabs)"); // fallback
            }
            console.log("marking route as restored");
            markRestored();
        }

        load();
    }, []);

    if (!target) {
        return <SplashScreenComponent />;
    }

    return <Redirect href={target} />;
}

