import { filter, lastValueFrom, map, race, Subject, take } from "rxjs";
import { v4 as uuidV4 } from "uuid";
import Browser from "webextension-polyfill";
import { Window } from "./Window";
import {
	type TransactionDataType,
	type ApprovalRequest, SignMessageDataType,
} from "_payloads/transactions/ApprovalRequest";
import { type SignMessageRequest } from "_payloads/transactions/SignMessage";
import type { XdagSignMessageOutput } from "_src/xdag/features";
import type { XDagTransactionBlockResponse } from "_src/xdag/typescript/types";
import type { XdagSignTransactionSerialized } from "_payloads/transactions/ExecuteTransactionRequest";
import type { TransactionRequestResponse } from "_payloads/transactions/ui/TransactionRequestResponse";
import type { ContentScriptConnection } from "_src/background/connections/ContentScriptConnection";
import { SignedTransaction } from "_src/xdag/typescript/signers";

const STALE_TRANSACTION_MILLISECONDS = 1000 * 60 * 60 * 3; // 3 hours
const TX_STORE_KEY = "transactions";

function openTxWindow(requestID: string) {
	return new Window(Browser.runtime.getURL("ui.html") + `#/dapp/approve/${encodeURIComponent(requestID)}`,);
}

class Transactions {
	private _txResponseMessages = new Subject<TransactionRequestResponse>();

	public async executeOrSignTransaction(
		{ tx, sign, }: { tx: TransactionDataType; sign?: undefined } | { tx?: undefined; sign: XdagSignTransactionSerialized; },
		connection: ContentScriptConnection,
	): Promise<XDagTransactionBlockResponse | SignedTransaction> {
		const { txResultError, txResult, txSigned } = await this.requestApproval(
			tx ?? { type: "transaction", justSign: true, data: sign.transaction, accountAddress: sign.account },
			connection.origin,
			connection.originFavIcon,
		);
		if (txResultError) {
			throw new Error(`Transaction failed with the following error. ${txResultError}`,);
		}
		if (sign && !txSigned) {
			throw new Error("Transaction signature is empty");
		}
		if (tx) {
			//transaction
			if (!txResult) {
				throw new Error(`Transaction result is empty ${txResult}`);
			}
			return txResult as XDagTransactionBlockResponse;
		} else {
			// sign only
			return txSigned!;
		}
	}


	public async signMessage(
		{
			accountAddress,
			message,
		}: Required<Pick<SignMessageRequest, "args">>["args"],
		connection: ContentScriptConnection,
	): Promise<XdagSignMessageOutput> {
		const { txResult, txResultError } = await this.requestApproval(
			{ type: "sign-message", accountAddress, message },
			connection.origin,
			connection.originFavIcon,
		);
		if (txResultError) {
			throw new Error(`Signing message failed with the following error ${txResultError}`,);
		}
		if (!txResult) {
			throw new Error("Sign message result is empty");
		}
		if (!("messageBytes" in txResult)) {
			throw new Error("Sign message error, unknown result");
		}
		return txResult;
	}

	public async getTransactionRequests(): Promise<Record<string, ApprovalRequest>> {
		return (await Browser.storage.local.get({ [TX_STORE_KEY]: {} }))[TX_STORE_KEY];
	}

	public async getTransactionRequest(
		txRequestID: string,
	): Promise<ApprovalRequest | null> {
		return (await this.getTransactionRequests())[txRequestID] || null;
	}

	public handleMessage(msg: TransactionRequestResponse) {
		this._txResponseMessages.next(msg);
	}

	public async clearStaleTransactions() {
		const now = Date.now();
		const allTransactions = await this.getTransactionRequests();
		let hasChanges = false;
		Object.keys(allTransactions).forEach((aTransactionID) => {
			const aTransaction = allTransactions[aTransactionID];
			const createdDate = new Date(aTransaction.createdDate);
			if (
				aTransaction.approved !== null ||
				now - createdDate.getTime() >= STALE_TRANSACTION_MILLISECONDS
			) {
				delete allTransactions[aTransactionID];
				hasChanges = true;
			}
		});
		if (hasChanges) {
			await this.saveTransactionRequests(allTransactions);
		}
	}

	private createTransactionRequest(
		tx: TransactionDataType | SignMessageDataType,
		origin: string,
		originFavIcon?: string,
	): ApprovalRequest {
		return {
			id: uuidV4(),
			approved: null,
			origin,
			originFavIcon,
			createdDate: new Date().toISOString(),
			tx,
		};
	}

	private async saveTransactionRequests(txRequests: Record<string, ApprovalRequest>,) {
		await Browser.storage.local.set({ [TX_STORE_KEY]: txRequests });
	}

	private async storeTransactionRequest(txRequest: ApprovalRequest) {
		const txs = await this.getTransactionRequests();
		txs[txRequest.id] = txRequest;
		await this.saveTransactionRequests(txs);
	}

	private async removeTransactionRequest(txID: string) {
		const txs = await this.getTransactionRequests();
		delete txs[txID];
		await this.saveTransactionRequests(txs);
	}

	private async requestApproval(
		request: TransactionDataType | SignMessageDataType,
		origin: string,
		favIcon?: string,
	) {
		const txRequest = this.createTransactionRequest(request, origin, favIcon);
		await this.storeTransactionRequest(txRequest);
		const popUp = openTxWindow(txRequest.id);
		const popUpClose = (await popUp.show()).pipe(
			take(1),
			map<number, false>(() => false),
		);
		const txResponseMessage = this._txResponseMessages.pipe(
			filter((msg) => msg.txID === txRequest.id),
			take(1),
		);
		return lastValueFrom(
			race(popUpClose, txResponseMessage).pipe(
				take(1),
				map(async (response) => {
					await this.removeTransactionRequest(txRequest.id);
					if (response) {
						const { approved, txResult, txSigned, txResultError } = response;
						if (approved) {
							txRequest.approved = approved;
							txRequest.txResult = txResult;
							txRequest.txResultError = txResultError;
							txRequest.txSigned = txSigned;
							return txRequest;
						}
					}
					throw new Error("Rejected from user");
				}),
			),
		);
	}
}

const transactions = new Transactions();
export default transactions;
