import { CreateGoalRequest } from "@/api/goalApi";
import { CreateOrderRequest } from "@/api/paymentAPI";
import { cartAtom } from "@/atoms/cart";
import EducationBasedGoalPlanner from "@/components/v2/planner/EducationBasedGoalPlanner";
import { useChild } from "@/hooks/useChildren";
import { useCreateOrders } from "@/hooks/useCreateOrders";
import { useEducation } from "@/hooks/useEducation";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { formatCurrency } from "@/utils/formatters";
import { calculateFutureCost } from "@/utils/goalForm";
import { computeMinimumSIPAmount } from "@/utils/sip";
import { router, useLocalSearchParams } from "expo-router";
import { useSetAtom } from "jotai";
import { useState } from "react";

export default function GoalPlannerScreen() {
    const { child_id, education_id } = useLocalSearchParams<{
        child_id: string;
        education_id: string;
    }>();

    const { data: child } = useChild(child_id);
    const { data: education } = useEducation(education_id);
    const goalCreation = useGoalCreation();
    const createOrdersMutation = useCreateOrders();
    const setCart = useSetAtom(cartAtom);
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    if (!child || !education) {
        return null;
    }

    const targetYear = child.dateOfBirth.getFullYear() + 18;
    const targetDate = new Date();
    targetDate.setFullYear(targetYear);

    const yearsFromNow = targetYear - new Date().getFullYear();
    const targetAmount = calculateFutureCost(education, targetYear);
    const idealSipAmount = computeMinimumSIPAmount(yearsFromNow, 0, 0, 12, targetAmount);

    const goal: CreateGoalRequest = {
        childId: child.id,
        educationId: education.id,
        title: `${child.firstName}'s Graduation`,
        targetAmount,
        targetDate,
    };

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
        const createdGoals = await goalCreation.mutateAsync([goal]);
        const createdGoal = createdGoals[0];
        const { min_investment, min_sip, min_step_up } = createdGoal.basket;

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
                goalId: createdGoal.id,
            },
            ...(lumpSum && lumpSum > 0
                ? [{ type: "buy" as const, amount: lumpSum, goalId: createdGoal.id }]
                : []),
        ];

        // 5. Place orders & set cart
        const orderResponse = await createOrdersMutation.mutateAsync({ orders });
        setCart(orderResponse);

        // 6. Navigate
        router.push("/testimonials");
    };


    //TODO: minSip needs to be handled properly based on goal.basket.min_sip

    return (
        <EducationBasedGoalPlanner
            childName={child.firstName}
            goalYear={targetYear}
            goalAmount={targetAmount}
            collegeType={education.name}
            idealSipAmount={idealSipAmount}
            error={errorMessage}
            onBegin={onBegin}
            onBack={() => router.back()}
        />
    );
}
