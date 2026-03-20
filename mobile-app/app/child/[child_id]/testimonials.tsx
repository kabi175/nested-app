import TestimonialScreen from "@/components/v2/TestimonialScreen";
import { useChild } from "@/hooks/useChildren";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";

export default function Testimonials() {
    const { child_id } = useLocalSearchParams<{ child_id: string }>();

    const { data: child } = useChild(child_id);

    if (!child) {
        return null;
    }

    return <TestimonialScreen childName={child.firstName} onStartFund={() => router.replace("/payment")} />;
}