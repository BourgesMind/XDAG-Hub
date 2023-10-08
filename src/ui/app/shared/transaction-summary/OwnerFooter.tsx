import { SummaryCardFooter } from "./Card";
import { Text } from "../text";
import ExplorerLink from "_src/ui/app/components/explorer-link";
import { ExplorerLinkType } from "_src/ui/app/components/explorer-link/ExplorerLinkType";
import { useActiveAddress } from "_src/ui/app/hooks";
import {  isValidXDagAddress, type XDagAddress } from "_src/xdag/typescript/types";
import {formatAddress } from "_src/xdag/typescript/utils";

export function OwnerFooter({
  owner,
  ownerType,
}: {
  owner?: XDagAddress | string;
  ownerType?: string;
}) {
  const address = useActiveAddress();
  const isOwner = address === owner;

  if (!owner) return null;
  const display =
    ownerType === "Shared"
      ? "Shared"
      : isValidXDagAddress(owner)
      ? isOwner
        ? "You"
        : formatAddress(owner)
      : owner;

  return (
    <SummaryCardFooter>
      <Text variant="pBody" weight="medium" color="steel-dark">
        Owner
      </Text>
      <div className="flex justify-end">
        {isOwner ? (
          <Text variant="body" weight="medium" color="hero-dark">
            {display}
          </Text>
        ) : (
          <ExplorerLink
            type={ExplorerLinkType.address}
            title={owner}
            address={owner}
            className="text-hero-dark text-body font-medium no-underline font-mono"
          >
            {display}
          </ExplorerLink>
        )}
      </div>
    </SummaryCardFooter>
  );
}
