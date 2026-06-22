
import type { ProductUnit } from "@/types/product";

export function formatUnitChain(units: ProductUnit[]): string {
  if (!units || units.length === 0) return "-";

  // sort by level (1 = top)
  const sorted = [...units].sort((a, b) => a.level - b.level);

  const parts: string[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    parts.push(
      `1 ${current.unit} = ${next.conversion_factor} ${next.unit}`
    );
  }

  return parts.join(", ");
}
