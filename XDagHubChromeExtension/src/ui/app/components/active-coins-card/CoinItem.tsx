import { type ReactNode } from "react";
import { Text } from "_app/shared/text";
import { CoinIcon } from "_components/coin-icon";
import { useFormatCoin } from "_shared/hooks";
import BigNumber from "bignumber.js";
import { useTranslation } from "react-i18next";

type CoinItemProps = {
	coinType: string;
	balance: BigNumber;
	isActive?: boolean;
	usd?: number;
	centerAction?: ReactNode;
};

export function CoinItem({
	coinType,
	balance,
	isActive,
	usd,
	centerAction,
}: CoinItemProps) {
	const [formatted, symbol, { data: coinMeta }] = useFormatCoin(balance, coinType,);
	const { t } = useTranslation();

	return (
		<div className="flex gap-2.5 w-full py-3 pl-1.5 pr-2 justify-center items-center rounded hover:bg-Xdag/10">
			<CoinIcon coinType={coinType} size={isActive ? "sm" : "md"} />
			<div className="flex flex-1 gap-1.5 justify-between items-center">
				<div className="flex flex-col gap-1.5">
					<Text variant="body" color="gray-90" weight="semibold" truncate>
						{coinMeta?.name || symbol} {isActive ? t("CoinItem.available") : ""}
					</Text>
					{!isActive ? (
						<Text variant="subtitle" color="steel-dark" weight="medium">
							{symbol}
						</Text>
					) : null}
				</div>

				{centerAction}

				<div className="flex flex-row justify-center items-center">
					{isActive ? (
						<Text variant="body" color="steel-darker" weight="medium">
							{formatted}
						</Text>
					) : (
						<div
							data-testid={coinType}
							className="flex flex-col justify-end items-end gap-1.5"
						>
							<Text variant="body" color="gray-90" weight="medium">
								{formatted} {symbol}
							</Text>
							{usd && (
								<Text variant="caption" color="steel-dark" weight="medium">
									${usd.toLocaleString("en-US")}
								</Text>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
