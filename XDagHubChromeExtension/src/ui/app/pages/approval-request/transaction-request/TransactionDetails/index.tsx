import {Tab as HeadlessTab, type TabProps} from "@headlessui/react";
import {Command} from "./Command";
import {Input} from "./Input";
import {SummaryCard} from "../SummaryCard";
import {type TransactionBlock} from "_src/xdag/typescript/builder";
import type {XDagAddress} from "_src/xdag/typescript/types";
import {useTransactionData} from "_src/ui/app/hooks";
import {useTranslation} from "react-i18next";


interface Props {
    sender?: XDagAddress;
    transaction: TransactionBlock;
}

const Tab = (props: TabProps<"div">) => (
    <HeadlessTab
        className="border-0 border-b border-transparent ui-selected:border-hero text-steel-darker p-0 pb-2 -mb-px border-solid ui-selected:text-hero-dark text-body font-semibold bg-transparent outline-none cursor-pointer"
        {...props}
    />
);

export function TransactionDetails({sender, transaction}: Props) {
    const {
        data: transactionData,
        isLoading,
        isError,
    } = useTransactionData(sender, transaction);
    const {t} = useTranslation()
 

    return (
        <SummaryCard header={t("TransactionDetails.TransactionDetails")} initialExpanded>
            {isLoading || isError ? (
                <div className="ml-0 text-steel-darker text-pBodySmall font-medium">
                    {isLoading ? t("TransactionDetails.GatheringData") : t("TransactionDetails.CouldNotGatherData")}
                </div>
            ) : transactionData ? (
                <div>
                    <HeadlessTab.Group>
                        <HeadlessTab.List className="flex gap-6 border-0 border-b border-solid border-gray-45 mb-6">
                            {!!transactionData.amount && <Tab>{t("TransactionDetails.Transactions")}</Tab>}
                            {!!transactionData.amount && <Tab>{t("TransactionDetails.Inputs")}</Tab>}
                        </HeadlessTab.List>
                        {/* <HeadlessTab.Panels>
                            {!!transactionData.transactions.length && (
                                <HeadlessTab.Panel className="flex flex-col gap-6">
                                    {
                                        transactionData.transactions.map((command, index) => (
                                            <Command key={index} command={command}/>
                                        ))
                                    }
                                </HeadlessTab.Panel>
                            )}
                            {!!transactionData.inputs.length && (
                                <HeadlessTab.Panel className="flex flex-col gap-2">
                                    {
                                        transactionData.inputs.map((input, index) => (
                                            <Input key={index} input={input}/>
                                        ))
                                    }
                                </HeadlessTab.Panel>
                            )}
                        </HeadlessTab.Panels> */}
                    </HeadlessTab.Group>
                </div>
            ) : (
                ""
            )}
        </SummaryCard>
    );
}
