import type { User } from "@/types/auth";
import type { AxiosError, AxiosInstance } from "axios";

type UploadableFile = {
  uri: string;
  name?: string;
  type?: string;
};

export const getUser = async (api: AxiosInstance): Promise<User | null> => {
  try {
    const { data } = await api.get(`/users?type=CURRENT_USER`);
    const user = data.data?.[0];
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      panNumber: user.pan_number,
      status: user.status,
      aadhaar: user.aadhaar_last4,
      dob: new Date(user.date_of_birth),
      gender: user.gender,
      created_at: user.created_at,
      updated_at: user.updated_at,
      address: user.address,
      father_name: user.father_name,
      marital_status: user.marital_status,
      income_source: user.income_source,
      income_slab: user.income_slab,
      occupation: user.occupation,
      kycStatus: user.kyc_status,
      nominee_status: user.nominee_status,
      is_ready_to_invest: user.is_ready_to_invest,
      pep:
        typeof user.pep === "boolean"
          ? user.pep
          : typeof user.pep_status === "boolean"
          ? user.pep_status
          : typeof user.pepStatus === "boolean"
          ? user.pepStatus
          : null,
    };
  } catch {
    return null;
  }
};

export const updateUser = async (
  api: AxiosInstance,
  id: string,
  payload: Partial<User>
): Promise<User> => {
  console.log("payload", payload);
  const userDTO = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    phone_number: payload.phone_number,
    pan_number: payload.panNumber,
    aadhaar_last4: payload.aadhaar,
    date_of_birth: payload.dob
      ? payload.dob.toLocaleDateString("en-CA")
      : undefined,
    gender: payload.gender,
    address: payload.address,
    father_name: payload.father_name,
    marital_status: payload.marital_status,
    income_source: payload.income_source,
    income_slab: payload.income_slab,
    occupation: payload.occupation,
    pep_status: payload.pep,
    pep: payload.pep,
  };

  const { data } = await api.patch(`/users/${id}`, userDTO);
  return data;
};

export const uploadUserSignature = async (
  api: AxiosInstance,
  id: string,
  file: UploadableFile
): Promise<void> => {
  const formData = new FormData();
  const fallbackName = "signature.jpg";
  const fallbackType = "image/jpeg";

  const filename =
    file.name ??
    (() => {
      const uriParts = file.uri.split("/");
      const lastPart = uriParts[uriParts.length - 1];
      if (lastPart?.includes(".")) {
        return lastPart;
      }
      return fallbackName;
    })();

  const extension = filename.split(".").pop()?.toLowerCase();
  const mimeType =
    file.type ??
    (extension === "png"
      ? "image/png"
      : extension === "jpg" || extension === "jpeg"
      ? "image/jpeg"
      : fallbackType);

  formData.append("file", {
    uri: file.uri,
    name: filename,
    type: mimeType,
  } as any);

  await api.post(`/users/${id}/signature`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const getUserSignature = async (api: AxiosInstance, id: string): Promise<string | null> => {
  try {
    const response = await api.get(`/users/${id}/signature`, {
      responseType: "arraybuffer",
    });

    const requestObject = response.request as unknown;
    const responseUrl =
      typeof requestObject === "object" &&
      requestObject !== null &&
      "responseURL" in requestObject
        ? (requestObject as { responseURL?: string }).responseURL ?? undefined
        : undefined;

    const headerLocation =
      (response.headers?.location as string | undefined) ??
      (response.headers?.Location as string | undefined) ??
      (response.headers?.["x-final-url"] as string | undefined);

    const resolvedUrl = responseUrl ?? headerLocation;
    if (resolvedUrl) {
      return resolvedUrl;
    }

    const data = response.data as any;
    if (!data) {
      return null;
    }

    if (typeof data === "string") {
      return data;
    }

    const possibleUrl =
      data?.data?.url ??
      data?.data?.signedUrl ??
      data?.data?.signed_url ??
      data?.signedUrl ??
      data?.signed_url ??
      data?.url;

    return typeof possibleUrl === "string" ? possibleUrl : null;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const initKyc = async (api: AxiosInstance, user: User): Promise<void> => {
  await api.post(`/users/${user.id}/actions/init_kyc`);
};

export const fetchAadhaarUploadRedirectUrl = async (
  api: AxiosInstance,
  user: User
): Promise<string | null> => {
  const { data } = await api.post(`/users/${user.id}/actions/aadhaar_upload`);
  return data.redirect_url;
};

export const fetchEsignUploadRedirectUrl = async (
  api: AxiosInstance,
  user: User
): Promise<string | null> => {
  const { data } = await api.post(`/users/${user.id}/actions/esign_upload`);
  return data.redirect_url;
};

export const createInvestor = async (api: AxiosInstance, user: User): Promise<void> => {
  await api.post(`/users/${user.id}/actions/create_investor`);
};

export const updateEmail = async (
  api: AxiosInstance,
  userId: string,
  email: string
): Promise<void> => {
  await api.post(`/users/${userId}/actions/update_email`, {
    email,
  });
};
