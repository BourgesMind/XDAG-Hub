
/** Xdag Devnet */
// export const XDAG_DEVNET_CHAIN = "xdag:devnet";

/** Xdag Testnet */
export const XDAG_TESTNET_CHAIN = "xdag:testnet";

/** Xdag Localnet */
export const XDAG_LOCALNET_CHAIN = "xdag:localnet";

/** Xdag Mainnet */
export const XDAG_MAINNET_CHAIN = "xdag:mainnet";

/** Xdag Mainnet */
export const XDAG_CUSTOMRPC_CHAIN = "xdag:customrpc";

export const XDAG_CHAINS = [
  // XDAG_DEVNET_CHAIN,
  XDAG_TESTNET_CHAIN,
  XDAG_LOCALNET_CHAIN,
  XDAG_MAINNET_CHAIN,
  XDAG_CUSTOMRPC_CHAIN
] as const;
