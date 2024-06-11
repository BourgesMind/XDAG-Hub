import { useLocation } from "react-router-dom";
import { useActiveAccount } from "./useActiveAccount";
import useAppSelector from "./useAppSelector";
import { AppType } from "../redux/slices/app/AppType";

export function useInitialPageView() {
  const activeAccount = useActiveAccount();
  const location = useLocation();
  const { apiEnv, fullNode, activeOrigin, appType } = useAppSelector(
    (state) => state.app,
  );
  const activeNetwork = fullNode && apiEnv === "customRPC" ? fullNode : apiEnv.toUpperCase();
  const isFullScreen = appType === AppType.fullscreen;
}
