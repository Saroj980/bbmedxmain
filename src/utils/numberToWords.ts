/**
 * Converts a number to its word representation in the South Asian numbering system (Lakh/Crore).
 * Commonly used for currency in Nepal and India.
 */
export function numberToWords(num: number): string {
  if (num === 0) return "Zero Only";

  const single = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const double = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const formatData = [
    { label: "Crore", value: 10000000 },
    { label: "Lakh", value: 100000 },
    { label: "Thousand", value: 1000 },
    { label: "Hundred", value: 100 },
  ];

  function getWords(n: number): string {
    let word = "";
    if (n < 10) {
      word = single[n];
    } else if (n < 20) {
      word = double[n - 10];
    } else if (n < 100) {
      word = tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + single[n % 10] : "");
    } else {
      // Small helper for values >= 100 inside larger units if needed, 
      // but the main loop handles units > 100.
      word = single[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + getWords(n % 100) : "");
    }
    return word;
  }

  let res = "";
  let remaining = Math.floor(Math.abs(num));

  for (const { label, value } of formatData) {
    const quotient = Math.floor(remaining / value);
    if (quotient > 0) {
      // In South Asian systems, we can have "one hundred crore" etc, 
      // but usually the main units are handled by the loop.
      res += (res ? " " : "") + getWords(quotient) + " " + label;
      remaining %= value;
    }
  }

  if (remaining > 0) {
    res += (res ? " " : "") + getWords(remaining);
  }

  // Handle decimals (Paisa)
  const decimal = Math.round((Math.abs(num) - Math.floor(Math.abs(num))) * 100);
  if (decimal > 0) {
    res += " and " + getWords(decimal) + " Paisa";
  }

  return (num < 0 ? "Minus " : "") + res.trim() + " Only";
}
