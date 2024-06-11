import { isBasePayload } from "_payloads";

import type { BasePayload, Payload } from "_payloads";

export interface ExecuteInscriptionRequest extends BasePayload {
  type: "execute-inscription-request";
}

export function isExecuteInscriptionRequest(payload: Payload): payload is ExecuteInscriptionRequest {
  return isBasePayload(payload) && payload.type === "execute-inscription-request";
}
