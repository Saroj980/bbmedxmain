import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toTitleCase = (str: string) =>
 str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

export function generateKeyFromLabel(label: string) {
  return label
    .trim()                     // remove starting/ending spaces
    .toLowerCase()              // optional but recommended
    .replace(/\s+/g, "_")       // replace spaces with underscore
    .replace(/[^a-z0-9_]/g, ""); // keep only allowed characters
}
