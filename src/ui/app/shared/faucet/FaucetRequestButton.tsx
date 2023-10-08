import { toast } from "react-hot-toast";
import FaucetMessageInfo from "./FaucetMessageInfo";
import { useFaucetMutation } from "./useFaucetMutation";
import { useFaucetRateLimiter } from "./useFaucetRateLimiter";
import { API_ENV_TO_INFO } from "_app/ApiProvider/ApiProvider";
import { Button, type ButtonProps } from "_app/shared/ButtonUI";
import { useAppSelector } from "_hooks";
import { FaucetRateLimitError } from "_src/xdag/typescript/faucet";

export type FaucetRequestButtonProps = {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
};

function FaucetRequestButton({
  variant = "primary",
  size = "narrow",
}: FaucetRequestButtonProps) {
  const network = useAppSelector(({ app }) => app.apiEnv);
  const networkName = API_ENV_TO_INFO[network].name.replace(/Xdag\s*/gi, "");
  const [isRateLimited, rateLimit] = useFaucetRateLimiter();
  const mutation = useFaucetMutation({
    onError: (error) => {
      if (error instanceof FaucetRateLimitError) {
        rateLimit();
      }
    },
  });

  return mutation.enabled ? (
    <Button
      data-testid="faucet-request-button"
      variant={variant}
      size={size}
      disabled={isRateLimited}
      onClick={() => {
        toast.promise(mutation.mutateAsync(), {
          loading: <FaucetMessageInfo loading />,
          success: (totalReceived) => (
            <FaucetMessageInfo totalReceived={totalReceived} />
          ),
          error: (error) => <FaucetMessageInfo error={error.message} />,
        });
      }}
      loading={mutation.isMutating}
      text={`Request ${networkName} XDAG Tokens`}
    />
  ) : null;
}

export default FaucetRequestButton;
