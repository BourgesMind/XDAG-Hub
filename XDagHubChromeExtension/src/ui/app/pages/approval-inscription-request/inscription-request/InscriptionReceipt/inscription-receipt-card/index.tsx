import { cx } from "class-variance-authority";
import "./index.css"
import { Text } from "_app/shared/text";
import { useTranslation } from "react-i18next";
import { StatusIcon } from "./StatusIcon";
import { useAppSelector } from "_src/ui/app/hooks";
import { getApiEnv } from "_src/ui/app/redux/slices/app";
import Loading from "_src/ui/app/components/loading";
import { useEffect, useState } from "react";

type ReceiptCardProps = {
	incriptionResults: any[];
	isRefetching: boolean;
	isPushing: boolean;
};

type InscriptionStatusProps = {
	success: boolean;
	timestamp?: string;
	state: string,
	isRefetching: boolean;
	isPushing: boolean;
}

function InscriptionStatus({ success, timestamp, state, isRefetching, isPushing }: InscriptionStatusProps) {

	const { t } = useTranslation();
	const getState = (state: any, isPushing: boolean) => {
		// state: "Main" | "Rejected" | "Accepted" | "Pending" | "error"
		const tKey = "TransactionStatus." + (isPushing ? "Pushing" : state);
		return t(tKey);
	}

	return (
		<div className="flex flex-col gap-3 items-center justify-center mb-4">
			<Loading loading={isPushing}>
				<StatusIcon status={success} />
			</Loading>

			<div className={cx(state === "Accepted" ? "" : "blink")}>
				<h2>{getState(state, isPushing)}</h2>
			</div>
			{
				isPushing ?
					(
						<div className="flex flex-col gap-3 items-center justify-center blink">
							<Text color="issue-dark" weight={"bold"} variant={"pBody"}>
								{t("TransactionStatus.BatchTxProcessingDontLeave")}
							</Text>
						</div>
					)
					:
					(
						<div className="flex flex-col gap-3 items-center justify-center">
							<Text color="steel-dark" weight={"normal"} variant={"pBodySmall"}>
								{t("TransactionStatus.BlinkingUntilBlockchainAccepted")}
							</Text>
							<Text color="steel-dark" weight={"normal"} variant={"pBodySmall"}>
								{t("TransactionStatus.WillTakeAbout5Minutes")}
							</Text>
							<Text color="steel-darker" weight={"bold"} variant={"pBodySmall"}>
								{t("TransactionStatus.CanLeaveOrViewOnExplorerOrWaitHere")}
							</Text>
						</div>

					)
			}
		</div>
	);
}


export function InscriptionReceiptCard({ incriptionResults, isRefetching, isPushing }: ReceiptCardProps) {

	const net = useAppSelector(getApiEnv);
	const { t } = useTranslation();
	const [batchState, setBatchState] = useState("Pending");

	useEffect(() => {
		if (incriptionResults && incriptionResults[0]?.data) {
			setBatchState(incriptionResults.some(result => result?.data?.state === "Pending") ? "Pending" : "Accepted");
		}
	}, [incriptionResults]);

	return (
		<div className="fex flex-col w-full h-full overflow-hidden">

			<div className="flex flex-row items-center justify-center mb-6">
				<div className="flex flex-row">
					<Text color="steel-dark" weight={"normal"} variant={"pBody"}>
						{t("TransactionStatus.PushBatchTo")}
					</Text>
					<div className="blink ml-2">
						<Text color="hero-dark" weight={"bold"} variant={"pBody"}>
							{net}
						</Text>
					</div>
				</div>
			</div>

			<InscriptionStatus
				success={true}
				timestamp={Date.now().toString()}
				state={batchState}
				isRefetching={isRefetching}
				isPushing={isPushing}
			/>
		</div>
	);
}
