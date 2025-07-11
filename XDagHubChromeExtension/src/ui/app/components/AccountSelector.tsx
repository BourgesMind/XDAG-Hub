import { Popover, Transition } from "@headlessui/react";
import { AccountList } from "./AccountList";
import { useAccounts } from "../hooks/useAccounts";
import { useActiveAddress } from "../hooks/useActiveAddress";
import { useBackgroundClient } from "../hooks/useBackgroundClient";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { ButtonConnectedTo } from "../shared/ButtonConnectedTo";
import { Text } from "../shared/text";
import { ChevronDown12, Copy12, ArrowUpRight12 } from "_assets/icons/tsIcons";
import { formatAddress } from "_src/xdag/typescript/utils";
import { useTranslation } from "react-i18next";

export function AccountSelector() {
	const allAccounts = useAccounts();
	const activeAddress = useActiveAddress();
	const { t } = useTranslation();

	const copyToAddress = useCopyToClipboard( activeAddress || "", {
		copySuccessMessage: t( "AccountSelector.AddressCopied" ),
	} );
	const backgroundClient = useBackgroundClient();
	
	const openExplorer = () => {
		if (activeAddress) {
			const explorerUrl = `https://testnet-explorer.xdagj.org/block/${activeAddress}`;
			window.open(explorerUrl, '_blank');
		}
	};
	
	if ( !allAccounts.length ) {
		return null;
	}

	const buttonText = (
		<Text mono variant="bodySmall" truncate>
			{ (activeAddress ? formatAddress( activeAddress ) : "") }
		</Text>
	);

	if ( allAccounts.length === 1 ) {
		return (
			<div className="flex items-center gap-1">
				<ButtonConnectedTo
					text={ buttonText }
					onClick={ copyToAddress }
					iconAfter={ <Copy12 data-testid="copy-address"/> }
					bgOnHover="grey"
				/>
				<button
					onClick={ openExplorer }
					className="outline-0 flex items-center justify-center p-1 transition-colors bg-transparent border-0 "
					title="在区块链浏览器中查看"
				>
					<ArrowUpRight12 className="text-gray-60 hover:text-hero-dark" />
				</button>
			</div>
		);
	}
	
	return (
		<Popover className="relative z-10 max-w-full px-5">
			{ ( { close } ) => (
				<>
					<Popover.Button
						as={ ButtonConnectedTo }
						text={ buttonText }
						iconAfter={ <ChevronDown12/> }
						bgOnHover="grey"
					/>
					<Transition
						enter="transition duration-200 ease-out"
						enterFrom="transform scale-95 opacity-0"
						enterTo="transform scale-100 opacity-100"
						leave="transition duration-200 ease-out"
						leaveFrom="transform scale-100 opacity-100"
						leaveTo="transform scale-75 opacity-0"
					>
						<Popover.Panel className="absolute left-1/2 -translate-x-1/2 w-[280px] drop-shadow-accountModal mt-2 z-0 rounded-md bg-white">
							<div className="absolute w-3 h-3 bg-white -top-1 left-1/2 -translate-x-1/2 rotate-45"/>
							<div className="relative px-1.25 max-h-80 overflow-y-auto max-w-full z-10">
								<AccountList
									onAccountSelected={ async ( { address, type } ) => {
										if ( address !== activeAddress ) {
											await backgroundClient.selectAccount( address );
										}
										close();
									} }
								/>
							</div>
						</Popover.Panel>
					</Transition>
				</>
			) }
		</Popover>
	);
}
