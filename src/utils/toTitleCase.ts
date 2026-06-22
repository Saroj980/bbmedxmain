export const toTitleCase = (val?: string | null) => {
  if (!val) return "-";

  return val
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
