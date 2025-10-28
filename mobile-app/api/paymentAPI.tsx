import { api } from "./client";

type CreatePaymentRequest = {
    childId: string;
};

export const  createPayment = async (): Promise<{}> => {
    const { data } = await api.get(`/education?type=COURSE`);
    return data.data;
};