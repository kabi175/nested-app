// components/RestoreLastRoute.tsx
import { isBlocked, LAST_ROUTE_KEY } from "@/hooks/usePersistRoute";
import SplashScreenComponent from "@/components/v2/SplashScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";


export default function RestoreLastRoute() {
    const [target, setTarget] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const fullRoute = await AsyncStorage.getItem(LAST_ROUTE_KEY);
            if (
                fullRoute &&
                !isBlocked(fullRoute)
            ) {
                console.log("restoring last route", fullRoute);
                setTarget(fullRoute);
            } else {
                console.log("no last route found, redirecting to (tabs)");
                setTarget("/(tabs)"); // fallback
            }
        }

        load();
    }, []);

    if (!target) {
        return <SplashScreenComponent />;
    }

    return <Redirect href={target} />;
}

