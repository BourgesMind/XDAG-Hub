import { useMemo } from "react";
import { UserApproveContainer } from "../../components/user-approve-container";
import { useAppDispatch } from "../../hooks";
import { respondToTransactionRequest } from "../../redux/slices/transaction-requests";
import { Heading } from "../../shared/heading";
import { PageMainLayoutTitle } from "../../shared/page-main-layout/PageMainLayoutTitle";
import { Text } from "../../shared/text";
import { type SignMessageApprovalRequest } from "_payloads/transactions/ApprovalRequest";
import { toUtf8OrB64 } from "_src/shared/utils";
import { useActiveAccount } from "../../hooks/useActiveAccount";

export type SignMessageRequestProps = {
  request: SignMessageApprovalRequest;
};

export function SignMessageRequest({ request }: SignMessageRequestProps) {
  const { message, type } = useMemo(
    () => toUtf8OrB64(request.tx.message),
    [request.tx.message],
  );
  const dispatch = useAppDispatch();

  return (
    <UserApproveContainer
      origin={request.origin}
      originFavIcon={request.originFavIcon}
      approveTitle="Sign"
      rejectTitle="Reject"
      approveDisabled={true}
      onSubmit={async (approved) => {
        await dispatch(
          respondToTransactionRequest({
            txRequestID: request.id,
            approved,
          }),
        );
      }}
      address={request.tx.accountAddress}
      scrollable
      blended
    >
      <PageMainLayoutTitle title="Sign Message" />
      <Heading variant="heading6" color="gray-90" weight="semibold" centered>
        Message You Are Signing
      </Heading>
      <div className="flex flex-col flex-nowrap items-stretch border border-solid border-gray-50 rounded-15 overflow-y-auto overflow-x-hidden bg-white shadow-summary-card">
        <div className="p-5 break-words">
          <Text
            variant="pBodySmall"
            weight="medium"
            color="steel-darker"
            mono={type === "base64"}
          >
            {message}
          </Text>
        </div>
      </div>
      {/*{notificationModal}*/}
    </UserApproveContainer>
  );
}
