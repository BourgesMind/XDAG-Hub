import { Outlet } from "react-router-dom";
import PageMainLayout from "_app/shared/page-main-layout";
import { useLockedGuard } from "_app/wallet/hooks";
import Loading from "_components/loading";
import { useInitializedGuard } from "_hooks";
import PageLayout from "_pages/layout";

interface Props {
  disableNavigation?: boolean;
}

const HomePage = ({ disableNavigation }: Props) => {
  const initChecking = useInitializedGuard(true);
  const lockedChecking = useLockedGuard(false);
  const guardChecking = initChecking || lockedChecking;

  return (
    <PageLayout>
      <Loading loading={guardChecking}>
        <PageMainLayout
          bottomNavEnabled={!disableNavigation}
          dappStatusEnabled={!disableNavigation}
          topNavMenuEnabled={!disableNavigation}
        >
          <Outlet />
        </PageMainLayout>
      </Loading>
    </PageLayout>
  );
};

export default HomePage;
export { default as AssetsPage } from "./assets";
export { default as TokensPage } from "./tokens";
export { default as TransactionHistoryList } from "./transaction-history-list";
export { default as TransferCoinPage } from "./transfer-coin";
export { default as ReceiptPage } from "./receipt";
export { default as CoinsSelectorPage } from "./transfer-coin/CoinSelector";
export { default as AppsPage } from "./apps";
export { Onramp as OnrampPage } from "./onramp";
