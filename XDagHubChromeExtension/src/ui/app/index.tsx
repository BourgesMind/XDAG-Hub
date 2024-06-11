
import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { useInitialPageView } from "./hooks/useInitialPageView";
import AssetsPage from "./pages/home/assets";
import { RestrictedPage } from "./pages/restricted";
import { AppType } from "./redux/slices/app/AppType";
import ForgotPasswordPage from "_app/wallet/forgot-password-page";
import LockedPage from "_app/wallet/locked-page";
import { useAppDispatch, useAppSelector } from "_hooks";
import { ApprovalRequestPage } from "_pages/approval-request";
import HomePage, {
  TokensPage,
  TransactionBlocksPage,
  TransferCoinPage,
  ReceiptPage,
  CoinsSelectorPage,
  AppsPage,
  OnrampPage,
} from "_pages/home";
import InitializePage from "_pages/initialize";
import BackupPage from "_pages/initialize/backup";
import CreatePage from "_pages/initialize/create";
import { ImportPage } from "_pages/initialize/import";
import SelectPage from "_pages/initialize/select";
import SiteConnectPage from "_pages/site-connect";
import WelcomePage from "_pages/welcome";
import { setNavVisibility } from "_redux/slices/app";
import './i18n/config'
import { ApprovalInscriptionRequestPage } from "./pages/approval-inscription-request";
import InscriptionReceiptPage from "./pages/approval-inscription-request/inscription-request/InscriptionReceipt";

const HIDDEN_MENU_PATHS = [
  "/nft-details",
  "/nft-transfer",
  "/receipt",
  "/send",
  "/send/select",
  "/apps/disconnectapp",
];

const App = () => {
  const dispatch = useAppDispatch();
  const isPopup = useAppSelector(
    (state) => state.app.appType === AppType.popup,
  );

  useEffect(() => {
    document.body.classList.remove("app-initializing");
  }, [isPopup]);

  const location = useLocation();
  useEffect(() => {
    const menuVisible = !HIDDEN_MENU_PATHS.some((aPath) => location.pathname.startsWith(aPath),);
    dispatch(setNavVisibility(menuVisible));
  }, [location, dispatch]);

  useInitialPageView();

  return (
    <Routes>
      <Route path="/*" element={<HomePage />}>
        <Route path="tokens/*" element={<TokensPage />} />
        <Route path="nfts/*" element={<AssetsPage />} />
        <Route path="apps/*" element={<AppsPage />} />
        <Route path="transactions/:status?" element={<TransactionBlocksPage />} />
        <Route path="send" element={<TransferCoinPage />} />
        <Route path="send/select" element={<CoinsSelectorPage />} />
        <Route path="receipt" element={<ReceiptPage />} />
        <Route path="receipt-inscription" element={<InscriptionReceiptPage />} />
        <Route path="onramp" element={<OnrampPage />} />
        <Route path="*" element={<Navigate to="/tokens" replace={true} />} />
      </Route>

      <Route path="/dapp/*" element={<HomePage disableNavigation />}>
        <Route path="connect/:requestID" element={<SiteConnectPage />} />
        <Route path="approve/:requestID" element={<ApprovalRequestPage />} />
        <Route path="approveInscription/:requestID" element={<ApprovalInscriptionRequestPage />} />
      </Route>

      <Route path="welcome" element={<WelcomePage />} />
      <Route path="/initialize" element={<InitializePage />}>
        <Route path="select" element={<SelectPage />} />
        <Route path="create" element={<CreatePage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="backup" element={<BackupPage />} />
        <Route path="backup-imported" element={<BackupPage mode="imported" />} />
      </Route>
      <Route path="locked" element={<LockedPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="restricted" element={<RestrictedPage />} />

    </Routes>
  );
};

export default App;
