import { CreateOrderRequest } from "@/api/paymentAPI";
import { cartAtom } from "@/atoms/cart";
import EducationBasedGoalPlanner from "@/components/v2/planner/EducationBasedGoalPlanner";
import { useCreateOrders } from "@/hooks/useCreateOrders";
import { useGoal } from "@/hooks/useGoal";
import { formatCurrency } from "@/utils/formatters";
import { computeMinimumSIPAmount } from "@/utils/sip";
import { router, useLocalSearchParams } from "expo-router";
import { useSetAtom } from "jotai";
import { useState } from "react";

export default function GoalPlannerScreen() {
    const { goal_id } = useLocalSearchParams<{
        goal_id: string;
    }>();

    const { data: goal } = useGoal(goal_id);

    const createOrdersMutation = useCreateOrders();
    const setCart = useSetAtom(cartAtom);
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    if (!goal) {
        return null;
    }

    const targetYear = goal.targetDate.getFullYear();

    const yearsFromNow = targetYear - new Date().getFullYear();
    const targetAmount = goal.targetAmount;
    const idealSipAmount = computeMinimumSIPAmount(yearsFromNow, 0, 0, 12, targetAmount);

    const onBegin = async ({ sipAmount, lumpSum, stepUp }: {
        sipAmount: number;
        lumpSum?: number;
        stepUp?: number;
    }) => {
        setErrorMessage(undefined);

        // 1. Validate before creating goal
        if (sipAmount <= 0) {
            setErrorMessage("Please set a valid SIP amount.");
            return;
        }
        if (sipAmount > 1_00_000) {
            setErrorMessage(`SIP amount cannot exceed ${formatCurrency(1_00_000)}.`);
            return;
        }
        if (lumpSum !== undefined && lumpSum > 0 && lumpSum > 5_00_000) {
            setErrorMessage(`Lump sum cannot exceed ${formatCurrency(5_00_000)}.`);
            return;
        }
        if (stepUp !== undefined && stepUp > 10_000) {
            setErrorMessage(`Step-up cannot exceed ${formatCurrency(10_000)}.`);
            return;
        }

        // 2. Create goal
        const { min_investment, min_sip, min_step_up } = goal.basket;

        // 3. Validate against basket minimums
        if (sipAmount < min_sip) {
            setErrorMessage(`Minimum SIP is ${formatCurrency(min_sip)}.`);
            return;
        }
        if (lumpSum && lumpSum > 0 && lumpSum < min_investment) {
            setErrorMessage(`Minimum lump sum is ${formatCurrency(min_investment)}.`);
            return;
        }
        if (stepUp && stepUp > 0 && stepUp < min_step_up) {
            setErrorMessage(`Minimum step-up is ${formatCurrency(min_step_up)}.`);
            return;
        }

        // 4. Build orders
        const sipStartDate = (() => {
            const d = new Date();
            if (d.getDate() > 28) {
                d.setDate(1);
                d.setMonth(d.getMonth() + 1);
            }
            return d;
        })();

        const orders: CreateOrderRequest[] = [
            {
                type: "sip",
                amount: sipAmount,
                start_date: sipStartDate,
                yearly_setup: stepUp && stepUp > 0 ? stepUp : undefined,
                goalId: goal.id,
            },
            ...(lumpSum && lumpSum > 0
                ? [{ type: "buy" as const, amount: lumpSum, goalId: goal.id }]
                : []),
        ];

        // 5. Place orders & set cart
        const orderResponse = await createOrdersMutation.mutateAsync({ orders });
        setCart(orderResponse);

        // 6. Navigate
        router.push({
            pathname: "/child/[child_id]/testimonials",
            params: { child_id: goal.child.id }
        }
        );
    };


    //TODO: minSip needs to be handled properly based on goal.basket.min_sip

    return (
        <EducationBasedGoalPlanner
            childName={goal.child.name}
            goalYear={targetYear}
            goalAmount={targetAmount}
            collegeType={goal.education?.name}
            idealSipAmount={idealSipAmount}
            error={errorMessage}
            onBegin={onBegin}
            onBack={() => router.back()}
        />
    );
}
