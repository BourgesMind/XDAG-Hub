
// SPDX-License-Ident

import {
	SIGNATURE_FLAG_TO_SCHEME
} from "./signature";
import {
	Secp256r1PublicKey,
	Secp256k1PublicKey,
	Secp256k1Keypair,
	Ed25519Keypair,
	Ed25519PublicKey
} from "xdag/typescript/keypairs";
import {
	LEGACY_PRIVATE_KEY_SIZE,
	PRIVATE_KEY_SIZE
} from "./keypair";

import { fromB64 } from "xdag/bcs";
import type { ExportedKeypair, Keypair } from "./keypair";
import type { PublicKey } from "./publickey";
import type {
	SerializedSignature,
	SignaturePubkeyPair,
	SignatureScheme,
} from "./signature";

/// Expects to parse a serialized signature by its signature scheme to a list of signature
/// and public key pairs. The list is of length 1 if it is not multisig.
export function toParsedSignaturePubkeyPair( serializedSignature: SerializedSignature, ): SignaturePubkeyPair[] {

	const bytes = fromB64( serializedSignature );
	const signatureScheme = SIGNATURE_FLAG_TO_SCHEME[ bytes[ 0 ] as keyof typeof SIGNATURE_FLAG_TO_SCHEME ];
	if ( signatureScheme === "MultiSig" ) {
			throw new Error( "legacy multisig viewing unsupported" );
	}

	const SIGNATURE_SCHEME_TO_PUBLIC_KEY = {
		ED25519: Ed25519PublicKey,
		Secp256k1: Secp256k1PublicKey,
		Secp256r1: Secp256r1PublicKey,
	};

	const PublicKey = SIGNATURE_SCHEME_TO_PUBLIC_KEY[ signatureScheme ];
	const signature = bytes.slice( 1, bytes.length - PublicKey.SIZE );
	const pubkeyBytes = bytes.slice( 1 + signature.length );
	const pubKey = new PublicKey( pubkeyBytes );

	return [
		{
			signatureScheme,
			signature,
			pubKey,
		},
	];
}

/// Expects to parse a single signature pubkey pair from the serialized
/// signature. Use this only if multisig is not expected.
export function toSingleSignaturePubkeyPair(
	serializedSignature: SerializedSignature,
): SignaturePubkeyPair {
	const res = toParsedSignaturePubkeyPair( serializedSignature );
	if ( res.length !== 1 ) {
		throw Error( "Expected a single signature" );
	}
	return res[ 0 ];
}

export function publicKeyFromSerialized(
	schema: SignatureScheme,
	pubKey: string,
): PublicKey {
	if ( schema === "ED25519" ) {
		return new Ed25519PublicKey( pubKey );
	}
	if ( schema === "Secp256k1" ) {
		return new Secp256k1PublicKey( pubKey );
	}
	throw new Error( "Unknown public key schema" );
}

export function fromExportedKeypair( keypair: ExportedKeypair ): Keypair {
	const secretKey = fromB64( keypair.privateKey );
	switch ( keypair.schema ) {
		case "ED25519":
			let pureSecretKey = secretKey;
			if ( secretKey.length === LEGACY_PRIVATE_KEY_SIZE ) {
				// This is a legacy secret key, we need to strip the public key bytes and only read the first 32 bytes
				pureSecretKey = secretKey.slice( 0, PRIVATE_KEY_SIZE );
			}
			return Ed25519Keypair.fromSecretKey( pureSecretKey );
		case "Secp256k1":
			return Secp256k1Keypair.fromSecretKey( secretKey );
		default:
			throw new Error( `Invalid keypair schema ${ keypair.schema }` );
	}
}
