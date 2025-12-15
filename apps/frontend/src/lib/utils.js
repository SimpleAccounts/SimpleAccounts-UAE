import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for conflict resolution
 * 
 * @param {...any} inputs - Class names or conditional class objects
 * @returns {string} Merged class string
 * 
 * @example
 * cn("px-2 py-1", "px-4") // Returns "py-1 px-4" (px-4 overrides px-2)
 * cn("bg-red-500", isActive && "bg-blue-500") // Conditional classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
