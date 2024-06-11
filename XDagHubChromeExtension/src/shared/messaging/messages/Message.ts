import { v4 as uuidV4 } from "uuid";
import type { Payload } from "./payloads/Payload";

export type Message = {
  id: string;
  payload: Payload;
};

export function createMessage<MsgPayload extends Payload>(
  payload: MsgPayload,
  id?: string,
): Message {
  // console.log("createMessage:",payload);
  const p = payload as any;
  if( p && p.type === "execute-inscription-request"){
    console.log("--------id:", id);
    console.log("#$@$@#$@#$:execute-inscription-request", p);
  }

  return { id: id || uuidV4(), payload, };
}
