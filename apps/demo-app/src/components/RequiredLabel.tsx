import { FormLabel } from "./ui/form";

export function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <FormLabel className="flex flex-row items-center gap-2">
      <span>{children}</span>
      <span className="text-red-500">*</span>
    </FormLabel>
  );
}
