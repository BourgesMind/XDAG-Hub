import { isBasePayload } from "_payloads";
import type { BasePayload, Payload } from "_payloads";
import { InscriptionApprovalRequest } from "../InscriptionApprovalRequest";

export interface GetInscriptionRequestsResponse extends BasePayload {
  type: "get-inscription-requests-response";
  inscRequests: InscriptionApprovalRequest[];
}

export function isGetInscriptionRequestsResponse(
  payload: Payload,
): payload is GetInscriptionRequestsResponse {
  return (
    isBasePayload(payload) &&
    payload.type === "get-inscription-requests-response"
  );
}
