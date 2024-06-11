import { isBasePayload } from "_payloads";
import type { BasePayload, Payload } from "_payloads";
import { XDagTransactionBlockResponse } from "_src/xdag/typescript/types";

export interface InscriptionRequestResponse extends BasePayload
{
	type: "inscription-request-response";
	inscID: string;
	approved: boolean;
	inscResult?: string[];
	inscResultError?: string;
}

export function isInscriptionRequestResponse(
	payload: Payload,
): payload is InscriptionRequestResponse {
	return (
		isBasePayload( payload ) && payload.type === "inscription-request-response"
	);
}
