


import nacl from "tweetnacl";
import { derivePath } from "./ed25519-hd-key.js";
import { Ed25519PublicKey } from "./publickey.js";
import { PRIVATE_KEY_SIZE, Keypair } from "../../cryptography/keypair.js";
import {
	isValidHardenedPath,
	mnemonicToSeedHex,
} from "../../cryptography/mnemonics.js";
import { toB64 } from "_src/xdag/bcs";
import type { ExportedKeypair } from "../../cryptography/keypair.js";
import type { SignatureScheme } from "../../cryptography/signature.js";

export const DEFAULT_ED25519_DERIVATION_PATH = "m/44'/784'/0'/0'/0'";

/**
 * Ed25519 Keypair data. The publickey is the 32-byte public key and
 * the secretkey is 64-byte, where the first 32 bytes is the secret
 * key and the last 32 bytes is the public key.
 */
export interface Ed25519KeypairData
{
	publicKey: Uint8Array;
	secretKey: Uint8Array;
}

/**
 * An Ed25519 Keypair used for signing transactions.
 */
export class Ed25519Keypair extends Keypair
{
	private keypair: Ed25519KeypairData;

	/**
	 * Create a new Ed25519 keypair instance.
	 * Generate random keypair if no {@link Ed25519Keypair} is provided.
	 *
	 * @param keypair Ed25519 keypair
	 */
	constructor( keypair?: Ed25519KeypairData ) {
		super();
		if ( keypair ) {
			this.keypair = keypair;
		} else {
			this.keypair = nacl.sign.keyPair();
		}
	}

	/**
	 * Get the key scheme of the keypair ED25519
	 */
	getKeyScheme(): SignatureScheme {
		return "ED25519";
	}

	/**
	 * Generate a new random Ed25519 keypair
	 */
	static generate(): Ed25519Keypair {
		return new Ed25519Keypair( nacl.sign.keyPair() );
	}

	static fromSecretKey(
		secretKey: Uint8Array,
		options?: { skipValidation?: boolean },
	): Ed25519Keypair {
		const secretKeyLength = secretKey.length;
		if ( secretKeyLength !== PRIVATE_KEY_SIZE ) {
			throw new Error(
				`Wrong secretKey size. Expected ${ PRIVATE_KEY_SIZE } bytes, got ${ secretKeyLength }.`,
			);
		}
		const keypair = nacl.sign.keyPair.fromSeed( secretKey );
		if ( !options || !options.skipValidation ) {
			const encoder = new TextEncoder();
			const signData = encoder.encode( "Xdag validation" );
			const signature = nacl.sign.detached( signData, keypair.secretKey );
			if ( !nacl.sign.detached.verify( signData, signature, keypair.publicKey ) ) {
				throw new Error( "provided secretKey is invalid" );
			}
		}
		return new Ed25519Keypair( keypair );
	}

	/**
	 * The public key for this Ed25519 keypair
	 */
	getPublicKey(): Ed25519PublicKey {
		return new Ed25519PublicKey( this.keypair.publicKey );
	}

	async sign( data: Uint8Array ) {
		return this.signData( data );
	}

	/**
	 * Return the signature for the provided data using Ed25519.
	 */
	signData( data: Uint8Array ): Uint8Array {
		return nacl.sign.detached( data, this.keypair.secretKey );
	}
	// signDataByType( data: Uint8Array, signType:string ): Uint8Array {
	// 	return this.signData( data );
	// }

	/**
	 * Derive Ed25519 keypair from mnemonics and path. The mnemonics must be normalized
	 * and validated against the english wordlist.
	 *
	 * If path is none, it will default to m/44'/784'/0'/0'/0', otherwise the path must
	 * be compliant to SLIP-0010 in form m/44'/784'/{account_index}'/{change_index}'/{address_index}'.
	 */
	static deriveKeypair( mnemonics: string, path?: string ): Ed25519Keypair {
		if ( path == null ) {
			path = DEFAULT_ED25519_DERIVATION_PATH;
		}
		if ( !isValidHardenedPath( path ) ) {
			throw new Error( "Invalid derivation path" );
		}
		const { key } = derivePath( path, mnemonicToSeedHex( mnemonics ) );

		return Ed25519Keypair.fromSecretKey( key );
	}

	/**
	 * Derive Ed25519 keypair from mnemonicSeed and path.
	 *
	 * If path is none, it will default to m/44'/784'/0'/0'/0', otherwise the path must
	 * be compliant to SLIP-0010 in form m/44'/784'/{account_index}'/{change_index}'/{address_index}'.
	 */
	static deriveKeypairFromSeed( seedHex: string, path?: string ): Ed25519Keypair {
		if ( path == null ) {
			path = DEFAULT_ED25519_DERIVATION_PATH;
		}
		if ( !isValidHardenedPath( path ) ) {
			throw new Error( "Invalid derivation path" );
		}
		const { key } = derivePath( path, seedHex );

		return Ed25519Keypair.fromSecretKey( key );
	}

	/**
	 * This returns an exported keypair object, the private key field is the pure 32-byte seed.
	 */
	export(): ExportedKeypair {
		return {
			schema: "ED25519",
			privateKey: toB64( this.keypair.secretKey.slice( 0, PRIVATE_KEY_SIZE ) ),
		};
	}
}
