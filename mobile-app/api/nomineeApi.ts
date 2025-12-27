import type { Address } from "@/types/auth";
import type { Nominee, NomineePayload } from "@/types/nominee";
import { api } from "./client";

/**
 * Get all nominees
 */
export const getNominees = async (): Promise<Nominee[]> => {
  const { data } = await api.get("/users/nominees");
  return (data.data ?? []).map(
    (nominee: NomineeDTO): Nominee => mapNomineeDTOToNominee(nominee)
  );
};

/**
 * Upsert nominees (create or update)
 * Note: MFA should be verified before calling this
 * Accepts array of nominees. If nominee has id, it will update; otherwise it will create.
 */
export const upsertNominees = async (
  payloads: (NomineePayload & { id?: number })[]
): Promise<Nominee[]> => {
  const dtos = payloads.map((payload) => {
    const dto = mapNomineePayloadToDTO(payload);
    // Include id if present for updates
    if (payload.id) {
      (dto as any).id = payload.id;
    }
    return dto;
  });

  const { data } = await api.post("/users/nominees", { data: dtos });
  return (data.data ?? []).map(
    (nominee: NomineeDTO): Nominee => mapNomineeDTOToNominee(nominee)
  );
};

/**
 * Opt-out a nominee
 * Note: MFA should be verified before calling this
 */
export const optOutNominee = async (): Promise<void> => {
  await api.post("/users/actions/nominee-opt-out");
};

// API DTO types (snake_case from backend)
type NomineeDTO = {
  id: number;
  name: string;
  relationship: string;
  dob: string;
  pan?: string;
  email?: string;
  mobile_number?: string;
  address?: Address;
  allocation: number;
  guardian_name?: string;
};

/**
 * Map API DTO to client Nominee type
 */
function mapNomineeDTOToNominee(dto: NomineeDTO): Nominee {
  return {
    id: dto.id,
    name: dto.name,
    relationship: dto.relationship as Nominee["relationship"],
    dob: dto.dob,
    pan: dto.pan || "",
    email: dto.email || "",
    mobileNumber: dto.mobile_number || "",
    address: dto.address || {
      address_line: "",
      city: "",
      state: "",
      pin_code: "",
      country: "",
    },
    allocation: dto.allocation,
    guardianName: dto.guardian_name,
  };
}

/**
 * Map client NomineePayload to API DTO
 */
function mapNomineePayloadToDTO(payload: NomineePayload): Partial<NomineeDTO> {
  return {
    name: payload.name,
    relationship: payload.relationship,
    dob: payload.dob,
    pan: payload.pan,
    email: payload.email,
    mobile_number: payload.mobileNumber,
    address: payload.address,
    allocation: payload.allocation,
    guardian_name: payload.guardianName,
  };
}
