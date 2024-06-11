import { type CoinBalance } from "_src/xdag/typescript/types";
import { CoinAPI } from "_src/xdag/typescript/framework";

export function filterAndSortTokenBalances(tokens: CoinBalance[]) {
  return tokens
    .filter((token) => Number(token.totalBalance) > 0)
    .sort((a, b) =>
      (CoinAPI.getCoinSymbol(a.coinType) + Number(a.totalBalance)).localeCompare(
        CoinAPI.getCoinSymbol(b.coinType) + Number(b.totalBalance),
      ),
    );
}
