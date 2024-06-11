import { filter, lastValueFrom, map, race, Subject, take } from "rxjs";
import { v4 as uuidV4 } from "uuid";
import Browser from "webextension-polyfill";
import { Window } from "./Window";
import { Inscription, InscriptionApprovalRequest, InscriptionRequestResponse } from "_src/shared/messaging/messages/payloads/inscription";
import { ContentScriptConnection } from "./connections/ContentScriptConnection";
import BitCounter from "_src/shared/utils/BitCounter";

const INSCRIPTION_STORE_KEY = "inscription-key";
const INSCRIPTION_IMG_NUMBER_KEY = "inscription-image-number-key";

function openTxWindow(requestID: string) {
	return new Window(Browser.runtime.getURL("ui.html") + `#/dapp/approveInscription/${encodeURIComponent(requestID)}`,);
}

class InscriptionExcutor {

	private _inscriptionResponseMessages = new Subject<InscriptionRequestResponse>();

	public async executeInscription(
		inscription: Inscription,
		connection: ContentScriptConnection,
	): Promise<any> {
		const response = await this.requestApproval(inscription, connection.origin, connection.originFavIcon);

		const { inscriptionResultError, inscriptionResult } = response;
		if (inscriptionResultError) {
			throw new Error(`Transaction failed with the following error. ${inscriptionResultError}`,);
		}
		if (!inscriptionResult) {
			throw new Error(`Transaction result is empty`);
		}
		return inscriptionResult;
	}

	private async requestApproval(
		inscription: Inscription,
		origin: string,
		favIcon?: string,
	) {
		const inscriptionRequest = await this.createInscriptionRequest(inscription, origin, favIcon);
		await this.storeInscriptionRequest(inscriptionRequest);

		const popUp = openTxWindow(inscriptionRequest.id);
		const popUpClose = (await popUp.show()).pipe(
			take(1),
			map<number, false>(() => false),
		);

		const inscResponseMessage = this._inscriptionResponseMessages.pipe(
			filter((msg) => msg.inscID === inscriptionRequest.id),
			take(1),
		);

		return lastValueFrom(
			race(popUpClose, inscResponseMessage).pipe(
				take(1),
				map(async (response) => {
					await this.removeInscriptionRequest(inscriptionRequest.id);
					if (response) {
						const { approved, inscResult, inscResultError } = response;
						if (approved) {
							inscriptionRequest.approved = approved;
							inscriptionRequest.inscriptionResult = inscResult;
							inscriptionRequest.inscriptionResultError = inscResultError;
							return inscriptionRequest;
						}
					}
					throw new Error("Rejected from user");
				}),
			),
		);
	}

	private async createInscriptionRequest(
		inscription: Inscription,
		origin: string,
		originFavIcon?: string,
	): Promise<InscriptionApprovalRequest> {
		const imageIndex = await this.getNextImageIndex();
		return {
			id: uuidV4(),
			origin,
			originFavIcon,
			approved: null,
			createdDate: new Date().toISOString(),
			inscription,
			imageIndex,
		};
	}

	private async saveInscriptionRequests(inscRequests: Record<string, InscriptionApprovalRequest>,) {
		await Browser.storage.local.set({ [INSCRIPTION_STORE_KEY]: inscRequests });
	}

	private async storeInscriptionRequest(txRequest: InscriptionApprovalRequest) {
		const insReqs = await this.getInscriptionRequests();
		insReqs[txRequest.id] = txRequest;
		await this.saveInscriptionRequests(insReqs);
		const insReqsAfterSaved = await this.getInscriptionRequests();
	}

	private async removeInscriptionRequest(txID: string) {
		const txs = await this.getInscriptionRequests();
		delete txs[txID];
		await this.saveInscriptionRequests(txs);
	}

	public async getInscriptionRequests(): Promise<Record<string, InscriptionApprovalRequest>> {
		return (await Browser.storage.local.get({ [INSCRIPTION_STORE_KEY]: {} }))[INSCRIPTION_STORE_KEY];
	}

	public async getInscriptionRequest(inscRequestID: string,): Promise<InscriptionApprovalRequest | null> {
		return (await this.getInscriptionRequests())[inscRequestID] || null;
	}

	//-----------INSCRIPTION_IMGE_NUMBER_KEY-------
	public async getNextImageIndex(): Promise<string> {
		let savedNumber = (await Browser.storage.local.get({ [INSCRIPTION_IMG_NUMBER_KEY]: {} }));
		if (savedNumber && savedNumber.n0 && savedNumber.n1) {
			const bitCounter = new BitCounter();
			bitCounter.init({ n0: savedNumber.n0, n1: savedNumber.n1 });
			const result = bitCounter.getNextCharacter();
			const curNumber = bitCounter.getValue();
			await Browser.storage.local.set({ [INSCRIPTION_IMG_NUMBER_KEY]: curNumber });
			return result;
		} else {
			const bitCounter = new BitCounter();
			const curNumber = bitCounter.getValue();
			const result = bitCounter.getCurrentCharacter();
			await Browser.storage.local.set({ [INSCRIPTION_IMG_NUMBER_KEY]: curNumber });
			return result;
		}
	}
	public async initImageNumber() {
		await Browser.storage.local.set({ [INSCRIPTION_IMG_NUMBER_KEY]: {} });
	}
}


export const inscriptionExcutor = new InscriptionExcutor();
