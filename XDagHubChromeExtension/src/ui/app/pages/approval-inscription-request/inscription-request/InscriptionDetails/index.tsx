import { useTranslation } from "react-i18next";
import { InscriptionApprovalRequest } from "_src/shared/messaging/messages/payloads/inscription";
import { Text } from "_src/ui/app/shared/text";
import { InscChunKs } from "_src/shared/utils/chunkString";
import { Heading } from "_src/ui/app/shared/heading";


interface Props {
    inscRequest: InscriptionApprovalRequest;
    inscChunks: InscChunKs | undefined;
}

export function InscriptionDetails({ inscRequest, inscChunks }: Props) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col flex-nowrap">
            <div className="flex flex-row flex-nowrap items-center gap-3.75 py-3">
                <div className="flex items-stretch h-15 w-15 overflow-hidden bg-steel/20 shrink-0 grow-0">
                    {
                        inscRequest?.inscription?.inscriptionContent?.imgStr ?
                            (<img className="flex-1" src={inscRequest?.inscription?.inscriptionContent?.imgStr} alt={"img"} />)
                            :
                            null
                    }
                </div>
            </div>

            <div>
                <div className="flex flex-col flex-nowrap gap-1">
                    <Heading variant="heading4" weight="semibold" color="gray-100">
                        {t("InscriptionDetails.Header")}
                    </Heading>
                    <Text variant="bodySmall" weight="medium" color="steel-dark">
                        {inscRequest?.inscription?.toAddress}
                    </Text>
                </div>
            </div>



            <div className="flex flex-row flex-nowrap">
                <div className="flex flex-col flex-nowrap">
                    <div>
                        <Heading variant="heading4" weight="semibold" color="gray-100">
                            {t("InscriptionDetails.Chunks")}
                        </Heading>

                    </div>
                    <div>
                        <Heading variant="heading4" weight="semibold" color="gray-100">
                            {t("InscriptionDetails.Gas")}
                        </Heading>
                    </div>
                    <div>
                        <Heading variant="heading4" weight="semibold" color="gray-100">
                            {t("InscriptionDetails.Award")}
                        </Heading>
                    </div>
                    <div>
                        <Heading variant="heading4" weight="semibold" color="gray-100">
                            {t("InscriptionDetails.TotalCost")}
                        </Heading>
                    </div>
                </div>

                <div className="flex flex-col flex-nowrap">
                    <div className="mt-1 ml-2">
                        <Text variant="body" weight="medium" color="steel-dark">
                            {inscChunks?.chunks?.length ?? 0} CHUNK
                        </Text>
                    </div>
                    <div className="mt-1 ml-2">
                        <Text variant="body" weight="medium" color="steel-dark">
                            {inscChunks?.estimateGas?.toFixed(1)} XDAG
                        </Text>
                    </div>
                    <div className="mt-1 ml-2">
                        <Text variant="body" weight="medium" color="steel-dark">
                            {inscChunks?.award?.toFixed(1)} XDAG
                        </Text>
                    </div>
                    <div className="mt-1 ml-2">
                        <Text weight="semibold" variant="bodySmall" color="steel-dark">
                            {inscChunks?.totalCost?.toFixed(1)} XDAG
                        </Text>
                    </div>

                </div>
            </div>

        </div>
    )
}
