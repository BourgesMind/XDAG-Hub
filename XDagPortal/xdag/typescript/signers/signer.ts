
import type { SerializedSignature } from "../cryptography/signature";

export interface Signer {
  getAddress(): Promise<string>;
  signData(data: Uint8Array): Promise<string>;
}
