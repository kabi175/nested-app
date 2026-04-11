import ErrorScreen from "@/components/v2/ErrorScreen";
import LoadingScreen from "@/components/v2/LoadingScreen";
import TestimonialScreen from "@/components/v2/TestimonialScreen";
import { useChild } from "@/hooks/useChildren";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TestimonialRoute() {
    const router = useRouter();
    const { child_id } = useLocalSearchParams<{ child_id: string }>();

    const { data: child, isLoading } = useChild(child_id);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!child) {
        return <ErrorScreen />;
    }

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <TestimonialScreen
                childName={child?.firstName}
                onStartFund={() => {
                    router.replace("/payment");
                }}
                onBack={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.push("/");
                    }
                }}
                onReadMore={() => {
                    console.log("Read more pressed");
                }}
            />
        </View>
    );
}
