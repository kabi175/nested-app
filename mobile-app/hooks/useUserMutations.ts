import {
  updateUser,
  uploadUserSignature,
  fetchAadhaarUploadRedirectUrl,
  fetchEsignUploadRedirectUrl,
} from "@/api/userApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { User } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

type UploadableFile = {
  uri: string;
  name?: string;
  type?: string;
};

export function useUpdateUser() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<User>;
    }) => updateUser(api, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
    },
  });
}

export function useUploadUserSignature() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: UploadableFile }) =>
      uploadUserSignature(api, id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.userSignature, variables.id],
      });
    },
  });
}

export function useFetchAadhaarUploadRedirectUrl() {
  const api = useAuthAxios();

  return useMutation({
    mutationFn: (user: User) => fetchAadhaarUploadRedirectUrl(api, user),
  });
}

export function useFetchEsignUploadRedirectUrl() {
  const api = useAuthAxios();

  return useMutation({
    mutationFn: (user: User) => fetchEsignUploadRedirectUrl(api, user),
  });
}




