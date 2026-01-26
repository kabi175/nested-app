import { Activity } from "@/api/activitiesAPI";
import { GoalDTO, mapGoalToGoal } from "@/api/goalApi";
import { getPendingOrdersByGoalId } from "@/api/paymentAPI";
import { GoalForCustomize } from "@/atoms/goals";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { Order } from "@/types";
import { QueryClient } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import { router } from "expo-router";

export async function handleActivityNavigation(
    activity: Activity,
    api: AxiosInstance,
    queryClient: QueryClient,
    setCart: (value: Order[]) => void,
    setGoalsForCustomize: (value: GoalForCustomize[]) => void
) {
    switch (activity.type) {
        case "kyc_incomplete":
            router.push("/kyc");
            break;
        case "bank_account_pending":
            router.push("/bank-accounts");
            break;
        case "goal_payment_pending":
            const goalDto = activity.metadata as GoalDTO;
            const goal = mapGoalToGoal(goalDto);
            const orders = await queryClient.fetchQuery({
                queryKey: [QUERY_KEYS.pendingOrders, goal.id],
                queryFn: () => getPendingOrdersByGoalId(api, goal.id),
            });
            if (orders && orders.length > 0) {
                setCart(orders);
                router.push("/payment");
            } else {
                setGoalsForCustomize([goal]);
                router.push({
                    pathname: `/child/${goal.childId}/goal/customize`,
                    params: {
                        goal_id: goal.id,
                    },
                });
            }
            break;
        case "nominee_configuration_pending":
            router.push("/nominees");
            break;
        case "profile_incomplete":
        default:
            router.push("/account");
            break;
    }
}
