import { buttonStyle } from "@/utils/styling";
import clsx from "clsx";
import { Frown, Shrimp, Shrub } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center mt-40 w-80 min-h-40 mx-auto">
      <div
        className={clsx(
          buttonStyle,
          "w-auto! h-auto! rounded-full! p-0! cursor-default!"
        )}
      >
        <Frown className="h-60 w-60" />
      </div>
      <h2 className="text-2xl font-bold mt-4">404 Not Found</h2>
    </div>
  );
}
