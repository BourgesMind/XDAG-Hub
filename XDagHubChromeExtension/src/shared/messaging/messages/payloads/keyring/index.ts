import { isBasePayload } from "_payloads";
import { type AccountsPublicInfoUpdates } from "_src/background/keyring/accounts";
import type { XDagAddress } from "_src/xdag/typescript/types";
import type { SerializedSignature } from "_src/xdag/typescript/cryptography";
import type { ExportedKeypair } from "_src/xdag/typescript/cryptography";
import type { BasePayload, Payload } from "_payloads";
import type { SerializedAccount } from "_src/background/keyring/Account";

type MethodToPayloads = {
	create: {
		args: { password: string; importedEntropy?: string };
		return: void;
	};
	getEntropy: {
		args: string | undefined;
		return: string;
	};
	unlock: {
		args: { password: string };
		return: void;
	};
	walletStatusUpdate: {
		args: void;
		return: {
			isLocked: boolean;
			isInitialized: boolean;
			accounts: SerializedAccount[];
			activeAddress: string | null;
		};
	};
	lock: {
		args: void;
		return: void;
	};
	clear: {
		args: void;
		return: void;
	};
	appStatusUpdate: {
		args: { active: boolean };
		return: void;
	};
	setLockTimeout: {
		args: { timeout: number };
		return: void;
	};
	signData: {
		args: { data: string; address: XDagAddress; };
		return: SerializedSignature;
	};
	// signDataByType: {
	// 	args: { data: string; address: XDagAddress; signType: string };
	// 	return: SerializedSignature;
	// };
	switchAccount: {
		args: { address: XDagAddress };
		return: void;
	};
	deriveNextAccount: {
		args: void;
		return: { accountAddress: XDagAddress };
	};
	verifyPassword: {
		args: { password: string };
		return: void;
	};
	exportAccount: {
		args: { password: string; accountAddress: XDagAddress };
		return: { keyPair: ExportedKeypair };
	};
	importPrivateKey: {
		args: { password: string; keyPair: ExportedKeypair };
		return: void;
	};
	updateAccountPublicInfo: {
		args: { updates: AccountsPublicInfoUpdates };
		return: void;
	};
};

export interface KeyringPayload<Method extends keyof MethodToPayloads> extends BasePayload
{
	type: "keyring";
	method: Method;
	args?: MethodToPayloads[Method]["args"];
	return?: MethodToPayloads[Method]["return"];
}

export function isKeyringPayload<Method extends keyof MethodToPayloads>(
	payload: Payload,
	method: Method,
): payload is KeyringPayload<Method> {
	return (
		isBasePayload( payload ) &&
		payload.type === "keyring" &&
		"method" in payload &&
		payload[ "method" ] === method
	);
}
