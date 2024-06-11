import { isBasePayload } from "_payloads";
import type { BasePayload, Payload } from "_payloads";

export interface GetInscriptionRequests extends BasePayload {
  type: "get-inscription-requests";
}

export function isGetInscriptionRequests(
  payload: Payload,
): payload is GetInscriptionRequests {
  return isBasePayload(payload) && payload.type === "get-inscription-requests";
}


