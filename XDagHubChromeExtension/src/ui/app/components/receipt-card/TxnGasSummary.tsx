
import { Text } from '_src/ui/app/shared/text';
import BigNumber from 'bignumber.js';
import { useGasFee } from '../../hooks';

type TxnGasSummaryProps = {
	transferAmount: BigNumber | null;
};

export function TxnGasSummary({ transferAmount }: TxnGasSummaryProps) {

	const gasFee = useGasFee();
	const symbol = "XDAG";
	const totalAmount: BigNumber = transferAmount ? transferAmount.plus(gasFee) : new BigNumber(0);

	return (
		<div className="flex flex-col w-full items-center gap-3.5 border-t border-solid border-steel/20 border-x-0 border-b-0 py-3.5 first:pt-0">
			<div className="flex justify-between items-center w-full">
				<Text variant="body" weight="medium" color="steel-darker">
					Gas Fees
				</Text>
				<Text variant="body" weight="medium" color="steel-darker">
					{gasFee.toFormat(1)} {symbol}
				</Text>
			</div>
			{transferAmount ? (
				<div className="flex justify-between items-center w-full">
					<Text variant="body" weight="medium" color="steel-darker">
						Total Amount
					</Text>
					<Text variant="body" weight="medium" color="steel-darker">
						{totalAmount.toFormat(1)} {symbol}
					</Text>
				</div>
			) : null}
		</div>
	);
}
