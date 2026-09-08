import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * The standard shadcn class helper: clsx for conditional/array class input,
 * tailwind-merge to resolve conflicting Tailwind utilities so the last one
 * wins (e.g. cn("px-2", "px-4") yields "px-4"). Vendored shadcn components
 * such as components/ui/text-rotate.tsx import this as `cn`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
