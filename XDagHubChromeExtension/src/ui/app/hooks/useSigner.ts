import { useActiveAccount } from "./useActiveAccount";
import { type WalletSigner } from "_app/WalletSigner";
import { thunkExtras } from "_redux/store/thunk-extras";

export function useSigner(): WalletSigner | null {
  const activeAccount = useActiveAccount();
  const signerAccount = activeAccount;
  const { api, background } = thunkExtras;
  if (!signerAccount) {
    throw new Error("Can't find account for the signer address ");
  }

  return api.getSignerInstance(signerAccount, background);
}
