import { cx } from "class-variance-authority";
import { AccountAddress } from "./AccountAddress";
import { SummaryCard } from "./SummaryCard";
import { Link } from "../shared/Link";
import { Heading } from "../shared/heading";
import { Text } from "../shared/text";
import { ArrowUpRight12 } from "_assets/icons/tsIcons";
import { getValidDAppUrl } from "_src/shared/utils";
import type { XDagAddress } from "_src/xdag/typescript/types";
import { useTranslation } from "react-i18next";

export type DAppInfoCardProps = {
	name: string;
	url: string;
	iconUrl?: string;
	connectedAddress?: XDagAddress;
};

export function DAppInfoCard({
	name,
	url,
	iconUrl,
	connectedAddress,
}: DAppInfoCardProps) {
	const validDAppUrl = getValidDAppUrl(url);
	const appHostname = validDAppUrl?.hostname ?? url;
	const { t } = useTranslation();

	return (
		<SummaryCard
			minimalPadding
			noBorder
			showDivider
			body={
				<>
					<div className="flex flex-row flex-nowrap items-center gap-3.75 py-3">
						<div className="flex items-stretch h-15 w-15 rounded-full overflow-hidden bg-steel/20 shrink-0 grow-0">
							{iconUrl ? (<img className="flex-1" src={iconUrl} alt={name} />) : null}
						</div>
						<div className="flex flex-col flex-nowrap gap-1">
							<Heading variant="heading4" weight="semibold" color="gray-100">
								{name}
							</Heading>
							<Text variant="body" weight="medium" color="steel-dark">
								{appHostname}
							</Text>
						</div>
					</div>
					<div className={cx("flex justify-start pt-3", connectedAddress ? "pb-3" : "",)}>
						<div>
							<Link
								href={validDAppUrl?.toString() ?? url}
								title={name}
								text={t("DAppInfoCard.ViewWebsite")}
								after={<ArrowUpRight12 />}
								color="XdagDark"
								weight="medium"
							/>
						</div>
					</div>
					{connectedAddress ? (
						<div className="flex flex-nowrap flex-row items-center pt-3 gap-3">
							<Text
								variant="bodySmall"
								weight="medium"
								color="steel-darker"
								truncate
							>
								{t("DAppInfoCard.ConnectedAccount")}
							</Text>
							<div className="flex-1" />
							<AccountAddress copyable address={connectedAddress} />
						</div>
					) : null}
				</>
			}
		/>
	);
}
