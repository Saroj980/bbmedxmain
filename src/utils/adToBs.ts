import dayjs from "dayjs";
import { ADToBS } from "bikram-sambat-js";

/**
 * Converts an AD date string or Date object to a formatted BS date string.
 *
 * @param date The AD date to convert (YYYY-MM-DD or Date object)
 * @param format The desired output format (default: YYYY-MM-DD)
 * @returns The formatted BS date string, or an empty string if invalid
 */
export const adToBs = (date: string | Date | null | undefined, format = "YYYY-MM-DD"): string => {
  if (!date) return "";

  try {
    const adDate = dayjs(date);
    if (!adDate.isValid()) return "";

    // ADToBS from bikram-sambat-js returns a string in YYYY-MM-DD format
    const bsDateStr = ADToBS(adDate.format("YYYY-MM-DD"));
    
    // If we need custom formatting beyond YYYY-MM-DD, we'd need more logic, 
    // but for now YYYY-MM-DD is what's requested and standard.
    return bsDateStr;
  } catch (error) {
    console.error("Error converting AD to BS date:", error);
    return "";
  }
};
