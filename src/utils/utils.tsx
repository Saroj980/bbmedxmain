const formatDate = (date?: string | null) => {
  if (!date) return "N/A";
  return new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
};

export { formatDate };