import type { BasePayload } from "_payloads";

export interface ExecuteInscriptionResponse extends BasePayload {
  type: "execute-inscription-response";
  inscription: { 
    address: string; 
  }[];
}
