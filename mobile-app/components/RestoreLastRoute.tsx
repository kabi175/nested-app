// components/RestoreLastRoute.tsx
import { isBlocked, LAST_ROUTE_KEY } from "@/hooks/usePersistRoute";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";


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
        return (
            <View style={styles.container}>
                <Image
                    source={require("@/assets/images/icon.png")} // 👈 put your logo image here
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
        );
    }

    return <Redirect href={target} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff", // ✅ white background
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
});

