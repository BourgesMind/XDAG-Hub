import { Link } from "react-router-dom";
import { ChevronRight16 } from "_assets/icons/tsIcons";
import type { MouseEventHandler, ReactNode } from "react";

export type ItemProps = {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  iconAfter?: ReactNode;
  to?: string;
  href?: string;
  onClick?: MouseEventHandler<Element>;
};

function MenuListItem({
  icon,
  title,
  subtitle,
  iconAfter,
  to = "",
  href = "",
  onClick,
}: ItemProps) {
  const Component = to ? Link : "div";

  const MenuItemContent = (
    <>
      <div className="flex flex-nowrap flex-1 gap-2 items-center overflow-hidden basis-3/5">
        <div className="flex text-steel text-2xl flex-none">{icon}</div>
        <div className="flex-1 text-gray-90 text-body font-semibold truncate">
          {title}
        </div>
      </div>
      <div className="flex flex-nowrap flex-1 justify-end gap-1 items-center overflow-hidden basis-2/5">
        {subtitle ? (
          <div className="transition truncate text-steel-dark text-bodySmall font-medium group-hover:text-steel-darker">
            {subtitle}
          </div>
        ) : null}
        <div className="transition flex text-steel flex-none text-base group-hover:text-steel-darker">
          {iconAfter || (to && <ChevronRight16 />) || null}
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="flex flex-nowrap items-center px-1 py-4.5 first:pt-3 first:pb-3 last:pb-3 gap-5 no-underline overflow-hidden group cursor-pointer"
      >
        {MenuItemContent}
      </a>
    );
  }
  return (
    <Component
      data-testid={title}
      className="flex flex-nowrap items-center px-1 py-5 first:pt-3 first:pb-3 last:pb-3 gap-5 no-underline overflow-hidden group cursor-pointer"
      to={to}
      onClick={onClick}
    >
      {MenuItemContent}
    </Component>
  );
}

export default MenuListItem;
