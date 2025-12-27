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
  address?: string;
  allocation: number;
  guardian_name?: string;
  guardian_email?: string;
  guardian_pan?: string;
  guardian_address?: string;
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
    pan: dto.pan,
    email: dto.email,
    address: dto.address,
    allocation: dto.allocation,
    guardianName: dto.guardian_name,
    guardianEmail: dto.guardian_email,
    guardianPan: dto.guardian_pan,
    guardianAddress: dto.guardian_address,
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
    address: payload.address,
    allocation: payload.allocation,
    guardian_name: payload.guardianName,
    guardian_email: payload.guardianEmail,
    guardian_pan: payload.guardianPan,
    guardian_address: payload.guardianAddress,
  };
}
