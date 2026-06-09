const formatDate = (date?: string | null) => {
  if (!date) return "N/A";
  return new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
};

/**
 * Generates a unique ID.
 * Falls back to a custom implementation if crypto.randomUUID() is unavailable.
 */
const generateId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts or older browsers
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export { formatDate, generateId };