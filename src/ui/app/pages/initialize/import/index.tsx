import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";
import { CardLayout } from "_app/shared/card-layout";
import { useAppDispatch } from "_hooks";
import { createVault, logout } from "_redux/slices/account";
import { MAIN_UI_URL } from "_shared/utils";
import { entropyToSerialized, mnemonicToEntropy } from "_src/xdag/typescript/cryptography";
import { useTranslation } from "react-i18next";

const initialValues = {
	mnemonic: Array.from( { length: 12 }, () => "" ),
	password: "",
	confirmPassword: "",
};

const allSteps = [ StepOne, StepTwo ];
export type ImportValuesType = typeof initialValues;
export type ImportPageProps = { mode?: "import" | "forgot"; };

export function ImportPage( { mode = "import" }: ImportPageProps ) {

	const [ data, setData ] = useState<ImportValuesType>( initialValues );
	const [ step, setStep ] = useState( 0 );
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const onHandleSubmit = useCallback( async ( { mnemonic, password }: ImportValuesType ) => {
			try {
				if ( mode === "forgot" ) {
					// clear everything in storage
					await dispatch( logout() );
				}
				await dispatch(
					createVault( {
						importedEntropy: entropyToSerialized( mnemonicToEntropy( mnemonic.join( " " ).trim() ), ),
						password,
					} ),
				).unwrap();

				if ( mode === "import" ) {
					navigate( "../backup-imported" );
				} else {
					// refresh the page to re-initialize the store
					window.location.href = MAIN_UI_URL;
				}
			} catch ( e ) {
				// Do nothing
			}
		},
		[ dispatch, navigate, mode ],
	);

	const totalSteps = allSteps.length;
	const StepForm = step < totalSteps ? allSteps[ step ] : null;

	return (
		<CardLayout
			headerCaption={ mode === "import" ? t("ImportPage.WalletSetup") : undefined }
			title={ mode === "import" ? t("ImportPage.ImportAnExistingWallet") : t("ImportPage.ResetPasswordForThisWallet") }
		>
			{ StepForm ? (
				<div className="mt-7.5 flex flex-col flex-nowrap items-stretch flex-1 flex-grow w-full">
					<StepForm
						next={ async ( data, stepIncrement ) => {
							const nextStep = step + stepIncrement;
							if ( nextStep >= totalSteps ) {
								await onHandleSubmit( data );
							}
							setData( data );
							if ( nextStep < 0 ) {
								return;
							}
							setStep( nextStep );
						} }
						data={ data }
						mode={ mode }
					/>
				</div>
			) : null }
		</CardLayout>
	);
}
