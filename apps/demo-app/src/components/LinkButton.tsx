import { buttonStyle, innerButtonStyle } from "@/utils/styling";
import clsx from "clsx";
import Link from "next/link";

export function LinkButton({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(buttonStyle, "", {
        "px-2! min-w-auto! w-auto!": icon,
      })}
    >
      <div className={clsx(innerButtonStyle, "")}>{children}</div>
    </Link>
  );
}
