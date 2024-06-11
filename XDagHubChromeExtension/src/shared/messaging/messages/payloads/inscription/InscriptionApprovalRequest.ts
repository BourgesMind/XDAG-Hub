
export interface InscriptionContent {
	objId: string,
	imgStr: string,
	txt: string,
}

export interface Inscription {
	inscriptionContent: InscriptionContent,
	inscriptionString: string,
	awardRatio: number,
	toAddress: string,
}

export type InscriptionApprovalRequest = {
	id: string;
	origin: string;
	originFavIcon?: string;
	approved: boolean | null;
	inscriptionResult?: string[];
	inscriptionResultError?: string;
	createdDate: string;
	inscription: Inscription;
	imageIndex: string
};
