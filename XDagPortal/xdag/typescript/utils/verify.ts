import { secp256k1 } from "@noble/curves/secp256k1";
import { blake2b } from "@noble/hashes/blake2b";
import { sha256 } from "@noble/hashes/sha2";
import nacl from "tweetnacl";
import { messageWithIntent } from "../cryptography/intent";
import { toSingleSignaturePubkeyPair } from "../cryptography/utils";
import { fromB64 } from "xdag/bcs";
import type { IntentScope } from "../cryptography/intent";
import type { SerializedSignature } from "../cryptography/signature";

// TODO: This might actually make sense to eventually move to the `Keypair` instances themselves, as
// it could allow the Xdag.js to be tree-shaken a little better, possibly allowing keypairs that are
// not used (and their deps) to be entirely removed from the bundle.

/** Verify data that is signed with the expected scope. */
export async function verifyMessage(
  message: Uint8Array | string,
  serializedSignature: SerializedSignature,
  scope: IntentScope,
) {
  const signature = toSingleSignaturePubkeyPair(serializedSignature);
  const messageBytes = messageWithIntent(
    scope,
    typeof message === "string" ? fromB64(message) : message,
  );
  const digest = blake2b(messageBytes, { dkLen: 32 });
  switch (signature.signatureScheme) {
    case "ED25519":
      return nacl.sign.detached.verify(
        digest,
        signature.signature,
        signature.pubKey.toBytes(),
      );
    case "Secp256k1":
      return secp256k1.verify(
        secp256k1.Signature.fromCompact(signature.signature),
        sha256(digest),
        signature.pubKey.toBytes(),
      );
    default:
      throw new Error(
        `Unknown signature scheme: "${signature.signatureScheme}"`,
      );
  }
}
